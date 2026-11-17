/* PayPerQ cypherpunk landing: small, dependency-free, first-party only. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- header state ---------- */
  var header = document.querySelector('[data-header]');
  var onScroll = function () {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (!hasIO || reduceMotion) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------- pause decorative animation when off-screen ---------- */
  var animated = document.querySelectorAll('[data-anim]');
  if (hasIO) {
    var animIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-paused', !entry.isIntersecting);
      });
    }, { rootMargin: '120px 0px' });
    animated.forEach(function (el) { animIO.observe(el); });
  }
  document.addEventListener('visibilitychange', function () {
    animated.forEach(function (el) {
      if (document.hidden) el.classList.add('is-paused');
    });
    if (!document.hidden && hasIO) {
      animated.forEach(function (el) {
        var r = el.getBoundingClientRect();
        el.classList.toggle('is-paused', r.bottom < -120 || r.top > window.innerHeight + 120);
      });
    }
  });

  /* ---------- ciphertext churn (E2EE specimen) ---------- */
  var HEX = '0123456789abcdef';
  var randomGroup = function () {
    var s = '';
    for (var i = 0; i < 4; i++) s += HEX[(Math.random() * 16) | 0];
    return s;
  };
  var ciphers = document.querySelectorAll('[data-cipher]');
  if (!reduceMotion && ciphers.length) {
    var visible = new Set();
    if (hasIO) {
      var cipherIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? visible.add(e.target) : visible.delete(e.target); });
      });
      ciphers.forEach(function (el) { cipherIO.observe(el); });
    } else {
      ciphers.forEach(function (el) { visible.add(el); });
    }
    setInterval(function () {
      if (document.hidden) return;
      visible.forEach(function (el) {
        var groups = el.textContent.split(' ');
        var i = (Math.random() * groups.length) | 0;
        groups[i] = randomGroup();
        el.textContent = groups.join(' ');
      });
    }, 140);
  }

  /* ---------- Unicorn Studio (optional, self-hosted) ----------
     Fill data-us-project (or data-us-project-src) on a .unicorn-slot to enable.
     The runtime is expected at assets/unicornStudio.umd.js so the page keeps
     loading zero third-party code. Override with data-us-runtime on <body>. */
  var slots = Array.prototype.filter.call(
    document.querySelectorAll('.unicorn-slot'),
    function (el) { return (el.dataset.usProject || el.dataset.usProjectSrc || '').trim() !== ''; }
  );
  if (slots.length && !reduceMotion) {
    var src = document.body.dataset.usRuntime || 'assets/unicornStudio.umd.js';
    var script = document.createElement('script');
    script.src = src;
    script.onload = function () {
      if (!window.UnicornStudio || typeof window.UnicornStudio.init !== 'function') return;
      window.UnicornStudio.init().then(function () {
        slots.forEach(function (el) {
          var art = el.closest('.hero-art, .closing-art');
          if (art) art.classList.add('has-unicorn');
        });
      }).catch(function () { /* keep the CSS fallback */ });
    };
    document.head.appendChild(script);
  }
})();
