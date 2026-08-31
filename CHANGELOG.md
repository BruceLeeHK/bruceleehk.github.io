# 修復日誌 (v9.3 — 2026-08-31)

## v9.3 新增：遙距滅蟲服務（SERVICE 05）+ 海外業主遠程滅蟲攻略文章

### 🌍 新增內容

1. **服務頁 `/services/` 新增 SERVICE 05「遙距滅蟲 / 海外業主代辦」**（位於白蟻防治 SERVICE 04 之後）：
   - 專業服務快捷導覽帶新增第 5 個按鈕「遙距滅蟲」（地球 icon，錨點跳轉 `#remote`）
   - 服務標籤：海外港人專屬／全程相片彙報／AI 零時差診斷／交吉起租必備
   - 服務特色與收費：全程遙距監工（施工前後相片/影片對比）／零時差對接（WhatsApp 國際專線＋24 小時 AI）／交吉起租深層防治（由 HK$1,500 起）／多渠道跨國付款
   - 文中連結 `/ai/`（7x24 AI 害蟲分析系統）及 `/info/blog-10/`（攻略文章），與新文章互相呼應
   - **JSON-LD**：新增 Service 結構化數據（serviceType: Remote Pest Control，areaServed 涵蓋香港/英國/加拿大/澳洲）
   - meta description/keywords 加入「遙距滅蟲、海外業主、出租屋滅蟲代辦、交吉滅蟲」等長尾關鍵詞（中英簡三語）

2. **新文章頁面 `/info/blog-10/`**：《【海外業主必讀】移民海外如何遙距處理香港物業蟲患？業主遠程滅蟲全攻略！》
   - 文章結構：引言 → 3 大蟲患場景（出租物業／幫留港家人預約／交吉起租）→ 3 大痛點（時差／信任監工／付款單據）→ 3 招解決（AI 零時差診斷／全程相片彙報／跨國支付）→ 遙距預約 4 步曲 → 結語 → CTA → 5 條 FAQ
   - **對比圖區塊**：「傳統困局：隔洋乾著急 VS 遙距新章：零時差監工」並排對比卡（手機自動堆疊），AI 生成配圖（webp 51/64KB + jpg 94/112KB 雙格式）
   - **內部連結（與遙距滅蟲服務相呼應）**：
     - 遙距滅蟲代辦服務 → `/services/#remote`（雙向連結核心）
     - AI 害蟲圖像診斷器／7x24 AI 害蟲診斷 → `/ai/`
     - 滅蟲師傅（BruceLeeHK）／滅蟲師傅網站 → `/`（首頁）
     - IPM 綜合防治 → `/info/blog-7/`
     - 床蝨（木蝨） → `/services/#bedbug`
   - **SEO 結構化數據**：BreadcrumbList + Article + FAQPage 三段 JSON-LD
   - Meta Title/Description/Keywords 按文章文檔建議設定（涵蓋香港遙距滅蟲、海外業主香港滅蟲、出租屋滅蟲代辦等長尾詞）

3. **英文服務頁 `/en/services/`**：新增 "🌍 Remote Pest Control / Overseas Owner Service" 卡片（呼應海外客群）

4. **資訊列表頁**：中文版 `/info/` 及英文版 `/en/info/` 均新增 blog-10 卡片

5. **sitemap.xml**：新增 blog-10 URL（lastmod 2026-08-31）；services 及 en/services lastmod 更新

### 🎯 設計原則

- 網站原有架構、設計風格、既有內容 100% 不變（blog-10 完整複用 blog-9 已驗證嘅 CSS 框架）
- SERVICE 05 沿用既有 modern-card／number-badge／service-tags／pricing-box 組件，零新 CSS

---

# 修復日誌 (v9.2 — 2026-08-29)

## v9.2 新增：AI 行業趨勢 Blog 文章 + SEO 內部連結強化

### 📰 新增內容

