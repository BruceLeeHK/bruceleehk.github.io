# 屬靈反思分享圖卡 — 模板使用指南（v9.86）

本站為靜態 HTML（GitHub Pages / Jekyll 直出），分享圖卡區塊已封裝為「共用 CSS + 共用 JS + 變數區塊」三層結構。
日後為新文章加設圖卡分享區，只需複製下方模板、替換 6 個變數即可，無需再寫任何 CSS / JS。

## 三層架構（已全站就位，毋須重寫）

| 層 | 檔案 | 作用 |
|----|------|------|
| 樣式層 | `/assets/css/bruceleehk.css` 內 `.spirit-share` 區段 | 響應式置中、手機全寬按鈕、卡片陰影 |
| 行為層 | `/assets/js/spirit-share.js`（defer 載入） | Web Share API 一鍵轉發（手機直接彈出 WhatsApp 分享單連圖卡）；不支援時自動降級 WhatsApp 文字分享；自動推送 `share_spirit_card` / `share_spirit_card_success` GTM 事件 |
| 內容層 | 每頁 HTML 內的 `<section class="spirit-share">` 區塊 | 只含圖片與按鈕，變數見下 |

## 圖卡檔案規範

| 檔案 | 用途 | 規格 |
|------|------|------|
| `/assets/img/spirit-card-N-{slug}.jpg` | 下載分享、og:image | 1024×1024、≤250KB（WhatsApp 預覽安全線） |
| `/assets/img/spirit-card-N-{slug}.webp` | 頁面顯示（`<picture>` 自動優先） | 1024×1024、較 jpg 約省 40% 體積 |

## 新文章模板（複製後替換 6 個變數）

```html
<!-- v9.8x 屬靈反思分享圖卡 Spirit Reflection Share Card -->
<section class="spirit-share" aria-labelledby="spirit-share-title">
  <h3 id="spirit-share-title"><i class="fa-solid fa-share-nodes" aria-hidden="true"></i> 把呢份祝福轉發出去</h3>
  <p class="spirit-share-desc">點擊下載《屬靈反思》分享圖卡，轉發到 WhatsApp 群組、教會小組或社交平台，讓專業與愛心傳到更多需要嘅人手中。</p>
  <figure>
    <picture>
      <source srcset="/assets/img/{{WEBP_FILE}}" type="image/webp">
      <img src="/assets/img/{{JPG_FILE}}" alt="{{ALT_TEXT}}" width="1024" height="1024" loading="lazy" decoding="async">
    </picture>
  </figure>
  <div class="spirit-share-actions">
    <a class="spirit-btn spirit-dl" href="/assets/img/{{JPG_FILE}}" download="{{DOWNLOAD_NAME}}.jpg"><i class="fa-solid fa-download" aria-hidden="true"></i> 下載圖卡</a>
    <button class="spirit-btn spirit-sh" type="button" data-share-img="/assets/img/{{JPG_FILE}}" data-share-title="{{SHARE_TITLE}}" data-share-text="{{SHARE_TEXT}}" data-share-url="{{PAGE_URL}}"><i class="fa-solid fa-share-nodes" aria-hidden="true"></i> 一鍵轉發圖卡</button>
  </div>
  <p class="spirit-share-series">系列其他篇：<a href="{{SERIES_LINK_1}}">{{SERIES_TITLE_1}}</a>｜<a href="{{SERIES_LINK_2}}">{{SERIES_TITLE_2}}</a></p>
</section>
```

### 變數說明

| 變數 | 範例 | 注意事項 |
|------|------|----------|
| `{{JPG_FILE}}` / `{{WEBP_FILE}}` | `spirit-card-4-forgiveness.jpg` / `.webp` | 檔名必須全 ASCII（部署鏈會弄壞中文檔名） |
| `{{ALT_TEXT}}` | 圖卡標題＋核心句 | og:image:alt 同步使用 |
| `{{DOWNLOAD_NAME}}` | `屬靈反思圖卡-饒恕篇` | 下載後顯示嘅檔名，可用中文 |
| `{{SHARE_TITLE}}` | `饒恕七十個七次【饒恕篇】｜滅蟲師傅` | 分享單標題 |
| `{{SHARE_TEXT}}` | 一句核心訊息＋「全文:」 | 分享單文字（WhatsApp 顯示） |
| `{{PAGE_URL}}` | `https://bruceleehk.com/info/blog-N/` | 必須絕對網址（WhatsApp/FB 抓取 og 用） |

### 同步更新清單（新文章上線時）

1. 頁面 `<head>`：`og:image`／`og:image:width`／`og:image:height`／`og:image:alt`／`twitter:image` 改指向新圖卡 jpg。
2. 頁面 Article JSON-LD 的 `"image"` 欄位同步指向新圖卡。
3. 舊三篇（blog-15／blog-11／christian-temple-pest-control）的 `.spirit-share-series` 加入新篇連結。
4. `sitemap.xml` 該頁 `<lastmod>` 更新。
5. Google Business Profile 發帖（文案格式見交付包 `Google商業檔案帖子-屬靈反思系列文案`）。
