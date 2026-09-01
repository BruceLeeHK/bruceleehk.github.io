/* ============================================================
   bruceleehk.com — Language Switcher Module (v2.0 — 2026-08-22)
   Architecture: Dual-site (Pure ZH-HK + Pure EN)
   - Chinese site at root / (default)
   - English site at /en/
   - Header toggle button: "繁 | EN" (per reference screenshot)
   - Active language = dark filled button; inactive = plain text link
   - AI 師妹 / pest-vision-worker remain pure Traditional Chinese
     (English site shows notice + English WhatsApp link)
   ============================================================ */

(function () {
  'use strict';

  /* Detect current language from URL path */
  function getCurrentLang() {
    const path = window.location.pathname;
    // English pages live under /en/...
    if (path === '/en/' || path.startsWith('/en/') || path === '/en' || path === '/en.html') {
      return 'en';
    }
    return 'zh';  // default = Traditional Chinese (root)
  }

  /* Compute the counterpart URL on the other site */
  function getCounterpartURL(currentLang) {
    const path = window.location.pathname;
    const fileName = path.split('/').pop() || 'index.html';

    if (currentLang === 'zh') {
      // From Chinese → English: prefix /en/
      // Examples: /services/ → /en/services/, /info/blog-10/ → /en/info/blog-10/, / → /en/
      let cleanPath = path.replace(/\/+$/, '');
      if (cleanPath === '') {
        return '/en/';
      }
      // If ends with index.html, strip it for cleaner URL
      if (cleanPath.endsWith('/index.html')) {
        cleanPath = cleanPath.replace('/index.html', '');
      } else if (cleanPath.endsWith('index.html')) {
        cleanPath = cleanPath.replace('index.html', '');
      }
      // Blog articles: only blog-10 has an English counterpart —
      // fall back to the English Info Hub for all other posts (prevents 404)
      const blogMatch = cleanPath.match(/^\/info\/blog-(\d+)$/);
      if (blogMatch) {
        return parseInt(blogMatch[1], 10) === 10 ? '/en/info/blog-10/' : '/en/info/';
      }
      return '/en' + (cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath) + (cleanPath.endsWith('/') ? '' : '/');
    } else {
      // From English → Chinese: strip /en prefix
      let cleanPath = path.replace(/^\/en\/?/, '/');
      if (cleanPath === '/') return '/';
      // Ensure trailing slash for consistent routing
      if (!cleanPath.endsWith('/')) cleanPath = cleanPath + '/';
      return cleanPath;
    }
  }

  /* Build the toggle button HTML — per screenshot reference */
  function buildToggle(currentLang) {
    const counterpart = getCounterpartURL(currentLang);

    if (currentLang === 'zh') {
      // On Chinese page: 繁 is active, EN links to /en/
      return `
        <div class="lang-switch-wrap" role="group" aria-label="語言切換 Language Switch">
          <span class="lang-switch-current" aria-current="true" title="目前顯示：繁體中文">繁</span>
          <a class="lang-switch-link" href="${counterpart}" hreflang="en" lang="en" title="Switch to English">EN</a>
        </div>
      `.trim();
    } else {
      // On English page: EN is active, 繁 links to root
      return `
        <div class="lang-switch-wrap" role="group" aria-label="Language Switch 語言切換">
          <a class="lang-switch-link" href="${counterpart}" hreflang="zh-HK" lang="zh-HK" title="切換至繁體中文">繁</a>
          <span class="lang-switch-current" aria-current="true" title="Currently: English">EN</span>
        </div>
      `.trim();
    }
  }

  /* Inject the toggle button into the header (right side, before menu-toggle) */
  function injectToggle() {
    if (document.getElementById('lang-switch-container')) return; // already injected

    const header = document.querySelector('.site-header .nav-container') || document.querySelector('header .nav-container');
    if (!header) return;

    const currentLang = getCurrentLang();
    const toggleHTML = buildToggle(currentLang);

    const container = document.createElement('div');
    container.id = 'lang-switch-container';
    container.innerHTML = toggleHTML;

    // Insert before the mobile menu toggle button (if present), else at end
    const menuToggle = header.querySelector('.menu-toggle');
    if (menuToggle) {
      header.insertBefore(container, menuToggle);
    } else {
      header.appendChild(container);
    }
  }

  /* Init */
  function init() {
    injectToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
