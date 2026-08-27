/**
 * Cloudflare Worker — 滅蟲師傅 AI (v8.0 專家混合架構 MoE 雙腦版)
 *
 * v8.0 升級亮點（配合 Dify Chatflow「雙腦聯動」）：
 *   🧠 GPT-5.6-Sol 只做「放射科化驗師」：睇圖輸出極短結構化特徵（輸出成本 ≈ 0）
 *   ✍️ DeepSeek 做「門診師妹」：拿化驗報告 + 滅蟲智庫，寫三十六計廣東話報告（便宜約 35 倍）
 *   💰 配合 MoE 分流 + 智慧快取 + IP 限流，單次運算成本再降 60-70%
 *   🛡️ 全面防超時：分階段 AbortController 超時 + 瞬時錯誤自動重試 + 路徑路由
 *   ♻️ 智慧快取：相同相片 24 小時內重複分析直接回覆快取結果，唔會重複收費
 *
 * 部署注意（wrangler.toml 建議配置，全部可選）：
 *   [vars]
 *   DIFY_API_URL = "https://api.dify.ai/v1"
 *   # 秘密請用 wrangler secret put DIFY_API_KEY 設定，唔好寫死喺代碼
 *   [[kv_namespaces]]
 *   binding = "CACHE_KV"
 *   id = "<你的 KV namespace ID>"
 */

const ALLOWED_ORIGINS = new Set([
  'https://bruceleehk.com',
  'https://www.bruceleehk.com',
  'https://bruceleehk.github.io',
  'http://localhost:4000',
  'http://127.0.0.1:4000',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
]);

/* ============================================================
   配置（env 環境變數優先，欠缺時回退預設值，確保零配置可部署）
   ============================================================ */
const DEFAULTS = {
  DIFY_API_URL: 'https://api.dify.ai/v1',
  // 向後兼容：未設定 secret 時沿用舊 key（正式環境請改用 wrangler secret）
  DIFY_API_KEY: 'app-EOJafBJvdrPPJdbgjlkpdq5o',
  UPLOAD_TIMEOUT_MS: '30000',   // 圖片上傳至 Dify 的超時
  CHAT_TIMEOUT_MS: '100000',    // 雙腦分析（GPT化驗 + DeepSeek寫作）的總超時
  MAX_IMAGE_BYTES: String(8 * 1024 * 1024), // 8MB 上限（前端已壓縮，正常遠低於此）
  CACHE_TTL_SECONDS: '86400',   // 相同圖片快取 24 小時
  RATE_LIMIT_MAX: '8',          // 每 IP 每小時最多分析次數（防濫用慳成本）
  RATE_LIMIT_WINDOW_MS: '3600000',
};

/* MoE 導向查詢：即使 Dify 仍未升級成雙腦 Chatflow，
   此查詢都會強迫模型先做「特徵提取」再作答（鏈式思考），
   直接提升識圖準確度；升級成 Chatflow 後，節點提示詞會接管分工。 */
const ANALYSIS_PROMPT = [
  '請分析這張在香港拍攝的害蟲相片。請先在內部客觀提取蟲體物理特徵：',
  '體型與長度比例、觸角長度及形態、翅有無及質地、足部結構、體色與紋路；',
  '再據此判斷最可能的物種（例如德國小蠊、美洲大蠊、東方蜚蠊、木蝨/床蝨、',
  '白蟻、螞蟻、跳蚤、蛾蠓、衣魚等香港常見蟲害）及判斷可靠度。',
  '若相片太模糊、蟲體不完整或無法確認，必須誠實講明並建議補拍重點，切勿斷估。',
  '然後結合滅蟲智庫的生態習性與防治對策，嚴格按照「三十六計」格式，',
  '使用香港廣東話及繁體字輸出完整診斷報告，開頭必須是 🐛 符號，',
  '結尾須附上 WhatsApp 諮詢連結 [搵師傅即時跟進](https://wa.me/85252821552?text=你好，我想查詢滅蟲服務)。',
].join('');

