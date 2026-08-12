/**
 * Cloudflare Worker — 滅蟲師傅 自建原生留言系統後端
 *
 * 架構：
 *   GET  /api/comments?page_id=xxx  → 讀取已審核留言
 *   POST /api/comments              → 提交新留言（暱稱 + 內容 + 圖片網址）
 *
 * 資料庫：Cloudflare D1（免費額度 5M reads + 100K writes/日）
 *
 * 部署步驟：
 *   1. 建立 D1 資料庫：
 *      npx wrangler d1 create comment-db
 *   2. 初始化資料表：
 *      npx wrangler d1 execute comment-db --remote --command="
 *        CREATE TABLE IF NOT EXISTS comments (
 *          id         INTEGER PRIMARY KEY AUTOINCREMENT,
 *          page_id    TEXT NOT NULL,
 *          nickname   TEXT NOT NULL,
 *          content    TEXT NOT NULL,
 *          image_url  TEXT DEFAULT '',
 *          thumb_url  TEXT DEFAULT '',
 *          approved   INTEGER DEFAULT 0,
 *          created_at TEXT DEFAULT (datetime('now','+8 hours')),
 *          client_ip  TEXT DEFAULT ''
 *        );
 *      "
 *   3. 更新 wrangler.toml 中 d1_databases 嘅 database_id
 *   4. 部署：npx wrangler deploy
 *   5. Worker URL = https://comment-handler.bruceleehk.workers.dev
 *
 * 審核方式：
 *   方式 A（推薦）— Cloudflare Dashboard → D1 → comment-db → Console：
 *     UPDATE comments SET approved = 1 WHERE id = <id>;
 *   方式 B — 用 wrangler CLI：
 *     npx wrangler d1 execute comment-db --remote --command="UPDATE comments SET approved=1 WHERE id=<id>"
 *   方式 C — 設定 ADMIN_SECRET 環境變量，用 Worker API 審核：
 *     POST /api/admin/approve  { id: <id>, secret: <ADMIN_SECRET> }
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
      /* ── 路由 ── */

      /* GET /api/comments — 讀取已審核留言 */
      if (request.method === 'GET' && url.pathname === '/api/comments') {
        return await handleGetComments(url, env, corsHeaders);
      }

      /* POST /api/comments — 提交新留言 */
      if (request.method === 'POST' && url.pathname === '/api/comments') {
        return await handlePostComment(request, env, corsHeaders);
      }

      /* POST /api/admin/approve — 審核留言 */
      if (request.method === 'POST' && url.pathname === '/api/admin/approve') {
        return await handleAdminApprove(request, env, corsHeaders);
      }

      /* 健康檢查 */
      if (url.pathname === '/api/health') {
        return jsonResponse({ status: 'ok', time: new Date().toISOString() }, 200, corsHeaders);
      }

      return jsonResponse({ error: 'Not found' }, 404, corsHeaders);

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

/* ===== GET /api/comments ===== */
async function handleGetComments(url, env, corsHeaders) {
  const pageId = url.searchParams.get('page_id') || 'vote-page-2026';
  const limit  = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const db = env.DB;
  if (!db) {
    return jsonResponse({ success: false, error: 'D1 資料庫未綁定' }, 500, corsHeaders);
  }

  const results = await db
    .prepare('SELECT id, nickname, content, image_url, thumb_url, created_at FROM comments WHERE page_id = ? AND approved = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .bind(pageId, limit, offset)
    .all();

  /* 計算總數 */
  const countResult = await db
    .prepare('SELECT COUNT(*) as total FROM comments WHERE page_id = ? AND approved = 1')
    .bind(pageId)
    .first();

  return jsonResponse({
    success: true,
    comments: results.results || [],
    total: countResult ? countResult.total : 0,
    limit,
    offset
  }, 200, corsHeaders);
}

/* ===== POST /api/comments ===== */
async function handlePostComment(request, env, corsHeaders) {
  const db = env.DB;
  if (!db) {
    return jsonResponse({ success: false, error: 'D1 資料庫未綁定' }, 500, corsHeaders);
  }

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

  /* 防止 XSS：基本 HTML 標籤移除 */
  const safeNickname = sanitize(nickname);
  const safeContent  = sanitize(content);

  /* URL 格式驗證 */
  const safeImageUrl = isValidUrl(imageUrl) ? imageUrl : '';
  const safeThumbUrl = isValidUrl(thumbUrl) ? thumbUrl : '';

  /* ── 簡易速率限制：同 IP 60 秒內最多 1 條 ── */
  const clientIp = request.headers.get('CF-Connecting-IP') || '';
  if (clientIp && env.DB) {
    const recent = await db
      .prepare("SELECT id FROM comments WHERE client_ip = ? AND created_at > datetime('now','+8 hours','-60 seconds')")
      .bind(clientIp)
      .first();
    if (recent) {
      return jsonResponse({
        success: false,
        error: '提交太頻繁，請等 1 分鐘後再試',
        code: 'RATE_LIMITED'
      }, 429, corsHeaders);
    }
  }

  /* ── 寫入 D1 ── */
  await db
    .prepare('INSERT INTO comments (page_id, nickname, content, image_url, thumb_url, client_ip) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(pageId, safeNickname, safeContent, safeImageUrl, safeThumbUrl, clientIp)
    .run();

  return jsonResponse({
    success: true,
    message: '留言已提交！首次留言需經審核先會公開顯示。'
  }, 200, corsHeaders);
}

/* ===== POST /api/admin/approve ===== */
async function handleAdminApprove(request, env, corsHeaders) {
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

  const id = parseInt(body.id);
  if (!id || id < 1) {
    return jsonResponse({ success: false, error: '無效嘅留言 ID' }, 400, corsHeaders);
  }

  await env.DB
    .prepare('UPDATE comments SET approved = 1 WHERE id = ?')
    .bind(id)
    .run();

  return jsonResponse({ success: true, message: '留言 #' + id + ' 已審核通過' }, 200, corsHeaders);
}

/* ===== 工具函數 ===== */

/** 基本文字消毒：移除 HTML 標籤 */
function sanitize(str) {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** URL 格式驗證 */
function isValidUrl(str) {
  if (!str) return false;
  try {
    const u = new URL(str);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

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
