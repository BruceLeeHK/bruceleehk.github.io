/**
 * Cloudflare Worker — 滅蟲師傅 自建原生留言系統後端（修正版 v3.1）
 *
 * v3.1 登入修復升級：
 *   🔒 修復 CORS 攔截：預檢請求放行 Authorization 等必要標頭，解決 admin.html 無法通訊的問題
 *   🔒 密碼防空白處理：針對 env.ADMIN_SECRET 強制執行 .trim()，防止 Cloudflare 後台填寫時混入隱藏空格
 * 
 * v3.0 安全升級亮點：
 *   🔒 修正 CORS 反射弱點、加入安全標頭
 *   🔒 JSON body 上限 5.5MB、更嚴格的速率限制
 *   🔒 修正巢狀回覆刪除 Bug（遞迴刪除所有後代）
 *   🔒 移除管理員 nickname 覆寫漏洞（強制使用「滅蟲師傅」）
 *   🔒 圖片 URL 驗證與長度限制
 */

const MAX_REQUEST_BYTES = 5_500_000; // 5.5 MB hard cap on request body
const MAX_IMAGE_URL_LEN = 5_500_000; // ~5 MB base64 + small overhead
const PAGE_ID_PATTERN   = /^[A-Za-z0-9_-]{1,64}$/;
const COMMENT_TTL_SEC   = 15_552_000; // 6 months
const RATE_LIMIT_TTL    = 300;        // 5-minute window
const RATE_MAX_COMMENT  = 5;          // 5 main comments per 5 minutes per IP
const RATE_MAX_REPLY    = 10;         // 10 replies per 5 minutes per IP

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    /* ===== CORS ===== */
    const allowedOrigins = new Set([
      'https://bruceleehk.com',
      'https://www.bruceleehk.com',
      'https://bruceleehk.github.io',
      'http://localhost:4000',
      'http://127.0.0.1:4000',
      'http://localhost:8080',
      'http://127.0.0.1:8080',
    ]);

    const origin = request.headers.get('Origin') || '';
    /* 🔒 v3.0 fix: REJECT unknown origins instead of fall-back to production origin */
    const corsOrigin = allowedOrigins.has(origin) ? origin : '';

    const corsHeaders = buildCorsHeaders(corsOrigin);

    /* Preflight */
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    /* 🔒 v3.0: Reject oversized requests immediately */
    const contentLen = parseInt(request.headers.get('Content-Length') || '0', 10);
    if (contentLen > MAX_REQUEST_BYTES) {
      return jsonResponse({
        success: false,
        error: '請求體過大（上限 5.5MB）',
        code: 'REQUEST_TOO_LARGE'
      }, 413, corsHeaders);
    }

    try {
      const kv = env.COMMENT_KV;

      /* ===== Security headers applied to every response ===== */
      const securityHeaders = {
        ...corsHeaders,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options':       'DENY',
        'Referrer-Policy':       'strict-origin-when-cross-origin',
        'Cache-Control':         'no-store, no-cache, must-revalidate',
      };

      /* GET /api/health — 健康檢查 */
      if (url.pathname === '/api/health') {
        const kvOk = !!kv;
        return jsonResponse({
          status: kvOk ? 'ok' : 'degraded',
          kv_bound: kvOk,
          version: '3.1',
          features: ['nested_reply', 'official_badge', 'pin', 'captcha', 'admin_delete', 'recursive_delete', 'rate_limit', 'honeypot', 'trim_secret'],
          time: new Date().toISOString()
        }, 200, securityHeaders);
      }

      if (!kv) {
        return jsonResponse({
          success: false,
          error: 'KV 資料庫未綁定，請先建立 KV Namespace 並更新 wrangler.toml',
          code: 'KV_NOT_BOUND'
        }, 503, securityHeaders);
      }

      /* GET /api/comments — 讀取已審核留言（樹狀結構） */
      if (request.method === 'GET' && url.pathname === '/api/comments') {
        return await handleGetComments(url, kv, securityHeaders);
      }

      /* POST /api/comments — 提交新留言（主留言或回覆） */
      if (request.method === 'POST' && url.pathname === '/api/comments') {
        return await handlePostComment(request, kv, env, securityHeaders);
      }

      /* ===== 管理員 API ===== */
      if (request.method === 'POST' && url.pathname === '/api/admin/list') {
        return await handleAdminList(url, request, kv, env, securityHeaders);
      }
      if (request.method === 'POST' && url.pathname === '/api/admin/approve') {
        return await handleAdminApprove(request, kv, env, securityHeaders);
      }
      if (request.method === 'POST' && url.pathname === '/api/admin/delete') {
        return await handleAdminDelete(request, kv, env, securityHeaders);
      }
      if (request.method === 'POST' && url.pathname === '/api/admin/reply') {
        return await handleAdminReply(request, kv, env, securityHeaders);
      }
      if (request.method === 'POST' && url.pathname === '/api/admin/pin') {
        return await handleAdminPin(request, kv, env, securityHeaders);
      }

      return jsonResponse({ success: false, error: 'Not found' }, 404, securityHeaders);

    } catch (err) {
      console.error('Worker 錯誤:', err.message, err.stack);
      return jsonResponse({
        success: false,
        error: '伺服器內部錯誤',
        code: 'INTERNAL_ERROR',
        ...(env.DEBUG === 'true' ? { debug: err.message } : {})
      }, 500, corsHeaders);
    }
  }
};

