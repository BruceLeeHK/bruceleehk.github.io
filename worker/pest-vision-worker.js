/**
 * Cloudflare Worker — 滅蟲師傅 AI (v8.1 專家混合架構 MoE 雙腦 終極優化版)
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

const DEFAULTS = {
  DIFY_API_URL: 'https://api.dify.ai/v1',
  DIFY_API_KEY: 'app-EOJafBJvdrPPJdbgjlkpdq5o',
  UPLOAD_TIMEOUT_MS: '30000',   
  CHAT_TIMEOUT_MS: '100000',    
  MAX_IMAGE_BYTES: String(8 * 1024 * 1024), 
  CACHE_TTL_SECONDS: '86400',   
  RATE_LIMIT_MAX: '8',          
  RATE_LIMIT_WINDOW_MS: '3600000',
};

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

const MAGIC_BYTES = [
  { type: 'image/jpeg', ext: '.jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: 'image/png',  ext: '.png', test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { type: 'image/webp', ext: '.webp', test: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  if (rateBucket.size > 5000) {
    for (const [key, arr] of rateBucket) {
      if (!arr.some((t) => now - t < windowMs)) rateBucket.delete(key);
    }
  }
  return false;
}

async function hashImage(arrayBuffer) {
  const digest = await crypto.subtle.digest('SHA-256', arrayBuffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function cacheGet(env, hash) {
  try {
    if (env.PEST_KV) { // 確保變數名稱與您 Cloudflare 綁定的一致
      const cached = await env.PEST_KV.get(`pestdiag:v1:${hash}`);
      return cached ? JSON.parse(cached) : null;
    }
  } catch (_) { }
  return null;
}

async function cachePut(env, hash, payload, ttlSeconds) {
  try {
    if (env.PEST_KV) {
      await env.PEST_KV.put(`pestdiag:v1:${hash}`, JSON.stringify(payload), { expirationTtl: ttlSeconds });
    }
  } catch (_) { }
}

async function callDify(env, cfg, imageFile, fileExt, userId, requestId) {
  const t0 = Date.now();

  /* --- 步驟 1：圖片上傳至 Dify 檔案庫 --- */
  let uploadData;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const uploadForm = new FormData();
      // 優化：加入動態副檔名，確保 Dify 順利識別格式
      uploadForm.append('file', imageFile, `pest-photo${fileExt}`);
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
      if (attempt === 2 || err.code === 'TIMEOUT' || err.code === 'RATE_LIMITED') throw err;
      await sleep(1200);
    }
  }
  const fileId = uploadData && uploadData.id;
  if (!fileId) throw Object.assign(new Error('Dify 未回傳檔案 ID'), { code: 'UPSTREAM_ERROR' });

  /* --- 步驟 2：攜圖呼叫雙腦 Chatflow --- */
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
        // Dify API 標準格式：傳遞上傳後的 file_id
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
  answer = answer.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  if (!answer) throw Object.assign(new Error('AI 未有回傳診斷內容'), { code: 'UPSTREAM_ERROR' });

  return { answer, elapsedMs: Date.now() - t0 };
}

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
      return json({ status: 'ok', version: '8.1-MoE-DualBrain' });
    }

    // 優化：寬鬆支援 /api/analyze-pest 及 /analyze-pest 兩個路徑
    if (url.pathname !== '/api/analyze-pest' && url.pathname !== '/analyze-pest') {
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
      const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
      if (isRateLimited(clientIp, cfg.RATE_LIMIT_MAX, cfg.RATE_LIMIT_WINDOW_MS)) {
        return json({ success: false, code: 'RATE_LIMITED', error: '分析次數暫時達上限，請約 1 小時後再試。', requestId }, 429);
      }

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
        return json({ success: false, code: 'INVALID_IMAGE', error: '相片格式不支援，請使用 JPG / PNG / WebP 相片。', requestId }, 415);
      }

      /* --- 智慧快取查詢 --- */
      const imageHash = await hashImage(bytes.buffer);
      const cached = await cacheGet(env, imageHash);
      if (cached && cached.diagnosis) {
        return json({ ...cached, cached: true, requestId, engine: 'MoE-GPT+DeepSeek' });
      }

      /* --- 呼叫 Dify 雙腦 Chatflow --- */
      const userId = `web-${clientIp.replace(/[^a-z0-9]/gi, '')}-${Date.now()}`;
      const { answer, elapsedMs } = await callDify(env, cfg, imageFile, sniffed.ext, userId, requestId);

      const payload = {
        success: true,
        diagnosis: answer,
        version: '8.1 (MoE Dual-Brain)',
        engine: 'MoE-GPT+DeepSeek',
        cached: false,
        elapsed_ms: elapsedMs,
      };

      // 優化：攔截「假死報告」，嚴禁存入 KV 快取！
      const isBadResult = answer.includes('無法辨識') || answer.includes('未能判定') || answer.includes('No insect image');
      if (!isBadResult) {
        await cachePut(env, imageHash, payload, cfg.CACHE_TTL_SECONDS);
      } else {
        console.log(`[Cache Skipped] AI 判定失敗，拒絕寫入 KV快取: ${requestId}`);
      }

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
        : 'AI 系統暫時出現異常，請稍後再試。';
      return json({ success: false, code, error: friendly, debug: err.message, requestId }, 502);
    }
  },
};