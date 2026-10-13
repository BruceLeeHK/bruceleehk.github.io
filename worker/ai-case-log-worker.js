/**
 * Cloudflare Worker — AI 診斷數據留存端點（v9.47 方案二）
 * 《網站圖片 SEO 自動化重命名與 AI 診斷數據留存技術規格說明書》2.2–2.4 落地
 *
 * 端點：
 *   POST /api/v1/telemetry/ai-case-log   → Dify HTTP 節點推送（Bearer 驗證）
 *   GET  /api/v1/telemetry/health        → 健康檢查（唔需要密鑰）
 *   POST /api/v1/telemetry/admin/list    → 後台列出最近 N 筆紀錄（ADMIN 密鑰）
 *   POST /api/v1/telemetry/admin/get     → 後台讀取單筆紀錄（含備份圖片，ADMIN 密鑰）
 *
 * 私隱合規（香港《個人資料（私隱）條例》PDPO, Cap. 486）：
 *   1. IP 只以 SHA-256(IP + SALT) 單向雜湊儲存（env.IP_HASH_SALT 建議設定，
 *      冇 salt 嘅裸 SHA-256 對細值域 IP 空間可以被反推）——僅作防刷同地域統計
 *   2. 嚴禁收集用戶真實姓名／電話／WhatsApp 號碼：payload 嘅 name/phone/email
 *      等欄位一律拒收；user_description 內偵測到香港電話號碼／電郵格式會自動遮蔽
 *   3. 數據保留期：預設 730 日（env.AI_LOG_TTL_DAYS 可調），KV TTL 自動過期刪除
 *   4. 圖片備份為可選（env.BACKUP_IMAGES 設 "true" 先啟用），預設只存 URL
 *
 * 部署（詳見 worker/AI-CASE-LOG-DEPLOY.md）：
 *   1. npx wrangler kv namespace create AI_CASE_KV → 將 id 填入 wrangler-ai-case-log.toml
 *   2. npx wrangler secret put AI_CASE_LOG_SECRET  → 自訂強密鑰（Dify Bearer 用）
 *   3. npx wrangler secret put IP_HASH_SALT        → 隨機字串（IP 雜湊鹽）
 *   4. npx wrangler deploy -c wrangler-ai-case-log.toml
 */

const MAX_BODY_BYTES = 2 * 1024 * 1024;          // 2MB
const MAX_RATE_PER_HOUR = 120;                    // 每 IP 每小時上限（Dify 伺服器級流量）
const TEXT_LIMITS = { session_id: 64, district: 50, user_desc: 4000, gpt_analysis: 8000, ai_response: 8000 };
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;          // 備份圖片上限 5MB

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://bruceleehk.com',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    try {
      /* ===== 路由 ===== */
      if (url.pathname === '/api/v1/telemetry/health' && request.method === 'GET') {
        return json({
          success: true,
          service: 'ai-case-log-worker',
          version: 'v9.47',
          secret_set: !!env.AI_CASE_LOG_SECRET,
          kv_bound: !!env.AI_CASE_KV,
          time: new Date().toISOString(),
        }, 200);
      }

      if (url.pathname === '/api/v1/telemetry/ai-case-log' && request.method === 'POST') {
        return await handleCaseLog(request, env);
      }

      if (url.pathname === '/api/v1/telemetry/admin/list' && request.method === 'POST') {
        return await handleAdminList(request, env);
      }

      if (url.pathname === '/api/v1/telemetry/admin/get' && request.method === 'POST') {
        return await handleAdminGet(request, env);
      }

      return json({ success: false, error: 'Not found' }, 404);
    } catch (err) {
      console.error('Worker error:', err.message);
      return json({ success: false, error: 'Internal error' }, 500);
    }
  },
};

/* =========================================================================
 * POST /api/v1/telemetry/ai-case-log
 * Payload（規格書 2.4）：
 * {
 *   "session_id":   "{{sys.conversation_id}}",
 *   "user_desc":    "{{sys.user_inputs.user_desc}}",
 *   "image_urls":   "{{sys.files}}",          ← 字串或字串陣列皆收
 *   "gpt_analysis": "{{#LLM.text#}}",
 *   "ai_response":  "{{#LLM_2.text#}}",
 *   "timestamp":    "{{sys.timestamp}}",
 *   "district":     "(可選) 用戶選擇或分析出之地區"
 * }
 * ========================================================================= */