/* =========================================================================
 *  GET /api/comments — 讀取已審核留言（樹狀結構）
 * ========================================================================= */
async function handleGetComments(url, kv, headers) {
  const pageId = url.searchParams.get('page_id') || 'vote-page-2026';
  if (!PAGE_ID_PATTERN.test(pageId)) {
    return jsonResponse({ success: false, error: '無效嘅頁面識別' }, 400, headers);
  }

  const key = 'comments:' + pageId;
  const raw = await kv.get(key, { type: 'json' });
  const allComments = Array.isArray(raw) ? raw : [];

  const approved = allComments.filter(c => c.approved === 1);

  const parents = approved
    .filter(c => !c.parent_id)
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const replies = approved
    .filter(c => c.parent_id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const tree = parents.map(p => ({
    ...p,
    client_ip: undefined,
    replies: replies.filter(r => r.parent_id === p.id).map(r => ({ ...r, client_ip: undefined }))
  }));

  return jsonResponse({
    success: true,
    comments: tree,
    total: parents.length,
    total_replies: replies.length
  }, 200, headers);
}

/* =========================================================================
 *  POST /api/comments — 提交新留言（主留言或回覆）
 * ========================================================================= */
async function handlePostComment(request, kv, env, headers) {
  let body;
  try {
    const cloned = request.clone();
    body = await request.json();
    const text = await cloned.text();
    if (text.length > MAX_REQUEST_BYTES) {
      return jsonResponse({
        success: false,
        error: '請求體過大（上限 5.5MB）',
        code: 'REQUEST_TOO_LARGE'
      }, 413, headers);
    }
  } catch {
    return jsonResponse({ success: false, error: '無效嘅請求格式' }, 400, headers);
  }

  if (body.website_url && String(body.website_url).trim()) {
    return jsonResponse({
      success: true,
      message: '留言已提交！首次留言需審核，通過後即可公開顯示。',
      comment_id: 'honeypot-' + Date.now().toString(36)
    }, 200, headers);
  }

  const parentId = (body.parent_id || '').trim();
  const isReply  = !!parentId;
  const pageId    = (body.page_id    || '').trim();
  const nickname  = (body.nickname  || '').trim();
  const content   = (body.content   || '').trim();
  const imageUrl  = (body.image_url || '').trim();
  const thumbUrl  = (body.thumb_url || '').trim();
  const captchaA  = parseInt(body.captcha_a, 10);
  const captchaB  = parseInt(body.captcha_b, 10);
  const captchaAns = parseInt(body.captcha_answer, 10);

  /* ===== Field validation ===== */
  if (!pageId || !PAGE_ID_PATTERN.test(pageId)) {
    return jsonResponse({ success: false, error: '無效嘅頁面識別' }, 400, headers);
  }
  if (!nickname || nickname.length < 1 || nickname.length > 30) {
    return jsonResponse({ success: false, error: '暱稱長度需為 1-30 字' }, 400, headers);
  }
  if (isReply) {
    if (content.length < 10 || content.length > 300) {
      return jsonResponse({
        success: false,
        error: '回覆字數需為 10-300 字',
        code: 'REPLY_LENGTH'
      }, 400, headers);
    }
  } else {
    if (content.length < 1 || content.length > 2000) {
      return jsonResponse({
        success: false,
        error: '留言內容長度需為 1-2000 字'
      }, 400, headers);
    }
  }

  if (Number.isNaN(captchaA) || Number.isNaN(captchaB) || Number.isNaN(captchaAns)) {
    return jsonResponse({ success: false, error: '請完成數學驗證', code: 'CAPTCHA_MISSING' }, 400, headers);
  }
  if (captchaA < 1 || captchaA > 20 || captchaB < 1 || captchaB > 20) {
    return jsonResponse({ success: false, error: '數學驗證異常', code: 'CAPTCHA_INVALID' }, 400, headers);
  }
  if (captchaA + captchaB !== captchaAns) {
    return jsonResponse({ success: false, error: '數學驗證答案錯誤', code: 'CAPTCHA_WRONG' }, 400, headers);
  }

  if (isReply) {
    if (imageUrl || thumbUrl) {
      return jsonResponse({ success: false, error: '回覆嚴禁附加圖片', code: 'REPLY_NO_IMAGE' }, 400, headers);
    }
  } else {
    if (imageUrl.length > MAX_IMAGE_URL_LEN || thumbUrl.length > MAX_IMAGE_URL_LEN) {
      return jsonResponse({ success: false, error: '圖片檔案過大（上限 5MB）' }, 400, headers);
    }
    if (imageUrl && !isValidImageUrl(imageUrl)) {
      return jsonResponse({ success: false, error: '圖片格式無效' }, 400, headers);
    }
    if (thumbUrl && !isValidImageUrl(thumbUrl)) {
      return jsonResponse({ success: false, error: '縮圖格式無效' }, 400, headers);
    }
  }

  /* 🔒 密碼驗證前徹底去空白 */
  const actualSecret = (env.ADMIN_SECRET || '').trim();
  const bodySecret = body && body.secret ? String(body.secret).trim() : '';
  const isAdmin = !!(bodySecret && actualSecret && safeCompare(bodySecret, actualSecret));

  if (!isAdmin) {
    const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1';
    const rateResult = await checkRateLimit(kv, clientIp, isReply ? 'reply' : 'comment');
    if (!rateResult.allowed) {
      return jsonResponse({
        success: false,
        error: isReply
          ? '回覆太頻繁，請等 ' + rateResult.retryAfter + ' 秒後再試'
          : '提交太頻繁，請等 ' + rateResult.retryAfter + ' 秒後再試',
        code: 'RATE_LIMITED',
        retry_after: rateResult.retryAfter
      }, 429, headers);
    }
  }

  const safeNickname = sanitize(nickname);
  let safeContent    = sanitize(content);
  const safeImageUrl = isValidImageUrl(imageUrl) ? imageUrl : '';
  const safeThumbUrl = isValidImageUrl(thumbUrl) ? thumbUrl : '';

  if (isReply) {
    safeContent = maskUrls(safeContent);
  }

  const key = 'comments:' + pageId;
  const raw = await kv.get(key, { type: 'json' });
  const comments = Array.isArray(raw) ? raw : [];

  if (isReply) {
    const parent = comments.find(c => c.id === parentId && c.approved === 1);
    if (!parent) {
      return jsonResponse({
        success: false,
        error: '父留言不存在或未審核',
        code: 'PARENT_NOT_FOUND'
      }, 400, headers);
    }
  }

  const clientIp = request.headers.get('CF-Connecting-IP') || '';
  const newComment = {
    id:         Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    nickname:   safeNickname,
    content:    safeContent,
    image_url:  safeImageUrl,
    thumb_url:  safeThumbUrl,
    approved:   0,
    created_at: new Date().toISOString(),
    created_at_hk: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Hong_Kong' }),
    client_ip:  clientIp
  };

  if (isReply) {
    newComment.parent_id = parentId;
    newComment.is_reply = true;
  } else {
    newComment.parent_id = '';
    newComment.is_reply = false;
  }

  comments.push(newComment);
  await kv.put(key, JSON.stringify(comments), { expirationTtl: COMMENT_TTL_SEC });

  return jsonResponse({
    success: true,
    message: isReply
      ? '回覆已提交！首次回覆需經審核先會公開顯示。'
      : '留言已提交！首次留言需經審核先會公開顯示。',
    comment_id: newComment.id,
    parent_id: newComment.parent_id
  }, 200, headers);
}

/* =========================================================================
 *  POST /api/admin/list — 列出所有留言
 * ========================================================================= */
async function handleAdminList(url, request, kv, env, headers) {
  const actualSecret = (env.ADMIN_SECRET || '').trim();
  if (!actualSecret) {
    return jsonResponse({ success: false, error: '未設定管理員密鑰' }, 403, headers);
  }

  let body;
  try { body = await request.json(); } catch { body = {}; }

  const bodySecret = body.secret ? String(body.secret).trim() : '';
  if (!bodySecret || !safeCompare(bodySecret, actualSecret)) {
    return jsonResponse({ success: false, error: '密鑰錯誤' }, 403, headers);
  }

  const pageId = url.searchParams.get('page_id') || body.page_id || 'vote-page-2026';
  if (!PAGE_ID_PATTERN.test(pageId)) {
    return jsonResponse({ success: false, error: '無效嘅頁面識別' }, 400, headers);
  }

  const key = 'comments:' + pageId;
  const raw = await kv.get(key, { type: 'json' });
  const comments = Array.isArray(raw) ? raw : [];

  const sorted = comments.sort((a, b) => {
    if ((a.approved === 0) !== (b.approved === 0)) return a.approved === 0 ? -1 : 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return jsonResponse({
    success: true,
    comments: sorted,
    total: sorted.length,
    pending: sorted.filter(c => c.approved === 0).length,
    approved: sorted.filter(c => c.approved === 1).length
  }, 200, headers);
}

/* =========================================================================
 *  POST /api/admin/approve — 審核通過
 * ========================================================================= */
async function handleAdminApprove(request, kv, env, headers) {
  const actualSecret = (env.ADMIN_SECRET || '').trim();
  if (!actualSecret) {
    return jsonResponse({ success: false, error: '未設定管理員密鑰' }, 403, headers);
  }

  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ success: false, error: '無效嘅請求格式' }, 400, headers);
  }

  const bodySecret = body.secret ? String(body.secret).trim() : '';
  if (!bodySecret || !safeCompare(bodySecret, actualSecret)) {
    return jsonResponse({ success: false, error: '密鑰錯誤' }, 403, headers);
  }

  const targetId = String(body.id || '');
  if (!targetId || targetId.length > 64) {
    return jsonResponse({ success: false, error: '請指定留言 ID' }, 400, headers);
  }

  const pageId = body.page_id || 'vote-page-2026';
  if (!PAGE_ID_PATTERN.test(pageId)) {
    return jsonResponse({ success: false, error: '無效嘅頁面識別' }, 400, headers);
  }

  const key = 'comments:' + pageId;
  const raw = await kv.get(key, { type: 'json' });
  const comments = Array.isArray(raw) ? raw : [];

  const target = comments.find(c => c.id === targetId);
  if (!target) {
    return jsonResponse({ success: false, error: '搵唔到該留言' }, 404, headers);
  }

  target.approved = 1;
  await kv.put(key, JSON.stringify(comments), { expirationTtl: COMMENT_TTL_SEC });

  return jsonResponse({
    success: true,
    message: '留言 ' + targetId + ' 已審核通過',
    comment: target
  }, 200, headers);
}

