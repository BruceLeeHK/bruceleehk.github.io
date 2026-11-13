# 滅蟲師傅官網 — GitHub Pages 獨立 URL 版本（含留言系統優化方案 v2.1）

## 網站結構

```
bruceleehk-site/
├── CNAME                    # 自自訂域名指向
├── _config.yml              # Jekyll 配置
├── manifest.json            # PWA manifest
├── robots.txt               # 搜尋引擎爬蟲指引
├── sitemap.xml              # 網站地圖
├── 404.html                 # 自訂 404 頁面
├── index.html               # 首頁
├── assets/
│   ├── css/
│   │   └── style.css        # 主樣式表
│   ├── js/
│   │   └── main.js          # 主腳本
│   └── img/                 # 圖片資源
├── services/
│   └── index.html           # 蟲類服務頁
├── strategy/
│   └── index.html           # 有蟲就有計頁
├── info/
│   ├── index.html           # 蟲類資訊頁
│   ├── vote/
│   │   ├── index.html       # 害蟲投票 + 留言區（優化版 v2.1）
│   │   └── admin.html       # 留言管理後台（一鍵批准 / 刪除 / 官方回覆 / 置頂）
│   └── blog-1 ~ blog-8/     # 八篇蟲類資訊文章
├── quote/
│   └── index.html           # 免費報免費報價頁
└── worker/
    ├── comment-handler.js   # Cloudflare Worker 後端（優化版 v2.1 — 修復 Rate Limit Bug）
    └── wrangler.toml        # Worker 部署設定
```

## 獨立 URL 架構

| 頁面 | 路徑 | 說明 |
|------|------|------|
| 首頁 | `/` | 首頁總覽 |
| 蟲類服務 | `/services/` | 四大服務詳情及收費 |
| 有蟲就有計 | `/strategy/` | 九大策略完整內容 |
| 蟲類資訊 | `/info/` | 資訊文章列表 |
| 害蟲投票 | `/info/vote/` | 全民票選 + 留言區 |
| **留言管理後台** | `/info/vote/admin.html` | **一鍵批准 / 刪除 / 官方回覆** |
| 免費報價 | `/quote/` | 線上報價表單 |

---

## 🚀 留言系統優化方案 v2（重要更新）

### 第一部分：解決「審核不便」與「用戶即時預覽」

#### 1. 一鍵批准網頁版管理後台（無需登入 Cloudflare）

- **位置**：`/info/vote/admin.html`
- **運作方式**：
  1. 輸入管理員密碼（ADMIN_SECRET）
  2. 頁面自動向 Worker 要求所有留言列表（含未審核）
  3. 畫面以卡片列出每條留言，每條旁邊有按鈕：
     - **【一鍵批准】** — 即時審核通過
     - **【刪除】** — 永久移除（連帶刪除其所有回覆）
     - **【官方回覆】** — 以滅蟲師傅身份回應（自動審核 + 綠色徽章）
     - **【置頂 / 取消置頂】** — 將留言釘喺列表最頂
  4. 提供篩選器：全部 / 待審核 / 已公開 / 僅主留言 / 僅回覆
- **好處**：將呢個頁面加入瀏覽器書籤，用手機或電腦打開輸入密碼，即可一鍵點擊審核。

#### 2. 用戶提交後即時自視預覽（localStorage 機制）

- **運作方式**：
  1. 用戶提交留言後，前端將該筆留言暫存於瀏覽器嘅 localStorage
  2. 留言區將「後端已審核嘅公開留言」與「用戶自己瀏覽器內嘅暫存留言」混合渲染
  3. 提交者本人會見到自己嘅留言並帶有 **【審核中…】** 標籤
  4. **其他訪客完全睇唔到**呢條留言
  5. 當管理員批准後，公用 API 就會回傳該留言，本地暫存會自動轉為正常公開留言（無重複）
- **好處**：用戶提交後能即時獲得反饋，唔會覺得系統壞掉而重複提交。

---

### 第二部分：管理員回覆與引導用戶互動

#### 1. 樹狀/嵌套回覆（Reply to Comment）

- **資料結構升級**：留言 API 新增 `parent_id` 欄位
- **介面操作**：
  - 每條已發布嘅留言下方新增 **【回覆】** 按鈕
  - 點擊後留言框顯示「正回覆 @Mary：」提示條
  - 點擊【取消回覆】可退出回覆模式
- **管理員專屬**：管理員喺後台輸入密碼發送回覆，留言旁邊會自動掛上 **【滅蟲師傅 官方回覆】** 綠色高亮徽章

