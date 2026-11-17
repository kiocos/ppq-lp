/* PayPerQ landing v2: small, dependency-free, first-party only. */
(function () {
  'use strict';

  document.documentElement.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* header background after scrolling */
  var header = document.querySelector('[data-header]');
  var onScroll = function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 24); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* gentle reveal */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (!hasIO || reduceMotion) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* pause the hero animation when it is off-screen */
  if (hasIO) {
    var animIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('is-paused', !e.isIntersecting); });
    });
    document.querySelectorAll('[data-anim]').forEach(function (el) { animIO.observe(el); });
  }

  /* Unicorn Studio (optional, self-hosted runtime at assets/unicornStudio.umd.js) */
  var slots = Array.prototype.filter.call(document.querySelectorAll('.unicorn-slot'), function (el) {
    return (el.dataset.usProject || el.dataset.usProjectSrc || '').trim() !== '';
  });
  if (slots.length && !reduceMotion) {
    var s = document.createElement('script');
    s.src = document.body.dataset.usRuntime || 'assets/unicornStudio.umd.js';
    s.onload = function () {
      if (!window.UnicornStudio || typeof window.UnicornStudio.init !== 'function') return;
      window.UnicornStudio.init().then(function () {
        slots.forEach(function (el) {
          var art = el.closest('.hero-art');
          if (art) art.classList.add('has-unicorn');
        });
      }).catch(function () { /* keep the CSS fallback */ });
    };
    document.head.appendChild(s);
  }
})();
