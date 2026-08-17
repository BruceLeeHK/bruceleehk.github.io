/**
 * Cloudflare Worker — 滅蟲師傅 AI 害蟲視覺辨識後端 (v3.2 — 2026-08-17)
 * 
 * 修復重點：
 *   - 修正 Workers AI Vision 模型標準輸入格式（改用原生 image: [...bytes] 與 prompt）
 *   - 完美相容前端的壓縮 base64 與降級流程
 */

const ALLOWED_ORIGINS = new Set([
  'https://bruceleehk.com',
  'https://www.bruceleehk.com',
  'https://bruceleehk.github.io',
  'http://localhost:4000',
  'http://127.0.0.1:4000',
  'http://localhost:8080',
  'http://127.0.0.1:127.0.0.1:8080',
  'http://127.0.0.1:8080',
]);

const MAX_REQUEST_BYTES = 10_000_000; // 10 MB
const AI_TIMEOUT_MS = 25000;          // 25 seconds

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const corsOrigin = ALLOWED_ORIGINS.has(origin) ? origin : '';

    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin || '*', // 容許跨域調試
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

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    if (url.pathname === '/health') {
      return json({
        status: 'ok',
        version: '3.2',
        ai_bound: !!env.AI,
        kv_bound: !!env.PEST_KV,
        time: new Date().toISOString()
      }, 200, corsHeaders);
    }

    const contentLen = parseInt(request.headers.get('Content-Length') || '0', 10);
    if (contentLen > MAX_REQUEST_BYTES) {
      return json({
        error: '圖片檔案過大（上限 10MB）',
        code: 'REQUEST_TOO_LARGE'
      }, 413, corsHeaders);
    }

    try {
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

      let imageBytes;
      try {
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
            prompt: 'agree',
            image: [...Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='), c => c.charCodeAt(0))]
          }, { signal: agreeController.signal });
          clearTimeout(agreeTimeout);
          agreed = true;
          if (env.PEST_KV) {
            try { await env.PEST_KV.put('llama_vision_agreed', 'true', { expirationTtl: 86400 }); } catch (e) {}
          }
        } catch (e) {
          console.warn('送出 agree prompt 失敗（可能已同意）:', e.message);
        }
      }

      /* ============================================================
         Step 2: 呼叫 Llama 3.2 Vision 進行害蟲辨識（修正為 Workers AI 標準格式）
         ============================================================ */
      const aiPrompt = `你是一個香港頂尖嘅資深滅蟲專家，精通香港在地常見害蟲嘅習性同「三十六計」兵法策略。

請仔細分析呢張害蟲或蟲害現場圖片。特別注意觀察以下關鍵特徵：
- 體型大小、形狀、顏色、觸角、腳數
- 是否有木屑粉末、泥路、血跡、黑點
- 環境背景（廚房、臥室、書櫃、木傢俬等）

【香港常見害蟲鑑別規則】
- 曱甴（蟑螂）：油亮外殼、明顯長觸角 ➔ 策略：誘敵深入計
- 木蝨／床蝨：扁平橢圓形、紅褐色、床板縫隙、黑點血跡 ➔ 策略：星星之火計
- 白蟻：身體較直、腰部較粗、伴隨泥路或木屑 ➔ 策略：擒賊擒王計
- 蛀木蟲：木材表面圓形孔洞 + 細木粉末 ➔ 策略：引蛇出洞計
- 螞蟻：三段結構、腰部細 ➔ 策略：順手牽羊計
- 老鼠：長尾、排泄物呈橢圓形 ➔ 策略：關門打狗計
- 蚊、蜂、蜈蚣、衣魚、蜘蛛、蟎蟲、卜泥等

請嚴格以純 JSON 格式回應（不要 markdown 程式碼區塊標記、不要任何其他文字）：

{
  "pest": "曱甴|木蝨|老鼠|白蟻|蚊|蛀木蟲|螞蟻|蜂|蜈蚣|衣魚|蜘蛛|飛蟲|蟎蟲|卜泥|其他",
  "confidence": 95,
  "risk": "低|中|高|極高（結構風險）",
  "nest": "潛在暗巢位置描述（用香港本地家居環境術語，如木傢俬、窗台罅隙）",
  "strategy": "採用「計策名稱」：結合現場特徵嘅專業防治說明",
  "price": "HK$ 參考價格區間"
}`;

      const visionController = new AbortController();
      const visionTimeout = setTimeout(() => visionController.abort(), AI_TIMEOUT_MS);

      let aiResponse;
      try {
        aiResponse = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
          prompt: aiPrompt,
          image: [...imageBytes],
          max_tokens: 400,
        }, { signal: visionController.signal });
      } catch (e) {
        clearTimeout(visionTimeout);
        if (e.name === 'AbortError') {
          return json({
            error: 'AI 分析逾時（超過 25 秒）',
            code: 'AI_TIMEOUT'
          }, 504, corsHeaders);
        }
        console.error('AI run 失敗:', e.message);
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
        version: '3.2'
      }, 200, corsHeaders);

    } catch (err) {
      console.error('Worker 錯誤:', err.message);
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