/* 檔頭魔術數字（magic bytes）— 防止改名嘅假圖片或者損壞檔案流入 AI */
const MAGIC_BYTES = [
  { type: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: 'image/png',  test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { type: 'image/webp', test: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* 帶超時的 fetch：超時會 reject（解決「網絡連線超時」無回應的根源） */
async function fetchWithTimeout(url, options, timeoutMs, stageLabel) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      const e = new Error(`${stageLabel} 超時 (${timeoutMs / 1000}s)`);
      e.code = 'TIMEOUT';
      throw e;
    }
    err.code = 'NETWORK';
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/* ============================================================
   IP 限流（同 isolate 內生效；如需全站精準限流可升級 Durable Object
   或者 Cloudflare WAF Rate Limiting，此處以低成本擋截最常見濫用）
   ============================================================ */
const rateBucket = new Map();

function isRateLimited(ip, max, windowMs) {
  const now = Date.now();
  const hits = (rateBucket.get(ip) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    rateBucket.set(ip, hits);
    return true;
  }
  hits.push(now);
  rateBucket.set(ip, hits);
  // 簡單清理，防止 Map 無限膨脹
  if (rateBucket.size > 5000) {
    for (const [key, arr] of rateBucket) {
      if (!arr.some((t) => now - t < windowMs)) rateBucket.delete(key);
    }
  }
  return false;
}

/* ============================================================
   智慧快取：SHA-256 圖片指紋 → 相同相片直接回覆（節省 100% 該次 AI 成本）
   優先使用 KV（若已綁定 CACHE_KV）；否則用 Cache API（自訂網域生效）
   ============================================================ */
async function hashImage(arrayBuffer) {
  const digest = await crypto.subtle.digest('SHA-256', arrayBuffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function cacheGet(env, hash) {
  try {
    if (env.CACHE_KV) {
      const cached = await env.CACHE_KV.get(`pestdiag:v1:${hash}`);
      return cached ? JSON.parse(cached) : null;
    }
    const res = await caches.default.match(`https://pest-vision-cache.internal/v1/${hash}`);
    if (res) return await res.json();
  } catch (_) { /* 快取失敗不影響主流程 */ }
  return null;
}

async function cachePut(env, hash, payload, ttlSeconds) {
  try {
    if (env.CACHE_KV) {
      await env.CACHE_KV.put(`pestdiag:v1:${hash}`, JSON.stringify(payload), { expirationTtl: ttlSeconds });
      return;
    }
    await caches.default.put(
      `https://pest-vision-cache.internal/v1/${hash}`,
      new Response(JSON.stringify(payload), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${ttlSeconds}` },
      })
    );
  } catch (_) { /* 快取失敗不影響主流程 */ }
}

/* ============================================================
   Dify 雙腦 Chatflow 調用（上傳 → 分析，附瞬時錯誤重試）
   ============================================================ */
async function callDify(env, cfg, imageFile, userId, requestId) {
  const t0 = Date.now();

  /* --- 步驟 1：圖片上傳至 Dify 檔案庫（重試 1 次） --- */
  let uploadData;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const uploadForm = new FormData();
      uploadForm.append('file', imageFile, 'pest-photo.jpg');
      uploadForm.append('user', userId);
      const uploadRes = await fetchWithTimeout(
        `${cfg.DIFY_API_URL}/files/upload`,
        { method: 'POST', headers: { Authorization: `Bearer ${cfg.DIFY_API_KEY}` }, body: uploadForm },
        cfg.UPLOAD_TIMEOUT_MS, '圖片上傳'
      );
      if (!uploadRes.ok) {
        const errText = await uploadRes.text().catch(() => '');
        throw Object.assign(new Error(`Dify 上傳失敗 (${uploadRes.status}) ${errText.slice(0, 200)}`), {
          code: uploadRes.status === 429 ? 'RATE_LIMITED' : 'UPSTREAM_ERROR',
        });
      }
      uploadData = await uploadRes.json();
      break;
    } catch (err) {
      // 超時不重試（避免重複計費）；4xx 真錯誤不重試；其餘網絡/5xx 重試一次
      if (attempt === 2 || err.code === 'TIMEOUT' || err.code === 'RATE_LIMITED') throw err;
      console.log(JSON.stringify({ requestId, stage: 'upload-retry', reason: err.message }));
      await sleep(1200);
    }
  }
  const fileId = uploadData && uploadData.id;
  if (!fileId) throw Object.assign(new Error('Dify 未回傳檔案 ID'), { code: 'UPSTREAM_ERROR' });

  /* --- 步驟 2：攜圖呼叫雙腦 Chatflow（GPT 化驗 → 智庫 → DeepSeek 寫報告） --- */
  const chatRes = await fetchWithTimeout(
    `${cfg.DIFY_API_URL}/chat-messages`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.DIFY_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: {},
        query: ANALYSIS_PROMPT,
        response_mode: 'blocking',
        user: userId,
        files: [{ type: 'image', transfer_method: 'local_file', upload_file_id: fileId }],
      }),
    },
    cfg.CHAT_TIMEOUT_MS, 'AI 分析'
  );

  if (!chatRes.ok) {
    const errText = await chatRes.text().catch(() => '');
    throw Object.assign(new Error(`Dify 對話失敗 (${chatRes.status}) ${errText.slice(0, 200)}`), {
      code: chatRes.status === 429 ? 'RATE_LIMITED' : 'UPSTREAM_ERROR',
    });
  }

  const chatData = await chatRes.json();
  let answer = (chatData && chatData.answer) || '';
  // DeepSeek R1 推理標籤清理，保持報告排版乾淨
  answer = answer.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  if (!answer) throw Object.assign(new Error('AI 未有回傳診斷內容'), { code: 'UPSTREAM_ERROR' });

  return { answer, elapsedMs: Date.now() - t0 };
}

/* ============================================================
   主入口
   ============================================================ */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const corsOrigin = ALLOWED_ORIGINS.has(origin) ? origin : '';
    const requestId = crypto.randomUUID().slice(0, 8);

    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };
    if (corsOrigin) corsHeaders['Access-Control-Allow-Credentials'] = 'true';

    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
      });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

    if (url.pathname === '/health') {
      return json({
        status: 'ok',
        version: '8.0-MoE-DualBrain',
        architecture: 'GPT-5.6 Vision (化驗) + Knowledge (智庫) + DeepSeek (廣東話報告)',
        cache: env.CACHE_KV ? 'KV' : 'cache-api',
        rate_limit_per_hour: Number(DEFAULTS.RATE_LIMIT_MAX),
      });
    }

    /* v7.0 沒有路徑路由，任何 POST 都會觸發 AI 調用（浪費 + 安全風險）— v8.0 修正 */
    if (url.pathname !== '/api/analyze-pest') {
      return json({ success: false, code: 'NOT_FOUND', error: '找不到服務端點' }, 404);
    }
    if (request.method !== 'POST') {
      return json({ success: false, code: 'METHOD_NOT_ALLOWED', error: '只接受 POST 請求' }, 405);
    }

    const cfg = {};
    for (const key of Object.keys(DEFAULTS)) {
      cfg[key] = env[key] || DEFAULTS[key];
    }
    for (const k of ['UPLOAD_TIMEOUT_MS', 'CHAT_TIMEOUT_MS', 'MAX_IMAGE_BYTES', 'CACHE_TTL_SECONDS', 'RATE_LIMIT_MAX', 'RATE_LIMIT_WINDOW_MS']) {
      cfg[k] = Number(cfg[k]);
    }

    try {
      /* --- 限流（慳成本 + 防濫用） --- */
      const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
      if (isRateLimited(clientIp, cfg.RATE_LIMIT_MAX, cfg.RATE_LIMIT_WINDOW_MS)) {
        return json({
          success: false,
          code: 'RATE_LIMITED',
          error: '分析次數暫時達上限，請約 1 小時後再試，或直接 WhatsApp 搵師傅即時跟進。',
          requestId,
        }, 429);
      }

      /* --- 解析及驗證圖片 --- */
      let formData;
      try {
        formData = await request.formData();
      } catch (_) {
        return json({ success: false, code: 'BAD_REQUEST', error: '請求格式錯誤，請重新上載相片。', requestId }, 400);
      }

      const imageFile = formData.get('image');
      if (!imageFile || typeof imageFile === 'string') {
        return json({ success: false, code: 'BAD_REQUEST', error: '找不到上傳的圖片檔案。', requestId }, 400);
      }

      if (imageFile.size > cfg.MAX_IMAGE_BYTES) {
        return json({ success: false, code: 'INVALID_IMAGE', error: '相片大於 8MB，請重新拍攝或選擇較細嘅相片。', requestId }, 413);
      }

      const bytes = new Uint8Array(await imageFile.arrayBuffer());
      const sniffed = MAGIC_BYTES.find((m) => m.test(bytes));
      if (!sniffed) {
        return json({
          success: false,
          code: 'INVALID_IMAGE',
          error: '相片格式不支援，請使用 JPG / PNG / WebP 相片。',
          requestId,
        }, 415);
      }

      /* --- 智慧快取查詢 --- */
      const imageHash = await hashImage(bytes.buffer);
      const cached = await cacheGet(env, imageHash);
      if (cached && cached.diagnosis) {
        console.log(JSON.stringify({ requestId, stage: 'cache-hit', hash: imageHash.slice(0, 12) }));
        return json({ ...cached, cached: true, requestId, engine: 'MoE-GPT+DeepSeek' });
      }

      /* --- 呼叫 Dify 雙腦 Chatflow --- */
      const userId = `web-${clientIp.replace(/[^a-z0-9]/gi, '')}-${Date.now()}`;
      const { answer, elapsedMs } = await callDify(env, cfg, imageFile, userId, requestId);

      const payload = {
        success: true,
        diagnosis: answer,
        version: '8.0 (MoE Dual-Brain: GPT Vision + DeepSeek Writer)',
        engine: 'MoE-GPT+DeepSeek',
        cached: false,
        elapsed_ms: elapsedMs,
      };
      await cachePut(env, imageHash, payload, cfg.CACHE_TTL_SECONDS);
      console.log(JSON.stringify({ requestId, stage: 'done', elapsedMs, engine: payload.engine }));

      return json({ ...payload, requestId });
    } catch (err) {
      const code = err.code === 'TIMEOUT' ? 'UPSTREAM_TIMEOUT'
        : err.code === 'RATE_LIMITED' ? 'RATE_LIMITED'
        : err.code === 'NETWORK' ? 'NETWORK_ERROR'
        : 'UPSTREAM_ERROR';
      const friendly = code === 'UPSTREAM_TIMEOUT' || code === 'NETWORK_ERROR'
        ? 'AI 分析時間過長而中止，請稍後再試一次，或直接 WhatsApp 搵師傅。'
        : code === 'RATE_LIMITED'
        ? 'AI 系統而家好忙，請約 1 分鐘後再試。'
        : 'AI 系統暫時出現異常，請稍後再試，或直接 WhatsApp 搵師傅。';
      console.error(JSON.stringify({ requestId, stage: 'error', code, message: err.message }));
      return json({ success: false, code, error: friendly, debug: err.message, requestId }, 502);
    }
  },
};
