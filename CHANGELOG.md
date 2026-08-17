# 修復日誌 (v3.0 — 2026-08-17)

## 修復概覽

本次修復針對 bruceleehk.com 網站進行了全面性的 bug 檢測、安全升級與手機瀏覽體驗優化。所有修復均在保持整體架構不變的前提下進行。

---

## 🚨 關鍵 Bug 修復

### 1. 損壞的資源檔案
- **`assets/js/main.min.js`** — 原檔案在壓縮過程中被截斷，包含 `window.open('https:});` 等致命語法錯誤，導致 404 頁面所有 JavaScript 失效。已從 `main.js` 重新生成乾淨版本。
- **`assets/css/style.min.css`** — 原為空檔案，13 個頁面依賴此檔案但完全無樣式。已從 `style.css` 重新生成壓縮版本，並修正 `url('../img/hero-bg.jpg')` 路徑為 `url('/assets/img/hero-bg.jpg')`。

### 2. 模板佔位符 URL
所有 `url?id=N` 佔位符殘留在生產環境中，已全部修正：
- `index.html` IG/YouTube 連結
- `ai/index.html` canonical URL
- `info/vote/index.html` WhatsApp CTA 與 JSON-LD `url` 欄位
- `strategy/index.html` YouTube 連結（`https://www.youtube me.com` 含空格的錯誤域名）

### 3. PWA Manifest 缺失圖示
- `manifest.json` 引用 `/assets/img/logo-192.png` 與 `/assets/img/logo-512.png`，但這兩個檔案不存在，導致 PWA 安裝失敗。已從 `logo.png` 重新生成兩個尺寸的 PNG 圖示。
- 同時為 manifest 加入 `scope` 欄位，並區分 `any` / `maskable` 圖示用途。

### 4. 留言系統嚴重 Bug（vote 頁面）
- **XSS 漏洞**：`escapeHtml()` 沒有 escape 單引號 `'`，導致 `onclick="openImgModal('${item.image_url}')"` 可被惡意 image_url 注入。已：
  - 修正 `escapeHtml()` 同時 escape `'` → `&#39;`
  - 新增 `escapeAttr()` 函數
  - 移除所有動態生成 HTML 中的 inline `onclick`，改用 event delegation + `data-*` 屬性
- **回覆功能完全失效**：`startReply()` 函數調用 `document.getElementById('commentForm').scrollIntoView(...)`，但實際 DOM 中並沒有 `id="commentForm"` 的元素（真實 id 是 `mainCommentForm`）。已修正。
- **圖片上傳大小不匹配**：前端限制 4MB，後端 `comment-handler.js` 限制 500 字元，導致 4MB 圖片上傳永遠失敗。已統一為 5MB（前端 + 後端 + 錯誤訊息）。
- **Captcha 完全無效**：客戶端同時送出 `captcha_a`、`captcha_b`、`captcha_answer`，攻擊者可送 `{a:1, b:1, answer:2}` 繞過。已加入 honeypot 欄位作為真正的反 bot 防線。
- **`data.error` XSS**：`listEl.innerHTML = '載入留言失敗：${data.error}'` 未 escape。已使用 `escapeHtml()` 處理伺服器錯誤訊息。
- **JSON-LD URL 損壞**：`"url": "url?id=4vote/"` 已修正為 `"url": "https://bruceleehk.com/info/vote/"`。

### 5. 管理後台 XSS（admin.html）
- `escAttr()` 雖然 escape 了 `'` → `&#39;`，但 HTML parser 在解析 attribute 時會將 `&#39;` 解碼回 `'`，導致 `onclick="openLightbox('${image_url}')"` 仍可被攻擊。已：
  - 全面移除 inline `onclick`，改用 event delegation（`bindActionButtons()`）
  - 為 `escHtml()` 補上單引號 escape
  - 加入獨立的嚴格 CSP（不允許 udify.app 等第三方）

### 6. 部落格 Markdown 洩漏
- `info/blog-1/index.html` 有兩處 `**粗體**` Markdown 語法未渲染，直接以星號顯示。已替換為 `<strong>` 標籤。
- 同時修正 `blog-1` 的 canonical URL 與 JSON-LD `mainEntityOfPage`（原本錯誤指向 `/services/#termite`）。

### 7. 版權年份過期
- 13 個頁面硬編碼 `&copy; 2023`。已全部改為 `&copy; <span id="current-year">2026</span>` 動態年份（首頁、AI 頁、quote 頁已使用此機制）。

### 8. SEO 基礎問題
- `sitemap.xml` 缺少 `/ai/` 頁面，已補上。
- `robots.txt` 使用 `www.bruceleehk.com` 但 canonical 是 `bruceleehk.com`，已修正。
- `robots.txt` 加入 `Disallow: /info/vote/admin.html` 防止管理後台被收錄。
- 首頁 Open Graph 圖片使用相對路徑 `assets/img/og-cover.jpg`，已改為絕對路徑。
- `ai/` 與 `quote/` 頁面加入 `apple-touch-icon` 與 `manifest.json` 連結。

---

## 🔒 安全升級