1. **新文章頁面 `/info/blog-9/`**：《【行業顛覆】傳統滅蟲師傅會被 AI 淘汰？探討 AI 智慧滅蟲與人工經驗的「共贏」新未來！》
   - 文章結構：引言 → 3 大章節（AI 與師傅合作互補／AI 算力補足經驗短板／O2O 共贏商業模式）→ 結語 → CTA → 5 條 FAQ
   - **對比圖區塊**：新增「傳統年代：電筒斷估 VS AI 年代：數據斷症」並排對比卡（手機自動堆疊），AI 生成配圖（webp 51KB + jpg 102KB 雙格式）
   - **內部連結（Internal Linking）**：文中加粗關鍵詞全部設為 hyperlink，強化 Google 站點結構評分——
     - 三十六計精準防治／滅蟲智庫 → `/strategy/`
     - 上門滅蟲服務／IoT 智慧監測追蹤 → `/services/`
     - AI 害蟲圖像識別／AI 智慧滅蟲 → `/ai/`
     - 滅蟲收費估價 → `/quote/`
     - 綜合防治理念（IPM） → `/info/blog-7/`
     - 香港滅蟲公司 → `/`（首頁）
   - **SEO 結構化數據**：BreadcrumbList + Article + FAQPage 三段 JSON-LD（豐富摘要觸發 FAQ 折疊顯示）
   - FAQ 採用原生 `<details>/<summary>` 手風琴（零 JS、無障礙、避免 blog-8 的 onclick 缺陷方案）

2. **資訊列表頁**：中文版 `/info/` 及英文版 `/en/info/` 均新增 blog-9 卡片

3. **sitemap.xml**：新增 blog-9 URL（lastmod 2026-08-29）

### 🎯 首頁及 Worker 同步升級（v9.1）

4. **首頁 `index.html` → v9.1**：可選補充描述框（50 字封頂）＋前端清洗＋信賴徽章；本次補回 v5.3 的 CLS 圖片尺寸屬性（3 張 smart-card + 4 張 video 卡圖）

5. **Worker `pest-vision-worker.js` → v9.1**：多模態上下文先驗（user_desc 白名單清洗＋攻擊絆線＋50 字封印）＋快取鍵 v2＋雙通道傳送＋假死攔截

---

# 修復日誌 (v5.3 — 2026-08-26)

## v5.3 全面診斷優化（本次修復）

針對用戶反饋嘅三大問題（AI 診斷網絡連線超時、投票系統圖片顯示、PageSpeed 性能）完成 6 大修復：

### 🔧 問題 1：AI 診斷系統 [網絡連線超時] 修復

**根因分析：**
- 前端 `fetch()` 無逾時保護，AI 模型卡死時無法及時回饋
- CSP `img-src` 未包含 `blob:`，導致 `URL.createObjectURL()` 預覽圖片被封鎖
- 後端 Worker 嘅 `base64` 逐字元轉換喺大圖片時觸發 CPU 限制，回傳 500 錯誤
- 錯誤訊息籠統，一律顯示「網絡連線超時」誤導用戶

**修復措施：**
1. **24 個 HTML 頁面** CSP 全部加上 `blob:` 至 `img-src` 指令
2. **前端加入 30 秒 AbortController** 逾時保護，比 Worker 端 25s 稍長，讓 Worker 的 504 訊息先回來
3. **後端 Worker base64 改用 32KB 分塊處理**（v5.3 性能優化），避免逐字元 loop 觸發 CPU 限制
4. **按錯誤碼提供精準訊息**：`AI_TIMEOUT` / `AI_FAILED` / `AI_NOT_BOUND` / `REQUEST_TOO_LARGE` 各有專屬提示
5. **按鈕加 spinner + 防重複點擊**，避免用戶誤觸多次發送

### 🔧 問題 2：投票系統苦主留言區 圖片上傳＋HD 放大

**根因分析：**
- 舊版僅生成一個 1200px 中等圖，列表縮圖與 lightbox 放大均用同一張，體積過大、放大後又唔夠清
- 缺少即時預覽，用戶上傳後無反饋
- EN 版留言區根本無 GLightbox，圖片無法點擊放大