async function handleCaseLog(request, env) {
  if (!env.AI_CASE_LOG_SECRET) {
    return json({ success: false, error: 'AI_CASE_LOG_SECRET not set' }, 500);
  }
  if (!env.AI_CASE_KV) {
    return json({ success: false, error: 'AI_CASE_KV binding missing' }, 500);
  }

  /* 1. Bearer 驗證（時序安全比較） */
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token || !safeCompare(token, String(env.AI_CASE_LOG_SECRET).trim())) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  /* 2. 大小限制 */
  const len = parseInt(request.headers.get('Content-Length') || '0', 10);
  if (len > MAX_BODY_BYTES) {
    return json({ success: false, error: 'Payload too large' }, 413);
  }

  /* 3. 頻率限制（KV 計數器，每小時窗口） */
  const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rl = await checkRateLimit(env.AI_CASE_KV, clientIp);
  if (!rl.allowed) {
    return json({ success: false, error: 'Rate limit exceeded', retry_after: rl.retryAfter }, 429);
  }

  /* 4. 解析 JSON */
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON' }, 400);
  }

  /* 5. PDPO：拒收任何直接識別身份欄位（姓名／電話／電郵等）— 永不入庫 */
  for (const banned of ['name', 'full_name', 'phone', 'tel', 'whatsapp', 'email', 'address', 'user_ip', 'ip']) {
    delete body[banned];
  }

  /* 6. 欄位抽取＋長度規限 */
  const sessionId = clean(String(body.session_id || ''), TEXT_LIMITS.session_id);
  const userDesc  = maskPii(clean(String(body.user_desc || ''), TEXT_LIMITS.user_desc));
  const district  = clean(String(body.district || ''), TEXT_LIMITS.district);
  const gptOut    = clean(String(body.gpt_analysis || ''), TEXT_LIMITS.gpt_analysis);
  const aiResp    = clean(String(body.ai_response || ''), TEXT_LIMITS.ai_response);

  let imageUrls = body.image_urls || body.image_url || [];
  if (typeof imageUrls === 'string') imageUrls = [imageUrls];
  if (!Array.isArray(imageUrls)) imageUrls = [];
  imageUrls = imageUrls
    .map((u) => String(u || '').trim())
    .filter((u) => /^https:\/\/[\w.-]+/.test(u) || /^data:image\//.test(u))
    .slice(0, 5);

  /* 7. PDPO：IP SHA-256(+salt) 單向雜湊 — 原始 IP 永不入庫 */
  const ipHash = await sha256Hex(clientIp + '|' + String(env.IP_HASH_SALT || ''));

  /* 8. 建立紀錄（規格書 2.3 ai_diagnosis_logs 結構） */
  const now = new Date();
  const id = 'log_' + now.getTime().toString(36) + Math.random().toString(36).slice(2, 8);
  const createdAt = isNaN(Date.parse(body.timestamp)) ? now.toISOString() : new Date(body.timestamp).toISOString();

  const record = {
    id,
    session_id: sessionId,
    user_ip_hash: ipHash,
    district,
    user_description: userDesc,
    original_image_url: imageUrls[0] || '',
    image_urls: imageUrls,
    stored_image_path: '',
    gpt_vision_output: gptOut,
    final_response: aiResp,
    created_at: createdAt,
    retention_days: parseInt(env.AI_LOG_TTL_DAYS || '730', 10) || 730,
  };

  /* 9. 圖片備份（可選；預設關閉—Dify 檔案 URL 帶有時效簽名，取不到就只存 URL） */
  if (String(env.BACKUP_IMAGES || '') === 'true' && imageUrls.length > 0 && /^https:\/\//.test(imageUrls[0])) {
    try {
      const imgRes = await fetch(imageUrls[0], { signal: AbortSignal.timeout(8000) });
      if (imgRes.ok) {
        const buf = await imgRes.arrayBuffer();
        if (buf.byteLength <= MAX_IMAGE_BYTES) {
          const imgKey = 'aicase:img:' + id;
          const b64 = arrayBufferToBase64(buf);
          await env.AI_CASE_KV.put(imgKey, b64, { expirationTtl: record.retention_days * 86400 });
          record.stored_image_path = imgKey;
        } else {
          record.image_backup_note = 'image too large, url kept';
        }
      } else {
        record.image_backup_note = 'fetch failed http ' + imgRes.status;
      }
    } catch (e) {
      record.image_backup_note = 'fetch error: ' + e.message;
    }
  }

  /* 10. 寫入 KV（TTL = 保留期，自動過期刪除） */
  const ttlDays = record.retention_days;
  await env.AI_CASE_KV.put('ailog:' + createdAt + ':' + id, JSON.stringify(record), {
    expirationTtl: ttlDays * 86400,
  });

  /* 11. 記錄頻率計數 */
  await recordRateLimit(env.AI_CASE_KV, rl.key);

  return json({ success: true, id, stored: true }, 200);
}