#### 2. 防廣告與促進用戶互相討論與促進用戶互相討論嘅策略

**🛡️ 防廣告與垃圾訊息機制：**

1. **回覆限制純文字**：主留言可上傳圖片，但回覆欄嚴禁上傳圖片與網址（URL）。偵測到 `http://`、`https://`、`www.`、或常見頂級域名（.com / .net / .org / .hk 等）會被自動遮蔽為 `***`。
2. **字數與頻率限制**：
   - 回覆字數限制 10–300 字（主留言 1–2000 字）
   - 同一 IP 每 30 秒只能回覆一次（主留言 60 秒）
3. **極簡防刷驗證**：提交時加入簡單數學問答（例：3 + 5 = ?），前後端雙重驗證，有效阻擋 99% 搬運廣告 Robot。

**💬 促使用戶互相交流嘅玩法：**

1. **話題引導（置頂官方留言）**：管理員可喺後台將特定留言設為置頂（同時間僅一條），置頂留言會帶有 📌 黃色徽章並排喺留言區最頂。
2. **樹狀回覆展開**：用戶可見每條主留言下嘅所有回覆（含官方回覆），方便追蹤討論串。
3. **投票結果與留言連動**：用戶完成投票後，彈窗提示：
   > 「你投咗【床蝨】一票！想知道點樣防蝨？睇睇下面其他苦主嘅討論或向師傅發問 👇」
   點擊【睇下苦主討論】即平滑滾動到留言區。

---

## 🚀 留言系統優化方案 v2.1 — 徹底解決「越撳越延遲」Bug

### 問題背景

用戶反映「超過 1 分鐘仍然提示提交太頻繁」，主要有兩個原因：

1. **「越撳越延遲」機制（Timer Reset Bug）**：原版 Worker 喺每次攔截時都會更新寫入時間，60 秒倒數會被重置 — 等於每次點擊都把倒數撥回 60 秒。
2. **時區解析 Bug（隱藏殺手）**：原版 `created_at` 用 HK 時間字串（`"2026-08-13 14:30:00"`），但 Cloudflare Worker 喺 UTC 環境用 `new Date(...)` 解析時會當佢係 UTC — 結果時間差成 8 小時，rate limit 永遠唔會過期，用戶被永久鎖死。
3. **管理員未獲豁免**：管理員做官方回覆時，可能撞到 IP 限制。

### 解決方案（已落實）

#### 1. Rate Limit v2 — 改用獨立 KV key + TTL 自動過期

**`worker/comment-handler.js` 核心邏輯：**

```javascript
// 1. 先檢查是否為管理員（帶正確 secret 嘅請求完全豁免頻率限制）
const isAdmin = bodySecret && env.ADMIN_SECRET && bodySecret === env.ADMIN_SECRET;

if (!isAdmin) {
  // 2. 只有一般用戶先做 IP 限制
  const rateKey = 'rate:' + clientIp + ':' + (isReply ? 'reply' : 'comment');
  const existing = await kv.get(rateKey);
  if (existing) {
    // 【重點】被攔截時直接 return，唔呼叫 .put()，避免刷新 60 秒倒數
    return jsonResponse({
      success: false,
      error: '提交太頻繁，請等 ' + retryAfter + ' 秒後再試',
      code: 'RATE_LIMITED',
      retry_after: retryAfter,
      cooldown: cooldownSec
    }, 429, corsHeaders);
  }
  // 3. 通過檢查後先寫入冷卻紀錄（TTL 自動 60/30 秒後失效）
  await kv.put(rateKey, Date.now().toString(), { expirationTtl: cooldownSec });
}
```

**改進點：**
- ✅ 用獨立 KV key（`rate:{ip}:comment` / `rate:{ip}:reply`），唔再掃描留言陣列
- ✅ TTL 自動過期，無需手動計算時間差
- ✅ 被攔截時唔寫入 KV → 倒數唔會重置
- ✅ 回傳 `retry_after`（剩餘秒數）+ `cooldown`（總冷卻秒數）

#### 2. 管理員 100% 豁免 Rate Limit

- 任何帶正確 `secret` 嘅 `POST /api/comments` 請求都會跳過 rate limit
- 所有 `/api/admin/*` 端點（list / approve / delete / reply / pin）本來就唔經 rate limit 邏輯

#### 3. 時區 Bug 根治

- `created_at` 改用 ISO 8601 (UTC)：`new Date().toISOString()` → `"2026-08-13T06:30:00.000Z"`
- 額外保留 `created_at_hk` 方便管理後台直接顯示
- 前端 `formatTime()` 自動處理新舊格式（向後兼容舊留言）

