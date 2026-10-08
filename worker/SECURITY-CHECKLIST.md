# 🛡️ 「封殺藏在細節裡魔鬼」— Cloudflare 安全強化執行清單（v9.35 配套）

> 對應方案：《封殺藏在細節裡魔鬼.docx》
> 代碼部分（地區封鎖／Turnstile 後端覆核／KV TTL 清理／CORS／金鑰清庫）已喺 v9.35 完成。
> 呢份清單係 **Cloudflare Dashboard 人手操作部分**——逐項打勾，全部免費。

---

## ⚠️ 第 0 步（最急切）：Dify 金鑰輪換 — 舊金鑰已外洩

舊版 `pest-vision-worker.js` 代碼入面明碼寫住 `DIFY_API_KEY: 'app-EOJa...'`，
而呢份代碼會上傳到 GitHub 公開倉庫 = **任何人都睇到**，可以直接繞過你個 Worker
燒你嘅 Dify 帳戶餘額。CORS 鎖得再好都無用，因為黑客根本唔經你個網站。

1. 登入 Dify 後台 → 右上角頭像 → **API Settings**
2. 對舊 API Key 撳 **刪除（Revoke）** → **Create New Secret Key**
3. 複製新 Key（`app-` 開頭），下一步即刻用得着
4. 舊 Key 刪除後，全世界用舊 Key 嘅請求即刻全部 401 — 黑客燒唔到你的钱

## 第 1 步：設定 Worker Secrets（兩個 Worker 都要做）

### pest-vision-worker（AI 診斷）
Dashboard → Workers & Pages → **pest-vision-worker** → Settings →
Variables and Secrets → Add：
| Type | Name | Value |
|------|------|-------|
| Secret | `DIFY_API_KEY` | （第 0 步輪換嘅新 Key） |
| Secret/Text | `BLOCKED_COUNTRIES` | `RU,IN,KP`（默認值，可加：`RU,IN,KP,VN,ID`；設 `none` 停用） |

### comment-handler（留言系統）
Dashboard → Workers & Pages → **comment-handler** → Settings →
Variables and Secrets → Add：
| Type | Name | Value |
|------|------|-------|
| Secret | `TURNSTILE_SECRET_KEY` | （第 2 步取得） |
| Secret/Text | `BLOCKED_COUNTRIES` | `RU,IN,KP` |

## 第 2 步：建立 Turnstile 驗證碼（免費）

1. Dashboard → **Turnstile** → Add site
2. Site name：`bruceleehk-comments`；Domain 加：`bruceleehk.com` 同 `www.bruceleehk.com`
3. Widget Mode 揀 **Managed**（大多數人無感通過，可疑先彈挑戰）
4. 撳 Create 後取得兩條 Key：
   - **Site Key**（公開冇所謂）→ 貼入網站代碼（第 3 步）
   - **Secret Key**（保密）→ 已喺第 1 步設定入去 comment-handler

> 分階段啟用設計：Secret 設定咗、網站未貼 Site Key 之前，
> 後端會自動跳過驗證（留言照常運作）；Site Key 貼好重新部署後即刻全鏈路生效。

## 第 3 步：將 Site Key 貼入網站（兩個檔案）

- `info/vote/index.html`：搵 `var TURNSTILE_SITEKEY = '';` → 貼入 Site Key
- `en/info/vote/index.html`：同上

改完照舊 GitHub Desktop 覆蓋 → Commit → Push。
（此步可與 v9.35 覆蓋同步做：解壓 v9.35 → 改兩個 sitekey → 再全選覆蓋）

## 第 4 步：WAF Rate Limiting（邊緣攔截，唔到 Worker 先攔）

Dashboard → 安全性 → **WAF** → Rate limiting rules → Create rule：
- 名稱：`comment-api-ratelimit`
- 表達式（或用視覺化編輯器揀）：
  ```
  (http.request.uri.path eq "/api/comments" and http.request.method eq "POST")
  ```
