/**
 * Cloudflare Worker — 滅蟲師傅 自建原生留言系統後端（安全升級版 v3.1 — 2026-08-17）
 *
 * v3.1 修復亮點：
 *   🔧 修正「密碼錯碼錯誤」誤判問題：
 *      - 當 ADMIN_SECRET 環境變數未設定時，回傳專屬錯誤碼 ADMIN_SECRET_NOT_SET
 *        而非通用「密鑰錯誤」，前端可據此顯示詳細設定指引
 *      - 修正管理員密鑰比較使用時序安全函數 safeCompare（防 side-channel attack）
 *      - 自動 trim 兩端空白，避免空白差異導致比對失敗
 *   🔧 新增 POST /api/admin/test 端點：
 *      - 提供前端驗證密鑰是否正確的獨立 API
 *      - 同時回報 ADMIN_SECRET 是否已設定、KV 是否綁定
 *   🔧 /api/health 加入 admin_secret_set 欄位（不洩漏實際值）
 *   🔧 修正 CORS 反射弱點：未知 origin 不再 fall-back 至生產域名
 *   🔧 加入安全標頭：X-Content-Type-Options, X-Frame-Options, Referrer-Policy
 *   🔧 加入請求大小限制（5.5MB）
 *   🔧 加入 5 分鐘視窗速率限制（5 主留言 / 10 回覆 per IP）
 *   🔧 遞迴刪除所有後代回覆（修正原 1 層刪除 Bug）
 *   🔧 強制官方回覆使用「滅蟲師傅」暱稱（移除 admin 覆寫漏洞）
 *   🔧 嚴格驗證 page_id 字符白名單
 *   🔧 圖片 URL 限制為 data:image/* 或 https://
 *   🔧 公開 API 回應隱藏 client_ip
 *
 * API 端點總覽：
 *   GET  /api/health                  → 健康檢查（含 admin_secret_set 欄位）
 *   GET  /api/comments?page_id=xxx     → 讀取已審核留言（含樹狀回覆）
 *   POST /api/comments                 → 提交新留言（主留言 / 回覆，支援 honeypot）
 *   POST /api/admin/test               → 測試管理密鑰是否正確
 *   POST /api/admin/list               → 列出所有留言（含未審核）
 *   POST /api/admin/approve            → 審核通過單條留言
 *   POST /api/admin/delete             → 遞迴刪除留言（含所有後代回覆）
 *   POST /api/admin/reply              → 管理員以官方身份回覆
 *   POST /api/admin/pin                → 置頂 / 取消置頂留言
 */

