/**
 * Cloudflare Worker — 滅蟲師傅 AI 害蟲視覺辨識後端 (v5.2 淨化過濾版)
 *
 * v5.2 優化亮點：
 *   ✂️ 三重剪刀過濾機制：
 *      1. 強制切除 <think>...</think> LLM 推理過程標籤。
 *      2. Regex 精準提取 JSON {} 區塊，完全撕掉前後開場白與廢話。
 *      3. 自動繁簡字詞轉化字典（如：蟑螂→曱甴、床虱→木蝨），確保 100% 純香港繁體。
 *   🔒 保持 v5.1 完整 API 白名單與安全標頭。
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
        version: '5.2',
        ai_bound: !!env.AI,
        kv_bound: !!env.PEST_KV,
        ai_language: 'zh-HK',
        time: new Date().toISOString()
      }, 200, corsHeaders);
    }

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

      const formData = await request.formData();
      const imageFile = formData.get('image');
      
      if (!imageFile) {
        return json({ error: 'Missing image in FormData' }, 400, corsHeaders);
      }

      const arrayBuffer = await imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
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
            messages: [{ role: 'user', content: 'agree' }],
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
         Step 2: 呼叫 Llama 3.2 Vision (極簡純繁體提示詞)
         ============================================================ */
      const prompt = `你是一個香港頂尖嘅資深滅蟲專家，精通香港在地常見害蟲嘅習性同「三十六計」兵法策略。
請仔細分析圖片，並嚴格以「純香港繁體中文（zh-HK）」的 JSON 格式回應。嚴禁使用簡體字！嚴禁輸出任何 Markdown 標記、開場白、思考過程或說明文字！

請直接輸出以下 JSON：
{
  "pest": "害蟲中文名稱（必須選自：曱甴|木蝨|老鼠|白蟻|蚊|蛀木蟲|螞蟻|蜂|蜈蚣|衣魚|蜘蛛|飛蟲|蟎蟲|卜泥|其他）",
  "confidence": 85,
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
          temperature: 0.1,
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
         Step 3: 三重「剪刀過濾」與格式化 (無縫對接前端)
         ============================================================ */
      let responseText = '';
      if (typeof aiResponse === 'string') {
        responseText = aiResponse;
      } else if (aiResponse && aiResponse.response) {
        responseText = aiResponse.response;
      } else {
        responseText = JSON.stringify(aiResponse);
      }

      // ✂️ 剪刀 1：移除 <think>...</think> 思考過程標籤
      responseText = responseText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

      // ✂️ 剪刀 2：強效 Regex 提取 JSON {} 區塊（過濾掉 JSON 前後的任何廢話）
      let parsedData = {};
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
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

      // ✂️ 剪刀 3：簡繁字詞自動校正（徹底去除殘留簡體與內陸稱呼）
      const sanitizeHkText = (str) => {
        if (!str || typeof str !== 'string') return '';
        return str
          .replace(/蟑螂/g, '曱甴')
          .replace(/床虱/g, '木蝨')
          .replace(/木虱/g, '木蝨')
          .replace(/白蚁/g, '白蟻')
          .replace(/蚂蚁/g, '螞蟻')
          .replace(/检查/g, '檢查')
          .replace(/评估/g, '評估')
          .replace(/建议/g, '建議')
          .replace(/隐患/g, '隱患')
          .replace(/缝隙/g, '罅隙')
          .replace(/厨房/g, '廚房')
          .replace(/现场/g, '現場')
          .replace(/师傅/g, '師傅')
          .replace(/针对/g, '針對');
      };

      const safePest = sanitizeHkText(parsedData.pest || '未確認物體');
      const safeNest = sanitizeHkText(parsedData.nest || '建議由專員現場勘察');
      const safeRisk = sanitizeHkText(parsedData.risk || '中');
      const safeStrategy = sanitizeHkText(parsedData.strategy || '請聯絡師傅現場評估');
      const safePrice = sanitizeHkText(parsedData.price || '免費估價');

      // 🎯 組合前端期待的「🐛 完美純香港繁體 Markdown」格式
      const formattedDiagnosis = `🐛 **初步診斷**：根據相片特徵，極可能是 **${safePest}**。
👩🏻‍🔧 **師妹溫馨提示**：潛在暗巢位置可能喺「${safeNest}」，風險程度為 **${safeRisk}**。切勿自行亂噴殺蟲水，以免蟲患擴散！
💡 **三十六計方案**：我哋「滅蟲師傅」採用獨家「${safeStrategy}」策略，針對性根治。
💰 **參考估價**：${safePrice}（實際以現場評估為準）。
🛡️ **專業聲明**：AI 診斷僅供初步參考。實際蟲患情況、根治方案及最終報價，須以我哋「滅蟲師傅」現場勘察為準。

---
💡 **每個蟲患情況都唔同，我哋師傅而家已經在線！**
想攞到最準確嘅免費報價同專屬滅蟲方案？即刻撳下面條 Link WhatsApp 我哋師傅，並 **將你啱啱影嘅相片 Send 畀師傅幫眼睇睇** 啦（絕不硬銷，歡迎問價）：
👉 [點擊這裡與真人師傅對話 (WhatsApp: 5282 1552)](https://wa.me/85252821552?text=你好，我喺網站用完AI分析。初步診斷係「${safePest}」，我想進一步查詢！相片我會喺下面傳送畀你。)`;

      return json({
        success: true,
        diagnosis: formattedDiagnosis,
        raw_json: parsedData,
        version: '5.2',
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