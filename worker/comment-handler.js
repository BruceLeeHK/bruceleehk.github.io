/**
 * Cloudflare Worker — 滅蟲師傅 自建原生留言系統後端（修正版 v2.2）
 *
 * 更新亮點（v2.2）：
 *   🔧 修正 Cloudflare KV 400 錯誤：
 *      - 將回覆冷卻時間由 30 秒修正為 60 秒（Cloudflare KV 規定 expirationTtl 最少需為 60 秒）
 *   🔧 徹底解決「越撳越延遲」Bug：
 *      - 改用獨立 KV key `rate:{ip}:{type}` + TTL 自動過期
 *      - 被攔截時直接 return，唔寫入 KV → 唔會重置 60 秒倒數
 *      - 管理員（帶正確 secret）100% 豁免 Rate Limit
 *      - 回傳 retry_after 剩餘秒數，前端顯示精確倒數
 *
 * API 端點總覽：
 *   GET  /api/health                  → 健康檢查
 *   GET  /api/comments?page_id=xxx     → 讀取已審核留言（含樹狀回覆）
 *   POST /api/comments                 → 提交新留言（主留言 / 回覆）
 *   POST /api/admin/list               → 列出所有留言（含未審核）
 *   POST /api/admin/approve            → 審核通過單條留言
 *   POST /api/admin/delete             → 刪除留言
 *   POST /api/admin/reply              → 管理員以官方身份回覆
 *   POST /api/admin/pin                → 置頂 / 取消置頂留言
 */

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
    const corsOrigin = allowedOrigins.has(origin) ? origin : 'https://bruceleehk.com';

    const corsHeaders = {
      'Access-Control-Allow-Origin':      corsOrigin,
      'Access-Control-Allow-Methods':     'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers':     'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age':           '86400',
    };

    /* Preflight */
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      const kv = env.COMMENT_KV;

      /* GET /api/health — 健康檢查 */
      if (url.pathname === '/api/health') {
        const kvOk = !!kv;
        return jsonResponse({
          status: kvOk ? 'ok' : 'degraded',
          kv_bound: kvOk,
          version: '2.2',
          features: ['nested_reply', 'official_badge', 'pin', 'captcha', 'admin_delete'],
          time: new Date().toISOString()
        }, 200, corsHeaders);
      }

      if (!kv) {
        return jsonResponse({
          success: false,
          error: 'KV 資料庫未綁定，請先建立 KV Namespace 並更新 wrangler.toml',
          code: 'KV_NOT_BOUND'
        }, 503, corsHeaders);
      }

      /* GET /api/comments — 讀取已審核留言（樹狀結構） */
      if (request.method === 'GET' && url.pathname === '/api/comments') {
        return await handleGetComments(url, kv, corsHeaders);
      }

      /* POST /api/comments — 提交新留言（主留言或回覆） */
      if (request.method === 'POST' && url.pathname === '/api/comments') {
        return await handlePostComment(request, kv, env, corsHeaders);
      }

      /* ===== 管理員 API ===== */

      /* POST /api/admin/list — 列出所有留言（含未審核） */
      if (request.method === 'POST' && url.pathname === '/api/admin/list') {
        return await handleAdminList(url, request, kv, env, corsHeaders);
      }

      /* POST /api/admin/approve — 審核通過 */
      if (request.method === 'POST' && url.pathname === '/api/admin/approve') {
        return await handleAdminApprove(request, kv, env, corsHeaders);
      }

      /* POST /api/admin/delete — 刪除留言 */
      if (request.method === 'POST' && url.pathname === '/api/admin/delete') {
        return await handleAdminDelete(request, kv, env, corsHeaders);
      }

      /* POST /api/admin/reply — 管理員以官方身份回覆 */
      if (request.method === 'POST' && url.pathname === '/api/admin/reply') {
        return await handleAdminReply(request, kv, env, corsHeaders);
      }

      /* POST /api/admin/pin — 置頂 / 取消置頂 */
      if (request.method === 'POST' && url.pathname === '/api/admin/pin') {
        return await handleAdminPin(request, kv, env, corsHeaders);
      }

      return jsonResponse({ success: false, error: 'Not found' }, 404, corsHeaders);

    } catch (err) {
      console.error('Worker 錯誤:', err.message, err.stack);
      return jsonResponse({
        success: false,
        error: '伺服器內部錯誤：' + err.message,
        code: 'INTERNAL_ERROR'
      }, 500, corsHeaders);
    }
  }
};

