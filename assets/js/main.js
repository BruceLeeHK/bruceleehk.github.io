/* ============================================
   滅蟲師傅 — Main JavaScript
   www.bruceleehk.com
   ============================================ */

(function () {
  function init() {

    /* --- Mobile Menu Toggle --- */
    var menuToggle = document.getElementById('menu-toggle');
    var navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', function () {
        navLinks.classList.toggle('active');
      });
      navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          navLinks.classList.remove('active');
        });
      });

      /* --- Nav Dropdown Accordion (v9.87 家居滅蟲／商業滅蟲雙軌下拉) --- */
      navLinks.querySelectorAll('.nav-caret').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var li = btn.closest('.nav-drop');
          if (!li) return;
          var open = li.classList.toggle('open');
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      });
      document.addEventListener('click', function (e) {
        var t = e.target && e.target.closest ? e.target : null;
        navLinks.querySelectorAll('.nav-drop.open').forEach(function (li) {
          if (!t || !li.contains(t)) {
            li.classList.remove('open');
            var b = li.querySelector('.nav-caret');
            if (b) b.setAttribute('aria-expanded', 'false');
          }
        });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          navLinks.querySelectorAll('.nav-drop.open').forEach(function (li) {
            li.classList.remove('open');
            var b = li.querySelector('.nav-caret');
            if (b) b.setAttribute('aria-expanded', 'false');
          });
        }
      });
    }

    /* --- Strategy Filter --- */
    var filterBtns = document.querySelectorAll('.filter-btn');
    var strategyCards = document.querySelectorAll('.strategy-card');

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter');
        strategyCards.forEach(function (card) {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });

    /* --- Quote Form: 由 quote 頁面內嵌 Formspree 腳本處理，此處不重複綁定 --- */

    /* --- Header Shadow on Scroll --- */
    var header = document.getElementById('site-header');
    if (header) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 10) {
          header.style.boxShadow = '0 2px 15px rgba(0,0,0,.15)';
        } else {
          header.style.boxShadow = '0 2px 10px rgba(0,0,0,.1)';
        }
      });
    }

    /* --- Smooth Scroll for Anchor Links --- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

  }

  /* --- Robust initialization --- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
