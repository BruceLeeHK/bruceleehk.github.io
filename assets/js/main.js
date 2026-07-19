/* ============================================
   滅蟲師傅 — Main JavaScript
   www.bruceleehk.com
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* --- Mobile Menu Toggle --- */
  var menuToggle = document.getElementById('menu-toggle');
  var navLinks = document.getElementById('nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      navLinks.classList.toggle('active');
    });
    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('active');
      });
    });
  }

  /* --- Strategy Filter --- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var strategyCards = document.querySelectorAll('.strategy-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Update active button
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

  /* --- Quote Form Handler --- */
  var quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var formData = new FormData(quoteForm);
      var name = formData.get('name');
      var phone = formData.get('phone');
      var service = formData.get('service');
      var details = formData.get('details');

      var message = '免費估價申請%0A%0A' +
        '姓名：' + encodeURIComponent(name) + '%0A' +
        '電話：' + encodeURIComponent(phone) + '%0A' +
        '服務：' + encodeURIComponent(service) + '%0A' +
        '詳情：' + encodeURIComponent(details || '無');

      window.open('https://wa.me/85252821552?text=' + message, '_blank');
    });
  }

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

});
