/**
 * Cloudflare Worker — 滅蟲師傅 自建原生留言系統後端（直出＋IP 防護版 v5.0 — 2026-10-07）
 *
 * v5.0 升級亮點（苦主討論區「即時公開」制）：
 * 🚀 留言直出：通過數學驗證＋防護檢查後即時公開（approved: 1），取消人工審核
 * 🛡️ IP 發言配額：同一 IP 每小時限發 1 則（冷卻 3600 秒）＋每日限 3 則（香港時區日重置）
 * 🚫 IP 封鎖名單：管理員一鍵「刪除並封鎖 IP」；被封鎖 IP 無法發言，前台表單自動隱藏
 *    新端點：POST /api/admin/banip ／ /api/admin/unbanip ／ /api/admin/banlist
 * 🌐 雙語化：錯誤訊息支援 HK 中文 + English
 * 🔧 繼承全部安全防護：
 * - Honeypot 防機器人（靜默丟棄）
 * - 數學驗證（伺服器端覆核）
 * - safeCompare 防側信道攻擊
 * - 遞迴刪除所有後代回覆
 * - 24h Vote Cooldown（投票系統）
 * 🔧 修復：admin 系列端點雙重 KV 讀取（讀取一次入變數，提升可靠性）
 */

const MAX_REQUEST_BYTES = 5_500_000;
const MAX_IMAGE_URL_LEN = 5_500_000;
const PAGE_ID_PATTERN   = /^[A-Za-z0-9_-]{1,64}$/;
const COMMENT_TTL_SEC   = 15_552_000;

/* ===== v5.0: 發言配額 — 同一 IP 每小時 1 則 ＋ 每日 3 則 ===== */
const POST_COOLDOWN_SEC = 3600;   // 兩次發言至少相隔 1 小時
const POST_DAILY_MAX    = 3;      // 每日上限 3 則（香港時區日重置）
const DAILY_TTL_SEC     = 86400;  // 日計數 key 保留 24 小時（key 含日期自動輪換）
const IP_BLACKLIST_KEY  = 'ipblacklist';  // KV 黑名單（無 TTL，永久生效直至解除）

