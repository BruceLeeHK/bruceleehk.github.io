# 修復日誌 (v3.1 — 2026-08-17)

## 本次修復概覽

針對用戶反饋嘅三大問題進行深度修復，同時保留原有架構：

1. **AI 害蟲分析系統圖片上傳失敗**
2. **留言管理後臺無法登入（提示密碼錯誤）**
3. **services / strategy / info 三個頁面版式與首頁不一致**

---

## 🔧 問題一：AI 圖片上傳「網路連線或 AI 分析逾時」

### 根本原因（已實際測試 Worker 端點確認）
- 客戶端上傳 5MB 圖片 → 轉成 base64 後膨脹至 ~6.7MB → Worker 處理時間過長
- `pest-vision-worker.cedars5282.workers.dev` 回傳 **HTTP 500 + 5016 錯誤**：
  ```
  Prior to using this model, you must submit the prompt 'agree'.
  By submitting 'agree', you hereby agree to the llama-3.2-11b-vision-instruct
  Community License...
  ```
  Cloudflare Workers AI 嘅 Llama 3.2 Vision 模型需要先送出 "agree" prompt 同意授權，但用戶嘅 Worker 從未送出此 prompt。

### 客戶端修復（`assets/js/bruceleehk.js` v3.1）
- ✅ **新增客戶端圖片壓縮**：上傳前用 Canvas API 將圖片壓縮至最大 1024px + JPEG 0.85（5MB → ~200KB）
- ✅ **20 秒 AbortController 逾時保護**：避免 Worker AI 卡死時前端無止境等待
- ✅ **平滑降級機制**：AI Worker 失敗時不再彈出 scary alert，改為：
  - 顯示黃色提示卡「AI 辨識暫時無法使用，請手動選擇害蟲類型」
  - 提供害蟲類型按鈕（曱甴 / 木蝨 / 老鼠 / 白蟻 / 蚊 / 螞蟻 / 蜂 / 蜈蚣 / 衣魚 / 蜘蛛）
  - 用戶選擇後立即填入完整分析報告 + WhatsApp 預約連結
  - 報告會標示「本地分析」vs「AI 視覺」來源
- ✅ **擴充本地策略庫**：從原本 6 種害蟲擴充到 11 種，並新增別名（蟑螂 = 曱甴、床蝨 = 木蝨 等）
- ✅ **檔案類型驗證**：只接受 JPG/PNG/WebP/GIF，拒絕其他格式

### Worker 端修復（新增 `worker/pest-vision-worker.js` v3.0）
- ✅ **Llama 3.2 授權同意機制**：首次呼叫前先送出 `agree` prompt，並用 KV 快取已同意狀態（24 小時 TTL）
- ✅ **25 秒 AbortController 逾時保護**
- ✅ **改進 prompt 模板**：明確要求 AI 回傳純 JSON（剝離 markdown 圍欄）
- ✅ **加入 CORS 白名單**（不再反射任意 origin）
- ✅ **加入安全標頭**：X-Content-Type-Options、X-Frame-Options、Referrer-Policy
- ✅ **請求大小限制**：10MB 上限
- ✅ **結構化錯誤回應**：每個錯誤都有 `code` 欄位方便前端判斷

### 部署指引
- 用戶需重新部署 `worker/pest-vision-worker.js`
- 必須在 Cloudflare Dashboard 加入兩個 binding：
  1. **Workers AI binding** — 變數名稱必須為 `AI`
  2. **KV Namespace binding** — 變數名稱 `PEST_KV`（用於快取授權狀態）
- 詳細設定請見 `worker/wrangler-pest-vision.toml`

---

## 🔧 問題二：留言管理後臺無法登入

### 根本原因（已實際測試 Worker 端點確認）
```
$ curl -X POST https://comment-handler.cedars5282.workers.dev/api/admin/list \
    -H "Origin: https://bruceleehk.com" \
    -d '{"secret":"any_password"}'
→ HTTP 403 {"success":false,"error":"未設定管理員密鑰"}
```
- Worker 已部署，KV 已綁定，但 **`ADMIN_SECRET` 環境變數從未設定**
- 用戶以為自己設定了密碼，但實際上 Worker 端 `env.ADMIN_SECRET` 為 `undefined`
- 前端 `admin.html` 收到 403 後顯示通用「密鑰錯誤！請檢查 ADMIN_SECRET」，誤導用戶以為密碼本身錯了

### Worker 端修復（`worker/comment-handler.js` v3.1）
- ✅ **新增 `ADMIN_SECRET_NOT_SET` 專屬錯誤碼**：當 `env.ADMIN_SECRET` 為空時，回傳此錯誤碼而非通用「密鑰錯誤」
- ✅ **新增 `verifySecret()` 統一密鑰驗證 helper**：所有 admin API 共用同一邏輯
- ✅ **時序安全密鑰比較** `safeCompare()`：防止 side-channel attack
- ✅ **自動 trim 兩端空白**：避免複製貼上時嘅空白差異導致比對失敗
- ✅ **新增 `POST /api/admin/test` 端點**：可單獨測試密鑰是否正確，不載入留言
- ✅ **`/api/health` 加入 `admin_secret_set` 欄位**：前端可預先知道是否已設定 ADMIN_SECRET
- ✅ **內部錯誤訊息不外洩**：原本 `error: '伺服器內部錯誤：' + err.message`，改為只回 `'伺服器內部錯誤'`