/* =========================================================================
 *  GET /api/comments — 讀取已審核留言（樹狀結構）
 * ========================================================================= */
async function handleGetComments(url, kv, corsHeaders) {
  const pageId = url.searchParams.get('page_id') || 'vote-page-2026';
  const key = 'comments:' + pageId;

  const raw = await kv.get(key, { type: 'json' });
  const allComments = Array.isArray(raw) ? raw : [];

  /* 只取已審核留言 */
  const approved = allComments.filter(c => c.approved === 1);

  /* 拆分主留言 + 回覆 */
  const parents = approved
    .filter(c => !c.parent_id)
    .sort((a, b) => {
      /* 置頂排最前 */
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const replies = approved
    .filter(c => c.parent_id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  /* 把回覆掛到對應 parent 之下 */
  const tree = parents.map(p => {
    return {
      ...p,
      replies: replies.filter(r => r.parent_id === p.id)
    };
  });

  return jsonResponse({
    success: true,
    comments: tree,
    total: parents.length,
    total_replies: replies.length
  }, 200, corsHeaders);
}

/* =========================================================================
 *  POST /api/comments — 提交新留言（主留言或回覆）
 * ========================================================================= */
async function handlePostComment(request, kv, env, corsHeaders) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: '無效嘅請求格式' }, 400, corsHeaders);
  }

  /* 主留言 vs 回覆：以 parent_id 區分 */
  const parentId = (body.parent_id || '').trim();
  const isReply  = !!parentId;

  /* ── 1. 速率限制（KV-based，管理員豁免） ── */
  const bodySecret = body && body.secret;
  const isAdmin = !!(bodySecret && env.ADMIN_SECRET && bodySecret === env.ADMIN_SECRET);

  if (!isAdmin) {
    const pageId   = (body.page_id  || '').trim();
    const nickname = (body.nickname || '').trim();
    const content  = (body.content  || '').trim();

    if (!pageId || pageId.length > 64) {
      return jsonResponse({ success: false, error: '無效嘅頁面識別' }, 400, corsHeaders);
    }
    if (!nickname || nickname.length < 1 || nickname.length > 30) {
      return jsonResponse({ success: false, error: '暱稱長度需為 1-30 字' }, 400, corsHeaders);
    }
    if (isReply) {
      if (content.length < 10 || content.length > 300) {
        return jsonResponse({ success: false, error: '回覆字數需為 10-300 字', code: 'REPLY_LENGTH' }, 400, corsHeaders);
      }
    } else {
      if (content.length < 1 || content.length > 2000) {
        return jsonResponse({ success: false, error: '留言內容長度需為 1-2000 字' }, 400, corsHeaders);
      }
    }

    /* 基本欄位通過 → 檢查 KV 冷卻紀錄 (Cloudflare KV 最少要求 60 秒) */
    const clientIp    = request.headers.get('CF-Connecting-IP') || '127.0.0.1';
    const cooldownSec = 60; // 👈 統一設置為 60 秒，符合 Cloudflare KV 規範
    const rateKey     = 'rate:' + clientIp + ':' + (isReply ? 'reply' : 'comment');

    const existing = await kv.get(rateKey);
    if (existing) {
      const lastTime  = parseInt(existing, 10) || Date.now();
      const elapsed   = Math.floor((Date.now() - lastTime) / 1000);
      const retryAfter = Math.max(1, cooldownSec - elapsed);
      return jsonResponse({
        success: false,
        error: isReply
          ? '回覆太頻繁，請等 ' + retryAfter + ' 秒後再試'
          : '提交太頻繁，請等 ' + retryAfter + ' 秒後再試',
        code: 'RATE_LIMITED',
        retry_after: retryAfter,
        cooldown: cooldownSec
      }, 429, corsHeaders);
    }

    /* 通過檢查，寫入冷卻紀錄（TTL 60 秒） */
    await kv.put(rateKey, Date.now().toString(), { expirationTtl: cooldownSec });
  }

  /* ── 2. 完整欄位驗證 ── */
  const pageId    = (body.page_id    || '').trim();
  const nickname  = (body.nickname  || '').trim();
  const content   = (body.content   || '').trim();
  const imageUrl  = (body.image_url || '').trim();
  const thumbUrl  = (body.thumb_url || '').trim();
  const captchaA  = parseInt(body.captcha_a, 10);
  const captchaB  = parseInt(body.captcha_b, 10);
  const captchaAns = parseInt(body.captcha_answer, 10);

  if (!pageId || pageId.length > 64) {
    return jsonResponse({ success: false, error: '無效嘅頁面識別' }, 400, corsHeaders);
  }
  if (!nickname || nickname.length < 1 || nickname.length > 30) {
    return jsonResponse({ success: false, error: '暱稱長度需為 1-30 字' }, 400, corsHeaders);
  }

  /* 內容長度規則 */
  if (isReply) {
    if (content.length < 10 || content.length > 300) {
      return jsonResponse({
        success: false,
        error: '回覆字數需為 10-300 字',
        code: 'REPLY_LENGTH'
      }, 400, corsHeaders);
    }
  } else {
    if (content.length < 1 || content.length > 2000) {
      return jsonResponse({
        success: false,
        error: '留言內容長度需為 1-2000 字'
      }, 400, corsHeaders);
    }
  }

  /* 數學驗證 */
  if (Number.isNaN(captchaA) || Number.isNaN(captchaB) || Number.isNaN(captchaAns)) {
    return jsonResponse({ success: false, error: '請完成數學驗證', code: 'CAPTCHA_MISSING' }, 400, corsHeaders);
  }
  if (captchaA + captchaB !== captchaAns) {
    return jsonResponse({ success: false, error: '數學驗證答案錯誤', code: 'CAPTCHA_WRONG' }, 400, corsHeaders);
  }
  if (captchaA < 0 || captchaA > 20 || captchaB < 0 || captchaB > 20) {
    return jsonResponse({ success: false, error: '數學驗證異常', code: 'CAPTCHA_INVALID' }, 400, corsHeaders);
  }

  /* 圖片網址處理 */
  if (isReply) {
    if (imageUrl || thumbUrl) {
      return jsonResponse({
        success: false,
        error: '回覆嚴禁附加圖片',
        code: 'REPLY_NO_IMAGE'
      }, 400, corsHeaders);
    }
  } else {
    if (imageUrl.length > 500 || thumbUrl.length > 500) {
      return jsonResponse({ success: false, error: '圖片網址過長' }, 400, corsHeaders);
    }
  }

  /* 防止 XSS */
  const safeNickname = sanitize(nickname);
  let safeContent  = sanitize(content);
  const safeImageUrl = isValidUrl(imageUrl) ? imageUrl : '';
  const safeThumbUrl = isValidUrl(thumbUrl) ? thumbUrl : '';

  /* 回覆防廣告：遮蔽 URL */
  if (isReply) {
    safeContent = maskUrls(safeContent);
  }

  /* ── 讀取現有留言 ── */
  const key = 'comments:' + pageId;
  const raw = await kv.get(key, { type: 'json' });
  const comments = Array.isArray(raw) ? raw : [];

  /* 若係回覆，檢查父留言存在且已審核 */
  if (isReply) {
    const parent = comments.find(c => c.id === parentId && c.approved === 1);
    if (!parent) {
      return jsonResponse({
        success: false,
        error: '父留言不存在或未審核',
        code: 'PARENT_NOT_FOUND'
      }, 400, corsHeaders);
    }
  }

  /* ── 新增留言 ── */
  const clientIp = request.headers.get('CF-Connecting-IP') || '';
  const newComment = {
    id:         Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
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

  /* 寫入 KV */
  await kv.put(key, JSON.stringify(comments), { expirationTtl: 15552000 });

  return jsonResponse({
    success: true,
    message: isReply
      ? '回覆已提交！首次回覆需經審核先會公開顯示。'
      : '留言已提交！首次留言需經審核先會公開顯示。',
    comment_id: newComment.id,
    parent_id: newComment.parent_id
  }, 200, corsHeaders);
}