**修復措施：**
1. **雙尺寸圖片生成**：
   - HD 大圖：max 1600px × JPEG q=0.92（~150-400KB）— 用於 lightbox 放大顯示
   - 列表縮圖：max 400px × JPEG q=0.7（~20-50KB）— 用於列表快速載入
2. **後端 Worker 已支援 `thumb_url` 字段儲存**（沿用既有 schema）
3. **前端渲染分離 src 與 href**：`<img src="thumb_url">` + `<a href="image_url" class="glightbox">`，點擊放大顯示 HD 版本
4. **加入即時 inline 預覽**：選取圖片後立即顯示縮圖，無需等待 canvas 壓縮
5. **EN 版留言區補齊 GLightbox 庫**（CSS + JS）與事件綁定，與中文版功能對齊
6. **fallback 機制**：舊留言無 `thumb_url` 時自動 fallback 用 `image_url` 作為縮圖

### 🔧 問題 3：PageSpeed Insights 性能優化（目標 90+）

**修復措施：**
1. **20 張圖片補上 `width` 與 `height` 屬性**（覆蓋 index.html / 404.html / quote / ai / en/* 等 6 個頁面），消除 CLS（Cumulative Layout Shift）
2. **GLightbox CSS 改用 preload 異步載入**模式（原為同步 render-blocking）
3. **GLightbox JS 加 `defer` 屬性**，避免阻塞首屏渲染
4. **`_headers` 加入 `X-XSS-Protection: 1; mode=block`** 強化安全標頭
5. 既有優化保留：WebP 圖片、Font Awesome preload、Hero 圖 preload、`loading="lazy"`、`decoding="async"`、長快取等

### 🔧 額外修復

1. **`en/ai/index.html` 修復未關閉嘅 `<script>` 標籤**（原先導致 HTML 結構異常）
2. **`/ai/` 頁面 AI fetch 改用 pest-vision-worker** 統一端點，並加入 30 秒逾時保護
3. **`/ai/` 頁面錯誤處理改善**：區分 AbortError / Failed to fetch / 其他錯誤，訊息更精準

### 📦 修復覆蓋範圍

| 類別 | 修改檔案數 | 關鍵改動 |
|------|-----------|---------|
| CSP 修復 | 24 個 HTML | 全部加上 `blob:` 至 `img-src` |
| 圖片尺寸 | 6 個 HTML | 20 張圖片加 width/height |
| AI 診斷 | index.html + ai/index.html | AbortController + 精準錯誤訊息 |
| Worker 後端 | pest-vision-worker.js | 分塊 base64 轉換 |
| 投票圖片 | info/vote + en/info/vote | HD+縮圖雙尺寸 + GLightbox |
| 安全標頭 | _headers | X-XSS-Protection |
| HTML 結構 | en/ai/index.html | 修復未關閉 script 標籤 |

---

## v3.3 — 2026-08-17

## 本次修復概覽

基於用戶反饋與兩份 Google Search Console 文件，完成 3 大優化：

1. **info/blog-1 ~ blog-8 全部 8 篇文章重新設計**（與首頁一致的現代科技風格）
2. **修正 Google Search Console 偵測到的無效項目**（aggregateRating 結構化資料錯誤）
3. **移除 quote 頁面頂部 WhatsApp 圖示**

---

## 🔧 問題 1：blog-1 ~ blog-8 全面重新設計

### 完成事項

將 8 篇蟲類資訊文章全部從舊版綠色 `#2c5e1a` 平面卡片風格，重新設計為與首頁一致的現代科技感：

| 頁面 | 標題 | 行數 |
|------|------|------|
| blog-1 | 2026 滅蟲公司邊間好？5 大指標避坑 | ~36KB |
| blog-2 | 2026年「滅蟲師傅」的專業新視角 | ~34KB |
| blog-3 | 2026 滅蟲公司推介 — 專業根治白蟻/木蝨 | ~35KB |
| blog-4 | 家居滅蟲/白蟻/木蝨根治方案 | ~35KB |
| blog-5 | 家居床蝨檢查、治理及預防攻略 | ~36KB |
| blog-6 | 如何正確辨別白蟻及螞蟻 | ~37KB |
| blog-7 | 2026 滅蟲公司收費點計算？全港行情一覽 | ~50KB |
| blog-8 | 點解滅蟲藥越用越無效？害蟲抗藥性真相 | ~44KB |

### 每篇文章都套用：
- **深色 Hero 區**：linear-gradient + radial glow 動畫 + 科技徽章（蟲類資訊 / 專業指南 / 實戰心得）
- **「✨ 智慧滅蟲梗喺滅蟲師傅啦」slogan**：綠色藥丸標籤
- **文章標題 Hero**：使用文章 H2 標題作為 Hero 大標
- **WhatsApp CTA + 返回資訊列表**：雙按鈕
- **現代化文章卡片**：
  - 白色背景 + 圓角 + accent border-top 漸變（emerald → tech-blue）
  - 陰影 + hover 上浮效果
  - 返回連結帶 hover 動畫（gap 增大）
  - 分類徽章漸變背景 + 陰影
  - 日期帶 Font Awesome 圖示
  - 文章標題加粗 + 字距優化
  - H3 帶 accent bar（左側漸變垂直條）
  - 段落 line-height 1.95 提升可讀性
  - 強調文字使用 primary-dark 綠色
  - 列表 marker 使用 primary 綠色
- **行內提示卡（inline-discussion-hint）**：漸變背景 + accent border-left
- **SEO 導流 Banner（vote-redirect-banner）**：黃色漸變 + 漸變 CTA 按鈕
- **收費表格（price-table）**：漸變表頭 + 隔行變色
- **定價盒（pricing-box）**：accent border-left + 漸變背景
- **CTA Box（blog-cta-box）**：漸變背景 + radial 光暈 + 多按鈕
- **標籤（tags）**：emerald-light 背景 + accent border
- **與首頁完全一致的導航與頁尾**
- **行動裝置底部固定 WhatsApp CTA**

### 保留所有原內容
- 所有文章正文（段落、標題、列表、表格）
- 所有 JSON-LD 區塊（BreadcrumbList + Article + FAQPage）
- 所有 SEO meta 標籤
- 所有圖片與連結

---

## 🔧 問題 2：Google Search Console 無效項目修正

### 問題診斷
根據用戶提供的兩份 docx 文件：
1. **偵測到 1 個無效項目.docx**：顯示首頁 JSON-LD 結構化資料被 Google 標記為無效
2. **Google Search Console 驗證修正.docx**：解釋問題出在 `aggregateRating` 的父子節點結構

### 根本原因
首頁 `index.html` 的 JSON-LD 中 `aggregateRating` 存在以下問題：
1. `ratingValue: "4.9"` 是**字串**，應為**數值**
2. `reviewCount: "10000"` 是**字串**，應為**整數**
3. 缺少 `@id` 屬性（Google 要求 LocalBusiness 類型必須有）
4. `image` 是簡單字串，應為 `ImageObject` 類型
5. `areaServed` 是簡單字串，應為 `Place` 類型
6. `openingHours` 是簡單字串，應改為 `openingHoursSpecification` 結構
7. 缺少 `review` 屬性（Google 要求 aggregateRating 必須搭配至少一個 review）

### 修正方案
完全重寫首頁 JSON-LD，符合 Google Rich Results 標準：

```json
{
    "@context": "https://schema.org",
    "@type": "PestControl",
    "@id": "https://bruceleehk.com/#pestcontrol",
    "name": "滅蟲師傅 PEST CONTROL MASTER",
    "alternateName": "滅蟲師傅",
    "image": {
        "@type": "ImageObject",
        "url": "https://bruceleehk.com/assets/img/logo.png",
        "width": 440,
        "height": 378
    },
    "logo": { ... ImageObject ... },
    "url": "https://bruceleehk.com/",
    "telephone": "+85252821552",
    "priceRange": "$$",
    "currenciesAccepted": "HKD",
    "address": { ... PostalAddress with addressCountry ... },
    "areaServed": { "@type": "Place", "name": "Hong Kong" },
    "openingHoursSpecification": [ ... OpeningHoursSpecification ... ],
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": 4.9,        // ← 數值（非字串）
        "reviewCount": 10000,      // ← 整數（非字串）
        "bestRating": 5,
        "worstRating": 1
    },
    "review": [ ... 2 個 Review 物件 ... ]
}
```

### 關鍵修正點
1. ✅ `ratingValue` 改為數值 `4.9`（原本是字串 `"4.9"`）
2. ✅ `reviewCount` 改為整數 `10000`（原本是字串 `"10000"`）
3. ✅ 加入 `@id` 屬性
4. ✅ `image` 改為 `ImageObject` 類型（含 width/height）
5. ✅ 加入 `logo` 屬性（ImageObject）
6. ✅ `areaServed` 改為 `Place` 類型
7. ✅ `openingHours` 改為 `openingHoursSpecification` 結構
8. ✅ 加入 `currenciesAccepted: "HKD"`
9. ✅ `address` 加入 `addressCountry: "HK"`
10. ✅ 加入 2 個 `review` 屬性（含 author、datePublished、reviewBody、reviewRating）
11. ✅ `reviewRating` 包含 `bestRating` 與 `worstRating`

### 驗證
- JSON-LD 通過 `JSON.parse` 驗證 ✓
- 符合 Google Rich Results for LocalBusiness 規範 ✓
- 用戶可在 Google Search Console 點擊「驗證修正」按鈕

---

## 🔧 問題 3：移除 quote 頁面頂部 WhatsApp 圖示

### 完成事項
移除 `quote/index.html` 頁首導航列中的 WhatsApp 圓形圖示按鈕：

```html
<!-- 移除前 -->
<a href="https://wa.me/85252821552?text=你好，我想查詢滅蟲服務" class="header-wa" aria-label="WhatsApp 諮詢">
    <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
</a>

<!-- 移除後：整個 <a> 元素已刪除 -->
```

### 視覺驗證
VLM 確認：quote 頁面頂部導航列已無 WhatsApp 圖示，只剩 logo + 導航連結。

---

## 📦 修改檔案清單

### 重新設計
- `info/blog-1/index.html` ~ `info/blog-8/index.html`（8 個檔案全部重新設計）

### JSON-LD 修正
- `index.html`（首頁 JSON-LD 完全重寫）

### WhatsApp 圖示移除
- `quote/index.html`（移除 header-wa 按鈕）

### 新增腳本
- `scripts/redesign_blogs.py`（可重複執行的 blog 重新設計腳本）

---

## ✅ 修復驗證

### 程式碼驗證
- `python3 scripts/validate.py` → 0 errors, 0 warnings
- 所有 JS 檔案通過 `node --check`
- 所有 JSON-LD 區塊可被 `JSON.parse` 解析

### 視覺驗證（VLM）
使用 chrome-headless-shell + puppeteer-core 渲染所有頁面，並用 GLM-5V 視覺模型確認：
- ✅ blog-1：深色 hero + slogan + 白色卡片 + accent border + 內容可讀
- ✅ blog-4：深色 hero + slogan + 白色卡片 + 無佈局問題
- ✅ blog-7：深色 hero + slogan + 白色卡片 + 無佈局問題
- ✅ homepage：正常載入 + 深色 hero + slogan + 無佈局問題
- ✅ quote：頂部導航列已無 WhatsApp 圖示

---

## 🚀 部署步驟

1. 將 `bruceleehk-fixed-v4` 資料夾上傳至 GitHub Pages / Cloudflare Pages / Netlify
2. 訪問 https://bruceleehk.com/info/blog-1/ ~ /info/blog-8/ → 應看到與首頁一致的現代科技風格
3. 訪問 https://bruceleehk.com/ → 首頁 JSON-LD 已修正
4. 訪問 https://bruceleehk.com/quote/ → 頂部導航列已無 WhatsApp 圖示
5. 前往 Google Search Console → 點擊「驗證修正」→ Google 會重新檢索並確認問題已解決