### 前端修復（`info/vote/admin.html`）
- ✅ **顯示伺服器實際錯誤**：原本不論 403 原因都顯示「密鑰錯誤」，現改為：
  - 若錯誤碼為 `ADMIN_SECRET_NOT_SET`：顯示詳細設定指引（含 Cloudflare Dashboard 路徑 + `wrangler secret put` 命令）
  - 否則顯示伺服器實際錯誤訊息
- ✅ **修正重複 viewport meta**：原本有兩個 viewport meta，已移除重複
- ✅ **修正 `escHtml()` 未 escape 單引號**：補上 `&#39;`
- ✅ **加入專屬 CSP**：不允許 udify.app 等第三方資源
- ✅ **加入 `no-referrer` referrer policy**：防止管理後台 URL 洩漏
- ✅ **inline onclick 全面替換為 event delegation**：避免 XSS（`bindActionButtons()`）

### 部署指引
- 用戶需重新部署 `worker/comment-handler.js` v3.1
- **必須重新設定 ADMIN_SECRET**：
  ```bash
  npx wrangler secret put ADMIN_SECRET
  # 輸入你的密碼（建議 32+ 字元隨機字串）
  ```
  或透過 Cloudflare Dashboard → Workers & Pages → comment-handler → Settings → Variables and Secrets → Add → Type: Secret → Name: ADMIN_SECRET → Value: 你的密碼 → Save and Deploy

---

## 🔧 問題三：services / strategy / info 頁面與首頁風格不一致

### 重新設計（保持原內容，套用首頁現代科技感設計）

三個頁面全部從原本嘅舊版 `style.min.css`（綠色 `#2c5e1a`、平面卡片、無 hover 效果）改為：
- 採用首頁嘅設計 token：emerald 綠 `#10b981` + tech-blue `#0284c7` + dark-bg `#0f172a`
- 使用首頁嘅 `bruceleehk.css` 作為基礎樣式
- 每頁都有：
  - **深色 Hero 區**：linear-gradient + radial glow 動畫 + 科技徽章
  - **導航列**：與首頁完全一致（sticky header、漸變 logo、WhatsApp 圓鈕）
  - **頁尾**：與首頁完全一致（社群圖示、動態年份）
  - **行動裝置底部固定 CTA 列**：電話 + WhatsApp 按鈕
  - **卡片**：hover 上浮 + 漸變 accent 邊框（top border 動畫）
  - **CTA Box**：漸變背景 + radial 光暈
  - **Skip-link 無障無障礙**：鍵盤使用者可跳到主內容

### `services/index.html`（蟲類服務）
- 4 個現代化服務卡片（曱甴 / 滅蚊滅鼠 / 床蝨 / 白蟻）
- 每個卡片有：
  - 編號徽章（SERVICE 01-04）
  - 漸變圖示方塊（service-card-icon）
  - 標籤芯片（德國曱甴 / 美國曱甴 / IGR 等）
  - 完整服務說明（保留原文）
  - 漸層定價盒（pricing-box 帶 accent border）
- 服務快速導航條（service-icon-pill）
- 底部 CTA：WhatsApp + 線上報價

### `strategy/index.html`（有蟲就有計）
- 8 個策略卡片，每個有：
  - 漸變編號方塊（01-08）
  - 策略名稱用漸變字體（tactic-name）
  - 害蟲圖示方塊（pest-icon-large）
  - 完整策略說明（保留原文）
  - 行內提示卡（inline-hint）連結至苦主討論區
- 中段 + 末段 SEO 導流 Banner（黃色漸變）
- 底部三按鈕 CTA：參與票選 / 前往討論區 / WhatsApp

### `info/index.html`（蟲類資訊）
- 1 個大型特色卡片（featured-card）：2026 全港害蟲票選漸變卡片
- 8 個部落格卡片網格（blog-grid）：
  - 每個卡片有分類徽章、標題、摘要、日期 + 閱讀全文連結
  - hover 上浮 + 漸變 accent 邊框
- 底部深色 CTA Box：WhatsApp / 線上報價 / AI 診斷

---

## 📦 完整修復清單