/* =========================================================================
 *  POST /api/admin/delete — 遞迴刪除留言
 * ========================================================================= */
async function handleAdminDelete(request, kv, env, headers) {
  const actualSecret = (env.ADMIN_SECRET || '').trim();
  if (!actualSecret) {
    return jsonResponse({ success: false, error: '未設定管理員密鑰' }, 403, headers);
  }

  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ success: false, error: '無效嘅請求格式' }, 400, headers);
  }

  const bodySecret = body.secret ? String(body.secret).trim() : '';
  if (!bodySecret || !safeCompare(bodySecret, actualSecret)) {
    return jsonResponse({ success: false, error: '密鑰錯誤' }, 403, headers);
  }

  const targetId = String(body.id || '');
  if (!targetId || targetId.length > 64) {
    return jsonResponse({ success: false, error: '請指定留言 ID' }, 400, headers);
  }

  const pageId = body.page_id || 'vote-page-2026';
  if (!PAGE_ID_PATTERN.test(pageId)) {
    return jsonResponse({ success: false, error: '無效嘅頁面識別' }, 400, headers);
  }

  const key = 'comments:' + pageId;
  const raw = await kv.get(key, { type: 'json' });
  const comments = Array.isArray(raw) ? raw : [];

  const toDelete = new Set([targetId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of comments) {
      if (c.parent_id && toDelete.has(c.parent_id) && !toDelete.has(c.id)) {
        toDelete.add(c.id);
        changed = true;
      }
    }
  }

  const remaining = comments.filter(c => !toDelete.has(c.id));
  await kv.put(key, JSON.stringify(remaining), { expirationTtl: COMMENT_TTL_SEC });

  return jsonResponse({
    success: true,
    message: '已刪除 ' + toDelete.size + ' 條留言（含所有回覆）',
    deleted_ids: Array.from(toDelete)
  }, 200, headers);
}

