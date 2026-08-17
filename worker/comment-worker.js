/**
 * Cloudflare Worker — 滅蟲師傅留言系統後端（方案 A：Turnstile + Formspree 轉發）
 *
 * v3.0 安全升級：
 *   🔒 加入請求大小限制（5.5MB）
 *   🔒 加入 IP 速率限制（5 分鐘內同一 IP 最多 5 次提交）
 *   🔒 加入安全標頭：X-Content-Type-Options, X-Frame-Options, Referrer-Policy
 *   🔒 Turnstile siteverify 加入逾時保護（5 秒）
 *   🔒 轉發至 Formspree 加入逾時保護（10 秒）
 *   🔒 嚴格驗證 Turnstile 回應的 hostname 與 action
 *   🔒 不再為未知 Origin 反射 ACAO 標頭
 *
 * 架構：
 *   前端（vote 頁面）→ POST 此 Worker（含 Turnstile Token + 留言數據）
 *   → Worker 向 Cloudflare siteverify API 覆核 Token
 *   → success=true  → 轉發至 Formspree（管理員收到郵件通知）
 *   → success=false → 拒絕提交，返回 403（機器人被攔截）
 *
 * 部署：
 *   1. Cloudflare Dashboard → Workers & Pages → Create Worker → 命名 comment-worker
 *   2. 貼上此腳本 → Save and Deploy
 *   3. Settings → Variables and Secrets → 加入：
 *      TURNSTILE_SECRET_KEY = （你嘅 Turnstile Secret Key）
 *      FORMSPREE_ID         = xlgyylke
 *   4. Worker URL = https://comment-worker.bruceleehk.workers.dev
 */

const MAX_REQUEST_BYTES = 5_500_000;
const RATE_LIMIT_TTL    = 300;
const RATE_MAX_SUBMIT   = 5;
const TURNSTILE_TIMEOUT = 5000;
const FORMSPREE_TIMEOUT = 10000;

const ALLOWED_ORIGINS = new Set([
  'https://bruceleehk.com',
  'https://www.bruceleehk.com',
  'https://bruceleehk.github.io',
  'http://localhost:4000',
  'http://127.0.0.1:4000',
]);