/* =========================================================================
 *  POST /api/admin/list — 列出所有留言
 * ========================================================================= */
async function handleAdminList(url, request, kv, env, corsHeaders) {
  const adminSecret = env.ADMIN_SECRET;
  if (!adminSecret) {
    return jsonResponse({ success: false, error: '未設定管理員密鑰' }, 403, corsHeaders);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (body.secret !== adminSecret) {
    return jsonResponse({ success: false, error: '密鑰錯誤' }, 403, corsHeaders);
  }

  const pageId = url.searchParams.get('page_id') || body.page_id || 'vote-page-2026';
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
  }, 200, corsHeaders);
}

/* =========================================================================
 *  POST /api/admin/approve — 審核通過
 * ========================================================================= */
async function handleAdminApprove(request, kv, env, corsHeaders) {
  const adminSecret = env.ADMIN_SECRET;
  if (!adminSecret) {
    return jsonResponse({ success: false, error: '未設定管理員密鑰（ADMIN_SECRET）' }, 403, corsHeaders);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: '無效嘅請求格式' }, 400, corsHeaders);
  }

  if (body.secret !== adminSecret) {
    return jsonResponse({ success: false, error: '密鑰錯誤' }, 403, corsHeaders);
  }

  const targetId = body.id;
  if (!targetId) {
    return jsonResponse({ success: false, error: '請指定留言 ID' }, 400, corsHeaders);
  }

  const pageId = body.page_id || 'vote-page-2026';
  const key = 'comments:' + pageId;
  const raw = await kv.get(key, { type: 'json' });
  const comments = Array.isArray(raw) ? raw : [];

  const target = comments.find(c => c.id === targetId);
  if (!target) {
    return jsonResponse({ success: false, error: '搵唔到該留言' }, 404, corsHeaders);
  }

  target.approved = 1;
  await kv.put(key, JSON.stringify(comments), { expirationTtl: 15552000 });

  return jsonResponse({
    success: true,
    message: '留言 ' + targetId + ' 已審核通過',
    comment: target
  }, 200, corsHeaders);
}

