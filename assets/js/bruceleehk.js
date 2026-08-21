/* ============================================================
   bruceleehk.com — Shared JavaScript (Optimized v4.0)
   Used by: All pages
   Note: AI 害蟲診斷邏輯已全面升級，並遷移至各頁面底部的 Script，
         直接串接 Cloudflare Vision API 與 Dify 系統。
   ============================================================ */

(function () {
    'use strict';

    /* ---------- Mobile Menu Toggle (手機版選單控制) ---------- */
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
        
        // 點擊選單外區域自動關閉
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') &&
                !nav.contains(e.target) && !toggle.contains(e.target)) close();
        });
        
        // 按 ESC 鍵關閉
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
        
        // 視窗放大時自動復原選單狀態
        let t;
        window.addEventListener('resize', () => {
            clearTimeout(t);
            t = setTimeout(() => { if (window.innerWidth > 768) close(); }, 100);
        });
    }

    /* ---------- Dynamic Year (版權年份自動更新) ---------- */
    function initYear() {
        const el = document.getElementById('current-year');
        if (el) el.textContent = new Date().getFullYear();
    }

    /* ---------- Floating AI Assistant (右下角滅蟲師妹視窗控制) ---------- */
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

    /* ---------- 防錯機制：覆蓋舊版 AI 函數 ---------- */
    // 如果有其他尚未更新的舊頁面呼叫了舊版函數，這行能防止瀏覽器報錯 (Console Error)
    window.initAIDiagnosis = function() {
        console.log('💡 AI Diagnosis has been upgraded to v4.0 and handled by page-level script.');
    };

    /* ---------- 網頁 DOM 載入後統一執行 ---------- */
    document.addEventListener('DOMContentLoaded', () => {
        initMenu();
        initYear();
        initFloatingAI();
    });
})();