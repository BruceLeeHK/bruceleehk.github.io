/**
 * Cloudflare Worker — 滅蟲師傅 AI 害蟲視覺辨識後端 (v3.0 — 2026-08-17)
 *
 * v3.0 修復亮點：
 *   🔧 修正 Llama 3.2 Vision 模型需先送出 "agree" 授權 prompt 之問題
 *      （舊版直接送出圖片，會收到 5016 錯誤：需先同意授權）
 *   🔧 新增「首次同意授權」快取機制（KV 儲存 agreed=true），避免每次請求都重送
 *   🔧 加入請求大小限制（10MB 上限）
 *   🔧 加入 25 秒 AbortController 逾時保護（避免 Worker AI 卡死）
 *   🔧 加入完整錯誤處理 + 結構化錯誤回應
 *   🔧 加入安全標頭：X-Content-Type-Options, X-Frame-Options, Referrer-Policy
 *   🔧 加入 CORS 白名單（不再反射任意 origin）
 *   🔧 改進 prompt 模板，引導 AI 回傳更穩定嘅 JSON 結構
 *
 * 部署：
 *   1. Cloudflare Dashboard → Workers & Pages → Create Worker → 命名 pest-vision-worker
 *   2. 貼上此腳本 → Save and Deploy
 *   3. Settings → Variables → 加入：
 *      AI_API_TOKEN = （留空，使用 Workers AI binding）
 *   4. Settings → Bindings → Add binding → Workers AI → 變數名稱: AI
 *   5. Settings → Bindings → Add KV Namespace → 變數名稱: PEST_KV
 *      （需先建立 KV namespace，例如 pest-vision-cache）
 *   6. Worker URL = https://pest-vision-worker.cedars5282.workers.dev
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

const MAX_REQUEST_BYTES = 10_000_000; // 10 MB hard cap
const AI_TIMEOUT_MS = 25000;           // 25 seconds

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const corsOrigin = ALLOWED_ORIGINS.has(origin) ? origin : '';

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

    if (corsOrigin) {
      corsHeaders['Access-Control-Allow-Credentials'] = 'true';
    }

    /* Preflight */
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    /* Health check */
    if (url.pathname === '/health') {
      return json({
        status: 'ok',
        version: '3.0',
        ai_bound: !!env.AI,
        kv_bound: !!env.PEST_KV,
        time: new Date().toISOString()
      }, 200, corsHeaders);
    }

    /* Request size check */
    const contentLen = parseInt(request.headers.get('Content-Length') || '0', 10);
    if (contentLen > MAX_REQUEST_BYTES) {
      return json({
        error: '圖片檔案過大（上限 10MB）',
        code: 'REQUEST_TOO_LARGE'
      }, 413, corsHeaders);
    }

    try {
      /* Check AI binding */
      if (!env.AI) {
        console.error('AI binding 未設定');
        return json({
          error: '伺服器未綁定 Workers AI',
          code: 'AI_NOT_BOUND'
        }, 503, corsHeaders);
      }

      const body = await request.json();
      const imageBase64 = body.imageBase64;

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return json({ error: 'Missing imageBase64' }, 400, corsHeaders);
      }

      /* Convert base64 → ArrayBuffer for Workers AI */
      let imageBytes;
      try {
        // Cloudflare Workers base64 decode
        const binaryString = atob(imageBase64);
        const len = binaryString.length;
        imageBytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          imageBytes[i] = binaryString.charCodeAt(i);
        }
      } catch (e) {
        return json({ error: 'Invalid base64 image' }, 400, corsHeaders);
      }

      /* ============================================================
         Step 1: 首次同意 Llama 3.2 Vision 授權（KV 快取）
         ============================================================ */
      let agreed = false;
      if (env.PEST_KV) {
        try {
          const cached = await env.PEST_KV.get('llama_vision_agreed');
          agreed = cached === 'true';
        } catch (e) {
          console.warn('KV 讀取失敗:', e.message);
        }
      }

      if (!agreed) {
        try {
          const agreeController = new AbortController();
          const agreeTimeout = setTimeout(() => agreeController.abort(), 5000);
          await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
            messages: [
              { role: 'user', content: 'agree' }
            ],
            max_tokens: 16,
          }, { signal: agreeController.signal });
          clearTimeout(agreeTimeout);
          agreed = true;
          if (env.PEST_KV) {
            try { await env.PEST_KV.put('llama_vision_agreed', 'true', { expirationTtl: 86400 }); } catch (e) {}
          }
        } catch (e) {
          console.warn('送出 agree prompt 失敗（可能已同意）:', e.message);
          /* Even if this fails, try the actual vision call anyway */
        }
      }

      /* ============================================================
         Step 2: 呼叫 Llama 3.2 Vision 進行害蟲辨識
         ============================================================ */
      const prompt = `你是一位香港專業滅蟲師傅。請分析這張圖片中的害蟲或昆蟲，並以純 JSON 格式回應（不要 markdown、不要其他文字）。

回應格式：
{
  "pest": "害蟲中文名稱（例如：曱甴、木蝨、老鼠、白蟻、蚊、螞蟻、蜂、蜈蚣、衣魚、蜘蛛、或其他）",
  "confidence": 0到100的整數,
  "risk": "風險等級（低 / 中 - 高 / 高 / 極高（結構風險））",
  "nest": "可能嘅巢穴位置（中文描述）",
  "strategy": "建議防治策略（中文描述）",
  "price": "參考收費範圍（HK$ 格式）"
}

如果圖片不是害蟲或看不清楚，請回應：
{
  "pest": "其他",
  "confidence": 0,
  "risk": "待評估",
  "nest": "建議專員現場勘察",
  "strategy": "已安排專業師傅親自對照相片，為你提供精準處方。",
  "price": "免費估價"
}

請只回傳 JSON，不要任何其他文字或 markdown 標記。`;

      const visionController = new AbortController();
      const visionTimeout = setTimeout(() => visionController.abort(), AI_TIMEOUT_MS);

      let aiResponse;
      try {
        aiResponse = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + imageBase64 } }
              ]
            }
          ],
          max_tokens: 800,
          temperature: 0.3,
        }, { signal: visionController.signal });
      } catch (e) {
        clearTimeout(visionTimeout);
        if (e.name === 'AbortError') {
          return json({
            error: 'AI 分析逾時（超過 25 秒）',
            code: 'AI_TIMEOUT'
          }, 504, corsHeaders);
        }
        console.error('AI run 失敗:', e.message, e.stack);
        return json({
          error: 'AI 模型暫時無法使用：' + e.message,
          code: 'AI_FAILED'
        }, 502, corsHeaders);
      } finally {
        clearTimeout(visionTimeout);
      }

      /* Extract response text */
      let responseText = '';
      if (typeof aiResponse === 'string') {
        responseText = aiResponse;
      } else if (aiResponse && aiResponse.response) {
        responseText = aiResponse.response;
      } else if (aiResponse && aiResponse.result && aiResponse.result.response) {
        responseText = aiResponse.result.response;
      } else {
        responseText = JSON.stringify(aiResponse);
      }

      /* Clean up response — strip markdown code fences if present */
      responseText = responseText.trim();
      if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
      }

      return json({
        success: true,
        response: responseText,
        version: '3.0'
      }, 200, corsHeaders);

    } catch (err) {
      console.error('Worker 錯誤:', err.message, err.stack);
      return json({
        error: '伺服器內部錯誤',
        code: 'INTERNAL_ERROR',
        debug: err.message
      }, 500, corsHeaders);
    }
  }
};

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
}
