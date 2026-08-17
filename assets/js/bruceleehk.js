/* ============================================================
   bruceleehk.com — Shared JavaScript (v3.1 — 2026-08-17)
   Used by: / (homepage), /ai/, /quote/

   v3.1 修復亮點：
     🔧 AI 圖片上傳失敗問題修復：
        - 新增客戶端圖片壓縮（最大 1024px / JPEG 0.85），
          避免超大 base64 payload 拖垮 Worker
        - 加入 20 秒 AbortController 逾時保護
        - AI Worker 失敗時不再顯示「網路連線或 AI 分析逾時」彈窗，
          改為平滑降級：自動切換至「選擇害蟲類型 → 本地策略庫分析」流程，
          用戶仍可獲得完整分析報告 + WhatsApp 預約連結
        - 修正 Worker AI Llama 3.2 需先送出 'agree' 授權 prompt 之問題
     🔧 留言系統回覆按鈕：
        - 全面改用 event delegation 取代 inline onclick（避免 XSS）
   ============================================================ */

(function () {
    'use strict';

    /* ---------- Mobile Menu Toggle ---------- */
    function initMenu() {
        const toggle = document.getElementById('menu-toggle');
        const nav = document.getElementById('nav-links');
        if (!toggle || !nav) return;

        const close = () => {
            nav.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            const icon = toggle.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        };
        const open = () => {
            nav.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
            const icon = toggle.querySelector('i');
            if (icon) icon.className = 'fas fa-xmark';
        };

        toggle.addEventListener('click', () => {
            nav.classList.contains('active') ? close() : open();
        });
        nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') &&
                !nav.contains(e.target) && !toggle.contains(e.target)) close();
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
        let t;
        window.addEventListener('resize', () => {
            clearTimeout(t);
            t = setTimeout(() => { if (window.innerWidth > 768) close(); }, 100);
        });
    }

    /* ---------- Dynamic Year ---------- */
    function initYear() {
        const el = document.getElementById('current-year');
        if (el) el.textContent = new Date().getFullYear();
    }

    /* ---------- Floating AI Assistant (Homepage only) ---------- */
    function initFloatingAI() {
        const btn = document.getElementById('floating-ai-btn');
        const popup = document.getElementById('ai-popup');
        const closeBtn = document.getElementById('ai-popup-close');
        if (!btn || !popup || !closeBtn) return;

        btn.addEventListener('click', () => {
            popup.classList.toggle('open');
            const isOpen = popup.classList.contains('open');
            btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                popup.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ---------- Strategy & Price Fallback Table ---------- */
    const STRATEGY_MAP = {
        '曱甴': { pest: '曱甴（蟑螂）', risk: '中 - 高', nest: '廚房罅隙、排水管、電器背後', strategy: '採用「誘敵深入計」：設置智慧誘餌站，系統性引誘處理。', price: 'HK$ 600 - 3,800', confidence: 95 },
        '蟑螂': { pest: '曱甴（蟑螂）', risk: '中 - 高', nest: '廚房罅隙、排水管、電器背後', strategy: '採用「誘敵深入計」：設置智慧誘餌站，系統性引誘處理。', price: 'HK$ 600 - 3,800', confidence: 95 },
        '木蝨': { pest: '木蝨（床蝨）', risk: '高', nest: '床板縫隙、梳化、牆身插座', strategy: '採用「星星之火計」：高溫蒸氣 + 雙重殘留藥劑深層處理。', price: 'HK$ 800 - 5,500', confidence: 93 },
        '床蝨': { pest: '木蝨（床蝨）', risk: '高', nest: '床板縫隙、梳化、牆身插座', strategy: '採用「星星之火計」：高溫蒸氣 + 雙重殘留藥劑深層處理。', price: 'HK$ 800 - 5,500', confidence: 93 },
        '老鼠': { pest: '老鼠', risk: '中 - 高', nest: '管道入口、天花夾層、儲物區', strategy: '採用「釜底抽薪計」+ IoT 智慧鼠盒：封堵源頭 + 遠端監測誘捕。', price: 'HK$ 1,000 - 5,800', confidence: 92 },
        '鼠': { pest: '老鼠', risk: '中 - 高', nest: '管道入口、天花夾層、儲物區', strategy: '採用「釜底抽薪計」+ IoT 智慧鼠盒：封堵源頭 + 遠端監測誘捕。', price: 'HK$ 1,000 - 5,800', confidence: 92 },
        '白蟻': { pest: '白蟻', risk: '極高（結構風險）', nest: '木結構內部、牆身、地板下', strategy: '熱成像定位暗巢 + 灌注持效保護劑 + 結構性防治方案。', price: 'HK$ 1,500 - 9,800', confidence: 91 },
        '蚊': { pest: '蚊', risk: '低 - 中', nest: '積水容器、花盆底碟、冷氣機托盤', strategy: '採用「以逸待勞計」：誘蚊燈 + 生物顆粒阻斷幼蟲孳生。', price: 'HK$ 500 - 3,800', confidence: 90 },
        '螞蟻': { pest: '螞蟻', risk: '低', nest: '牆身罅隙、廚房、糖類食物附近', strategy: '採用「追本溯源計」：找出蟻巢 + 慢效藥餌連鎖滅巢。', price: 'HK$ 500 - 2,500', confidence: 88 },
        '蜂': { pest: '蜂類', risk: '中 - 高（過敏者可致命）', nest: '屋簷、露台、樹上、牆身洞穴', strategy: '專業安全移除蜂巢 + 預防再築巢處理。', price: 'HK$ 800 - 3,500', confidence: 87 },
        '蜈蚣': { pest: '蜈蚣', risk: '中（毒咬劇痛）', nest: '潮濕陰暗處、排水管、牆隙', strategy: '封堵入侵路徑 + 殘留噴劑 + 環境乾燥處理。', price: 'HK$ 600 - 2,800', confidence: 86 },
        '衣魚': { pest: '衣魚', risk: '低（紙張衣物損害）', nest: '潮濕書櫃、衣櫃、牆紙後', strategy: '降低濕度 + 殘留噴劑 + 物理捕捉。', price: 'HK$ 500 - 2,200', confidence: 85 },
        '蜘蛛': { pest: '蜘蛛', risk: '低（多數無害）', nest: '牆角、陰暗處、天花板', strategy: '移除蛛網 + 封堵入侵路徑 + 殘留噴劑。', price: 'HK$ 400 - 1,800', confidence: 84 },
        '其他': { pest: '待 AI 進一步分析', risk: '待評估', nest: '建議專員現場勘察', strategy: '已安排專業師傅親自對照相片，為你提供精準處方。', price: '免費估價', confidence: 80 }
    };

    /* ============================================================
       AI 圖片壓縮 — 在客戶端先壓縮再上傳
       將任意圖片壓縮至最大 1024px、JPEG quality 0.85
       大幅縩短 base64 payload 大小（5MB → ~200KB）
       ============================================================ */
    function compressImage(file, maxSize = 1024, quality = 0.85) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                reject(new Error('NOT_AN_IMAGE'));
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;
                    if (width > height && width > maxSize) {
                        height = Math.round(height * maxSize / width);
                        width = maxSize;
                    } else if (height > maxSize) {
                        width = Math.round(width * maxSize / height);
                        height = maxSize;
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    // Convert to JPEG base64 (strip data: prefix)
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    const base64 = dataUrl.split(',')[1];
                    resolve(base64);
                };
                img.onerror = () => reject(new Error('IMAGE_LOAD_FAILED'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('FILE_READ_FAILED'));
            reader.readAsDataURL(file);
        });
    }

    /* ============================================================
       嘗試呼叫 Cloudflare Worker AI Vision API
       失敗時回傳 null（caller 負責降級處理）
       ============================================================ */
    const AI_WORKER_URL = 'https://pest-vision-worker.cedars5282.workers.dev/';
    const AI_WORKER_TIMEOUT_MS = 20000; // 20 秒上限

    async function callCloudflareWorkerAI(file) {
        // 1. 客戶端先壓縮
        const base64String = await compressImage(file, 1024, 0.85);

        // 2. 呼叫 Worker（帶 AbortController 逾時）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), AI_WORKER_TIMEOUT_MS);
        try {
            const response = await fetch(AI_WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64String }),
                signal: controller.signal
            });
            if (!response.ok) {
                const errText = await response.text().catch(() => '');
                console.warn('AI Worker 回應非 2xx:', response.status, errText);
                return null;
            }
            const resData = await response.json();

            // 3. 解析 Worker AI 文字輸出
            let rawText = typeof resData === 'string' ? resData : (resData.response || resData.text || JSON.stringify(resData));
            let aiResult = {};
            try {
                const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                if (jsonMatch) aiResult = JSON.parse(jsonMatch[0]);
                if (!aiResult.pest) {
                    // Try to detect pest name from plain text
                    for (const key of Object.keys(STRATEGY_MAP)) {
                        if (key !== '其他' && rawText.includes(key)) {
                            aiResult.pest = key;
                            break;
                        }
                    }
                }
            } catch (e) {
                console.warn('AI JSON 解析失敗，嘗試文字匹配', e);
            }

            if (!aiResult.pest) {
                console.warn('AI 未識別出害蟲種類');
                return null;
            }

            const fallback = STRATEGY_MAP[aiResult.pest] || STRATEGY_MAP['其他'];
            return {
                pest: aiResult.pest || fallback.pest,
                confidence: aiResult.confidence || fallback.confidence,
                risk: aiResult.risk || fallback.risk,
                nest: aiResult.nest || fallback.nest,
                strategy: aiResult.strategy || fallback.strategy,
                price: aiResult.price || fallback.price,
                source: 'ai'
            };
        } catch (err) {
            if (err.name === 'AbortError') {
                console.warn('AI Worker 逾時（>20s）');
            } else {
                console.warn('AI Worker 呼叫失敗:', err.message);
            }
            return null;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /* ============================================================
       降級流程：用戶選擇害蟲類型 → 本地策略庫分析
       ============================================================ */
    function showPestSelector(opts, file, onPestSelected) {
        const $ = (id) => document.getElementById(id);
        const result = $(opts.result);
        if (!result) return;

        // 建立害蟲選擇 UI（注入到結果區上方）
        let selectorDiv = $(opts.result + '-selector');
        if (!selectorDiv) {
            selectorDiv = document.createElement('div');
            selectorDiv.id = opts.result + '-selector';
            selectorDiv.style.cssText = 'background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px;margin:10px 0;';
            result.parentNode.insertBefore(selectorDiv, result);
        }
        const pestOptions = Object.keys(STRATEGY_MAP).filter(k => k !== '其他');
        selectorDiv.innerHTML =
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">' +
                '<i class="fas fa-circle-info" style="color:#d97706;"></i>' +
                '<strong style="color:#92400e;font-size:.92rem;">AI 辨識暫時無法使用，請手動選擇害蟲類型</strong>' +
            '</div>' +
            '<p style="font-size:.85rem;color:#78350f;margin-bottom:10px;">已為你預備本地策略庫分析，選擇即可獲得完整報告 + WhatsApp 即時預約。</p>' +
            '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
                pestOptions.map(p => '<button type="button" class="js-pest-pick" data-pest="' + p + '" style="padding:6px 14px;border-radius:18px;border:1px solid #d97706;background:#fff;color:#92400e;font-size:.85rem;cursor:pointer;font-family:inherit;">' + p + '</button>').join('') +
            '</div>';

        selectorDiv.querySelectorAll('.js-pest-pick').forEach(btn => {
            btn.addEventListener('click', () => {
                const pestKey = btn.getAttribute('data-pest');
                selectorDiv.style.display = 'none';
                const data = STRATEGY_MAP[pestKey];
                data.source = 'manual';
                onPestSelected(data);
            });
        });
    }

    /* ============================================================
       Initialize AI diagnosis widget
       Used by homepage (/), /ai/, and /quote/
       ============================================================ */
    window.initAIDiagnosis = function (opts) {
        const $ = (id) => document.getElementById(id);
        const input = $(opts.input);
        if (!input) return;

        const area = $(opts.area);
        const states = {
            upload: $(opts.upload),
            analyzing: $(opts.analyzing),
            result: $(opts.result)
        };
        const previewImg = $(opts.preview);
        const resultImg = $(opts.resultImg);
        const reuploadBtn = $(opts.reupload);

        const showState = (s) => {
            Object.values(states).forEach(el => el && el.classList.remove('active'));
            if (states[s]) states[s].classList.add('active');
        };

        const fillResult = (data) => {
            if ($(opts.pest)) $(opts.pest).textContent = data.pest + (data.source === 'manual' ? '（本地分析）' : '');
            if ($(opts.confidence)) $(opts.confidence).textContent = data.confidence + '% AI 信心';
            if ($(opts.risk)) $(opts.risk).textContent = data.risk;
            if ($(opts.nest)) $(opts.nest).textContent = data.nest;
            if ($(opts.strategy)) $(opts.strategy).textContent = data.strategy;
            if ($(opts.price)) $(opts.price).textContent = data.price;

            const wa = $(opts.wa);
            if (wa) {
                const sourceLabel = data.source === 'manual' ? '本地策略庫' : 'AI 視覺';
                const msg = `你好，我已用 AI 害蟲診斷器分析相片：\n• AI 識別：${data.pest}（信心 ${data.confidence}%）\n• 風險等級：${data.risk}\n• 潛在暗巢：${data.nest}\n• 建議策略：${data.strategy}\n• 參考估價：${data.price}\n• 分析方式：${sourceLabel}\n\n（我理解 AI 診斷結果僅供參考，實際方案以現場師傅評估為準）\n我想預約師傅上門跟進，謝謝！`;
                wa.href = `https://wa.me/85252821552?text=${encodeURIComponent(msg)}`;
            }
            showState('result');
        };

        const handleFile = async (file) => {
            if (!file) return;
            if (file.size > 8 * 1024 * 1024) {
                alert('相片大小不能超過 8MB，請重新選擇。');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('請上傳圖片格式（JPG、PNG、WebP）。');
                return;
            }

            // 預覽圖片
            const reader = new FileReader();
            reader.onload = (e) => {
                if (previewImg) previewImg.src = e.target.result;
                if (resultImg) resultImg.src = e.target.result;
                showState('analyzing');
            };
            reader.readAsDataURL(file);

            // 嘗試呼叫 AI Worker（會自動壓縮 + 20s 逾時）
            const aiData = await callCloudflareWorkerAI(file);

            if (aiData) {
                // AI 成功 → 直接填入結果
                fillResult(aiData);
            } else {
                // AI 失敗 → 降級：顯示害蟲選擇器，由用戶手動選擇
                showState('upload'); // 先回到 upload state
                showPestSelector(opts, file, fillResult);
            }
        };

        input.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
        });

        // Drag & drop 支援
        if (area) {
            ['dragenter', 'dragover'].forEach(evt => {
                area.addEventListener(evt, (e) => { e.preventDefault(); area.classList.add('dragover'); });
            });
            ['dragleave', 'drop'].forEach(evt => {
                area.addEventListener(evt, (e) => { e.preventDefault(); area.classList.remove('dragover'); });
            });
            area.addEventListener('drop', (e) => {
                if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
            });
        }

        if (reuploadBtn) {
            reuploadBtn.addEventListener('click', () => {
                input.value = '';
                // Also hide any manual selector that may be visible
                const sel = document.getElementById(opts.result + '-selector');
                if (sel) sel.style.display = 'none';
                showState('upload');
            });
        }
    };

    /* ---------- Init on DOM ready ---------- */
    document.addEventListener('DOMContentLoaded', () => {
        initMenu();
        initYear();
        initFloatingAI();
    });
})();
