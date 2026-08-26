/**
 * Cloudflare Worker — 滅蟲師傅 AI 害蟲視覺辨識後端 (v6.1 智庫精準版)
 *
 * v6.1 升級亮點：
 *   👁️ 盲測特徵提取：嚴禁 Llama 猜測昆蟲名稱，強制提取「腰部、觸角、顏色」等決定性特徵。
 *   🧠 聯動滅蟲智庫：引導 Dify/DeepSeek 根據客觀特徵比對智庫（精準區分飛蟻與白蟻），消滅幻覺。
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

const MAX_REQUEST_BYTES = 10_000_000; // 10 MB 上限
const AI_TIMEOUT_MS = 25000;          // 25 秒超時限制

// 🔑 Dify API Key (已保留您的設定)
const DIFY_API_KEY = 'app-EOJafBJvdrPPJdbgjlkpdq5o'; 
const DIFY_API_URL = 'https://api.dify.ai/v1/chat-messages';

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
      return json({ status: 'ok', version: '6.1-KnowledgeBase', time: new Date().toISOString() }, 200, corsHeaders);
    }

    if (url.pathname !== '/api/analyze-pest') {
        return json({ error: 'Not Found' }, 404, corsHeaders);
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    const contentLen = parseInt(request.headers.get('Content-Length') || '0', 10);
    if (contentLen > MAX_REQUEST_BYTES) {
      return json({ error: '圖片檔案過大（上限 10MB）', code: 'REQUEST_TOO_LARGE' }, 413, corsHeaders);
    }

    try {
      if (!env.AI) {
        return json({ error: '伺服器未綁定 Workers AI', code: 'AI_NOT_BOUND' }, 503, corsHeaders);
      }

      const formData = await request.formData();
      const imageFile = formData.get('image');
      if (!imageFile) {
        return json({ error: '找不到上傳的圖片檔案', code: 'MISSING_IMAGE' }, 400, corsHeaders);
      }

      const arrayBuffer = await imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // ⚡ 分塊 base64 編碼
      const CHUNK_SIZE = 32768;
      let binaryString = '';
      for (let i = 0; i < uint8Array.length; i += CHUNK_SIZE) {
        const chunk = uint8Array.subarray(i, Math.min(i + CHUNK_SIZE, uint8Array.length));
        binaryString += String.fromCharCode.apply(null, chunk);
      }
      const imageBase64 = btoa(binaryString);

      // 首次同意授權處理
      let agreed = false;
      if (env.PEST_KV) {
        try { agreed = (await env.PEST_KV.get('llama_vision_agreed')) === 'true'; } catch (e) {}
      }
      if (!agreed) {
        try {
          const agreeController = new AbortController();
          setTimeout(() => agreeController.abort(), 5000);
          await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', { messages: [{ role: 'user', content: 'agree' }], max_tokens: 16 }, { signal: agreeController.signal });
          if (env.PEST_KV) await env.PEST_KV.put('llama_vision_agreed', 'true', { expirationTtl: 86400 });
        } catch (e) {}
      }

      /* ============================================================
         👁️ 眼睛 (Cloudflare Llama)：「只看不猜」的無情特徵提取器
         ============================================================ */
      // 🎯 v6.1 嚴格限制：絕對不准輸出昆蟲名稱，強制觀察腰部與觸角！
      const visionPrompt = `你是一個極度客觀的生物特徵提取器。請仔細觀察圖片中的昆蟲，並用簡練的純文字給出一份「純客觀特徵報告」。
請必須詳細描述以下幾點，【絕對不要】猜測或寫出任何昆蟲的名稱（嚴禁出現白蟻、螞蟻、飛蟻、曱甴等字眼）：
1. 顏色：整體顏色是什麼？（例如：純黑色、深啡色、淺黃色）
2. 腰部結構：胸部與腹部之間是粗壯連接著，還是有明顯縮窄的「幼細腰部」？
3. 觸角形狀：觸角是筆直的一條，還是呈現彎曲（呈 L 型/念珠狀）？
4. 翅膀特徵（如有）：翅膀是否明顯長過身體？形狀和紋理如何？
5. 比例與大小：相對於背景的視覺比例。

注意：只需客觀描述你看到的物理特徵，嚴禁自行判斷品種！`;

      const visionController = new AbortController();
      const visionTimeout = setTimeout(() => visionController.abort(), AI_TIMEOUT_MS);

      let aiResponse;
      try {
        aiResponse = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
          messages: [
            { role: 'user', content: [{ type: 'text', text: visionPrompt }, { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + imageBase64 } }] }
          ],
          max_tokens: 500,
          temperature: 0.1, // 極低溫度，保持客觀不亂想
        }, { signal: visionController.signal });
      } catch (e) {
        clearTimeout(visionTimeout);
        return json({ error: '視覺感測器分析逾時或失效：' + e.message, code: 'VISION_FAILED' }, 502, corsHeaders);
      } finally {
        clearTimeout(visionTimeout);
      }

      let visionReportText = typeof aiResponse === 'string' ? aiResponse : (aiResponse?.response || JSON.stringify(aiResponse));
      visionReportText = visionReportText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

      /* ============================================================
         🧠 大腦 (Dify / DeepSeek)：結合【滅蟲智庫】精準斷案
         ============================================================ */
      // 🎯 v6.1 強化指令：要求 DeepSeek 拿著特徵去查智庫，並提示防呆機制
      const difyQuery = `【系統通知】這是一份由前端視覺感測器傳來的客觀生物特徵報告：

${visionReportText}

【你的分析任務】
1. 仔細閱讀上述物理特徵（特別注意「腰部粗細」、「觸角形狀」與「顏色」）。
2. 結合你內建的【滅蟲智庫】進行嚴格比對。
   ⚠️ 智庫防呆提醒：如果特徵顯示為「黑色」、「有明顯幼細腰部」或「彎曲觸角」，這通常是飛蟻或螞蟻；必須具備「淺色/啡色」、「粗腰」及「直觸角」才可能是白蟻。
3. 根據比對結果，以「滅蟲師妹」的身份做出最準確的判斷，並嚴格按照三十六計的 Markdown 格式輸出最終診斷報告。`;

      const difyController = new AbortController();
      const difyTimeout = setTimeout(() => difyController.abort(), 35000); 

      let difyResultText = "";
      try {
        const difyResponse = await fetch(DIFY_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DIFY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: {}, // 如果 Dify 內部有設定變數可在此傳入
            query: difyQuery,
            response_mode: "blocking",
            user: "web-visitor-" + Date.now() 
          }),
          signal: difyController.signal
        });

        if (!difyResponse.ok) {
            throw new Error(`Dify API 錯誤: ${difyResponse.status}`);
        }

        const difyData = await difyResponse.json();
        difyResultText = difyData.answer || "⚠️ 師妹暫時無法生成完整報告，請稍後重試。";

      } catch (e) {
        clearTimeout(difyTimeout);
        return json({ error: '滅蟲大腦 (Dify) 失去連線：' + e.message, code: 'DIFY_FAILED' }, 502, corsHeaders);
      } finally {
        clearTimeout(difyTimeout);
      }

      // ✂️ 移除 DeepSeek 可能產生的 <think> 標籤
      difyResultText = difyResultText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

      /* ============================================================
         Step 3: 回傳最終結果給前端
         ============================================================ */
      return json({
        success: true,
        diagnosis: difyResultText, 
        raw_json: { pest: "DeepSeek 分析完成", source: "Dify" }, 
        version: '6.1 (Llama_Features + Dify_Knowledge)'
      }, 200, corsHeaders);

    } catch (err) {
      console.error('Worker 錯誤:', err.message, err.stack);
      return json({ error: '伺服器內部錯誤', code: 'INTERNAL_ERROR', debug: err.message }, 500, corsHeaders);
    }
  }
};

function json(data, status, headers) {
  return new Response(JSON.stringify(data), { 
    status, 
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } 
  });
}