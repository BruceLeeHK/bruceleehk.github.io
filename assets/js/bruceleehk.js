/* ============================================================
   bruceleehk.com — Shared JavaScript
   Used by: / (homepage), /ai/, /quote/
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
        '曱甴': { risk: '中 - 高', nest: '廚房罅隙、排水管、電器背後', strategy: '採用「誘敵深入計」：設置智慧誘餌站，系統性引誘處理。', price: 'HK$ 600 - 3,800', confidence: 95 },
        '木蝨': { risk: '高', nest: '床板縫隙、梳化、牆身插座', strategy: '採用「星星之火計」：高溫蒸氣 + 雙重殘留藥劑深層處理。', price: 'HK$ 800 - 5,500', confidence: 93 },
        '老鼠': { risk: '中 - 高', nest: '管道入口、天花夾層、儲物區', strategy: '採用「釜底抽薪計」+ IoT 智慧鼠盒：封堵源頭 + 遠端監測誘捕。', price: 'HK$ 1,000 - 5,800', confidence: 92 },
        '白蟻': { risk: '極高（結構風險）', nest: '木結構內部、牆身、地板下', strategy: '熱成像定位暗巢 + 灌注持效保護劑 + 結構性防治方案。', price: 'HK$ 1,500 - 9,800', confidence: 91 },
        '蚊': { risk: '低 - 中', nest: '積水容器、花盆底碟、冷氣機托盤', strategy: '採用「以逸待勞計」：誘蚊燈 + 生物顆粒阻斷幼蟲孳生。', price: 'HK$ 500 - 3,800', confidence: 90 },
        '其他': { risk: '待評估', nest: '建議專員現場勘察', strategy: '已安排專業師傅親自對照相片，為你提供精準處方。', price: '免費估價', confidence: 80 }
    };

    /**
     * Real AI Vision Call: Cloudflare Worker (Llama-3.2 Vision)
     * 優化：極限壓縮 (500px) + 放寬推論時間 (35秒) 預防 Worker CPU 超時或截斷
     */
    async function callCloudflareWorkerAI(file) {
        // 1. 利用 Canvas 極限壓縮圖片，減輕 Worker 陣列轉換的 CPU 負擔
        const compressedBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxDim = 500; // 降至 500px，保留足夠 AI 辨識特徵即可
                    let width = img.width, height = img.height;

                    if (width > maxDim || height > maxDim) {
                        if (width > height) { 
                            height = Math.round((height * maxDim) / width); 
                            width = maxDim; 
                        } else { 
                            width = Math.round((width * maxDim) / height); 
                            height = maxDim; 
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // 輸出為 JPEG 壓縮 Base64 字串並去除 Header 前綴
                    resolve(canvas.toDataURL('image/jpeg', 0.6).split(',')[1]);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        // 2. 放寬 Fetch 超時保護至 35 秒 (給予 Vision 模型足夠運算時間)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);

        let response;
        try {
            response = await fetch('https://pest-vision-worker.cedars5282.workers.dev/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: compressedBase64 }),
                signal: controller.signal
            });
        } catch (err) {
            if (err.name === 'AbortError') {
                throw new Error('AI 模型推論超時 (已等待35秒)');
            }
            throw new Error('網絡連線異常，請檢查網路狀態');
        } finally {
            clearTimeout(timeoutId);
        }

        if (!response.ok) {
            const errJson = await response.json().catch(() => ({}));
            throw new Error(`Worker 響應異常 [${response.status}]: ${errJson.error || '後端錯誤'}`);
        }

        const resData = await response.json();
        
        // 3. 解析輸出
        let rawText = typeof resData === 'string' ? resData : (resData.response || JSON.stringify(resData));
        let aiResult = {};
        
        try {
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) aiResult = JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.warn('AI 解析降級備用模式');
        }

        // 4. 補充預設值
        const pestName = aiResult.pest || '害蟲';
        const fallback = STRATEGY_MAP[pestName] || STRATEGY_MAP['其他'];

        return {
            pest: aiResult.pest || fallback.pest || '相片害蟲分析',
            confidence: aiResult.confidence || fallback.confidence || 90,
            risk: aiResult.risk || fallback.risk,
            nest: aiResult.nest || fallback.nest,
            strategy: aiResult.strategy || fallback.strategy,
            price: aiResult.price || fallback.price
        };
    }

    /**
     * Initialize an AI diagnosis widget across / (homepage), /ai/, and /quote/
     */
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

        const handleFile = async (file) => {
            if (!file) return;
            if (file.size > 10 * 1024 * 1024) {
                alert('相片大小不能超過 10MB，請重新選擇。');
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

            try {
                // 真正呼叫 Cloudflare Worker Vision API (含自動壓縮與優化)
                const data = await callCloudflareWorkerAI(file);

                // 填入分析結果 DOM
                if ($(opts.pest)) $(opts.pest).textContent = data.pest;
                if ($(opts.confidence)) $(opts.confidence).textContent = data.confidence + '% AI 信心';
                if ($(opts.risk)) $(opts.risk).textContent = data.risk;
                if ($(opts.nest)) $(opts.nest).textContent = data.nest;
                if ($(opts.strategy)) $(opts.strategy).textContent = data.strategy;
                if ($(opts.price)) $(opts.price).textContent = data.price;

                // 生成預約 WhatsApp 訊息連結
                const wa = $(opts.wa);
                if (wa) {
                    const msg = `你好，我已用 AI 害蟲診斷器分析相片：\n• AI 識別：${data.pest}（信心 ${data.confidence}%）\n• 風險等級：${data.risk}\n• 潛在暗巢：${data.nest}\n• 建議策略：${data.strategy}\n• 參考估價：${data.price}\n\n（我理解 AI 診斷結果僅供參考，實際方案以現場師傅評估為準）\n我想預約師傅上門跟進，謝謝！`;
                    wa.href = `https://wa.me/85252821552?text=${encodeURIComponent(msg)}`;
                }

                showState('result');
            } catch (err) {
                console.error('AI 診斷失敗:', err);
                alert('網路連線或 AI 分析逾時，已為你轉由專員免費真人估價。');
                showState('upload');
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