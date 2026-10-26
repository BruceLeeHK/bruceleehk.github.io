# 修復日誌 (v9.87 — 2026-10-26)

## v9.87 — 網站導航與 UX 終極優化：B2C/B2B 雙軌分流＋雙下拉選單（2026-10-26）

**依《網站導航與 UX 終極優化方案.docx》全數落地：完美對稱的【家居滅蟲】vs【商業滅蟲】雙軌導航**

- 頂部導航雙軌更名：「蟲類服務」→「家居滅蟲」（ZH 80 頁＋404＋about＋districts 按鈕）；「商業方案」→「商業滅蟲」（前一版本已完成）；EN 版同步 Services→Residential（81 頁）；SC 簡體版同步（家居灭虫／商业灭虫）；URL 結構 100% 不變，零 404 風險
- 雙向下拉選單（Hover Dropdown）注入全站 163 頁：【家居滅蟲】下拉＝全屋滅曱甴（連環誘殺）/深層滅床蝨（180°C 蒸氣）/白蟻勘察與防治/滅鼠滅蚊（物理封堵）/海外業主遙距代辦（🔥 交吉起租必備）；【商業滅蟲】下拉＝餐飲食肆滅蟲（HACCP 合規）/物業管理滅蟲（屋苑商廈）/酒店及賓館床蝨處理/IoT 智慧鼠盒監測系統（✨ 科技旗艦）/索取企業報價單——全部深鏈至專屬服務頁或頁內錨點（#remote/#tech/#biz-quote）
- 下拉實現：桌機純 CSS hover＋`:focus-within`（鍵盤可達、零 JS 依賴、不阻內容渲染）；手機 caret 按鈕手風琴（`bruceleehk.js`／`main.js` 新增 `initNavDrop`，aria-expanded 無障礙、外部點擊/ESC 自動收合）；新增平板 769–1120px 密度防溢出媒體查詢
- 麵包屑同步更名：可見麵包屑「商業滅蟲方案」→「商業滅蟲」（ZH 11 處、EN 7 處）；JSON-LD BreadcrumbList `"name"` 同步（13 處）
- Landing page SEO 對齊：/services/ title →「專業家居滅蟲及海外遙距代辦服務 | 滅蟲師傅」（H1 同步加「家居」關鍵字、meta description 對齊）；/commercial/ title →「商業滅蟲服務 | 食肆、酒店及物業管理專屬 IoT 方案 | 滅蟲師傅」；EN 版同步（Residential/Commercial Pest Control HK）；四頁 og:title / twitter:title 全部同步
- 頁尾對齊：「🏢 商業滅蟲方案」欄 →「🏢 商業滅蟲」（80 頁）；頁尾連結「蟲類服務總覽」→「家居滅蟲服務總覽」（80 頁）＋EN「All Services」→「Residential Services」（80 頁）
- 全站零殘留檢查通過：蟲類服務／商業方案／虫类服务／商业方案 = 0
- 流量保護：零 URL 變更、零刪頁、零內容刪減；下拉內鏈為純 HTML（無新 HTTP 請求、JS 增量 <2KB）；全站每頁新增 10 條語義內鏈強化 Silo 權重流動（B2C↔B2B 分流更精準）；「家居滅蟲」「商業滅蟲」雙高搜量詞全站 Header 權重鞏固
- sitemap：/services/、/commercial/ 中英版 lastmod → 2026-10-26


## v9.86 — 屬靈反思分享圖卡傳播渠道（2026-10-26）

**《加設 Google 帖子》方案四項工程全數落地：一鍵下載/分享、Open Graph 預覽圖、響應式 Lazy Loading、模板化整合**

- 三張《屬靈反思》分享圖卡入庫 `assets/img/spirit-card-{1-bedbug,2-temple,3-insects}.{jpg,webp}`：1024×1024、jpg ≤200KB（WhatsApp og:image 安全线）；圖卡 2（寺廟篇）、3（先有蟲篇）右下角二維碼經 AI 區域修復移除，底部文字統一為「AI 診斷 / WhatsApp 預約」，與圖卡 1 完全一致（插畫其餘部分保留原圖像素）
- 六頁（blog-15 / blog-11 / christian-temple-pest-control 中英版）文末注入共用分享圖卡區塊 `.spirit-share`：下載按鈕（`<a download>`）＋「一鍵轉發圖卡」按鈕（Web Share API 手機直彈 WhatsApp 分享單並附圖卡檔案；不支援自動降級 WhatsApp 文字分享）；圖片 `<picture>` webp+jpg 雙格式、`loading="lazy"` + `width/height` 防 CLS
- 新增共用 `/assets/js/spirit-share.js`（defer，事件委派，GTM 自動推送 `share_spirit_card` / `share_spirit_card_success`）＋ `bruceleehk.css` `.spirit-share` 響應式樣式（手機按鈕全寬）
- 六頁 `og:image` / `twitter:image` / Article JSON-LD `image` 由通用 og-cover.jpg 改為各篇專屬圖卡，並補 `og:image:width/height/alt` —— WhatsApp/FB 貼網址即彈出圖卡預覽
- 區塊內建「系列其他篇」內鏈，三篇互導循環瀏覽；新增 `SHARE-CARD-TEMPLATE.md` 模板指南（日後新文章填 6 個變數即可複用）
- Bug 修復：christian-temple-pest-control ZH 延伸閱讀 `href="B15"/"B11"` 佔位符壞鏈 → 正確內鏈（v9.85 遺留）
- sitemap 六頁 lastmod → 2026-10-26
- 流量保護：零 URL 變更、零內容刪減、新增資源全 defer/lazy（JS 1.9KB、CSS +1.6KB、圖卡 lazy 載入），對現有 SEO/速度零負面影響；og 預覽圖升級直接提升社交分享 CTR
- Google Business Profile 帖子文案（3 篇 ZH＋3 篇 EN＋發帖 SOP）見交付包《Google商業檔案帖子-屬靈反思系列文案.txt》

## v9.85《基督徒滅蟲人員可以入寺廟提供滅蟲服務嗎？》屬靈反思文章：放置於【蟲類資訊】—【屬靈反思】欄目，按《顧及軟弱的肢體》神學檢驗修飾，GEO 面向全球基督徒 — 按用戶兩份 docx 執行

### 新頁：屬靈反思（/info/christian-temple-pest-control/ ＋ /en/info/christian-temple-pest-control/，1:1 專業英文翻譯）
- 用戶文章全文落地（聖經經文一字不改：歌羅西書 3:23／哥林多前書 8:4,10／使徒行傳 15:19-20,28-29 和合本）；餐廳類比、祭偶像之物、耶路撒冷會議等核心段落保留
- 按《顧及軟弱的肢體》神學檢驗新增兩節：「三大神學透視」（馬丁·路德／加爾文職業呼召打破聖俗二分＋凱柏普遍恩典＋Wayne Grudem 等合作原則：實質參與 vs 間接參與對照卡）與「顧及軟弱的肢體」（林前 8:1／8:13＋羅馬書 14:21：不強迫良心軟弱員工入寺廟執勤，職場實踐三原則）
- FAQ×6 手風琴（用戶原 4 問＋新增「良心軟弱員工可否拒往寺廟執勤」＋「基督徒可否吃祭偶像之物」）；CTA 導向苦主討論區＋免費 AI 診斷＋WhatsApp（屬靈反思類零產品宣傳）
- 頁面編號 CEDARS-SR-2026-01；CSS/header/footer/cookie 橫幅/AI 助手 100% 繼承 v9.84 時事分析頁模板（CSP 一致）；ZH 版經文和合本，EN 版經文 World English Bible（公有領域）

### GEO 建構（面向 AI 摘要與全球基督徒讀者）
- JSON-LD×3：Article（isBasedOn 聖經和合本／WEB、citation 聖經＋blog-15＋blog-11＋白皮書、about 12 實體：基督徒自由／職業呼召／普遍恩典／聖俗二分／合作原則／祭偶像之物／耶路撒冷會議／哥林多前書／寺廟白蟻／白蟻探測／IPM／商業滅蟲）＋ FAQPage（6 問答）＋ BreadcrumbList
- 問句式 H2×6＋每節「直接答案」開頭段＋blockquote 可引用核心句（「為寺廟提供滅蟲服務，本質是中立的專業服務，而非參與宗教儀式」）；keywords 覆蓋中英文長尾詞
- 【屬靈反思】欄目集群互鏈：新文章 ⇄ blog-15（床蝨被拒返教會）⇄ blog-11（先有蟲定先有人）三篇互相連結（blog-11 本輪補上往 blog-15 之鏈），形成本站屬靈反思權威集群；另鏈白皮書（行業數據權威）

### 全站推廣與索引
- info hub ZH／EN：屬靈反思卡（時事分析卡之後，blog-grid 第三位）
- sitemap 160→162：新增 christian-temple-pest-control ZH/EN 兩條（lastmod 2026-10-25）；/info/ 與 /en/info/ lastmod 同步；XML well-formed
- 部署後建議：Search Console 提交新頁 URL；Rich Results Test 驗證 Article／FAQPage；英文版面向海外基督徒搜尋（Christian pest control temple 等關鍵詞）

# 修復日誌 (v9.84 — 2026-10-25)

## v9.84《傳媒揭公共空間鼠患隱憂》時事分析文章：放置於【蟲類資訊】與白皮書遙相呼應 — 按用戶《傳媒揭公共空間鼠患隱憂.docx》執行

### 新頁：時事分析（/info/rodent-spillover/ ＋ /en/info/rodent-spillover/，1:1 專業英文翻譯）
- 文檔軟文全文落地：時事背景（引述東網 2026-10-25 評論，附真實報導連結，已驗證可達）→「溢出效應」與三維立體入侵 → 白皮書揭示室內盲區（剪刀差）→ 科技驅動 IPM（IoT 智慧監測＋結構封堵兩卡）→ FAQ×5 手風琴 → CTA（免費閱讀白皮書＋WhatsApp 技術顧問＋物業滅蟲方案）
- 100% 規避版權及誹謗風險：僅客觀引述「監督未緊密配合則成效打折扣」的普遍現象，矛頭轉向私人企業風險管理；附「引註與編製聲明」框（時事引註用途＋CEDARS 原創觀點分界）
- 頁面編號 CEDARS-NI-2026-10；CSS/header/footer/cookie 橫幅/AI 助手 100% 繼承白皮書模板（CSP 一致）

### GEO 建構（與白皮書遙相呼應）
- JSON-LD×3：Article（isBasedOn 東網報導、citation 東網＋白皮書、about 10 實體：鼠患外溢/溢出效應/三維立體入侵/鼠患參考指數/食環署/IPM/IoT 智慧鼠盒/結構封堵/不鏽鋼防鼠網/HACCP）＋ FAQPage（5 問答）＋ BreadcrumbList
- 問句式 H2＋每節「直接答案」開頭段＋blockquote 可引用核心句（「公共防線一旦鬆動……責任邊界從來不等於風險邊界」）
- 雙向內鏈：新文章 4+ 處鏈向白皮書；白皮書 ZH/EN 延伸閱讀首位互鏈新文章；另鏈 blog-20（食環署鼠患數據）、商業滅蟲物業頁、十八區

### 全站推廣與索引
- info hub ZH：blog-grid 頂部「時事分析」卡（白皮書卡之後）；EN hub：NEWS INSIGHT · NEW 卡（白皮書卡之後）
- 新頁 footer 智庫欄補入白皮書連結（新頁自身 footer 亦導向權威頁）
- sitemap 158→160：新增 rodent-spillover ZH/EN 兩條（lastmod 2026-10-25）；/info/ 與 /en/info/ hub lastmod → 2026-10-25；XML well-formed

# 修復日誌 (v9.83 — 2026-10-25)

## v9.83《Dataset 結構化資料 license 欄位修復：Search Console 警告清零 ＋ CC BY 4.0 開放授權反向連結策略》— 按用戶《『license』欄位未填.docx》執行

### 修復內容（/info/whitepaper-2026/ ＋ /en/info/whitepaper-2026/）
- Dataset JSON-LD 補 `"license": "https://creativecommons.org/licenses/by/4.0/"`——消除 Google Search Console「資料集結構化資料：license 欄位未填」警告（採文檔建議之 CC BY 4.0 開放授權路線）
- Dataset JSON-LD 補 `"isBasedOn"` 官方數據來源陣列（文檔建議之透明度權威信號，兩個來源均已驗證真實存在）：
  - 鼠患參考指數 → 食環署官網專頁（fehd.gov.hk/pestcontrol/rodent_infestation_rate.html，ZH/EN 分語言對應）
  - 誘蚊器指數 → 資料一線通 DATA.GOV.HK 正式數據集（hk-fehd-fehddengue-fehd-dengue-surveillance，ZH/EN 分語言對應）
- 方法論與數據來源聲明框新增第三段：
  - 政府開放數據強制鳴謝聲明（「本報告部分數據包含了由香港特別行政區政府食物環境衞生署透過『資料一線通』(DATA.GOV.HK) 提供的開放數據。」）——滿足香港政府開放數據姓名標示要求
  - CC BY 4.0 授權說明：明示媒體、學術研究及海外業主可自由引用，惟須標示「滅蟲師傅 (CEDARS_LTD)」出處並連回 bruceleehk.com——落實文檔「海外口碑裂變＋強制反向連結」策略
- sitemap 白皮書 ZH/EN 兩條 lastmod → 2026-10-25（XML well-formed 驗證通過）

### 部署後跟進（用戶側）
- Search Console → 資料集報告 → 點擊「修正『資料集結構化資料』問題」按鈕提交重新驗證
- Rich Results Test 驗證頁面：警告應消失、Dataset 顯示 license 與 isBasedOn 欄位

# 修復日誌 (v9.82 — 2026-10-24)

## v9.82《2026 香港 18 區防蟲治鼠白皮書：蟲類資訊 × GEO AI 搜索權威》— 按用戶《2026 香港 18 區防蟲治鼠白皮書.docx》執行

### 新頁：行業白皮書（/info/whitepaper-2026/ ＋ /en/info/whitepaper-2026/）
- 文檔全文落地：報告摘要（Executive Summary）→「剪刀差」現象三大隱性危機（立體化入侵／微氣候繁衍／國際化傳播）→ 18 區高危場景交叉分析表 → CEDARS 智慧防治三大標準 → 2026 物管商戶三大建議，逐節按原文權威句式編排
- 18 區交叉分析完整 HTML 表格（舊區核心／新界及鄉郊／商業與高尚住宅 × 食環署公共風險 × 前線洞察 × 高危場景四欄）
- 10 條 FAQ 手風琴（問句式標題＋直接答案），覆蓋鼠患參考指數、剪刀差、高樓層老鼠、床蝨傳播、T3i 免拆牆、IoT 鼠盒、IPM、2026 預算分配等真實搜索意圖
- 方法論與數據來源聲明框（官方公開數據軸 × 前線勘察軸），權威信號完備

### GEO（生成式引擎優化）建構——建立滅蟲行業 AI 搜索權威
- JSON-LD ×4：Report（CEDARS-WP-2026-01，author/publisher/citation/about 12 實體）＋ Dataset（18 區交叉分析數據集，variableMeasured 5 維）＋ FAQPage（10 問答）＋ BreadcrumbList——AI 引擎最偏好採信的結構化組合
- 問句式 H2 ＋ 每節「直接答案」開頭段（40-60 字可摘錄結論句），對齊 Google AI Overviews / ChatGPT / Perplexity 摘錄習慣
- 「對比詮釋法——官方查街外，我們查室內」引用框（blockquote），可引用核心觀點句
- 實體豐富：食環署／鼠患參考指數／誘蚊器指數／IPM／Termatrac T3i／IoT 智慧鼠盒／德國曱甴／床蝨／白蟻／紅火蟻／白紋伊蚊／HACCP/ISO22000
- 內鏈網：十八區據點／blog-20 食環署鼠患數據／blog-12 收費指南／商業滅蟲矩陣（物業／餐廳／超市／學校）／服務頁（白蟻）／AI 診斷

### 全站推廣與索引
- info hub ZH：Featured 白皮書卡（「行業白皮書」標籤，置投票卡之前）＋ 文章列表頂部白皮書卡；EN hub：頂部 INDUSTRY WHITE PAPER 卡
- 全站 footer 智庫欄 152 頁（ZH 76＋EN 76）插入白皮書內鏈——全站權重導向新權威頁
- sitemap 155→158：新增白皮書 ZH/EN 兩條＋補上 v9.80 遺留缺口（/en/info/diy-pest-tools/ 從未入 sitemap，僅靠 hreflang 被發現）；/info/ 與 /en/info/ lastmod → 2026-10-24

# 修復日誌 (v9.81 — 2026-10-24)

## v9.81《AI 診斷防彈級穩定性修復：徹底消滅 502 風暴＋地鐵弱網都救到》— 按用戶《徹底解決AI診斷失敗的問題.docx》執行

### 根因（文檔剖析完全吻合）
- 直接死因：Cloudflare 線上 Worker 於手改時引入 `Unexpected token '||'` 語法錯誤 → 整個 Worker 編譯失敗 → 所有 /api/analyze-pest 請求無條件 502 Bad Gateway
- 深層死因：對 Dify 輸出「盲目信任」——answer 為 null / undefined / Object 時直接呼叫 .includes() → TypeError → Worker 崩潰 502 → 前端紅色「系統異常」

### Worker v9.5-Bulletproof（worker/pest-vision-worker.js 全檔重寫，需另行 Cloudflare 部署）
- 消滅 SyntaxError：全檔語法重新整理，禁止斷行開頭 ||／&& 寫法（地區封鎖改具名 isGeoBlocked），任何手改都唔會再令整個 Worker 編譯失敗
- 消滅 TypeError：新增 extractDifyAnswer() —— answer / text / outputs.result / data.answer 多路安全挖字＋String() 強制轉換＋「[object Object]」防護，Dify 回傳任何垃圾數據都唔會炸
- 優雅降級（Graceful Degradation）：假死報告／空白回應 → HTTP 200 + success:false + code:AI_RECOGNITION_FAILED 溫和回傳，絕不 502；並拒入 KV 快取（重試先有機會成功）
- 上游解析防彈：Dify 意外回傳非 JSON（WAF 攔截頁／HTML 錯誤頁）→ parseJsonSafe() 轉為可重試 UPSTREAM_ERROR，唔會裸奔崩潰
- Deadline 護衛：chat 重試前檢查剩餘時間預算，唔會開展趕唔切嘅「殭屍重試」白燒上游配額
- 完整保留：v9.3 金鑰 fail-closed／地區封鎖／CORS 白名單、v9.4 FastTrack（63s 分析＋20s 上傳時限）、KV 智慧快取（前端放棄後 Worker 跑完寫快取，用戶重試即中快取——地鐵弱網救星）、/health 版本號升至 9.5-Bulletproof

### 前端 v9.81 弱網韌性引擎（/ai/ 頁整塊替換；EN 頁設計上無引擎不變）
- 三級自動重試：快速失敗（5xx／斷線）×2（退避 2.5s→5s）＋ 68 秒逾時 ×1（弱網最常見）＋ AI 判讀未明確溫和再驗 ×1；總預算 ~2.6 分鐘封頂（canAffordRetry 護衛），超過先彈錯誤卡
- 離線智慧等候（地鐵／電梯場景）：偵測 navigator.onLine = false 唔會即場燒重試次數，改為等候 'online' 事件（最多 25 秒）自動繼續，全程唔使撳任何嘢
- AI 判讀未明確（AI_RECOGNITION_FAILED）→ 溫和提示卡：「AI 睇唔清呢張相」＋相機圖示＋新增「換一張相」按鈕，唔再當系統爆炸
- 重試全程唔使重新選相：相片保留喺記憶體（v9.73 Canvas EXIF 閹割＋420KB 自適應壓縮不變），自動／手動重試都用同一張
- 分級進度標題：每次自動重試都話畀用戶知發生緊咩（「AI 伺服器波動，2.5 秒後自動重試（尚餘 1 次）…」等）；錯誤卡備「重新分析」＋「直接問師傅」雙出路

### 驗證
- test_v981_worker.js（vm sandbox＋mock Dify 上游）30/30 通過：answer=null／Object → 優雅 200、chat 500 自動重試成功、非 JSON 防彈、快取命中即回、fail-closed 保留、全檔無行首 ||／&&
- validate_v981.py 38/38 通過：/ai/ 標籤平衡、inline JS node --check、前後端合約（溫和卡／離線等候／三級重試／ID 對應）、Worker 靜態防彈風格、EN 頁零誤改

# 修復日誌 (v9.80 — 2026-10-23)

## v9.80《雙軌分流 CTA＋DIY 工具指南頁：海外流量與 GEO 鋪墊》— 按用戶《雙軌分流邏輯設計.docx》執行

### blog-15／blog-11 文末雙軌分流 CTA 模組（ZH/EN 共 4 頁）
- 「Dual-CTA Block」資訊卡片植入文章末端：走向 A＝海外港人業主 WhatsApp 直連（綠色按鈕）；走向 B＝美加／海外在地讀者 DIY 工具指南入口（深色按鈕）
- 文章專屬 Hook 文案置於模組上方（blog-15：木蝨情緒與租務壓力視角；blog-11：預防管理與物業價值視角；EN 忠實採用文檔英文文案）
- WhatsApp 預填文字按文檔第三部分逐篇精準標記來源（Blog-15 / Blog-11 專屬訊息，方便客服第一時間識別海外業主身份）
- GTM GA4 事件追蹤：data-gtm-event（click_whatsapp_overseas_landlord／click_amazon_diy_tools）＋dataLayer push 腳本，銜接站點既有 GTM-P5ZC5BLF 容器（consent 後置載入機制不變）

### 新頁：DIY 工具與產品選購指南（/info/diy-pest-tools/＋/en/info/diy-pest-tools/）
- 純教育型著陸頁（不售賣、零購買連結、零聯盟標籤）：6 大蟲種工具類別（木蝨／老鼠／曱甴／螞蟻／飛蟲／預防工具包）逐一解說「針對階段、擺位、做唔到嘅嘢」
- DIY vs 專業 IPM 老實對照表＋「DIY 已唔夠」紅旗清單＋no-sales 聲明（為未來 Amazon 產品推薦合法鋪墊，現階段只賺流量不做宣傳）
- JSON-LD：Article＋FAQPage（4 題）＋BreadcrumbList；hreflang ZH/EN 互鏈；sitemap 新增 entry（154→155）

### 內鏈與 GEO
- blog-15 ↔ blog-11 ↔ diy 指南三角內鏈（屬靈反思系列＋海外讀者入口互相導流）
- CTA 底註標明海外業主配套：中英雙語報告、租客鑰匙代管、視像現場彙報

### 驗證
- validate_v980.py 全過：CTA 4 頁（Hook/預填/GTM 事件/連結/標籤平衡）＋diy 2 頁（schema/canonical/零 Amazon 連結/骨架保留）＋sitemap XML 語法

# 修復日誌 (v9.79 — 2026-10-23)

## v9.79《EN 九行業子頁文案翻譯補齊》— 對應 v9.77 ZH 注入 1:1 英文化

### 九大行業 EN 子頁全面補翻譯（9 頁：en/commercial/{fnb,food-factory,hotel,logistics,office,property,leisure,healthcare,school}）
- Hero：H1 主標題＋副標題全新專業英文（茶餐廳 Cha Chaan Tengs & Bing Sutt／食品工場 Food Factories／酒店 Hotels／物流 Logistics／甲級寫字樓 Grade-A Offices／物業管理 Property Management／休閒娛樂 Entertainment Venues／醫療 Healthcare & Care Homes／學校 Schools）
- 「行業黑點」紅卡區（#spots）：6 頁重建舊英文＋3 頁全新插入（fnb/hotel/property 原缺），與 ZH 版 4–5 卡逐卡對應（Challenge + Solution 格式）；新插入頁補 .spots-grid CSS
- 「CEDARS 科技化 IPM SOP」區（#flow）：9 頁整段重建——8 步英文 SOP 卡（Step 1–8）＋ 7 頁「三道防線 Three Lines of Defence」體系（fnb/hotel 按文檔無此區）
- Hero WhatsApp 按鈕：CTA 文案英文化＋行業專屬英文預填文字（wa.me URL 同步更新）
- TOC 膠囊 pills：#spots「Pest Points」補齊、flow pill 統一「IPM SOP」（兼容 Contract Flow／Contract Process 兩種舊標籤）

### ZH 一致性補強（3 頁）
- commercial/fnb、hotel、property：TOC pills 補「行業黑點」#spots 膠囊（v9.77 遺留缺口）

### 驗證
- validate_v979.py：45+ 檢查項全過（H1/sub/WA 預填/CTA/黑點卡逐卡/Step 卡/三道防線/pills/標籤平衡/正文零中文泄漏——head CSS 註釋除外）

# 修復日誌 (v9.78 — 2026-10-23)

## v9.78《導航欄標籤更名：商業方案 → 商業滅蟲》— 按用戶導航欄截圖指示執行

### 全站 ZH 導航欄更名（76 頁）
- header 導覽列「商業方案」→「商業滅蟲」（`<li><a href="/commercial/">商業滅蟲</a></li>`），連結目標 /commercial/ 不變
- 覆蓋：首頁、services、10 個商業子頁（Hub＋超市／餐飲／食品工場／酒店／物流／寫字樓／物業／休閒／醫療／學校）、24 篇 blog、18 區 districts、6 個 rat-control、5 個 service、about／ai／quote／strategy／info／vote／wasp-nest／privacy
- EN 導航維持 "Commercial"（英文無「方案」字眼，不在更名範圍）；正文「B2B 商業方案」等普通名詞用法不動，僅改導航標籤

# 修復日誌 (v9.77 — 2026-10-23)

## v9.77《商業滅蟲矩陣：視覺簡化與模組化＋九行業文案注入》— 按用戶《4 個「視覺簡化與模組化」調整.docx》＋《商業滅蟲其他子頁面.docx》執行

### 超級市場及生鮮零售頁四項視覺簡化 — /commercial/supermarket-retail/（ZH/EN）
- 首屏資訊減重：綠色問答框改為折疊收納（<details>），收起顯示「審核合規必備：專屬蟲害監測點位圖 ＋ 中英雙語 IPM 報告」，展開保留全文（SEO 字數不變）
- 目錄欄改為橫向滑動膠囊按鈕（Pill Tabs，overflow-x 滑動、隱藏捲軸）
- 「四大黑點」與「SOP 八步走」之間插入現代科技紀實風格實景照（技術員於超市冷櫃貨架架設 IoT 智慧鼠盒＋平板記錄點位；assets/img/commercial-supermarket-technician-iot.webp，1344×768 lazy loading）
- SOP 八步改為 2×4 網格小卡片（圖示＋步驟簡題，點擊展開細節；頁面長度即時縮短）
- FAQ 六題改為手風琴收摺（+/− 點擊展開，預設收起；FAQPage JSON-LD 同步保留）

### 九大行業子頁文案注入 — 《商業滅蟲其他子頁面.docx》逐段轉錄（ZH）
- 茶餐廳及冰室／食品工場及倉庫／酒店旅舍／物流倉庫／甲級寫字樓／物業管理屋苑／休閒娛樂場所／醫療院舍／學校教育機構
- 每頁更新：H1 主標題＋副標題（文檔規格）、環境挑戰導語、行業黑點紅卡（3–5 個，環境挑戰＋科學解法）、鼠患三道防線體系（7 個行業）、CEDARS 科技化 IPM 八步 SOP 卡片、WhatsApp CTA 按鈕文案＋行業專屬預填文字
- 文檔「食品工場及物流倉庫」H1 微調為「食品工場及倉庫」避免與物流專頁關鍵詞自相殘殺；其餘文案忠實轉錄

### 全商業頁視覺框架同步（22 頁 ZH/EN）
- EN 十行業子頁＋雙語 Hub 同步套用膠囊目錄／問答收合／SOP 卡片化／FAQ 手風琴（EN 文案維持現狀，框架一致）
- Hub「十大行業方案」網格亦改卡片化呈現

### Bug 修復（v9.76 遺留）
- 全商業頁目錄錨點失效：#scope／#spots／#flow／#tech／#price／#case／#industries 均無對應 id → 已逐一補上（含 hub #industries）
- EN 商業頁企業報價表單 checkbox value「需要」→「Yes」（Formspree 線索英文可讀性）


## v9.76《B2B 商業矩陣：商業滅蟲主專頁＋十大行業子頁》— 按用戶《全站 SEO、B2B 商業矩陣與地圖聯動全方位升級方案.docx》＋《超級市場及生鮮零售・IPM 蟲害綜合管理方案.docx》執行（參考方案頁尾架構圖）

### 商業滅蟲主專頁（Hub）升級 — /commercial/（ZH/EN）
- H1 按文檔改為「香港商業滅蟲公司｜企業與物業管理 IPM 綜合蟲害管理方案」
- 頁頭四大信任標籤（文檔規格）：符合食環署/HACCP 查牌標準 ｜ IoT 智慧鼠盒 24/7 監測 ｜ 中英雙語合規報告 ｜ 專人 1 個工作天內提交 Quotation
- 「三大行業」網格升級為「十大行業」：物業管理／餐飲／超級市場及生鮮零售／食品工場及倉庫／物流及倉儲／酒店／商務辦公樓／休閒及娛樂場所／醫療及護理院舍／學校及教育機構
- Meta Title 採用文檔 CTR 範本：【2026 商業滅蟲公司收費】透明報價＋IoT 智慧監測｜滅蟲師傅
- Service JSON-LD OfferCatalog 3→10 項；PestControl schema 補 geo 坐標（22.3527242, 114.1394）＋hasMap Google 地圖連結（文檔第四節 GBP 訊號）
- 企業報價通道表單「商業場地類型」6→10 行業選項；?biz= 深鏈預選參數同步擴充（10 keys）

### 十大行業子頁 — 新建 7 頁 × ZH/EN = 14 檔（沿用現有商業專頁同構模板）
- 超級市場及生鮮零售 /commercial/supermarket-retail/ — 按《超級市場及生鮮零售・IPM 蟲害綜合管理方案》完整轉化：賣場環境挑戰、四大蟲患黑點・精準擊破（熟食檔烘焙區／蔬果生鮮區／魚鮮肉區垃圾房／後勤倉儲卸貨區，每點「環境挑戰＋科學解法」）、CEDARS 科技化 IPM 八步 SOP（勘察 AI 診斷→密度調查→監測點位圖→防治計劃→安全施作→中英雙語 IPM 報告→QC 質檢回訪→滿意保證承諾）
- 食品工場及倉庫 /commercial/food-factory/ — HACCP／ISO22000 對標＋飛蠅誘控（粘捕式滅蠅燈位置圖）＋數據化 IPM 追蹤
- 物流及倉儲 /commercial/logistics/ — 貨櫃卡板帶蟲截擊＋IoT 智慧鼠盒 24/7＋防鼠防鳥工程
- 商務辦公樓 /commercial/office/ — 暗線管道封堵＋隱蔽式防鼠＋員工健康低敏藥劑
- 休閒及娛樂場所 /commercial/leisure/ — 營業時間外極速處理＋氣味管理＋顧客體驗保護
- 醫療及護理院舍 /commercial/healthcare/ — 高敏感環境零氣味物理防治＋菌蟲雙防＋社署/衞生署巡查級紀錄
- 學校及教育機構 /commercial/school/ — 漁護署註冊低毒藥劑＋假期課後無痕施工＋教育局安全指引
- 每頁同構配置：BreadcrumbList／Service(OfferCatalog×3)／FAQPage(6 題行業 FAQ)／PestControl 四組 JSON-LD、行業黑點紅卡×4、合約流程、價目表、實戰案例內鏈、B2B 報價表單（lead-source 逐行業追蹤）＋行業 WhatsApp 預填文案

### 現有 3 子頁對齊文檔
- 餐飲 fnb：keywords＋服務描述補「智慧曱甴誘餌系統」「夜間無痕施工」（文檔餐飲行業解法）
- 酒店 hotel：keywords 補「高溫蒸氣處理」「極速恢復房態」（文檔酒店行業解法）
- 物業 property：文檔解法（不鏽鋼防鼠網源頭封堵＋IoT 鼠盒＋法團報告）原有內容已覆蓋，核對通過

### 頁尾 (Footer) Silo Mega Footer 全站升級（參考方案架構圖四欄）
- 全站 153 頁 footer-nav 升級四欄 Silo 結構：商業滅蟲方案（11 連結）｜家居滅蟲服務（9）｜全港十八區據點（7）｜蟲害知識與 IPM 智庫（7），打通全站內部連結權重
- bruceleehk.css 新增 .footer-cols 響應式四欄網格（860px 兩欄／480px 單欄）；原 about/简体/隱私政策/Cookie 設定保留於 footer-legal 行