/* =========================================================================
 *  POST /api/admin/reply — 管理員以官方身份回覆
 * ========================================================================= */
async function handleAdminReply(request, kv, env, headers) {
  const actualSecret = (env.ADMIN_SECRET || '').trim();
  if (!actualSecret) {
    return jsonResponse({ success: false, error: '未設定管理員密鑰' }, 403, headers);
  }

  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ success: false, error: '無效嘅請求格式' }, 400, headers);
  }

  const bodySecret = body.secret ? String(body.secret).trim() : '';
  if (!bodySecret || !safeCompare(bodySecret, actualSecret)) {
    return jsonResponse({ success: false, error: '密鑰錯誤' }, 403, headers);
  }

  const parentId = (body.parent_id || '').trim();
  const content  = (body.content  || '').trim();
  const pageId   = body.page_id    || 'vote-page-2026';

  if (!parentId || parentId.length > 64) {
    return jsonResponse({ success: false, error: '請指定父留言 ID' }, 400, headers);
  }
  if (!content || content.length < 1 || content.length > 500) {
    return jsonResponse({ success: false, error: '回覆內容長度需為 1-500 字' }, 400, headers);
  }
  if (!PAGE_ID_PATTERN.test(pageId)) {
    return jsonResponse({ success: false, error: '無效嘅頁面識別' }, 400, headers);
  }

  const key = 'comments:' + pageId;
  const raw = await kv.get(key, { type: 'json' });
  const comments = Array.isArray(raw) ? raw : [];

  const parent = comments.find(c => c.id === parentId);
  if (!parent) {
    return jsonResponse({ success: false, error: '父留言不存在' }, 404, headers);
  }

  const safeContent = maskUrls(sanitize(content));
  const safeNickname = '滅蟲師傅';

  const newReply = {
    id:         'official-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    nickname:   safeNickname,
    content:    safeContent,
    image_url:  '',
    thumb_url:  '',
    approved:   1,
    is_official: true,
    is_reply:   true,
    parent_id:  parentId,
    created_at: new Date().toISOString(),
    created_at_hk: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Hong_Kong' }),
    client_ip:  'admin'
  };

  comments.push(newReply);
  await kv.put(key, JSON.stringify(comments), { expirationTtl: COMMENT_TTL_SEC });

  return jsonResponse({
    success: true,
    message: '官方回覆已發佈',
    reply: newReply
  }, 200, headers);
}

