/**
 * Cloudflare Worker — 滅蟲師傅 自建原生留言系統後端
 *
 * 架構：
 *   GET  /api/comments?page_id=xxx  → 讀取已審核留言
 *   POST /api/comments              → 提交新留言（暱稱 + 內容 + 圖片網址）
 *   GET  /api/health                → 健康檢查
 *
 * 資料庫：Cloudflare KV（免費額度 100K reads + 1K writes/日）
 *
 * ===== 部署步驟（只需 3 步）=====
 *
 *   步驟 1：建立 KV Namespace
 *     方法 A（Dashboard）：
 *       Cloudflare Dashboard → Workers & Pages → KV → Create a namespace
 *       名稱輸入：COMMENT_KV → 建立 → 複製 Namespace ID
 *     方法 B（CLI）：
 *       npx wrangler kv namespace create COMMENT_KV
 *       → 複製輸出嘅 id
 *
 *   步驟 2：更新 wrangler.toml
 *     將 kv_namespaces 入面嘅 id 替換為步驟 1 複製嘅 Namespace ID
 *
 *   步驟 3：部署 Worker
 *     npx wrangler deploy
 *     → Worker URL = https://comment-handler.bruceleehk.workers.dev
 *
 * ===== 審核方式 =====
 *   設定 ADMIN_SECRET：npx wrangler secret put ADMIN_SECRET
 *   POST /api/admin/approve  body: { "id": "留言ID", "secret": "你嘅密鑰" }
 *   POST /api/admin/list     body: { "secret": "你嘅密鑰" }  → 列出所有留言（含未審核）
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

      /* GET /api/comments — 讀取已審核留言 */
      if (request.method === 'GET' && url.pathname === '/api/comments') {
        return await handleGetComments(url, kv, corsHeaders);
      }

      /* POST /api/comments — 提交新留言 */
      if (request.method === 'POST' && url.pathname === '/api/comments') {
        return await handlePostComment(request, kv, corsHeaders);
      }

      /* POST /api/admin/approve — 審核留言 */
      if (request.method === 'POST' && url.pathname === '/api/admin/approve') {
        return await handleAdminApprove(request, kv, env, corsHeaders);
      }

      /* POST /api/admin/list — 列出所有留言（含未審核） */
      if (request.method === 'POST' && url.pathname === '/api/admin/list') {
        return await handleAdminList(url, kv, env, corsHeaders);
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

/* ===== GET /api/comments ===== */
async function handleGetComments(url, kv, corsHeaders) {
  const pageId = url.searchParams.get('page_id') || 'vote-page-2026';
  const key = 'comments:' + pageId;

  const raw = await kv.get(key, { type: 'json' });
  const allComments = Array.isArray(raw) ? raw : [];

  /* 只返回已審核嘅留言，最新排前 */
  const approved = allComments
    .filter(c => c.approved === 1)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return jsonResponse({
    success: true,
    comments: approved,
    total: approved.length
  }, 200, corsHeaders);
}

/* ===== POST /api/comments ===== */
async function handlePostComment(request, kv, corsHeaders) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: '無效嘅請求格式' }, 400, corsHeaders);
  }

  /* ── 欄位驗證 ── */
  const pageId   = (body.page_id   || '').trim();
  const nickname = (body.nickname   || '').trim();
  const content  = (body.content    || '').trim();
  const imageUrl = (body.image_url  || '').trim();
  const thumbUrl = (body.thumb_url  || '').trim();

  if (!pageId || pageId.length > 64) {
    return jsonResponse({ success: false, error: '無效嘅頁面識別' }, 400, corsHeaders);
  }
  if (!nickname || nickname.length < 1 || nickname.length > 30) {
    return jsonResponse({ success: false, error: '暱稱長度需為 1-30 字' }, 400, corsHeaders);
  }
  if (!content || content.length < 1 || content.length > 2000) {
    return jsonResponse({ success: false, error: '留言內容長度需為 1-2000 字' }, 400, corsHeaders);
  }
  if (imageUrl.length > 500 || thumbUrl.length > 500) {
    return jsonResponse({ success: false, error: '圖片網址過長' }, 400, corsHeaders);
  }

  /* 防止 XSS */
  const safeNickname = sanitize(nickname);
  const safeContent  = sanitize(content);
  const safeImageUrl = isValidUrl(imageUrl) ? imageUrl : '';
  const safeThumbUrl = isValidUrl(thumbUrl) ? thumbUrl : '';

  /* ── 讀取現有留言 ── */
  const key = 'comments:' + pageId;
  const raw = await kv.get(key, { type: 'json' });
  const comments = Array.isArray(raw) ? raw : [];

  /* ── 簡易速率限制：同 IP 60 秒內最多 1 條 ── */
  const clientIp = request.headers.get('CF-Connecting-IP') || '';
  if (clientIp) {
    const recent = comments.find(c =>
      c.client_ip === clientIp &&
      Date.now() - new Date(c.created_at).getTime() < 60000
    );
    if (recent) {
      return jsonResponse({
        success: false,
        error: '提交太頻繁，請等 1 分鐘後再試',
        code: 'RATE_LIMITED'
      }, 429, corsHeaders);
    }
  }

  /* ── 新增留言 ── */
  const newComment = {
    id:         Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    nickname:   safeNickname,
    content:    safeContent,
    image_url:  safeImageUrl,
    thumb_url:  safeThumbUrl,
    approved:   0,
    created_at: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Hong_Kong' }),
    client_ip:  clientIp
  };

  comments.push(newComment);

  /* 寫入 KV（TTL 180 日） */
  await kv.put(key, JSON.stringify(comments), { expirationTtl: 15552000 });

  return jsonResponse({
    success: true,
    message: '留言已提交！首次留言需經審核先會公開顯示。'
  }, 200, corsHeaders);
}

/* ===== POST /api/admin/approve ===== */
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

  return jsonResponse({ success: true, message: '留言 ' + targetId + ' 已審核通過' }, 200, corsHeaders);
}

/* ===== POST /api/admin/list ===== */
async function handleAdminList(url, kv, env, corsHeaders) {
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

  return jsonResponse({
    success: true,
    comments: comments,
    total: comments.length,
    pending: comments.filter(c => c.approved === 0).length
  }, 200, corsHeaders);
}

/* ===== 工具函數 ===== */

function sanitize(str) {
  return str
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

function jsonResponse(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}
