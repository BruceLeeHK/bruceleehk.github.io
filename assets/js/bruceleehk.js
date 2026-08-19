/* ============================================================
   bruceleehk.com — Shared JavaScript (v3.5 — 2026-08-19)
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

    /* ---------- Floating AI Assistant ---------- */
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
    }

    /* ---------- 本地策略對照資料庫 ---------- */
    const STRATEGY_MAP = {
        '曱甴': { pest: '曱甴（蟑螂）', risk: '高 - 具極高繁殖與擴散風險', nest: '廚房星盆底水管罅隙、雪櫃壓縮機底、櫥櫃縫隙', strategy: '採用「誘敵深入計」：點施高效連鎖殺蟑膠餌，由工蟻帶回巢穴連鎖滅殺。', price: 'HK$ 600 - 3,800', confidence: 95 },
        '德國曱甴': { pest: '德國曱甴', risk: '極高 - 廚房與餐廳主要蟲患', nest: '微波爐、雪櫃膠邊、電器內部、磁磚縫隙', strategy: '採用「連環計」：定點注射膠餌，配合昆蟲生長調節劑（IGR）阻斷蛻皮。', price: 'HK$ 800 - 3,500', confidence: 96 },
        '美國曱甴': { pest: '美國曱甴', risk: '高 - 經天井及污水管入侵', nest: '排水口、天井、沙井位、後巷管道', strategy: '採用「關門打狗計」：封堵渠口與牆縫，噴灑持久性殘留劑阻斷通道。', price: 'HK$ 700 - 3,200', confidence: 94 },
        '木蝨': { pest: '木蝨（床蝨）', risk: '極高 - 嚴重影響睡眠與皮膚過敏', nest: '床板木框接駁位、梳化縫隙、牆身插座、床頭櫃暗角', strategy: '採用「星星之火計」：180°C 高溫蒸氣深層處理破壞蝨卵，配合雙重殘留藥劑。', price: 'HK$ 800 - 5,500', confidence: 93 },
        '床蝨': { pest: '木蝨（床蝨）', risk: '極高 - 嚴重影響睡眠與皮膚過敏', nest: '床板木框接駁位、梳化縫隙、牆身插座、床頭櫃暗角', strategy: '採用「星星之火計」：180°C 高溫蒸氣深層處理破壞蝨卵，配合雙重殘留藥劑。', price: 'HK$ 800 - 5,500', confidence: 93 },
        '老鼠': { pest: '老鼠', risk: '高 - 破壞電線結構與傳播病菌', nest: '假天花夾層、冷氣機管道孔、廚房櫃底暗角', strategy: '採用「釜底抽薪計」+ IoT 智慧鼠盒：精準封堵老鼠窿，配合紅外線遠端誘捕。', price: 'HK$ 1,000 - 5,800', confidence: 92 },
        '白蟻': { pest: '白蟻', risk: '極高 - 威脅木結構與裝修安全', nest: '木門框內部、木地板下、牆身暗角、裝修木傢俬', strategy: '採用「擒賊擒王計」：熱成像定位暗巢，安裝藥餌站由工蟻傳遞滅絕蟻后。', price: 'HK$ 1,500 - 9,800', confidence: 91 },
        '蚊': { pest: '蚊', risk: '中 - 傳播登革熱風險', nest: '花盆底碟、天台去水位、露台積水容器', strategy: '採用「以逸待勞計」：生物顆粒阻斷幼蟲（孑孓）孳生，配合 ULV 超低容量噴霧。', price: 'HK$ 500 - 3,800', confidence: 90 },
        '螞蟻': { pest: '螞蟻', risk: '中 - 局部滋生尋找食物', nest: '牆身罅隙、窗台縫隙、花盆泥土', strategy: '採用「順手牽羊計」：連鎖殺蟲餌劑，由工蟻帶回巢穴餵食蟻后徹底滅巢。', price: 'HK$ 500 - 2,500', confidence: 88 },
        '卜泥': { pest: '卜泥／姬薪蟲', risk: '低 - 潮濕環境指標蟲患', nest: '潮濕牆身、天花角位、壁紙後、浴室外牆', strategy: '採用「抽絲剝繭計」：空間防霉殺菌處理 + 抽濕建言，切斷食物源（霉菌）。', price: 'HK$ 500 - 2,200', confidence: 85 },
        '其他': { pest: '待專員現場評估', risk: '待評估', nest: '建議專員現場勘察', strategy: '已安排專業師傅親自對照相片，為你提供精準處方。', price: '免費估價', confidence: 80 }
    };

    /* ---------- 客戶端圖片壓縮 ---------- */
    function compressImage(file, maxSize = 1024, quality = 0.85) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
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
                    resolve(dataUrl.split(',')[1]);
                };
                img.onerror = () => reject(new Error('IMAGE_LOAD_FAILED'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('FILE_READ_FAILED'));
            reader.readAsDataURL(file);
        });
    }

    /* ---------- 呼叫 Cloudflare Worker AI ---------- */
    const AI_WORKER_URL = 'https://pest-vision-worker.cedars5282.workers.dev/';

    async function callCloudflareWorkerAI(file) {
        try {
            const base64String = await compressImage(file, 1024, 0.85);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 22000);

            const response = await fetch(AI_WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64String }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) return null;
            const resData = await response.json();

            let rawText = typeof resData === 'string' ? resData : (resData.response || resData.text || JSON.stringify(resData));
            let parsed = {};
            try {
                const match = rawText.match(/\{[\s\S]*\}/);
                if (match) parsed = JSON.parse(match[0]);
            } catch (e) {
                console.warn('AI JSON 解析失敗，改採關鍵字比對');
            }

            // 提取害蟲名稱
            let pestName = parsed.pest || '';
            if (!pestName) {
                for (const key of Object.keys(STRATEGY_MAP)) {
                    if (key !== '其他' && rawText.includes(key)) {
                        pestName = key;
                        break;
                    }
                }
            }

            if (!pestName) return null;

            const fallback = STRATEGY_MAP[pestName] || STRATEGY_MAP['其他'];
            return {
                pest: pestName || fallback.pest,
                confidence: parsed.confidence || fallback.confidence,
                risk: parsed.risk || fallback.risk,
                nest: parsed.nest || fallback.nest,
                strategy: parsed.strategy || fallback.strategy,
                price: parsed.price || fallback.price,
                source: 'ai'
            };
        } catch (err) {
            console.warn('AI 請求失敗:', err);
            return null;
        }
    }

    /* ---------- 初始化 AI 診斷模組 ---------- */
    window.initAIDiagnosis = function (opts) {
        const $ = (id) => id ? document.getElementById(id) : null;
        const input = $(opts.input);
        if (!input) return;

        const area = $(opts.area);
        const states = {
            upload: $(opts.upload),
            analyzing: $(opts.analyzing),
            result: $(opts.result)
        };
        const resultImg = $(opts.resultImg);
        const reuploadBtn = $(opts.reupload);

        const showState = (s) => {
            Object.values(states).forEach(el => el && el.classList.remove('active'));
            if (states[s]) states[s].classList.add('active');
        };

        const fillResult = (data) => {
            if ($(opts.pest)) $(opts.pest).textContent = data.pest;
            if ($(opts.confidence)) $(opts.confidence).textContent = data.confidence + '% AI 信心';
            if ($(opts.risk)) $(opts.risk).textContent = data.risk;
            if ($(opts.nest)) $(opts.nest).textContent = data.nest;
            if ($(opts.strategy)) $(opts.strategy).textContent = data.strategy;
            if ($(opts.price)) $(opts.price).textContent = data.price;

            const wa = $(opts.wa);
            if (wa) {
                const msg = `你好，我已用 AI 害蟲診斷器分析相片：\n• 害蟲種類：${data.pest}\n• 風險等級：${data.risk}\n• 暗巢位置：${data.nest}\n• 建議策略：${data.strategy}\n• 參考估價：${data.price}\n\n我想預約專員上門跟進，謝謝！`;
                wa.href = `https://wa.me/85252821552?text=${encodeURIComponent(msg)}`;
            }
            showState('result');
        };

        const handleFile = async (file) => {
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                if (resultImg) resultImg.src = e.target.result;
                showState('analyzing');
            };
            reader.readAsDataURL(file);

            const aiData = await callCloudflareWorkerAI(file);
            if (aiData) {
                fillResult(aiData);
            } else {
                // 降級處理：若 AI 服務無回應，預設提供通用分析
                const fallbackData = Object.assign({}, STRATEGY_MAP['曱甴'], { source: 'fallback' });
                fillResult(fallbackData);
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
                showState('upload');
            });
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        initMenu();
        initYear();
        initFloatingAI();
    });
})();