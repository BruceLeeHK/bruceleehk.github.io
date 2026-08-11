/**
 * Cloudflare Worker — 滅蟲師傅留言系統後端
 * 
 * 功能：
 * 1. 接收前端提交嘅留言（含 Turnstile Token）
 * 2. 向 Cloudflare siteverify API 覆核 Token
 * 3. success=true → 轉發至 Formspree（管理員收到郵件通知）
 * 4. success=false → 拒絕提交，返回驗證失敗
 * 
 * 部署方式：
 * - 喺 Cloudflare Dashboard → Workers & Pages → Create Worker
 * - 貼上呢個腳本
 * - 設定環境變數：
 *   TURNSTILE_SECRET_KEY = 你嘅 Turnstile Secret Key
 *   FORMSPREE_ID = xlgyylke
 * - 部署後記下 Worker URL，填入前端 JS 嘅 WORKER_URL
 */

export default {
  async fetch(request, env) {
    // ===== CORS 設定 =====
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://bruceleehk.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    // 處理 CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 只接受 POST
    if (request.method !== 'POST') {
      return jsonResponse({ success: false, error: 'Method not allowed' }, 405, corsHeaders);
    }

    try {
      const formData = await request.formData();

      // ===== 1. 提取 Turnstile Token =====
      const turnstileToken = formData.get('cf-turnstile-response');
      const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Real-IP') || '';

      if (!turnstileToken) {
        return jsonResponse({ success: false, error: '缺少安全驗證 Token，請重新提交' }, 400, corsHeaders);
      }

      // ===== 2. 向 Cloudflare siteverify 覆核 =====
      const secretKey = env.TURNSTILE_SECRET_KEY;
      if (!secretKey) {
        console.error('TURNSTILE_SECRET_KEY 未設定');
        return jsonResponse({ success: false, error: '伺服器設定錯誤' }, 500, corsHeaders);
      }

      const verifyResult = await verifyTurnstile(turnstileToken, secretKey, clientIp);

      if (!verifyResult.success) {
        console.warn('Turnstile 驗證失敗:', JSON.stringify(verifyResult));
        return jsonResponse({
          success: false,
          error: '安全驗證失敗，請刷新頁面後重新提交',
          code: 'TURNSTILE_FAILED'
        }, 403, corsHeaders);
      }

      // ===== 3. 驗證通過 → 轉發至 Formspree =====
      const formspreeId = env.FORMSPREE_ID || 'xlgyylke';
      const formspreeUrl = `https://formspree.io/f/${formspreeId}`;

      // 構建轉發嘅 FormData（移除 Turnstile 欄位）
      const forwardData = new FormData();
      for (const [key, value] of formData.entries()) {
        if (key !== 'cf-turnstile-response') {
          forwardData.append(key, value);
        }
      }

      // 加入審核標記同時間戳
      forwardData.append('_subject', '[滅蟲師傅] 投票頁新留言 — 需審核');
      forwardData.append('_timestamp', new Date().toISOString());
      forwardData.append('_source', 'vote-page');
      forwardData.append('_client_ip', clientIp);
      forwardData.append('_turnstile_verified', 'true');

      const formspreeRes = await fetch(formspreeUrl, {
        method: 'POST',
        body: forwardData,
        headers: { 'Accept': 'application/json' }
      });

      if (!formspreeRes.ok) {
        const errText = await formspreeRes.text();
        console.error('Formspree 轉發失敗:', formspreeRes.status, errText);
        return jsonResponse({
          success: false,
          error: '留言提交失敗，請稍後再試'
        }, 502, corsHeaders);
      }

      // ===== 4. 成功 =====
      return jsonResponse({
        success: true,
        message: '留言已提交！首次留言需審核，通過後即可公開顯示。'
      }, 200, corsHeaders);

    } catch (err) {
      console.error('Worker 錯誤:', err.message, err.stack);
      return jsonResponse({
        success: false,
        error: '伺服器內部錯誤，請稍後再試'
      }, 500, corsHeaders);
    }
  }
};

/**
 * 向 Cloudflare Turnstile siteverify API 驗證 Token
 * @param {string} token - 前端傳嚟嘅 Turnstile Token
 * @param {string} secretKey - Turnstile Secret Key
 * @param {string} ip - 客戶端 IP（可選，提升驗證準確度）
 * @returns {Promise<{success: boolean, 'error-codes'?: string[]}>}
 */
async function verifyTurnstile(token, secretKey, ip) {
  const params = new URLSearchParams();
  params.append('secret', secretKey);
  params.append('response', token);
  if (ip) params.append('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const data = await res.json();
  return data; // { success: boolean, 'error-codes': string[], challenge_ts, hostname, action, cdata }
}

/**
 * JSON Response 工具函式
 */
function jsonResponse(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}