/* ===== v4.1: 投票系統設定 ===== */
const VOTE_TTL_SEC      = 15_552_000; // 票數保留 6 個月
const VOTE_COOLDOWN_TTL = 86400;      // IP 防刷：24 小時內同 IP 不能投同一害蟲兩次
const PEST_ID_PATTERN   = /^[a-z0-9_]{1,32}$/;
const VALID_PEST_IDS    = new Set([
  'cockroach_german', 'cockroach_american', 'bedbug', 'termite',
  'rat', 'mosquito', 'ant', 'wasp', 'flea', 'silverfish',
  'powderpost_beetle', 'psocid'
]);

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
      'http://localhost:8808',
      'http://127.0.0.1:8808',
    ]);

    const origin = request.headers.get('Origin') || '';
    const corsOrigin = allowedOrigins.has(origin) ? origin : '';

    const corsHeaders = buildCorsHeaders(corsOrigin);

    /* Preflight */
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    /* Reject oversized requests immediately */
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
        return jsonResponse({
          status: kv ? 'ok' : 'degraded',
          kv_bound: !!kv,
          admin_secret_set: !!env.ADMIN_SECRET,
          version: '5.0',
          features: ['nested_reply', 'pin', 'captcha', 'recursive_delete', 'auto_publish', 'ip_blacklist', 'quota_1h_daily3', 'honeypot', 'vote_system', 'bilingual_errors'],
          time: new Date().toISOString()
        }, 200, securityHeaders);
      }

      if (!kv) {
        return jsonResponse({
          success: false,
          error: 'KV 資料庫未綁定 / KV namespace not bound',
          error_zh: 'KV 資料庫未綁定，請先建立 KV Namespace 並更新 wrangler.toml',
          error_en: 'KV namespace not bound. Please create a KV Namespace and update wrangler.toml.',
          code: 'KV_NOT_BOUND'
        }, 503, securityHeaders);
      }

      /* ===== 留言系統 API ===== */
      if (request.method === 'GET' && url.pathname === '/api/comments') {
        return await handleGetComments(request, url, kv, securityHeaders);
      }
      if (request.method === 'POST' && url.pathname === '/api/comments') {
        return await handlePostComment(request, kv, env, securityHeaders);
      }

      /* ===== v4.1: 投票系統 API ===== */
      if (request.method === 'GET' && url.pathname === '/api/votes') {
        return await handleGetVotes(kv, securityHeaders);
      }
      if (request.method === 'POST' && url.pathname === '/api/vote') {
        return await handlePostVote(request, kv, env, securityHeaders);
      }

      /* ===== 管理員 API ===== */
      if (request.method === 'POST' && url.pathname === '/api/admin/test') {
        return await handleAdminTest(request, env, securityHeaders);
      }
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

      /* ===== v5.0: IP 封鎖名單 API ===== */
      if (request.method === 'POST' && url.pathname === '/api/admin/banip') {
        return await handleAdminBanIp(request, kv, env, securityHeaders);
      }
      if (request.method === 'POST' && url.pathname === '/api/admin/unbanip') {
        return await handleAdminUnbanIp(request, kv, env, securityHeaders);
      }
      if (request.method === 'POST' && url.pathname === '/api/admin/banlist') {
        return await handleAdminBanlist(request, kv, env, securityHeaders);
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
 * v4.1 優化：投票系統核心函數 (DRY)
 * ========================================================================= */
async function fetchAllVotes(kv) {
  const pestIds = Array.from(VALID_PEST_IDS);
  const results = await Promise.all(
    pestIds.map(async (id) => {
      const count = parseInt((await kv.get('vote:' + id)) || '0', 10);
      return { pest_id: id, votes: count };
    })
  );
  return results;
}

async function handleGetVotes(kv, headers) {
  const results = await fetchAllVotes(kv);
  results.sort((a, b) => b.votes - a.votes);
  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

  return jsonResponse({
    success: true,
    total_votes: totalVotes,
    pest_count: results.length,
    votes: results,
    time: new Date().toISOString()
  }, 200, headers);
}

async function handlePostVote(request, kv, env, headers) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return jsonResponse({
      success: false,
      error: '無效嘅請求格式 / Invalid request format',
      code: 'INVALID_JSON'
    }, 400, headers);
  }

  const pestId = String(body.pest_id || '').toLowerCase().trim();

  if (!pestId || !PEST_ID_PATTERN.test(pestId)) {
    return jsonResponse({
      success: false,
      error_zh: '無效嘅害蟲識別（pest_id）',
      error_en: 'Invalid pest_id (must be lowercase alphanumeric + underscore)',
      code: 'INVALID_PEST_ID'
    }, 400, headers);
  }

  if (!VALID_PEST_IDS.has(pestId)) {
    return jsonResponse({
      success: false,
      error_zh: '未知嘅害蟲類型：' + pestId,
      error_en: 'Unknown pest type: ' + pestId,
      code: 'UNKNOWN_PEST_ID',
      valid_pest_ids: Array.from(VALID_PEST_IDS)
    }, 400, headers);
  }

  const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1';
  const voteLockKey = 'voted:' + clientIp + ':' + pestId;
  const alreadyVoted = await kv.get(voteLockKey);

  if (alreadyVoted) {
    return jsonResponse({
      success: false,
      error_zh: '同一天內已經投過呢個害蟲啦，請 24 小時後再試',
      error_en: 'You have already voted for this pest within the last 24 hours.',
      code: 'ALREADY_VOTED',
      pest_id: pestId,
      cooldown_seconds: VOTE_COOLDOWN_TTL
    }, 429, headers);
  }

  // v4.1 效能優化：先拉取一次總數據，並計算出新數據，省去寫入後再次讀取
  const allVotes = await fetchAllVotes(kv);
  const target = allVotes.find(v => v.pest_id === pestId);
  const newCount = (target ? target.votes : 0) + 1;

  // 寫入新票數與 IP 防刷紀錄
  await kv.put('vote:' + pestId, newCount.toString(), { expirationTtl: VOTE_TTL_SEC });
  
  try {
    await kv.put(voteLockKey, '1', { expirationTtl: VOTE_COOLDOWN_TTL });
  } catch (e) {
    console.warn('Failed to write vote lock:', e.message);
  }

  // 記憶體中直接更新數據並排序，準備回傳給前端
  const updatedVotes = allVotes.map(v => 
    v.pest_id === pestId ? { ...v, votes: newCount } : v
  ).sort((a, b) => b.votes - a.votes);
  
  const totalVotes = updatedVotes.reduce((sum, r) => sum + r.votes, 0);

  return jsonResponse({
    success: true,
    message_zh: '多謝你嘅一票！投票已記錄。',
    message_en: 'Thanks for your vote! It has been recorded.',
    pest_id: pestId,
    new_count: newCount,
    total_votes: totalVotes,
    votes: updatedVotes, // 前端可以直接用這個數據更新圖表，無須再次 Fetch
    cooldown_seconds: VOTE_COOLDOWN_TTL,
    time: new Date().toISOString()
  }, 200, headers);
}


