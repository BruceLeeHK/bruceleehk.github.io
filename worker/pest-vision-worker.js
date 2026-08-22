/**
 * Cloudflare Worker — 滅蟲師傅 AI 害蟲視覺辨識後端 (v5.1 完美對接版)
 *
 * v5.1 優化：
 *   - 自動攔截並解析 LLM 的 JSON 輸出，轉換為前端期待的 🐛 Markdown 格式。
 *   - 加入強效 Regex JSON 提取，防止 LLM 前後夾雜廢話導致 Parse 失敗。
 *   - 加入明確的 /api/analyze-pest 路由檢查。
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

const MAX_REQUEST_BYTES = 10_000_000; // 10 MB
const AI_TIMEOUT_MS = 25000;          // 25 seconds

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

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === '/health') {
      return json({
        status: 'ok',
        version: '5.1',
        ai_bound: !!env.AI,
        kv_bound: !!env.PEST_KV,
        ai_language: 'zh-HK',
        time: new Date().toISOString()
      }, 200, corsHeaders);
    }

    // 🔒 確保只處理特定的 API 路徑
    if (url.pathname !== '/api/analyze-pest') {
        return json({ error: 'Not Found' }, 404, corsHeaders);
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    const contentLen = parseInt(request.headers.get('Content-Length') || '0', 10);
    if (contentLen > MAX_REQUEST_BYTES) {
      return json({
        error: '圖片檔案過大（上限 10MB） / Image too large (max 10MB)',
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

      /* == 處理 FormData (因為前端是用 FormData 上傳的) == */
      const formData = await request.formData();
      const imageFile = formData.get('image');
      
      if (!imageFile) {
        return json({ error: 'Missing image in FormData' }, 400, corsHeaders);
      }

      const arrayBuffer = await imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // 轉換成 Base64 交給 AI
      let binaryString = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }
      const imageBase64 = btoa(binaryString);


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
        }
      }

      /* ============================================================
         Step 2: 呼叫 Llama 3.2 Vision 進行害蟲辨識
         ============================================================ */
      const prompt = `你是一個香港頂尖嘅資深滅蟲專家，精通香港在地常見害蟲嘅習性同「三十六計」兵法策略。
請仔細分析圖片，並嚴格以純 JSON 格式回應（不要 markdown 標記、不要任何其他文字）：

{
  "pest": "害蟲中文名稱（必須選自：曱甴|木蝨|老鼠|白蟻|蚊|蛀木蟲|螞蟻|蜂|蜈蚣|衣魚|蜘蛛|飛蟲|蟎蟲|卜泥|其他）",
  "confidence": 0-100的整數,
  "risk": "低|中|高|極高",
  "nest": "潛在暗巢位置描述（用香港本地家居環境術語，如：床板縫隙、廚房罅隙、冷氣機周邊）",
  "strategy": "採用三十六計名稱：結合現場特徵嘅專業防治說明",
  "price": "HK$ 600 - 1,800"
}

如果圖片唔清晰或唔係害蟲，請回應：
{
  "pest": "未確認物體",
  "confidence": 0,
  "risk": "待評估",
  "nest": "建議由專員現場勘察",
  "strategy": "請聯絡師傅現場評估",
  "price": "免費估價"
}`;

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
          max_tokens: 1000,
          temperature: 0.2,
        }, { signal: visionController.signal });
      } catch (e) {
        clearTimeout(visionTimeout);
        if (e.name === 'AbortError') {
          return json({ error: 'AI 分析逾時（超過 25 秒）', code: 'AI_TIMEOUT' }, 504, corsHeaders);
        }
        return json({ error: 'AI 模型暫時無法使用：' + e.message, code: 'AI_FAILED' }, 502, corsHeaders);
      } finally {
        clearTimeout(visionTimeout);
      }

      /* ============================================================
         Step 3: 提取與格式化 JSON (無縫對接前端)
         ============================================================ */
      let responseText = '';
      if (typeof aiResponse === 'string') {
        responseText = aiResponse;
      } else if (aiResponse && aiResponse.response) {
        responseText = aiResponse.response;
      } else {
        responseText = JSON.stringify(aiResponse);
      }

      // 強效 Regex 提取 JSON (避免 AI 講廢話導致崩潰)
      let parsedData = {};
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found");
        }
      } catch (e) {
        console.warn("JSON Parse Failed, using fallback. Raw:", responseText);
        parsedData = {
          pest: "未能完全辨識",
          risk: "待評估",
          nest: "建議由專員現場勘察",
          strategy: "請聯絡師傅為你親自對照相片",
          price: "免費估價"
        };
      }

      // 🎯 組合前端期待的「🐛 完美 Markdown」格式
      const formattedDiagnosis = `🐛 **初步診斷**：根據相片特徵，極可能是 **${parsedData.pest}**。
👩🏻‍🔧 **師妹溫馨提示**：潛在暗巢位置可能喺「${parsedData.nest}」，風險程度為${parsedData.risk}。切勿自行亂噴殺蟲水，以免蟲患擴散！
💡 **三十六計方案**：我哋「滅蟲師傅」採用獨家「${parsedData.strategy}」策略，針對性根治。
💰 **參考估價**：${parsedData.price}（實際以現場評估為準）。
🛡️ **專業聲明**：AI 診斷僅供初步參考。實際蟲患情況、根治方案及最終報價，須以我哋「滅蟲師傅」現場勘察為準。

---
💡 **每個蟲患情況都唔同，我哋師傅而家已經在線！**
想攞到最準確嘅免費報價同專屬滅蟲方案？即刻撳下面條 Link WhatsApp 我哋師傅，並 **將你啱啱影嘅相片 Send 畀師傅幫眼睇睇** 啦（絕不硬銷，歡迎問價）：
👉 [點擊這裡與真人師傅對話 (WhatsApp: 5282 1552)](https://wa.me/85252821552?text=你好，我喺網站用完AI分析。初步診斷係「${parsedData.pest}」，我想進一步查詢！相片我會喺下面傳送畀你。)`;

      // 回傳格式完全吻合前端要求
      return json({
        success: true,
        diagnosis: formattedDiagnosis, // 前端依靠這個欄位渲染！
        raw_json: parsedData,
        version: '5.1',
        ai_language: 'zh-HK'
      }, 200, corsHeaders);

    } catch (err) {
      console.error('Worker 錯誤:', err.message, err.stack);
      return json({ error: '伺服器內部錯誤', code: 'INTERNAL_ERROR', debug: err.message }, 500, corsHeaders);
    }
  }
};

function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } });
}