### Bug 修復（本次範圍內順手）
- 4 個 ZH commercial 頁 hreflang="en" 壞鏈（"/enhttps://..." 拼接錯誤）修復，EN hreflang 訊號恢復正常

### 驗證
- scripts/validate_v976.py 64 項全過：全站 154 頁 html.parser 標籤平衡、hreflang bug 清零、22 商業頁 JSON-LD 解析（offer 數核對）、新頁內部連結存在性、全站 ASCII 檔名、wa.me 預填 decode、文檔要點覆蓋 G1-G12（hub H1/四大信任標籤/十行業卡/超市四黑點/八步 SOP/各行業關鍵詞）、footer 四欄全站覆蓋 153/153、新頁內联 JS node --check
- sitemap.xml 140→154 URLs；商業體系 22 頁＋首頁 ZH/EN lastmod → 2026-10-23

### 部署後建議（需用戶操作）
1. GitHub Desktop commit + push，等待 GitHub Pages 重新建置後 Ctrl+F5 強刷
2. Search Console 提交更新後 sitemap；2-4 週觀察「商業滅蟲公司」「超市滅蟲」「食品工場滅蟲」等行業詞收錄與排名
3. 文檔第四節 GBP 部分（地圖商家回覆升華社區責任感、Posts 引用官網）需於 Google 商家後台人工操作

## v9.75《地圖聯動＋CTR/CVR 流量轉化優化》— 按用戶《地圖聯動與CTR和CVR流量轉化全面優化方案.docx》執行（網站整體架構不變）

### 官網 × Google 地圖（GBP）訊號綁定
- 首頁 ZH/EN PestControl 結構化資料補「geo」坐標（22.3527242, 114.1394）＋「hasMap」Google 地圖商家連結 — 主動向 Google 宣告實體地理位置（文檔第一項核心）
- rat-control ZH/EN 頁 PestControl schema 同步補 geo＋hasMap（服務頁底層植入）
- 區域落地頁盤點：districts/ 十八區專頁＋rat-control 五大黑點區專頁已存在（無需新建，架構不變）

### Google 好評雙向引用（E-E-A-T 信任區）
- 首頁 ZH/EN 新增「Google 地圖真人好評」區（位於實戰影片與滅鼠通道之間）：Winnie Ng（村屋滅鼠中英雙語報告好評）＋Eric CK Lee（收費合理好評）兩張五星評論卡，去識別化引用＋標明「Google 評論」來源
- 「前往 Google 地圖查看更多真實評價」按鈕（GBP 商家連結）— 官網⇄地圖評價訊號互通
- 信任標籤行：註冊除蟲公司 · 已申請列入政府物流服務署及康文署供應商名單 · Termatrac T3i 認證操作 · 10,000+ 戶實證

### CTR 提升（SERP 黃金詞攻堅）
- rat-control ZH meta 重構（文檔範本採用）：title→「【2026 滅鼠公司收費透明公開】透明報價＋IoT 智慧鼠盒監測｜滅蟲師傅」；description 加入「想知滅鼠公司邊間好？…專員 1 小時內提供免費評估」（meta+og+twitter 共 3 處同步）；EN title→「Rat Control Company Prices 2026 HK…」
- wasp-nest ZH meta 重構：title→「【滅蜂巢公司】馬蜂巢・黃蜂巢處理收費｜安全移除＋十八區即日上門」；keywords 加「滅蜂巢公司／滅蜂巢收費」；desc 加急件詞（meta+og+twitter 3 處）；EN title→「Hornet Nest Removal Company HK…」
- 內部連結盤點：blog-24 美城苑案例→wasp-nest 服務頁大按鈕 ✓、blog-23 粘鼠板→rat-control＋service/rodent ✓（v9.4x 已部署，本次核對確認）
- FAQ Schema 盤點：rat-control ✓、wasp-nest ✓ 已有 FAQPage；Video Schema uploadDate 已於 v9.74 修復 ✓

### CVR 提升（轉化路徑）
- wasp-nest ZH/EN hero 頁首新增醒目急件提示條：「📷 急件處理？請拍下蜂巢照片傳 WhatsApp，專員即時免費鑑定與報價」（amber 警示配色＋綠色 WhatsApp 圓角按鈕，預填文字「急件！我屋企發現蜂巢…」）
- 全站浮動 WhatsApp 按鈕文案升級 54 處：ZH 46 頁「WhatsApp 即時諮詢」→「拍照傳圖・免費 AI 鑑定報價」；EN 8 頁「WhatsApp Instant」→「Photo ID + Free Quote」（按鈕 flex:1 彈性安全）
- 落地頁分流盤點：quote 頁 B2B【企業與商業專屬報價通道】（Quotation/招標/食環署合規 checkbox）✓、B2C 拍照上傳 ✓ 已有

### 驗證
- scripts/validate_v975.py 42 項全過：JSON-LD 全解析（首頁 PestControl geo/hasMap、VideoObject×2 保留）、6 頁標籤平衡、黃金詞 title/desc 覆蓋、急件條存在、浮動按鈕舊文案零殘留
- 盤點記錄：wasp-nest 本無 VideoObject（僅 FAQPage）屬正常架構；blog-18/20/21/22 正文「WhatsApp 即時諮詢」內文連結非按鈕，不需改動
- sitemap 6 頁 lastmod → 2026-10-22

### 後續建議（非本次代碼範圍）
- GBP 商家檔案發佈 Posts 連結至官網 blog-24 美城苑馬蜂巢實錄（地圖→官網方向，需用戶於 Google 後台操作）
- Search Console 觀察 2-4 週：黃金詞「滅鼠公司收費」「滅蜂巢公司」「滅鼠公司邊間好」排名與 CTR 變化



## v9.74《VideoObject uploadDate ISO 8601 修復》— 按 Search Console「影片」報表兩項警告修復：Datetime 屬性「uploadDate」缺少時區＋「uploadDate」的 datetime 值無效

### 問題診斷
- 根因：blog-23（粘鼠板變身鼠餌盒）與 blog-24（大圍美城苑馬蜂巢）影片結構化資料 uploadDate 只填日期（如「2026-10-14」），缺少時間與時區，不符合 Google 要求嘅 W3C / ISO 8601 標準 YYYY-MM-DDThh:mm:ss+TZD
- 全站掃描：9 個 VideoObject 中 4 處 date-only（blog-23/blog-24 各 ZH+EN），其餘 5 處（首頁×2＋blog-14 ZH/EN＋en 首頁）原本已合規

### 修復內容（4 處）
- info/blog-23/index.html：「2026-10-14」→「2026-10-14T10:00:00+08:00」（香港時區 UTC+8）
- info/blog-24/index.html：「2026-10-21」→「2026-10-21T09:00:00+08:00」（與首頁同一條馬蜂巢影片 2q98dIGC_2U 嘅 uploadDate 完全一致）
- en/info/blog-23/index.html、en/info/blog-24/index.html：同步上述兩項（中英版數據一致）

### 驗證
- scripts/validate_v974.py 18 項全過：全站 uploadDate regex 格式掃描（9/9 合規、零 date-only 殘留）、8 頁 JSON-LD 逐一解析（9 個 VideoObject 必填欄位齊全）、同片同日期一致性核對（2q98dIGC_2U 三處一致；7sbS9n_HW8g 兩處一致）、4 頁 html.parser 標籤平衡、sitemap well-formed
- 註：blog-14 VideoObject 只有 embedUrl 無 contentUrl — Google 必填要求為二擇一，合規無需改動

### 部署後驗證 SOP（按文檔三步）
1. GitHub Desktop commit + push，等待 GitHub Pages 重新建置
2. Rich Results Test（search.google.com/test/rich-results）輸入 https://bruceleehk.com/info/blog-23/ 與 /info/blog-24/，展開「影片 (VideoObject)」確認 uploadDate 帶 +08:00 且無黃色警告
3. Search Console「影片」報表 → 分別點擊兩項 uploadDate 警告 → 按「驗證修正」，Google 數天內重新爬取後清除標籤



## v9.73《AI 害蟲分析系統優化：合規免責＋界面簡化＋60–70 秒時效》— 按用戶《AI 害蟲分析系統》文檔執行（網站整體架構不變）

### 法律風險規避（文檔三大風險點）
- 《商品說明條例》風險：「獨家 IPM 防治智庫 — 自動檢索政府官方文獻與指引」改為「自動檢索並整合本港公開之政府防蟲文獻與指引」，強調「公開」文獻，避免「政府授權／內部機密指引」誤導聯想；全站掃描確認無殘留「政府官方文獻」字眼
- AI 專業責任（Liability）風險：AI 工具 section 後新增合規免責聲明框（ai-compliance-note，amber 警示配色）：「免責聲明：本系統檢索及整合之政府公開文獻與指引僅供參考用途。系統輸出的初步方案不代表政府部門之官方立場。所有蟲害治理工程應以本公司專員最終的現場評估及正式報價單為準。」（按文檔建議逐字採用）
- EN 版 Service Terms 區新增 🏛 Government Sources Disclaimer（retrieves and integrates publicly available Hong Kong government pest-control publications…subject to our specialist\'s final on-site assessment and formal quotation）
- 《版權條例》風險：頁面維持「檢索／整合」公開文獻描述（文檔確認此為安全做法），無整份轉載政府文件，無需額外改動

### 界面簡化（更簡潔美觀）
- 應文檔要求刪除本頁「滅蟲師姐/師妹」聊天界面 section（ZH udify iframe＋EN 同步），只保留 AI 害蟲分析系統；全站其他位置之滅蟲師妹浮動助手照舊保留（文檔：「其他位置繼續保留」）
- 移除大型 SVG 架構圖（arch-image-wrap），同樣資訊由六步驟卡（arch-flow）完整保留，頁面更輕更快
- 刪除上載區冗餘 upload-features 圖標列；PDPO 數據收集聲明改 details/summary 摺疊（預設收起、點開細閱，頁面更清爽）
- 品牌統一：「滅蟲師妹 AI 視覺模型分析中…」→「滅蟲師傅 AI 深度分析中…」；「滅蟲師妹 AI 診斷報告」→「AI 害蟲分析報告」

### 分析能力與時效（60–70 秒穩定完成）
- 前端圖片預壓縮 700KB → 420KB（1024px 解析度不變，AI 辨識能力不受影響；上載更快、視覺 Token 更慳），QUALITIES 降質階梯同步調整
- 前端總預算 AI_TIMEOUT_MS 100s → 68s：60–70 秒內必完成或明確報錯，杜絕「分析時間過長／暫時未能完成」無了期等候
- 自動重試只限 30 秒內返回嘅快速失敗（elapsedSec < 30），確保重試都喺 70 秒總預算內
- 新增即時等候計時「已分析 X 秒（目標 60 秒內完成）」（45 秒後轉安撫文案「仍喺深度推演，請繼續等候…」），aria-live polite 無障礙播報
- Worker v9.4 FastTrack（worker/pest-vision-worker.js）：CHAT_TIMEOUT_MS 100s→63s、UPLOAD_TIMEOUT_MS 30s→20s、compact 查詢加「請以精簡易讀方式輸出，避免冗長鋪陳」縮短 DeepSeek 廣東話報告生成；/health 版本 9.4-FastTrack
- hero badge「30-90 秒深度報告」→「60–70 秒深度報告」（EN 同步 60–70 sec）；分析中文案同步目標 60 秒（上限 70 秒）

### 驗證與收尾
- scripts/validate_v973.py 28 項全過（合規字眼、section 刪除、摺疊、逾時參數、品牌統一、html.parser 標籤平衡 ZH/EN、首頁師妹浮動助手不受影響抽查）
- scripts/check_v973_js.py 17 項全過（內联 script node --check ×3、Worker 語法、startElapsed/stopElapsed 配對與調用點、attempStart 重試預算、合規框位置、EN disclaimer 位置）
- sitemap /ai/ 與 /en/ai/ lastmod → 2026-10-22；全站掃描確認「政府官方文獻」零殘留

### ⚠️ 部署注意（重要）
- worker/pest-vision-worker.js 唔會經 GitHub Pages 生效 — 需另行到 Cloudflare Dashboard → Workers → pest-vision-worker → 貼上新版代碼 → Deploy；否則前端 68 秒預算會對上舊 Worker 100 秒逾時（行為仍安全，但 60–70 秒目標打折扣）



## v9.72《blog-24 露台相 404 修復＋CSP Console 錯誤清理》— 應用戶回報「呢張相片在網頁顯示唔到」並附 DevTools 截圖：blog-24 露台實景相 404，Console 另有 CSP 兩項錯誤

### 露台相 404 根本修復（中文檔名 → ASCII 檔名）
- 根本原因確診：assets/img/沙田美城苑-滅馬蜂巢與黃蜂防治實戰案例-滅蟲師傅.jpg 全中文檔名，經「解壓 → GitHub Desktop → GitHub Pages」部署鏈後與線上 URL 無法對應（percent-encoded 請求實測 404；同頁兩張 ASCII 檔名相 200 正常）
- 修復：相片重新命名為 shatin-may-shing-court-balcony-hornet-case.jpg（648×1149，影像內容不變），全站資產檔名現已 100% ASCII，杜絕同類問題
- 更新引用 4 處：info/blog-24/index.html figure src＋BlogPosting JSON-LD image[]；en/info/blog-24/index.html 同步兩處（alt／figcaption／width/height 屬性不變）
- 移除 assets/img/ 中文檔名原檔；註：本地 repo 如殘留舊中文檔名檔案可順手刪除（不影響運作）

### CSP Console 錯誤清理（全站 69 頁 meta CSP）
- 移除 frame-ancestors 指令（55 頁）：經 meta 傳遞嘅 CSP 一律忽略 frame-ancestors（僅 HTTP header 有效），瀏覽器因而持續報錯；移除後警告消失，實際安全行為無改變
- script-src 補上 https://static.cloudflareinsights.com（57 頁加入、12 頁早前已有）：解除 Cloudflare Web Analytics beacon 被 CSP 阻擋問題，統計數據恢復收集
- scripts/validate_v972.py 22 項檢查全部通過（引用數、JSON-LD×3×2 解析、BlogPosting image 陣列、CSP 全站掃描、html.parser 標籤平衡、sitemap、全站 ASCII 檔名）

## v9.71《【師傅出更】蜂巢文章改用用戶真實原圖》— 應用戶提供 3 張個案原圖：blog-24 配圖由實錄短片截圖改為真實原圖（相片與相片名稱按原圖不變，放喺合適位置並配適當描述）

### 真實原圖替換（ZH info/blog-24 ＋ EN en/info/blog-24）
- 新增 3 幅用戶提供之個案真實原圖 assets/img/（按原圖名稱命名，648px 闊 LANCZOS 重採樣＋JPEG 優化）：
  - shatin-may-shing-court-hornet-nest-removal-video.jpg（648×1007）：住戶 WhatsApp「報案」對話實錄（「只係陽台仔」＋開窗接觸評估＋大圍美城苑地址確認＋報價跟進）→ 開場接報段
  - shatin-may-shing-court-hornet-removal-pest-control-master.jpg（648×1149）：摘下嘅「燒賣粒」蜂巢特寫（筷子夾起巢室切面＋六角形巢室＋乳白色幼蟲）→ 摘巢四步後特寫段
  - 沙田美城苑-滅馬蜂巢與黃蜂防治實戰案例-滅蟲師傅.jpg（648×1149）：美城苑高層露台實景（窗台量天尺、虎尾蘭盆栽＋窗外綠化環境）→ IPM 高危築巢位檢查段
- 移除 4 幅實錄短片截圖資產 blog24-{whatsapp-report,full-gear-spray,nest-removed,site-inspect}.{webp,jpg}（8 檔）；「防蜂裝備噴劑」位置無對應原圖，按用戶「用呢3張」指示整個 figure 移除（摘巢四步文案不變），文章配圖 4→3
- alt／figcaption 按真實相片內容重寫（標註「個案對話實錄／個案實錄相片」／"Case chat record"/"Case photo"）；blog21-legalbox 圖片來源聲明由「實錄短片截圖」改為「個案真實相片及對話紀錄，由滅蟲師傅團隊提供」
- BlogPosting JSON-LD image 陣列 5→4（video-wasp-nest＋3 幅原圖），ZH/EN 同步；全部 figure lazy＋width/height 屬性按新圖實際尺寸更新（1007／1149）

## v9.70《【師傅出更】蜂巢文章改用真實原圖》— 應用戶澄清：blog-24 配圖改用個案真實原圖（非 AI 示意圖），放喺合適位置並配以適當描述

### 真實原圖替換（ZH info/blog-24 ＋ EN en/info/blog-24）
- 圖片來源：官方 YouTube 實錄短片（2q98dIGC_2U【大圍美城苑直擊】）真實幀——maxres1/2/3 中央直式畫面裁切（405×720→648×1152 LANCZOS＋輕度銳化）＋ oardefault（1080×1920）裁 3:4，全部 webp(q80)＋jpg(q85) 雙格式
- 新增 4 幅真實截圖 assets/img/：blog24-whatsapp-report（住戶 WhatsApp 報案＋現場環境核對）、blog24-full-gear-spray（師傅全副防蜂裝備噴劑封鎖巢口）、blog24-nest-removed（摘下嘅「燒賣粒」蜂巢特寫）、blog24-site-inspect（摘巢後視察周邊環境）
- 移除全部 5 幅 AI 示意圖（webp＋jpg 共 10 檔）；黃蜂 vs 馬蜂章節無實景對應，改為純文字三特徵清單（其餘章節圖文位置不變）
- 新增 .blog24-fig--v 直式圖樣式（max-width:500px 置中，避免 9:16 實拍截圖撑爆版面）；四幅圖全部 lazy＋width/height 屬性
- caption／alt 重寫為真實場景描述（標註「實錄短片截圖」／"Live video still"）；legalbox AI 配圖聲明改為實錄截圖來源聲明
- BlogPosting JSON-LD image 陣列更新為 5 張真實圖（video-wasp-nest＋四幅新圖），ZH/EN 同步

### 影片標題同步
- YouTube 官方已將影片改名為「呢粒唔係燒賣！蜂巢真身大揭秘🐝🔥」（原「呢粒咩係燒賣？」），同步更新：首頁 VideoObject JSON-LD name、waspNestCard facade aria-label／attachFacade 標題、blog-24 內嵌 VideoObject name／facade aria-label／figcaption／iframe title

## v9.69《【師傅出更】美城苑蜂巢文章圖文並茂重寫》— 應用戶要求：info/blog-24（含英文版）加入配圖並重新撰寫

### 文章配圖（ZH info/blog-24 ＋ EN en/info/blog-24）
- 新增 5 幅 AI 示意圖（assets/img/blog24-*.webp/.jpg，1152×658，webp＋jpg 雙格式）：燒賣粒馬蜂巢特寫（blog24-siumai-nest-ai）、全副防蜂裝備封鎖巢口（blog24-full-gear-ai）、摘巢後密封袋包裝（blog24-sealed-bag-ai）、黃蜂 vs 馬蜂體型對比（blog24-wasp-vs-hornet-ai）、冷氣機底座高危點檢查＋防蟲網（blog24-ac-unit-check-ai）
- 圖片全部 loading="lazy"＋width/height 屬性防版面跳動；caption／alt 標註「AI 示意圖，實景相片稍後更新」，版權與安全聲明新增 AI 配圖說明條目
- 新增 .blog24-fig 樣式（圓角＋陰影＋邊框＋置中 caption）；沿用既有 .blog17-quote 引用框
- BlogPosting JSON-LD image 陣列 3→6 張（視頻縮圖＋全部新配圖）

### 文案重寫
- 開場強化「計時炸彈」張力；新增「點解蜂巢似燒賣」紙皮巢殼成因解說（木材纖維＋口水逐圈築巢）
- 摘巢四步逐步擴寫：面罩手套鞋套全密封／速效擊倒減低群起而出機會／即場密封袋防二次傷人／殘留藥劑破壞費洛蒙氣味標記
- 落單馬蜂小插曲改用 .blog17-quote 引用框呈現，並新增第 4 步價值呼應段（摘巢只係一半，清除氣味標記先杜絕另起新巢）
- 黃蜂 vs 馬蜂新增體型／攻擊性／毒性三特徵清單；IPM 方案改為三項建議清單（防蟲網／高危築巢點檢查／初起細巢盡早求助）
- CTA 段強化「切勿自行噴藥或捅巢」安全提示；修正「蜂螯」→「蜂螫」
- 個案資訊卡新增「📍 案發地點：沙田大圍美城苑」（EN: Location）；hero 簡介標明「圖文並茂＋摘巢四步圖解＋實錄短片」
- EN en/info/blog-24 全部同步（文案、配圖、JSON-LD、casefile、legalbox）

## v9.68《大圍摘馬蜂巢短片登陸首頁＋【師傅出更】蜂巢個案新文章》— 應用戶要求：YouTube Shorts 2q98dIGC_2U 取代首頁「實戰案例短片」之曱甴系統防治實戰卡；新增【師傅出更】大圍美城苑直擊摘馬蜂巢文章（ZH＋EN 雙語）

### 首頁「實戰案例短片」區塊更新（index.html＋en/index.html）
- 曱甴系統防治實戰卡（roachCard，外鏈 YouTube 頻道）整卡移除，原位置改為「大圍直擊摘馬蜂巢」卡（waspNestCard，2q98dIGC_2U），沿用同款頁內播放 facade（attachFacade，點擊海報先載入 iframe）
- 區塊標題由「榮仔智鬥過萬隻曱甴」改為「榮仔直擊大圍摘馬蜂巢」（EN 對應 Hornet Nest Removal at Mei Shing Court）；卡片文案（badge／標題／描述）與 WhatsApp CTA（摘蜂巢／黃蜂巢防治查詢）全部換新
- 新增縮圖素材 assets/img/video-wasp-nest.webp（52KB）＋video-wasp-nest.jpg（114KB），由 YouTube oardefault 縮圖（1080×1920）重採樣至 768×1344
- 首頁新增 VideoObject JSON-LD（contentUrl／embedUrl 2q98dIGC_2U，uploadDate 2026-10-21）；facade 註解升版 v9.68

### 新增【師傅出更】蜂巢個案文章（ZH info/blog-24 ＋ EN en/info/blog-24）
- 依 docx 供稿《大圍美城苑直擊摘馬蜂巢，網友笑稱「蜂巢似燒焦嘅燒賣粒」》撰寫：個案性質／晨早摘巢四步（防蜂衣→速效噴劑封鎖→連根摘除密封包裝→殘留藥劑破壞費洛蒙）／落單馬蜂兜圈飛走小插曲／黃蜂與馬蜂分別＋切勿自行處理警示／IPM 防治方案（防蟲網＋冷氣機底座、露台假天花高危點）／WhatsApp 遠程鑑定 CTA
- 文內嵌同款 Shorts facade（2q98dIGC_2U，youtube-nocookie，blog24-yt）；JSON-LD×3（BreadcrumbList＋BlogPosting＋VideoObject）；分類「師傅出更」，發佈日 2026-10-21；CTA 直達 /wasp-nest/ 黃蜂巢安全摘除服務頁
- 合規（第 362 章 v9.45 標準）：明確「切勿自行處理」安全警示；收費一律「勘察／遠程鑑定後書面報價」；無「保證／根治／100%／即日上門」字眼

### 列表與索引
- /info/（ZH）blog-grid 尾部新增 blog-24 卡（師傅出更分類，2026年10月21日）；/en/info/ 新增 blog-24 卡（MASTER ON DUTY · NEW）
- sitemap 138→140 URLs（blog-24 ZH＋EN hreflang 三語互指，lastmod 2026-10-21）；首頁（ZH/EN）＋/info/＋/en/info/ lastmod 同步 2026-10-21

## v9.67《B2B 商業滅蟲方案矩陣＋專員報價表單無縫整合》— 依《建立獨立的「商業滅蟲方案」專頁矩陣》＋《B2B 商業滅蟲方案與「專員報價表單」無縫整合藍圖》兩份文檔，將商業客戶（B2B）從住宅服務獨立出來：三大行業登陸頁矩陣＋企業專屬報價通道

### 新建商業滅蟲方案專頁矩陣（ZH＋EN 共 8 頁）
- /commercial/ 中樞：香港商業滅蟲合約報價——三大行業卡＋科技與合規（IoT 數據報告／AI 輔助診斷＋IPM 處方單／政府採購資格）＋合約五步流程＋企業案例＋FAQ 6 題＋企業專屬報價表單
- /commercial/property/ 物業管理滅蟲：公用地方防鼠封堵（垃圾房、電梯槽、天井）＋商場 IoT 智慧鼠盒監測系統＋物業管理 IPM 蟲害管理＋法團招標文件支援＋第 132 章責任分工 FAQ
- /commercial/hotel/ 酒店滅蟲：酒店床蝨防治＋隱蔽服務不擾住客＋Termatrac T3i 無損探測＋員工床蝨預防培訓＋房務部對接流程
- /commercial/fnb/ 餐廳滅蟲：餐廳滅鼠食環署指引對標＋HACCP 級紀錄文件＋食品安全級無毒誘餌＋IPM 綜合防治＋IoT 智慧鼠盒監測
- 每頁十區塊結構（承 pillar 模板）：hero（badges＋geo-answer AI 摘要答案箱）＋breadcrumb＋web-net 2 卡＋服務範圍 6 卡＋合約流程 5 步＋科技與合規＋合約模式表＋實戰案例＋FAQ 6 題＋企業專屬報價表單；JSON-LD×4（Breadcrumb＋Service hasOfferCatalog 3 項＋FAQPage 6 問＋PestControl 同一 @id）
- B2B 長尾詞佈局：香港商業滅蟲合約報價／商場 IoT 智慧鼠盒監測系統／物業管理 IPM 蟲害管理／酒店床蝨防治／酒店床蝨預防培訓／餐廳滅鼠食環署指引／HACCP 滅蟲

### 專員報價表單 B2B 無縫整合（/quote/＋/en/quote/）
- 專員卡文案升級為文檔指定【企業與商業專屬報價通道】全文（B2B 專責專員一個工作天內聯絡＋食環署/HACCP 合規＋IoT/IPM 理念＋投標與政府採購文件提交）
- 新欄位組（ZH/EN 同款 name）：客戶身分 radio（個人／家庭 vs 商業／機構）→選商業展開：公司／機構名稱＋商業場地類型下拉（寫字樓／物業公用空間／餐廳及食品工場／酒店及賓館／學校或院舍／倉庫及工廈）＋特別文件需求 checkboxes（正式報價單／投標招標資訊／行業合規證明）；ZH 表單 _subject 隨身分動態切換（【滅蟲師傅】B2B 商業滅蟲查詢）
- 表單預設帶入 (Pre-fill)：/quote/?biz=property|hotel|fnb 及商業專頁內嵌表單自動預選商業身分＋對應場地類型
- EN quote（WhatsApp 型）：Customer Type radio＋商業欄位組，商業資訊自動組入 WhatsApp 訊息

### 全站整合
- header 導覽列新增「商業方案 / Commercial」項（ZH 68 頁＋EN 69 頁＋sc 1 頁）
- footer 三條商業錨灌溉：物業管理滅蟲／酒店滅蟲／餐廳滅蟲（ZH 66 頁＋EN 62 頁，sep/nosep 變體自動跟隨）＋商業 8 頁自身 footer
- 四大住宅 pillar（rodent/flea/termite/cockroach ZH/EN）web-net 各加商業卡改道對應行業專頁；rodent 正文 B2B 板塊加餐廳滅蟲錨
- services（ZH/EN）加商業方案 banner；blog-19（金行實錄 ZH/EN）延伸閱讀加物業管理滅蟲錨
- sitemap 130→138 URLs（商業 8 頁 hreflang 三語互指，lastmod 2026-10-19）

### 合規（第 362 章 v9.45 標準全程）
- 商業合約收費唔作虛構數字：一律「先勘察後書面報價，合約列明項目」，不設劃一價目
- 政府採購資格如實表述「已申請列入政府物流服務署及康文署供應商名單」（不聲稱已獲列入）
- 食環署表述用「對標／指引」，無「獲食環署認證」；第 132 章公用地方責任分工以法團／管理處表述
- 高溫殺蝨「一般喺攝氏 50 度以上持續高溫」；無「保證／根治／100%／即日上門」字眼


## v9.66《傳統搜尋＋AI 摘要雙線搶佔》— 依《全面搶佔 Google 傳統搜尋排名與 AI 摘要》戰略文檔，落實「傳統 Google 排名」＋「AI 摘要（AI Overviews/GEO）」兩條戰略線

⚠️ 環境事故復原：本次開工前偵測到本地 workspace 回退至 v9.53 快照（同 v9.49 回退事故同型）。已從 filebin 拉回 v9.64 交付包（MD5 b5febcd519d15b4c34ab47b4858b6ea6 位元組級驗證一致）還原 website/ 至 v9.64 基準，再於乾淨基準上重建 v9.65 改動＋實施本版本。v9.54–v9.64 各版說明詳見下方歷史條目；v9.65 改動細節見下一段。

### 戰略一：純中文市場（50–60%）— GEO 直接答案＋長尾詞
- 四大蟲種 pillar 頁（白蟻／床蝨／曱甴／老鼠，雙語 8 頁）hero 區新增「AI 摘要答案箱」（geo-answer）：每頁一句可被 AI 摘要直接引用嘅定義式答案——「白蟻點解要免拆牆探測？」「床蝨怕什麼？」「德國小蠊有幾難搞？」「屋企有老鼠，第一步係咩？」（EN 對應）。依戰略文檔避坑指南：FAQ rich result 已於 2026 年 5 月起停顯，重心放喺頁面實質文字結構，答案直接寫喺版面。
- /services/＋EN 新增 6 題摺疊 FAQ（details/summary）＋FAQPage schema：首題直接回應長尾詞「滅蟲公司邊間好？」；地區題答案覆蓋赤柱、銅鑼灣（EN 對應 Stanley／Causeway Bay）；收費題連結 2026 滅蟲收費指南（blog-12）。
- EN services 蚊段植入「pest control for mosquitoes」精準句（ breeding-source inspection + targeted treatment 表述）。

### 戰略二：中英混合市場（20–25%）— 中英夾雜 H2＋數據化表述
- 白蟻頁＋EN 新增「蛀木蟲處理 — 同白蟻有咩分別？」／「Wood Borer Treatment — How It Differs from Termites」板塊（全站首個蛀木蟲主題 H2，連結免費 AI 診斷）。
- 床蝨頁＋EN 新增「香港床蝨實況 — 點解近年在港反彈？」／「Bed Bugs in Hong Kong — Why Cases Are Rising Again」板塊（澳航事件「據報道」歸因＋連結 blog-22）。
- 老鼠頁＋EN 新增「餐廳廚房滅老鼠：IoT 智慧鼠盒監測與 IPM 綜合防治」／「Restaurant & Kitchen Rat Control: IoT Smart Monitoring + IPM」B2B 板塊（戰略文檔精準佈局句式直接落地，指向餐飲集團／外賣廚房／食品倉）。
- 曱甴頁主圖 alt 加入「（蟑螂）」雙詞：「廚房曱甴（蟑螂）防治實證——香港滅曱甴公司藥餌凝膠點注IPM治理」。

### 戰略三：純英文市場（15–20%）— E-E-A-T 核實
- EN 四個 pillar 頁 AFCD 註冊表述核實齊備（termite 5／flea 3／cockroach 4／rodent 4 處），hreflang 三語互指完好，無需改動；新 EN 板塊以 IPM／AFCD／documented records 等高信任詞彙寫作。

### FAQ 結構強化（visible text 為主、schema 為輔）
- termite／flea／cockroach ZH+EN FAQ 由 6 題加至 7 題：白蟻加「你哋有冇處理蛀木蟲／粉蠹？」、床蝨加「床蝨怕什麼？自己處理得唔得？」、曱甴加「德國小蠊同美國曱甴處理方法有咩唔同？」；FAQPage schema 同步加至 7 題（JSON-LD 解析驗證通過）。

### 合規（第 362 章 v9.45 標準全程）
- 高溫殺蝨表述用「一般喺攝氏 50 度以上持續高溫」，不設絕對承諾；澳航事件「據報道」歸因；收費一律「過往個案綜合參考＋先勘察後書面報價」；無「保證／根治／斷尾／100%／即日上門」字眼。
- 戰略文檔建議「15-30 秒即出 AI 診斷報告」與站內 /ai/ 既有聲稱（深度報告 30–90 秒）不符——為如實陳述，採用站內既有數據，未新增時間聲稱。
- sitemap 10 頁 lastmod 更新至 2026-10-19；零新頁面（URL 集不變，i18n.js 免動）。

