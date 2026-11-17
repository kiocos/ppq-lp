/* PPQ v6 verification studies — first-party, dependency-free. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var studies = $$('[data-study]');

  // entry animations and loops run only while a study is on screen
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('is-live', e.isIntersecting); });
    }, { threshold: 0.3 });
    studies.forEach(function (s) { io.observe(s); });
  } else {
    studies.forEach(function (s) { s.classList.add('is-live'); });
  }

  // rail + keys (J / K, 1–3)
  var rail = $$('.rail a');
  var current = 0;
  if ('IntersectionObserver' in window) {
    var nav = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        current = studies.indexOf(e.target);
        rail.forEach(function (a, i) { a.classList.toggle('is-current', i === current); });
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    studies.forEach(function (s) { nav.observe(s); });
  }
  function go(i) {
    i = Math.max(0, Math.min(studies.length - 1, i));
    studies[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    var k = (e.key || '').toLowerCase();
    if (k === 'j') { e.preventDefault(); go(current + 1); }
    else if (k === 'k') { e.preventDefault(); go(current - 1); }
    else if (/^[1-3]$/.test(k)) { e.preventDefault(); go(+k - 1); }
  });
})();