/* =========================================================================
 *  POST /api/admin/pin — 置頂 / 取消置頂留言
 * ========================================================================= */
async function handleAdminPin(request, kv, env, headers) {
  const actualSecret = (env.ADMIN_SECRET || '').trim();
  if (!actualSecret) {
    return jsonResponse({ success: false, error: '未設定管理員密鑰' }, 403, headers);
  }

  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ success: false, error: '無效嘅請求格式' }, 400, headers);
  }

  const bodySecret = body.secret ? String(body.secret).trim() : '';
  if (!bodySecret || !safeCompare(bodySecret, actualSecret)) {
    return jsonResponse({ success: false, error: '密鑰錯誤' }, 403, headers);
  }

  const targetId = String(body.id || '');
  const pin      = body.pin === true;
  if (!targetId || targetId.length > 64) {
    return jsonResponse({ success: false, error: '請指定留言 ID' }, 400, headers);
  }

  const pageId = body.page_id || 'vote-page-2026';
  if (!PAGE_ID_PATTERN.test(pageId)) {
    return jsonResponse({ success: false, error: '無效嘅頁面識別' }, 400, headers);
  }

  const key = 'comments:' + pageId;
  const raw = await kv.get(key, { type: 'json' });
  const comments = Array.isArray(raw) ? raw : [];

  const target = comments.find(c => c.id === targetId);
  if (!target) {
    return jsonResponse({ success: false, error: '搵唔到該留言' }, 404, headers);
  }

  if (pin) {
    comments.forEach(c => { if (c.is_pinned) delete c.is_pinned; });
    target.is_pinned = true;
  } else {
    delete target.is_pinned;
  }

  await kv.put(key, JSON.stringify(comments), { expirationTtl: COMMENT_TTL_SEC });

  return jsonResponse({
    success: true,
    message: pin ? '已置頂留言' : '已取消置頂',
    comment: target
  }, 200, headers);
}