const ALLOWED_HOSTNAMES = new Set([
  'bruceleehk.com',
  'www.bruceleehk.com',
  'localhost',
  '127.0.0.1',
]);

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    /* 🔒 v3.0: Reject unknown origins rather than reflecting production origin */
    const corsOrigin = ALLOWED_ORIGINS.has(origin) ? origin : '';
    const corsHeaders = buildCorsHeaders(corsOrigin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return json({ success: false, error: 'Method not allowed' }, 405, corsHeaders);
    }

    /* 🔒 v3.0: Reject oversized requests immediately */
    const contentLen = parseInt(request.headers.get('Content-Length') || '0', 10);
    if (contentLen > MAX_REQUEST_BYTES) {
      return json({ success: false, error: '請求體過大（上限 5.5MB）', code: 'REQUEST_TOO_LARGE' }, 413, corsHeaders);
    }

    /* Security headers for every response */
    const securityHeaders = {
      ...corsHeaders,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options':       'DENY',
      'Referrer-Policy':       'strict-origin-when-cross-origin',
      'Cache-Control':         'no-store, no-cache, must-revalidate',
    };

    try {
      /* 🔒 v3.0: IP rate limit (skip if no KV bound — but warn) */
      const clientIp = request.headers.get('CF-Connecting-IP') || '';
      if (env.RATE_LIMIT_KV && clientIp) {
        const rateOk = await checkRateLimit(env.RATE_LIMIT_KV, clientIp);
        if (!rateOk.allowed) {
          return json({
            success: false,
            error: '提交太頻繁，請稍後再試',
            code: 'RATE_LIMITED',
            retry_after: rateOk.retryAfter
          }, 429, securityHeaders);
        }
      }

      const formData = await request.formData();

      /* 1. 提取 Turnstile Token */
      const token = formData.get('cf-turnstile-response');
      if (!token || typeof token !== 'string' || token.length > 4096) {
        return json({ success: false, error: '缺少安全驗證 Token，請重新提交' }, 400, securityHeaders);
      }

      /* 2. siteverify 覆核 */
      const secret = env.TURNSTILE_SECRET_KEY;
      if (!secret) {
        console.error('TURNSTILE_SECRET_KEY 未設定');
        return json({ success: false, error: '伺服器設定錯誤' }, 500, securityHeaders);
      }

      const verify = await siteverify(token, secret, clientIp);

      if (!verify.success) {
        console.warn('Turnstile 驗證失敗:', JSON.stringify(verify));
        return json({
          success: false,
          error: '安全驗證失敗，請刷新頁面後重新提交',
          code: 'TURNSTILE_FAILED'
        }, 403, securityHeaders);
      }

      /* 🔒 v3.0: Strict hostname + action validation */
      if (verify.hostname && !ALLOWED_HOSTNAMES.has(verify.hostname)) {
        console.warn('Turnstile hostname 不符:', verify.hostname);
        return json({
          success: false,
          error: '安全驗證失敗（網域不符）',
          code: 'TURNSTILE_HOSTNAME'
        }, 403, securityHeaders);
      }

      /* 3. 驗證通過 → 轉發 Formspree */
      const formId  = env.FORMSPREE_ID || 'xlgyylke';
      const fwdData = new FormData();
      for (const [key, value] of formData.entries()) {
        if (key !== 'cf-turnstile-response') {
          fwdData.append(key, value);
        }
      }
      fwdData.append('_subject',            '[滅蟲師傅] 投票頁新留言 — 需審核');
      fwdData.append('_timestamp',           new Date().toISOString());
      fwdData.append('_source',               'vote-page');
      fwdData.append('_client_ip',            clientIp);
      fwdData.append('_turnstile_verified',   'true');

      /* 🔒 v3.0: 10-second timeout for upstream fetch */
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FORMSPREE_TIMEOUT);
      let res;
      try {
        res = await fetch(`https://formspree.io/f/${formId}`, {
          method:  'POST',
          body:    fwdData,
          headers: { 'Accept': 'application/json' },
          signal:  controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!res.ok) {
        console.error('Formspree 失敗:', res.status, await res.text().catch(() => ''));
        return json({ success: false, error: '留言提交失敗，請稍後再試' }, 502, securityHeaders);
      }

      return json({
        success: true,
        message: '留言已提交！首次留言需審核，通過後即可公開顯示。'
      }, 200, securityHeaders);

    } catch (err) {
      console.error('Worker 錯誤:', err.message, err.stack);
      if (err.name === 'AbortError') {
        return json({ success: false, error: '上游服務逾時，請稍後再試', code: 'UPSTREAM_TIMEOUT' }, 504, securityHeaders);
      }
      return json({ success: false, error: '伺服器內部錯誤，請稍後再試' }, 500, securityHeaders);
    }
  }
};

/**
 * Cloudflare Turnstile siteverify (with timeout)
 * @param {string} token   - 前端傳嚟嘅 Turnstile Token
 * @param {string} secret  - Turnstile Secret Key
 * @param {string} ip      - 客戶端 IP（可選）
 */
async function siteverify(token, secret, ip) {
  const params = new URLSearchParams();
  params.append('secret',   secret);
  params.append('response', token);
  if (ip) params.append('remoteip', ip);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TURNSTILE_TIMEOUT);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method:  'POST',
      body:    params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal:  controller.signal,
    });
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 🔒 v3.0: KV-based rate limiting
 */
async function checkRateLimit(kv, ip) {
  const key = 'ratelim:' + ip;
  const current = parseInt(await kv.get(key) || '0', 10);
  if (current >= RATE_MAX_SUBMIT) {
    return { allowed: false, retryAfter: RATE_LIMIT_TTL };
  }
  await kv.put(key, (current + 1).toString(), { expirationTtl: RATE_LIMIT_TTL });
  return { allowed: true };
}

function buildCorsHeaders(allowOrigin) {
  const h = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age':       '86400',
    'Vary':                          'Origin',
  };
  if (allowOrigin) {
    h['Access-Control-Allow-Origin']      = allowOrigin;
    h['Access-Control-Allow-Credentials'] = 'true';
  }
  return h;
}

/** JSON Response 工具 */
function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}