## v9.65《服務頁本地 SEO 強化》（重建版）— 上個工作階段已實作、因環境回退流失，本次隨 v9.66 交付包一併重建交付
- /services/＋EN：6 題摺疊 FAQ＋FAQPage schema（赤柱／銅鑼灣地區詞）＝已併入 v9.66 戰略一交付
- /service/termite/＋EN：蛀木蟲處理 H2 板塊＝已併入 v9.66 戰略二交付
- /service/flea/＋EN：香港床蝨 H2 板塊＝已併入 v9.66 戰略二交付
- termite／flea／cockroach FAQ 加至 7 題＋曱甴主圖 alt（蟑螂）＝已併入 v9.66 交付
- 版本號保留，以銜接此前 GSC 提交建議（8 條 URL 清單不變，先上傳後提交）

## v9.64《隱私政策成頁精簡（技術細節全隱藏）＋ 全站 Cookie 橫幅新文案》

依用戶《優化隱私政策》精簡方案：/privacy/ 保留網址，main 內容全部清空，直接換入「精簡優化版」兩大區塊；並完成 v9.63 留尾巴的 sitewide 橫幅 GA 字眼清理。

### A. 隱私政策三語成頁替換（/privacy/ ＋ /sc/privacy/ ＋ /en/privacy/）
- 三版 main 內容全部清空，新內容＝兩大區塊：①服務條款與免責聲明（AI 診斷與報價說明／專員服務優先機制／科學綜合防治 (IPM) 理念）；②隱私與個人資料保護政策（地域與法規合規聲明／資料收集與保密／Cookie 與網站分析）
- 技術細節全面隱藏：Formspree、Cloudflare Workers KV、Cloudflare Web Analytics、cdnjs、localStorage 代碼名 blh_cookie_consent_v1 等供應商／代碼名稱，一律不再出現於頁面可見文本；改以「安全的加密雲端系統」「標準的網站分析工具」代稱
- 移除舊「一至七」長文結構（資料使用者與適用範圍、收集資料表格、Cookie 類別清單、資料用途、第三方服務供應商、資料保留期、你的權利、政策更新）
- 保留不動：hero（h1＋subtitle＋badges）、header/footer、GTM 同意機制（head loader＋橫幅 script 原樣）、footer「Cookie 設定」錨點 id="cookie-settings"（移至隱私政策區塊）及 aria-labelledby="privacy-main"（移至新首個 h2）
- meta description／og:description 三版同步重寫（零技術字眼）；title／canonical／hreflang／keywords 不動

### B. 全站 Cookie 橫幅新文案（132 頁語言感知替換）
- ZH（65 頁，用戶指定一字不差）：「本網站使用 Cookie 及相關基礎追蹤技術以優化網站體驗及統計互動（例如查詢點擊量）。繼續瀏覽本網站即表示您同意我們使用 Cookie。詳情請參閱我們的隱私政策。」
- SC（2 頁）简体對應版；EN（65 頁）英文對應版
- 按鈕照用戶字面更新：ZH「同意並繼續」／SC「同意并继续」／EN「Agree & Continue」（照字面移除原「✓ 」前綴）
- 「僅必要 Cookie」副掣保留——v9.60 GDPR 事先同意機制完全不變（同意前 GTM 不載入）
- 舊句「包括 Google Analytics 及 Google Tag Manager…GA／GTM 追蹤代碼唔會載入」132 頁零殘留

### 驗證
- 全站掃描：可見文本（去 head/script/style/註解）技術字眼 0 頁命中
- agent-browser 三版實測：新 h2 在位、橫幅三語新文案正常；點擊「同意並繼續」橫幅收起＋GTM 載入機制照運作（__blhGtmLoaded=true）
- 三版 div 平衡 12/12；橫幅新句 132 頁全在、舊句 0 殘留

---

## v9.63《隱私政策精簡——移除 Google Analytics 表述（三語同步）》

依用戶四項修改清單（SC 頁為準，ZH／EN 語義同步，三版法律聲明保持一致）：

### 四項清單落地
- ① 副標題：「Cookie 与 Google Analytics 使用透明化」→「Cookie 与追踪技术使用透明化」（ZH：追蹤技術；EN：Tracking Technologies）
- ② 刪除整段「三、Google Analytics 如何处理你的数据」（含頁面瀏覽/停留時間/Opt-out 外掛等全部內容，整個 privacy-box div 移除）；刪段後全頁重新編號（四→三、五→四、六→五、七→六、八→七；EN 4-8→3-7）
- ③ 第二部分 GTM 段落改為用戶指定新文案：本网站使用 GTM 来管理网页互动追踪（例如 WhatsApp 咨询点击量统计），点「同意并继续」先载入、点「仅必要 Cookie」唔载入（ZH 繁中粵語語感版＋EN 版同步）
- ④ 第四部分（原第五）第三方名單刪除 Google Analytics 項（GTM 原名單無列，按用戶「如果有嘅話」指示不另加）；第五部分（原第六）保留期刪除「GA 分析数据」條目

### 附帶同步清理（同類 GA 表述）
- meta description／keywords／og:description 三版全部移除 GA 字眼；EN 版 <title> 同步改為「Cookies, Tracking Technologies & Hong Kong PDPO Compliance」

### 部署前置與驗證
- 本地 workspace 再度回滾至 v9.53 快照；已先執行線上基線同步（v9_63_sync_live.py）：134 URL 全量抓線上 v9.62，0 miss、135 beacon 剝離；同步後驗證 GTM 132 頁/Turnstile 2 頁/SC 路徑修復/quote 條款全在——打包零回退
- 程式化驗證 40 項編輯全過；三版 GA 殘留各僅餘 sitewide Cookie 橫幅一處（橫幅屬全站元件，不在用戶清單內，維持原樣）；段落編號連續；div 開合平衡（20/20）
- agent-browser 實測三版：SC 副標題新文案＋h2 一至七連續＋新 GTM 段落在位＋3 stylesheets；ZH/EN 對稱通過；截圖存 screenshots/v963_sc_privacy_trimmed.png

## v9.62《简体版隱私政策頁樣式修復（相對路徑深度錯）＋og:image 絕對化》

依用戶回報「https://bruceleehk.com/sc/privacy/ 呢個頁面顯示有問題」（附截圖：全頁無 CSS、logo 爛圖、導航變原生 bullet list）：

### 病源與修復
- 病源：/sc/privacy/ 頁深度為二（/sc/privacy/），但 5 個 asset 引用沿用深度一寫法 ../assets/（bruceleehk.css／logo.png×2／i18n.js／bruceleehk.js）→ 實際解析去 /sc/assets/... 全 404 → 整頁樣式與腳本載入失敗；EN 版（../../assets/）與 ZH 版（深度一 ../assets/）本來正確，僅 SC 版漏改
- 修復：SC 版 5 處 ../assets/ → ../../assets/，與 EN 版對齊
- 同類 bug 延伸修復（og:image 相對路徑——社交平台爬蟲不解析相對路徑，分享卡會空白）：privacy 三版＋/quote/ 共 4 頁 og:image 改絕對 URL https://bruceleehk.com/assets/img/og-cover.jpg；/ai/ 頁 og:image（quote-hero-ai.webp）同改絕對
- 全站掃描：所有 HTML 相對引用（href/src）解析存在性檢查，47 條相對引用零真實破損（8 條 flag 全屬 JS 模板字面量假陽性：escapeAttr/about:blank/$2）

### 部署前置（關鍵防回退）
- 本地 workspace 曾回滾至 v9.53 快照；已先執行線上基線同步（承 v9.58 模式）：sitemap 130 ∪ 本地 129 = 134 URL 全量抓線上 v9.61 覆蓋本地，0 miss、133 條 Cloudflare beacon 剝離；CHANGELOG／sitemap／i18n.js／404×2 同步更新；同步後驗證：GTM 132 頁／Turnstile sitekey 2 頁／privacy×3／wasp-nest×2／quote v9.61 條款全在——確保本次打包零回退

### 驗證
- agent-browser 實測本地 http.server：desktop 1366px（sticky header／logo naturalWidth 440／3 stylesheets／零 page errors）＋390px 手機（零水平溢出 scrollWidth=390／CSS 全載／簡體 cookie 橫幅正常）；截圖 2 張
- og:image 相對路徑全站 rg 覆核歸零殘留

## v9.61《報價頁服務條款增補「服務地域與法律規管」聲明（ZH／EN 雙語）》

依用戶指令，將指定管轄權免責聲明增補至「有蟲話我知」頁（/quote/）【服務條款與免責聲明】板塊，與 v9.60 隱私政策 EEA 聲明互為呼應：

- 繁中版（/quote/）：條款清單新增第 4 項「服務地域與法律規管」——本網站及相關服務僅面向香港特別行政區地區；不主動向歐盟/歐洲經濟區（EEA）居民提供服務或收集其個人資料；歐盟境內用戶資料處理受香港個人資料私隱專員公署（PCPD）及《個人資料（私隱）條例》（PDPO）規管（用戶指定文本一字不差收錄）
- EN 版（/en/quote/）：該頁原無條款板塊，新增「Terms of Service & Disclaimer」橙色卡板塊（樣式與繁中版一致），收錄 AI Diagnosis & Quote Disclaimer 與 Service Territory & Governing Law 英文對應條款，站內法律聲明雙語同步
- 版面：繁中版沿用 .disclaimer-section/.disclaimer-card 既有樣式零新 CSS；EN 版 inline 自包含不依賴頁面級 CSS；無 URL 變更，sitemap 免動

## v9.60《GTM 全站安裝（GDPR 嚴格同意模式）＋Cookie 同意橫幅＋隱私政策三版＋電郵卡美化》

依用戶兩項指令：①「呢個郵箱突著出來，請更新使其更美觀」②「按照【安裝 Google 代碼管理工具】文檔代碼優化網站，嚴謹照歐盟 GDPR 要求，做到符合香港私隱條例」。GTM 容器 ID：GTM-P5ZC5BLF。

### ① 報價頁電郵卡美化（/quote/）
- 原設計將 master@bruceleehk.com 整串地址直接塞入藍色按鈕，卡窄字長、視覺突兀兼手機易迫行——改為短按鈕「✈ 即時電郵查詢」＋按鈕下方細字實體地址（word-break:break-all，390px 零溢出）；h4 移除重複 ✉️ emoji（icon 已有信封），四卡節奏與 WhatsApp 卡統一
- 表單區 .form-b2b-email 機構客戶資訊行（v9.58 上線）維持原樣

### ② Google Tag Manager 全站安裝 — GDPR 嚴格「事先同意」模式（132 頁）
- <head> 置入 consent-gated GTM loader：只有 localStorage 同意狀態 = granted 先注入 gtm.js；訪客未選擇或選「僅必要 Cookie」，一行追蹤代碼都唔會載入（歐盟 GDPR prior opt-in 標準，高於香港 PDPO 通知型橫幅要求；兩者同時滿足）
- 依 GDPR 嚴格原則刻意不置入 <noscript> 版 GTM（JS 停用瀏覽器同樣不得未經同意載入追蹤）——<body> 開頭保留說明註釋，日後如部署同意管理平台可再啟用
- Cookie 同意橫幅（ZH-HK / EN / zh-Hans 三語對應）：底部深色欄、綠色「同意並繼續」＋灰色「僅必要 Cookie」雙鍵、含隱私政策連結；選擇存 localStorage（blh_cookie_consent_v1，含時間戳）；頁尾「Cookie 設定」連結＋隱私政策頁按鈕可隨時重開橫幅改選
- CSP append-only 放行（不動 Turnstile/Formspree 既有白名單）：script-src += https://www.googletagmanager.com；connect-src += googletagmanager.com／*.google-analytics.com／*.analytics.google.com；frame-src += googletagmanager.com（共 66 頁有 CSP meta 者全數處理；66 頁本無 CSP meta，維持原樣——無 CSP 即無限制，GTM 照常運作）

### ③ 新增隱私政策頁（/privacy/、/en/privacy/、/sc/privacy/ 三語）
- 頂部免責聲明（文檔指定文本）：本網站及相關服務僅面向香港特別行政區，不主動向歐盟/EEA 居民提供服務或收集個人資料，資料處理受 PCPD 及 PDPO 規管
- 八節內容：資料使用者與適用範圍／收集資料類型一覽表（報價表單・討論區留言・AI 診斷・Cloudflare 匿名統計）／Cookie 與類似技術（必要 vs 分析類，含 #cookie-settings 錨點＋即場改選按鈕）／Google Analytics 數據處理與官方 opt-out／資料用途／第三方供應商／保留期／PDPO 查閱更正權利（master@bruceleehk.com）
- 三版互設 canonical＋hreflang（zh-HK / zh-Hans / en / x-default）
- sitemap 增 3 URL（127 → 130）＋全站 lastmod 統一 2026-10-18
- 頁尾導航全站加「隱私政策／Cookie 設定」連結（ZH/EN/SC 對應版；vote 頁原無 footer-nav，補建；404 兩頁同補）

### 附帶源碼修復（同輪品質檢查發現）
- 缺 <body> 標籤 13 頁補回（privacy ×3、rat-control 區頁 ×10）——瀏覽器一直自動包容，源碼層面不規範
- info/vote/admin.html（管理後台）零改動：後台不載 GTM、不設橫幅
- Cloudflare RUM beacon 維持剝離（GitHub 源碼不含 CDN 注入行；線上由 Cloudflare 邊緣自動注入，每頁仍恰 1 個 beacon）
- 保留線上 v9.55（Turnstile sitekey＋CSP）/ v9.58（master@ 電郵部署）/ v9.59（Formspree CSP＋i18n 還原）全部成果

## v9.59《專員報價表單「Failed to fetch」CSP 修復》

依方案文檔《專員報價表單「Failed to fetch」修復與優化方案》三項排查執行。用戶 DevTools 截圖實證：/quote/ 表單 fetch POST https://formspree.io/f/xlgyylke 被瀏覽器 CSP 指令 connect-src 攔截（白名單僅 self／comment-handler／pest-vision-worker／cloudflareinsights），「Failed to fetch」由此而生——與 Formspree 後端綁定 master@bruceleehk.com（v9.58 已完成）無關。

### ① CSP connect-src 放行 Formspree（核心修復）
- ZH /quote/（全站唯一 Formspree AJAX 表單頁）：connect-src 加入 https://formspree.io，並按文檔修改範例同步加入 https://challenges.cloudflare.com（未來表單若接 Turnstile 即就緒；其餘指令零改動）
- EN /en/quote/：connect-src 同步加入兩域（雙語對稱；該頁表單走 WhatsApp 深鏈不受影響，form-action 既有的 formspree 白名單維持）
- form-action 指令本已含 https://formspree.io（ZH/EN 兩頁核實），無需改動；AJAX fetch 受 connect-src 約束——此即 v9.56 CSP 審計漏檢點（審計只核對了頁面靜態資源，未涵蓋表單 AJAX 提交目標）

### ② Form Action URL 與 Fetch 邏輯校對（核實正確，零改動）
- 表單提交目標精確為 https://formspree.io/f/xlgyylke（form action 屬性實證）
- AJAX fetch 已帶 Accept: application/json JSON header（實證）——文檔要求兩項全部達標

### ③ Turnstile 驗證碼衝突排查（結論：無衝突）
- /quote/ 與 /en/quote/ 零 Turnstile 痕跡（grep 實證）→ 報價表單提交鏈路無驗證碼介入，不存在 Token 獲取失敗中斷 fetch 的風險
- 討論區 Turnstile（vote ZH/EN）已於 v9.55 啟用（sitekey＋CSP 三指令），本次上線後以線上 E2E 複核 widget 渲染與提交

### 附帶衛生修復（同步品質驗證時發現之線上真實缺陷，非本方案範圍）
- 語言切換引擎 i18n.js 還原：線上版本誤退回舊版（僅映射 blog-1…blog-11），blog-12…blog-23 共 12 篇文章 ZH 頁的 EN 切換鈕錯誤降級到 /en/info/ 資訊中樞——已還原為 n≤23（blog-1…23 全部有 EN 對應版，逐一實證），切換直達對應 EN 文章
- 雙 </body> 去重：/、/en/、/wasp-nest/、/en/wasp-nest/ 共 4 頁尾部連續兩個 </body>（wasp-nest 兩頁並有雙 </html>），已清理為單一收尾；Cloudflare RUM beacon 行原樣保留（線上實測每頁恰 1 個 beacon 且 token 正確，分析功能正常）
### 最終上線測試（對應文檔流程）
- 本地真瀏覽器 E2E：隨機測試資料填表→提交→「提交成功」提示出現、零 CSP 錯誤（Formspree HTTP 200）
- 測試提交會寄出真實電郵至 master@bruceleehk.com——請登入郵箱確認收到 Formspree 測試資料（文檔第三步）
- 上線後操作：GitHub Desktop 三步上傳 → Ctrl+F5 強刷 /quote/ → 再提交一次實測

## v9.58《聯絡渠道重定位＋master@bruceleehk.com 全站部署》

依方案文檔《「專員報價表單」視覺降級與重新定位》＋用戶指令「表單接收信息的 email 改為 master@bruceleehk.com」。核心策略：B2C 住宅客導流 WhatsApp（轉化率最高），B2B 商業/政府機構行專屬域名郵箱＋報價表單專業通道。

### 一、「專員報價表單」視覺降級與重新定位（/quote/）
- 推薦標籤轉移：移除表單卡上方「👇 推薦」，改為藍色「🏢 商業・機構」標籤（B2B 定位）；「👇 推薦」轉移至「工作時間即時 WhatsApp」卡（工作時間資訊已含於卡標題，無資訊損失）
- 表單卡描述：「適合需要詳細描述情況的客戶。」→「適合**商業機構、物業管理**或需要詳細描述情況的客戶。」
- 新增 `.channel-tag.org` CSS（藍色 #eff6ff/#1d4ed8/#93c5fd）

### 二、表單區塊電郵分流＋必填精簡（/quote/）
- 表單介紹文字下方新增顯眼提示盒：「機構客戶如需索取正式報價單 (Quotation) 或投標資訊，可直接電郵至：master@bruceleehk.com」（`.form-b2b-email` 藍色提示盒）
- 必填精簡：只剩「姓名、聯絡電話、服務類型」必填；「屋苑類型」由必填改選填，「所在地區」「詳細情況」本為選填，三欄均加「（選填）」標示（`.quote-form label .opt`），降低填寫門檻

### 三、「即時聯絡我們」區塊升級（/quote/）
- 新增第四張「✉️ 電郵查詢」卡（機構客戶・正式報價單 → mailto:master@bruceleehk.com），與 WhatsApp／地址／營業時間並列（contact-grid auto-fit 自適應四卡）

### 四、master@bruceleehk.com 全站部署
- 頁尾資訊行加電郵：ZH 版「地址｜服務區域｜營業時間」行尾追加「電郵：master@bruceleehk.com」（mailto 連結，color:inherit 下劃線）；EN 版「Address|Service Area|Hours」行追加「Email:」；sc 簡體版追加「邮箱：」
- 全站郵件連結統一：所有頁尾社交 icon `mailto:Cedars5282@gmail.com` → `mailto:master@bruceleehk.com`；52 檔 JSON-LD LocalBusiness `"email"` 欄位同步更新（bruceleehk.com 域名郵箱對 Google 商家信號一致）
- 404 頁：Gmail 圖示改 Font Awesome 信封 icon（配合品牌郵箱）
- EN /en/quote/：「Or Contact Us Directly」區塊加機構電郵行（Corporate / property-management clients → Quotations & tenders）
- 表單接收電郵：/quote/ 表單經 Formspree（formspree.io/f/xlgyylke）提交，收件電郵須於 Formspree Dashboard → Forms → xlgyylke → Settings 內改為 master@bruceleehk.com（靜態站 HTML 端無法改動收件人，屬平台設定）；EN 表單經 WhatsApp 深鏛提交，不涉及

### 受影響範圍
/quote/、/en/quote/ 主手術；全站頁尾＋mailto＋JSON-LD 電郵統一（ZH/EN/sc 全部頁面）；sitemap lastmod 同步刷新改動頁面


## v9.57《安全原則深色卡文字隱形修復》— /wasp-nest/「馬蜂巢處理安全原則」區塊文字睇唔到（12 頁同源修復）

依用戶附截圖報告「https://bruceleehk.com/wasp-nest/ 呢個位置嘅文字睇唔到」，實證病因係 v9.48 以來五個蟲種 pillar＋wasp-nest 共 12 頁（ZH/EN）同模板嘅 CSS 疊加衝突——唔係 wasp-nest 獨有，rodent/termite/flea/cockroach 同樣中招。

### 病因（CSS 疊加衝突，三重）
- 簡介段落隱形：`.dist-card p{color:var(--text-main)}`（#334155 深灰，為白卡設計）直接命中深色卡（`.dist-card.hub-tech`，#0f172a→#1e293b 深藍漸變底）入面嘅簡介段落，壓過 `.hub-tech` 繼承嘅 #e2e8f0——深灰字落深藍底對比僅約 1.4:1
- 卡內文隱形：`.tech-list li{background:var(--light-bg)}`（#f8fafc 近白）令四張卡喺深色卡內變白盒，但卡內文繼承 `.hub-tech` 嘅 #e2e8f0 淺灰——淺灰字落白底對比約 1.2:1；卡標題 b 沿用 #34d399 落白底僅約 1.9:1
- 版式擠迫：`.hub-tech{display:flex}` 令 h2／簡介／卡片清單三家企柱——桌面版窄欄擠迫，手機 390px 標題被壓成一行一字

### 修復（12 頁 inline CSS 追加四條規則，immutable cache 免疫）
- `.dist-card.hub-tech{flex-direction:column;align-items:stretch;gap:0}` → 垂直排版，與頁面其他區塊一致
- `.dist-card.hub-tech p{color:#e2e8f0}` → 簡介段落淺色（specificity 0,2,1 勝 `.dist-card p` 0,1,1）
- `.dist-card.hub-tech .tech-list li{color:var(--text-main)}` → 卡內文 #334155 落 #f8fafc＝9.9:1
- `.dist-card.hub-tech .tech-list li b{color:#047857}` → 卡標題深綠＝5.2:1（保留綠色主題）
- 技術決策：改頁面 inline `<style>` 而非共用 bruceleehk.css——HTML 頁 max-age=0 must-revalidate 即刻生效；共用 CSS 檔被 max-age=31536000 immutable 長快取，改佢會令舊訪客最長一年睇唔到修復

### 受影響頁面（12）
/wasp-nest/、/en/wasp-nest/、/service/rodent/、/en/service/rodent/、/service/termite/、/en/service/termite/、/service/flea/、/en/service/flea/、/service/cockroach/、/en/service/cockroach/、/service/wasp/、/en/service/wasp/

### 驗證（全 PASS）
- WCAG 對比度數學驗證：簡介段落 11.9–14.5:1、卡內文 9.9:1、卡標題 5.2:1、卡圖示 3.9:1（門檻 4.5/4.5/4.5/3.0）
- 真瀏覽器 12 頁循環驗證：flex-direction=column＋簡介/卡內文/卡標題三組計算樣色全部命中＝12/12 PASS
- 截圖對比：桌面 1280px＋手機 390px、ZH＋EN 修復前後六圖；390px scrollWidth=390 零橫向溢出；頁面錯誤零
- 影響範圍核實：全站僅 12 頁使用 `.dist-card.hub-tech` 組合；districts 中樞兩頁用純 `.hub-tech`（icon＋淺色字，本來正常）不受影響；其餘 50 頁僅定義未使用，不動


## v9.56《防踩坑優化——18 區文本逐區化＋CSP 審計＋錨文本自然化》

依外部 SEO 審閱文檔《給網頁設計師的 3 個「防踩坑」溫馨提示》對 v9.55 滅馬蜂巢/黃蜂巢佈局做三項加固。

### 一、18 區文本逐區客製化（防 Doorway Pages）
- 十八區＋愉景灣 19 區頁 ZH/EN 蜂巢專區文本由「同一段照抄」改為逐區獨立撰寫：
  - p1 正文按當區住屋場景分化——村屋型（西貢/大埔/北區/元朗/屯門/離島/愉景灣等）寫「村屋簷篷・花園樹叢・棚架」，市區型（油尖旺/深水埗/東區等）寫「冷氣機位・窗框・招牌後・天台簷篷」，混合型（中西區/灣仔/九龍城/黃大仙/觀塘/葵青/沙田等）兩者兼寫並加當區地標（獅子山山腳、九龍塘洋房、林村河畔、大澳棚屋、老圍/川龍等）
  - h2 後綴逐區不同（— 窗棚蜂巢點算？/ — 村屋簷篷蜂巢點處理？/ — 招牌後蜂巢點算？等 19 款）
  - FAQ 答案逐區開場＋按物業類型分工句（法團/管理處協調 vs 村屋私人範圍直接安排）
  - 服務卡描述按 village/urban/mixed 三型分化
  - 「滅馬蜂巢」「黃蜂巢」兩詞於每頁繼續並存（用戶指令不變）
- EN 版同步逐區改寫（西貢 Sai Kung village canopies、元朗 orchards、旺角 behind signs 等），保留 "ma fung" 術語教育內容
- 合規 v9.45 標準維持：零 即日/保證/根治/100%/最平

### 二、CSP 全站審計（確認不阻 Googlebot 渲染）
- 新增全站 CSP vs 實際資源匹配審計：64 頁有 CSP meta 逐頁核對 script-src/style-src/frame-src/connect-src（含 default-src fallback）與頁面實際載入之外部資源
- 審計結論：零違規——cdnjs/udify/YouTube (youtube-nocookie)/challenges.cloudflare.com/workers.dev 全部正確放行；inline script/style 均有 unsafe-inline；67 頁無 CSP 不存在阻擋
- robots.txt 複核：Googlebot 僅 Disallow /info/vote/admin.html，CSS/JS/圖片全放行
- Turnstile 三指令回歸：vote ZH/EN script-src/frame-src/connect-src 均含 challenges.cloudflare.com

### 三、內部連結 Anchor Text 自然化（防 100% 完全匹配）
- footer 124 頁蜂巢錨由單一 exact-match 改為輪換：ZH「滅馬蜂巢/滅馬蜂巢專頁/黃蜂巢安全摘除/摘馬蜂巢・黃蜂巢」4 變體（16/16/15/15）；EN「Hornet Nest Removal/Wasp Nest Removal Guide/Wasp & Hornet Nest Removal」3 變體（21/21/20）
- 19 區頁蜂專區兩條行內錨（專頁＋公司頁）各 3 變體錯位輪換
- services SERVICE 06 錨與 districts index 錨文案區隔
- FAQ 答案內錨隨逐區文案自然分化

## v9.55《滅馬蜂巢・黃蜂巢＋Turnstile 啟用＋blog-15 混合模式》

依用戶指令「將香港十八區加入滅馬蜂巢（或黃蜂巢），兩個詞都保留，再設置滅馬蜂巢（或黃蜂巢）專頁，優化其他相關頁面（包括英文EN版）」，並兌現 v9.54 承諾完成 Turnstile 分階段啟用，同步落地 blog-15 混合模式優化。

### 一、滅馬蜂巢／黃蜂巢 SEO 佈局（兩詞並用）
- 新增 /wasp-nest/＋/en/wasp-nest/ 專頁（事項型：馬蜂巢點算＋叫法拆解＋流程＋收費參考＋十八區覆蓋網 20 卡），與 /service/wasp/（公司型滅黃蜂公司 pillar）錯位互補互鏈；JSON-LD×4（Breadcrumb＋Service hasOfferCatalog＋FAQPage 6 問＋PestControl 同 @id）；EN 版含 "ma fung" 術語教育內容
- 十八區＋愉景灣 20 區頁 ZH/EN 各 4 補丁：keywords 加詞、服務卡加「🐝 滅馬蜂巢／黃蜂巢」、新增蜂巢專區（h2 兩詞＋連專頁＋連 pillar）、FAQ 加一條（兩詞入 Q＋A）
- footer 全站灌溉：「滅馬蜂巢」/「Hornet Nest Removal」exact-anchor 入駐全站 footer（sep/nosep 變體）
- services ZH/EN 新增 SERVICE 06 wasp article（兩詞＋雙鏈）；service/wasp ZH/EN 互鏈專頁＋sub/keywords 加馬蜂詞；districts index ZH/EN 蜂巢提示行

### 二、Cloudflare Turnstile 啟用（承 v9.54 承諾）
- vote ZH/EN：TURNSTILE_SITEKEY 填入（0x4AAAAAAENKg40O2PKrvqKN）
- CSP 三指令放行 https://challenges.cloudflare.com（ZH script/frame/connect＋EN script/connect＋EN frame-src 由空填值）——解除 Turnstile 中間態全站留言 403 封鎖
- 上傳後前端 widget 自動渲染、提交附 turnstile_token、Worker siteverify 二次核對

### 三、blog-15 混合模式（保留靜態 FAQ＋尾部引導討論區）
- ZH/EN 各插 vote-redirect-banner CTA（延伸閱讀前）：保留 5 條 FAQ 不動，尾部 banner 引導讀者匿名留言互動


# 修復日誌 (v9.54 — 2026-10-16)

## v9.54《討論區 Schema 五缺失修復》— GSC 結構化資料 5 個非重大問題全面修復（ZH/EN 苦主討論區）

依 Google Search Console 報告（DiscussionForumPosting / Comment）修復 5 個「主要非重大問題」——不影響收錄與排名，修正後留言可在搜尋結果有更完整嘅富文本（Rich Snippets）展示。此類問題源自靜態 JSON-LD 示範留言嘅時間/作者欄位寫法；前端動態代碼只更新 userInteractionCount，唔會改寫日期同作者欄位，故靜態手術即徹底修復。

### 修復內容（/info/vote/ ＋ /en/info/vote/ 兩頁同步）
- datePublished 補全 ISO 8601 含香港時區：主帖 2026-01-15T09:00:00+08:00；4 則留言 2026-02-03T14:30/15:10:00+08:00、2026-02-11T10:20/11:05:00+08:00（回覆時間戳晚於提問，敘事合理）——同時解決「datetime 值無效」與「缺少時區」兩類警告
- comment.author.url 補預設頁址（文檔指定方案）：ZH 8 處 Person/Organization author 全部帶入 https://bruceleehk.com/info/vote/（EN 版帶入 /en/info/vote/），確保欄位唔會空值
- 附帶衛生修復：EN 頁 head font-awesome preload 誤被 <noscript> 開標籤包裹（巢狀錯位、2 開 1 閉）→ 解開包裹並清理結尾錯位標籤，與 ZH 版 head 結構完全對齊
- sitemap.xml：兩頁 lastmod → 2026-10-16；URL 集不變（125 條）

### 驗證與用戶端待辦
- v9_54_verify.py：JSON-LD parse、ISO 8601 regex、author.url、@id/headline/留言文本零變、回歸 v9.49-53 全過；agent-browser 雙語實測 schema 動態 parse＋console 零錯
- 用戶端：GitHub Desktop 三步上傳後，返回 Search Console 該報告點擊右下角藍色按鈕【修正「討論區結構化資料」問題】讓 Google 重新抓取（數日後警告清零）

## v9.53《關注組留言丟失修復》— 全港滅蟲關注組（免登入版）手機發相＋文字留言失敗全面檢測與修復（前端雙語＋Worker v6.1）

依用戶報告「手機發相片和文字留言不成功」全面檢測，實證揪出雙重根因：①用戶 18:31 留言（含 958KB 相片）實際已成功入庫——「不成功」屬呈現層假象；②真正 bug＝留言存單一 KV blob，POST 讀→改→寫，KV 讀取滯後時後寫者用舊陣列覆蓋前一人剛出嘅留言（實測：3 則測試留言被吞 2 則；相隔 17 分鐘嘅連續 POST 後者竟無被冷卻攔截＝配額讀取同樣滯後）。

### Worker v6.1（comment-handler.js，需貼上 Cloudflare Dashboard 重新部署）
- 每則留言同步寫獨立備份鍵 c:<pageId>:<id>（TTL 與 blob 相同）；GET 以 kv.list(prefix) 掃描，blob 缺失即救援合併——內容永不流失（顯示層持續救援直至 admin 真刪）
- client_ref 冪等：前端附 32 位 ref，Worker 於配額檢查之前查 ref 鍵，重發直接返回原 comment_id（duplicate:true）——重發唔會被 1 小時冷卻誤傷、唔會重複出帖；ref TTL 7 日
- admin 刪除／刪除並封鎖同步遞迴剷備份鍵（防 GET 救援復活已刪留言）；/api/health version 6.1＋features 加 lost_update_recovery、client_ref_idempotent；GET 回應加 recovered 欄位
- 單元測試（mock KV）4/4 PASS：stale 覆蓋→救援還原、admin 刪除→零復活、ref 取回原 id

