# 變更記錄 (CHANGELOG)

## v3.0 — 3 頁面獨立架構（2026-08-16）

### 🏗️ 架構重組

從單一巨型頁面拆分為 3 個職責清晰的獨立頁面：

| 頁面 | 路徑 | 職責 |
|---|---|---|
| 首頁 | `/` | AI 卡片內嵌診斷 + 懸浮 AI 助手（7×24 技術支援） |
| AI 系統 | `/ai/` | 獨立完整版 AI 害蟲分析系統（7×24 估價服務） |
| 有蟲話我知 | `/quote/` | 傳統專員報價表單 + 7×24 人工 + WhatsApp AI |

### ✨ 新增功能

#### 首頁 (`/`)
- **AI 害蟲分析系統卡片內嵌迷你 AI 診斷器**
  - 3 狀態流程：上載 → 分析中 → 結果
  - 「7×24 即時診斷估價」紅點標籤
  - 結果帶入 WhatsApp 預約訊息
- **懸浮「滅蟲師妹 AI 助手」按鈕**
  - 右下角脈動動畫
  - 點擊彈出 iframe 對話框（含 7×24 線上 badge）
  - Esc 鍵關閉

#### AI 系統頁 (`/ai/`) — 全新頁面
- 完整版 AI 診斷器
  - 4 步驟載入動畫（圖像預處理 → 辨識種類 → 評估風險 → 配對策略）
  - 6 種害蟲 × 風險/暗巢/三十六計策略/估價對照表
  - 支援拖放上載、手機相機拍攝
- **4 大核心能力卡片**
  - 害蟲識別 / 風險診斷 / 策略匹配 / 報價試算
- **AI 系統架構專區**
  - AI 生成架構示意圖
  - 6 步驟流程說明（用戶入口 → 邏輯轉接 → 視覺識別 → 策略匹配 → 報價試算 → 轉化閉環）
- **WhatsApp AI Bot CTA**
  - 漸層綠色卡片
  - 直接傳送相片至 WhatsApp 進行 AI 診斷

#### 有蟲話我知 (`/quote/`) — 重組
- **三大聯絡渠道卡片**
  - ① 專員報價表單（推薦，綠色高亮）
  - ② 7×24 人工 WhatsApp（紅點 badge）
  - ③ WhatsApp AI 診斷（連結 /ai/）
- **傳統 Formspree 表單**
  - 欄位兩兩並排（姓名/電話、服務類型/屋苑類型）
  - 新增「所在地區」欄位
  - 提交中動畫（spinner）
- **其他聯絡方式卡片**
  - 電話熱線 / 地址 / 營業時間 / 電郵

### 🎨 AI 生成圖像（11 張）

| 檔案 | 尺寸 | 用途 |
|---|---|---|
| `og-cover.jpg` | 1344×768 | 首頁 OG 社交分享圖 |
| `hero-tech.jpg` | 1344×768 | 首頁 Hero 背景 |
| `smart-ai-recognition.jpg` | 1024×1024 | 智慧滅蟲卡片 1 |
| `smart-iot-rat.jpg` | 1024×1024 | 智慧滅蟲卡片 2 |
| `smart-thermal.jpg` | 1024×1024 | 智慧滅蟲卡片 3 |
| `video-cockroach.jpg` | 768×1344 | 短影音案例 1（9:16） |
| `video-bedbug.jpg` | 768×1344 | 短影音案例 2（9:16） |
| `video-iot-rat.jpg` | 768×1344 | 短影音案例 3（9:16） |
| `video-termite.jpg` | 768×1344 | 短影音案例 4（9:16） |
| `ai-architecture.jpg` | 1344×768 | AI 系統架構示意圖 |
| `quote-hero-ai.jpg` | 1344×768 | /ai/ 與 /quote/ OG 圖 |

### 🧹 代碼品質優化

- **抽出共用 CSS** → `assets/css/bruceleehk.css`（11 KB）
  - CSS 變數（設計 token）
  - Header、Footer、Buttons、Thumb Zone、Floating AI、AI Popup、Cards、Responsive
- **抽出共用 JS** → `assets/js/bruceleehk.js`（10 KB）
  - `initMenu()` — 手機選單（含 Esc/resize/outside-click 關閉）
  - `initYear()` — 動態年份
  - `initFloatingAI()` — 懸浮 AI 助手開關
  - `initAIDiagnosis()` — 通用 AI 診斷函式（含 STRATEGY_MAP 與 guessPestType）
- **重複代碼從 ~70% 降至 ~5%**（僅頁面特定樣式與邏輯行內）

### 🐛 Bug 修復（延續 v2.0）

- ✅ 修復 `<a>` 巢狀問題（原 quote 頁 logo 內含 WhatsApp 連結）
- ✅ 移除多餘 `assets/css/style.css` 請求（避免 404）
- ✅ 表情符號全部加 `aria-hidden`
- ✅ 所有外部連結加 `rel="noopener"`
- ✅ 表單欄位加 `focus-visible` 樣式
- ✅ 按鈕加 `:disabled` 狀態樣式

### 📊 檔案大小對比

| 檔案 | v1.0 | v2.0 | v3.0 |
|---|---|---|---|
| `index.html` | 27 KB | 73 KB | 52 KB ↓ |
| `quote/index.html` | 19 KB | 44 KB | 28 KB ↓ |
| `ai/index.html` | — | — | 35 KB (NEW) |
| 共用 CSS | — | — | 11 KB (NEW) |
| 共用 JS | — | — | 10 KB (NEW) |
| **總計** | 46 KB | 117 KB | 136 KB |

> v3.0 雖然總大小略增，但每頁面大小顯著下降（首頁 -29%，quote 頁 -36%），且代碼可維護性大幅提升。

---

## v2.0 — AI 配圖 + 圖像診斷（2026-08-16）

### ✨ 新增
- 11 張 AI 生成配圖（OG、Hero、智慧卡片、短影音、架構圖）
- quote 頁 AI 害蟲圖像診斷器（3 狀態）
- AI 系統架構專區（6 步驟流程）
- Hero 動態背景（CSS-only 流動光點）
- Hero 簡易報價表單
- 互動式害蟲快速診斷器（3 步驟）
- 9:16 直向短影音案例區
- 案例牆 Google 4.9★ 評分行

### 🐛 Bug 修復（16 處）
- 語義化 HTML5（`<nav>`、`<main>`、`<article>`）
- 選單按鈕加 `aria-label`/`aria-expanded`/`role`
- 選單支援外部點擊、連結點擊、視窗縮放、Escape 鍵自動關閉
- Skip-link、JSON-LD `PestControl` 結構化資料
- Open Graph、Twitter Card、canonical URL、favicon
- 表情符號全部 `aria-hidden` 標記
- 頁尾年份改為 JS 動態生成
- 桌面端三十六計加左右切換箭頭
- 4/4 服務卡片都加上徽章

---

## v1.0 — 初版升級（2026-08-15）

### ✨ 新增
- 首頁 Hero 改為痛點標題：「香港首創 AI 智慧滅蟲 • 獨家三十六計」
- 首屏智慧標籤（AI 害蟲圖像識別 / IoT 智慧監測 / 三十六計）
- 底部固定雙按鈕（Thumb Zone）
- 模塊卡片化設計
- 三十六計捲動卡片
- 本地屋苑案例牆
- 漁護署註冊藥劑說明
