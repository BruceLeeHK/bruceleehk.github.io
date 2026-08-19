/* ============================================================
   bruceleehk.com — Shared JavaScript (v3.2 — 2026-08-19)
   Used by: / (homepage), /ai/, /quote/

   v3.2 優化亮點：
     🔧 AI 視覺識別與 JSON 解析容錯升級：
        - 強化 Cloudflare Worker AI 輸出格式解析（自動剔除 Markdown codeblock）
        - 增強關鍵字救援比對（繁簡體、同義詞自動匹配本地策略庫）
        - 精準移除 Base64 Data URL 標頭，對齊 Worker 接收規格
     🔧 保持防護與降級機制：
        - 客戶端圖片壓縮（最大 1024px / JPEG 0.85）
        - 20 秒 AbortController 逾時保護與本地降級流程
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
        '曱甴':   { pest: '曱甴（蟑螂）', risk: '中 - 高', nest: '廚房罅隙、排水管、電器背後、櫥櫃縫隙', strategy: '採用「誘敵深入計」：設置智慧誘餌站，配合連環殺蟑膠餌，由工蟻帶回巢穴連鎖滅殺。', price: 'HK$ 600 - 3,800', confidence: 95 },
        '蟑螂':   { pest: '曱甴（蟑螂）', risk: '中 - 高', nest: '廚房罅隙、排水管、電器背後、櫥櫃縫隙', strategy: '採用「誘敵深入計」：設置智慧誘餌站，配合連環殺蟑膠餌，由工蟻帶回巢穴連鎖滅殺。', price: 'HK$ 600 - 3,800', confidence: 95 },
        '木蝨':   { pest: '木蝨（床蝨）', risk: '高', nest: '床板縫隙、梳化、牆身插座、床頭櫃罅隙', strategy: '採用「星星之火計」：180°C 高溫蒸氣穿透床褥木縫，配合雙重殘留藥劑深層處理，破壞蟲卵蛋白質結構。', price: 'HK$ 800 - 5,500', confidence: 93 },
        '床蝨':   { pest: '木蝨（床蝨）', risk: '高', nest: '床板縫隙、梳化、牆身插座、床頭櫃罅隙', strategy: '採用「星星之火計」：180°C 高溫蒸氣穿透床褥木縫，配合雙重殘留藥劑深層處理，破壞蟲卵蛋白質結構。', price: 'HK$ 800 - 5,500', confidence: 93 },
        '老鼠':   { pest: '老鼠', risk: '中 - 高', nest: '管道入口、天花夾層、儲物區、冷氣機管道', strategy: '採用「釜底抽薪計」+ IoT 智慧鼠盒：封堵冷氣孔、管道隙縫，配合遠端監測誘捕，雙管齊下徹底清除。', price: 'HK$ 1,000 - 5,800', confidence: 92 },
        '鼠':     { pest: '老鼠', risk: '中 - 高', nest: '管道入口、天花夾層、儲物區、冷氣機管道', strategy: '採用「釜底抽薪計」+ IoT 智慧鼠盒：封堵冷氣孔、管道隙縫，配合遠端監測誘捕，雙管齊下徹底清除。', price: 'HK$ 1,000 - 5,800', confidence: 92 },
        '白蟻':   { pest: '白蟻', risk: '極高（結構風險）', nest: '木結構內部、牆身、地板下、門框', strategy: '採用「擒賊擒王計」：透過白蟻餌站系統，由工蟻將慢效昆蟲生長調節劑帶回巢穴餵食蟻后，達致全巢滅殺。配合熱成像定位暗巢。', price: 'HK$ 1,500 - 9,800', confidence: 91 },
        '蛀木蟲': { pest: '蛀木蟲', risk: '中 - 高', nest: '木傢俬、木地板、門框、木裝飾', strategy: '採用「引蛇出洞計」：以特製引誘劑或深層藥劑注射，誘出隱藏喺木材內部之害蟲。配合微波處理封堵木質孔洞。', price: 'HK$ 1,000 - 4,500', confidence: 90 },
        '蚊':     { pest: '蚊', risk: '低 - 中', nest: '積水容器、花盆底碟、冷氣機托盤、天台去水位', strategy: '採用「以逸待勞計」：超低容量噴霧（ULV）+ 昆蟲生長調節劑（IGR），從源頭阻斷幼蟲孳生。配合誘蚊燈物理防治。', price: 'HK$ 500 - 3,800', confidence: 90 },
        '螞蟻':   { pest: '螞蟻', risk: '低 - 中', nest: '牆身罅隙、地腳線、磁磚縫隙、花盆', strategy: '採用「順手牽羊計」：使用連鎖殺蟲餌劑，由工蟻帶回蟻巢餵食蟻后，徹底殲滅整個蟻巢。', price: 'HK$ 500 - 2,500', confidence: 88 },
        '蜂':     { pest: '蜂類', risk: '中 - 高（過敏者可致命）', nest: '屋簷、露台、樹上、牆身洞穴', strategy: '採用「釜底抽薪計」：專業安全移除蜂巢 + 預防再築巢處理，建議夜晚處理（蜂類歸巢）。', price: 'HK$ 800 - 3,500', confidence: 87 },
        '蜂類':   { pest: '蜂類', risk: '中 - 高（過敏者可致命）', nest: '屋簷、露台、樹上、牆身洞穴', strategy: '採用「釜底抽薪計」：專業安全移除蜂巢 + 預防再築巢處理，建議夜晚處理（蜂類歸巢）。', price: 'HK$ 800 - 3,500', confidence: 87 },
        '蜈蚣':   { pest: '蜈蚣', risk: '中（毒咬劇痛）', nest: '潮濕陰暗處、排水管、牆隙、地腳線', strategy: '採用「圍魏救趙計」：封堵入侵路徑（排水管、牆隙），配合殘留噴劑 + 環境乾燥處理，斷絕入侵源頭。', price: 'HK$ 600 - 2,800', confidence: 86 },
        '衣魚':   { pest: '衣魚', risk: '低（紙張衣物損害）', nest: '潮濕書櫃、衣櫃、牆紙後、儲物箱', strategy: '採用「抽絲剝繭計」：降低環境濕度 + 殘留噴劑 + 物理捕捉，從根本切斷蟲類食物源（霉菌）。', price: 'HK$ 500 - 2,200', confidence: 85 },
        '蜘蛛':   { pest: '蜘蛛', risk: '低（多數無害）', nest: '牆角、陰暗處、天花板、儲物區', strategy: '採用「借刀殺人計」：移除蛛網 + 封堵入侵路徑 + 殘留噴劑。香港極少有毒蜘蛛品種，多數益蟲（捕食蚊蠅）。', price: 'HK$ 400 - 1,800', confidence: 84 },
        '飛蟲':   { pest: '飛蟲（蠓/蛾/蠅）', risk: '低 - 中', nest: '積水、有機物、植物附近', strategy: '採用「聲東擊西計」：物理光源誘捕燈 + ULV 霧化噴灑，從源頭管理清除積水同有機物。', price: 'HK$ 500 - 2,500', confidence: 83 },
        '蟎蟲':   { pest: '蟎蟲（禽蟎/粉蟎）', risk: '中（過敏源）', nest: '潮濕儲物角落、梳化底、冷氣機內部', strategy: '採用「斬草除根計」：極低容量（ULV）霧化噴灑，將除害劑均勻覆蓋至房間每個角落，達到深層除蟎與消毒效果。', price: 'HK$ 800 - 3,200', confidence: 86 },
        '卜泥':   { pest: '卜泥／姬薪蟲', risk: '低', nest: '潮濕牆身、書籍、壁紙後、窗台', strategy: '採用「抽絲剝繭計」：空間防霉殺菌處理 + 抽濕建言，從根本切斷蟲類食物源（牆身霉菌）。', price: 'HK$ 500 - 2,200', confidence: 85 },
        '姬薪蟲': { pest: '卜泥／姬薪蟲', risk: '低', nest: '潮濕牆身、書籍、壁紙後、窗台', strategy: '採用「抽絲剝繭計」：空間防霉殺菌處理 + 抽濕建言，從根本切斷蟲類食物源（牆身霉菌）。', price: 'HK$ 500 - 2,200', confidence: 85 },
        '其他':   { pest: '待專員進一步分析', risk: '待評估', nest: '建議專員現場勘察', strategy: '已安排專業師傅親自對照相片，為你提供精準處方。', price: '免費估價', confidence: 80 }
    };

    /* ---------- 客戶端圖片壓縮 ---------- */
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

    /* ---------- 呼叫 Cloudflare Worker AI Vision API ---------- */
    const AI_WORKER_URL = '[https://pest-vision-worker.cedars5282.workers.dev/](https://pest-vision-worker.cedars5282.workers.dev/)';
    const AI_WORKER_TIMEOUT_MS = 20000;

    async function callCloudflareWorkerAI(file) {
        try {
            const base64String = await compressImage(file, 1024, 0.85);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), AI_WORKER_TIMEOUT_MS);

            const response = await fetch(AI_WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64String }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.warn('AI Worker 回應非 2xx 狀態:', response.status);
                return null;
            }

            const resData = await response.json();
            let rawText = typeof resData === 'string' ? resData : (resData.response || resData.text || JSON.stringify(resData));

            // 過濾 Markdown 標記
            rawText = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();

            let aiResult = {};
            try {
                const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    aiResult = JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
                console.warn('AI 輸出 JSON 解析失敗，嘗試文字匹配:', rawText);
            }

            // 救援機制：嘗試文字內容搜尋害蟲關鍵字
            if (!aiResult.pest) {
                for (const key of Object.keys(STRATEGY_MAP)) {
                    if (key !== '其他' && rawText.includes(key)) {
                        aiResult.pest = key;
                        break;
                    }
                }
            }

            if (!aiResult.pest) {
                console.warn('AI 未能從回應中識別出有效害蟲種類');
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
                console.warn('AI Worker 請求逾時（>20s）');
            } else {
                console.warn('AI Worker 請求失敗:', err.message);
            }
            return null;
        }
    }

    /* ---------- 降級流程：顯示手動選擇器 ---------- */
    function showPestSelector(opts, file, onPestSelected) {
        const $ = (id) => document.getElementById(id);
        const result = $(opts.result);
        if (!result) return;

        const existingSel = $(opts.result + '-selector');
        if (existingSel) existingSel.remove();

        const selectorDiv = document.createElement('div');
        selectorDiv.id = opts.result + '-selector';
        selectorDiv.style.cssText = 'background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px;margin:10px 0;';
        result.parentNode.insertBefore(selectorDiv, result);

        const pestOptions = ['曱甴', '木蝨', '老鼠', '白蟻', '蛀木蟲', '蚊', '螞蟻', '蜂', '蜈蚣', '衣魚', '蜘蛛', '飛蟲', '蟎蟲', '卜泥'];
        selectorDiv.innerHTML =
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">' +
                '<i class="fas fa-circle-info" style="color:#d97706;"></i>' +
                '<strong style="color:#92400e;font-size:.92rem;">AI 辨識暫時無法使用，請手動選擇害蟲類型</strong>' +
            '</div>' +
            '<p style="font-size:.85rem;color:#78350f;margin-bottom:12px;">已為你預備本地策略庫分析（含三十六計對照），選擇即可獲得完整報告 + WhatsApp 即時預約。</p>' +
            '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
                pestOptions.map(p => {
                    const data = STRATEGY_MAP[p];
                    if (!data) return '';
                    return '<button type="button" class="js-pest-pick" data-pest="' + p + '" style="padding:8px 14px;border-radius:18px;border:1px solid #d97706;background:#fff;color:#92400e;font-size:.85rem;cursor:pointer;font-family:inherit;transition:all .2s;">' + data.pest + '</button>';
                }).join('') +
            '</div>';

        selectorDiv.querySelectorAll('.js-pest-pick').forEach(btn => {
            btn.addEventListener('click', () => {
                const pestKey = btn.getAttribute('data-pest');
                selectorDiv.style.display = 'none';
                const data = STRATEGY_MAP[pestKey];
                if (data) {
                    data.source = 'manual';
                    onPestSelected(data);
                }
            });
        });
    }

    /* ---------- 初始化 AI 診斷小工具 ---------- */
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
            if ($(opts.pest)) $(opts.pest).textContent = data.pest + (data.source === 'manual' ? '（本地分析）' : (data.source === 'ai' ? '（AI 初步辨識）' : ''));
            if ($(opts.confidence)) $(opts.confidence).textContent = data.confidence + '% AI 信心';
            if ($(opts.risk)) $(opts.risk).textContent = data.risk;
            if ($(opts.nest)) $(opts.nest).textContent = data.nest;
            if ($(opts.strategy)) $(opts.strategy).textContent = data.strategy;
            if ($(opts.price)) $(opts.price).textContent = data.price;

            const resultEl = $(opts.result);
            if (resultEl) {
                const existingCorrector = resultEl.querySelector('.ai-manual-corrector');
                if (existingCorrector) existingCorrector.remove();

                if (data.source === 'ai') {
                    const corrector = document.createElement('div');
                    corrector.className = 'ai-manual-corrector';
                    corrector.style.cssText = 'background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 14px;margin-top:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;';
                    const label = document.createElement('span');
                    label.style.cssText = 'font-size:0.82rem;color:#92400e;font-weight:700;flex-shrink:0;';
                    label.innerHTML = '<i class="fas fa-circle-info" style="margin-right:4px;"></i>辨識唔啱？手動修正品種：';
                    const select = document.createElement('select');
                    select.style.cssText = 'flex:1;min-width:140px;padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.88rem;font-family:inherit;background:#fff;color:#1e293b;';
                    
                    const keepOption = document.createElement('option');
                    keepOption.value = '';
                    keepOption.textContent = '— 保持 AI 結果 —';
                    select.appendChild(keepOption);

                    Object.keys(STRATEGY_MAP).filter(k => k !== '其他').forEach(key => {
                        const opt = document.createElement('option');
                        opt.value = key;
                        opt.textContent = STRATEGY_MAP[key].pest;
                        select.appendChild(opt);
                    });
                    select.addEventListener('change', function() {
                        if (!this.value) return;
                        const correctedData = STRATEGY_MAP[this.value];
                        if (correctedData) {
                            correctedData.source = 'manual';
                            fillResult(correctedData);
                        }
                    });
                    corrector.appendChild(label);
                    corrector.appendChild(select);
                    resultEl.appendChild(corrector);
                }
            }

            const wa = $(opts.wa);
            if (wa) {
                const sourceLabel = data.source === 'manual' ? '本地策略庫（用戶修正）' : 'AI 視覺';
                const msg = `你好，我已用 AI 害蟲診斷器分析相片：\n• AI 識別：${data.pest}（信心 ${data.confidence}%）\n• 風險等級：${data.risk}\n• 潛在暗巢：${data.nest}\n• 建議策略：${data.strategy}\n• 參考估價：${data.price}\n• 分析方式：${sourceLabel}\n\n（我理解 AI 診斷結果僅供參考，實際方案以現場師傅評估為準）\n我想預約師傅上門跟進，謝謝！`;
                wa.href = `[https://wa.me/85252821552?text=$](https://wa.me/85252821552?text=$){encodeURIComponent(msg)}`;
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

            const reader = new FileReader();
            reader.onload = (e) => {
                if (previewImg) previewImg.src = e.target.result;
                if (resultImg) resultImg.src = e.target.result;
                showState('analyzing');
            };
            reader.readAsDataURL(file);

            const aiData = await callCloudflareWorkerAI(file);

            if (aiData) {
                fillResult(aiData);
            } else {
                showState('upload');
                showPestSelector(opts, file, fillResult);
            }
        };

        input.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
        });

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