const MAX_REQUEST_BYTES = 5_500_000;
const MAX_IMAGE_URL_LEN = 5_500_000;
const PAGE_ID_PATTERN   = /^[A-Za-z0-9_-]{1,64}$/;
const COMMENT_TTL_SEC   = 15_552_000;
const RATE_LIMIT_TTL    = 300;
const RATE_MAX_COMMENT  = 5;
const RATE_MAX_REPLY    = 10;

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

      /* Security headers applied to every response */
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
          admin_secret_set: !!env.ADMIN_SECRET,  /* 🔧 v3.1: report ADMIN_SECRET status (without leaking value) */
          version: '3.1',
          features: ['nested_reply', 'official_badge', 'pin', 'captcha', 'admin_delete', 'recursive_delete', 'rate_limit', 'honeypot', 'admin_test'],
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

      /* 🔧 v3.1: POST /api/admin/test — 測試管理密鑰是否正確（不載入留言） */
      if (request.method === 'POST' && url.pathname === '/api/admin/test') {
        return await handleAdminTest(request, env, securityHeaders);
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
 *  🔧 v3.1 NEW: POST /api/admin/test — 測試管理密鑰
 *  回傳詳細狀態而不載入留言，方便前端顯示準確錯誤訊息
 * ========================================================================= */
async function handleAdminTest(request, env, headers) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: '無效嘅請求格式' }, 400, headers);
  }

  /* Step 1: Check if ADMIN_SECRET is configured */
  if (!env.ADMIN_SECRET) {
    return jsonResponse({
      success: false,
      error: 'Worker 未設定 ADMIN_SECRET 環境變數',
      code: 'ADMIN_SECRET_NOT_SET',
      hint: '請到 Cloudflare Dashboard → Workers & Pages → comment-handler → Settings → Variables and Secrets → 新增 ADMIN_SECRET 後 Save and Deploy'
    }, 403, headers);
  }

  /* Step 2: Compare secrets (timing-safe + trim whitespace) */
  const providedSecret = String(body.secret || '').trim();
  const expectedSecret = String(env.ADMIN_SECRET).trim();

  if (!providedSecret) {
    return jsonResponse({
      success: false,
      error: '未提供密鑰',
      code: 'NO_SECRET_PROVIDED'
    }, 400, headers);
  }

  if (!safeCompare(providedSecret, expectedSecret)) {
    return jsonResponse({
      success: false,
      error: '密鑰錯誤',
      code: 'SECRET_MISMATCH'
    }, 403, headers);
  }

  /* All good */
  return jsonResponse({
    success: true,
    message: '密鑰驗證通過',
    admin_secret_set: true,
    time: new Date().toISOString()
  }, 200, headers);
}

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

  /* Honeypot detection */
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
      return jsonResponse({
        success: false,
        error: '回覆嚴禁附加圖片',
        code: 'REPLY_NO_IMAGE'
      }, 400, headers);
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

  /* Rate limiting (admin exempt) */
  const bodySecret = body && body.secret;
  const isAdmin = !!(bodySecret && env.ADMIN_SECRET && safeCompare(String(bodySecret).trim(), String(env.ADMIN_SECRET).trim()));

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
  /* 🔧 v3.1: Use new verifySecret helper for clearer error codes */
  const verifyResult = await verifySecret(request, env, headers);
  if (!verifyResult.ok) return verifyResult.response;

  const pageId = url.searchParams.get('page_id') || verifyResult.body.page_id || 'vote-page-2026';
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
 *  🔧 v3.1 NEW: verifySecret helper — returns {ok, response, body}
 *  Centralizes the admin-secret-checking logic with clear error codes.
 * ========================================================================= */
async function verifySecret(request, env, headers) {
  if (!env.ADMIN_SECRET) {
    return {
      ok: false,
      response: jsonResponse({
        success: false,
        error: 'Worker 未設定 ADMIN_SECRET 環境變數',
        code: 'ADMIN_SECRET_NOT_SET',
        hint: '請到 Cloudflare Dashboard → Workers & Pages → comment-handler → Settings → Variables and Secrets → 新增 ADMIN_SECRET 後 Save and Deploy'
      }, 403, headers)
    };
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: jsonResponse({ success: false, error: '無效嘅請求格式' }, 400, headers)
    };
  }

  const providedSecret = String(body.secret || '').trim();
  const expectedSecret = String(env.ADMIN_SECRET).trim();

  if (!providedSecret) {
    return {
      ok: false,
      body,
      response: jsonResponse({ success: false, error: '未提供密鑰', code: 'NO_SECRET_PROVIDED' }, 400, headers)
    };
  }

  if (!safeCompare(providedSecret, expectedSecret)) {
    return {
      ok: false,
      body,
      response: jsonResponse({ success: false, error: '密鑰錯誤', code: 'SECRET_MISMATCH' }, 403, headers)
    };
  }

  return { ok: true, body };
}

/* =========================================================================
 *  POST /api/admin/approve — 審核通過
 * ========================================================================= */
async function handleAdminApprove(request, kv, env, headers) {
  const v = await verifySecret(request, env, headers);
  if (!v.ok) return v.response;
  const body = v.body;

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
 *  POST /api/admin/delete — 遞迴刪除留言（含所有後代回覆）
 * ========================================================================= */
async function handleAdminDelete(request, kv, env, headers) {
  const v = await verifySecret(request, env, headers);
  if (!v.ok) return v.response;
  const body = v.body;

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

  /* 🔒 v3.0: Recursive deletion — collect all descendant IDs */
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
  const v = await verifySecret(request, env, headers);
  if (!v.ok) return v.response;
  const body = v.body;

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

  /* 🔒 v3.0: Force official nickname */
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
  const v = await verifySecret(request, env, headers);
  if (!v.ok) return v.response;
  const body = v.body;

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

/** 🔒 v3.0: Timing-safe string comparison */
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/** 🔒 v3.0: KV-based rate limiting */
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
    'Access-Control-Allow-Headers':     'Content-Type',
    'Access-Control-Max-Age':           '86400',
    'Vary':                              'Origin',
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