### 前端（vote ZH/EN）
- 提交引擎重寫：res.text()＋JSON.parse 取代 res.json()（防 HTML 挑戰頁炸入 catch 變「未知錯誤」）；網絡中斷／非 JSON 回應自動重試 2 次（2.5s/6s backoff，同 ref 冪等）
- 草稿保存：最終失敗（網絡中斷／防護攔截／429 冷卻）自動將暱稱＋內容＋相片 dataURL 存 localStorage comment_draft；重載頁面自動回復表單＋預覽＋ref，直接再按提交即可（唔使重新打過）；成功後清除草稿
- 精準提示四類分道：網絡中斷／防護攔截（建議 WiFi⇄數據切換）／冷卻倒數／重發確認
- 相片管道實測正常：File→FileReader→Canvas 雙尺寸壓縮（HD 1600px/縮圖 400px）→「圖片已就緒」；CORS 預檢 204 正常；Turnstile 未啟用；蜜罐欄位前端不存在（不會誤觸）

### 部署順序與驗證
- 雙向兼容：v6.0 Worker 會忽略 client_ref；前端重試／草稿純前端運作——先部署任何一方都安全
- 實測記錄：線上站 E2E（真瀏覽器 390px 模擬揀相→提交）HTTP 200 成功入庫（該則「系統檢測」測試留言請管理員於 admin.html 刪除）；用戶 18:31 留言完整保留


## v9.52《四卡 AI 診斷按鈕全覆蓋》— 首頁【實戰案例短片】左 3 卡（曱甴／老鼠／白蟻）各增「🔬 免費 AI 蟲害初步診斷」按鈕（雙語）

依用戶指令：首頁【實戰案例短片】左 3 卡 CTA 行在 WhatsApp 預約按鈕之前各加「🔬 免費 AI 蟲害初步診斷」按鈕（href=/ai/，沿用第 4 卡 btn-mini btn-mini-ai 樣式與按鈕順序——AI 診斷在前、WhatsApp 在後），四卡 CTA 版式完全統一：每卡兩顆按鈕（AI 診斷＋對應 WhatsApp 分流：曱甴防治／老鼠防治／白蟻防治／T3i 微波探測）。EN 首頁同步（🔬 Free AI Pest Diagnosis → /en/ai/）。零 CSS 改動（btn-mini-ai 既有）；零合規風險（純按鈕增設，文案零承諾）。


## v9.51《實戰案例短片四卡統一 feature 版式》— 首頁左 3 卡升級與第 4 卡同款版式（個案紅標＋描述＋CTA 行）＋第 2 卡換用戶指定新封面 hong-kong-pest-control-rat-glue-board-bait-box＋三顆 WhatsApp 預約按鈕（雙語）

依用戶指令：①首頁【實戰案例短片】左 3 卡版式與第 4 卡（白蟻復發救援 feature 卡）統一：每卡加紅底個案標籤（📍）＋video-desc 描述＋video-cta-row；②第 1 卡曱甴加「💬 WhatsApp 預約 曱甴防治」（縮圖外鏃 YouTube 頻道不變）；③第 2 卡老鼠加「💬 WhatsApp 預約 老鼠防治」，封面換用戶指定 hong-kong-pest-control-rat-glue-board-bait-box.jpg（768×1344 jpg＋webp，SEO 檔名），並升級頁內 facade 播放（7sbS9n_HW8g，點縮圖不離站）；④第 3 卡沙頭角白蟻加「💬 WhatsApp 預約 白蟻防治」，同樣升級頁內 facade 播放（UGsqF-hFcK8）；⑤EN 首頁同步（WhatsApp Booking · Cockroach/Rat Control/Termite Control）。新 CSS：.video-grid .video-feature 統一 264px 四卡一行（1112px 容器實測）＋a.video-facade-hit display:block；卡 2 紅標下移 top:80px 避讓封面自帶標題（兩處打磨：初次 276px 於 1280 螢幕 wrap 3+1、badge 遮封面標題，均修正）；JS：attachFacade 泛化函數（複用 v9.9 facade 模式）。合規：描述如實陳述零「保證/根治」字眼。


## v9.50《官方新 Shorts 全面接軌＋實拍圖上陣＋中樞去重》— 死鏈舊 Shorts x35NdvWDfkM 全站 6 檔 10 處換新官方視頻 7sbS9n_HW8g＋blog-23 正文/og/JSON-LD 圖換 docx 實拍圖＋info 中樞重複卡修復（ZH 3→1、EN 3→1）

依用戶三項指令複核與落地：①《【師傅出更】資深滅鼠師傅變身魔術師！.docx》核對——文章已於 v9.49 上線 /info/blog-23/（標題/H1/發佈日期/【師傅出更】分類/六標籤與文檔一致），本輪將文檔內嵌實拍圖（師傅摺板雙格實拍 1024×765）替換正文配圖，og:image/twitter:image/BlogPosting JSON-LD image 同步換真實照片（強化 E-E-A-T 原創體驗訊號）；②《內部連結「權重灌溉」.docx》全項複核——策略一（footer 120 頁錨 v9.46＋blog/討論區 15 錨 v9.49）✓、策略二（rodent Title 重修＋流程區嵌片 v9.49）✓、策略三（FAQPage Schema 六問 v9.46）✓，策略四（GBP 公司名＋評論關鍵字＋本地外鏈投稿）屬站外待用戶執行；③新官方視頻 7sbS9n_HW8g（【滅老鼠方法】資深滅鼠師傅變身魔術師！粘鼠板瞬間變身鼠餌盒｜香港專業滅鼠公司）替換已失效舊 Shorts x35NdvWDfkM（YouTube playabilityStatus=ERROR）：blog-23 ZH/EN facade＋VideoObject embedUrl/contentUrl、首頁【實戰案例短片】粘鼠板變身鼠餌盒卡 ZH/EN、rodent ZH/EN 流程區 facade。

### 修復
- info 中樞重複卡（v9.49 插入補丁重跑遺留 bug）：ZH blog-23 標準卡 3→1、EN featured 卡 3→1
- sitemap：6 個改動 URL lastmod 維持 2026-10-14（總數 125 不變）


## v9.49《師傅出更魔術師＋權重灌溉＋首頁影片換血》— blog-23《【師傅出更】資深滅鼠師傅變身魔術師》雙語上線（圖＋Shorts 影片）＋內部連結權重灌溉（滅鼠公司錨文本→/service/rodent/）＋rodent Title 重修與流程區嵌片＋首頁實戰案例短片換血

依用戶三項指令：①《【師傅出更】資深滅鼠師傅變身魔術師！.docx》上線【滅蟲資訊】（圖片＋YouTube Shorts x35NdvWDfkM 影片 facade 嵌文內 DIY 三步曲之後）；②《內部連結「權重灌溉」.docx》落地：blog-1/9/17/18/20/21＋討論區＋EN 對應共 15 處「滅鼠公司 / rat control company」錨文本精準指向 /service/rodent/，rodent 專頁 Title 重修（單次滅鼠 $1,500 起・IoT智慧鼠盒監測・不鏽鋼防鼠網封堵——文檔建議「斷尾」字眼按第362章合規標準不用），流程區嵌入實戰短片拉長 Dwell Time（FAQPage Schema v9.46 已有）；③首頁【實戰案例短片】木蝨高溫蒸氣卡更換為粘鼠板變身鼠餌盒卡（雙語）。

## v9.48《蟲種服務主頁網絡》— 新建 /service/termite/、/service/flea/、/service/cockroach/、/service/wasp/ 四大蟲種 Pillar Page（雙語）＋全站 footer 錨文本灌溉＋rodent 服務網絡卡改道

依用戶指令「再開 /service/termite/、/service/flea/ 等獨立公司頁」，承 v9.46 滅鼠公司 Pillar 模板落地 v9.46 遺留方案：四大蟲種各開獨立服務主頁，與滅鼠公司 Pillar 組成全蟲種服務主頁網絡（Pillar &amp; Cluster）。

### 新建四大蟲種服務主頁（ZH＋EN 共 8 頁）
- /service/termite/ 滅白蟻公司：Termatrac T3i 微波探測免拆牆定位蟻巢＋針對性灌注＋保養覆查；簇內鏈 blog-13/14/16/19＋愉景灣地區頁；蟻路實拍圖 alt 布詞
- /service/flea/ 滅蝨公司：床蝨（木蝨）高溫蒸氣＋縫隙處理＋床腳偵測器＋60 日兩次覆檢；簇內鏈 blog-5/22；收費與 blog-5/12 一致（局部 $1,200 起／全單位 $3,000–5,800）
- /service/cockroach/ 滅曱甴公司：德國小蠊辨種＋藥餌凝膠點注巢群處理＋環境治理；收費與 blog-12 一致（$900–1,800）；簇內鏈中環／深水埗地區頁＋收費指南＋揀公司指南
- /service/wasp/ 滅黃蜂公司：蜂種辨別（黃蜂／蜜蜂）＋防護移除＋復巢預防；蜜蜂保護原則（確認蜜蜂巢優先建議接收處理）；收費如實「唔設劃一價目，勘察後書面報價」＋DIY 摘巢危險警告
- 十區塊結構與 rodent Pillar 完全一致（服務範圍6／流程4步／技術／明碼實價價目表／四項可驗證推薦／地區實戰 hub-grid／服務網絡互鏈／個案／FAQ×6／快速估價表單）；JSON-LD×4（Breadcrumb＋Service hasOfferCatalog 3 項＋FAQPage 6 問＋PestControl 同一 @id）；title/H1/首100字 exact-match「滅白蟻公司／滅蝨公司／滅曱甴公司／滅黃蜂公司」
- 合規（承 v9.45 標準）：全文零「保證／根除／根治／100%／最平／全港首創」；收費列明「過往個案綜合參考，以勘察後書面報價為準」；漁護署註冊除害劑；第132章公用地方責任分工交代（大廈管理處卡＋FAQ）；EN 頁正文 CJK=109 字元與 rodent EN 基準完全一致（僅導航頁腳固有）