/* =========================================================================
 *  POST /api/admin/delete — 刪除留言
 * ========================================================================= */
async function handleAdminDelete(request, kv, env, corsHeaders) {
  const adminSecret = env.ADMIN_SECRET;
  if (!adminSecret) {
    return jsonResponse({ success: false, error: '未設定管理員密鑰' }, 403, corsHeaders);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: '無效嘅請求格式' }, 400, corsHeaders);
  }

  if (body.secret !== adminSecret) {
    return jsonResponse({ success: false, error: '密鑰錯誤' }, 403, corsHeaders);
  }

  const targetId = body.id;
  if (!targetId) {
    return jsonResponse({ success: false, error: '請指定留言 ID' }, 400, corsHeaders);
  }

  const pageId = body.page_id || 'vote-page-2026';
  const key = 'comments:' + pageId;
  const raw = await kv.get(key, { type: 'json' });
  const comments = Array.isArray(raw) ? raw : [];

  const idx = comments.findIndex(c => c.id === targetId);
  if (idx === -1) {
    return jsonResponse({ success: false, error: '搵唔到該留言' }, 404, corsHeaders);
  }

  const deletedIds = [targetId];
  let removed = 0;
  for (let i = comments.length - 1; i >= 0; i--) {
    if (deletedIds.includes(comments[i].id) || deletedIds.includes(comments[i].parent_id)) {
      if (!deletedIds.includes(comments[i].id)) deletedIds.push(comments[i].id);
      comments.splice(i, 1);
      removed++;
    }
  }

  await kv.put(key, JSON.stringify(comments), { expirationTtl: 15552000 });

  return jsonResponse({
    success: true,
    message: '已刪除 ' + removed + ' 條留言（含回覆）',
    deleted_ids: deletedIds
  }, 200, corsHeaders);
}

