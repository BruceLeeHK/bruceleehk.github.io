# 修復日誌 (v3.1 — 2026-08-17)

## 本次修復概覽

基於用戶反饋與兩份分析文件（AI 識別出錯.docx + 香港滅蟲專家規則與「三十六計兵法對照表」.docx），完成 4 大優化：

1. **info/vote/index.html 與 admin.html 全面重新設計**（與首頁一致的現代科技風格）
2. **「✨ 智慧滅蟲梗喺滅蟲師傅啦」廣告詞新增至所有分類頁面**
3. **AI 害蟲分析系統香港本地化升級**（基於 docx 文件分析建議）
4. **移除「其他聯繫方式」中的電話熱線與電郵，全面引導 WhatsApp 諮詢**

---

## 🔧 問題 1：info/vote 頁面風格陳舊

### 完成事項
- **info/vote/index.html 完全重新設計**：
  - 套用首頁設計 token：emerald 綠 `#10b981` + tech-blue `#0284c7` + dark-bg `#0f172a`
  - 採用首頁 `bruceleehk.css` 作為基礎樣式
  - 深色 Hero 區（`linear-gradient + radial glow` 動畫 + 科技徽章）
  - 與首頁完全一致的導航列（sticky header、漸變 logo、WhatsApp 圓鈕）
  - 與首頁完全一致的頁尾（社群圖示、動態年份）
  - 行動裝置底部固定 CTA 列（WhatsApp 即時諮詢）
  - 投票卡片：hover 上浮 + 漸變 accent 邊框（top border 動畫）
  - 投票按鈕：漸變背景 + 陰影
  - 排名結果：漸變彩色編號 + 漸變進度條
  - 害蟲詳情面板：accent border-left + WhatsApp CTA
  - CTA Box：漸變背景 + radial 光暈
  - 留言卡片：現代化陰影 + hover 效果
  - 留言表單：現代化輸入框 + focus 漸變光環
  - 官方徽章：漸變背景 + 圖示
  - 模態視窗：現代化 backdrop-filter + accent border
  - Skip-link 無障礙（鍵盤使用者可跳到主內容）

- **info/vote/admin.html 全面重新設計**：
  - 頂部欄：深色漸變背景 + radial glow（emerald + tech-blue）
  - 登入卡：accent border-top 漸變 + 現代化陰影
  - 控制台工具欄：現代化統計數字 + 漸變 filter button
  - 留言卡片：hover 上浮 + accent border-left（依狀態變色）
  - 官方徽章：漸變背景（emerald 綠）
  - 模態視窗：accent border-top + backdrop-filter
  - Toast 通知：漸變背景 + 陰影

- **保留所有原有功能**：
  - 20 種害蟲投票（4 大類別）
  - 完整留言系統（含樹狀回覆、圖片上傳、honeypot）
  - JSON-LD（BreadcrumbList + Article + FAQPage）
  - 全部 `escapeHtml` + `escapeAttr` 安全處理
  - 所有 inline onclick 改為 event delegation
  - Honeypot 反 bot 偵測
  - 圖片類型驗證 + 5MB 限制
  - 5MB 限制與伺服器端對齊
  - 修正 `commentForm` → `mainCommentForm` bug
  - 修正 `data.error` XSS 漏洞

---

## 🔧 問題 2：廣告詞「✨ 智慧滅蟲梗喺滅蟲師傅啦」展示

### 完成事項
新增 slogan banner 至以下頁面嘅 Hero 區（badge-group 與 h1 之間）：
- ✅ services/index.html（蟲類服務）
- ✅ strategy/index.html（有蟲就有計）
- ✅ info/index.html（蟲類資訊首頁）
- ✅ ai/index.html（AI 害蟲分析系統）
- ✅ quote/index.html（有蟲話我知）
- ✅ info/vote/index.html（投票頁，以 slogan-banner 形式置於 vote-intro 上方）

### CSS 設計
新增 `.hero-slogan-tag` 樣式至 `assets/css/bruceleehk.css`（共享樣式表）：
- 半透明 emerald 背景（`rgba(16,185,129,0.18)`）
- 漸變 border（`rgba(110,231,183,0.4)`）
- Mint 綠文字（`#6ee7b7`，與首頁 Hero 文字一致）
- 圓角藥丸形狀（`border-radius: 20px`）
- 發光陰影（`box-shadow: 0 0 15px rgba(16,185,129,0.2)`）
- 加粗字重 + 字距（`font-weight: 800; letter-spacing: 1px`）

vote 頁面採用更突出嘅 `slogan-banner` 設計（漸變文字 + 雙邊 emoji 圖示）。

---

## 🔧 問題 3：AI 害蟲分析系統香港本地化升級

### 基於兩份 docx 文件嘅分析建議