### 全站整合
- rodent Pillar（ZH/EN）服務網絡卡 4 張改道：滅白蟻公司→/service/termite/、滅蝨公司→/service/flea/、滅曱甴公司→/service/cockroach/、滅黃蜂公司→/service/wasp/（原 blog-13/blog-5/services/quote 連結保留於各 pillar 簇內）
- services 頁（ZH/EN）曱甴／床蝨／白蟻三文章區各加「專頁入口」深鏈（Pillar 深鏈）
- footer 錨文本灌溉：footer-nav 區段內滅鼠公司錨後插入 4 條 exact-anchor（ZH 滅白蟻公司／滅蝨公司／滅曱甴公司／滅黃蜂公司；EN Termite/Bed Bug/Cockroach Control Company＋Wasp Nest Removal；sep/nosep 兩變體冪等；嚴格限定 footer-nav 區段避免誤傷 blog-12 正文裸錨）
- sitemap 115→123 URLs（8 新頁 hreflang 互指，lastmod 2026-10-13）；i18n.js 通用路徑規則自動支援 /service/*/ 雙語切換，零改動

### 驗證與交付
- v9_48_verify.py 全過：8 頁 title/H1/canonical/hreflang×3／JSON-LD×4 parse／FAQ×6／內鏈零死鏈／風險詞零；footer 灌溉計數；sitemap XML valid；回歸（rodent/blog-21 苦主告急//ai/ 師姐/首頁師妹）
- agent-browser 390px 實測 ZH/EN 多頁 console 零錯誤

## v9.47《床蝨警報＋數據留存》— ①blog-22《澳航客機驚現床蝨急停飛》雙語上線（新聞整合＋旅遊防蝨攻略，第362章合規 hardening）②依《網站圖片 SEO 自動化重命名與 AI 診斷數據留存技術規格說明書》落地：討論區圖片 SEO slugify 引擎＋AI 診斷數據留存端點（第486章 PDPO 合規）

依《澳航客機驚現床蝨急停飛！南韓汗蒸幕爆「集體巢穴」｜旅遊防蝨全攻略與香港滅蝨指南.docx》＋《網站圖片 SEO 自動化重命名與 AI 診斷數據留存技術規格說明書.docx》兩文檔執行，並確保符合香港法律法規（第362章商品說明／第132章公眾衞生／第486章私隱）。

### blog-22 雙語上線 /info/blog-22/ ＋ /en/info/blog-22/
- Title/H1【床蝨警報】澳航客機驚現床蝨急停飛！南韓汗蒸幕爆「集體巢穴」｜旅遊防蝨全攻略與香港滅蝨指南；內容六區塊：澳航 787 羅馬飛珀斯停飛事件／釜山影島汗蒸幕「集體巢穴」／外遊四大防蝨黃金指引（入住檢查・行李離地・60°C 高溫洗烘・-18°C 冷凍）／帶蝨返屋企處理（切勿亂噴殺蟲水）／AI 診斷 CTA／FAQ×4（含收費以書面報價為準）
- 合規 hardening（承 v9.45 標準）：新聞內容全部「據報道」歸因（雪梨先驅晨報／BBC／公開網絡平台），免誹謗風險；無「一次過徹底根治／百分百保證」承諾；收費以技術人員實地勘察後書面報價為準；文首版權／成效／報價三聲明 legalbox
- 2 張 AI 示意圖 ×ZH/EN 雙套長尾 SEO 檔名（hotel-suitcase-bed-bug-inspection-travel-hk 等 4 檔）；JSON-LD×3（Breadcrumb／BlogPosting image 3 URL／FAQPage 4 問）；tags×5（床蝨/木蝨/旅遊防蝨/飛機床蝨/韓國床蝨）
- 內鏈：blog-5《家居床蝨檢查、治理及預防攻略》（主攻略簇）、blog-3 滅蟲公司推介、/info/vote/ 苦主討論區、/ai/；info 中樞 ZH/EN 新卡（床蝨攻略 fa-bed badge／EN featured 🛏️ BED BUG ALERT · NEW）

### 方案一：苦主討論區圖片 SEO 自動重命名（規格書 1.3/1.4 任務 1＋2）
- vote 頁 ZH/EN 內置 slugify 引擎：`pest-control-[district]-[pest]-[date]-[hash]`（18 區＋9 類害蟲由留言內容自動識別，預設 hong-kong/case；日期香港時區；4 位隨機 hash 防衝突）
- 提交時自動生成 alt/title（規格書 1.4 範例格式：「荃灣區老鼠害蟲個案 - 苦主討論區求助圖片」）隨 payload 上送；前台渲染 `<img>` 自動帶 SEO alt/title，lightbox data-title 同步；LocalStorage 暫存同帶 img 欄位
- comment-handler.js 後端：img_slug regex 白名單（`^[a-z0-9-]{10,120}$`）＋img_alt/img_title 200 字 sanitize，唔合法即丟棄；GET /api/comments 自動輸出（`...p` 展開）
- 註：討論區圖片以 data URL 存 KV（無實體檔名），slug 為 SEO 語意元數據——管理員日後將圖片整理上站時採用 img_slug 作檔名即可延續規格

### 方案二：AI 診斷數據留存端點（規格書 2.2–2.4 任務 3＋4，PDPO 合規）
- 新增 worker/ai-case-log-worker.js：POST /api/v1/telemetry/ai-case-log（Bearer 時序安全驗證＋2MB 限制＋120/h 頻率限制）＋GET health＋admin/list／admin/get；KV 實現 ai_diagnosis_logs 結構（規格書 2.3 九欄位），TTL 預設 730 日到期自動刪除
- PDPO：IP 僅以 SHA-256(IP+鹽) 單向雜湊入庫（原始 IP 永不保存）；name/phone/email/address 欄位直接拒收；user_desc 內香港電話／電郵自動遮蔽；圖片備份可選（BACKUP_IMAGES，預設關閉只存 URL）
- 新增 worker/wrangler-ai-case-log.toml（Route：bruceleehk.com/api/v1/telemetry/* 攔截，其餘路徑照常 GitHub Pages）＋worker/AI-CASE-LOG-DEPLOY.md（5 步部署＋Dify HTTP 節點設定表＋端到端測試 curl 指令）
- ⚠️ Worker 部署＋Dify HTTP 節點設定屬用戶端操作（wrangler deploy；詳見 AI-CASE-LOG-DEPLOY.md）

### PDPO 合規：/ai/ 頁數據收集聲明（ZH/EN）
- 新增「數據收集聲明」section（第486章 PICS 式告知：收集範圍／SHA-256 匿名化／保留約 24 個月／查閱更正權＋WhatsApp 查詢入口）
- ⚠️ 同步修正舊聲明失實風險：「於分析後立即銷毀，絕不存檔」→ 如實反映方案二留存安排（匿名留存約 24 個月後自動刪除）——數據留存上線前必須修正，避免《商品說明條例》誤導性遺漏風險

### sitemap／其他
- sitemap 113→115 URLs（blog-22 ZH/EN，lastmod 2026-10-13）；/ai/＋/en/ai/ lastmod 同步 2026-10-13（內容有變）
- assets/js/i18n.js 文章數上限 n≤21→22
- 新增 4 個圖檔（2 圖 ×ZH/EN 檔名）；全站零刪檔；師妹/師姐分流、Worker 既有功能零改動

## v9.46《滅鼠公司 Pillar Page》— 新建 /service/rodent/ 服務主頁（雙語）＋全站錨文本灌溉＋rat-control 轉攻滅鼠師傅

依《新建或優化一頁獨立嘅「滅鼠公司」服務主頁.docx》＋《滅鼠關鍵字 SEO 內容佈局與轉化矩陣.docx》兩文檔建議：以 Pillar &amp; Cluster 架構搶佔「滅鼠公司」全港核心大詞（現排 60 名外），避免再用資訊型 blog 打交易型意圖。

### 新建「滅鼠公司」服務主頁 /service/rodent/（ZH）＋ /en/service/rodent/（EN）
- Pillar &amp; Cluster 架構落地：Title【香港滅鼠公司推介】明碼實價價目表・IoT智慧監測・最快即日上門；H1 香港專業滅鼠公司｜IoT 智慧監測・源頭防鼠封堵工程；首 100 字 exact-match「滅鼠公司」
- 內容十區塊：服務範圍（6 物業類型）／服務流程四步／IoT 智慧鼠盒／明碼實價價目表（$1,500–$3,800 過往個案參考，與 rat-control 一致）／四項可驗證推薦指標／十八區覆蓋（五大黑點區專頁＋食環署 2024 數據圖）／服務網絡（滅白蟻公司→blog-13、滅蝨公司→blog-5、滅曱甴公司→/services/、滅黃蜂公司→/quote/）／實證個案（南丫島・美孚・八鄉・荃灣安裕查詢個案如實陳述）／FAQ×6／快速估價表單
- JSON-LD×4：BreadcrumbList＋Service（hasOfferCatalog 3 項目）＋FAQPage（6 問 Rich Snippet）＋PestControl entity（與 rat-control 同一 @id）
- 合規用詞（承 v9.45）：無「保證／根除／100%／最平／全港首創」；收費列明「過往個案綜合參考，以書面報價為準」； licences 表述「除害劑牌照專業團隊・漁護署註冊除害劑」
- 設計系統 100% 沿用 rat-control（dist-hero／dist-card／web-net／hub-grid／rat-price-table／faq-item），雙語對稱、i18n 語言切換自動映射（generic 路徑規則）

### 全站錨文本權重灌溉（文檔第二步）
- ~108 頁 footer-nav「覆蓋十八區」後插入 exact-anchor 連結：ZH「滅鼠公司」→ /service/rodent/；EN「Rat Control Company」→ /en/service/rodent/（冪等、區域限定 footer-nav）
- blog-12「🐭 專門搵滅鼠公司？」連結改道→【滅鼠公司服務主頁】（原只連滅鼠專門站）
- 首頁【滅鼠專門站】banner 加第三按鈕「滅鼠公司服務主頁」

### rat-control 轉攻「滅鼠師傅」（避免 cannibalization）
- ZH title/H1/og/twitter/meta description/JSON-LD Service name：【滅鼠公司】→【滅鼠師傅】香港專業滅老鼠服務｜十八區即日上門；EN 同步 Rat Control Company→Rat Exterminator
- hero 加「滅鼠公司服務主頁」連結（簇→柱）；十八區 Silo 與地區專頁零改動

### sitemap／其他
- sitemap +2 URLs（111→113）：/service/rodent/＋/en/service/rodent/（hreflang 互指，lastmod 2026-10-12）
- 清理 assets/img 7 個中文檔名殘留圖（v9.42 遺漏；零 HTML/JS/XML 引用已核實）：iot-智慧鼠盒-捉老鼠-滅鼠公司-推介-whatsapp-對話.jpg、pest-control-termites-hk-根除白蟻.jpeg、termite-inspection-hk-白蟻檢查預防.jpeg、中環-餐廳-廚房-滅老鼠-防鼠網工程-whatsapp-諮詢.jpg、南丫島-村屋-滅老鼠-whatsapp-免費報價-真實個案.jpg、屋企-半夜-發現老鼠-緊急-滅鼠服務-whatsapp-求救.jpg、沙頭角-禁區紙-滅白蟻公司-白蟻防治.jpeg
- ⚠️ 用戶端：GitHub repo 如仍有上述 7 個中文檔名檔案，解壓覆蓋後需手動刪除（解壓唔會刪檔）

## v9.45《苦主告急》— blog-21 分類改名＋如實陳述修正＋香港法例合規（第362章／第132章）

用戶指令：①【蟲患速遞】分類改名【苦主告急】，文章如實陳述收到「荃灣安裕大廈」苦主關於滅老鼠嘅查詢、希望我司報價；②按《商品說明條例》（第362章）不良營銷手法風險及《公眾衞生及市政條例》（第132章）責任分工，修正文章規避潛在法律風險。

### blog-21 ZH＋EN 法例合規修正（主要改動）
- 如實陳述：全文改為「單一查詢個案」框架——苦主清晨發現老鼠入屋，WhatsApp 查詢並希望我司報價；明確「截至撰文個案仍喺報價跟進階段，服務尚未開展」
- 刪除不可證實聲明（第362章風險）：「聯網數據證實／業內其他接單平台大量急單／眾多苦主告急／鼠群擴散／重災區／爆發風暴中心」全數移除，改為苦主個人陳述框架＋「未經官方機構證實」
- 絕對化成效承諾軟化：「一招斷尾／確保斷尾／永遠行唔入／0 隱藏收費／即日上門／30 秒估價／全港首創」→「列明服務範圍報價／盡量安排盡快上門／快速估價」等合規表述
- 第132章責任分工新增：大廈公用地方（走廊、垃圾房、天井、外牆喉管）蟲鼠防治屬法團／管理處職責，公眾街道可向食環署報告；單位室內由持牌滅蟲公司跟進
- 新增「個案說明與服務聲明」免責 box（blog21-legalbox，amber 配色）：資料來源苦主陳述、未經政府部門證實、服務未開展、無成效保證、132章分工、建議僅供參考
- 針對指名大廈嘅負面斷言全部歸因苦主陳述：「老鼠飯堂／走廊淪陷／爆發」等標題與斷言重寫；CTA「安裕大廈街坊報料」改為「有類似經歷？交流」
- Title／H1／meta description／og／JSON-LD headline／articleSection／breadcrumb 同步改寫；FAQ×4 頁面＋JSON-LD 同步軟化；圖說／alt「安排緊急跟進」→「整理報價跟進」
- EN 對稱：Pest Alert → SOS Alert；「Network Data Confirms: Rat Hotspot」等同步重寫＋Cap. 132 分工段＋EN 免責 box

### 分類改名波及（4 檔）
- info/index.html＋en/info/index.html：blog-21 卡 badge 蟲患速遞→苦主告急／PEST ALERT→SOS ALERT＋標題摘要如實化
- rat-control/tsuen-wan/＋en/rat-control/tsuen-wan/：同區實錄卡 蟲患速遞→苦主告急／Breaking→SOS Case

### 保留不變
- 3 張 WhatsApp 截圖與長尾 ASCII 檔名、6 圖、內鏈結構、sitemap（lastmod 同日 2026-10-12 免改）、i18n、師妹 widget

---

# 修復日誌 (v9.44 — 2026-10-12)

## v9.44《蟲患速遞》新分類專欄——blog-21《荃灣安裕大廈疑爆發嚴重鼠患》雙語上線，強攻「滅老鼠」關鍵詞

【蟲類資訊】增設全新分類【蟲患速遞】（⚡ 突發警報導向），首篇文章即為荃灣安裕大廈疑似鼠患爆發真實個案，目標快速搶佔「滅老鼠公司」「荃灣滅老鼠」「安裕大廈 老鼠」等 Google 搜索關鍵詞。

### 新增檔案
- `info/blog-21/index.html`＋`en/info/blog-21/index.html`：雙語完整文章頁（hero 警報設計＋個案檔案條＋3 張 WhatsApp 真實截圖＋釜底抽薪三步＋FAQ 手風琴×4＋標籤）
- `assets/img/` 6 個 ASCII 檔名新圖（ZH/EN 各一套長尾名）：
  - `tsuen-wan-on-yu-rat-sighting-dawn-whatsapp-sos.jpg`（ZH）／`tsuen-wan-rat-infestation-emergency-rodent-control-whatsapp-quote.jpg`（EN）——清晨 5:19 求救報價對話（733×1024）
  - `kitchen-rat-sighting-rat-droppings-whatsapp-consultation.jpg`（ZH）／`on-yu-building-kitchen-rat-assessment-whatsapp-chat.jpg`（EN）——廚房老鼠蹤跡問診（由雙截圖合成檔拆分，508×572）
  - `on-yu-building-rat-photo-verification-whatsapp.jpg`（ZH）／`rat-sighting-photo-verification-tsuen-wan-pest-control-whatsapp.jpg`（EN）——現場相＋「安裕大廈」確認（拆分，509×572）

### SEO 佈局
- Title／H1／meta 布滿「滅老鼠公司・荃灣滅老鼠・老鼠入屋・滅鼠收費」長尾矩陣；BlogPosting JSON-LD image 4 URL；FAQPage JSON-LD×4 問題；sitemap +2 URLs（109→111）
- 內鏈：/rat-control/ 滅鼠專門站＋/rat-control/tsuen-wan/ 荃灣專頁（新同區實錄卡）＋blog-18／blog-20／blog-17／苦主討論區／/ai/ 診斷
- info 中樞 ZH/EN 頭部新卡（蟲患速遞 / PEST ALERT badge）；i18n.js blog 放行 n≤21

---

## v9.43《AI 客服頁面分流》— 全站師妹照舊，AI 分析專頁專用「滅蟲師姐」上線

兩個 Dify AI 分流部署：右下角『滅蟲師妹 AI』（C3DvioLaCmagSaUc）繼續全站 7×24 接待零改動；客人進入『AI 害蟲分析系統』專頁（/ai/）時，對接專頁專用嘅『滅蟲師姐』（DKKeV6Vb9y16r6HL）。

### /ai/ 專頁 ZH＋EN（分流主體）
- 新增「即刻同滅蟲師姐 AI 傾兩句」專屬對話區（ai-tool-section 之後）：section 標題＋簡介＋ iframe 卡片（max-width 860px、圓角 16px、高度 700px／手機 620px、loading="lazy"、allow="microphone;clipboard-write"）
- 防禦性隱藏：`#lazy-dify-bubble / #dify-chatbot-bubble-* / #ai-chatbot-iframe{display:none!important}`——本頁任何形態嘅師妹均隱形（future-proof，日後模板變動都唔會雙 AI 同框）
- EN 版 /en/ai/ 對稱上線（AI Pest Expert Assistant）
- CSP：/ai/ 本已放行 udify.app；**修復 /en/ai/ 存量 bug**——frame-src 空值 `frame-src;`（連任何 iframe 都禁）→ `frame-src https://udify.app;`

### 順手救火：全站 footer 簡體連結語法錯亂（106 頁）
- 存量 bug：`<a href="/sc/"> lang="zh-Hans">简体</a>`——lang 屬性飄出標籤外，頁面實際渲染出「 lang="zh-Hans">简体」垃圾文字
- 修正：`<a href="/sc/" lang="zh-Hans">简体</a>`（ZH 頁「简体」／EN 頁「简体中文」兩變體通殺，106 頁全修）
- sitemap /ai/＋/en/ai/ lastmod → 2026-10-12

---

# 修復日誌 (v9.42 — 2026-10-12)

## v9.42《SEO 素材圖全 ASCII 化》— 7 張中文檔名圖退役，白蟻實拍三圖接入 blog-19

用戶確認 7 張中文檔名圖為 SEO 圖片搜索素材，要求全部 ASCII 化（全英文細階＋連字號）並接入對應文章。Google 圖片搜索檔名即可讀 URL，中文檔名上 GitHub Pages 有編碼風險（v9.27 遺留項），本次一併根治。

### 圖片檔名 ASCII 化（7 張全數退役）
- 4 張老鼠 WhatsApp 個案圖：舊會話已完成 ASCII 化並接入 blog-17/blog-18 ZH/EN（ZH/EN 各一套長尾 SEO 檔名，MD5 位元組級核對一致）——本次刪除中文原始檔收尾：
  - 智慧鼠盒 → smart-rat-trap-catch-…（ZH）／iot-smart-rat-trap-…（EN）
  - 中環餐廳 → kitchen-rodent-proofing-…（ZH）／central-restaurant-kitchen-…（EN）
  - 南丫島村屋 → lamma-island-village-house-…（ZH/EN）
  - 屋企半夜求救 → night-rat-sighting-emergency-…（ZH）／home-emergency-rat-…（EN）
- 3 張白蟻實拍圖（GPS 22°32'N 114°13'E＝沙頭角金行個案現場）本次 ASCII 化＋接入：
  - 大蟻竇紅圈標註圖 → **termite-nest-detection-hk.jpg**（1600×899）
  - 木橫樑瓦頂泥路圖 → **termite-inspection-mud-tubes-wooden-beam-hk.jpg**（900×1600）
  - 門框泥路近攝圖 → **termite-mud-tube-door-frame-eradication-hk.jpg**（1600×900）
- 刪除 7 個中文原始檔：assets/img 全站零非 ASCII 檔名（GitHub Pages 編碼風險根治）
- ⚠️ 用戶端必做：GitHub Desktop 覆蓋後須手動刪除 repo 內同 7 個中文檔名舊檔（解壓覆蓋不會刪檔）

### blog-19《沙頭角百年金行》實證相簿擴充（ZH/EN 對稱）
- 「⚔️ 師傅出更」相簿 2→3 圖：加大蟻竇實拍（紅圈＋標註，個案核心證據）
- 「🔬 科技守護古建」段新增泥路實拍相簿（木樑泥路＋門框泥路 2 圖，呼應正文「蟻路泥被藏於橫樑交接位」）
- alt 長尾布詞：沙頭角滅白蟻／禁區滅白蟻公司／文化建築白蟻防治／白蟻檢查／根除白蟻
- BlogPosting JSON-LD image 陣列 2→5 URL（Google 圖片搜索多圖提名）
- sitemap blog-19 ZH/EN lastmod → 2026-10-12

---

# 修復日誌 (v9.41 — 2026-10-12)

## v9.41《深化十八區地區滅鼠》— 2024 食環署官方鼠患數據全面植入

依用戶上傳《深化「十八區地區滅鼠」SEO優化方案.docx》四大策略落地，以官方數據提升全站 E-E-A-T（權威性＋信任度），搶佔「滅鼠師傅／滅鼠公司」及「食環署鼠患」相關搜索前 3 位置。

### 策略一：地區專頁「權威背書」數據帶（10 頁）
- 五區滅鼠子頁 ZH/EN（油尖旺/深水埗/觀塘/元朗/荃灣）首屏（web-net 後、地區痛點前）新增「官方數據」卡：大數字＋全港排名徽章＋食環署《2024 年於 18 區收集死鼠及捕獲活鼠數目》出處＋師傅防伏貼士（死鼠發臭危機）＋blog-20 內鏈——油尖旺 20,678（第1）、深水埗 12,348（第2）、元朗 7,167（第6）、觀塘 6,182（第9）、荃灣 3,840（第14）
- 元朗 pain_intro 依方案原文補句：「元朗區單年總數高達 7,167 隻——數字背後，反映大量溝鼠正透過花園同渠網入侵民居」（ZH/EN 對稱）
- keywords 擴充：食環署鼠患,香港鼠患指數,鼠患重災區（EN: FEHD rat data,HK rodent statistics,rat hotspot）

### 策略二：Link Bait 排行榜文章 blog-20 上線（ZH/EN）
- /info/blog-20/《2024 食環署 18 區鼠患數據大公開！油尖旺破 2 萬隻排榜首，專家解構「死鼠發臭」危機》：18 區完整排行表＋Top 5 重災區專家解構＋「死鼠發臭」四重危機＋防鼠封堵三步曲＋on-page FAQ 4 問＋JSON-LD 三段（Breadcrumb/Article/FAQPage）
- EN 版 /en/info/blog-20/ 對稱上線；i18n.js 支援 blog-20 語言切換（1-20）

### 策略三：Image SEO 霸佔圖片搜索
- 官方數據圖表 /assets/img/2024-hk-district-rat-statistics.jpg（1220×1402，底加水印：資料來源聲明＋品牌防盜）：SEO 檔名＋alt 布詞；blog-20＋滅鼠樞紐雙嵌入（lazy load）

### 策略四：權重灌注
- 滅鼠樞紐 ZH/EN 新增「2024 食環署官方數據：十八區鼠患重災區排行榜」section（Top 5 表＋防伏貼士＋blog-20 內鏈＋圖表嵌入）
- info 中樞 ZH/EN 加 blog-20 卡；blog-18 ZH/EN 結尾加 blog-20 內鏈；sitemap 107→109 URLs＋16 頁 lastmod 同步 2026-10-12

---

# 修復日誌 (v9.40 — 2026-10-11)

## v9.40《滅鼠 SEO 強攻》— /rat-control/ 滅鼠 Silo 上線＋關鍵詞矩陣綁定＋EN canonical 修復

依用戶上傳《滅鼠關鍵字 SEO 內容佈局與轉化矩陣.docx》＋《優先強攻「十八區地區滅鼠」專頁.docx》三線並行：搶佔「滅鼠師傅／滅鼠公司」Google 排名前 3 位置。

### 任務一：/rat-control/ 滅鼠 Silo 正式上線（12 新頁）
- **樞紐 /rat-control/ ZH＋EN**：攔截滅鼠公司/滅鼠師傅/滅老鼠/捉老鼠大詞——H1「香港專業滅鼠公司｜滅鼠師傅即日上門｜源頭封堵斷尾，唔靠盲目放老鼠藥」；香港鼠患危害＋收費表（單次滅鼠 $1,500-$3,800/次／封堵工程勘察報價／長效保養）＋防伏提示＋「邊間好」5 大指標＋五大黑點區卡片＋實戰案例（南丫島/美孚/八鄉）＋FAQ 6 問
- **五區子頁（方案二第一階段）**：`/rat-control/sham-shui-po/`（唐樓劏房渠網）、`/rat-control/yau-tsim-mong/`（旺角食肆後巷）、`/rat-control/kwun-tong/`（工廈貨倉無毒滅鼠）、`/rat-control/yuen-long/`（村屋花園，方案二黃金文案＋八鄉案例直接落地）、`/rat-control/tsuen-wan/`（舊樓村屋後山）——每區 30-40% 地區專屬差異化：地區痛點 3 條＋科技解法＋收費參考＋真實案例＋苦主討論區 UGC 捷徑＋FAQ 4 問
- **WhatsApp 地區預填文字**：每區 CTA 帶「你好，我想查詢XX區滅老鼠收費」（方案二轉化要求）
- **JSON-LD 五段／頁**：BreadcrumbList＋Service（OfferCatalog 串聯五區）＋FAQPage＋PestControl（areaServed）＋LocalBusiness（子地點）；設計系統 100% 復用 districts 區頁（CSS 直接抽取）＋rat-price-table/rat-forum 專屬組件
- **i18n.js 零改動**：ZH↔EN 切換由通用路徑規則自動覆蓋 /rat-control/

### 任務二：關鍵詞矩陣綁定（方案一映射表）
- **blog-18**（知識攻略）：title→「老鼠入屋點算？滅鼠方法全攻略：封堵、捕捉、預防一次過」，desc×3（meta/og/JSON-LD）注入「老鼠入屋點算？香港滅鼠方法全攻略」，keywords＋滅鼠方法/家居滅鼠價錢/滅鼠公司收費，正文→滅鼠專門站內鏈
- **blog-12**（價格）：title/desc 注入「滅鼠公司收費×家居滅鼠價錢」，正文收費章節後加滅鼠站內鏈（單次滅鼠 $1,500 起）
- **blog-1**（推薦）：title→「5 大指標避坑｜滅鼠公司推薦×捉老鼠師傅」（順手修復雙品牌 title），desc 注入「搵滅鼠公司、捉老鼠師傅一樣適用」，清理 meta desc 歷史殘留床蝨英文句
- **blog-17**（實戰）：延伸閱讀後加滅鼠站內鏈（村屋滅老鼠已布局）
- **全站灌注**：首頁 ZH/EN keywords＋實戰短片後滅鼠通道 banner；districts 樞紐 web-extra 滅鼠鏈；services 滅蚊滅鼠 article 加滅鼠站連結（ZH/EN 對稱共 14 處內鏈指向 /rat-control/）

### 任務三：技術 SEO 修復（存量 bug）
- **EN 區頁 canonical 錯指 ZH 修復**：18 個 en/districts/X/ 頁＋en/districts/ 樞紐 canonical 由 `https://bruceleehk.com/districts/...` 改為自指 `/en/districts/...`（og:url 本已正確）——此前 Google 會將 EN 頁當 ZH 副本不予獨立排名
- **sitemap 95→107 URLs**：rat-control 樞紐（priority 0.9 weekly）＋五區子頁（0.8 monthly）×雙語；首頁/en/blog×4/districts/services 共 14 頁 lastmod→2026-10-11

### 質檢
- `scripts/v9_40_build_rat.py`＋`v9_40_build_hub.py`（數據驅動生成 12 頁，設計 CSS 從 districts/yuen-long 動態抽取保證一致）；`v9_40_matrix_patch.py`＋`v9_40_matrix_patch2.py`（冪等補丁，kw_append 修正 marker 檢查 keywords 行而非全文的誤判）；`v9_40_canonical_sitemap.py`；`v9_40_check_rat.py`（12 頁 JSON-LD 解析＋標籤平衡＋canonical 自指）；`v9_40_verify.py` 60/60 PASS
- agent-browser 實測：rat-control 樞紐 ZH/EN 渲染、五區子頁、首頁 banner、i18n 切換、console 零錯誤

# 修復日誌 (v9.39 — 2026-10-10)

## v9.39《沙頭角百年金行上線》— 師傅出更文化保護 SEO 矩陣＋首頁實戰短片換真

依用戶上傳《沙頭角禁區百年金行遭受白蟻危機！.docx》兩線並行：①文章入驻【師傅出更】＋百年老店/文化建築 SEO ②首頁【實戰案例短片】嵌入沙頭角現場施工影片。

### 任務一：info/blog-19 ZH＋en/info/blog-19 EN 正式上線【師傅出更】
- **內容**：以 blog-17（師傅出更）為模板手術式構建——hero（badge：師傅出更/滅白蟻攻略/文化建築）＋casefile（北區沙頭角禁區/百年建築白蟻/擒賊擒王計＋無損微波探測）＋正文四節＋FAQ 手風琴 4 問＋CTA＋延伸閱讀（blog-16 姊妹篇互鏈＋blog-13＋北區專頁）
- **文化保護 SEO 長尾矩陣**：沙頭角滅白蟻/禁區滅蟲/百年老店滅白蟻/金行白蟻/寺廟滅蟲/寺廟滅白蟻/文化建築白蟻/文物保護單位滅蟲/歷史建築白蟻/古蹟滅蟲/免拆牆滅白蟻/白蟻探測器/Termatrac T3i——title/H1/hero/description/keywords/正文/FAQ/JSON-LD 全布局；EN 對稱（Sha Tau Kok termite control/heritage building/temple termite/cultural heritage）
- **現場相片 ×2**（docx 內嵌提取）：`sha-tau-kok-heritage-gold-shop-termite-inspection.jpg`（百年金行門外騎樓實拍）＋`sha-tau-kok-termite-t3i-inspection-on-site.jpg`（師傅木構內探測實拍），SEO 檔名＋alt
- **現場施工影片內嵌**：youtube-nocookie embed UGsqF-hFcK8（9:16 Shorts 豎版組件 .blog19-video，lazy 加載；實測真實時長 1:17）
- **JSON-LD 三段**：BreadcrumbList＋BlogPosting（articleSection=師傅出更）＋FAQPage 4 問——ZH/EN 對稱
- **中樞新卡**：ZH 蟲類資訊 blog-18 卡後新增【師傅出更】卡；EN 中樞新增 MASTER ON DUTY · HERITAGE · NEW 卡

### 任務二：首頁【實戰案例短片】第三卡換片
- IoT 智慧鼠盒監測（美孚新邨）→ **沙頭角禁區滅白蟻**（youtube.com/shorts/UGsqF-hFcK8，時長 1:17 實測值）
- 縮圖新製：`video-shataukok-termite.jpg/webp`（768×1344，金行門面豎版裁切）；EN 對稱（Sha Tau Kok Termite Rescue）；smart-iot-rat 智慧鼠盒服務卡不受影響
- i18n.js blog 映射 1-18 → 1-19；sitemap 93 → 95 URLs（blog-19 ZH/EN，lastmod 2026-10-10）

### 質檢
- `scripts/v9_39_blog19_build.py`（冪等：初跑 patch 幂等判斷缺陷致 CSS/FAQ 重複插入 ×4，`v9_39_cleanup.py` 清污＋patch 改「new in text 即 SKIP」根治後重跑）；`v9_39_integrate.py`（中樞錨點撞車 ×2 修復：卡 h3 獨有文本＋sitemap English Versions 分界）；30/30 斷言 PASS；agent-browser 實測：blog-19 ZH/EN 渲染（badge/圖×2/video/FAQ×4/console 零錯誤）、首頁雙語卡、i18n 雙向切換；EN CJK=16 與 blog-17 基線一致（語言切換組件，非殘留）

# 修復日誌 (v9.38 — 2026-10-10)

## v9.38《blog-18 封堵配圖換真》— WhatsApp 截圖退場，AI 示意圖上陣

依用戶回報：blog-18「🛠️ 專業封堵唔靠發泡膠：金屬網＋防火泥塞死每個穿牆位」一節原配 WhatsApp 諮詢截圖，圖文不符。指示取消「WhatsApp 真實諮詢紀錄」，改用 AI 製作與描述吻合嘅圖片，日後有實景相再更新。

- **AI 生成配圖**（1344×768 寫實風）：冷氣銅管穿牆位以金屬網封塞＋灰泥封邊，香港住宅外牆場景，無文字無浮水印——與 figcaption 描述逐字吻合
- **ZH/EN 對稱替換**：blog-18 ZH → `rodent-proofing-metal-mesh-fire-mortar-sealing-ai.jpg`；EN → `rat-proofing-wall-penetration-metal-mesh-sealant-ai.jpg`；alt 同步改寫並誠實標註「AI 示意圖」
- **figcaption 修正**：ZH「（WhatsApp 真實諮詢紀錄）」→「（AI 示意圖，實景相片稍後更新）」；EN「(real WhatsApp record)」→「(AI illustration, real photos coming soon)」
- 舊截圖檔案保留（blog-17 仍引用）；og:image／JSON-LD 無舊圖引用零波及；sitemap blog-18 ZH/EN lastmod → 2026-10-10
- 補丁腳本 `scripts/v9_38_img_swap.py`：8/8 OK，二次運行 8 SKIP 幂等驗證 PASS

# 修復日誌 (v9.37 — 2026-10-09)

## v9.37《優化十八區＋滅鼠攻略上線》— 地區×滅白蟻長尾矩陣＋blog-18 老鼠防治全攻略

依用戶上傳《優化十八區.docx》On-Page SEO 方案＋《老鼠防治全攻略：封堵、捕捉、預防一次過.docx》正文，兩線並行。

### 任務一：十八區「地區＋滅白蟻」排名前 3 組合拳（On-Page 部分）
- **H1 注入子地區×滅白蟻**（19 區頁 ZH+EN）：如離島區→「離島區滅蟲服務｜長洲・南丫島・東涌滅白蟻即日上門」；中西區/愉景灣特例對稱處理
- **新增「逐個據點・滅白蟻無死角」section**（40 頁 ZH+EN 對稱）：關鍵字段落＋subarea-grid 據點 chips（每區 6-8 個精準長尾：長洲滅白蟻、南丫島村屋白蟻、沙頭角滅白蟻…），村屋區/市區差異化尾句避免重複內容
- **keywords meta 擴充**：38 區頁全數加入子地區×滅白蟻精準長尾
- **LocalBusiness JSON-LD**（40 頁）：地址（荔景邨工場大廈）、電話、營業時間＋areaServed（區頁=該區子地點 Place 列表；樞紐=18 區 AdministrativeArea）——對應方案「JSON-LD 本地商家結構化數據」
- sitemap 40 個 districts URL lastmod → 2026-10-09
- ⚠️ 方案第 2-4 式（Google 商家檔案服務區域+地區貼文+好評、GSC Request Indexing、社交平台地區關鍵字引流）屬網站外操作，逐項照做先可衝前 3

### 任務二：《老鼠防治全攻略》正式上線【滅鼠攻略】分類
- **修復錯配**：蟲類資訊中樞《老鼠防治全攻略》卡片原錯指 /info/blog-5/（家居床蝨檢查頁）——文章此前根本未建立
- **新增 info/blog-18 ZH + en/info/blog-18 EN**（blog-5 同款模板）：避新反應/繁殖力/鑽洞三絕招＋封堵→捕捉→預防三步曲＋師傅總結，內嵌 2 張現有滅鼠 WhatsApp 截圖（SEO 檔名＋alt 雙管齊下）＋Breadcrumb/Article/FAQPage 三段 JSON-LD
- **中樞修正**：ZH 老鼠卡改指 blog-18 並移至列表尾＋原位補回床蝨正主卡（blog-5 首次有卡）；EN 中樞新增 Rat Control Guide 卡
- blog-17 ZH/EN 延伸閱讀《老鼠防治全攻略》連結改指 blog-18；i18n.js blog 映射 1-17 → 1-18
- sitemap +2 URLs（91→93）；舊連結 /info/blog-5/ 語義歸還床蝨攻略

# 修復日誌 (v9.36 — 2026-10-09)

## v9.36《全港正名＋免責聲明》— 討論區改名「全港滅蟲關注組 (免登入版)」＋獨立性免責聲明

依用戶指示：一、將「香港滅蟲關注組（網頁免登入版）」改名「全港滅蟲關注組 (免登入版)」；二、當眼處加上「免責聲明 (Disclaimer)」，用細字但清晰可見嘅方式寫明本討論區嘅獨立性。

### info/vote ZH＋en/info/vote EN 對稱更新
- **改名 8 處×2 語言**：title／og:title／meta description／og:description／JSON-LD headline／JSON-LD description／首屏 H1／三大優勢 aria-label；描述類句式同步重構，避免「全港最活躍嘅全港滅蟲關注組」疊字
- **免責聲明 ×2 當眼位置（ZH/EN 對稱）**：①Hero 簡介位置（第一屏深色玻璃細字框）②討論區最頂部（留言須知上方藍色 info 提示框）
- 聲明原文：「本免登入討論區由【滅蟲師傅 PEST CONTROL MASTER】獨立開發及營運，旨在保障苦主私隱，與 Facebook 上任何同名群組均無任何附屬、贊助或合作關係。」（EN 版同義翻譯）
- 保留：hero 描述句「香港首個免登入嘅滅蟲關注組」（屬描述非品牌名）、討論區 h2「香港家居害蟲苦主討論區」（另一獨立名稱）
- sitemap vote 雙版 lastmod → 2026-10-09

改動檔案：info/vote/index.html、en/info/vote/index.html、sitemap.xml、CHANGELOG.md 共 4 檔；無新頁面（sitemap 91 URLs 不變）；Worker 無需部署

## v9.35《封殺藏在細節裡魔鬼》— Cloudflare Workers 安全強化＋地區封鎖＋金鑰清庫

依《封殺藏在細節裡魔鬼.docx》方案，全面診斷兩個 Worker 與前端表單，將俄羅斯／印度／朝鮮等地惡意流量攔在萌芽階段，杜絕一切不必要嘅資金消耗：

### 🌍 comment-handler.js v5.0 → v6.0
- **地區封鎖**（fetch 最頂層）：默認封鎖 RU/IN/KP 全部 API 請求（403 GEO_BLOCKED）；環境變數 `BLOCKED_COUNTRIES` 可加碼或設 `none` 停用。零 KV 讀取、零 subrequest、零配額消耗
- **Turnstile 後端二次核對**（魔鬼細節 1）：設定 `TURNSTILE_SECRET_KEY` 後，所有非管理員 POST /api/comments 必須附帶合法 token，Worker 向 siteverify API 覆核（防 Postman/腳本繞過前端）；未設定時自動跳過，分階段啟用零停機
- **過期留言自動清理**（魔鬼細節 3）：每次寫入自動剔除超過 365 日嘅普通留言（管理員置頂／官方回覆永不過期；無時間戳舊數據保留防誤刪），垃圾留言再也塞不爆 COMMENT_KV
- /api/health 新增 `version 6.0`、`turnstile_enforced`、`blocked_countries` 欄位

### 🔐 pest-vision-worker.js v9.2 → v9.3
- **金鑰清庫（最高優先）**：移除代碼內明碼 `DIFY_API_KEY: 'app-EOJa...'` 預設值——舊金鑰已隨代碼庫公開外洩，任何人可直接燒 Dify 帳戶。必須輪換新金鑰並用 secret 設定
- **fail-closed 守衛**：金鑰未設定時 /api/analyze-pest 返回 503 AI_NOT_CONFIGURED（絕不靜默打空砲）
- **地區封鎖**：同 comment-handler（RU/IN/KP 默認，環境變數可調）
- /health 新增 `version 9.3-MoE-Hardened`、`dify_key_set`、`blocked_countries`
- CORS 白名單（魔鬼細節 5）v3.0 已鎖定，本次覆核無需改動

### 🖥️ 前端 vote 頁 ZH/EN — Turnstile 分階段接入
- 新增 `TURNSTILE_SITEKEY` 配置位（留空 = 維持現狀零影響）；填入 sitekey 後自動載入元件、提交附 `turnstile_token`、後端強制核對
- tsBox 容器＋提交前檢查＋成功/失敗/網絡錯誤後自動重置元件
- 原有數學驗證、honeypot、IP 配額（1小時/日3則）全部保留

### 📋 新增 worker/SECURITY-CHECKLIST.md
- Cloudflare Dashboard 人手操作清單：Dify 金鑰輪換步驟、Worker Secrets 設定、Turnstile widget 建立、WAF Rate Limiting 規則（/api/comments POST 3次/10分鐘/IP）、WAF 地區 Managed Challenge 規則（非香港 IP 提交 /api/*）、部署順序與驗證、每月 5 分鐘監控守則

改動檔案：worker/comment-handler.js、worker/pest-vision-worker.js、worker/SECURITY-CHECKLIST.md（新）、info/vote/index.html、en/info/vote/index.html、CHANGELOG.md 共 6 檔；無新頁面（sitemap 91 URLs 不變）
⚠️ 部署提醒：pest-vision-worker 部署前必須先完成 Dify 金鑰輪換並設定 secret（見 SECURITY-CHECKLIST 第 0/1 步），否則 AI 診斷會進入 fail-closed 保護狀態

## v9.34《事實修正》— 李太求救時間 深夜→朝早（ZH/EN 對稱）＋正文錯字

依用戶指正：「李太深夜求救」改為「李太朝早求救」。正文時間線本為 老鼠尋晚深夜出現→囝囝用滅鼠器捕捉→李太今朝越洋 WhatsApp 求救→同朝報價，截圖（一）說明文字誤寫「深夜求救」與正文矛盾，現予修正：

### 繁中版 info/blog-17
- 截圖（一）figcaption：李太**深夜求救** → 李太**朝早求救**
- 圖片 alt：李太深夜透過 WhatsApp → 李太朝早透過 WhatsApp
- Hero 段：李太為囝囝深夜越洋求助 → 朝早越洋求助
- 正文引述錯字：事發「**作**夜」→「**昨**夜」
- 保留：meta/og「深夜驚現大老鼠」及正文「事發喺尋晚深夜」——老鼠深夜出現屬實，與求救時間無衝突

### 英文版對稱 en/info/blog-17（Overnight→Morning）
- H1：An Overseas Mum's **Overnight** WhatsApp Rescue → **Morning** WhatsApp Rescue
- H3、hero 段（sought help overnight → first thing in the morning）、meta description、og:description、JSON-LD description、截圖（一）alt＋figcaption 全部對稱修正
- 保留：「rat found at midnight」（老鼠深夜出現屬實）

### EN 中樞卡 en/info
- blog-17 卡片簡介 "WhatsApped us overnight" → "in the morning"

改動檔案：info/blog-17/index.html、en/info/blog-17/index.html、en/info/index.html、CHANGELOG.md 共 4 檔；無新增頁面（sitemap 91 URLs 不變，圖檔名不變）

## v9.33《【師傅出更】E-E-A-T 網站優化》— 南丫島滅老鼠實錄四項修正＋作者專頁上線

依《【師傅出更】E-E-A-T 網站優化.docx》＋《新增「作者欄 ➔ 作者專頁」.docx》兩份方案，對 blog-17 進行四項優化：

### 1️⃣ 修復 WhatsApp 截圖無法顯示（手機＋電腦）
- **根因**：ZH 版 4 張截圖採用中文檔名（屋企-半夜-…求救.jpg 等），GitHub Desktop 上傳鏈路中 Windows 解壓時 UTF-8 中文檔名亂碼 → 線上 404
- **修復**：4 張圖全部改用 ASCII 檔名（night-rat-sighting-emergency-rodent-control-whatsapp-sos.jpg 等，5 個 SEO 檔名意圖保留於新英文組合），HTML 引用＋JSON-LD image 同步更新，原中文檔名檔案移除
- 全站現已零中文檔名圖片（v9.27 已改其餘圖片，本次清零最後 4 張）

### 2️⃣ 刪除「根據 E-E-A-T 原則」字樣
- ZH：句子改為直接以「真正嘅專家唔係一味叫客畀錢」開頭；EN 對稱移除 "that is what E-E-A-T stands for"
- E-E-A-T 訊號保留於結構化數據（BlogPosting author/datePublished）與作者專頁，不再以行話示人

### 3️⃣ 手機只保留 WhatsApp 諮詢
- 移除底部粘性欄「致電」按鈕（ZH/EN），只留 WhatsApp——桌面版粘性欄本就隱藏，無影響

### 4️⃣ 作者欄 ➔ 作者專頁（頂層獨立頁 /about/）
- 新建 /about/（ZH）＋ /en/about/（EN）：撰文團隊資歷、E-E-A-T 三卡（經驗/專業/信任）、核心裝備、服務承諾、CTA；AboutPage JSON-LD
- blog-17 作者欄連結改指 /about/（rel="author"）；JSON-LD author.url 同步指向作者專頁
- 全站 footer 導航新增「關於滅蟲師傅 / About Us」鏈接
- sitemap 89 → 91 URLs



## v9.32《蟲類資訊增設【師傅出更】分類》— E-E-A-T 真實經驗內容系列上線：南丫島村屋滅老鼠實錄（blog-17 雙語）

依《蟲類資訊增設【師傅出更】分類.docx》＋《南丫島村屋驚現大老鼠.docx》＋《5 個「滅老鼠」專用 WhatsApp 截圖 SEO 檔案名.docx》三份方案：

### 1️⃣ 新文章 /info/blog-17/（ZH＋EN 對稱）

- 全新【師傅出更】E-E-A-T 分類首篇：移居美國李太為南丫島村屋囝囝越洋 WhatsApp 求救滅老鼠，師傅誠實診斷「費用可以慳返」，李太仍堅持專業防鼠消毒（三十六計之「釜底抽薪計」）
- 內容依文檔儘量簡化：個案檔案三欄＋越洋求救＋誠實診斷＋情懷擔當＋滅鼠防伏三步＋蜘蛛網 CTA 三按鈕（討論區/AI 診斷/WhatsApp）
- 依《師傅出更》方案植入：✍️ 作者欄（撰文：滅蟲師傅 PEST CONTROL MASTER，連回首頁）、BlogPosting JSON-LD（author/datePublished 2026-10-08/headline/articleSection=師傅出更）、真實個案鐵證截圖
- 4 張真實 WhatsApp 諮詢初錄截圖，SEO 檔案名 5 選 4（捨棄美孚公屋管道名——與南丫島村屋個案不符）：
  - 屋企-半夜-發現老鼠-緊急-滅鼠服務-whatsapp-求救.jpg（半夜求救意圖）
  - iot-智慧鼠盒-捉老鼠-滅鼠公司-推介-whatsapp-對話.jpg（捉老鼠/滅鼠公司推介意圖）
  - 中環-餐廳-廚房-滅老鼠-防鼠網工程-whatsapp-諮詢.jpg（廚房老鼠/防鼠工程諮詢意圖）
  - 南丫島-村屋-滅老鼠-whatsapp-免費報價-真實個案.jpg（村屋報價/南丫島意圖）
- EN 版用英文檔名對稱（lamma-island-village-house-rat-control-whatsapp-quote.jpg 等 4 個），alt text 全部如實描述（filename 攔截意圖＋alt 講真相，雙管齊下）
- 截圖已壓縮 954×2131→780×1742（137-176KB/張），width/height 屬性齊全免 CLS

### 2️⃣ 蟲類資訊中樞增設【師傅出更】分類（ZH＋EN）

- ZH 中樞 blog-grid 首位插入「🚨 師傅出更」分類卡（fa-helmet-safety 圖標）；EN 中樞首位插入「MASTER ON DUTY · NEW」卡
- 順手修復歷史遺留：ZH 中樞 blog-14 卡重複兩張 → 刪除一張

### 3️⃣ 技術配套

- sitemap.xml：+2 URLs（blog-17 ZH/EN，hreflang 對，lastmod 2026-10-08），87→89
- i18n.js：blog 語言切換映射範圍 1-11 → 1-17（修復 blog-12~16 一直跌入 /en/info/ fallback 嘅舊問題）


## v9.31《Title 標籤優化》— 38 區 title 全面補「滅白蟻」，搶佔「上環滅白蟻／西環滅白蟻／西貢滅白蟻」等全港地區搜索首頁前 3

依《Title 標籤優化.docx》三步方案：中西區專頁曾被 Google 排喺第 2 頁，關鍵破綻係 title 只有「上環」無「白蟻」。本輪全線修正，並借力「上環唐樓白蟻」新聞熱搜 intent。

### 1️⃣ Title 標籤「白蟻」全面補位（17 區 ZH＋17 區 EN，共 34 頁）

- 中西區（文檔點名）：`中西區滅蟲公司｜中環、上環、西環滅白蟻、老鼠即日上門｜AI智慧滅蟲 — 滅蟲師傅`（補「滅白蟻」三連字＋用戶點名地標「西環」；原「半山」保留喺內容/FAQ/keywords）
- 各區 title 統一策略：區內熱門地標＋「滅白蟻」三連字精確長尾（如「西貢將軍澳滅白蟻」「沙田第一城滅白蟻」「九龍塘廣播道滅白蟻」「粉嶺上水滅白蟻」）
- 修正前無「白蟻」嘅 8 區：東區、離島、葵青、觀塘、西貢、深水埗、黃大仙、油尖旺 — 全部補位
- 已含白蟻但無連字嘅 5 區調序優化（北區滅老鼠白蟻→滅白蟻老鼠、灣仔滅曱甴白蟻→滅白蟻曱甴等）
- 已達標保留 2 區：南區（赤柱香港仔滅白蟻）、愉景灣（專治村屋獨立屋白蟻）
- EN 對稱：17 區 title 補 Termite＋地標（Sheung Wan & Sai Ying Pun Termite 等）
- 全部 34 頁 og:title 同步更新（無尾綴慣例）

### 2️⃣ 中西區專頁「上環唐樓」熱搜 intent 內容（ZH＋EN 對稱）

- 新增 H2 段落「針對上環唐樓／舊樓：T3i 微波免拆牆滅白蟻方案」（id=tonglau-title）
- 文案對應新聞熱點：上環舊式唐樓木結構極易暗藏過百萬隻白蟻、唔使好似新聞苦主咁徬徨、T3i 隔牆透視免拆牆零破壞、獨家三十六計徹底滅族、即日帶備 T3i 儀器上門、WhatsApp 影相 5 分鐘報價

### 3️⃣ 中樞目錄頁權重傳遞強化（ZH＋EN）

- 中西區卡 hc-pests 下方新增痛點引導句：`🔥 上環唐樓白蟻高危區，即日帶備 T3i 儀器上門`（.hc-hot 橙色小字樣式），令 Google 爬蟲掃描目錄頁時將「上環＋白蟻」語意權重傳遞畀中西區專頁

### 驗證與部署

- v9_31_verify.py 靜態驗證 171/171 PASS（19×2 區 title 精確＋白蟻/Termite 全覆蓋＋og:title 同步＋唐樓段落 ZH/EN＋中樞 hc-hot＋標籤平衡＋v9.27/v9.30 基準零回歸＋sitemap 87 URLs 不變）
- agent-browser 實測：中西區新 title 渲染、唐樓段落 T3i 文案、中樞卡 hc-hot 均正常（390px 手機）
- 部署：GitHub Desktop 三步上傳（純前台，Worker 無需動）；Push 後 Cloudflare IndexNow 自動通知 Bing/Google
- 上線後跟進：GSC Request Indexing /districts/central-and-western/ 等重點區頁；2-4 週觀察「地標+滅白蟻」排名變化

---

# 修復日誌 (v9.30 — 2026-10-07)

## v9.30《Google SEO 版香港滅蟲關注組》— 苦主討論區貼身攔截 FB 關注組搜索流量，突出免註冊／保私隱／即時互動三大優勢

依《打造成「Google SEO 版香港滅蟲關注組」.docx》四步方案，將【2026年港人最厭惡嘅10大害蟲全民投票＋苦主討論區】（/info/vote/）升級為「網頁免登入版香港滅蟲關注組」：當用戶喺 Google 搜尋「香港滅蟲關注組」時，本站同 FB 關注組（4.9 萬成員）一齊出現，並以「免註冊、唔使用真名、保護私隱」三大優勢將用戶轉移到網站討論。

### 1️⃣ SEO 標題與描述「貼身攔截」（Meta Tags 優化）

- ZH title：`香港滅蟲關注組 (網頁免登入版) 暨 苦主討論區 2026 | 滅蟲師傅`（精準命中「香港滅蟲關注組」搜索詞）
- ZH meta description：`全港最活躍的網頁版香港滅蟲關注組及苦主討論區！無需 Facebook 註冊、免登入、真名保密。上載相片即時免費解答床蝨、白蟻、曱甴疑難，系統自動抹除相片 GPS 數據，100% 保障您的家居私隱。`
- og:title／og:description 同步更新；EN 對稱（Hong Kong Pest Control Group (No-Login Web Version) & Pest Victims Forum 2026）
- sitemap vote ZH/EN lastmod → 2026-10-07（促請重新抓取）

### 2️⃣ 首屏文案「直擊 Facebook 痛點」（H1 & Copywriting）

- H1：`香港滅蟲關注組 (網頁免登入版) 暨 苦主討論區 2026`；hero badge 新增「🫥 免 Facebook 登入」
- 引言升級＋三大優勢卡（.group-usps 深色玻璃風格，手機自動單欄）：
  - ✅ 免註冊 / 免登入：唔使用 Facebook 真名，避免親友睇到，隨時化名（如：將軍澳街坊）即時發問
  - ✅ 100% 私隱保護：上傳蟲害照片，系統自動抹除 GPS / EXIF 數據，絕不外洩地址
  - ✅ 專家即時解答：專業滅蟲師傅長駐解答，並設有全港獨家 7x24 AI 害蟲診斷（連結 → /ai/ 蜘蛛網引流）
- 「2026年港人最厭惡嘅10大害蟲全民投票」關鍵詞保留喺引言下方，投票 SEO 不流失

### 3️⃣ 留言板「無障礙互動」體驗強化

- 上傳照片欄新增吸睛提示：**📸 唔知係咩蟲？即刻影相擺上嚟，街坊與師傅為您即時解答！**（ZH/EN 對稱）
- 置頂徽章渲染補全：worker `is_pinned` 置頂留言前排＋前端顯示 📌 置頂／Pinned 徽章（此前 CSS 有但 JS 未渲染）
- 運營提示：管理員可喺後台（/info/vote/admin.html）置頂床蝨／白蟻常見問答，以「滅蟲師傅」官方帳號長文回覆建立權威感

### 4️⃣ DiscussionForumPosting 結構化資料（霸佔 Google SERP）

- /info/vote/ ZH＋EN 各注入 `DiscussionForumPosting` JSON-LD（id="ld-forum-jsonld"）：
  - 主帖 headline／description／image／datePublished／inLanguage／author（Organization）
  - 4 條代表性 Comment（長洲黃太床蝨提問＋滅蟲師傅官方回覆＋Chris Fu 白蟻 T3i 分享＋官方回覆），EN 對稱
  - interactionStatistic：CommentAction 互動數保底 128
- 動態增強：loadComments 成功後 JS 自動以真實留言數更新 userInteractionCount（Google 渲染 JS 後讀取真實活躍度）

### 驗證與部署

- v9_30_verify.py 靜態驗證 80/80 PASS（meta／H1／三大優勢／上傳提示／pinnedBadge／JSON-LD 雙頁合法且恰 1 份／防重複 16 項／v9.28 直出文案＋bannedNotice 零回歸／標籤平衡／sitemap 87 URLs）
- 內聯 JS node --check 全過；agent-browser 實測 ZH/EN 手機 390px：badge 3 個、usp 3 卡單欄、JSON-LD 瀏覽器解析成功、console 零錯誤
- 部署：GitHub Desktop 三步上傳即可（純前台改動，Worker 無需重新部署）；上線後 GSC Request Indexing /info/vote/、/en/info/vote/
- 運營跟進：管理員置頂 1-2 條常見問答（床蝨點處理／白蟻點分）並以官方帳號專業長文回覆

---

# 修復日誌 (v9.29 — 2026-10-07)

## v9.29《蜘蛛網引流策略》— 十八區 SEO 關鍵字全覆蓋＋四大引流通道＋Schema 結構化資料，搶佔「滅白蟻／滅木蝨床蝨／滅書蝨」谷歌搜索

依《「蜘蛛網」引流策略.docx》三大步驟實施：將覆蓋十八區升級為「超級捕風網」，任何地區×任何害蟲搜索均精準命中，入站後由四大互動通道（AI 診斷／WhatsApp 相片報價／苦主討論區／蟲類資訊）即時承接，粘入嚟就出唔去。

### 1️⃣ 擴大捕風網 — 十八區關鍵字全覆蓋（文檔第一步）

- 中樞頁 18 張地區卡「常見」描述統一擴充為六大害蟲全方位格式：白蟻（T3i微波探測）、木蝨／床蝨、老鼠（IoT監控）、蟑螂（曱甴）、蚊滋、書蝨（ZH＋EN 對稱）
- 38 個區頁 meta keywords 補齊缺失核心詞：`X滅白蟻／X滅木蝨／X滅床蝨／X滅書蝨`（EN：termite control / bed bug treatment / book lice removal + 區名），全站 40 頁零缺漏
- 中樞頁 keywords 追加「十八區滅白蟻／滅木蝨／滅床蝨／滅書蝨／全港滅蟲公司」

### 2️⃣ 編織內部引流蜘蛛網 — 四大互動通道 CTA（文檔第二步）

- 40 頁（2 中樞＋38 區頁）新增「唔知由邊度入手？四大通道即刻幫到你」當眼區塊，四色卡片：
  - 🤖 恐慌・唔肯定係咩蟲 → 7x24 AI 害蟲圖像診斷（15秒免費出報告）→ /ai/
  - 💬 心急・想即刻格價 → WhatsApp 上載相片 5 分鐘極速報價（0隱藏收費）→ wa.me 預填短訊
  - 🫂 徬徨・想搵人傾 → 滅蟲師傅苦主討論區（匿名分享・專家解答）→ /info/vote/
  - 📖 DIY・防患未然 →【蟲類資訊】與【有蟲就有計：三十六計】→ /strategy/ ＋ /info/ 深鏈
- 區頁導言嵌入區名＋地標（如「你由東區（北角、鰂魚涌…）入嚟」），40 頁內容互不重複，防 duplicate content
- 全部連結接通語言版本（ZH → ZH 欄目、EN → /en/ 欄目），蜘蛛網內鏈閉環成型

### 3️⃣ 底層 Schema 結構化資料（文檔第三步）

- 中樞 PestControl schema 新增 `hasOfferCatalog`（白蟻／床蝨／老鼠／蟑螂／蚊／書蝨六項服務目錄）＋獨立 `ItemList` schema 列出 19 區專頁
- 38 個區頁 Service schema 各新增 `hasOfferCatalog`（區名前綴六服務），令 Google 明確讀懂每區提供全部核心服務

### 驗證與部署

- v9_29_verify.py 靜態驗證全過（卡片統一／CTA 四鏈接／JSON-LD 全合法／keywords 補齊／sitemap 40 區塊 lastmod→2026-10-07／標籤平衡）
- 無新頁面（87 URLs 不變）；上線後建議 GSC Request Indexing /districts/ 與各區頁

---

## v9.28《苦主討論區「直出」發佈＋IP 防護升級》— 取消人工審核即時公開，Worker v5.0 三重防線攔截垃圾廣告與機器人

依《更新優化苦主討論區和管理員後臺相關功能》文檔思路實施：用戶只需填寫暱稱和留言直接發佈，同一 IP 每日限 3 次（每次時隔 1 小時），管理員後台可刪除並封鎖垃圾 IP，確保真實苦主暢通無阻分享信息。

### 1️⃣ 留言「直出」— 取消人工審核（comment-handler.js v4.1 → v5.0）

- 新留言／回覆通過數學驗證＋防護檢查後 `approved: 1` 即時公開，心急如焚嘅苦主即刻得到關注
- 防護防線全數繼承：數學驗證（伺服器覆核）、Honeypot 靜默丟棄機器人、XSS 清洗、回覆 URL 遮蔽、圖片格式/體積校驗
- 舊待審留言兼容：admin【批准】照常可用；公開列表繼續過濾未批准留言

### 2️⃣ IP 發言配額 — 同一 IP 每小時 1 則 ＋ 每日 3 則

- 1 小時冷卻：KV key `cool:{ip}`（TTL 3600s），發言過於頻繁即攔截並提示倒數分鐘
- 每日 3 則上限：KV key `dcount:{ip}:{YYYYMMDD}`（香港時區日重置，TTL 86400s）
- 精細計費：只喺留言成功寫入後先記錄配額——驗證失敗／captcha 錯誤唔會消耗配額；管理員密鑰發言完全豁免
- 攔截回應雙語（error + error_en）：COOLDOWN_ACTIVE／DAILY_LIMIT_REACHED 兩種錯誤碼

### 3️⃣ IP 封鎖名單 — 一鍵「刪除並封鎖」＋後台管理

- 新端點：`POST /api/admin/banip`（傳 id＝刪除留言連回覆＋封鎖其 IP；傳 ip＝手動封鎖，可附 note 備註）、`/api/admin/unbanip`（解除）、`/api/admin/banlist`（名單）
- 黑名單存 KV `ipblacklist`（無 TTL，永久生效直至解除）；IPv4（含 0-255 數值校驗）／IPv6 白名單式驗證，`admin`／環回位址不可封鎖
- 被封鎖 IP：POST → 403 IP_BANNED（連驗證都唔使做）；GET `/api/comments` 回應帶 `viewer_banned: true` → 前台自動隱藏留言表單並顯示紅色「存取受限」提示
- admin.html 升級：每條留言新增【🚫 刪除並封鎖 IP】深紅按鈕（官方回覆不顯示）＋【IP 封鎖名單】管理 Modal（列表／手動封鎖／一鍵解除，工具欄實時計數，Esc 關閉）
- 可選加碼：如需 Cloudflare WAF 層面全站封鎖，可喺 Dashboard 將同一批 IP 加入 WAF IP Access Rules（Worker 名單已足夠保護留言系統）

### 4️⃣ 順手修復＋體驗優化

- 🔧 Worker admin 系列端點雙重 KV 讀取 bug 修復（list/approve/delete/reply/pin 全部改讀一次入變數，減 KV 讀取量）
- 📱 討論區手機絲滑：嵌套 padding 鏈瘦身（390px 視口留言輸入區 222→290px +31%，表單 264→312px），輸入框 16px 防 iOS 自動縮放；ZH/EN 對稱
- 🌐 Worker CORS 白名單補 localhost:8808（本地測試埠，無生產影響）

### 📋 部署提示（重要！兩步缺一不可）

1. **前端**：照常 GitHub Desktop 上傳（本 zip）
2. **後端**：Worker 必須重新部署先生效——Cloudflare Dashboard → Workers & Pages → comment-handler → 編輯代碼 → 貼上 `worker/comment-handler.js` 全文 → Deploy；或 `npx wrangler deploy`
3. 驗證：開投票頁發一則留言應即時顯示「審核中」字樣消失；admin 後台點【IP 封鎖名單】應正常列出

## v9.27《圖片 404 修復＋手機絲滑＋弱網優化》— 檔名 ASCII/WebP 化根治 GitHub Pages 404，24 頁手機閱讀欄寬 226→324px

### 1️⃣ 圖片 404 根因修復（用戶截圖 DevTools 鐵證：中文檔名 percent-encoded URL 全 404）

- **根因**：GitHub Pages（Jekyll build）對非 ASCII 檔名不兼容；真實瀏覽器實證 ASCII 檔名 webp 於線上正常載入（blog13 圖 1200×900 ✓）
- **修復**：三圖轉 WebP＋ASCII 語義檔名（站內 blog13/14 慣例），並同步更新 blog-16 ZH+EN 六個 img 標籤的 src 與 width/height：
  - 沙頭角-禁區紙-滅白蟻公司-白蟻防治.jpeg → **sha-tau-kok-closed-area-termite-control.webp**（1280×719）
  - termite-inspection-hk-白蟻檢查預防.jpeg → **termite-inspection-hk-prevention.webp**（800×1422）
  - pest-control-termites-hk-根除白蟻.jpeg → **pest-control-termites-hk-eradicate.webp**（1280×720）
- **SEO 不損**：關鍵詞 alt/figcaption 逐字保留（沙頭角禁區/滅白蟻公司/白蟻防治…）；ASCII 檔名同時利於英語區 Google 圖片搜索

### 2️⃣ 禁區弱網優化（總體積 438KB→202KB，-54%）

- WebP q76＋LANCZOS 重採樣（1280px 對齊站內慣例）：59.8KB／81.3KB／61.2KB；lazy loading＋decoding=async＋width/height 防 CLS 保持
- 三圖品質目測覆核：木紋理、泥路細節、紅圈標註清晰

### 3️⃣ 手機絲滑：24 頁閱讀欄寬 226→324px（+43%）

- 根因：blog 模板四層嵌套包裝（container→article-card→container→article-card）每層 ~20px padding＋雙邊框，390px 視口被蠶食至 226px
- 修復：@media(max-width:768px) 折疊中間兩層（padding/border/shield 歸零）＋外層卡 12px——滲透 **24 頁**（blog-2~8、12~16 ZH+EN；blog-1/9/10/11 舊模板無嵌套不受影響）
- 桌面 ≥769px 零改動（media query 隔離）

### 4️⃣ 驗證

- v9_27_verify.py：511 項 ALL PASS——全站 91 頁零中文檔名殘留／3 webp 存在＋尺寸正確＋<120KB／img 標籤逐字精確／嵌套=標記=24 頁一致／marker 位於首 style 塊內／JSON-LD 合法／sitemap 87 不變／全站標籤平衡
- agent-browser 實測：ZH/EN 三圖 naturalWidth 全載入（1280/800/1280）；手機 390 blog-16/15/2 content 一致 324px；桌面 fig2 460px 居中、content 692px 不變；console 零錯誤
- 線上實證：bruceleehk.com ASCII webp 真實瀏覽器載入成功

### 📋 觀察（非本輪範圍）

- 截圖 console 顯示 CSP 阻擋 cloudflareinsights beacon（static.cloudflareinsights.com 不在 script-src 白名單）——站內分析腳本被自家 CSP 攔截，屬既有設定問題，建議下輪檢視 _headers/meta CSP

---

# 修復日誌 (v9.26 — 2026-10-05)

## v9.26《blog-16 禁區實拍圖 ×3 植入》— 沙頭角禁區村屋真實個案照片進駐文章內文（文件名原封不變），圖片 SEO 與 E-E-A-T 雙強化

### 1️⃣ 三張實拍圖分區植入（ZH/EN 雙語對稱，文件名保持不變）

- **導言段後 → /assets/img/沙頭角-禁區紙-滅白蟻公司-白蟻防治.jpeg**（1600×899）：屋頂木樑間「大蟻竇」紅圈實拍——禁區白蟻氾濫鐵證，開篇即建立真實個案信任
- **T3i 微波探測段後 → /assets/img/termite-inspection-hk-白蟻檢查預防.jpeg**（900×1600 直圖）：瓦頂樑木泥路實拍；新增 `.blog16-fig--tall`（max-width 460px 居中）直圖變體，避免直圖霸佔全欄
- **結語段後 → /assets/img/pest-control-termites-hk-根除白蟻.jpeg**（1600×900）：門框泥路警號實拍，呼應「誘餌連根拔起、真正根除白蟻」收結導流至 CTA
- alt 文案雙語 SEO 佈局：ZH（沙頭角禁區村屋白蟻實拍／禁區紙滅白蟻公司／白蟻檢查與預防／根除白蟻）＋EN（Sha Tau Kok closed area / termite inspection and prevention / eradicate termites）；figcaption 導流文案呼應禁區紙手續與 T3i 免拆牆賣點；全部 loading="lazy" decoding="async"，width/height 與實際尺寸逐像素一致（防 CLS）

### 2️⃣ 實拍照片 E-E-A-T 價值

- Xiaomi 17 Pro Max｜LEICA 水印＋拍攝日期＋GPS 座標（22°32'42"N 114°13'3x"E，沙頭角禁區範圍）——真實邊境個案第一手證據，Google 圖片搜索（白蟻實拍類查詢）與 E-E-A-T 經驗信號同步提升

### 3️⃣ 驗證

- git 範圍確認：僅 blog-16 ZH/EN 各 +13 行＋assets/img 新增 3 檔，其他 89 頁零改動
- v9_26_verify.py：141 項 ALL PASS——src 與磁盤文件名逐字一致／MD5 與上傳原件一致／width-height 與 PIL 實測尺寸一致／alt 關鍵詞命中／落點順序（導言<fig1<🌲、T3i段<fig2<🛡️、結語<fig3<CTA）/JSON-LD 全合法／hreflang-canonical-og 基準不變／sitemap 87 URLs 不變／全站 91 HTML 標籤平衡
- agent-browser 實測（本地 HTTP 伺服器）：ZH/EN 三圖 naturalWidth 全部載入、桌面直圖 460px 居中渲染、手機 390×844 自適應、console 零錯誤

### 📋 發現（本輪不動，建議下輪處理）

- blog-13/14/15/16 ZH+EN 共 8 頁沿用 blog-13 期模板存在四層嵌套容器（article.blog-article-card > .container > .blog-article-card > .blog-article-content），手機 390px 視口下內文欄寬僅 226px；blog-15 未改動基準實測同值，屬既有模板債務，非本輪回歸。建議下輪「手機欄寬修復」一次處理 8 頁

---

# 修復日誌 (v9.25 — 2026-10-05)

## v9.25《【禁區紙滅蟲】沙頭角和中英街滅蟲》新文章上線 — 蟲類資訊欄目雙語新頁（blog-16 ZH＋EN），與覆蓋十八區欄目呼應，搶佔邊境禁區白蟻搜索流量，樹立滅蟲公司首選品牌

### 1️⃣ 新頁面上線（+2 頁面：/info/blog-16/ 與 /en/info/blog-16/）

- **ZH 版**：title《【禁區紙滅蟲】沙頭角、中英街、打鼓嶺、落馬洲邊境村屋白蟻氾濫？專辦禁區滅白蟻，T3i 微波免拆牆揪出萬年暗巢！》——三大高危因素（大自然與濕地包圍／底層潮濕地氣／隱蔽破壞力）＋T3i 三大優勢（隔空透視／零破壞／連根拔起）＋首選品牌三大專屬優勢（專辦禁區紙／持牌不外判／0 隱藏收費）＋AI 自救指南
- **EN 版**：按英語區搜索習慣全面改寫《Sha Tau Kok Pest Control | Closed Area Termite Experts》(54ch)——desc 187ch 前置核心詞，正文佈局長尾詞：closed area pest control hong kong、frontier closed area termite control、village house termite treatment hong kong、sha tau kok termite treatment、chung ying street pest control、termite detection without demolition、ta kwu ling／lok ma chau／lo wu／heung yuen wai 等
- **首選品牌定位**：正文＋結語兩處強調「全港禁區業主嘅滅蟲公司首選品牌」／"the first-choice pest control brand for Hong Kong's border communities"

### 2️⃣ 與【覆蓋十八區】欄目雙向呼應（內鏈閉環）

- blog-16 正文「專辦禁區紙，邊境全覆蓋」段：北區六地（沙頭角、中英街、打鼓嶺、羅湖、香園圍）鏈至<a href="/districts/north/">北區專頁</a>，落馬洲鏈至<a href="/districts/yuen-long/">元朗區專頁</a>（ZH/EN 各自語言路徑）
- 反向導流：北區＋元朗區專頁（ZH/EN 共 4 頁）「延伸閱讀」區新增 blog-16 深鏈，禁區業主瀏覽區頁即達專文
- FAQ Q1 答案同時內鏈 /districts/（十八區總覽）＋北區專頁；導流閉環：blog-16 ⇄ north/yuen-long 區頁 ⇄ districts 總覽

### 3️⃣ SEO 結構化數據（雙語各 3 段 JSON-LD）＋5 條 FAQ

- BreadcrumbList（首頁→蟲類資訊→本文）＋ Article（url/mainEntityOfPage 同語言指向、datePublished/dateModified=2026-10-05、inLanguage、keywords 長尾詞）＋ FAQPage（5 問 5 答）；HTML `<details>` 與 JSON-LD 文本逐字同步
- **FAQ**：原文 3 條（服務範圍涵蓋禁區？／花園白蟻蔓延入屋？／藥劑對放養寵物安全？）＋新增 2 條 PAA（冇禁區紙點安排檢查？／禁區收費會否特別貴？——對應禁區紙手續與明碼實價高搜索意圖）
- keywords 佈局：ZH 22 詞（禁區滅蟲/禁區紙滅蟲/沙頭角滅蟲/中英街滅蟲/打鼓嶺滅蟲/落馬洲滅蟲/羅湖滅蟲/香園圍滅蟲/邊境村屋滅蟲/村屋白蟻/免拆牆滅白蟻/滅蟲公司首選等）；EN 15 詞

### 4️⃣ 欄目與收錄

- info/index.html（ZH）＋ en/info/index.html（EN）blog-grid 首位插入 blog-16 卡片（ZH：禁區專辦 fa-id-card；EN：FRONTIER CLOSED AREA · NEW）
- sitemap.xml 新增 blog-16 ZH＋EN 區塊（hreflang 三語互鏈、lastmod=2026-10-05、priority 0.9），85→87 URLs

### 5️⃣ 驗證

- v9_25_verify.py：121 項 ALL PASS——雙頁 title/desc/keywords/hreflang/canonical/JSON-LD×3/FAQ 5對5/內鏈 6 條/WA 預填連結/零模板殘留、列表頁卡序 16>15>14、sitemap 87 URLs XML 合法、四區頁 echo 恰 1 條、ZH/EN blog-15 基準不變、全站 91 個 HTML 標籤平衡＋JSON-LD 全部可解析
- agent-browser 實測：ZH/EN blog-16 title 渲染、FAQ 5 可展開、JSON-LD 3 段、北區 echo 連結、列表頁 17 張卡首位為 blog-16、console 零錯誤、截圖正常

---

# 修復日誌 (v9.24 — 2026-10-05)

## v9.24《EN 蟲類資訊 Blog-11~15 同步確認＋英文搜索習慣 SEO 深度強化》— title/og/headline 壓縮至 ≤65ch 核心詞前置、og:description 同步、blog-11 內鏈補網、sitemap lastmod 更新

### 1️⃣ 線上狀態確認（用戶反映「英文版只有 blog-1 至 blog-10」）

- 實測 bruceleehk.com：/en/info/blog-11~15/ 六個 URL 全部 HTTP 200；/en/info/ 列表頁 15 張卡片齊全（blog-1~15）；sitemap 16 條 EN blog-11~15 記錄在案；線上與本地逐字節一致
- 判斷：頁面早已上線（v9.19~v9.23 已交付），用戶所見為 Google 索引滯後或瀏覽器快取；本輪在此基礎上再做英文 SEO 深度強化並重新打包

### 2️⃣ 五頁 EN title 壓縮（Google SERP 只顯示約 60ch，舊 title 89~142ch 會被截斷）

- blog-11：142ch →《What Does the Bible Say About Insects? Bugs or Humans First?》(60ch)——對準英語區高流量 PAA 問句長尾詞
- blog-12：110ch →《Hong Kong Pest Control Prices 2026: Costs & How to Choose》(57ch)
- blog-13：99ch →《Termite Recurrence? Termatrac T3i Microwave Detection》(53ch)
- blog-14：101ch →《Mid-Levels Termite Inspection: Find Nests Without Demolition》(60ch)
- blog-15：89ch →《Rejected by Church Over Bed Bugs? Bible Truth & Pest Help》(58ch)
- 同步鏈：og:title 與 Article JSON-LD headline 逐字同步（社群分享卡片＋富媒體結果一致）

### 3️⃣ og:description 同步＋schema 日期刷新

- 五頁 og:description（192~288ch 舊長文）統一同步為 meta description（120~185ch），WhatsApp/Facebook 分享摘要不再截斷失焦
- 五頁 Article dateModified → 2026-10-05；sitemap EN blog-11~15 lastmod → 2026-10-05（ZH 區塊逐字不動）

### 4️⃣ blog-11 EN 內鏈補網

- 正文導言段新增 2 條關鍵字錨文本內鏈：termites gnawing at wooden crosses → /en/info/blog-13/（白蟻復發 T3i）、bed bugs hiding in the crevices of wooden chairs → /en/info/blog-15/（木蝨被拒返教會姊妹篇）
- blog-11（屬靈反思）⇄ blog-15（木蝨反思）雙向互鏈閉環完成；hero 區段落不動

### 5️⃣ 驗證

- v9_24_verify.py：80 項 ALL PASS——五頁 title ≤65ch/og/headline 三同步、desc 120-185ch、JSON-LD 全合法、FAQ HTML==JSON、hreflang 三語、blog-11 內鏈恰 1 條×2、ZH blog-11~15 title 與 sitemap lastmod 基準不變、sitemap 85 URLs XML 合法、全站 89 個 HTML 標籤平衡＋JSON-LD 全部可解析
- agent-browser 實測：blog-11~15 title 正確渲染、blog-11 內鏈 1+1 條、FAQ 7 可展開、console 零錯誤、blog-14 手機 390×844 截圖正常

---

# 修復日誌 (v9.23 — 2026-10-05)

## v9.23《【屬靈反思】因屋企有木蝨被拒返教會？》新文章上線 — 滅蟲資訊欄目雙語新頁（blog-15 ZH＋EN），引導屬靈反思 blog-11＋苦主討論區，谷歌 SEO 關鍵詞＋長尾詞佈局

### 1️⃣ 新頁面上線（+2 頁面：/info/blog-15/ 與 /en/info/blog-15/）

- **ZH 版**：title《【屬靈反思】因屋企有木蝨被拒返教會？床蝨危機中的聖經真理與滅蟲出路》；三大反思（不潔淨階級／愛裡沒有懼怕／治理這地）＋實用指南（苦主討論區／AI 診斷／WhatsApp）＋結語
- **EN 版**：按英文用戶搜索習慣全面改寫《Rejected by Church Over Bed Bugs? Bible Truth & Practical Pest Help》——desc 156ch 前置 bed bugs/church 核心詞，正文佈局長尾詞：bed bugs in church pews、what does the Bible say about killing insects、perfect love casts out fear、can I go to church with bed bugs、Christian pest control Hong Kong、bed bug treatment Hong Kong、licensed exterminator 等
- **導流三路**（用戶核心要求）：正文＋FAQ＋延伸閱讀多處內鏈至【屬靈反思】《先有蟲定先有人？》(blog-11) 與【苦主討論區】(/info/vote/)，另接 AI 診斷 (/ai/) 與 WhatsApp 諮詢（ZH/EN 各自預填訊息）

### 2️⃣ SEO 結構化數據（雙語各 3 段 JSON-LD）

- BreadcrumbList（首頁→蟲類資訊→本文）＋ Article（url/mainEntityOfPage 同語言指向、datePublished/dateModified=2026-10-05、inLanguage、keywords 長尾詞、og-cover.jpg）＋ FAQPage（6 問 6 答）
- **6 條 FAQ**：原文 4 條（教會長椅藏蝨／教會支援／聖經點睇滅蟲／羞愧不敢返教會）＋新增 2 條 PAA（徹底處理後幾時可返教會／教會幾耐做一次防蟲檢查）；HTML `<details>` 與 JSON-LD 文本逐字同步

### 3️⃣ 欄目與收錄

- info/index.html（ZH）＋ en/info/index.html（EN）blog-grid 首位插入 blog-15 卡片（ZH：屬靈反思分類 fa-church；EN：SPIRITUAL REFLECTION · NEW）
- sitemap.xml 新增 blog-15 ZH＋EN 區塊（hreflang 三語互鏈、lastmod=2026-10-05、priority 0.9），83→85 URLs

### 驗證

- v9_23_verify.py 149 項 ALL PASS（雙語 head/hreflang/H1/H2、32 條正文關鍵詞、內鏈數量、FAQ HTML==JSON 逐字同步、JSON-LD 3 段解析、標籤平衡 26 項、sitemap XML 合法 85 URLs、blog-14/列表頁基準不變、171 files）
- agent-browser 實測：ZH/EN 新頁 title、FAQ 6 條可展開、3 段 JSON-LD 瀏覽器解析成功、內鏈 [blog-11, vote, ai] 全命中、console 零錯誤、截圖目視正常；列表頁卡片渲染正常
- 檔案數 169 → 171（+2 新頁面）


## v9.22《英文版網頁 SEO 優化》依《英文版網頁SEO優化.docx》四階段落地 — Google＋Bing 英文搜索衝前 3（僅動 EN 版，ZH/其他不變）

### 1️⃣ 第一階段：Bing On-Page 基礎修正（en/index.html）

- **title 111ch → 52ch**（方案原文）：`Pest Control Hong Kong | AI Termite & Bed Bug Expert`（解決 Bing Title 過長報錯，主攻最高搜索量核心詞）
- **meta description 306ch → 157ch**（方案原文）：Top English-speaking pest control in Hong Kong + AI & Termatrac T3i + Same-day service + CTA（解決 Bing Description 過長報錯，大幅提升 SERP CTR）
- og:title / og:description 同步新 title/desc（社媒分享一致性）

### 2️⃣ 第二階段：高轉化英文長尾關鍵詞自然佈局（13 處正文微編輯）

- **首頁 7 處**：hero 副題 English-speaking pest control experts；服務區副題 English speaking pest control team in Hong Kong；T3i 卡 non-destructive termite detection；IPM 段 eco-friendly pest control + pet-safe；18 區段 pest control services Hong Kong（精確短語）
- **服務頁 5 處**：導言 English-speaking pest control company + pest control services Hong Kong families/expat businesses trust；白蟻段 termite inspection in HK + non-destructive termite detection；床蝨段 bed bug heat treatment Hong Kong；蚊鼠段 rodent control services；IPM 段 eco-friendly + pet-safe
- **AI 頁 1 處**：hero 段 termite inspection questions（AI 工具承接白蟻檢查搜索流）
- 兩頁 meta keywords 擴充 8 條方案長尾詞

### 3️⃣ 第三階段：H1 重組＋圖片 Alt 英文本土化

- EN 首頁 H1：`Hong Kong's Trusted Pest Control Company | ...` → 方案原文 `Hong Kong Pest Control Services: The First AI Smart Pest Management & 36 Stratagems`（前置地區服務字眼）
- Alt 升級 4 張：IoT 老鼠監測（rodent control services）、熱成像（non-destructive termite detection）、床蝨蒸氣案例（bed bug heat treatment Hong Kong）、AI 分析照片（termite inspection support）

### 4️⃣ 第四階段：收錄與本地權威（站外部分為用戶操作）

- sitemap lastmod：/en/、/en/services/、/en/ai/ → 2026-09-20（sitemap 已含全部 /en/ 網址，符合 GSC 提交要求）
- 站外清單（方案指引用戶執行）：Bing IndexNow（Cloudflare Crawler Hints 已啟動，push 後自動抓取）；GSC 對 https://bruceleehk.com/en/ Request Indexing；GBP 加全英文簡介 "English Speaking Staff Available"＋引導外籍客戶（愉景灣/半山）留英文五星評論
- robots.txt 已確認含 Sitemap 宣告，無需修改

### 驗證

- v9_22_verify.py 74 項 ALL PASS（方案 title/desc/H1 精確比對、10 關鍵詞佈局、keywords 8 詞×2 頁、alt 4 張、ZH 首頁/服務頁 title 不變、防偽體系不變、JSON-LD 合法、標籤平衡、sitemap lastmod）
- agent-browser 實測：EN 首頁 title/H1/desc/keywords 全命中、console 零錯誤；服務頁 4 關鍵詞全在、console 零錯誤；截圖目視正常
- 無新頁面（87 頁/169 files 不變）；URL 結構維持現有語義化路徑（/en/services/#termite 等），符合方案第三階段 3 的要求



## v9.21《EN 蟲類資訊 Blog-10~14 英文搜索習慣 SEO 深度優化》英文用戶精准直達＋結構化數據補全＋PAA 問句 FAQ 擴充

### 1️⃣ Meta Description 全面重寫（5 頁，front-load 核心查詢詞）

- 原_desc_超長（blog-10=437ch / blog-11=461ch / blog-12=262ch / blog-13=284ch / blog-14=300ch），Google 只顯示約 155 字符，核心詞被截斷
- 全部重寫至 161~169 chars，**核心英文查詢詞前置**：blog-10「Pest control in Hong Kong」、blog-11「What does the Bible say about insects and pests?」、blog-12「How much does pest control cost in Hong Kong in 2026?」、blog-13「Termites came back after treatment?」、blog-14「Termites in your Mid-Levels home?」

### 2️⃣ Article Schema 補全＋bug 修復（5 頁）

- blog-10/11：補 keywords/url/inLanguage/wordCount；**blog-11 mainEntityOfPage 誤指 ZH URL（/info/blog-11/）→ 修正為 /en/info/blog-11/**
- blog-12：補 inLanguage/wordCount；blog-13/14：keywords 刷新加入高流量詞（termites came back after treatment / termite inspection Mid-Levels）
- 5 頁 dateModified → 2026-09-20（連動 sitemap lastmod）；全部補 wordCount（2110~3360）

### 3️⃣ Meta Keywords 擴充（5 頁，英文搜索習慣長尾詞）

- blog-10：pest control hong kong / exterminator hong kong / english speaking pest control hong kong / overseas property management 等
- blog-11：insects in the bible / what does the bible say about insects / plagues of egypt / noah / bible verses about pests
- blog-12：how much does pest control cost hong kong / pest control price list 2026 / exterminator cost hong kong / bed bug extermination cost
- blog-13：termites came back after treatment / termite inspection hong kong / how to find termite nest in wall / termite company near me
- blog-14：mid levels termite inspection / old building termite hong kong / termite in wall cavity / heritage home pest control

### 4️⃣ 正文自然植入英文搜索習慣關鍵詞（13 處精準微編輯，冪等 exact-string assert）

- blog-10（4 處）：pest control company in Hong Kong＋overseas landlord/property manager（導言）＋licensed exterminator（業主場景）
- blog-11（3 處）：Insects in the Bible（開篇首句）＋Noah's ark（創造論述）＋plagues of Egypt（出埃及記十災）
- blog-12（4 處）：How much does pest control cost in Hong Kong?（價格總覽段首）＋Termite treatment cost（速查表白蟻條）＋Bed bug treatment cost（床蝨條）＋blog-13 內鏈（FAQ 白蟻昂貴答案）
- blog-13（3 處）：signs of termites（導言）＋termites came back after treatment（三大缺陷引言）＋termite inspection in Hong Kong（T3i 段）
- blog-14（3 處）：heritage buildings（半山定位）＋termite control company trusted across Hong Kong（導言）＋wall cavities（T3i 雷達 bullet）

### 5️⃣ PAA 式 FAQ 擴充（每頁 +2，HTML details＋FAQPage JSON-LD 雙同步，共 10 條）

- 對準 Google People Also Ask 問句搜索習慣：blog-10（海外可處理蟲種/英語服務）、blog-11（聖經如何說昆蟲/蟲患是否審判）、blog-12（兒童寵物安全/服務頻率）、blog-13（白蟻檢查費用/免鑽牆探測原理）、blog-14（舊樓免拆偵測/豪宅工期）
- FAQ 總量：blog-10/11 5→7、blog-12 8→10、blog-13/14 4→6；ZH 版不動（保持源文基準）

### 6️⃣ 驗證與交付

- v9_21_verify.py 189 項 ALL PASS（JSON-LD 合法性、FAQ 雙同步、desc 長度、body 關鍵詞、hreflang、標籤平衡、ZH 不變、sitemap lastmod）
- agent-browser 實測 blog-10/11/12/13/14 EN：title/desc/FAQ 展開/console 零錯誤；blog-14 hero 截圖正常
- sitemap.xml：5 頁 EN lastmod → 2026-09-20（ZH 不變）



## v9.20《十八區獨立專頁全部沖前3名》十八區專頁在地化 Bullet 強化＋PestControl Schema 遍地開花＋內部連結蜘蛛網

### 1️⃣ 十八區專頁「常見蟲患跡象＋高風險位置」AI 友好 Bullet 區塊（策略1：Local SEO Silo，36 頁）

- **ZH 18 頁＋EN 18 頁**，每頁新增獨立區塊（插入「在地痛點」區之後）：H2「{區名}蟲患常見跡象 — 出現以下情況請即處理」＋4 條常見跡象 bullets＋H3「{區名}高風險位置檢查清單」＋4 條高風險位置 bullets＋📖 延伸閱讀連結
- **全區在地化**（絕非 18 區同一篇文）：中西區＝半山無縫實木地板發黑＋古董木櫃泥路；愉景灣＝臨海潮濕木地台＋花園木棧道；九龍城＝廣播道依山潮氣復發；沙田＝第一城窗台泥路＋城門河蚊；元朗＝村屋木地台＋農地老鼠；油尖旺＝賓館床蝨＋餐廳隔油器德國曱甴；其餘各區按公屋/工廈/臨海/近山特性逐一撰寫
- 點列式結構迎合 **Google AI Overviews 抓取胃口**（愉景灣 AI 概覽成功經驗複製到 18 區）
- 延伸閱讀映射：白蟻重點 11 區→blog-13（白蟻復發點算）；中西區/九龍城→blog-13/14；灣仔/油尖旺/深水埗→blog-5（床蝨攻略）；東區/黃大仙/觀塘/葵青→blog-12（收費指南）

### 2️⃣ PestControl Schema 遍地開花（策略4：LocalBusiness 宣告，36 頁）

- 每區專頁 head 新增完整 **PestControl JSON-LD**（LocalBusiness 子類）：@id=reuse `https://bruceleehk.com/#pestcontrol`（與首頁實體合併，NAP 一致）＋name/alternateName/slogan「全港僅此一家 · 唯一正宗官方網站」＋telephone＋PostalAddress＋**areaServed 雙語區名**（如「沙田區」+「Sha Tin」；中西區另加「半山 Mid-Levels」）＋sameAs（IG/X/WhatsApp 頻道權威訊號）
- 全站 JSON-LD 總量 226→262 段

### 3️⃣ 內部連結蜘蛛網（策略2：Internal Linking，14 個 blog 頁）

- **blog-1/3/4/5/6/7/8 ZH+EN**（14 頁）正文自然段落後新增關鍵字錨文本連結（`data-v920` 標記）：
  - blog-3 →「愉景灣白蟻防治方案」＋「九龍城白蟻救援實錄」（ZH/EN）
  - blog-4 →「中西區（半山）滅蟲攻略」＋「沙田區滅蟲攻略」（ZH/EN）
  - blog-5 →「油尖旺」＋「深水埗」（床蝨高頻區，ZH/EN）
  - blog-6 →「愉景灣白蟻防治」；blog-1/7/8 →「全港十八區」hub（ZH/EN）
- 錨文本全部使用關鍵字（絕不用「按此了解更多」），雙向連結區頁↔文章灌注 Link Juice

### 4️⃣ 策略3（GBP 服務區域＋地區評論）為站外操作

- 依 v9.17 marketing kit 好評引導卡執行：GBP 後台「服務區域」加入全港 18 區名稱；引導客人好評時加入地區字眼（例：「多謝滅蟲師傅即日嚟到愉景灣幫我用儀器搵出白蟻巢」）

### 驗證

- scripts/v9_20_verify.py：**675 項 ALL PASS**——36 區頁 Bullet 區塊（8 條 bullets×36）＋PestControl schema（@id/slogan/sameAs/areaServed≥2×36）＋262 段 JSON-LD 全部合法＋標籤平衡＋14 blog 內鏈恰 1 條＋錨文本齊全＋內鏈目標頁存在＋全站 87 頁＋sitemap 83＋在地化內容抽查 7 頁
- 冪等驗證：patch 腳本重跑 OK:0 SKIP:86 ERR:0（零重複保證）

### 上線後置（GSC＋GBP）

- GSC Request Indexing：18 區 ZH/EN 專頁（特別是 /districts/central-and-western/、/districts/discovery-bay/、/districts/sha-tin/）
- GBP「服務區域」加 18 區；用 v9.17 好評引導卡收集地區標記五星好評（無痕模式第 11 位→前 3 名關鍵一步）

---

# 修復日誌 (v9.19 — 2026-09-20)

## v9.19《主攻半山》半山豪宅白蟻旗艦文雙語上架＋中西區專頁半山主攻升級＋Termatrac T3i 微波探測限時八折優惠

### 1️⃣ 新文章 blog-14 雙語上架（用戶上傳《主攻半山.docx》方案落地，發佈板塊【有蟲就有計】）

- **ZH**：`/info/blog-14/`——Title【半山豪宅蟲患】白蟻係食木「罪魁禍首」定隱形「建築大師」？免拆牆揪出萬年暗巢（docx 指定原文）；Meta Description／keywords 全配半山＋中西區＋白蟻＋滅蟲公司關鍵詞
- **EN**：`/en/info/blog-14/`——"Mid-Levels Luxury Home Termite Crisis: Wood-Eating Villain or Hidden Master Architect? Uncover the Age-Old Nest Without Demolition"
- **正文六大章節**（docx 全文落地＋SEO 增強）：😱 雙面真兇（食木罪魁禍首 vs 隱形建築大師）／🛑 傳統滅蟲痛點（亂噴殺蟲水＋破壞性探測）／📡 Termatrac T3i 微波探測 3 大優勢（docx 原文）／🛡️ 即日上門 CTA 專區（docx 三連結：中西區專頁／免費 AI 診斷／WhatsApp 5 分鐘報價）／半山 FAQ×4／終極答案總結
- **YouTube 實戰短片嵌入**（docx 指定）：半山豪宅驚現「藝術級」白蟻巢穴（7AlmZP8FoN4，2026-09-20 剛上架）——Facade 模式（點擊先載 iframe，youtube-nocookie），CSP frame-src 加白名單；海報 blog14-video-poster.webp 80KB（YT maxres 1280×720 轉製）
- **限時八折優惠橫幅**：琥珀虛線框（沿用 v9.15 愉景灣 promo 設計），「半山白蟻微波探測 限時八折優惠進行中…全單八折」，CTA 直達 WhatsApp 預填優惠訊息
- **結構化資料 4 段**：BreadcrumbList＋Article（datePublished 2026-09-20）＋**VideoObject**（name/description/thumbnailUrl/uploadDate=2026-09-20T18:29:48+08:00 照 YouTube 實際 publishDate 換算／embedUrl——Google 影片 Rich Result 資格）＋FAQPage 4 條（schema↔可見 1:1）
- og:image＝blog14-og.jpg（1200×630 由 YT 縮圖轉製）；延伸閱讀互鏈 blog-13＋blog-12

### 2️⃣ 中西區專頁半山主攻升級（/districts/central-and-western/，ZH+EN 同步）

- Title／og:title／Meta Description／keywords／H1／hero 導言全面植入**半山＋白蟻**關鍵詞（原 focus 只有中環上環曱甴老鼠）
- 蟲患 chips 加 🐜 白蟻；科技解法 tech-list **首位**新增「白蟻 — Termatrac T3i 微波探測免拆牆定位暗巢」＋blog-14 深鏈
- 實戰案例區新增第二張卡：半山豪宅「藝術級」白蟻巢穴實錄（blog14 海報＋連結 /info/blog-14/）
- **限時八折 promo 橫幅**（麵包屑後、Overview 前）呼應 Google 商家優惠
- FAQ 4→5 條（新增「半山豪宅／舊樓懷疑有白蟻，可以唔使拆牆檢查嗎？」，FAQPage schema 同步 5/5）

### 3️⃣ 全站導流（內鏈灌注）

- `/strategy/`【有蟲就有計】最新實戰文章區：blog-14 卡置頂（琥珀色調）＋副題更新「半山豪宅白蟻實錄」；`/en/strategy/` 同步
- `/info/`＋`/en/info/` 蟲類資訊目錄：blog-14 卡**首位**（白蟻防治分類＋2026 最新／NEW）
- `/districts/` hub 中西區卡 pests 加 🐜 白蟻（ZH+EN）

### 4️⃣ sitemap

- 81→83 URLs（blog-14 ZH/EN，lastmod 2026-09-20，hreflang 三語 alternate）

### 驗證

- scripts/v9_19_verify.py：87 頁全站掃描——226 段 JSON-LD 全部合法、標籤平衡零失衡、blog-14 兩版 4 段 JSON-LD＋FAQ 4/4 schema↔可見、中西區 FAQ 5/5、內鏈／資產存在性 13 項、sitemap 83 → ALL PASS
- agent-browser 實測：blog-14 ZH/EN（title／視頻 Facade 點擊載 iframe（CSP 通過）／八折橫幅／FAQ 展開／console 零錯誤）、中西區 ZH/EN（title／promo／tech-list 白蟻首位／2 張案例卡／FAQ 5）、strategy＋info 卡序正確、手機 390×844 視圖渲染正常

### 上線後置（GSC）

- GSC → 網址檢查 → Request Indexing：`/info/blog-14/`、`/en/info/blog-14/`、`/districts/central-and-western/`（title 已更新）
- Rich Results Test 跑 `/info/blog-14/`：應顯示 Article＋Video＋FAQ 三種 Rich Result
- Google 商家檔案優惠活動：優惠名稱建議「白蟻微波探測限時八折」，與網站八折橫幅遙相呼應

---

# 修復日誌 (v9.18 — 2026-09-19)

## v9.18《白蟻復發點算》雙語旗艦文上架＋救援實錄導流＋簡體中文搜索無縫接入

### 1️⃣ 新文章 blog-13 雙語上架（用戶上傳《白蟻復發點算？.docx》全文落地）

- **ZH**：`/info/blog-13/`——Title【滅白蟻推薦】白蟻復發點算？Termatrac T3i 微波探測免拆牆搵出暗巢（docx 指定原文）；Meta Description 照 docx 原文；六大章節：傳統滅白蟻 3 大盲點／T3i 微波探測 3 大優勢／AI 智慧滅蟲方案／廣播道龍翔苑實戰實錄導流專區／FAQ×4／總結 CTA
- **EN**：`/en/info/blog-13/`——"Termite Recurrence? Termatrac T3i Microwave Detection Without Wall Demolition"（廣播道=Lung Kei Court, Broadcast Drive 照 EN kowloon-city 頁命名）
- **4 張 Termatrac T3i 實景照**（用戶上傳，合計 13.5MB 壓縮至 185KB WebP）：blog13-t3i-kowloon-city（T3i 衣櫃掃描）/ blog13-t3i-discovery-bay（愉景灣村屋 App 讀數）/ blog13-door-frame-hole（門框泥路）/ blog13-wardrobe-frame-hole（衣櫃門框大窿）；另出 blog13-og.jpg（1200×630）作 og:image
- **結構化資料**：BreadcrumbList＋Article（datePublished 2026-09-19、image、inLanguage）＋FAQPage 4 條（docx 原文 Q&A，schema↔可見 1:1）
- **URL**：採用 /info/blog-13/ 站內慣例（docx 建議之 slug /termite-detection-termatrac-t3i 不適用於本站 blog 架構）

### 2️⃣ 導流至【白蟻復發救援實錄】（/districts/kowloon-city/）

- blog-13 內建「實戰實錄」琥珀導流專區：個案故事（T3i 2 小時無損定位門框白蟻大窿）＋2 張現場照＋「睇完整【白蟻復發救援實錄】」CTA 按鈕＋WhatsApp 預約 T3i
- kowloon-city ZH/EN 頁案例區加 reciprocal 延伸閱讀連結回 blog-13（雙向內鏈，SEO 互灌權重）

### 3️⃣【有蟲就有計】板塊新增文章入口

- `/strategy/`（ZH）三十六計卡後新增「最新實戰文章」區塊：blog-13＋救援實錄兩張連結卡（CTA Box 前）
- `/en/strategy/`（EN）同步新增 "Latest Field Guides" 區塊
- `/info/`＋`/en/info/` 目錄 blog-grid 首位插入 blog-13 卡（白蟻防治分類＋NEW 標記）

### 4️⃣ 簡體中文搜索優化（保持繁體＋英文版不變）

- **新建 `/sc/` 簡體中文官方 landing**（lang=zh-Hans）：Title【官方网站】香港灭虫公司推介｜灭虫师傅 PEST CONTROL MASTER｜首创AI灭虫与T3i微波探测；六大區塊：Hero（香港首选专业灭虫公司 H1）＋數據帶＋官方网站声明（防偽「灭虫师」）＋六項灭虫服务卡（链 /services/#termite 等）＋AI/T3i 双科技卡＋广播道实战案例带＋十八区覆盖＋灭虫知识文章（blog-13/12/7）＋FAQ×4＋终版 CTA；自帶完整 inline CSS（不載入全域 CSS 避免類名衝突）
- **SC 結構化資料**：PestControl schema（alternateName「灭虫公司」＋knowsAbout 簡體詞庫＋sameAs）＋FAQPage 4 條（schema↔可見 1:1）
- **hreflang zh-Hans 叢集**：ZH/EN 首頁＋/sc/ 互相宣告（zh-HK=/、zh-Hans=/sc/、en=/en/、x-default=/）；sitemap 首頁區塊同步 zh-Hans alternate
- **全站 78 頁 footer nav 加「简体」連結**（ZH 39 頁＋EN 39 頁）→ /sc/ 內鏈全站灌注
- **ZH 首頁 meta keywords 追加簡體詞**：灭虫公司,灭虫师傅,灭白蚁,消灭白蚁,白蚁防治,除虫公司,杀虫公司,香港灭虫

### 5️⃣ sitemap＋既有 bug 修復

- sitemap.xml 78→81 URLs（blog-13 ZH/EN＋/sc/）
- **修復既有結構 bug**：ZH/EN 首頁 district-band section 缺少 `</section>`（其後 guide-band/estate/ipm 三個 section 全部錯誤嵌套其中，瀏覽器容錯渲染多年）——已補回閉合標籤

### 驗證

- scripts/v9_18_verify.py：85 頁全站掃描——218 段 JSON-LD 全部合法、標籤平衡（剝離註釋後）、內鏈全解析、sitemap 81 URLs、hreflang 叢集、單一實例檢查 → ALL PASS
- agent-browser 實測：blog-13 ZH/EN（4 圖＋導流專區＋FAQ 渲染）、/sc/（4 FAQ＋6 服務卡＋3 文章卡＋語言切換器）、strategy 延伸閱讀區、kowloon-city 回鏈、首頁 footer 简体連結——console 零錯誤
- 過程修正：修復 v9_18_site_patch.py 冪等防護缺陷（新字串含錨點致 4 處重複插入，已去重歸一）；/sc/ 移除全域 CSS 連結解決 .header-wa 樣式衝突

---

# 修復日誌 (v9.17 — 2026-09-19)

## v9.17 Social Share 面最後同步：twitter meta 對齊「滅蟲公司」大字（EN 英文版完成度收尾）

- **背景**：《升級到「全港主戰場」》5 大策略網站代碼部分（Title/H1 大字、Organization Schema、Footer 強化、blog-12 Pillar 文章）v9.16 已雙語落地；本次審計發現唯一殘留缺口：ZH/EN 首頁 **twitter:title 仍為舊版**（OG 已更新但 Twitter Card 未同步），即 Google 分享／社交抓取面未覆蓋「滅蟲公司」Head Keyword
- **ZH 首頁**：twitter:title 同步為【官方網站】滅蟲師傅 PEST CONTROL MASTER｜**香港專業滅蟲公司推介**｜首創 AI 智慧滅蟲與 T3i 微波探測；twitter:description 同步 og:description（含「專業滅蟲公司」定義＋防偽聲明）
- **EN 首頁**：twitter:title 同步為 [Official Website] PEST CONTROL MASTER | **Top Pest Control Company in HK** | AI Smart Pest Control & T3i Radar；twitter:description 同步 og:description
- **實施**：scripts/v9_17_twitter_sync.py 冪等腳本（exact-anchor 1 次替換＋重跑 fail-fast）；scripts/v9_14_verify.py 31 項 ALL PASS；agent-browser 實測 ZH/EN 首頁 title／twitter meta 正確、console 零錯誤
- **站外配套交付物**（同日產出，不入站內 zip）：
  - 《好評引導優惠卡》ZH/EN（1080px PNG＋印刷版 PDF＋HTML 源檔）——對應方案第 2 點 GBP「引導式五星好評」，範本句含「滅蟲公司／滅蟲師傅／推介」關鍵字
  - 《全港主戰場_Digital_PR宣傳文案包.docx》8 頁 7 章節——對應方案第 5 點 Digital PR：LIHKG／Discuss／Facebook／科技媒體／EN Press Release 六渠道文案＋UTM 速查＋GSC 追蹤節奏

---

# 修復日誌 (v9.16 — 2026-09-19)

## v9.16 全港大字攻頂：「滅蟲公司」Head Keyword 戰略部署（依《升級到「全港主戰場（滅蟲師傅、滅蟲公司）」.docx》師妹方案，中英雙語同步）

### 1️⃣ 首頁 Title／H1 大字植入（方案第 1 點原文指令）

- **ZH Title**：【官方網站】滅蟲師傅 PEST CONTROL MASTER｜**香港專業滅蟲公司推介**｜首創 AI 智慧滅蟲與 T3i 微波探測（方案指定原文）
- **ZH H1**：**香港首選專業滅蟲公司**<br>首創 AI 智慧滅蟲與三十六計精準防治（方案指定原文）
- **ZH Meta Description**：植入「香港首創 AI 智慧滅蟲之專業滅蟲公司」＋ Termatrac T3i 微波探測；保留防偽聲明與 WhatsApp 免費估價
- **EN Title**：[Official Website] PEST CONTROL MASTER | **Top Pest Control Company in HK** | AI Smart Pest Control & T3i Radar
- **EN H1**：**Hong Kong's Trusted Pest Control Company** | AI Smart Pest Control & 36 Stratagems
- **EN Meta Description**：植入 "top professional pest control company in Hong Kong"；OG Title/Description 全部同步

### 2️⃣ 品牌實體標籤 Brand Entity & Schema.org（方案第 4 點）

- **ZH 首頁新增 Organization JSON-LD**：name「滅蟲師傅 PEST CONTROL MASTER」＋ **alternateName「滅蟲公司」**（方案指定）＋ description「香港首創引入 AI 害蟲圖像識別與 Termatrac T3i 微波探測的專業滅蟲公司…」＋ sameAs 四社媒 ＋ ContactPoint
- **EN 首頁新增 Organization JSON-LD**：alternateName "Pest Control Company Hong Kong"
- **PestControl Schema 強化**：alternateName 追加「滅蟲公司」（ZH）／"Pest Control Company Hong Kong"（EN）；description 植入「專業滅蟲公司」定義句
- 首頁 JSON-LD 由 3 塊升級至 4 塊：PestControl + Organization + WebSite + VideoObject

### 3️⃣ 全站頁尾（Footer）強化（方案第 4 點）

- ZH 40 頁 footer-authenticity 追加：「本品牌是**全港領先的高科技專業滅蟲公司**，致力提供最優質的害蟲防治服務。」
- EN 40 頁追加："We are a leading high-tech professional pest control company in Hong Kong, committed to delivering the highest quality pest control services."

### 4️⃣ 特洛伊木馬權威文章（Pillar Content）（方案第 3 點）

- **全新 blog-12 ZH**：《【2026 最新】香港滅蟲公司收費標準與揀選指南｜防伏必睇》
  - 8 大章節：2026 收費標準總覽（6 蟲種價目表）→ 報價差異四大成本 → 5 大隱藏收費陷阱 → 傳統 vs 高科技滅蟲公司對照表（AI 診斷／T3i 微波探測／0 隱藏收費／三十六計／IoT 監測）→ 5 大防伏指標 → 蟲患方案速查 → 十八區覆蓋 → 免費報價 CTA
  - 8 條 FAQ（Accordion ＋ FAQPage Schema 1:1）
  - 內鏈矩陣：blog-1、blog-3、blog-5、blog-7、/services/、/districts/（沙田/元朗/觀塘/愉景灣）、/ai/、/quote/、WhatsApp
- **全新 blog-12 EN**：[2026 Guide] Hong Kong Pest Control Company Prices & How to Choose | Anti-Scam Must-Read（同構全文翻譯）
- JSON-LD 三件套：BreadcrumbList + Article（datePublished 2026-09-19）+ FAQPage

### 5️⃣ 內鏈與收錄

- info 目錄頁（ZH/EN）：blog-12 卡片插首位（防伏指南 · NEW）
- 首頁（ZH/EN）：十八區 Band 後新增「2026 滅蟲公司防伏指南」旗艦文入口 Band（最新旗艦指南徽章＋雙 CTA），首頁權重直達 Pillar 文章
- sitemap.xml：新增 blog-12 ZH/EN 兩條（priority 0.9，hreflang 三語），首頁 lastmod → 2026-09-19，合計 78 URLs

### 6️⃣ 驗證

- 全站 80 頁 JSON-LD 解析零錯誤；blog-12 內鏈目標全部存在
- agent-browser 實測：ZH/EN 首頁＋blog-12 文章頁 console 零錯誤；價目表／FAQ Accordion／Guide Band 渲染正常
- Footer 強化覆蓋 ZH 40 + EN 40 = 80 頁（含新增 blog-12）
- 檔案數 157（v9.15 基準 155 + blog-12 雙語 2 頁）

### 📋 站外配套（非網站代碼，需商家後台執行——方案第 2、5 點）

- **GBP 次要類別**：商家後台確認主類別「Pest control service（害蟲防治服務）」，加齊環境衛生等相關類別
- **引導式五星好評**：以優惠引導客人評論帶「滅蟲公司」「滅蟲師傅」關鍵字（範例文案見方案原文），累積 10–20 條後網站權重同步暴升
- **外部反向連結（Digital PR）**：向創業媒體／LIHKG 科技台／Discuss／家居群組發布「香港滅蟲公司引入 AI 辨識曱甴，15秒出報告」實測並附 bruceleehk.com 連結


## v9.15 愉景灣專頁 SEO 校準升級＋Google 商家優惠呼應（依《愉景灣滅白蟻SEO搜索排名進入前3名.docx》師妹方案，中英雙語同步）

### 1️⃣ BreadcrumbList 校準（方案原文 3 層）

- ZH：首頁 → 覆蓋十八區 → **愉景灣滅蟲**（方案原文命名，末層直接命中「愉景灣滅蟲」搜尋詞；原 v9.14 四層中的「離島區滅蟲服務」中間層移除）
- EN：Home → 18 Districts → Discovery Bay Pest Control
- 可見麵包屑同步改 3 級（schema ↔ 頁面 1:1），離島區連結保留喺「鄰近服務地區」區塊

### 2️⃣ FAQPage 校準（方案原文 3 條逐字置頂 + 保留 v9.14 兩條）

- Q1 愉景灣村屋做一次白蟻探測需要幾耐時間？→ **T3i 30–60 分鐘全屋暗巢掃描**（方案原文逐字）
- Q2 發現白蟻泥路，可以自己噴殺蟲水嗎？→ **絕對不建議自行噴殺蟲水**（方案原文逐字）
- Q3 愉景灣滅白蟻服務會否有隱藏收費？→ **AI 診斷＋實價報價，同意後先施工**（方案原文逐字）
- 保留：白蟻復發成因＋海外業主遙距處理（移除與方案 Q3 重疊嘅「搭船加價」及非白蟻主軸嘅「花園蚊患」）
- 可見 FAQ 區同步 5 條（Google 規範：schema 內容必須可見，1:1 對應）

### 3️⃣ areaServed 校準（方案原文 AdministrativeArea 陣列）

- Service schema areaServed 由單一 Place → **[{AdministrativeArea: Discovery Bay (愉景灣)}, {AdministrativeArea: Hong Kong Islands}]**
- EN 版對應 Discovery Bay / Hong Kong Islands

### 4️⃣ 限時優惠橫幅（與 Google 商家優惠活動遙相呼應）

- ZH/EN 愉景灣頁麵包屑下方新增 **「限時優惠 / Limited-Time Offer」**琥珀虛線框橫幅：即日預約 T3i 勘察＋免費 WhatsApp 估價＋先報價後施工＋絕無隱藏收費，優惠期有限約滿即止
- CTA 直達 WhatsApp 預填優惠訊息；客人由商家優惠點入即見對應優惠承托

### 驗證

- 驗收腳本全過：3 段 JSON-LD 合法、方案 Q&A 逐字比對、schema↔可見 1:1、標籤平衡、冪等重跑 fail-fast
- agent-browser 實測 ZH/EN：優惠橫幅/FAQ×5/麵包屑 3 級渲染正常，console 零錯誤

## v9.14 十八區流量截擊＋AI 診斷系統穩定性修復升級（依《十八區滅蟲目錄」流量截擊與地區專頁佈局方案.docx》＋用戶 502 截圖，中英雙語同步）

### 1️⃣ 方案一：/districts/ 總目錄 Meta 更新（離島高搜尋量關鍵詞截擊）

- ZH Description → 方案原文：**香港十八區專屬蟲患資訊，涵蓋港島、九龍、新界及離島（愉景灣、東涌、西貢、長洲等）…15-30 秒出廣東話診斷報告…**（meta＋og:description 同步）
- EN Description → 對應英文版（Discovery Bay, Tung Chung, Sai Kung, Cheung Chau 關鍵詞）

### 2️⃣ 方案二：總目錄→專屬子頁內部連結

- 18 區卡整卡可點連結（v9.10 已實現，複核確認）✓
- 離島區頁（ZH/EN）「鄰近服務地區」加**愉景灣專頁**深鏈，權重直達新專頁

### 3️⃣ 方案三：愉景灣專屬子頁面上架（ZH/EN 雙語，首個二級 Spoke）

- 新頁 `/districts/discovery-bay/`＋`/en/districts/discovery-bay/`
- Title 照方案：**【愉景灣滅蟲服務】專治村屋獨立屋白蟻、蚊患｜Termatrac 微波無損探測**
- H1 照方案：**愉景灣專屬滅蟲方案 ｜ 針對低密度住宅及村屋蟲患**
- 內容主軸照方案：愉景灣地理特性四大白蟻風險因素（近山林巢源／臨海潮濕／花園貼屋身／木造裝修＋度假空置）
- 技術展示：Termatrac T3i 實錄區塊（重用 v9.9 廣播道 WebP 海報 600/768 srcset＋lazy，連結九龍城完整案例）
- CTA：WhatsApp 預約＋AI 識別＋快速估價表單（預設獨立洋房×白蟻）
- 愉景灣在地 FAQ×4（搭船唔加價／白蟻復發成因／花園蚊患／海外業主遙距）＋FAQPage/PestControl areaServed Discovery Bay/BreadcrumbList 四層 Schema
- sitemap.xml +2 URLs（76 條）；EN 版全英文對應

### 4️⃣ 【AI 害蟲診斷系統】502 修復＋優化升級（Worker v9.2＋前端）

- **根因診斷**：實測 Worker API 正常（間歇性故障）——Dify 上游偶爾過載/逾時時，Worker 步驟 2 無重試直接 502；且前端「預計 10 秒」文案與實際 30–90 秒嚴重不符
- **Worker v9.2（抗間歇故障版）**：
  - chat-messages 加 5xx 自動重試 1 次（1.5s backoff；逾時/429 不重試避免加倍等待及重複計費）
  - 錯誤碼細分：上游逾時 → HTTP 504（前端可區分），其餘上游錯誤 → 502
  - /health 版本號 9.2-MoE-Resilient；node --check 通過
- **前端 ZH /ai/**：
  - 逾時 60s → 100s（配合 Worker，避免誤殺正常長報告）
  - 502/503/504/斷線**自動重試 1 次**（2.5 秒後，UI 顯示「伺服器波動，自動重試中…」）
  - 最終失敗改 **inline 錯誤卡**（「重新分析」＋「直接問師傅」按鈕）取代 alert 彈窗，客人唔會流失
  - 文案誠實化：「預計 10 秒完成」→「深度報告預計 30–90 秒完成，請勿關閉頁面」；badge「10 秒回應」→「30-90 秒深度報告」
  - 修正舊版 bug：Worker 返回嘅友善錯誤文案被內層 catch 食咗
- **前端 EN /en/ai/**：badge 同步修正＋加「Open the full AI Analyzer」入口連結

### 5️⃣ 方案四：上線後置（見交付訊息）

- GSC 提交 /districts/ 與 /districts/discovery-bay/ Request Indexing；sitemap 已同步

### ✅ v9.14 驗收

- 10 頁標籤平衡全過、19 段 JSON-LD 全 valid、sitemap 76 條
- agent-browser 實測：愉景灣 ZH/EN 頁渲染（hero/FAQ×4/T3i 圖）、AI 頁錯誤卡＋重試按鈕存在、EN 分析器入口、console 零錯誤
- 附帶修復：en/ai/index.html 舊版多餘 </div>（歷史遺留）

## v9.13 雙方案優化：影片 Schema uploadDate 完整時區＋EN 官方防禦方案原文版（依《廣播道龍翔苑白蟻復發救援實錄SEO優化.docx》＋《「PEST CONTROL MASTER」英文版 (EN) 官方權威與防禦優化方案.docx》）

### 1️⃣ 方案 A：影片 Schema uploadDate 修復（消 GSC 兩個選擇性警告）

- ZH/EN 首頁 VideoObject uploadDate：`2026-09-13` → `2026-09-13T12:00:00+08:00`（ISO 8601 完整格式＋香港時區）
- 修復 GSC「uploadDate 的 datetime 值無效」＋「缺少時區」警告；上線後 GSC「即時測試 Test Live URL」複檢即消失

### 2️⃣ 方案 B：EN 版官方防禦文案全面換成方案原文（含「滅蟲師」中文攔截詞）

- EN Title → **[Official Website] PEST CONTROL MASTER | HK's 1st AI Pest Control • Exclusive 36 Strategies**（方案原文）
- EN Description → **[The Only Official Platform] … Declaration: We DO NOT have any branches or sister companies named "滅蟲師" …**（方案原文；meta 屬性內引號轉義 &quot;）
- EN og:title / og:description / twitter:title / twitter:description 全部同步方案 B 原文
- EN PestControl schema description → 方案 B 原文（Hong Kong's pioneer in AI smart pest control…）
- EN 全站 38 頁 footer 防偽聲明 → 方案 B 原文（"PEST CONTROL MASTER" (滅蟲師傅) is an exclusive brand under CEDARS_LTD…）

### 3️⃣ 方案 B 第四項驗證：hreflang 三語標籤確認無缺

- zh-HK → https://bruceleehk.com/ ｜ en → https://bruceleehk.com/en/ ｜ x-default → https://bruceleehk.com/（ZH/EN 兩版首頁一致，Google 不會互相競爭排名）

### ✅ v9.13 驗收

- 6 段 JSON-LD 全 valid；uploadDate 兩版 =+08:00；meta description 屬性完整（&quot; 轉義正確）
- agent-browser 實測：EN title/description/footer 照方案 B、ZH title 保持 v9.12【官方網站】版、console 零錯誤
- 冪等重跑 fail-fast 攔截（x0 assert）＝零重複插入風險；標籤平衡 ✓

## v9.12 官網權威防禦優化（依《網頁優化方案.docx》：確立「唯一正宗官網」＋防禦同行「滅蟲師」混淆攔截）

### 1️⃣ 首頁 Meta 防偽線（方案第一項，ZH/EN 同步）

- ZH Title → **【官方網站】滅蟲師傅 PEST CONTROL MASTER｜香港首創 AI 智慧滅蟲 • 獨家三十六計精準防治**（方案原文照用）
- ZH Description → **【唯一官方平臺】…鄭重聲明：全港「並無開設任何名為滅蟲師之分店」，敬請認清官方技術，提防假冒…**（方案原文照用）
- EN Title → [Official Website] Pest Control Master 滅蟲師傅 | HK's First AI Smart Pest Control • Exclusive 36 Stratagems
- EN Description → [The ONLY Official Website] … NO branch named 滅蟲師 in HK; beware of imposters …
- OG / Twitter Card title+description 全部同步防偽版（社交分享卡片同樣顯示官方聲明）
- keywords 增加官方識別詞：滅蟲師傅官網／滅蟲師傅官方網站／滅蟲師傅唯一官網／official website

### 2️⃣ 全站 Footer 排他性防偽聲明（方案第二項，76 頁）

- © 2026 CEDARS_LTD 版權行下方插入方案原文聲明：「滅蟲師傅 PEST CONTROL MASTER」為本公司（CEDARS_LTD）之專屬品牌，全港僅此一家，絕無任何名為「滅蟲師」之關聯公司、分店或姐妹店…
- ZH 38 頁（含 404）＋EN 38 頁，全站零遺漏；inline style（var fallback）免改共用 CSS

### 3️⃣ Schema 結構化數據強化（方案第三項：LocalBusiness 權威信號）

- 現有 PestControl schema 本身即 LocalBusiness 子類型（Google 官方等效），按方案精神補強而非重複植入：
  - **sameAs**（方案要求，已替換為實際資源）：Instagram CEDARS_LTD + X CEDARS_LTD + WhatsApp 官方頻道（ZH/EN 兩版）
  - **description** 防偽版＋**slogan**（ZH：全港僅此一家 · 唯一正宗官方網站／EN 對應）
  - **WebSite schema + alternateName**（滅蟲師傅官網／PEST CONTROL MASTER 等品牌別名，強化品牌知識圖譜）
- 6 段 JSON-LD（兩首頁各 3 段）全部 json parse valid

### ✅ v9.12 驗收

- 標籤平衡：ZH/EN 首頁 16 種標籤全平衡；冪等重跑 0 重複
- agent-browser 實測：ZH/EN title 正確、footer 防偽聲明渲染正常（截圖目視）、sameAs=3、console 零錯誤
- 覆蓋統計：ZH 38 + EN 38 = 76 頁 footer 防偽；sameAs 連結與 footer 社交資源一致

## v9.11 首頁導航修訂 + EN 英文版全面同步優化

### 1️⃣ 首頁【十八區服務覆蓋】重複項修復（v9.10 遺留）

- ZH 首頁頂部導航出現兩個相同【十八區服務覆蓋】（v9.10 全站 patch 時首頁重複加插），移除重複項只保留一個
- 導航標籤全面改名：**十八區服務覆蓋 → 覆蓋十八區**（更短更醒目）
- 全站統一：ZH 38 個頁面 93 處連結文字（頂部導航 + 頁尾導航 + 麵包屑連結）同步改名；
  districts hub 頁面標題 / JSON-LD / 麵包屑當前頁名維持原狀（SEO 頁名不變）

### 2️⃣ 首頁十八區 Band 標題修訂

- ZH：服務覆蓋全港十八區｜即日上門滅蟲 → **服務覆蓋全港十八區｜最快即日上門滅蟲**
- EN 同步：Service Coverage: All 18 Districts of Hong Kong | **Fastest** Same-Day Pest Control

### 3️⃣ EN 英文版全面同步優化（對齊 ZH 全部功能）

- **導航改名**：Service Areas → **18 Districts**（37 個 EN 頁面 91 處連結文字同步）
- **《白蟻復發救援》視頻卡英文化補完**：VideoObject JSON-LD 名稱由中文
  「廣播道龍翔苑白蟻復發救援實錄：Termatrac T3i 微波白蟻探測」改為英文
  "Broadcast Drive Kowloon Tong Termite Relapse Rescue: Termatrac T3i Microwave Termite Detection"
  （修復 Google 影片搜尋結果喺 EN 頁顯示中文標題嘅問題；頁面可見元素 v9.9 已全英文）
- **補回 Floating AI 助手**：ZH 首頁獨有嘅右下角浮動 AI 按鈕 + AI Chat Popup 補到 EN 首頁
  （AI Pest Assistant / Online 24/7 全英文界面；CSP script-src + frame-src 補白名單 udify.app；
  iframe 維持點擊先載入嘅秒開模式，唔影響首屏速度）
- **補回 IPM 綜合防治理念區塊**：ZH 首頁獨有嘅「Integrated Pest Management (IPM)」漸變綠理念卡
  補到 EN 首頁（Estate Wall 與 Service Terms 之間），EN 用戶同樣感知專業 IPM 方法論（E-E-A-T）

### ✅ v9.11 驗收

- ZH 首頁 nav districts 項 = 1（重複修復）、漢堡選單 6 項：首頁／蟲類服務／覆蓋十八區／有蟲就有計／蟲類資訊／有蟲話我知
- 兩版首頁標籤平衡、JSON-LD 各 3 段全部 valid、ZH 既有區塊零改動
- agent-browser 實測：ZH nav/band ✓；EN nav "18 Districts"／band "Fastest Same-Day" ✓；
  EN IPM 區塊渲染 ✓；EN 浮動 AI 按鈕點擊 → Popup 開啟（display:flex）→ iframe 由 about:blank
  懶載入 udify chatbot（CSP 通過）→ 關閉正常；console 零錯誤
- 改動檔案：index.html（ZH 首頁）+ en/index.html（EN 首頁）+ 全站 75 個頁面連結文字改名（零結構改動）

## v9.10 十八區地區 SEO 戰略地圖：/districts Hub + 18 區專頁雙語上架 + 全站權重灌注（依《網站增設districts頁面.docx》＋《全站權重灌注.docx》方案）

### 1️⃣ /districts/ 十八區總目錄（Hub 頁，zh + en）

- H1 按方案採用「香港十八區 AI 智慧滅蟲服務｜港島、九龍、新界即日上門｜獨家三十六計精準防治」
- 三大區域分組（香港島 / 九龍 / 新界及離島，帶 #hk-island 等錨點）× 18 張區卡（區名 → 專頁連結、
  覆蓋屋苑、常見蟲患 chips），深色科技 band 呈現「十八區 × 獨家科技解法」（AI 圖像識別 / IoT 鼠盒 /
  Termatrac T3i / 三十六計）
- PestControl Schema：areaServed 正式宣告 18 區（AdministrativeArea Place ×18，荔景邨工場大廈地址 +
  9:00-18:00 營業時間標記），另有 BreadcrumbList + FAQPage（4 條通用問答）

### 2️⃣ 18 個地區專頁（輻射子頁，zh + en = 36 頁）

- 每區獨特文案（零 doorway content）：地區簡介、常見蟲患（附表一數據）、
  「點解{區}特別容易出現{主蟲}」痛點分析、蟲患 × 科技解法對應表
- 三十六計錨文本深鏈（全部指向 strategy 頁真實卡片錨點 strat-1..8）
- 真實案例沉浸式植入（E-E-A-T）：九龍城區＝廣播道龍翔苑 T3i 微波探測實錄（YouTube facade，
  點擊先載 iframe，重用 v9.9 WebP 海報）；中西區＝中環餐飲曱甴實戰影片卡；
  西貢區＝日出康城床蝨高溫蒸氣影片卡；深水埗＝美孚新邨管道滅鼠、沙田＝沙田第一城白蟻等屋苑實證卡
- 轉化鉤子（方案第三階段）：首屏＋結尾 AI 診斷 CTA、30 秒快速估價表單
  （屋苑類型 × 害蟲類型下拉 → WhatsApp 預填文本）
- FAQ Schema（方案第四階段）：每區 4 條在地化問答（收費／上門速度／技術／環境），FAQPage JSON-LD
- 每頁 3 段 JSON-LD（Breadcrumb / Service / FAQ）+ canonical + hreflang 三件套 + 鄰區互連
  （Topic Cluster 網狀內鏈），共用 /assets/css/bruceleehk.css（零額外請求）

### 3️⃣ 全站權重灌注（《全站權重灌注.docx》三管齊下）

- Sitewide Link：38 個既有頁面頂部導航加「十八區服務覆蓋 / Service Areas」+
  72 個頁面 footer 加 footer-nav 頁尾導航（含 /districts/），全站權重直達樞紐
- 首頁高速通道：Estate Wall 上方新增深色「服務覆蓋全港十八區｜即日上門滅蟲」band
  （港島／九龍／新界三枚區域按鈕 → /districts/#錨點 + 主 CTA 按鈕）zh + en 同步
- 首頁 PestControl Schema areaServed 由「香港」擴充為 18 區逐區宣告（zh + en）
- 服務頁內文互連（Topic Cluster）：services zh/en 曱甴／滅蚊滅鼠／床木蝨／白蟻四大板塊，
  每板塊加「十八區{蟲患}防護及滅蟲案例」錨文本連結 → /districts/
- 修復全站死錨點：zh strategy 頁 8 張策略卡補回 id="strat-1..8"（EN 版原有），
  首頁三十六計輪播 3 條錨點修正為真實卡片（strat-6 蚊借刀殺人／strat-5 鼠關門打狗／strat-3 床蝨釜底抽薪）

### 4️⃣ sitemap.xml

- 36 → 74 條目：/districts/ hub（0.9）+ 18 區專頁（0.8）zh/en 雙語各 19 條，
  全部帶 hreflang zh-HK / en / x-default 三件套，lastmod 2026-09-17

### 驗收

- 靜態：38 新頁標籤平衡全過、39 段 JSON-LD 全 valid、canonical/hreflang/絕對 asset 路徑/H1 唯一全過
- 動態（headless browser）：hub 18 區卡 + 3 區域 + 4 FAQ 渲染正常、console 零錯誤；
  九龍城區頁 facade 點擊後 iframe 就位（youtube embed bKqEejFbn6g）＋紅標自動隱藏；
  i18n 切換 /districts/kowloon-city/ ↔ /en/districts/kowloon-city/ 雙向正確；
  首頁 band 位置正確（Estate Wall 前）、輪播錨點 [#strat-1,#strat-6,#strat-5,#strat-3]；
  services zh/en 各 6 條 /districts/ 連結到位
- 新頁面零圖片新增（重用既有 WebP），零 iframe 初始載入，維持「秒開」標準

---

# 修復日誌 (v9.9 — 2026-09-13)

## v9.9 首頁【熱成像白蟻暗巢掃描】升級：廣播道龍翔苑《白蟻復發救援》實錄影片上架（依《白蟻防治.docx》方案）

### 1️⃣ 實戰案例卡升級（首頁實戰案例短片區）

原「熱成像白蟻暗巢掃描」（太古城 0:52）卡片升級為「白蟻復發救援實錄」Feature 卡：
影片連結 YouTube Shorts bKqEejFbn6g，紅底個案標籤「📍 廣播道龍翔苑實錄：2小時全屋無損精準定位」，
下方 100 字長尾文案（九龍城廣播道龍翔苑／門框白蟻大窿／白蟻滅完又嚟點算／Termatrac T3i 微波白蟻探測／10,000+ 戶實證），
雙 CTA：[🔬 免費 AI 蟲害初步診斷 → /ai/] ＋ [💬 WhatsApp 預約 T3i 微波探測 → wa.me 預約文本]。

### 2️⃣ 圖片優化四大細則（用戶指定）

- WebP 下一代格式：768×1344 桌面版 26KB ＋ 600×1050 手機版 16KB（遠優於 50-150KB 目標，肉眼無損）
- 原生延遲加載：loading="lazy" + decoding="async"，首屏渲染零佔用
- 響應式 srcset：`<source media="(max-width: 600px)">` 手機自動載 600w，桌面載 768w
- 精準裁切統一比例：9:16 與現有 Shorts 卡一致（3468×4624 原圖裁 2601×4624，保留門框大窿＋電筒＋黃衣師傅實錄構圖）

### 3️⃣ Facade 門面加載 + CSP + SEO

- Facade Pattern：初始零 YouTube 請求（實測 resource API 0 命中），點擊海報先即時載入 iframe（慳約 800KB-1MB）
- CSP frame-src 兩版首頁加白名單 https://www.youtube.com + youtube-nocookie.com（EN 版原為全禁 frame）
- JSON-LD VideoObject schema（名稱/縮圖/uploadDate/contentUrl/embedUrl/發布者 滅蟲師傅）雙語版各 +1 段，爭取 Rich Snippet

### 4️⃣ 智慧專區卡同步升級（E-E-A-T）

「熱成像暗巢掃描」→「Termatrac T3i 微波暗巢探測」（fa-wave-square 動態波形圖示），
文案凸顯「澳大利亞專利微波技術穿透牆身，比傳統熱成像更早鎖定白蟻暗巢」。

### 驗收

- 靜態：兩版標籤平衡、3 段 JSON-LD 全 valid、facade JS node --check 通過
- 動態（Playwright 390×844 手機 viewport）：初始 youtube 請求 0、手機正確揀 600w、點擊後 iframe 就位＋播放鍵/標籤自動隱藏、EN 版同流程通過、console 零錯誤
- 改動範圍：index.html ＋ en/index.html ＋ 新增 assets/img/video-termite-relief-{768,600}.webp/768.jpg，其他頁面零改動

---

# 修復日誌 (v9.8 — 2026-09-13)

## v9.8 新文章：《神、人與昆蟲》SEO 潤色版上架（blog-11 中英雙語 + 雙劍合璧 FAQ，依《神、人與昆蟲》SEO 文章優化方案.docx）

### 1️⃣ 文章潤色上架【蟲類資訊】（info/blog-11）

按方案將《新舊約聖經啟示咗神、人與地上一切昆蟲類（爬行動物）之間的關係》長文，
重構為 Google 爬蟲友好嘅五段 H2/H3 實戰文章：導言（痛點鉤子）→ 啟示一（第六日先造昆蟲
再造人・猶太拉比謙卑詮釋・治理權柄）→ 啟示二（十災四蟲災・希律被蟲咬）→ 啟示三
（彼得異象打破「不潔」框架）→ 結語（積財於天・好管家）。方案指定 H1／Meta Description／
核心關鍵字（聖經昆蟲、基督徒滅蟲、蟲患啟示、教會滅蟲、天人合一）全數採用；
原文經文精華（創世記 1:24-28、出埃及記 3:14、使徒行傳 12:23、利未記 11:20-23、
馬太福音 6:19-20）悉數保留。

### 2️⃣ 「雙劍合璧」黃金戰術 FAQ（5 條）

文末【常見問題（FAQ）】做到三重雙劍合璧：(a) 信仰×實戰——Q1 基督徒可否滅蟲
（創 1:28 治理權柄）、Q5 天人合一 vs 治理這地等神學問答，夾 Q3 白蟻粉末確認、
Q4 教會消毒等實戰指引；(b) 可見×結構化——頁面手風琴（details/summary）+
FAQPage JSON-LD 雙份供 Google 富摘要；(c) 內容×引流——答案無縫植入三大法寶
（苦主討論區 /info/vote/、7x24 AI 診斷 /ai/、WhatsApp 教會/家居諮詢），
連同「基督徒／教會機構實用除蟲指南」三鉤子與 blog-cta-box，將被哲理打動嘅讀者
轉化為流量與客戶。

### 3️⃣ 中英雙語版 + 全站接線

- EN 版 /en/info/blog-11/：照 en_blog_translation_guide 模式全譯（60.6KB），
  check_en_blog.py PASS；Breadcrumb/Article/FAQPage 三段 JSON-LD 全 EN
- zh hub 卡片（屬靈反思・2026年9月）+ EN hub 卡片（SPIRITUAL REFLECTION · EN）加插
- sitemap.xml +2 URL（36 條），blog-11 中英三向 hreflang
- i18n.js blog 路由 1-10 → 1-11（zh blog-11 語言切換直達 EN 版）
- footer WhatsApp 頻道連結（v9.7）自動繼承至新頁面

### ✅ 驗收

- 每檔 exact-string 斷言全命中；標籤平衡；JSON-LD 三段 valid（zh+EN）；sitemap XML valid
- agent-browser 手機 viewport（390×844）實測：zh/EN 頁面標題、FAQ 5 條手風琴展開、
  /ai/ ×4、/info/vote/ ×2、wa.me ×5（EN 版全部 /en/ 對應連結）、canonical/OG 正確、
  hub 兩版卡片連結直達、i18n 路由 1-11 就位、console 零錯誤、截圖目視正常
- 新增檔案：info/blog-11/index.html（58KB）、en/info/blog-11/index.html（60.6KB）；
  修改：info/index.html、en/info/index.html、sitemap.xml、assets/js/i18n.js

---

# 修復日誌 (v9.7 — 2026-09-05)

## v9.7 優化：AI 診斷提速（解決 30 秒逾時）+ 補充描述欄位 + WhatsApp Channel + 全站 Footer 頻道化（依《優化引流到 VIP 包廂+Whats頻道.docx》+ 用戶追加指示）

### 1️⃣ 解決「AI 處理逾時（超過 30 秒）」（文檔指定：前端圖片壓縮治本）

逾時成因：手機 4-5MB 原圖上載（10-15 秒）+ AI 思考（10-15 秒）+ 雲端接力（2-3 秒）≈ 33 秒，
撞上前端 30 秒 AbortController 死線。`/ai/` 頁四項升級：

1. **自適應壓縮**：壓縮寬度 1200→1024px（文檔指定），輸出質量 0.82→0.7→0.6→0.5
   自動遞降，目標 ≤700KB — 實測 3.56MB 雜訊原圖壓到 **264KB（-93%）**，
   4G 上載由十幾秒跌到約 1 秒，全程 <20 秒完成，順帶節省 AI Token 費用
2. **白底填充**：透明底 PNG 轉 JPEG 前填白，唔會變黑底遮蓋蟲體特徵
3. **前端超時 30s→60s**：配合壓縮後一般 20 秒內完成，60 秒只係最後防線
   （Workers Paid 後端有更多呼吸位）
4. **逾時文案同步**：「處理逾時（超過 60 秒），請檢查網絡後再試一次」

### 2️⃣ 「補充發現位置或情況」欄位搬家保留（AI 更準嘅秘密武器）

按文檔方案：首頁保持純按鈕引流（v9.6 已完成），欄位搬到 `/ai/` 上傳區下方——
「補充發現位置或情況（可選填・填咗 AI 配對三十六計更精準）」50 字上限 + 即時字數計 +
前端清洗（Worker 端白名單雙重保險），隨 FormData 以 `user_desc` 附加（Worker v9.0 已支援）；
重新上載自動清空，避免舊描述張冠李戴。實測 FormData 捕獲：`image | 269KB` + `user_desc | 廚房灶頭底發現…`。

### 3️⃣ AI 診斷結果頁最下方加入 WhatsApp Channel 訂閱按鈕

「趁熱打鐵」：客人看完報告信任度最高之時，結果報告最底部加入綠色訂閱區塊
（文檔提供 HTML 原文）——「💡 覺得 AI 認蟲好準、好有用？」+
「👉 立即加入 WhatsApp 頻道」→ https://whatsapp.com/channel/0029VbDNbqw0Qeam1yIagI42
（`target="_blank"` 唔會關閉原診斷結果）。將一次性訪客轉化為長期潛在客戶。

### 4️⃣ 全站 Footer WhatsApp 小圖標 → WhatsApp 頻道連結（用戶追加指示）

頁面底部社交圖標列（Instagram → X → **WhatsApp** → Gmail → YouTube）中間嘅
WhatsApp 小圖標，由個人號 `wa.me/85252821552` 改為頻道
`https://whatsapp.com/channel/0029VbDNbqw0Qeam1yIagI42`，
繁中 + EN 全站同步——與結果頁訂閱按鈕（第 3 點）同一條頻道連結，引流口徑統一。

- **只動 footer 圖標**：腳本以 `<footer>` 區間包夾 + 驗證 aria-label/title="WhatsApp"，
  頁面其他 wa.me CTA（hero 按鈕／浮動按鈕／thumb zone／AI 副選項）全部保持不變
- **34 個檔案替換**：zh 17 頁 + en 17 頁（含兩版 404 頁）
- **合理豁免 4 個**：`info/vote/` 兩版（footer 本身無社交圖標）、
  `info/vote/admin.html`（後台）、Google 驗證檔
- 每檔案四重驗證：wa.me 計數 −1、channel 計數 +1、`<a>` 標籤平衡、
  footer 區間內 wa.me 恰好 1 處；全站終檢 0 個 footer wa.me 殘留

### ✅ 驗收

- 11 處 exact-string 替換全命中；舊 30s/1200 零殘留；標籤平衡；`node --check` 通過
- Footer 頻道化：34 檔案替換 + 4 豁免，全站 footer 0 wa.me 殘留，
  全站共 36 處 channel 連結（35 檔案；ai 頁 2 處 = footer + 結果頁）與預期完全一致
- agent-browser 手機 viewport 全流程實測（頁內 mock Worker 回應，零真實 API 消耗）：
  5MB 保護罩正常拒收 5.25MB 檔案 → 3.56MB 原圖自動壓到 264KB 上傳 →
  補充描述隨請求送出 → 結果報告渲染 → WhatsApp Channel 按鈕就位 →
  重新上載描述清空，console 零錯誤
- 改動範圍：第一階段（AI 提速三點）只改 `ai/index.html`；
  第二階段（Footer 頻道化）改全站 34 個 HTML。Worker 後端、共用 JS、
  sitemap、CSS 等其他一切不變

---

# 修復日誌 (v9.6 — 2026-09-05)

## v9.6 優化：首頁【AI 害蟲分析系統】引流到 VIP 包廂（依《引流到 VIP 包廂.docx》方案 A）

### 🐢 問題根源：資源爭奪（Resource Contention）

首頁內容豐富（高清架構圖、三十六計動態輪播、4 部實戰案例短片），手機用戶喺首頁
上傳高畫質相片時，瀏覽器背景仍在下載影片同圖片，網路頻寬同記憶體被嚴重瓜分 →
AI 圖片傳輸塞車 → 超過 60 秒超時 →「分析未能完成」。而專屬 AI 頁結構乾淨，
所以同一個 AI 引擎喺嗰邊暢順得多。

### 🚪 方案 A：首頁上傳框 → VIP 包廂入口（強烈推薦方案，完全採用）

1. **移除首頁嵌入 AI 上傳系統**（上傳／預覽／載入／結果四狀態區塊 + 約 250 行診斷引擎 JS），
   改為輕量「入口卡片」：保留「7×24 AI 即時診斷估價」標題、安心上傳私隱保證，
   新增醒目按鈕「上載相片・即刻 AI 診斷」→ 直接跳轉乾淨嘅專屬【AI 害蟲分析系統】頁
   `/ai/`（該頁零 YouTube iframe、零影片爭奪）完成上傳同分析
2. **副選項**：「或直接 WhatsApp 搵師妹 AI 診斷」一鍵直達 WhatsApp AI Bot
3. **三網絡環境保證**：Wi-Fi / 4G / 5G 下，專屬頁頻寬全力支援 AI 運算與傳輸，
   秒速上傳、約 15-30 秒出廣東話診斷報告
4. **飛行模式／離線誠實處理**：雲端 AI 100% 需要網絡（全世界雲端 AI 都一樣），
   首頁加入 `navigator.onLine` 即時偵測——離線時撳按鈕唔會白等 60 秒，即時顯示
   「目前離線／飛行模式」友善提示；網絡恢復（online 事件）提示自動收起，按鈕即時恢復跳轉

### ✅ 驗收

- 舊診斷引擎 15 個標識（pestImageInput／WORKER_URL／analyze-pest 等）零殘留
- inline JS `node --check` 語法通過；HTML 標籤全部平衡
- agent-browser 手機 viewport（390×844）實測三場景：
  在線撳掣直達 `/ai/`；開飛行模式即時彈提示、頁面唔會跳走；恢復上網提示自動收起、按鈕恢復正常
- console 零錯誤；EN 首頁（早已係 WhatsApp 入口卡模式）、/ai/ 專屬頁、
  浮動 AI 助手、估價表、短片區等其他功能全部原封不動

---

# 修復日誌 (v9.5 — 2026-09-02)

## v9.5 修正：英文版 blog-1 至 blog-9 全面補完（消除 EN 404）

### 🌍 1. 九篇英文版文章一次過補齊

按照 v9.4 修復 blog-10 嘅同一套方法（gen 腳本 exact-string 替換 + checker 驗收），為
`/en/info/blog-1/` 至 `/en/info/blog-9/` 建立完整英文版：

| 文章 | EN 標題 | 規模 |
|------|---------|------|
| blog-1 選擇滅蟲公司 5 大指標 | Best Pest Control Company in HK 2026 | ~900 詞 |
| blog-2 2026 專業新視角 | 2026: Our Professional Outlook | ~700 詞 |
| blog-3 2026 滅蟲公司推介 | 2026 Pest Control Company Recommendation | ~700 詞 |
| blog-4 家居滅蟲方案 | 2026 Home Pest Control Plans | ~740 詞 |
| blog-5 床蝨檢查治理預防 | Bed Bug Inspection & Prevention Guide | ~860 詞 |
| blog-6 白蟻定螞蟻 | Termite vs Ant: How to Tell Them Apart | ~1,300 詞 |
| blog-7 滅蟲收費行情 | 2026 Pest Control Prices in Hong Kong | ~2,180 詞（24 個 HK$ 價格全保留）|
| blog-8 害蟲抗藥性真相 | Why Insecticides Stop Working | ~1,300 詞（10 條 FAQ 全譯）|
| blog-9 AI 智慧滅蟲共贏 | Will AI Replace Pest Controllers? | ~1,300 詞 |

每篇均含：BreadcrumbList + Article + FAQPage 三段英文 JSON-LD（日期保留原值）、
內部連結全數指向英文版、WhatsApp 預填英文訊息、與中文版 100% 同款設計框架。
驗收：`check_en_blog.py` 十篇全 PASS（標籤平衡／JSON-LD valid／無殘留中文／連結全 EN）。

### 🔗 2. 配套修正

1. **`i18n.js`**：語言切換器 blog-1~9 由「fallback 去英文資訊頁」改為「直接映射 `/en/info/blog-N/`」——訪客撳 EN 即達對應英文文章（未來新文章仍 fallback 去hub，杜絕 404）
2. **`en/info/` 資訊樞紐**：10 張文章卡全部改連英文版＋徽章加「· EN」標記；原卡片標題同實際文章內容不符（例如 blog-1 卡寫「Bed Bug Guide」但文章實為選擇指南）已按實際內容修正；提示盒更新為「全部文章備有英文版」
3. **`zh info/blog-9`**：head 補返缺失嘅 `hreflang="en"` 行（blog-1~8 之前已有）
4. **`en/info/blog-10`**：內文 IPM 連結由中文版 `/info/blog-7/` 改指英文版 `/en/info/blog-7/`
5. **`sitemap.xml`**：新增 9 個 EN 文章 URL（總數 25→34），blog-1~9 中英條目齊備 zh-HK/en/x-default 三向 hreflang；blog-9 zh lastmod 更新至 2026-09-02
6. **`en/info/blog-10` og:site_name** 統一為「Pest Control Master 滅蟲師傅」（同其他 EN 頁一致）

### 📦 部署

打包 `bruceleehk-v9.5-github-upload.zip`（139 files），覆蓋上傳 GitHub 即生效。

---

# 修復日誌 (v9.4 — 2026-09-01)

## v9.4 三大修正：AI 架構去品牌化 + 英文版 blog-10 補完 + PageSpeed 優化

### 🕵️ 1. AI 害蟲診斷系統「去品牌化」整改（依《修正架構圖文字.docx》方案）

**目標：清晰、專業權威、保持神秘感 — 隱藏背後技術供應商**

架構圖文字全面替換（對照文檔五站點方案）：

| 位置 | 原字眼 | 新字眼 |
|------|--------|--------|
| 客戶端入口 | Web: WalzApp Platform / User Patient | Omnichannel Smart Portal（全渠道智能入口）/ Client Interface |
| 雲端邊緣傳輸 | Cloudfare Worker | Edge Computing Network（邊緣運算網絡）|
| 核心 AI 大腦 | Vision AI API Data Transier | Multimodal Vision Engine（多模態視覺引擎）|
| 獨家知識庫 | 36 Data Library | Proprietary IPM Knowledge Base（獨家 IPM 綜合防治智庫）|
| 診斷與報價輸出 | Stattcy Matching…/ Diagnosis Card Piaeit / Price Estimate | Dynamic Strategy Matrix（動態策略矩陣）/ Automated Diagnostic & Quote |

具體修改：

1. **`/ai/` 架構圖以專業 inline SVG 重新繪製**（取代原 AI 生成 jpg 圖，杜絕圖中 "WalzApp / Cloudfare / Transier / Stattcy / Piaeit" 等 AI 錯字）：
   - 五站點流程：全渠道智能入口 → 邊緣運算網絡 → 多模態視覺引擎（核心）→ 獨家 IPM 綜合防治智庫 → 動態策略矩陣
   - 中英雙語標籤、統一科技藍扁平 Icon、無第三方 Logo、發光效果收斂（依文檔視覺建議）
   - 附帶性能紅利：減少一個 108KB 圖片請求，SVG 任何解像度都清晰
2. **`/ai/` 可見字眼替換**：「DeepSeek 大腦」→「多模態視覺引擎」；「Cloudflare 圖像預處理」→「邊緣運算網絡圖像預處理」；「Dify 邏輯大腦深度思考中」→「IPM 防治智庫邏輯推演中」；架構六步驟卡全數採用文檔英文術語
3. **首頁 `/` AI 診斷流程文案**：「視覺化驗師 GPT」→「多模態視覺引擎」；「AI 雙腦分析（視覺化驗+智庫配對）」→「AI 智能分析（視覺辨識+智庫配對）」
4. **`/info/blog-4/` 修正隱藏外連**：正文「滅蟲師傅」文字誤連去 `cloud.dify.ai/apps` 後台 → 改連回 `/` 首頁（嚴重品牌外洩）
5. **`/en/ai/`** 徽章「AI Vision Recognition」→「Multimodal Vision Recognition」
6. **原始碼註解清理**（HTML/JS 註解唔會畀一般訪客見到，但 view-source 會暴露）：`<!-- Dify Chatbot -->` → `<!-- AI 助手模組 -->` 等，覆蓋全部 19 個 HTML + bruceleehk.js
7. **功能層零改動**：CSP、preconnect、udify.app embed、workers.dev 端點、difyChatbotConfig 等 SDK 合約全部保留，AI 診斷同聊天助手功能不受影響

### 🌍 2. 英文版 blog-10 補完（修正 EN 404）

1. **新增 `/en/info/blog-10/`**：《Managing HK Property Pests from Overseas? The Complete Remote Pest Control Guide》完整英文版：
   - 與中文版 100% 同款設計框架（同一套 inline CSS／對比圖／FAQ 手風琴／CTA）
   - 全文專業英文翻譯（3 大場景、3 大痛點、3 招解決、4 步預約、5 條 FAQ）
   - BreadcrumbList + Article + FAQPage 三段英文 JSON-LD
   - 內部連結指向英文版（/en/services/#remote、/en/ai/ 等）；WhatsApp 預填訊息改英文
   - 效能規格與中文版一致（webp 預載、lazy loading、async FA、defer JS）
2. **修正 404 根因**：`i18n.js` 語言切換器將 `/info/blog-10/` 直接映射 `/en/info/blog-10/`，但該頁從未存在 → 現已建立
3. **i18n.js 加入 fallback 防護**：冇英文版嘅網誌（blog-1 至 blog-9）撳 EN 會去 `/en/info/` 資訊主頁，唔會再 404
4. **zh blog-10 加入 `<link rel="alternate" hreflang="en">`**；canonical/hreflang 結構完整
5. **`/en/info/` 列表卡**：blog-10 卡片改連 `/en/info/blog-10/`，徽章加「· EN」標示，頂部提示更新為「最新遙距滅蟲指南已提供英文版」
6. **sitemap.xml**：新增 `/en/info/blog-10/` URL（含 zh-HK/en/x-default hreflang），zh blog-10 lastmod 更新至 2026-09-01

### ⚡ 3. PageSpeed 手機效能優化（目標 ≥90）

1. **修正 Hero 圖「預載浪費」**（16 個頁面）：`<link rel="preload">` 預載 `hero-tech.webp`（65KB）但 CSS 背景卻用 `hero-tech.jpg`（114KB）→ 瀏覽器實際下載兩個檔共 179KB，且 LCP 用咗大嘅 jpg。已將 CSS 背景統一改用 webp，preload 生效，LCP 減輕約 100KB
   - 涉及：全部 blog-1 至 blog-10、en/ 首頁、en/services、en/strategy、en/info、en/info/vote
2. **en/ai、en/quote** hero 背景同樣 jpg → webp（慳約 40KB）
3. **`/ai/` 移除 108KB 架構圖 jpg 請求**（改 inline SVG，見上）
4. 既有基礎保持：圖片 lazy loading + width/height 防 CLS、Font Awesome CDN 異步載入、i18n/bruceleehk.js defer、_headers 長期快取策略不變

### 🎯 設計原則

- 網站整體架構、設計風格、既有內容 100% 不變
- 所有品牌詞替換嚴格採用《修正架構圖文字.docx》建議詞匯，中英對照一致
- 功能性基礎設施（CSP／SDK 合約／Worker 端點）零改動，診斷與聊天功能不受影響

---

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