### 已修復嘅 Bug
| # | 問題 | 檔案 | 狀態 |
|---|------|------|------|
| 1 | AI 上傳失敗（Llama 3.2 未同意授權） | `worker/pest-vision-worker.js` | ✅ 新建 |
| 2 | AI 上傳 5MB payload 過大 | `assets/js/bruceleehk.js` | ✅ 加入壓縮 |
| 3 | AI 無逾時保護 | `assets/js/bruceleehk.js` + Worker | ✅ 20s + 25s |
| 4 | AI 失敗彈出 scary alert | `assets/js/bruceleehk.js` | ✅ 改為降級選擇 |
| 5 | Admin 顯示「密碼錯碼錯誤」誤導 | `info/vote/admin.html` | ✅ 顯示實際錯誤 |
| 6 | ADMIN_SECRET 未設定無明確錯誤碼 | `worker/comment-handler.js` | ✅ `ADMIN_SECRET_NOT_SET` |
| 7 | 密鑰比較無時序安全 | `worker/comment-handler.js` | ✅ `safeCompare()` |
| 8 | 密鑰比較不 trim 空白 | `worker/comment-handler.js` | ✅ 自動 trim |
| 9 | Admin inline onclick XSS | `info/vote/admin.html` | ✅ event delegation |
| 10 | Vote 頁面 escapeHtml 不 escape 單引號 | `info/vote/index.html` | ✅ 補上 `&#39;` |
| 11 | Vote 頁面 data.error XSS | `info/vote/index.html` | ✅ escapeHtml 處理 |
| 12 | Vote 頁面回覆按鈕 ID 錯誤 | `info/vote/index.html` | ✅ `mainCommentForm` |
| 13 | 圖片上傳前後端限制不匹配 | `info/vote/index.html` | ✅ 統一 5MB |
| 14 | 留言無 honeypot 反 bot | `info/vote/index.html` + Worker | ✅ 加入 |
| 15 | services/strategy/info 版面陳舊 | 三個 index.html | ✅ 全面重新設計 |
| 16 | 版權年份過期（2023） | 全部頁面 | ✅ 動態 2026 |
| 17 | sitemap.xml 缺少 /ai/ | `sitemap.xml` | ✅ 補上 |
| 18 | robots.txt 域名錯 | `robots.txt` | ✅ 修正 |
| 19 | manifest.json 缺圖示 | `manifest.json` + 圖示 | ✅ 生成 192/512 |
| 20 | style.min.css 為空 | `assets/css/style.min.css` | ✅ 從 style.css 重新生成 |
| 21 | main.min.js 語法錯誤 | `assets/js/main.min.js` | ✅ 從 main.js 重新生成 |
| 22 | menu-toggle 是 div | 全部頁面 | ✅ 改為 `<button>` + ARIA |
| 23 | 無 CSP 安全標頭 | 全部頁面 | ✅ 加入完整 CSP |
| 24 | 無 defer / loading=lazy | 全部頁面 | ✅ 全面加入 |
| 25 | 無 rel=noopener | 全部 target=_blank | ✅ 全面加入 |

### 新增檔案
- `worker/pest-vision-worker.js` — 全新嘅 AI Worker（含 Llama 3.2 授權同意機制）
- `worker/wrangler-pest-vision.toml` — AI Worker 嘅配置範本

### 修改檔案（17 個 HTML + 3 個 JS + 2 個 CSS + 2 個 Worker + 4 個 meta 檔）
- 18 個 HTML 頁面
- `assets/js/bruceleehk.js` v3.1
- `assets/js/main.min.js`（重新生成）
- `assets/css/style.min.css`（重新生成）
- `worker/comment-handler.js` v3.1
- `worker/comment-worker.js` v3.0
- `worker/wrangler.toml` v3.1
- `manifest.json`
- `sitemap.xml`
- `robots.txt`

---

## 🚀 部署步驟

### 1. 部署靜態網站
將整個 `bruceleehk-fixed-v2` 資料夾上傳至 GitHub Pages / Cloudflare Pages / Netlify。

### 2. 部署留言系統 Worker (`comment-handler.js`)
```bash
cd worker
npx wrangler deploy
# 設定 ADMIN_SECRET（重要！）
npx wrangler secret put ADMIN_SECRET
# 輸入密碼
```

### 3. 部署 AI 視覺辨識 Worker (`pest-vision-worker.js`)（新）
- Cloudflare Dashboard → Workers & Pages → Create Worker → 命名 `pest-vision-worker`
- 貼上 `worker/pest-vision-worker.js` → Save and Deploy
- Settings → Bindings → Add：
  - **Workers AI** → 變數名稱 `AI`
  - **KV Namespace** → 變數名稱 `PEST_KV`（先建立一個 KV namespace，例如 `pest-vision-cache`）
- 部署完成後測試：`https://pest-vision-worker.cedars5282.workers.dev/health` 應回傳 `{"status":"ok",...}`

### 4. 驗證
- 訪問 https://bruceleehk.com/info/vote/admin.html，輸入剛設定的 ADMIN_SECRET，應能成功登入
- 訪問 https://bruceleehk.com/ai/，上傳害蟲相片，AI 應能成功辨識
- 如果 AI 仍失敗，會自動降級為「選擇害蟲類型」流程，用戶仍可獲得完整分析報告