#### 4. 前端 UX 全面升級（`info/vote/index.html`）

| 功能 | 說明 |
|------|------|
| **按鈕鎖定 + 倒數** | 提交後按鈕即時轉橙色並顯示「請等 58 秒後再試」，每秒更新 |
| **提示條** | 表單上方顯示「冷卻中：系統已鎖住提交按鈕 XX 秒。避免重複點擊 — 越撳越延遲」 |
| **前端預檢** | 撳之前先 check localStorage，如果仲喺冷卻就唔發請求（避免無謂網絡往返） |
| **跨頁面持久化** | 冷卻到期時間存喺 localStorage，重新整理頁面/切換主回覆模式都 keep住倒數 |
| **Toast 類型** | `success`（綠）/ `warning`（橙，停 4 秒）/ `error`（紅）— 視覺反馈更清晰 |
| **閃爍動畫** | 按鈕鎖定時有脈衝動畫，吸引用戶注意「唔好再撳」 |
| **自動解鎖** | 倒數完按鈕自動還原，唔使刷新頁面 |

### 用戶體驗對比

| 場景 | v2.0（舊版） | v2.1（新版） |
|------|---------|---------|
| 提交後 30 秒再撳 | 「提交太頻繁」（永久鎖死） | 按鈕顯示「請等 30 秒後再試」 |
| 連續狂撳 5 次 | 每次都刷新 60 秒倒數 | 倒數唔變（5 次都見到同一個剩餘秒數） |
| 管理員官方回覆 | 受 IP 限制影響 | 100% 豁免，即刻發佈 |
| 重新整理頁面 | 倒數 reset，要等足 60 秒 | 倒數延續，剩餘秒數一樣 |
| 1 分鐘過後 | 仍提示「太頻繁」（時區 Bug） | 自動解鎖，按鈕還原 |

---

## 部署方式

### 步驟 1：推送至 GitHub

1. 解壓 `bruceleehk-site.zip` 到本地 repo 目錄
2. 用 **GitHub Desktop** 選擇對應 repo
3. 將所有檔案覆蓋（含更新嘅 `info/vote/index.html` 與 `worker/comment-handler.js`）
4. 寫 commit message（例：「v2.1：修復 Rate Limit 越撳越延遲 Bug + 時區解析問題」）
5. Push 到 `main` 分支

### 步驟 2：重新部署 Cloudflare Worker（後端）

⚠️ **重要：必須重新部署 Worker，否則前端嘅倒數功能會同後端唔同步！**

```bash
cd worker/
npx wrangler deploy                            # 重新部署 Worker（已更新 comment-handler.js）
```

如果之前未設定過 ADMIN_SECRET：
```bash
npx wrangler secret put ADMIN_SECRET           # 設定管理密鑰
```

### 步驟 3：測試

1. 開啟 `https://bruceleehk.com/info/vote/`，提交一條留言 → 應見到【審核中…】標籤 + 按鈕轉橙色倒數 60 秒
2. 喺 60 秒內再撳提交 → 應見到按鈕繼續顯示剩餘秒數，倒數唔會重置
3. **重新整理頁面** → 倒數應延續（唔會 reset），按鈕繼續顯示剩餘秒數
4. 等 60 秒過後 → 按鈕自動還原為「提交留言」，可以再提交
5. 開啟 `https://bruceleehk.com/info/vote/admin.html`，輸入密鑰
6. 喺後台連續撳「官方回覆」多次 → 應該 **完全冇 Rate Limit**，即刻發佈

---

## 相比原站嘅改進

1. **多頁獨立 URL**：5 個獨立頁面，每頁獨立 title、description、canonical、OG tags
2. **SEO 完整**：sitemap.xml、robots.txt、JSON-LD 結構化數據
3. **CNAME + Jekyll**：自訂域名 + sitemap / SEO 插件
4. **PWA 支援**：manifest.json
5. **404 頁面**：自訂錯誤頁
6. **留言系統 v2.1**：樹狀回覆 + 官方徽章 + 置頂 + 防廣告 + 數學驗證 + 即時預覽 + Rate Limit v2
7. **網頁管理後台**：一鍵批准 / 刪除 / 官方回覆 / 置頂，無需登入 Cloudflare
8. **localStorage 即時預覽**：解決「提交後無反應」痛點
9. **投票→留言彈窗**：引導投票者參與討論
10. **Rate Limit v2**：徹底解決「越撳越延遲」+ 時區 Bug + 管理員豁免
11. **按鈕倒數 UX**：橙色脈衝動畫 + 跨頁面持久化 + 自動解鎖