#### 文件 1：AI 識別出錯.docx
**核心問題**：Llama 3.2 Vision 作為通用視覺模型，對香港常見細小微型害蟲（白蟻、蛀木蟲、書蝨）容易混淆，例如把「螞蟻/蛀木蟲」誤認為「木蝨」或「曱甴」。

**建議方案**：
1. 優化 pest-vision-worker.js 的 AI Prompt（加入香港在地化特徵與負向提示）
2. 擴充前端 STRATEGY_MAP 與對應三十六計方案
3. 加入「用戶二次確認」機制（黃金防笑點）— UI 提示 + 手動下拉選單

#### 文件 2：香港滅蟲專家規則與「三十六計兵法對照表」.docx
**核心建議**：升級 AI Prompt 指令，寫入一套極度嚴格的香港滅蟲專家規則與「三十六計兵法對照表」，告訴 AI 看到什麼細微特徵必須對應什麼精準計策。

### 完成事項

#### A. `worker/pest-vision-worker.js` v3.1（AI Prompt 大幅升級）
- ✅ **角色定位升級**：「你是一個香港頂尖嘅資深滅蟲專家，精通香港在地常見害蟲嘅習性同「三十六計」兵法策略」
- ✅ **香港常見害蟲鑑別規則**（13 種害蟲 + 明確特徵 + 對應計策）：
  - 曱甴（蟑螂）：油亮外殼、明顯長觸角 → 誘敵深入計
  - 木蝨／床蝨：扁平橢圓形、紅褐色、6 隻腳 → 星星之火計
  - 白蟻：身體較直、腰部較粗、觸角呈念珠狀 → 擒賊擒王計
  - 蛀木蟲：細小（3-15mm）、長橢圓、圓形孔洞 → 引蛇出洞計
  - 螞蟻：明顯「頭-胸-腹」三段、腰部細 → 順手牽羊計
  - 老鼠、蚊、蜂、蜈蚣、衣魚、蜘蛛、飛蟲類等
- ✅ **關鍵場景判斷規則**（基於現場特徵）：
  - 見到木屑、蛀木粉末 → 蛀木蟲（引蛇出洞計）
  - 見到泥路 → 白蟻（擒賊擒王計）
  - 見到牆角卵巢/油亮外殼 → 德國曱甴（誘敵深入計）
  - 見到床板黑點血跡 → 木蝨（星星之火計）
  - 見到米櫃桶細小褐色甲蟲 → 煙甲蟲/豆象
  - 見到牆身白色極細微蟲 → 卜泥/姬薪蟲
- ✅ **明確區分易混淆害蟲**：
  - 白蟻 vs 蛀木蟲：白蟻留泥路 + 大面積蛀食；蛀木蟲留圓孔 + 細粉
  - 白蟻 vs 螞蟻：白蟻腰部較粗、觸角呈念珠狀；螞蟻腰部細、觸角呈肘形
- ✅ **香港本地化 nest 描述要求**：使用香港常見家居環境術語
  - 窗台罅隙、牆身裂縫、冷氣機周邊
  - 木傢俬、米櫃桶、衣櫃、梳化底、床板縫隙
  - 廚房櫥櫃背後、電器散熱口、排水管附近
- ✅ **temperature 降低至 0.2**（更穩定的輸出）
- ✅ **max_tokens 增加至 1000**（容納更詳細的策略說明）

#### B. `assets/js/bruceleehk.js` v3.1（前端策略庫擴充 + 手動修正機制）
- ✅ **STRATEGY_MAP 從 6 種害蟲擴充至 14 種主要害蟲 + 6 種別名**：
  - 新增：蛀木蟲、蜂、蜂類、蜈蚣、蜘蛛、飛蟲、蟎蟲、卜泥、姬薪蟲
  - 每種害蟲都對應正確的三十六計策略
  - nest 描述使用香港本地家居環境術語
- ✅ **手動修正機制（黃金防笑點）**：
  - AI 識別成功後，結果區下方顯示黃色提示框：「辨識唔啱？手動修正品種：」
  - 提供下拉選單，列出所有 14 種主要害蟲
  - 用戶選擇後，系統即時重新計算對應嘅「三十六計方案」與「參考價格」
  - WhatsApp 預約訊息會標明「分析方式：本地策略庫（用戶修正）」
  - 完全避免因 AI 誤判而造成的專業度扣分
- ✅ **降級流程改進**：
  - AI 失敗時的害蟲選擇器使用 14 種主要害蟲（移除重複別名）
  - 每個按鈕顯示完整害蟲名害蟲名稱（如「曱甴（蟑螂）」而非「曱甴」）
  - 提示文字加入「含三十六計對照」

---

## 🔧 問題 4：移除「其他聯繫方式」電話與電郵

### 完成事項

