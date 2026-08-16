# 🚀 簡易部署 — 3 步搞定

> **目標**：直接覆蓋到 GitHub Desktop → Commit → Push
> **時間**：約 5 分鐘

---

## ❓ LF/CRLF 提示需要理會嗎？

**不需要！** 這只是 Git 的「行尾格式」提醒，不是錯誤。

GitHub Desktop 顯示：
> This file uses 'LF' line endings, but Git is configured to convert them to 'CRLF' the next time the file is checked out.

意思是：你上傳的檔案用 LF（Linux/Mac 格式），Windows 下次 checkout 時會自動轉成 CRLF（Windows 格式）。**檔案內容完全正常，網站功能不受影響。**

✅ **本安裝包已加入 `.gitattributes` 檔案統一格式，往後 Git 不會再提示此警告。**

---

## 📋 部署前準備

1. 確保 GitHub Desktop 已開啟你的 `bruceleehk` repo
2. 確保已點擊 **Fetch origin** 同步最新
3. （可選）建立備份分支（見下方說明）

---

## 🚀 3 步部署

### 步驟 1：解壓並複製檔案

1. 解壓 `bruceleehk-site.zip`
2. 進入 `bruceleehk-site/` 資料夾
3. **全選所有檔案**（包括子資料夾）
   - Windows：`Ctrl + A`
   - Mac：`Cmd + A`
4. **複製**
   - Windows：`Ctrl + C`
   - Mac：`Cmd + C`

### 步驟 2：貼到本地 repo（覆蓋）

1. 在 GitHub Desktop 點擊 **Repository → Show in Explorer**
   - 快捷鍵：`Ctrl + Shift + F`（Windows）/ `Cmd + Shift + F`（Mac）
2. 開啟本地 repo 資料夾（例如 `C:\Users\philip\Documents\GitHub\bruceleehk\`）
3. **貼上**
   - Windows：`Ctrl + V`
   - Mac：`Cmd + V`
4. 若 Windows 詢問「取代或保留檔案」→ 選擇 **「取代目的地中的檔案」**

### 步驟 3：Commit + Push

1. 回到 GitHub Desktop
2. 左側會顯示所有變更檔案（約 16-20 個）
3. 在下方 **Summary** 欄位填入：
   ```
   升級網站：新增 AI 害蟲分析系統 + 重組 quote 頁
   ```
4. 點擊 **Commit to main**
5. 點擊右上角 **Push origin**
6. 等待推送完成（綠色 ✓ 圖示）
7. 開啟 https://bruceleehk.com/ 測試

**完成！🎉**

---

## 🛡️ 建立備份分支（可選，但推薦）

部署前先建立備份分支，若出問題可立即回滾。

### 在 GitHub Desktop 建立分支

1. 開啟 GitHub Desktop
2. 點擊上方工具列的 **Current branch** 按鈕（顯示 `main`）
3. 點擊 **New branch** 按鈕
4. 在彈出視窗中：
   - **Name**：輸入 `backup-pre-ai-upgrade`
   - **Based on**：選擇 `main`
5. 點擊 **Create branch**
6. GitHub Desktop 會自動切換到新分支
7. 點擊 **Push origin** 將備份分支推送到 GitHub

### 切回 main 分支準備部署

1. 再次點擊 **Current branch** 按鈕
2. 選擇 `main`
3. 確認已切換回 main 分支
4. 進行上述「3 步部署」

### 若部署失敗需要回滾

1. 點擊 **Current branch** → 選擇 `backup-pre-ai-upgrade`
2. 驗證網站正常運作
3. 若決定採用備份版本：
   - 點擊 **Branch → Merge into current branch**
   - 或在 GitHub.com 設定默認分支為 `backup-pre-ai-upgrade`

---

## ⚠️ 不會被覆蓋的既有檔案

以下檔案是您現有網站的資源，**本安裝包不會刪除它們**：

- `assets/img/logo.png` — 品牌 Logo
- `assets/css/style.css` / `style.min.css` — 舊版 CSS
- `assets/js/main.js` — 舊版 JS
- `manifest.json` — PWA 資訊清單
- `services/`、`strategy/`、`info/` 目錄 — 其他頁面

✅ **本安裝包只會：**
- 覆蓋 `index.html`、`quote/index.html`
- 新增 `ai/index.html`、`ai/` 目錄
- 新增 `assets/css/bruceleehk.css`、`assets/js/bruceleehk.js`
- 新增 11 張 AI 圖片到 `assets/img/`
- 新增 `.gitattributes`（解決 LF/CRLF 警告）

---

## 🐛 若遇到問題

### 問題 1：GitHub Desktop 沒顯示變更

**解決**：
- 確認檔案已貼到正確的 repo 資料夾
- 在 GitHub Desktop 點擊 **Repository → Refresh**（或按 F5）

### 問題 2：Push 失敗

**解決**：
- 先點擊 **Fetch origin** 同步遠端
- 若有衝突，點擊 **Pull origin** 先拉取遠端變更
- 再重新 Push

### 問題 3：網站開啟後样式跑掉

**解決**：
- 強制重新整理瀏覽器：`Ctrl + F5`（Windows）/ `Cmd + Shift + R`（Mac）
- 等待 5-10 分鐘讓 CDN 快取更新
- 開啟無痕視窗測試

### 問題 4：圖片顯示不出來

**解決**：
- 開啟瀏覽器開發者工具（F12）→ Network 標籤
- 重新整理頁面
- 檢查是否有 404 錯誤的圖片
- 確認 `assets/img/` 內有 11 張 .jpg 檔案

---

## ✅ 部署後快速驗證

開啟以下 3 個 URL，每個都應正常顯示：

| URL | 預期 |
|---|---|
| `https://bruceleehk.com/` | 首頁 + 右下角懸浮機器人圖示 |
| `https://bruceleehk.com/ai/` | AI 害蟲分析系統頁 |
| `https://bruceleehk.com/quote/` | 有蟲話我知頁 |

詳細驗證清單請見 `VERIFY.md`。

---

## 📞 需要協助？

若部署遇到問題，請提供：
1. GitHub Desktop 錯誤訊息截圖
2. 瀏覽器 Console 錯誤（F12 → Console）

WhatsApp：85252821552