/* =========================================================================
 *  POST /api/admin/reply — 管理員以官方身份回覆
 * ========================================================================= */
async function handleAdminReply(request, kv, env, corsHeaders) {
  const adminSecret = env.ADMIN_SECRET;
  if (!adminSecret) {
    return jsonResponse({ success: false, error: '未設定管理員密鑰' }, 403, corsHeaders);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: '無效嘅請求格式' }, 400, corsHeaders);
  }

  if (body.secret !== adminSecret) {
    return jsonResponse({ success: false, error: '密鑰錯誤' }, 403, corsHeaders);
  }

  const parentId = (body.parent_id || '').trim();
  const content  = (body.content  || '').trim();
  const nickname = (body.nickname || '滅蟲師傅').trim();
  const pageId   = body.page_id    || 'vote-page-2026';

  if (!parentId) {
    return jsonResponse({ success: false, error: '請指定父留言 ID' }, 400, corsHeaders);
  }
  if (!content || content.length < 1 || content.length > 500) {
    return jsonResponse({ success: false, error: '回覆內容長度需為 1-500 字' }, 400, corsHeaders);
  }

  const key = 'comments:' + pageId;
  const raw = await kv.get(key, { type: 'json' });
  const comments = Array.isArray(raw) ? raw : [];

  const parent = comments.find(c => c.id === parentId);
  if (!parent) {
    return jsonResponse({ success: false, error: '父留言不存在' }, 404, corsHeaders);
  }

  const safeContent = maskUrls(sanitize(content));
  const safeNickname = sanitize(nickname);

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
  await kv.put(key, JSON.stringify(comments), { expirationTtl: 15552000 });

  return jsonResponse({
    success: true,
    message: '官方回覆已發佈',
    reply: newReply
  }, 200, corsHeaders);
}

/* =========================================================================
 *  POST /api/admin/pin — 置頂 / 取消置頂留言
 * ========================================================================= */
async function handleAdminPin(request, kv, env, corsHeaders) {
  const adminSecret = env.ADMIN_SECRET;
  if (!adminSecret) {
    return jsonResponse({ success: false, error: '未設定管理員密鑰' }, 403, corsHeaders);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: '無效嘅請求格式' }, 400, corsHeaders);
  }

  if (body.secret !== adminSecret) {
    return jsonResponse({ success: false, error: '密鑰錯誤' }, 403, corsHeaders);
  }

  const targetId = body.id;
  const pin     = body.pin === true;
  if (!targetId) {
    return jsonResponse({ success: false, error: '請指定留言 ID' }, 400, corsHeaders);
  }

  const pageId = body.page_id || 'vote-page-2026';
  const key = 'comments:' + pageId;
  const raw = await kv.get(key, { type: 'json' });
  const comments = Array.isArray(raw) ? raw : [];

  const target = comments.find(c => c.id === targetId);
  if (!target) {
    return jsonResponse({ success: false, error: '搵唔到該留言' }, 404, corsHeaders);
  }

  if (pin) {
    comments.forEach(c => { if (c.is_pinned) delete c.is_pinned; });
    target.is_pinned = true;
  } else {
    delete target.is_pinned;
  }

  await kv.put(key, JSON.stringify(comments), { expirationTtl: 15552000 });

  return jsonResponse({
    success: true,
    message: pin ? '已置頂留言' : '已取消置頂',
    comment: target
  }, 200, corsHeaders);
}

/* =========================================================================
 *  工具函數
 * ========================================================================= */

function sanitize(str) {
  return String(str)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidUrl(str) {
  if (!str) return false;
  try {
    const u = new URL(str);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

function maskUrls(text) {
  text = text.replace(/\b(https?:\/\/|ftp:\/\/|www\.)\S+/gi, '***');
  text = text.replace(/\b[a-z0-9-]+\.(com|net|org|io|hk|tw|cn|info|biz|cc|tv|me|club|xyz|top)\b\/?\S*/gi, '***');
  return text;
}

function jsonResponse(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}