#### quote/index.html 聯絡方式區段重新設計
- ❌ 移除「電話熱線」卡片（85252821552）
- ❌ 移除「電郵」卡片（Cedars5282@gmail.com）
- ✅ 新增「WhatsApp 即時諮詢」卡片（置頂 + 突出樣式）：
  - 漸變 emerald 背景 + accent border
  - 漸變 WhatsApp 圖示圓圈
  - 「最快 5 分鐘回覆」副標題
  - 綠色 WhatsApp CTA 按鈕：「即時開始傾」
- ✅ 保留「地址」與「營業時間」卡片
- ✅ 標題從「其他聯絡方式」改為「即時聯絡我們」
- ✅ 副標題強調：「WhatsApp 係最快嘅聯絡方式 — 工作時間內即時回覆」

#### 行動裝置底部固定 CTA 列
所有頁面（首頁、services、strategy、info、ai、quote）的 `.mobile-thumb-zone`：
- ❌ 移除「致電」按鈕（tel:+85252821552）
- ✅ 改為單一全寬 WhatsApp 按鈕：「WhatsApp 即時諮詢」
- ✅ 漸變綠色背景（linear-gradient #25d366 → #1eb954）

#### 頁尾保留電郵圖示
保留 footer 的 envelope 圖示（標準社交頁尾模式，並非「聯絡方式」區段）。

---

## 📦 修改檔案清單

### 重新設計
- `info/vote/index.html`（完全重新設計，~88KB）
- `info/vote/admin.html`（CSS 主題色更新 + 結構微調）

### 新增 slogan
- `services/index.html` — Hero 區加入 slogan
- `strategy/index.html` — Hero 區加入 slogan
- `info/index.html` — Hero 區加入 slogan
- `ai/index.html` — Hero 區加入 slogan + CSS
- `quote/index.html` — Hero 區加入 slogan + CSS
- `assets/css/bruceleehk.css` — 新增 `.hero-slogan-tag` 樣式

### AI 系統升級
- `worker/pest-vision-worker.js` v3.1（Prompt 大幅升級，香港本地化規則 + 三十六計對照表）
- `assets/js/bruceleehk.js` v3.1（STRATEGY_MAP 擴充至 14 種害蟲 + 手動修正機制）

### 移除電話與電郵
- `quote/index.html` — 聯絡方式區段重新設計（WhatsApp 為主）
- `index.html` — 行動裝置底部 CTA 列改為 WhatsApp 單按鈕
- `ai/index.html` — 行動裝置底部 CTA 列改為 WhatsApp 單按鈕
- `quote/index.html` — 行動裝置底部 CTA 列改為 WhatsApp 單按鈕
- `services/index.html` — 行動裝置底部 CTA 列改為 WhatsApp 單按鈕
- `strategy/index.html` — 行動裝置底部 CTA 列改為 WhatsApp 單按鈕
- `info/index.html` — 行動裝置底部 CTA 列改為 WhatsApp 單按鈕

---

## 🚀 部署步驟

### 1. 部署靜態網站
將整個 `bruceleehk-fixed-v3` 資料夾上傳至 GitHub Pages / Cloudflare Pages / Netlify。

### 2. 重新部署 AI Worker（重要！）
```bash
cd worker
# 貼上新的 pest-vision-worker.js v3.1
npx wrangler deploy
```
v3.1 Prompt 大幅升級，必須重新部署才能獲得香港本地化辨識能力。

### 3. 驗證
- 訪問 https://bruceleehk.com/info/vote/ → 應看到與首頁一致的現代科技風格
- 訪問 https://bruceleehk.com/info/vote/admin.html → 應看到新的深色頂部欄 + 漸變按鈕
- 訪問 https://bruceleehk.com/services/ / /strategy/ / /info/ / /ai/ / /quote/ → Hero 區應顯示「✨ 智慧滅蟲梗喺滅蟲師傅啦」slogan
- 上傳害蟲相片至 AI 診斷器 → 結果區下方應顯示「辨識唔啱？手動修正品種：」下拉選單
- 訪問 https://bruceleehk.com/quote/ → 聯絡方式區段應只有 WhatsApp + 地址 + 營業時間（無電話與電郵）
- 行動裝置瀏覽任何頁面 → 底部固定 CTA 列應只有 WhatsApp 按鈕（無致電按鈕）

---

## ✅ 修復驗證

所有修改後的檔案均已通過以下驗證：
- `node --check` 檢查 JS 語法（bruceleehk.js、main.js、main.min.js、comment-handler.js、comment-worker.js、pest-vision-worker.js）
- JSON-LD 區塊全部可被 `JSON.parse` 解析
- HTML 標籤開合數量平衡
- CSS 大括號數量平衡
- 所有頁面均包含 CSP、viewport、charset、referrer、theme-color 等 meta 標頭
- 0 validation errors, 0 warnings