/* =========================================================================
 *  工具函數
 * ========================================================================= */

function sanitize(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidImageUrl(str) {
  if (!str) return false;
  if (/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(str)) return true;
  try {
    const u = new URL(str);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

function maskUrls(text) {
  text = text.replace(/\b(https?:\/\/|ftp:\/\/|www\.)\S+/gi, '***');
  text = text.replace(/\b[a-z0-9-]+\.(com|net|org|io|hk|tw|cn|info|biz|cc|tv|me|club|xyz|top)\b\/?\S*/gi, '***');
  return text;
}

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function checkRateLimit(kv, ip, type) {
  const hardCooldownKey = 'rate:' + ip + ':' + type;
  const existing = await kv.get(hardCooldownKey);
  if (existing) {
    const lastTime = parseInt(existing, 10) || Date.now();
    const elapsed = Math.floor((Date.now() - lastTime) / 1000);
    if (elapsed < 60) {
      return { allowed: false, retryAfter: 60 - elapsed };
    }
  }
  await kv.put(hardCooldownKey, Date.now().toString(), { expirationTtl: 60 });

  const counterKey = 'ratelim:' + ip + ':' + type;
  const maxCount = type === 'reply' ? RATE_MAX_REPLY : RATE_MAX_COMMENT;
  const current = parseInt(await kv.get(counterKey) || '0', 10);
  if (current >= maxCount) {
    return { allowed: false, retryAfter: RATE_LIMIT_TTL };
  }
  await kv.put(counterKey, (current + 1).toString(), { expirationTtl: RATE_LIMIT_TTL });
  return { allowed: true };
}

function buildCorsHeaders(allowOrigin) {
  const h = {
    'Access-Control-Allow-Methods':     'GET, POST, OPTIONS',
    // 🔒 修正：將 Authorization 與自定義標頭加入放行列表，徹底解決管理員登入攔截問題
    'Access-Control-Allow-Headers':     'Content-Type, Authorization, X-Admin-Secret',
    'Access-Control-Max-Age':           '86400',
    'Vary':                             'Origin',
  };
  if (allowOrigin) {
    h['Access-Control-Allow-Origin'] = allowOrigin;
    h['Access-Control-Allow-Credentials'] = 'true';
  }
  return h;
}

function jsonResponse(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
}