- Rate：**3 requests → 10 minutes → Same IP**
- Action：**Block**（期限內直接踢走，連 Worker 都掂唔到）
- 免費版有 1 條 Rate Limiting 規則額度，用喺呢度最抵

> 呢條規則達成方案文檔「魔鬼細節 2」：惡意請求喺 Cloudflare 邊緣節點就被踢，
> 唔會消耗你嘅 Worker 請求次數同 CPU 時間。Worker 內部嘅 1小時/日3則配額
> 繼續保留做第二道保險。

## 第 5 步：WAF 地區規則（俄羅斯／印度／朝鮮等攔喺萌芽）

Dashboard → 安全性 → WAF → **Custom rules** → Create rule：
- 名稱：`block-risky-regions-api`
- 表達式：
  ```
  (starts_with(http.request.uri.path, "/api/") and ip.geoip.country ne "HK")
  ```
- Action：**Managed Challenge**（推薦）— 可疑流量人機挑戰，真港人出遊不誤傷
- 想更狠可改 **Block**（徹底封死，但海外港人留言都會被擋——佢哋仲有 WhatsApp 搵師傅，影響可控）

> Worker 內置嘅 RU/IN/KP 硬封鎖係第三道保險：就算 WAF 規則被人刪咗或者到期，
> 代碼層面照樣擋到三國請求（403 GEO_BLOCKED）。

## 第 6 步：部署順序與驗證

1. 先完成第 0、1 步（金鑰輪換 + Secrets）
2. 部署新 worker 代碼：
   - comment-handler：貼上 `comment-handler.js` 全文 → Save and Deploy
   - pest-vision-worker：貼上 `pest-vision-worker.js` 全文 → Save and Deploy
3. 驗證：
   - 開 `https://pest-vision-worker.cedars5282.workers.dev/health`
     → 應顯示 `"version":"9.3-MoE-Hardened"`、`"dify_key_set":true`
   - 開 `https://comment-handler.cedars5282.workers.dev/api/health`
     → 應顯示 `"version":"6.0"`、`"turnstile_enforced":true`（設咗 Secret 後）
   - AI 診斷頁試上載一張相 → 出報告 = 金鑰輪換成功無整爛服務
   - 留言板試發一則留言 → 正常直出 = 零回歸

## 第 7 步：日常監控（每月 5 分鐘）

- Dashboard → **安全性 → Security Insights**：睇整體威脅趨勢
- Dashboard → 安全性 → WAF → **Events（事件記錄）**：過濾 action=Block/Challenge，
  睇下邊個國家、邊條路徑被打得多
- 如果見到某地區異常暴量 → 第 5 步條規則加國家，或 Worker 環境變數
  `BLOCKED_COUNTRIES` 加碼，即刻生效唔使改代碼
- Dify 後台留意 API 用量曲線：正常應該同網站流量同步；
  如果突然暴升但網站冇咁多访客 → 即刻檢查有冇人盜用（輪換金鑰）

---

## v9.35 代碼層已封殺清單（對應方案文檔）

| 方案「魔鬼細節」 | 封殺位置 | 狀態 |
|---|---|---|
| 細節 1：只做前端 Turnstile 驗證 | comment-handler.js v6.0 — siteverify 後端二次核對 | ✅ 代碼完成（設 Secret 即生效） |
| 細節 2：Rate Limiting 寫錯位置 | WAF Rate Limiting（第 4 步）＋ Worker 配額保留 | ✅ 清單指引 |
| 細節 3：垃圾留言塞爆 KV | 寫入時自動剔除 >365 日普通留言（置頂/官方除外） | ✅ 代碼完成 |
| 細節 5：API 被其他網站白嫖 | CORS 白名單早已鎖定（v3.0）＋ 本次金鑰清庫 + 地區封鎖 | ✅ 完成 |
| 總結：非香港 IP 提交表單 | WAF Custom rule（第 5 步）＋ Worker 內置三國硬封鎖 | ✅ 清單＋代碼 |
| 額外：Dify 金鑰明碼外洩 | 代碼清庫（fail-closed）＋ 第 0 步輪換 | ✅ 代碼＋清單 |
