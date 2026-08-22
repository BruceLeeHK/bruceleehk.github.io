/**
 * Cloudflare Worker — 滅蟲師傅 AI 害蟲視覺辨識後端 (v4.0 — 2026-08-22)
 *
 * v4.0 升級亮點：
 *   🌐 雙語化回應：JSON 結構加入 pest_en, strategy_en, nest_en 等英文欄位
 *      方便前端按用戶語言偏好顯示對應內容
 *   🔧 v3.1 修復全部保留：
 *      - Llama 3.2 Vision 'agree' 授權機制（KV 快取）
 *      - 25 秒 AbortController 逾時保護
 *      - CORS 白名單（不反射任意 origin）
 *      - 安全標頭（X-Content-Type-Options, X-Frame-Options, Referrer-Policy）
 *      - 請求大小限制（10MB）
 *      - 香港在地害蟲特徵鑑別規則（負向 + 正向提示）
 *      - 三十六計兵法對照表
 *
 * 部署：
 *   1. Cloudflare Dashboard → Workers & Pages → 選擇 pest-vision-worker
 *   2. 貼上此腳本 → Save and Deploy
 *   3. 確認 Bindings：
 *      - Workers AI → 變數名稱: AI
 *      - KV Namespace → 變數名稱: PEST_KV
 *   4. Worker URL = https://pest-vision-worker.cedars5282.workers.dev
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

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    if (url.pathname === '/health') {
      return json({
        status: 'ok',
        version: '4.0',
        ai_bound: !!env.AI,
        kv_bound: !!env.PEST_KV,
        bilingual: true,
        time: new Date().toISOString()
      }, 200, corsHeaders);
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
          error: '伺服器未綁定 Workers AI / Workers AI not bound',
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
         v4.0: 升級為雙語輸出 — 同時提供中文與英文欄位
         ============================================================ */
      const prompt = `你是一個香港頂尖嘅資深滅蟲專家，精通香港在地常見害蟲嘅習性同「三十六計」兵法策略。
You are also fluent in English and can provide bilingual outputs.

請仔細分析呢張害蟲或蟲害現場圖片。特別注意觀察以下關鍵特徵：
- 體型大小、形狀、顏色
- 觸角形狀、腳數、翅膀
- 是否有糞便、脫皮、卵殼、咬痕
- 是否有木屑粉末、泥路、血跡、黑點
- 環境背景（廚房、臥室、書櫃、木傢俬等）

【香港常見害蟲鑑別規則】（必須嚴格遵守）

✅ 曱甴（蟑螂）Cockroach：
   - 油亮外殼、明顯長觸角、扁平身體
   - 美國曱甴（較大、紅褐色）、德國曱甴（較細、淺褐色帶兩條深色縱紋）
   - 策略：誘敵深入計 Luring Strategy

✅ 木蝨／床蝨（Bed Bug）：
   - 扁平橢圓形、紅褐色、成蟲約 5-7mm
   - 6 隻腳、無翅膀、身體有橫向紋理
   - 通常出現喺床板縫隙、梳化化縫隙、牆身插座附近
   - 常伴隨黑色血跡點（排泄物）或脫皮
   - 策略：星星之火計 Strategic Steam

✅ 白蟻（Termite）：
   - 身體較直、腰部較粗（與螞蟻不同）
   - 觸角呈念珠狀（呈串珠形狀）
   - 工蟻呈乳白色或淺黃色、有時帶黑色翅膀（繁殖蟻）
   - 通常伴隨泥路（泥土築嘅通道）、木屑粉末、空心木材
   - 策略：擒賊擒王計 Capture the King

✅ 蛀木蟲（Powderpost Beetle / Wood Borer）：
   - 體型細小（3-15mm）、長橢圓形
   - 會喺木材表面留下圓形孔洞（約 1-3mm）
   - 伴隨細木粉末（似胡椒粉）
   - 與白蟻分別：蛀木蟲留圓孔 + 細粉；白蟻留泥路 + 大面積蛀食
   - 策略：引蛇出洞計 Draw Out

✅ 螞蟻（Ant）：
   - 明顯嘅「頭-胸-腹」三段結構、腰部細（與白蟻不同）
   - 觸角呈肘形（彎曲）
   - 香港常見：黑蟻、紅火蟻、阿根廷蟻
   - 策略：順手牽羊計 Casual Capture

✅ 老鼠（Rat / Mouse）：
   - 體型較大、長尾、圓耳
   - 排泄物呈橢圓形、黑色
   - 伴隨咬痕（電線、紙張、傢俬）
   - 策略：關門打狗計 Close the Door

✅ 蚊（Mosquito）：
   - 細長身體、長腳、有翅膀
   - 香港常見：白紋伊蚊（黑色帶白紋）、埃及伊蚊
   - 策略：以逸待勞計 Wait at Ease

✅ 蜂類（Wasp / Bee）：
   - 黃黑相間、有翅膀、有明顯腰部
   - 香港常見：黃蜂、胡蜂、蜜蜂
   - 通常築巢於屋簷、露台、樹上
   - 策略：釜底抽薪計 Remove the Source

✅ 蜈蚣（Centipede）：
   - 長條多足、身體扁平
   - 香港常見品種：約 10-15cm 長
   - 通常出現於潮濕陰暗處
   - 策略：圍魏救趙計 Surround

✅ 衣魚（Silverfish）：
   - 銀灰色、鱗片狀身體、有三條長尾鬚
   - 體型約 1-2cm、行動迅速
   - 鍾意潮濕陰暗、會蛀食紙張衣物
   - 策略：抽絲剝繭計 Strip

✅ 蜘蛛（Spider）：
   - 8 隻腳、兩段身體結構
   - 大多無害、香港極少有毒品種
   - 策略：借刀殺人計 Borrow the Knife

✅ 蠅／蛾／蠓（飛蟲類）：
   - 烏蠅（家蠅）：灰色、有翅膀
   - 飛蛾：鱗翅、夜間活動
   - 蠓蟲：極細小、常成群出現
   - 策略：聲東擊西計 Diversion

【關鍵場景判斷規則】（基於現場特徵）

🔍 見到木屑、蛀木粉末或細小圓形孔洞 → 必須判定為「蛀木蟲」或「白蟻初期」
   - 若有明顯泥路 → 白蟻
   - 若只有圓孔 + 細粉 → 蛀木蟲
   - 策略：引蛇出洞計 Draw Out

🔍 見到牆角卵巢／油亮外殼／德國曱甴若蟲 → 判定為「德國曱甴」
   - 策略：誘敵深入計 Luring

🔍 見到床板縫隙有黑點血跡或扁平紅褐色蟲體 → 判定為「木蝨」
   - 策略：星星之火計 Steam Treatment

🔍 見到米櫃桶或廚房有細小褐色甲蟲 → 判定為「煙甲蟲」或「豆象」
   - 策略：順手牽羊計 Casual Capture

🔍 見到牆身白色極細微蟲（1mm 以下） → 判定為「卜泥」或「姬薪蟲」
   - 策略：抽絲剝繭計 Strip

🔍 見到梳化底或儲物區有蛛絲狀白色細蟲 → 判定為「蟎蟲」
   - 策略：斬草除根計 Root Out

【香港本地化 nest 描述要求】
描述巢穴位置時，請使用香港常見家居環境術語，例如：
- 窗台罅隙、牆身裂縫、冷氣機周邊
- 木傢俬、米櫃桶、衣櫃、梳化底、床板縫隙
- 廚房櫥櫃背後、電器散熱口、排水管附近
- 天花板夾層、地腳線、門框

請嚴格以純 JSON 格式回應（不要 markdown 程式碼區塊標記、不要任何其他文字）。
同時提供中文與英文內容，方便雙語顯示：

{
  "pest": "害蟲中文名稱（必須選自：曱甴|木蝨|老鼠|白蟻|蚊|蛀木蟲|螞蟻|蜂|蜈蚣|衣魚|蜘蛛|飛蟲|蟎蟲|卜泥|其他）",
  "pest_en": "English pest name (must be one of: Cockroach|Bed Bug|Rodent|Termite|Mosquito|Powderpost Beetle|Ant|Wasp|Centipede|Silverfish|Spider|Fly|Mite|Psocid|Other)",
  "confidence": 0-100 嘅整數,
  "risk": "低|中|高|極高（結構風險）",
  "risk_en": "Low|Medium|High|Very High (structural risk)",
  "nest": "潛在暗巢位置描述（用香港本地家居環境術語）",
  "nest_en": "Nest location description (in English)",
  "strategy": "採用「計策名稱」：結合現場特徵嘅專業防治說明",
  "strategy_en": "Strategy name in English: professional treatment description",
  "price": "HK$ 參考價格區間"
}

如果圖片唔清晰、唔係害蟲、或無法判斷，請回應：
{
  "pest": "其他",
  "pest_en": "Other",
  "confidence": 0,
  "risk": "待評估",
  "risk_en": "Pending Assessment",
  "nest": "建議專員現場勘察",
  "nest_en": "On-site inspection recommended",
  "strategy": "已安排專業師傅親自對照相片，為你提供精準處方。",
  "strategy_en": "Our professional technician will review the photo and provide a precise treatment plan.",
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
        version: '4.0',
        bilingual: true
      }, 200, corsHeaders);

    } catch (err) {
      console.error('Worker 錯誤:', err.message, err.stack);
      return json({
        error: '伺服器內部錯誤 / Internal server error',
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