### Cloudflare Worker (`comment-handler.js` v2.2 → v3.0)
- **CORS 反射弱點**：原本未知 origin 會 fall-back 至 `https://bruceleehk.com` 並允許 credentialed 跨域請求，任何惡意網站都能發起 credentialed 攻擊。已改為：未知 origin 不送出 ACAO 標頭。
- **安全標頭**：所有回應加入 `X-Content-Type-Options: nosniff`、`X-Frame-Options: DENY`、`Referrer-Policy: strict-origin-when-cross-origin`、`Cache-Control: no-store`。
- **請求大小限制**：原本 `request.json()` 接受無上限 payload，現限制 5.5MB（容納 5MB 圖片 + 中繼資料）。
- **遞迴刪除**：原本刪除留言只刪 1 層回覆，導致 reply-to-reply 變成孤兒。已改為 BFS 遞迴收集所有後代 ID 後一次刪除。
- **管理員 nickname 覆寫漏洞**：原本 `body.nickname || '滅蟲師傅'` 允許管理員（或竊取 secret 的攻擊者）以任意暱稱發佈「官方」回覆。已強制使用「滅蟲師傅」。
- **時序安全密鑰比較**：使用 `safeCompare()` 防止 side-channel attack。
- **嚴格 page_id 驗證**：加入白名單 regex `/^[A-Za-z0-9_-]{1,64}$/`。
- **圖片 URL 驗證**：必須為 `data:image/*` 或 `https://` 開頭。
- **公開 API 隱藏 client_ip**：`GET /api/comments` 不再回傳 `client_ip` 欄位。
- **內部錯誤訊息不外洩**：原本 `error: '伺服器內部錯誤：' + err.message`，已改為只回 `'伺服器內部錯誤'`（DEBUG 環境變數控制是否洩漏詳情）。
- **5 分鐘視窗速率限制**：每 IP 每 5 分鐘最多 5 條主留言 / 10 條回覆（保留原 60 秒硬性冷卻）。

### Cloudflare Worker (`comment-worker.js` — Turnstile 方案)
- 加入請求大小限制（5.5MB）。
- 加入 KV-based 速率限制（5 分鐘內 5 次）。
- 加入安全標頭（與 `comment-handler.js` 同）。
- Turnstile siteverify 加入 5 秒逾時保護。
- Formspree 轉發加入 10 秒逾時保護。
- 嚴格驗證 Turnstile 回應的 hostname。
- 同樣修正 CORS 反射弱點。

### HTML 頁面通用安全強化
- **Content-Security-Policy**：所有頁面加入 CSP meta 標頭（`default-src 'self'` + 受信任白名單）。CSP 限制 `script-src`、`style-src`、`img-src`、`connect-src`、`frame-src`、`object-src`、`base-uri`、`form-action`、`frame-ancestors`。
- **`rel="noopener noreferrer"`**：所有 `target="_blank"` 連結自動補上（防止 reverse tabnabbing）。
- **`<meta name="referrer">`**：所有頁面加入 `strict-origin-when-cross-origin`。
- **`<meta name="theme-color">`**：所有頁面加入 `#2c5e1a`（PWA 整合）。
- **管理後台**：使用更嚴格的 CSP（不允許 udify.app）+ `no-referrer` referrer policy。
- **Honeypot 欄位**：vote 頁面留言表單加入隱藏 honeypot 欄位（`name="website_url"`），bot 會填寫但人類不會，伺服器端偵測到後默默丟棄。

---

## 📱 手機瀏覽體驗優化

### 觸控與互動
- **`-webkit-tap-highlight-color: transparent`**：所有頁面移除 iOS 預設的灰色點擊高亮。
- **`touch-action: manipulation`**：所有 `<a>` 與 `<button>` 移除 300ms 點擊延遲。
- **`:focus-visible` 樣式**：為鍵盤使用者加入綠色 outline（`#10b981`），同時不影響滑鼠使用者。
- **`prefers-reduced-motion`**：尊重使用者作業系統的「減少動畫」設定，所有動畫與過渡降至 0.01ms。

### 行動選單無障礙化
- 13 個頁面的行動選單按鈕原本是 `<div class="menu-toggle">`，無法用鍵盤聚焦、沒有 `aria-expanded`。已改為 `<button>` 並加入：
  - `type="button"`
  - `aria-expanded="false"`（JS 動態切換）
  - `aria-controls="nav-links"`（指向被控制的導航）

### 圖片效能
- 所有 `<img>` 加入 `loading="lazy"` 與 `decoding="async"`（首頁 logo 除外，保留 `loading="eager"` 因為是 LCP 元素）。
- 首頁 logo 加入 `width="38" height="38"` 減少 CLS（Cumulative Layout Shift）。

### 跳到主內容連結（無障礙）
- 所有頁面在 `<body>` 開頭加入 `<a href="#main-content" class="skip-link">跳到主內容</a>`，鍵盤使用者可跳過導航。
- 第一個 `<main>` 元素自動加上 `id="main-content"`。

### 載入效能
- 所有外部 `<script src="...js">` 加入 `defer` 屬性，避免阻塞 HTML 解析。

---

## 📝 程式碼品質

- 移除重複的 `wrangler.toml.txt`（與 `wrangler.toml` 內容重複，且後者為亂碼編碼）。
- `wrangler.toml` 更新為 v3.0 文檔，記錄所有新功能與安全升級。
- `manifest.json` 加入 `scope` 欄位、`dir` 欄位、`purpose: "any"` 與 `purpose: "maskable"` 區分。
- 部落格頁面、services、strategy、404 頁面：版權年份改為動態更新。
- 修正 `_config.yml`、`README.md` 等文件（保留原始內容，架構不變）。

---

## ✅ 修復驗證

所有修改後的檔案均已通過以下驗證：
- `node --check` 檢查 JS 語法（main.min.js、main.js、bruceleehk.js、comment-handler.js、comment-worker.js）
- JSON-LD 區塊全部可被 `JSON.parse` 解析
- HTML 標籤開合數量平衡
- CSS 大括號數量平衡
- 所有 `url?id=` 佔位符、`youtube me.com` 錯誤域名、`<div class="menu-toggle">` 已移除
- 所有頁面均包含 CSP、viewport、charset、referrer、theme-color 等 meta 標頭
