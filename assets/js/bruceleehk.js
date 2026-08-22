/* ============================================================
   bruceleehk.com — Shared JavaScript (Optimized v5.0 — 2026-08-22)
   Used by: All pages
   New in v5.0:
   - Integrated i18n.js (bilingual HK Chinese + English toggle)
   - Fixed menu-toggle icon swap (was 'fas' instead of 'fa-solid')
   - Added ESC key + outside-click to close mobile menu
   - Added reduced-motion respect for animations
   - Hero quick-quote form now respects current language when composing WhatsApp message
   Note: AI 害蟲診斷邏輯由各頁面底部 Script 串接 Cloudflare Vision + Dify
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
            if (icon) icon.className = 'fa-solid fa-bars';
        };
        const open = () => {
            nav.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
            const icon = toggle.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-xmark';
        };

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
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

        // 按 ESC 關閉彈窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.classList.contains('open')) {
                popup.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ---------- 防錯機制：覆蓋舊版 AI 函數 ---------- */
    window.initAIDiagnosis = function() {
        console.log('💡 AI Diagnosis v5.0 — handled by page-level script.');
    };

    /* ---------- 共用：取當前語言模式 (供各頁面 inline script 使用) ---------- */
    window.__i18n__ = window.__i18n__ || {};
    window.__i18n__.getLang = function() {
        return document.documentElement.getAttribute('data-lang') || 'bi';
    };
    window.__i18n__.isChineseOnly = function() {
        return window.__i18n__.getLang() === 'zh';
    };

    /* ---------- 網頁 DOM 載入後統一執行 ---------- */
    document.addEventListener('DOMContentLoaded', () => {
        initMenu();
        initYear();
        initFloatingAI();
    });
})();
