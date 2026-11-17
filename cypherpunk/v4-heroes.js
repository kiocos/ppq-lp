/* PPQ v4 hero studies — first-party, dependency-free. */
(function () {
  'use strict';

  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var HEX = '0123456789abcdef';
  var rnd = function () { return HEX[(Math.random() * 16) | 0]; };

  /* ---------- live state: entry animations + loops run only while a study is on screen ---------- */
  var studies = $$('[data-study]');
  function setLive(el, on) {
    if (el.classList.contains('is-live') === on) return;
    el.classList.toggle('is-live', on);
    (el.__live || []).forEach(function (fn) { fn(on); });
  }
  function onLive(el, fn) {
    if (!el) return;
    (el.__live = el.__live || []).push(fn);
    if (el.classList.contains('is-live')) fn(true);
  }
  if (!hasIO || reduce) {
    studies.forEach(function (s) { setLive(s, true); });
  } else {
    var liveIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRatio >= 0.3) setLive(e.target, true);
        else if (!e.isIntersecting) setLive(e.target, false);
      });
    }, { threshold: [0, 0.3] });
    studies.forEach(function (s) { liveIO.observe(s); });
  }

  /* ---------- rail + keyboard (J / K, 1–6) ---------- */
  var rail = $$('.rail a');
  var order = rail.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var current = 0;
  if (hasIO) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        current = order.indexOf(e.target);
        rail.forEach(function (a, i) {
          a.classList.toggle('is-current', i === current);
          if (i === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    order.forEach(function (s) { navIO.observe(s); });
  }
  function go(i) {
    i = Math.max(0, Math.min(order.length - 1, i));
    order[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
    var k = (e.key || '').toLowerCase();
    if (k === 'j') { e.preventDefault(); go(current + 1); }
    else if (k === 'k') { e.preventDefault(); go(current - 1); }
    else if (/^[1-6]$/.test(k)) { e.preventDefault(); go(+k - 1); }
    else if (k === 'f') { e.preventDefault(); step('font'); }
    else if (k === 'e') { e.preventDefault(); step('em'); }
  });

  /* ---------- type switcher: font + emphasis, kept in the URL so a choice can be shared ---------- */
  var FONT_NAMES = {
    geist: 'Geist 600', mono: 'Geist Mono 500', mona: 'Mona Sans 600', hubot: 'Hubot Sans 600',
    bricolage: 'Bricolage Grotesque 600', newsreader: 'Newsreader 500'
  };
  var tweaks = {};
  $$('[data-tweak]').forEach(function (seg) {
    var key = seg.getAttribute('data-tweak');
    tweaks[key] = $$('button', seg).map(function (b) { return b.getAttribute('data-v'); });
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b) apply(key, b.getAttribute('data-v'));
    });
  });
  function apply(key, v, skipUrl) {
    if (!tweaks[key] || tweaks[key].indexOf(v) < 0) return;
    document.documentElement.setAttribute('data-' + key, v);
    $$('[data-tweak="' + key + '"] button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-v') === v ? 'true' : 'false');
    });
    if (key === 'font') $$('[data-font-name]').forEach(function (el) { el.textContent = FONT_NAMES[v]; });
    if (!skipUrl && window.history && history.replaceState) {
      var q = new URLSearchParams(location.search);
      q.set(key, v);
      history.replaceState(null, '', location.pathname + '?' + q.toString() + location.hash);
    }
  }
  function step(key) {
    var list = tweaks[key]; if (!list) return;
    var cur = document.documentElement.getAttribute('data-' + key) || list[0];
    apply(key, list[(list.indexOf(cur) + 1) % list.length]);
  }
  var params = new URLSearchParams(location.search);
  apply('font', params.get('font') || 'mona', true);
  apply('em', params.get('em') || 'color', true);

  /* ---------- A · ciphertext ring around the disc ---------- */
  var heroA = $('#a');
  var ring = $('[data-hexring]');
  if (ring) {
    var N = 300, chars = [];
    for (var i = 0; i < N; i++) chars.push(i % 6 === 5 ? ' ' : rnd());
    var paintRing = function () { ring.textContent = chars.join(''); };
    paintRing();
    var shimmer = null;
    if (!reduce) onLive(heroA, function (on) {
      clearInterval(shimmer);
      if (!on) return;
      shimmer = setInterval(function () {
        for (var j = 0; j < 8; j++) {
          var p = (Math.random() * N) | 0;
          if (chars[p] !== ' ') chars[p] = rnd();
        }
        paintRing();
      }, 140);
    });
  }

  /* ---------- A · prompt decodes only inside the disc ---------- */
  var plain = $('[data-plain]');
  if (plain && !reduce) {
    var PROMPTS = ['Explain this code.', 'Summarize this contract.', 'Draft a polite reply.'];
    var pi = 0, hold = null, tick = null;
    var hexOf = function (s) { return s.replace(/[^ ]/g, function () { return rnd(); }); };
    var stop = function () { clearTimeout(hold); clearInterval(tick); };
    var morph = function (target, decode, steps, done) {
      var n = 0, len = target.length;
      clearInterval(tick);
      tick = setInterval(function () {
        n++;
        var k = Math.round(len * n / steps), s = '';
        for (var i = 0; i < len; i++) {
          var c = target[i];
          var shown = decode ? i < k : i >= k;
          s += (shown || c === ' ') ? c : rnd();
        }
        plain.textContent = s;
        if (n >= steps) { clearInterval(tick); done(); }
      }, 55);
    };
    var cycle = function () {
      var target = PROMPTS[pi], n = 0;
      clearInterval(tick);
      tick = setInterval(function () {
        plain.textContent = hexOf(target);
        if (++n < 14) return;
        clearInterval(tick);
        morph(target, true, 16, function () {
          hold = setTimeout(function () {
            morph(target, false, 10, function () { pi = (pi + 1) % PROMPTS.length; cycle(); });
          }, 2600);
        });
      }, 60);
    };
    onLive(heroA, function (on) {
      stop();
      if (on) cycle(); else plain.textContent = PROMPTS[pi];
    });
  }
})();
