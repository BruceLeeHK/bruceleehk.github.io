/*! v9.86 Spirit Reflection share cards — Web Share API + download | bruceleehk.com */
(function () {
  'use strict';
  function push(name, label) {
    try { (window.dataLayer = window.dataLayer || []).push({ event: name, link_text: (label || '').slice(0, 80) }); } catch (e) {}
  }
  function waFallback(text, url) {
    var msg = (text ? text + ' ' : '') + url;
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }
  function share(btn) {
    var img = btn.getAttribute('data-share-img') || '';
    var title = btn.getAttribute('data-share-title') || document.title || '';
    var text = btn.getAttribute('data-share-text') || '';
    var url = btn.getAttribute('data-share-url') || location.href;
    var label = 'spirit-share:' + img;
    push('share_spirit_card', label);
    if (navigator.share && navigator.canShare && window.fetch) {
      fetch(img, { cache: 'force-cache' }).then(function (r) { return r.blob(); }).then(function (blob) {
        var fname = img.split('/').pop() || 'card.jpg';
        var file = null;
        try { file = new File([blob], fname, { type: blob.type || 'image/jpeg' }); } catch (e) { file = null; }
        var p;
        if (file && navigator.canShare({ files: [file] })) {
          p = navigator.share({ files: [file], title: title, text: text, url: url });
        } else {
          p = navigator.share({ title: title, text: text, url: url });
        }
        p.then(function () { push('share_spirit_card_success', label); }).catch(function (err) {
          if (err && err.name === 'AbortError') return;
          waFallback(text, url);
        });
      }).catch(function () { waFallback(text, url); });
    } else {
      waFallback(text, url);
    }
  }
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    var btn = t && t.closest ? t.closest('.spirit-sh') : null;
    if (!btn) return;
    ev.preventDefault();
    share(btn);
  });
})();
