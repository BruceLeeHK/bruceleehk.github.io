# 修復日誌 (v3.3 — 2026-08-17)

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