/* =========================================================================
 * 後台：列出最近紀錄（KV list 為字典序，ailog: 前綴按時間倒序取前 N）
 * ========================================================================= */
async function handleAdminList(request, env) {
  const g = await guardAdmin(request, env);
  if (g) return g;
  let body = {};
  try { body = await request.json(); } catch {}
  const limit = Math.min(Math.max(parseInt(body.limit || '20', 10) || 20, 1), 100);

  const list = [];
  let cursor;
  do {
    const page = await env.AI_CASE_KV.list({ prefix: 'ailog:', cursor, limit: 50 });
    for (const k of page.keys) list.push(k.name);
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor && list.length < 500);

  list.sort().reverse();
  const ids = list.slice(0, limit).map((k) => k.replace('ailog:', ''));
  return json({ success: true, total_listed: ids.length, logs: ids }, 200);
}

/* =========================================================================
 * 後台：讀取單筆（可帶 include_image=true 連備份圖片一齊返）
 * ========================================================================= */
async function handleAdminGet(request, env) {
  const g = await guardAdmin(request, env);
  if (g) return g;
  let body = {};
  try { body = await request.json(); } catch {}
  const fullKey = String(body.key || '');
  if (!/^(ailog|aicase:img):/.test(fullKey)) {
    return json({ success: false, error: 'Invalid key' }, 400);
  }
  const value = await env.AI_CASE_KV.get(fullKey);
  if (value === null) return json({ success: false, error: 'Not found' }, 404);
  if (fullKey.startsWith('aicase:img:')) {
    return json({ success: true, key: fullKey, image_base64: value }, 200);
  }
  let record;
  try { record = JSON.parse(value); } catch { record = value; }
  return json({ success: true, log: record }, 200);
}

/* ===== 工具函數 ===== */

async function guardAdmin(request, env) {
  if (!env.ADMIN_SECRET) return json({ success: false, error: 'ADMIN_SECRET not set' }, 500);
  let body = {};
  try { body = await request.json(); } catch {}
  const provided = String(body.admin_secret || '').trim();
  if (!provided || !safeCompare(provided, String(env.ADMIN_SECRET).trim())) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }
  return null;
}

function clean(s, max) {
  return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

/**
 * PDPO 數據最小化：遮蔽香港電話（8 位數字，可帶空格/連字號）同電郵地址
 * 用戶喺描述入面自願留低嘅聯絡方式唔會被完整保存
 */
function maskPii(s) {
  let out = s.replace(/\b[\w.+-]+@[\w-]+\.[\w.]{2,}\b/g, '[email masked]');
  out = out.replace(/(^|\D)([2-9]\d{3}[\s-]?\d{4})(?=\D|$)/g, '$1[phone masked]');
  return out;
}

async function sha256Hex(s) {
  const data = new TextEncoder().encode(s);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function safeCompare(a, b) {
  const ab = new TextEncoder().encode(String(a));
  const bb = new TextEncoder().encode(String(b));
  const len = Math.max(ab.length, bb.length);
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < len; i++) {
    diff |= (ab[i] || 0) ^ (bb[i] || 0);
  }
  return diff === 0;
}

async function checkRateLimit(kv, ip) {
  const hourKey = 'rl:' + new Date().toISOString().slice(0, 13) + ':' + await sha256Hex(ip);
  const val = await kv.get(hourKey);
  const count = parseInt(val || '0', 10);
  if (count >= MAX_RATE_PER_HOUR) {
    return { allowed: false, key: hourKey, retryAfter: 3600 };
  }
  return { allowed: true, key: hourKey, count };
}

async function recordRateLimit(kv, key) {
  try {
    const val = parseInt((await kv.get(key)) || '0', 10) + 1;
    await kv.put(key, String(val), { expirationTtl: 3600 });
  } catch (e) {
    console.warn('rate limit record failed:', e.message);
  }
}

function arrayBufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function json(data, status, extraHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS, ...(extraHeaders || {}) },
  });
}
