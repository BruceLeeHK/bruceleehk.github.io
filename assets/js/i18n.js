/* ============================================================
   bruceleehk.com — Bilingual i18n Module (v1.0 — 2026-08-22)
   Hong Kong Traditional Chinese (primary) + English (supplementary)

   Features:
   1. Inline bilingual subtitles — both languages visible by default
   2. Language toggle button — switch between:
      - "bi"  : Bilingual mode (Chinese + English subtitles shown)
      - "zh"  : Chinese-only mode (English subtitles hidden)
   3. Preference persisted in localStorage (key: site_lang)
   4. Updates <html lang="..."> for accessibility & SEO
   5. Zero external dependencies, pure vanilla JS

   Usage:
   - Add class="en-sub" to any inline English subtitle (always visible in 'bi' mode)
   - Add class="en-only" to any English-only element (hidden in 'zh' mode)
   - Add the toggle button (see initLanguageToggle below) — usually injected by bruceleehk.js
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'bruceleehk_lang';
  const DEFAULT_LANG = 'bi'; // 'bi' = bilingual, 'zh' = Chinese-only

  function applyLang(mode) {
    const html = document.documentElement;
    if (mode === 'zh') {
      html.setAttribute('lang', 'zh-HK');
      html.setAttribute('data-lang', 'zh');
    } else {
      // bilingual: keep primary lang as zh-HK so search engines see the primary language
      html.setAttribute('lang', 'zh-HK');
      html.setAttribute('data-lang', 'bi');
    }
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}

    // Update toggle button label
    const toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) {
      const label = toggleBtn.querySelector('.lang-label');
      const icon = toggleBtn.querySelector('.lang-icon');
      if (mode === 'zh') {
        if (label) label.textContent = 'EN';
        if (icon) icon.className = 'lang-icon fa-solid fa-globe';
        toggleBtn.setAttribute('aria-pressed', 'false');
        toggleBtn.setAttribute('title', 'Switch to Bilingual Mode / 切換至雙語模式');
      } else {
        if (label) label.textContent = '中';
        if (icon) icon.className = 'lang-icon fa-solid fa-language';
        toggleBtn.setAttribute('aria-pressed', 'true');
        toggleBtn.setAttribute('title', '切換至純中文模式 / Switch to Chinese-only Mode');
      }
    }
  }

  function toggleLang() {
    const current = document.documentElement.getAttribute('data-lang') || DEFAULT_LANG;
    applyLang(current === 'zh' ? 'bi' : 'zh');
  }

  function getInitialLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'zh' || saved === 'bi') return saved;
    } catch (e) {}
    return DEFAULT_LANG;
  }

  // Inject language toggle button into header (after nav)
  function injectToggleButton() {
    if (document.getElementById('lang-toggle')) return;
    const header = document.querySelector('.site-header .nav-container');
    if (!header) return;

    const btn = document.createElement('button');
    btn.id = 'lang-toggle';
    btn.type = 'button';
    btn.className = 'lang-toggle-btn';
    btn.setAttribute('aria-label', '切換語言 / Switch Language');
    btn.setAttribute('aria-pressed', 'true');
    btn.innerHTML = '<i class="lang-icon fa-solid fa-language" aria-hidden="true"></i><span class="lang-label">中</span>';

    btn.addEventListener('click', toggleLang);
    // Insert before menu toggle (or at end if no menu toggle)
    const menuToggle = header.querySelector('.menu-toggle');
    if (menuToggle) {
      header.insertBefore(btn, menuToggle);
    } else {
      header.appendChild(btn);
    }
  }

  function init() {
    injectToggleButton();
    applyLang(getInitialLang());
  }

  // Run as soon as DOM is ready (or now if already loaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.__i18n__ = { applyLang, toggleLang, getInitialLang };
})();
