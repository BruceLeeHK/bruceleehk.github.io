/**
 * Cloudflare Worker — 滅蟲師傅留言系統後端
 * 
 * ⚠️ 此 Worker 為備用方案（方案 A）。目前主要使用 Web3Forms（方案 B）。
 *    Web3Forms 免費、內建 Turnstile 驗證、支援圖片上傳，無需部署 Worker。
 *    如需改用此 Worker，請更新 vote/index.html 嘅提交邏輯。
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

export default {
  async fetch(request, env) {
    /* ===== CORS ===== */
    const corsHeaders = {
      'Access-Control-Allow-Origin':  'https://bruceleehk.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age':       '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return json({ success: false, error: 'Method not allowed' }, 405, corsHeaders);
    }

    try {
      const formData = await request.formData();

      /* 1. 提取 Turnstile Token */
      const token   = formData.get('cf-turnstile-response');
      const clientIp = request.headers.get('CF-Connecting-IP') || '';

      if (!token) {
        return json({ success: false, error: '缺少安全驗證 Token，請重新提交' }, 400, corsHeaders);
      }

      /* 2. siteverify 覆核 */
      const secret = env.TURNSTILE_SECRET_KEY;
      if (!secret) {
        console.error('TURNSTILE_SECRET_KEY 未設定');
        return json({ success: false, error: '伺服器設定錯誤' }, 500, corsHeaders);
      }

      const verify = await siteverify(token, secret, clientIp);

      if (!verify.success) {
        console.warn('Turnstile 驗證失敗:', JSON.stringify(verify));
        return json({
          success: false,
          error: '安全驗證失敗，請刷新頁面後重新提交',
          code: 'TURNSTILE_FAILED'
        }, 403, corsHeaders);
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
      fwdData.append('_source',              'vote-page');
      fwdData.append('_client_ip',           clientIp);
      fwdData.append('_turnstile_verified',  'true');

      const res = await fetch(`https://formspree.io/f/${formId}`, {
        method:  'POST',
        body:    fwdData,
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        console.error('Formspree 失敗:', res.status, await res.text());
        return json({ success: false, error: '留言提交失敗，請稍後再試' }, 502, corsHeaders);
      }

      /* 4. 成功 */
      return json({
        success: true,
        message: '留言已提交！首次留言需審核，通過後即可公開顯示。'
      }, 200, corsHeaders);

    } catch (err) {
      console.error('Worker 錯誤:', err.message, err.stack);
      return json({ success: false, error: '伺服器內部錯誤，請稍後再試' }, 500, corsHeaders);
    }
  }
};

/**
 * Cloudflare Turnstile siteverify
 * @param {string} token   - 前端傳嚟嘅 Turnstile Token
 * @param {string} secret  - Turnstile Secret Key
 * @param {string} ip      - 客戶端 IP（可選，提升驗證準確度）
 */
async function siteverify(token, secret, ip) {
  const params = new URLSearchParams();
  params.append('secret',   secret);
  params.append('response', token);
  if (ip) params.append('remoteip', ip);

  const res  = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method:  'POST',
    body:    params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return await res.json();
}

/** JSON Response 工具 */
function json(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
