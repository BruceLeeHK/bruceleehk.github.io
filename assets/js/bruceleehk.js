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

    /* ---------- AI Image Diagnosis (shared logic) ---------- */
    // Strategy & price lookup table — used by homepage card AND /ai/ page
    const STRATEGY_MAP = {
        '曱甴': {
            risk: '中 - 高',
            nest: '廚房罅隙、排水管、電器背後',
            strategy: '採用「誘敵深入計」：於排水口及裂縫設置智慧誘餌站，連環引誘滅巢。',
            price: 'HK$ 600 - 3,800',
            confidence: 96
        },
        '木蝨': {
            risk: '高',
            nest: '床板縫隙、梳化、牆身插座',
            strategy: '採用「星星之火計」：高溫蒸氣 + 雙重殘留藥劑深層封殺蝨卵。',
            price: 'HK$ 800 - 5,500',
            confidence: 94
        },
        '老鼠': {
            risk: '中 - 高',
            nest: '管道入口、天花夾層、儲物區',
            strategy: '採用「釜底抽薪計」+ IoT 智慧鼠盒：封堵源頭 + 24 小時遠端監測誘捕。',
            price: 'HK$ 1,000 - 5,800',
            confidence: 92
        },
        '白蟻': {
            risk: '極高（結構風險）',
            nest: '木結構內部、牆身、地板下',
            strategy: '熱成像定位暗巢 + 灌注持效保護劑 + 結構性防治 1 年保用。',
            price: 'HK$ 1,500 - 9,800',
            confidence: 91
        },
        '蚊': {
            risk: '低 - 中',
            nest: '積水容器、花盆底碟、冷氣機托盤',
            strategy: '採用「以逸待勞計」：誘蚊燈 + 生物顆粒阻斷幼蟲孳生。',
            price: 'HK$ 500 - 3,800',
            confidence: 90
        },
        '其他': {
            risk: '待評估',
            nest: '建議專員上門勘察',
            strategy: 'AI 系統未能 100% 確定，建議上載多張不同角度相片或上門勘察由師傅診斷。',
            price: '免費評估',
            confidence: 70
        }
    };

    /**
     * Pseudo-AI heuristic: filename keyword + average image color → pest type guess.
     * Production: replace with fetch() to Cloudflare Worker → GPT-4o-mini / Gemini 1.5 Flash.
     * @param {File} file
     * @returns {Promise<{pest: string}>}
     */
    function guessPestType(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const size = 32;
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, size, size);
                    const data = ctx.getImageData(0, 0, size, size).data;
                    let r = 0, g = 0, b = 0, count = 0;
                    for (let i = 0; i < data.length; i += 4) {
                        r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
                    }
                    r /= count; g /= count; b /= count;
                    const filename = (file.name || '').toLowerCase();
                    let pest = '其他';
                    if (filename.includes('roach') || filename.includes('cockroach') || filename.includes('曱甴')) pest = '曱甴';
                    else if (filename.includes('bedbug') || filename.includes('bed') || filename.includes('木蝨') || filename.includes('床蝨')) pest = '木蝨';
                    else if (filename.includes('rat') || filename.includes('mouse') || filename.includes('鼠')) pest = '老鼠';
                    else if (filename.includes('termite') || filename.includes('ant') || filename.includes('白蟻')) pest = '白蟻';
                    else if (filename.includes('mosquito') || filename.includes('蚊')) pest = '蚊';
                    else {
                        if (r > 80 && r < 180 && g < r && b < r && (r - b) > 20) pest = '曱甴';
                        else if (r > 100 && g > 80 && b < 80) pest = '木蝨';
                        else if (r > 100 && g > 100 && b > 80 && r < 200) pest = '白蟻';
                        else if (Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && r < 150) pest = '老鼠';
                        else pest = '蚊';
                    }
                    resolve({ pest });
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Initialize an AI diagnosis widget.
     * @param {Object} opts - element IDs: { input, area, upload, analyzing, result, preview, resultImg, pest, confidence, risk, nest, strategy, price, wa, reupload }
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
            if (file.size > 5 * 1024 * 1024) {
                alert('相片大小不能超過 5MB，請重新選擇。');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                if (previewImg) previewImg.src = e.target.result;
                if (resultImg) resultImg.src = e.target.result;
                showState('analyzing');
            };
            reader.readAsDataURL(file);

            const guess = await guessPestType(file);
            await new Promise(r => setTimeout(r, 1800));

            const data = STRATEGY_MAP[guess.pest] || STRATEGY_MAP['其他'];
            if ($(opts.pest)) $(opts.pest).textContent = guess.pest;
            if ($(opts.confidence)) $(opts.confidence).textContent = data.confidence + '% AI 信心';
            if ($(opts.risk)) $(opts.risk).textContent = data.risk;
            if ($(opts.nest)) $(opts.nest).textContent = data.nest;
            if ($(opts.strategy)) $(opts.strategy).textContent = data.strategy;
            if ($(opts.price)) $(opts.price).textContent = data.price;

            const wa = $(opts.wa);
            if (wa) {
                const msg = `你好，我已用 AI 害蟲診斷器分析相片：\n• AI 識別：${guess.pest}（信心 ${data.confidence}%）\n• 風險等級：${data.risk}\n• 潛在暗巢：${data.nest}\n• 建議策略：${data.strategy}\n• 參考估價：${data.price}\n我想預約師傅上門跟進，謝謝！`;
                wa.href = `https://wa.me/85252821552?text=${encodeURIComponent(msg)}`;
            }
            showState('result');
        };

        input.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
        });

        // Drag & drop
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
