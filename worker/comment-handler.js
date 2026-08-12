/**
 * Cloudflare Worker — 滅蟲師傅留言系統後端
 *
 * 架構（Spin canonical siteverify）：
 *   前端（vote 頁面）
 *     → POST 此 Worker（含 cf-turnstile-response + 留言數據）
 *     → Worker 向 Cloudflare siteverify API 覆核 Token
 *     → 驗證 success + action + hostname
 *     → 通過 → 轉發至 Web3Forms（管理員收到郵件通知）
 *     → 失敗 → 返回 403（機器人被攔截）
 *
 * 部署步驟：
 *   1. Cloudflare Dashboard → Workers & Pages → Create Worker → 命名 comment-handler
 *   2. 貼上此腳本 → Save and Deploy
 *   3. Settings → Variables and Secrets → 加入：
 *      TURNSTILE_SECRET = （Turnstile Widget 嘅 Secret Key）
 *   4. Worker URL = https://comment-handler.bruceleehk.workers.dev
 *   5. 更新 vote/index.html 中 WORKER_API 為你嘅 Worker URL
 *
 * 環境變量：
 *   TURNSTILE_SECRET      — Turnstile Widget Secret Key（必須，用 wrangler secret put）
 *   WEB3FORMS_ACCESS_KEY  — Web3Forms Access Key（預設已內嵌，可選覆蓋）
 *   TURNSTILE_HOSTNAMES   — 允許嘅前端 hostname（逗號分隔，預設 bruceleehk.com）
 */

export default {
  async fetch(request, env) {
    /* ===== CORS ===== */
    const allowedOrigins = new Set([
      'https://bruceleehk.com',
      'https://www.bruceleehk.com',
      'https://bruceleehk.github.io',
      'http://localhost:4000',   /* Jekyll 本地預覽 */
      'http://127.0.0.1:4000',
    ]);

    const origin = request.headers.get('Origin') || '';
    const corsOrigin = allowedOrigins.has(origin) ? origin : 'https://bruceleehk.com';

    const corsHeaders = {
      'Access-Control-Allow-Origin':      corsOrigin,
      'Access-Control-Allow-Methods':     'POST, OPTIONS',
      'Access-Control-Allow-Headers':     'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age':           '86400',
    };

    /* Preflight */
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ success: false, error: 'Method not allowed' }, 405, corsHeaders);
    }

    try {
      const formData = await request.formData();

      /* ── 1. 提取並校驗 Turnstile Token ── */
      const token    = formData.get('cf-turnstile-response');
      const clientIp = request.headers.get('CF-Connecting-IP') || '';

      if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
        return jsonResponse({
          success: false,
          error: '缺少安全驗證 Token，請刷新頁面後重新提交',
          code: 'MISSING_TOKEN'
        }, 400, corsHeaders);
      }

      /* ── 2. siteverify（Spin canonical pattern） ── */
      const secret = env.TURNSTILE_SECRET;
      if (!secret) {
        console.error('TURNSTILE_SECRET 未設定');
        return jsonResponse({
          success: false,
          error: '伺服器設定錯誤，請聯絡管理員',
          code: 'SERVER_CONFIG'
        }, 500, corsHeaders);
      }

      /* 預期 action（對應前端 data-action="comment"） */
      const expectedAction = 'comment';

      /* 允許嘅前端 hostname */
      const expectedHostnames = new Set(
        (env.TURNSTILE_HOSTNAMES ?? 'bruceleehk.com,www.bruceleehk.com,bruceleehk.github.io')
          .split(',')
          .map(h => h.trim())
          .filter(Boolean)
      );

      let result;
      try {
        const verifyParams = new URLSearchParams({
          secret:   secret,
          response: token,
        });
        if (clientIp) verifyParams.append('remoteip', clientIp);

        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method:  'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body:    verifyParams,
          signal:  AbortSignal.timeout(10_000),
        });

        if (!verifyRes.ok) {
          throw new Error(`siteverify HTTP ${verifyRes.status}`);
        }

        result = await verifyRes.json();
      } catch (err) {
        console.error('siteverify 請求失敗:', err.message);
        return jsonResponse({
          success: false,
          error: '安全驗證服務暫時不可用，請稍後再試',
          code: 'SITEVERIFY_UNAVAILABLE'
        }, 503, corsHeaders);
      }

      /* ── 3. 三重驗證：success + action + hostname ── */
      if (!result.success) {
        console.warn('Turnstile 驗證失敗:', JSON.stringify(result));
        return jsonResponse({
          success: false,
          error: '安全驗證失敗，請刷新頁面後重新提交',
          code: 'TURNSTILE_FAILED'
        }, 403, corsHeaders);
      }

      if (result.action !== expectedAction) {
        console.warn(`action 不匹配: 預期 "${expectedAction}", 收到 "${result.action}"`);
        return jsonResponse({
          success: false,
          error: '安全驗證失敗',
          code: 'ACTION_MISMATCH'
        }, 403, corsHeaders);
      }

      if (!expectedHostnames.has(result.hostname)) {
        console.warn(`hostname 不允許: "${result.hostname}", 允許: [${[...expectedHostnames].join(',')}]`);
        return jsonResponse({
          success: false,
          error: '安全驗證失敗',
          code: 'HOSTNAME_MISMATCH'
        }, 403, corsHeaders);
      }

      /* ── 4. 驗證通過 → 組裝轉發數據 → POST Web3Forms ── */
      const accessKey = env.WEB3FORMS_ACCESS_KEY || '82a6d28c-7335-464f-82d3-ccaf99425def';
      const fwdData   = new FormData();

      /* 複製所有欄位，排除 Turnstile token + honeypot */
      for (const [key, value] of formData.entries()) {
        if (key === 'cf-turnstile-response' || key === 'botcheck') continue;
        fwdData.append(key, value);
      }

      /* 確保 Web3Forms 必要欄位 */
      if (!fwdData.get('access_key'))  fwdData.append('access_key', accessKey);
      if (!fwdData.get('subject'))     fwdData.append('subject', '[滅蟲師傅] 投票頁新留言 — 需審核');
      if (!fwdData.get('_template'))   fwdData.append('_template', 'table');
      if (!fwdData.get('_captcha'))    fwdData.append('_captcha', 'false');

      /* 附加驗證元數據（管理員可見） */
      fwdData.append('_turnstile_verified', 'true');
      fwdData.append('_turnstile_action',   result.action);
      fwdData.append('_turnstile_hostname', result.hostname);
      fwdData.append('_client_ip',          clientIp);
      fwdData.append('_timestamp',          new Date().toISOString());

      /* POST → Web3Forms */
      const web3Res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body:   fwdData,
      });

      const web3Result = await web3Res.json();

      if (!web3Result.success) {
        console.error('Web3Forms 失敗:', JSON.stringify(web3Result));
        return jsonResponse({
          success: false,
          error: '留言提交失敗：' + (web3Result.message || '請稍後再試'),
          code: 'WEB3FORMS_ERROR'
        }, 502, corsHeaders);
      }

      /* ── 5. 成功 ── */
      return jsonResponse({
        success: true,
        message: '留言已提交！首次留言需審核，通過後即可公開顯示。'
      }, 200, corsHeaders);

    } catch (err) {
      console.error('Worker 錯誤:', err.message, err.stack);
      return jsonResponse({
        success: false,
        error: '伺服器內部錯誤，請稍後再試',
        code: 'INTERNAL_ERROR'
      }, 500, corsHeaders);
    }
  }
};

/** JSON Response 工具 */
function jsonResponse(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}
