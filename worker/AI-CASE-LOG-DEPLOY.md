# AI 診斷數據留存端點 — 部署與 Dify 對接指南（v9.47 方案二）

對應文檔：《網站圖片 SEO 自動化重命名與 AI 診斷數據留存技術規格說明書》
- 任務 3：建立 ai_diagnosis_logs 數據表與備份圖片 Storage → **本方案以 Cloudflare KV 實現**（serverless，免維運，TTL 自動過期＝PDPO 保存期限自動合規）
- 任務 4：開發接收端點＋Dify HTTP 節點同步 → **worker/ai-case-log-worker.js**
- 任務 5：端到端測試 → 見下方步驟 5

---

## 一、Cloudflare 端部署（5 步）

```bash
cd worker/

# 1. 建立 KV Namespace（＝ai_diagnosis_logs 數據表）
npx wrangler kv namespace create AI_CASE_KV
#    → 複製輸出嘅 id，填入 wrangler-ai-case-log.toml 嘅 REPLACE_WITH_YOUR_KV_NAMESPACE_ID

# 2. 設定 Dify 推送密鑰（Bearer）
npx wrangler secret put AI_CASE_LOG_SECRET -c wrangler-ai-case-log.toml
#    → 輸入一個 32+ 字元隨機字串（例如 openssl rand -hex 32 生成）

# 3. 設定 IP 雜湊鹽（PDPO 匿名化）
npx wrangler secret put IP_HASH_SALT -c wrangler-ai-case-log.toml
#    → 輸入另一組隨機字串

# 4.（可選）後台查閱密鑰（admin/list、admin/get 用；可同 comment-worker 共用同一值）
npx wrangler secret put ADMIN_SECRET -c wrangler-ai-case-log.toml

# 5. 部署（Route 會攔截 bruceleehk.com/api/v1/telemetry/*，其他路徑照常行 GitHub Pages）
npx wrangler deploy -c wrangler-ai-case-log.toml
```

## 二、部署驗證（任務 5：端到端測試）

```bash
# 1. 健康檢查（瀏覽器或 curl，唔需要密鑰）
curl https://bruceleehk.com/api/v1/telemetry/health
# 預期：{"success":true,"service":"ai-case-log-worker","version":"v9.47","secret_set":true,"kv_bound":true,...}

# 2. 模擬 Dify 推送一筆測試數據
curl -X POST https://bruceleehk.com/api/v1/telemetry/ai-case-log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <你的AI_CASE_LOG_SECRET>" \
  -d '{"session_id":"sess_test_001","user_desc":"廚房見到有隻大老鼠 91234567 test@example.com","image_urls":[],"gpt_analysis":"{\"species\":\"Rat\",\"confidence\":0.85}","ai_response":"🐛 專員診斷結果：...","timestamp":"2026-10-13T12:00:00Z","district":"荃灣"}'
# 預期：{"success":true,"id":"log_...","stored":true}
# 注意：user_desc 內嘅電話同電郵會被自動遮蔽（PDPO）——後台查閱時可見 [phone masked] / [email masked]

# 3.（如設了 ADMIN_SECRET）後台查閱
curl -X POST https://bruceleehk.com/api/v1/telemetry/admin/list \
  -H "Content-Type: application/json" \
  -d '{"admin_secret":"<你的ADMIN_SECRET>","limit":5}'
```

## 三、Dify Workflow HTTP 節點設定（規格書 2.4）

登入 Dify 後台 → 打開 AI 診斷 Workflow → 喺 **LLM 2（DeepSeek）節點之後或並行位置**加入 **HTTP 請求節點**：

| 設定項 | 值 |
|---|---|
| HTTP Method | `POST` |
| URL | `https://bruceleehk.com/api/v1/telemetry/ai-case-log` |
| Headers | `Content-Type: application/json` |
| Headers | `Authorization: Bearer <AI_CASE_LOG_SECRET>` |
| Body Type | JSON |

Body（JSON Payload）：

```json
{
  "session_id": "{{sys.conversation_id}}",
  "user_desc": "{{sys.user_inputs.user_desc}}",
  "image_urls": "{{sys.files}}",
  "gpt_analysis": "{{#LLM.text#}}",
  "ai_response": "{{#LLM_2.text#}}",
  "timestamp": "{{sys.timestamp}}"
}
```

> 💡 `district` 欄位：如果 Workflow 有地區變數（例如用戶選過地區），可加 `"district": "{{#變數#}}"`；冇都可以留空，日後先補。
> 💡 變數名（`sys.files`、`#LLM.text#` 等）按你 Dify Workflow 實際節點名調整——以規格書 2.4 為準。

## 四、私隱合規對照（PDPO Cap. 486）

| 規格書要求 | 實現 |
|---|---|
| 嚴禁收集真實姓名／電話／WhatsApp | payload 嘅 name/phone/email/address 欄位直接拒收（永不入庫）；user_desc 內偵測到香港電話（8 位）／電郵格式自動遮蔽 |
| IP 必須 SHA-256 單向雜湊 | `SHA-256(CF-Connecting-IP + IP_HASH_SALT)`；加鹽防反推，原始 IP 永不入庫 |
| 保留期限 | 預設 730 日（`AI_LOG_TTL_DAYS` 可調），KV TTL 到期自動刪除 |
| 圖片去敏感化（可選） | 圖片備份預設關閉只存 URL；開啟 `BACKUP_IMAGES=true` 後備份至 KV，人臉模糊化可日後喺 Worker 加影像處理步驟 |
| 用戶告知 | 官網 /ai/ 專頁已同步加「數據收集聲明」（v9.47 同版上線） |

## 五、數據結構（ai_diagnosis_logs → KV 紀錄）

```json
{
  "id": "log_mxyz...",
  "session_id": "sess_98237129",
  "user_ip_hash": "e10adc3949ba59...（SHA-256+salt）",
  "district": "荃灣 (Tsuen Wan)",
  "user_description": "廚房見到有隻大老鼠（PII 已遮蔽）",
  "original_image_url": "https://udify.app/files/...",
  "image_urls": ["..."],
  "stored_image_path": "aicase:img:log_...（如有開備份）",
  "gpt_vision_output": "{\"species\": \"Rat\", \"confidence\": 0.85}",
  "final_response": "🐛 專員診斷結果：...",
  "created_at": "2026-10-13T20:25:00.000Z",
  "retention_days": 730
}
```

KV key：`ailog:<ISO時間>:<id>`（字典序＝時間序，admin/list 直接倒序取最近）；圖片備份 key：`aicase:img:<id>`。

## 六、方案一（討論區圖片 SEO 重命名）——已隨 v9.47 網站端上線

- 討論區前端（vote 頁）已內置 slugify 引擎：`pest-control-[district]-[pest]-[date]-[hash]`，地區＋害蟲由留言內容自動識別（18 區＋9 類害蟲），檔名規格同規格書 1.3 完全一致
- 留言圖片 `<img>` 自動帶 `alt`／`title`（規格書 1.4 範例格式：「荃灣區老鼠害蟲個案 - 苦主討論區求助圖片」）
- comment-worker 後端已加欄位驗證（slug 白名單 regex、alt/title 長度 200 上限＋sanitize）
- 管理員日後將討論區圖片整理上站時，直接採用 `img_slug` 作檔名即可延續 SEO 規格