/* =========================================================================
 * 留言與管理員核心邏輯 (繼承 v3.1 完整安全機制)
 * ========================================================================= */

async function handleGetComments(request, url, kv, headers) {
  const pageId = url.searchParams.get('page_id') || 'vote-page-2026';
  if (!PAGE_ID_PATTERN.test(pageId)) {
    return jsonResponse({ success: false, error: '無效嘅頁面識別' }, 400, headers);
  }

  const allComments = await readComments(kv, pageId);

  /* v5.0: 封鎖名單內嘅訪客 — 通知前台隱藏留言表單 */
  const clientIp = request.headers.get('CF-Connecting-IP') || '';
  const viewerBanned = clientIp ? await isIpBanned(kv, clientIp) : false;

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
    total_replies: replies.length,
    viewer_banned: viewerBanned
  }, 200, headers);
}

async function handlePostComment(request, kv, env, headers) {
  let body;
  try {
    const cloned = request.clone();
    body = await request.json();
    const text = await cloned.text();
    if (text.length > MAX_REQUEST_BYTES) throw new Error();
  } catch {
    return jsonResponse({ success: false, error: '無效嘅請求格式' }, 400, headers);
  }

  /* Honeypot — 靜默丟棄機器人（回傳假成功，唔消耗配額） */
  if (body.website_url && String(body.website_url).trim()) {
    return jsonResponse({
      success: true,
      message: '留言已提交！',
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

  if (!pageId || !PAGE_ID_PATTERN.test(pageId)) return jsonResponse({ success: false, error: '無效嘅頁面識別' }, 400, headers);
  if (!nickname || nickname.length < 1 || nickname.length > 30) return jsonResponse({ success: false, error: '暱稱長度需為 1-30 字' }, 400, headers);
  if (isReply && (content.length < 10 || content.length > 300)) return jsonResponse({ success: false, error: '回覆字數需為 10-300 字', code: 'REPLY_LENGTH' }, 400, headers);
  if (!isReply && (content.length < 1 || content.length > 2000)) return jsonResponse({ success: false, error: '留言內容長度需為 1-2000 字' }, 400, headers);

  if (Number.isNaN(captchaA) || Number.isNaN(captchaB) || Number.isNaN(captchaAns)) return jsonResponse({ success: false, error: '請完成數學驗證', code: 'CAPTCHA_MISSING' }, 400, headers);
  if (captchaA < 1 || captchaA > 20 || captchaB < 1 || captchaB > 20) return jsonResponse({ success: false, error: '數學驗證異常', code: 'CAPTCHA_INVALID' }, 400, headers);
  if (captchaA + captchaB !== captchaAns) return jsonResponse({ success: false, error: '數學驗證答案錯誤', code: 'CAPTCHA_WRONG' }, 400, headers);

  if (isReply && (imageUrl || thumbUrl)) return jsonResponse({ success: false, error: '回覆嚴禁附加圖片', code: 'REPLY_NO_IMAGE' }, 400, headers);

  if (!isReply) {
    if (imageUrl.length > MAX_IMAGE_URL_LEN || thumbUrl.length > MAX_IMAGE_URL_LEN) return jsonResponse({ success: false, error: '圖片檔案過大' }, 400, headers);
    if (imageUrl && !isValidImageUrl(imageUrl)) return jsonResponse({ success: false, error: '圖片格式無效' }, 400, headers);
    if (thumbUrl && !isValidImageUrl(thumbUrl)) return jsonResponse({ success: false, error: '縮圖格式無效' }, 400, headers);
  }

  const bodySecret = body && body.secret;
  const isAdmin = !!(bodySecret && env.ADMIN_SECRET && safeCompare(String(bodySecret).trim(), String(env.ADMIN_SECRET).trim()));
  const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1';

  /* v5.0: IP 封鎖名單檢查（管理員豁免）— 被封鎖 IP 直接 403，連驗證都唔使做 */
  if (!isAdmin) {
    const banned = await isIpBanned(kv, clientIp);
    if (banned) {
      return jsonResponse({
        success: false,
        error: '你嘅網絡 IP 已被封鎖，無法發佈留言。如有異議，歡迎透過 WhatsApp 或電話聯絡我們。',
        error_en: 'Your network IP has been banned from posting. Contact us via WhatsApp or phone if you think this is a mistake.',
        code: 'IP_BANNED'
      }, 403, headers);
    }
  }

  /* v5.0: 發言配額檢查 — 1 小時冷卻 ＋ 每日 3 則（管理員豁免；驗證全過才檢查，失敗唔會消耗配額） */
  let quota = null;
  if (!isAdmin) {
    quota = await checkPostQuota(kv, clientIp);
    if (!quota.allowed) {
      const isDaily = quota.reason === 'daily';
      return jsonResponse({
        success: false,
        error: isDaily
          ? '今日發言次數已達上限（每日 3 則），請明天再嚟留言！'
          : `發言過於頻繁，請喺 ${quota.retryMinutes} 分鐘後再試（每小時限發 1 則）。`,
        error_en: isDaily
          ? "You've reached today's limit of 3 posts. Please come back tomorrow!"
          : `You are posting too frequently. Please try again in ${quota.retryMinutes} minute(s). (1 post per hour)`,
        code: isDaily ? 'DAILY_LIMIT_REACHED' : 'COOLDOWN_ACTIVE',
        retry_after: quota.retryAfter
      }, 429, headers);
    }
  }

  const safeNickname = sanitize(nickname);
  let safeContent    = sanitize(content);
  const safeImageUrl = isValidImageUrl(imageUrl) ? imageUrl : '';
  const safeThumbUrl = isValidImageUrl(thumbUrl) ? thumbUrl : '';

  if (isReply) safeContent = maskUrls(safeContent);

  const key = 'comments:' + pageId;
  const raw = await kv.get(key, { type: 'json' });
  const comments = Array.isArray(raw) ? raw : [];

  if (isReply && !comments.find(c => c.id === parentId && c.approved === 1)) {
    return jsonResponse({ success: false, error: '父留言不存在或未審核', code: 'PARENT_NOT_FOUND' }, 400, headers);
  }

  const newComment = {
    id:         Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    nickname:   safeNickname,
    content:    safeContent,
    image_url:  safeImageUrl,
    thumb_url:  safeThumbUrl,
    approved:   1,
    created_at: new Date().toISOString(),
    created_at_hk: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Hong_Kong' }),
    client_ip:  clientIp,
    parent_id:  isReply ? parentId : '',
    is_reply:   isReply
  };

  comments.push(newComment);
  await kv.put(key, JSON.stringify(comments), { expirationTtl: COMMENT_TTL_SEC });

  /* v5.0: 發言成功 → 記錄配額（1 小時冷卻 ＋ 日計數 +1）；記錄失敗唔影響留言 */
  if (!isAdmin && quota) {
    try { await recordPostQuota(kv, quota); } catch (e) { console.warn('Failed to record post quota:', e.message); }
  }

  return jsonResponse({
    success: true,
    message: '發佈成功！留言已即時公開顯示。',
    message_en: 'Published! Your comment is now live.',
    comment_id: newComment.id,
    parent_id: newComment.parent_id
  }, 200, headers);
}

/* =========================================================================
 * 管理員系列函數
 * ========================================================================= */
async function verifySecret(request, env, headers) {
  if (!env.ADMIN_SECRET) {
    return { ok: false, response: jsonResponse({ success: false, error: '未設定 ADMIN_SECRET' }, 403, headers) };
  }
  let body;
  try { body = await request.json(); } catch { return { ok: false, response: jsonResponse({ success: false, error: '無效格式' }, 400, headers) }; }
  const providedSecret = String(body.secret || '').trim();
  if (!providedSecret) return { ok: false, body, response: jsonResponse({ success: false, error: '未提供密鑰' }, 400, headers) };
  if (!safeCompare(providedSecret, String(env.ADMIN_SECRET).trim())) return { ok: false, body, response: jsonResponse({ success: false, error: '密鑰錯誤' }, 403, headers) };
  return { ok: true, body };
}

async function handleAdminTest(request, env, headers) {
  const v = await verifySecret(request, env, headers);
  if (!v.ok) return v.response;
  return jsonResponse({ success: true, message: '密鑰驗證通過' }, 200, headers);
}

async function handleAdminList(url, request, kv, env, headers) {
  const v = await verifySecret(request, env, headers);
  if (!v.ok) return v.response;
  const pageId = url.searchParams.get('page_id') || v.body.page_id || 'vote-page-2026';
  const comments = await readComments(kv, pageId);
  
  const sorted = comments.sort((a, b) => {
    if ((a.approved === 0) !== (b.approved === 0)) return a.approved === 0 ? -1 : 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });
  return jsonResponse({ success: true, comments: sorted, total: sorted.length }, 200, headers);
}

async function handleAdminApprove(request, kv, env, headers) {
  const v = await verifySecret(request, env, headers);
  if (!v.ok) return v.response;
  const targetId = String(v.body.id || '');
  const pageId = v.body.page_id || 'vote-page-2026';
  
  const comments = await readComments(kv, pageId);
  const target = comments.find(c => c.id === targetId);
  if (!target) return jsonResponse({ success: false, error: '找不到留言' }, 404, headers);
  
  target.approved = 1;
  await kv.put('comments:' + pageId, JSON.stringify(comments), { expirationTtl: COMMENT_TTL_SEC });
  return jsonResponse({ success: true, message: '已審核', comment: target }, 200, headers);
}

async function handleAdminDelete(request, kv, env, headers) {
  const v = await verifySecret(request, env, headers);
  if (!v.ok) return v.response;
  const targetId = String(v.body.id || '');
  const pageId = v.body.page_id || 'vote-page-2026';
  
  const comments = await readComments(kv, pageId);
  
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
  await kv.put('comments:' + pageId, JSON.stringify(remaining), { expirationTtl: COMMENT_TTL_SEC });
  return jsonResponse({ success: true, deleted_ids: Array.from(toDelete) }, 200, headers);
}

async function handleAdminReply(request, kv, env, headers) {
  const v = await verifySecret(request, env, headers);
  if (!v.ok) return v.response;
  const { parent_id, content, page_id = 'vote-page-2026' } = v.body;
  
  const comments = await readComments(kv, page_id);
  if (!comments.find(c => c.id === parent_id)) return jsonResponse({ success: false, error: '父留言不存在' }, 404, headers);

  const newReply = {
    id: 'official-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    nickname: '滅蟲師傅',
    content: maskUrls(sanitize(content)),
    approved: 1, is_official: true, is_reply: true, parent_id,
    created_at: new Date().toISOString(),
    created_at_hk: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Hong_Kong' }),
    client_ip: 'admin'
  };

  comments.push(newReply);
  await kv.put('comments:' + page_id, JSON.stringify(comments), { expirationTtl: COMMENT_TTL_SEC });
  return jsonResponse({ success: true, reply: newReply }, 200, headers);
}

async function handleAdminPin(request, kv, env, headers) {
  const v = await verifySecret(request, env, headers);
  if (!v.ok) return v.response;
  const { id, pin, page_id = 'vote-page-2026' } = v.body;
  
  const comments = await readComments(kv, page_id);
  const target = comments.find(c => c.id === id);
  if (!target) return jsonResponse({ success: false, error: '找不到留言' }, 404, headers);
  
  if (pin) {
    comments.forEach(c => { if (c.is_pinned) delete c.is_pinned; });
    target.is_pinned = true;
  } else {
    delete target.is_pinned;
  }

  await kv.put('comments:' + page_id, JSON.stringify(comments), { expirationTtl: COMMENT_TTL_SEC });
  return jsonResponse({ success: true, comment: target }, 200, headers);
}

/* =========================================================================
 * v5.0: IP 封鎖名單管理（刪除並封鎖 / 手動封鎖 / 解除 / 列表）
 * ========================================================================= */
async function handleAdminBanIp(request, kv, env, headers) {
  const v = await verifySecret(request, env, headers);
  if (!v.ok) return v.response;
  const pageId = (v.body.page_id || 'vote-page-2026').trim();
  const noteRaw = String(v.body.note || '').trim().slice(0, 100);
  let ip = '';
  let deletedIds = [];

  if (v.body.id) {
    /* 刪除並封鎖：由留言 ID 反查 client_ip → 遞迴刪除 → 封鎖 */
    const targetId = String(v.body.id);
    const comments = await readComments(kv, pageId);
    const target = comments.find(c => c.id === targetId);
    if (!target) return jsonResponse({ success: false, error: '找不到留言' }, 404, headers);
    ip = String(target.client_ip || '').trim();

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
    await kv.put('comments:' + pageId, JSON.stringify(remaining), { expirationTtl: COMMENT_TTL_SEC });
    deletedIds = Array.from(toDelete);
  } else {
    /* 手動封鎖：直接指定 IP */
    ip = String(v.body.ip || '').trim();
  }

  if (!isValidIp(ip)) {
    return jsonResponse({ success: false, error: '無效嘅 IP 地址：' + (ip || '（空白）'), code: 'INVALID_IP' }, 400, headers);
  }

  const list = await getBlacklist(kv);
  const alreadyBanned = !!list[ip];
  list[ip] = {
    banned_at: new Date().toISOString(),
    note: sanitize(noteRaw) || (deletedIds.length ? '來自「刪除並封鎖」操作' : '手動封鎖'),
    comment_id: deletedIds[0] || ''
  };
  await kv.put(IP_BLACKLIST_KEY, JSON.stringify(list));

  return jsonResponse({
    success: true,
    message: alreadyBanned ? `IP ${ip} 本身已喺封鎖名單內（已更新記錄）` : `已封鎖 IP ${ip}${deletedIds.length ? `，並刪除 ${deletedIds.length} 則留言` : ''}`,
    message_en: alreadyBanned ? `IP ${ip} was already banned (record updated)` : `IP ${ip} has been banned`,
    banned_ip: ip,
    already_banned: alreadyBanned,
    deleted_count: deletedIds.length,
    deleted_ids: deletedIds,
    blacklist_total: Object.keys(list).length
  }, 200, headers);
}

async function handleAdminUnbanIp(request, kv, env, headers) {
  const v = await verifySecret(request, env, headers);
  if (!v.ok) return v.response;
  const ip = String(v.body.ip || '').trim();
  if (!ip) return jsonResponse({ success: false, error: '未提供 IP' }, 400, headers);

  const list = await getBlacklist(kv);
  if (!list[ip]) return jsonResponse({ success: false, error: `IP ${ip} 唔喺封鎖名單內` , code: 'IP_NOT_BANNED' }, 404, headers);
  delete list[ip];
  await kv.put(IP_BLACKLIST_KEY, JSON.stringify(list));

  return jsonResponse({
    success: true,
    message: `已解除封鎖 IP ${ip}`,
    message_en: `IP ${ip} has been unbanned`,
    unbanned_ip: ip,
    blacklist_total: Object.keys(list).length
  }, 200, headers);
}

async function handleAdminBanlist(request, kv, env, headers) {
  const v = await verifySecret(request, env, headers);
  if (!v.ok) return v.response;
  const list = await getBlacklist(kv);
  const entries = Object.keys(list).map(ip => ({ ip, ...list[ip] }))
    .sort((a, b) => new Date(b.banned_at || 0) - new Date(a.banned_at || 0));
  return jsonResponse({ success: true, banned: entries, total: entries.length }, 200, headers);
}

/* =========================================================================
 * 共用工具函數
 * ========================================================================= */
function sanitize(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function isValidImageUrl(str) {
  if (!str) return false;
  if (/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(str)) return true;
  try { return new URL(str).protocol === 'https:'; } catch { return false; }
}

function maskUrls(text) {
  return text.replace(/\b(https?:\/\/|ftp:\/\/|www\.)\S+/gi, '***')
             .replace(/\b[a-z0-9-]+\.(com|net|org|io|hk|tw|cn|info|biz|cc|tv|me|club|xyz|top)\b\/?\S*/gi, '***');
}

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

/* =========================================================================
 * v5.0: 讀取 / 配額 / 封鎖名單工具
 * ========================================================================= */
function readComments(kv, pageId) {
  return kv.get('comments:' + pageId, { type: 'json' }).then(raw =>
    Array.isArray(raw) ? raw : []
  );
}

function getBlacklist(kv) {
  return kv.get(IP_BLACKLIST_KEY, { type: 'json' }).then(raw =>
    (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {}
  );
}

async function isIpBanned(kv, ip) {
  if (!ip) return false;
  const list = await getBlacklist(kv);
  return !!list[ip];
}

function isValidIp(ip) {
  if (!ip || typeof ip !== 'string') return false;
  if (ip === 'admin' || ip === '127.0.0.1') return false;
  const v4m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4m) return v4m.slice(1).every(oct => parseInt(oct, 10) <= 255);
  const v6 = ip.includes(':') && /^[0-9a-fA-F:]{3,45}$/.test(ip);
  return v6;
}

/**
 * v5.0: 發言配額 — 同一 IP 每小時限發 1 則 ＋ 每日限 3 則（香港時區日重置）
 * 只檢查不寫入；發言成功後由 recordPostQuota 記錄，失敗提交唔會消耗配額。
 */
async function checkPostQuota(kv, ip) {
  /* 1. 一小時冷卻：距離上次成功發言不足 3600 秒 → 攔截 */
  const coolKey = 'cool:' + ip;
  const lastTs = parseInt(await kv.get(coolKey) || '0', 10);
  if (lastTs > 0) {
    const elapsed = Math.floor(Date.now() / 1000) - lastTs;
    if (elapsed < POST_COOLDOWN_SEC) {
      const retryAfter = POST_COOLDOWN_SEC - elapsed;
      return {
        allowed: false,
        reason: 'cooldown',
        retryAfter,
        retryMinutes: Math.max(1, Math.ceil(retryAfter / 60))
      };
    }
  }

  /* 2. 每日 3 次上限：key 含香港時區日期，跨日自動重置 */
  const hkDate = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Hong_Kong' }).slice(0, 10).replace(/-/g, '');
  const dayKey = 'dcount:' + ip + ':' + hkDate;
  const count = parseInt(await kv.get(dayKey) || '0', 10);
  if (count >= POST_DAILY_MAX) {
    return {
      allowed: false,
      reason: 'daily',
      retryAfter: secondsUntilHkMidnight(),
      retryMinutes: Math.max(1, Math.ceil(secondsUntilHkMidnight() / 60))
    };
  }

  return { allowed: true, coolKey, dayKey, nextCount: count + 1 };
}

/** 發言成功後記錄配額：寫入冷卻時間戳 ＋ 日計數 +1 */
async function recordPostQuota(kv, quota) {
  await kv.put(quota.coolKey, Math.floor(Date.now() / 1000).toString(), { expirationTtl: POST_COOLDOWN_SEC });
  await kv.put(quota.dayKey, String(quota.nextCount), { expirationTtl: DAILY_TTL_SEC });
}

/** 距離香港時區午夜嘅秒數（每日上限重置倒數用） */
function secondsUntilHkMidnight() {
  try {
    const nowHkStr = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Hong_Kong' });
    const nowHk = new Date(nowHkStr.replace(' ', 'T'));
    const midnight = new Date(nowHk);
    midnight.setHours(24, 0, 0, 0);
    return Math.max(60, Math.floor((midnight - nowHk) / 1000));
  } catch {
    return 3600;
  }
}

function buildCorsHeaders(allowOrigin) {
  const h = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
  if (allowOrigin) {
    h['Access-Control-Allow-Origin'] = allowOrigin;
    h['Access-Control-Allow-Credentials'] = 'true';
  }
  return h;
}

function jsonResponse(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } });
}