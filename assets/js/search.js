/*!
 * bruceleehk.com — 站內搜索組件 v9.126（2026-11-18）
 * 架構（依三份方案文檔落地）：
 *   1. 靜態搜索：Pagefind 瀏覽器本地毫秒級檢索（零資料庫、零 ?s= 網址，SEO 100% 純淨）
 *   2. 手機體驗：100dvh 全螢幕彈窗＋免打字快捷痛點標籤＋滑動自動收起鍵盤
 *   3. 港式同義詞映射：木虱↔床蝨、曱甴↔蟑螂、飛蟻↔白蟻、簡體↔繁體等自動展開檢索
 *   4. AI 智能解答預留位：CONFIG.aiEndpoint 填入 Cloudflare Worker／Dify API 即啟用正式 AI，
 *      未填時自動以「預覽模式」列出站內依據文章（絕不影響正常搜索）
 *   5. 零結果 WhatsApp 傳圖兜底轉化
 * 索引生成：npx pagefind --site .（本版本已預生成 /pagefind/ 索引，開箱即用）
 */
(function () {
  'use strict';
  if (window.__BLH_PF_SEARCH__) return;
  window.__BLH_PF_SEARCH__ = true;

  /* ================= 站長配置區 ================= */
  var CONFIG = {
    pagefindPath: '/pagefind/pagefind.js',
    /* 【AI 接口預留位】日後於 Cloudflare Workers 建立約 20 行轉發腳本（接收 {query, contexts}，
       調用 Gemini／Dify 並要求「僅根據 contexts 以港式專業口吻回答，嚴禁作出包斷尾承諾」），
       將 Worker 網址填入此處即啟用正式 AI 解答；留空＝預覽模式（選配） */
    aiEndpoint: '',
    autoAiMinLength: 9,
    waNumber: '85252821552'
  };
  /* ============================================= */

  /* 語言偵測：en 頁面 → EN 介面；zh-Hans → 簡體介面；其餘 → 繁體介面 */
  var LANG = (document.documentElement.lang || 'zh-HK').toLowerCase();

  var T_HK = {
    openAria: '站內搜尋：搜尋案例、收費與地區',
    mobileAria: '開啟站內搜尋',
    closeAria: '關閉搜尋',
    clearAria: '清除',
    dialogAria: '站內搜尋',
    placeholder: '輸入害蟲、地區或收費（如：木虱、T3i、青衣）...',
    fullLabel: '搜尋案例 / 收費',
    pillsTitle: '🔥 常見查詢一鍵直達',
    pills: [
      ['🔍 白蟻報價', '白蟻 報價'],
      ['🐀 老鼠價格', '老鼠 價格'],
      ['🛏 滅木虱幾錢', '木虱 幾錢'],
      ['🔍 T3i 白蟻探測', 'T3i'],
      ['💰 滅床蝨收費', '床蝨 收費'],
      ['🐱 寵物家庭防蟲', '寵物 貓'],
      ['🐜 紅螞蟻搬巢', '紅螞蟻'],
      ['🪳 滅曱甴藥餌', '曱甴 凝膠']
    ],
    aiLabel: '✨ AI 師傅智能助理',
    aiTrigger: '根據站內實錄解答',
    aiThinking: '⏳ AI 師傅正在翻查站內實錄與報價標準...',
    aiPreviewHead: '<strong>【AI 接口已就緒（預覽模式）】</strong>',
    aiNote: '<span style="font-size:12px;color:#64748b;">正式 AI 解答為選配：於 <code>/assets/js/search.js</code> 的 <code>CONFIG.aiEndpoint</code> 填入 Cloudflare Worker／Dify API 網址後，此處將即時輸出 100 字港式專業總結（100% 忠於站內收費與技術標準）。</span>',
    synonymTip: '💡 已自動同步檢索關聯詞：',
    noResult: '暫時搵唔到完全吻合「<strong>{q}</strong>」嘅文章，建議點擊下方直接 WhatsApp 傳圖問師傅！',
    indexError: '<div style="padding:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:13px;color:#92400e;">⚠️ 搜索索引載入失敗，請重新整理再試；或直接透過下方 WhatsApp 向師傅查詢。</div>',
    waTitle: '唔確定屋企係邊種害蟲？',
    waSub: '影張相 WhatsApp 師傅，5 分鐘免費辨識＋透明報價',
    waBtn: 'WhatsApp 傳圖',
    waText: '你好，我在網站搜尋滅蟲資料，想傳相俾師傅查詢報價',
    bPrice: '報價表', bGuide: '防蟲指南', bCase: '師傅出更'
  };

  var T_EN = {
    openAria: 'Site search: guides, prices and districts',
    mobileAria: 'Open site search',
    closeAria: 'Close search',
    clearAria: 'Clear',
    dialogAria: 'Site search',
    placeholder: 'Search pest, district or price (e.g. bed bug, T3i, termite)...',
    fullLabel: 'Search guides / prices',
    pills: [
      ['🔍 Termite Quote', 'termite cost'],
      ['🐀 Rat Control Price', 'rat control price'],
      ['🛏 Bed Bug Removal', 'bed bug'],
      ['🔍 T3i Detection', 'T3i'],
      ['💰 Transparent Pricing', 'transparent pricing'],
      ['🐱 Pet-Safe Methods', 'pet safe'],
      ['🐜 Ant Treatment', 'ant'],
      ['🪳 Cockroach Service', 'cockroach']
    ],
    aiLabel: '✨ AI Assistant',
    aiTrigger: 'Answer from site records',
    aiThinking: '⏳ Searching site records and pricing standards...',
    aiPreviewHead: '<strong>【AI endpoint ready (preview mode)】</strong>',
    aiNote: '<span style="font-size:12px;color:#64748b;">Real AI answers are optional: fill <code>CONFIG.aiEndpoint</code> in <code>/assets/js/search.js</code> with your Cloudflare Worker / Dify API URL to stream a 100-word expert summary grounded on site content.</span>',
    synonymTip: '💡 Also searched related terms: ',
    noResult: 'No exact match for "<strong>{q}</strong>". Snap a photo and WhatsApp our technician for a free ID + quote!',
    indexError: '<div style="padding:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:13px;color:#92400e;">⚠️ Search index failed to load. Please refresh, or WhatsApp us directly below.</div>',
    waTitle: 'Not sure which pest it is?',
    waSub: 'Send a photo on WhatsApp — free ID + transparent quote in 5 minutes',
    waBtn: 'WhatsApp Photo',
    waText: 'Hi, I searched pest control info on your website. I would like to send a photo for a quote.',
    bPrice: 'Pricing', bGuide: 'Guide', bCase: 'Case Study'
  };

  var T_SC = {
    openAria: '站内搜索：搜索案例、收费与地区',
    mobileAria: '打开站内搜索',
    closeAria: '关闭搜索',
    clearAria: '清除',
    dialogAria: '站内搜索',
    placeholder: '输入害虫、地区或收费（如：白蚁、T3i、蟑螂）...',
    fullLabel: '搜索案例 / 收费',
    pills: [
      ['🔍 白蚁报价', '白蟻 報價'],
      ['🐀 老鼠价格', '老鼠 價格'],
      ['🛏 灭木虱几钱', '木虱 幾錢'],
      ['🔍 T3i 白蚁探测', 'T3i'],
      ['💰 灭床虱收费', '床蝨 收費'],
      ['🐱 有宠物怎么灭鼠', '寵物 貓'],
      ['🐜 红蚂蚁搬家', '紅螞蟻'],
      ['🪳 灭蟑螂药饵', '曱甴 凝膠']
    ],
    aiLabel: '✨ AI 师傅智能助理',
    aiTrigger: '根据站内实录解答',
    aiThinking: '⏳ AI 师傅正在翻查站内实录与报价标准...',
    aiPreviewHead: '<strong>【AI 接口已就绪（预览模式）】</strong>',
    aiNote: '<span style="font-size:12px;color:#64748b;">正式 AI 解答为选配：于 <code>/assets/js/search.js</code> 的 <code>CONFIG.aiEndpoint</code> 填入 Cloudflare Worker／Dify API 网址后，此处将即时输出 100 字专业总结。</span>',
    synonymTip: '💡 已自动同步检索关联词：',
    noResult: '暂时找不到完全吻合「<strong>{q}</strong>」的文章，建议点击下方直接 WhatsApp 传图问师傅！',
    indexError: '<div style="padding:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:13px;color:#92400e;">⚠️ 搜索索引加载失败，请刷新重试；或直接透过下方 WhatsApp 向师傅查询。</div>',
    waTitle: '不确定家里是什么害虫？',
    waSub: '拍照 WhatsApp 师傅，5 分钟免费辨识＋透明报价',
    waBtn: 'WhatsApp 传图',
    waText: '你好，我在网站搜索灭虫资料，想传照片给师傅查询报价',
    bPrice: '报价表', bGuide: '防虫指南', bCase: '师傅出更'
  };

  var T = (LANG.indexOf('en') === 0) ? T_EN : (LANG.indexOf('zh-hans') === 0 ? T_SC : T_HK);

  /* 【港式俗稱同義詞映射表】搜木虱漏床蝨、搜曱甴漏蟑螂、簡體搜白蚁漏白蟻 → 一律自動展開 */
  var SYN = {
    '木虱': ['木虱', '木蝨', '床蝨'],
    '木蝨': ['木蝨', '木虱', '床蝨'],
    '床蝨': ['床蝨', '木蝨', '木虱'],
    '床虱': ['床虱', '床蝨', '木蝨', '木虱'],
    '臭虫': ['臭虫', '床蝨', '木蝨'],
    '曱甴': ['曱甴', '蟑螂'],
    '蟑螂': ['蟑螂', '曱甴'],
    '小強': ['小強', '曱甴', '蟑螂'],
    '飛蟻': ['飛蟻', '白蟻'],
    '白蟻': ['白蟻', '飛蟻'],
    '白蚁': ['白蚁', '白蟻', '飛蟻'],
    '红蚂蚁': ['红蚂蚁', '紅螞蟻'],
    '红蟻': ['红蟻', '紅螞蟻'],
    '紅螞蟻': ['紅螞蟻', '螞蟻', '滅螞蟻'],
    '螞蟻': ['螞蟻', '紅螞蟻', '滅蟻'],
    '蚂蚁': ['蚂蚁', '紅螞蟻', '螞蟻'],
    '老鼠': ['老鼠', '滅鼠', '鼠患'],
    '滅鼠': ['滅鼠', '老鼠'],
    '灭鼠': ['灭鼠', '滅鼠', '老鼠'],
    '鼠患': ['鼠患', '老鼠', '滅鼠'],
    '黃蜂': ['黃蜂', '馬蜂'],
    '馬蜂': ['馬蜂', '黃蜂'],
    '黄蜂': ['黄蜂', '黃蜂', '馬蜂'],
    '滅蟲': ['滅蟲', '害蟲'],
    '灭虫': ['灭虫', '滅蟲'],
    '跳蚤': ['跳蚤', '滅蚤'],
    '床蚤': ['床蚤', '跳蚤', '床蝨']
  };
  /* 價格詞交叉擴展：白蟻+報價 → 白蟻+收費／幾錢／價錢（對應「白蟻報價、老鼠價格、滅木虱幾錢」） */
  var PRICE_WORDS = ['報價', '收費', '價錢', '價格', '幾錢', '費用'];
  var PRICE_ALTS = { '報價': ['收費', '幾錢', '價錢'], '收費': ['報價', '幾錢'], '價錢': ['收費', '報價'], '價格': ['收費', '報價'], '幾錢': ['收費', '報價'], '費用': ['收費', '報價'] };
  /* 無空格長句自動分詞字尾：滅木虱幾錢 → 滅木虱 + 幾錢 */
  var CJK_SUFFIXES = ['幾錢', '收費', '報價', '價錢', '價格', '費用', '邊間好', '推介', '推薦', '推薦', '公司', '服務', '方法', '急救', '處理', '預防', '症狀', '指南', '藥餌'];
  var PHRASE_MAP = {
    '白蟻報價': '白蟻 報價', '老鼠價格': '老鼠 價格', '滅木虱幾錢': '木虱 幾錢',
    '白蚁报价': '白蟻 報價', '老鼠价格': '老鼠 價格', '灭木虱几钱': '木虱 幾錢'
  };

  /* ===================== 樣式（全 pf- 前綴，零衝突） ===================== */
  var CSS = [
    '#pf-overlay{--pf-brand:#2c5e1a;--pf-brand-light:#f4f9f0;--pf-brand-border:#bfdcb0;--pf-text:#1f2937;--pf-muted:#6b7280;--pf-bg:#ffffff;--pf-surface:#f8fafc;--pf-border:#e5e7eb;display:none;position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);justify-content:center;align-items:flex-start;padding-top:6vh;font-family:-apple-system,BlinkMacSystemFont,"PingFang HK","Microsoft JhengHei",sans-serif}',
    '#pf-overlay.is-open{display:flex}',
    '#pf-modal{width:100%;max-width:680px;max-height:86vh;background:var(--pf-bg);border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,.2);display:flex;flex-direction:column;overflow:hidden;color:var(--pf-text)}',
    '@media(max-width:768px){#pf-overlay{padding-top:0}#pf-modal{max-width:100%;height:100dvh;max-height:100dvh;border-radius:0}}',
    '.pf-header{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--pf-border);background:var(--pf-bg);flex-shrink:0}',
    '.pf-input-wrap{flex:1;display:flex;align-items:center;background:var(--pf-surface);border:1.5px solid var(--pf-brand);border-radius:10px;padding:0 12px;height:44px}',
    '#pf-input{flex:1;border:none;background:transparent;font-size:16px;color:var(--pf-text);outline:none;width:100%;min-width:0}',
    '#pf-clear-btn{display:none;border:none;background:#cbd5e1;color:#fff;width:20px;height:20px;border-radius:50%;font-size:12px;line-height:1;cursor:pointer;flex-shrink:0}',
    '#pf-close-btn{border:none;background:var(--pf-surface);color:var(--pf-text);width:40px;height:40px;border-radius:10px;font-size:20px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center}',
    '#pf-body{flex:1;overflow-y:auto;padding:14px 16px 24px;-webkit-overflow-scrolling:touch}',
    '.pf-pills-title{font-size:12px;font-weight:600;color:var(--pf-muted);margin-bottom:8px}',
    '.pf-pills{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}',
    '.pf-pill{padding:7px 12px;background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:999px;font-size:13px;color:var(--pf-text);cursor:pointer;transition:all .15s;font-family:inherit}',
    '.pf-pill:hover,.pf-pill:active{background:var(--pf-brand-light);border-color:var(--pf-brand);color:var(--pf-brand)}',
    '#pf-ai-section{display:none;margin-bottom:16px;background:linear-gradient(135deg,#f4f9f0 0%,#eff6ff 100%);border:1px solid var(--pf-brand-border);border-radius:12px;padding:12px 14px}',
    '.pf-ai-bar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}',
    '.pf-ai-label{font-size:13px;font-weight:700;color:var(--pf-brand);display:flex;align-items:center;gap:6px}',
    '#pf-ai-trigger{padding:6px 12px;background:var(--pf-brand);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}',
    '#pf-ai-answer{display:none;margin-top:10px;padding-top:10px;border-top:1px dashed var(--pf-brand-border);font-size:14px;line-height:1.65;color:#0f172a;word-break:break-word}',
    '#pf-synonym-tip{display:none;font-size:12px;color:var(--pf-muted);margin-bottom:10px}',
    '.pf-card{display:block;text-decoration:none;padding:12px;border:1px solid var(--pf-border);border-radius:10px;margin-bottom:10px;background:var(--pf-bg);transition:border-color .15s}',
    '.pf-card:hover{border-color:var(--pf-brand)}',
    '.pf-card-top{display:flex;align-items:center;gap:8px;margin-bottom:4px}',
    '.pf-badge{font-size:11px;font-weight:700;padding:2px 7px;border-radius:4px;flex-shrink:0}',
    '.pf-badge-price{background:#fef3c7;color:#b45309}',
    '.pf-badge-guide{background:#e0f2fe;color:#0369a1}',
    '.pf-badge-case{background:#dcfce7;color:#15803d}',
    '.pf-card-title{font-size:15px;font-weight:700;color:var(--pf-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.pf-card-excerpt{font-size:13px;line-height:1.5;color:var(--pf-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
    '.pf-card-excerpt mark{background:#fef08a;color:#854d0e;padding:0 2px;border-radius:2px}',
    '.pf-wa-box{margin-top:16px;padding:14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;display:flex;align-items:center;justify-content:space-between;gap:12px}',
    '.pf-wa-text strong{display:block;font-size:14px;color:#166534;margin-bottom:2px}',
    '.pf-wa-text span{font-size:12px;color:#15803d}',
    '.pf-wa-btn{padding:9px 14px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:700;white-space:nowrap;flex-shrink:0}',
    '.pf-nav-item{display:flex;align-items:center}',
    '.pf-nav-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:6px 10px;border:1px solid #cbd5e1;border-radius:999px;background:#f8fafc;color:#1e293b;font-size:13.5px;cursor:pointer;line-height:1;font-family:inherit}',
    '.pf-nav-btn:hover{border-color:#2c5e1a;color:#2c5e1a;background:#f4f9f0}',
    '.pf-nav-btn .pf-t-full{display:none}',
    '.pf-search-trigger{display:none}',
    '@media(max-width:768px){',
    '.pf-nav-btn{padding:10px 14px;font-size:14px}',
    '.pf-nav-btn .pf-t-full{display:inline}',
    '.pf-search-trigger{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border:1px solid #cbd5e1;border-radius:10px;background:#f8fafc;color:#1e293b;cursor:pointer;flex-shrink:0}',
    '.pf-search-trigger:hover{border-color:#2c5e1a;color:#2c5e1a;background:#f4f9f0}}'
  ].join('\n');

  var SVG_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';

  /* ===================== 狀態 ===================== */
  var pagefind = null, pfLoading = null;
  var overlay = null, input = null, clearBtn = null, closeBtn = null, bodyEl = null,
      resultsEl = null, synonymTip = null, aiSection = null, aiTrigger = null, aiAnswer = null, pillsWrap = null;
  var currentMatches = [], debounceTimer = null, lastQuery = '';

  function pushDL(ev, d) { try { if (window.dataLayer && d === undefined) window.dataLayer.push({ event: ev }); else if (window.dataLayer) { d.event = ev; window.dataLayer.push(d); } } catch (e) {} }

  /* ===================== 彈窗 DOM（首次打開時惰性建立） ===================== */
  function ensureModal() {
    if (overlay) return;
    var st = document.createElement('style');
    st.id = 'pf-search-style';
    st.textContent = CSS;
    document.head.appendChild(st);

    overlay = document.createElement('div');
    overlay.id = 'pf-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', T.dialogAria);
    overlay.innerHTML =
      '<div id="pf-modal">' +
        '<div class="pf-header">' +
          '<div class="pf-input-wrap">' +
            '<input id="pf-input" type="search" placeholder="' + T.placeholder + '" autocomplete="off" aria-label="' + T.openAria + '" />' +
            '<button type="button" id="pf-clear-btn" aria-label="' + T.clearAria + '">✕</button>' +
          '</div>' +
          '<button type="button" id="pf-close-btn" aria-label="' + T.closeAria + '">✕</button>' +
        '</div>' +
        '<div id="pf-body">' +
          '<div id="pf-pills-wrap"><div class="pf-pills-title">' + T.pillsTitle + '</div><div class="pf-pills" id="pf-pills"></div></div>' +
          '<div id="pf-ai-section"><div class="pf-ai-bar"><div class="pf-ai-label">' + T.aiLabel + '</div><button type="button" id="pf-ai-trigger">' + T.aiTrigger + '</button></div><div id="pf-ai-answer"></div></div>' +
          '<div id="pf-synonym-tip"></div>' +
          '<div id="pf-results"></div>' +
          '<div class="pf-wa-box"><div class="pf-wa-text"><strong>' + T.waTitle + '</strong><span>' + T.waSub + '</span></div>' +
          '<a class="pf-wa-btn" href="https://wa.me/' + CONFIG.waNumber + '?text=' + encodeURIComponent(T.waText) + '" target="_blank" rel="noopener" id="pf-wa-link">' + T.waBtn + '</a></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    input = overlay.querySelector('#pf-input');
    clearBtn = overlay.querySelector('#pf-clear-btn');
    closeBtn = overlay.querySelector('#pf-close-btn');
    bodyEl = overlay.querySelector('#pf-body');
    resultsEl = overlay.querySelector('#pf-results');
    synonymTip = overlay.querySelector('#pf-synonym-tip');
    aiSection = overlay.querySelector('#pf-ai-section');
    aiTrigger = overlay.querySelector('#pf-ai-trigger');
    aiAnswer = overlay.querySelector('#pf-ai-answer');
    pillsWrap = overlay.querySelector('#pf-pills-wrap');

    var pillsEl = overlay.querySelector('#pf-pills');
    T.pills.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pf-pill';
      b.textContent = p[0];
      b.setAttribute('data-q', p[1]);
      b.addEventListener('click', function () {
        input.value = b.getAttribute('data-q');
        handleSearch(b.getAttribute('data-q'));
        pushDL('pf_search_pill', { search_term: b.getAttribute('data-q') });
      });
      pillsEl.appendChild(b);
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    clearBtn.addEventListener('click', function () {
      input.value = '';
      clearBtn.style.display = 'none';
      resultsEl.innerHTML = '';
      synonymTip.style.display = 'none';
      aiSection.style.display = 'none';
      pillsWrap.style.display = 'block';
      input.focus();
    });
    input.addEventListener('input', function (e) {
      var val = e.target.value.trim();
      clearBtn.style.display = val ? 'block' : 'none';
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () { handleSearch(val); }, 180);
    });
    aiTrigger.addEventListener('click', function () {
      var q = input.value.trim();
      if (q) triggerAiSummary(q, currentMatches.slice(0, 3));
    });
    /* 手機體驗：滑動瀏覽結果時自動收起虛擬鍵盤（釋放逾 40% 螢幕空間） */
    bodyEl.addEventListener('touchmove', function () {
      if (document.activeElement === input) input.blur();
    }, { passive: true });
    overlay.querySelector('#pf-wa-link').addEventListener('click', function () { pushDL('pf_wa_fallback', { search_term: lastQuery }); });
  }

  /* ===================== Pagefind 惰性載入 ===================== */
  function initPagefind() {
    if (pagefind) return Promise.resolve(true);
    if (pfLoading) return pfLoading;
    pfLoading = import(CONFIG.pagefindPath)
      .then(function (mod) {
        pagefind = mod;
        return pagefind.options({ excerptLength: 28 });
      })
      .then(function () { return true; })
      .catch(function () {
        pfLoading = null;
        return false;
      });
    return pfLoading;
  }

  /* ===================== 開關彈窗 ===================== */
  function openModal(presetQuery) {
    ensureModal();
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    pushDL('pf_search_open');
    initPagefind();
    if (presetQuery) {
      input.value = presetQuery;
      handleSearch(presetQuery);
    }
    setTimeout(function () { input.focus(); }, 50);
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ===================== 查詢展開（分詞＋同義詞＋價格詞交叉） ===================== */
  function splitCjk(q) {
    for (var i = 0; i < CJK_SUFFIXES.length; i++) {
      var s = CJK_SUFFIXES[i];
      if (q.length > s.length + 1 && q.slice(-s.length) === s) {
        return [q.slice(0, q.length - s.length), s];
      }
    }
    return [q];
  }

  function tokenize(raw) {
    var q = raw.trim();
    if (PHRASE_MAP[q]) q = PHRASE_MAP[q];
    var hasCJK = /[\u3400-\u9fff]/.test(q);
    if (hasCJK && q.indexOf(' ') === -1 && q.replace(/\s/g, '').length >= 4) return splitCjk(q);
    return q.split(/\s+/).filter(Boolean);
  }

  function tokenAlts(t) {
    var alts = [t];
    var add = function (x) { if (alts.indexOf(x) < 0) alts.push(x); };
    if (SYN[t]) SYN[t].forEach(add);
    else if (t.length > 1 && /^[滅殺趕捉防]/.test(t) && SYN[t.slice(1)]) SYN[t.slice(1)].forEach(add);
    if (PRICE_ALTS[t]) PRICE_ALTS[t].forEach(add);
    return alts;
  }

  function expandQueries(raw) {
    var out = [], seen = {};
    var add = function (s) {
      s = (s || '').trim().replace(/\s+/g, ' ');
      if (s && !seen[s]) { seen[s] = 1; out.push(s); }
    };
    add(raw);
    var toks = tokenize(raw);
    if (toks.length === 0) return out;
    add(toks.join(' '));
    if (toks.length === 1) {
      tokenAlts(toks[0]).slice(1, 4).forEach(add);
    } else if (toks.length === 2) {
      /* 價格詞交叉優先（保持蟲害詞不變：老鼠 價格→老鼠 收費／報價），蟲害同義詞其後兜底 */
      var pIdx = PRICE_ALTS[toks[1]] ? 1 : (PRICE_ALTS[toks[0]] ? 0 : -1);
      if (pIdx === 1) {
        PRICE_ALTS[toks[1]].forEach(function (p) { add(toks[0] + ' ' + p); });
        tokenAlts(toks[0]).slice(1, 3).forEach(function (a) { add(a + ' ' + toks[1]); });
      } else if (pIdx === 0) {
        PRICE_ALTS[toks[0]].forEach(function (p) { add(p + ' ' + toks[1]); });
        tokenAlts(toks[1]).slice(1, 3).forEach(function (a) { add(toks[0] + ' ' + a); });
      } else {
        tokenAlts(toks[0]).slice(1, 3).forEach(function (a) { add(a + ' ' + toks[1]); });
        tokenAlts(toks[1]).slice(1, 3).forEach(function (a) { add(toks[0] + ' ' + a); });
      }
    }
    return out.slice(0, 7);
  }

  /* ===================== 分類徽章 ===================== */
  function badgeFor(url, title) {
    var s = title + ' ' + url;
    if (/師傅出更|實錄|個案|實戰|case study|on[- ]duty/i.test(s) || /blog-(24|36|41|42)\//.test(url)) {
      return '<span class="pf-badge pf-badge-case">' + T.bCase + '</span>';
    }
    if (/收費|報價|價錢|價格|費用|pricing|price|cost/i.test(s)) {
      return '<span class="pf-badge pf-badge-price">' + T.bPrice + '</span>';
    }
    return '<span class="pf-badge pf-badge-guide">' + T.bGuide + '</span>';
  }

  /* ===================== 核心混合檢索 ===================== */
  function handleSearch(rawQuery) {
    if (!rawQuery) {
      resultsEl.innerHTML = '';
      synonymTip.style.display = 'none';
      aiSection.style.display = 'none';
      pillsWrap.style.display = 'block';
      return;
    }
    lastQuery = rawQuery;
    pillsWrap.style.display = 'none';
    initPagefind().then(function (ready) {
      if (!ready) { resultsEl.innerHTML = T.indexError; return; }
      if (rawQuery !== input.value.trim()) return; /* 已被更新輸入取代 */

      var variants = expandQueries(rawQuery);
      if (variants.length > 1) {
        synonymTip.textContent = T.synonymTip + variants.join('、');
        synonymTip.style.display = 'block';
      } else {
        synonymTip.style.display = 'none';
      }
      pushDL('pf_search', { search_term: rawQuery });

      Promise.all(variants.map(function (q) { return pagefind.search(q); }))
        .then(function (responses) {
          if (rawQuery !== input.value.trim()) return;
          var seen = {}, merged = [];
          responses.forEach(function (res, vi) {
            (res.results || []).forEach(function (item) {
              if (seen[item.id] === undefined) { seen[item.id] = merged.length; merged.push({ v: vi, item: item }); }
              else if ((item.score || 0) > (merged[seen[item.id]].item.score || 0)) { merged[seen[item.id]].item = item; }
            });
          });
          /* 取每變體前 12 名，標題加權後全域排序取前 8 */
          merged.sort(function (a, b) { return a.v - b.v || (b.item.score || 0) - (a.item.score || 0); });
          var top = merged.slice(0, 12);
          return Promise.all(top.map(function (m) {
            return m.item.data().then(function (d) { return { v: m.v, s: m.item.score || 0, d: d }; });
          })).then(function (rows) {
            if (rawQuery !== input.value.trim()) return;
            /* 標題相關度加權：標題含蟲害詞（含同義詞）×3——避免「收費總表頁」憑正文壓過專頁 */
            var pestAlts = [];
            tokenize(rawQuery).forEach(function (t) {
              if (!PRICE_ALTS[t]) tokenAlts(t).forEach(function (x) { if (pestAlts.indexOf(x) < 0) pestAlts.push(x); });
            });
            rows.forEach(function (row) {
              var title = (row.d.meta && row.d.meta.title) || '';
              var hit = pestAlts.some(function (a) { return title.indexOf(a) >= 0; });
              row.rank = row.s * (hit ? 3 : 1) - row.v * 0.01;
            });
            rows.sort(function (a, b) { return b.rank - a.rank; });
            var datas = rows.slice(0, 8).map(function (r) { return r.d; });
            if (rawQuery !== input.value.trim()) return;
            currentMatches = datas;
            aiSection.style.display = 'block';
            aiAnswer.style.display = 'none';
            aiAnswer.innerHTML = '';

            if (currentMatches.length === 0) {
              resultsEl.innerHTML = '<div style="text-align:center;padding:24px 12px;color:#64748b;font-size:14px;">' + T.noResult.replace('{q}', rawQuery) + '</div>';
              return;
            }
            resultsEl.innerHTML = currentMatches.map(function (d) {
              var title = (d.meta && d.meta.title) || '滅蟲師傅';
              return '<a class="pf-card" href="' + d.url + '">' +
                '<div class="pf-card-top">' + badgeFor(d.url, title) +
                '<div class="pf-card-title">' + title + '</div></div>' +
                '<div class="pf-card-excerpt">' + (d.excerpt || '') + '</div></a>';
            }).join('');

            /* 長句提問（≥9 字）自動觸發 AI 解答 */
            if (rawQuery.replace(/\s/g, '').length >= CONFIG.autoAiMinLength) {
              triggerAiSummary(rawQuery, currentMatches.slice(0, 3));
            }
          });
        })
        .catch(function () {
          resultsEl.innerHTML = T.indexError;
        });
    });
  }

  /* ===================== AI 智能解答（預留位） ===================== */
  function triggerAiSummary(query, topDocs) {
    aiAnswer.style.display = 'block';
    aiAnswer.innerHTML = T.aiThinking;
    pushDL('pf_ai_preview', { search_term: query });

    var contexts = topDocs.map(function (d) {
      return {
        title: (d.meta && d.meta.title) || '',
        url: d.url,
        snippet: (d.excerpt || '').replace(/<[^>]+>/g, '')
      };
    });

    if (!CONFIG.aiEndpoint) {
      setTimeout(function () {
        if (!currentMatches.length) return;
        var refLinks = contexts.map(function (c) {
          return '<a href="' + c.url + '" style="color:#2c5e1a;font-weight:600;">《' + c.title + '》</a>';
        }).join('、');
        aiAnswer.innerHTML = T.aiPreviewHead + '<br>' +
          (LANG.indexOf('en') === 0
            ? 'Top matching records for "' + query + '": ' + (refLinks || 'no matched document yet') + '.<br>' + T.aiNote
            : '已自動為問題「' + query + '」提取最相關的站內依據：' + (refLinks || '暫無匹配文檔') + '。<br>' + T.aiNote);
      }, 400);
      return;
    }

    /* 正式 AI 解答：POST {query, contexts} 至 Cloudflare Worker／Dify */
    fetch(CONFIG.aiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query, contexts: contexts })
    }).then(function (r) { return r.json(); }).then(function (data) {
      aiAnswer.innerHTML = data.answer || T.noResult.replace('{q}', query);
    }).catch(function () {
      aiAnswer.innerHTML = LANG.indexOf('en') === 0
        ? 'Network busy — please read the related articles below or WhatsApp us.'
        : '網絡繁忙，請直接點閱下方相關文章或透過 WhatsApp 聯絡師傅。';
    });
  }

  /* ===================== 導航入口注入 ===================== */
  function injectEntryPoints() {
    /* 桌面：導航最後一項放大鏡（≤768px 於漢堡菜單內顯示「搜尋案例 / 收費」全文） */
    var nav = document.getElementById('nav-links');
    if (nav && !nav.querySelector('.pf-nav-item')) {
      var li = document.createElement('li');
      li.className = 'pf-nav-item';
      li.innerHTML = '<button type="button" class="pf-nav-btn" aria-haspopup="dialog" aria-label="' + T.openAria + '">' + SVG_ICON +
        '<span class="pf-t-full">' + T.fullLabel + '</span></button>';
      li.querySelector('button').addEventListener('click', function () { openModal(); });
      nav.appendChild(li);
    }
    /* 手機：漢堡旁獨立放大鏡（i18n 語言切換之後、漢堡之前） */
    var menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle && !document.querySelector('.pf-search-trigger')) {
      var trig = document.createElement('button');
      trig.type = 'button';
      trig.className = 'pf-search-trigger';
      trig.setAttribute('aria-label', T.mobileAria);
      trig.setAttribute('aria-haspopup', 'dialog');
      trig.innerHTML = SVG_ICON;
      trig.addEventListener('click', function () { openModal(); });
      menuToggle.parentNode.insertBefore(trig, menuToggle);
    }
  }

  /* ===================== 全域快捷鍵＋?s= 深鏈兼容 ===================== */
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key || '').toLowerCase() === 'k') {
      e.preventDefault();
      openModal();
    }
    if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) closeModal();
  });

  function initFromUrl() {
    try {
      var m = /[?&]s=([^&]*)/.exec(window.location.search);
      if (m && m[1]) {
        var q = decodeURIComponent((m[1] + '').replace(/\+/g, ' '));
        /* 清理網址：搜索在本地彈窗完成，不產生 ?s= 網址（SEO 鐵律） */
        window.history.replaceState(null, '', window.location.pathname);
        if (q) openModal(q);
      }
    } catch (e) {}
  }

  function boot() {
    injectEntryPoints();
    initFromUrl();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* 供其他組件調用 */
  window.pfOpenSearch = openModal;
})();
