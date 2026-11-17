/* PPQ landing v3 — first-party, dependency-free. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Run a callback only while an element is on screen. */
  function whileVisible(el, onEnter, onLeave, margin) {
    if (!hasIO) { onEnter(); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? onEnter() : onLeave && onLeave(); });
    }, { rootMargin: margin || '0px', threshold: 0.2 }).observe(el);
  }

  /* ---------- header, progress, current nav item ---------- */
  var header = $('[data-header]');
  var bar = $('[data-progress]');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 24);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
      ticking = false;
    });
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- page theme follows the section in the middle of the viewport ---------- */
  var navLinks = $$('.main-nav a');
  if (hasIO) {
    var themeIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target.getAttribute('data-theme');
        if (t && body.getAttribute('data-theme') !== t) body.setAttribute('data-theme', t);
        var id = e.target.id;
        navLinks.forEach(function (a) {
          var href = a.getAttribute('href');
          var match = id && (href === '#' + id || (id === 'privacy' && href === '#enclave'));
          a.classList.toggle('is-current', !!match);
        });
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    $$('main > section[data-theme], footer[data-theme]').forEach(function (s) { themeIO.observe(s); });
  }

  /* ---------- reveal ---------- */
  var reveals = $$('[data-reveal]');
  if (!hasIO || reduce) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- pause CSS loops off-screen ---------- */
  $$('[data-anim]').forEach(function (el) {
    whileVisible(el, function () { el.classList.remove('is-paused'); }, function () { el.classList.add('is-paused'); });
  });

  /* ---------- ciphertext helper ---------- */
  var HEX = '0123456789abcdef';
  function cipher(len) {
    var s = '';
    for (var i = 0; i < len; i++) s += (i && i % 5 === 4) ? ' ' : HEX[(Math.random() * 16) | 0];
    return s;
  }

  /* ---------- enclave vault ---------- */
  var vault = $('[data-vault]');
  if (vault && !reduce) {
    var packet = $('[data-packet]', vault);
    var PROMPT = 'Explain this code.';
    var steps = [
      { ms: 700, cls: 'is-cipher', text: null },
      { ms: 1350, cls: 'is-cipher', text: null },
      { ms: 1700, cls: 'is-plain', text: PROMPT },
      { ms: 1300, cls: 'is-sent', text: 'prompt' },
      { ms: 800, cls: 'is-sent', text: 'reply' },
      { ms: 1350, cls: 'is-plain', text: 'reply' },
      { ms: 1350, cls: 'is-cipher', text: null },
      { ms: 900, cls: 'is-cipher', text: null }
    ];
    var step = 0, timer = null, scramble = null, running = false;
    var apply = function () {
      var s = steps[step];
      vault.setAttribute('data-step', String(step));
      packet.className = 'v-packet ' + s.cls;
      clearInterval(scramble);
      if (s.text) { packet.textContent = s.text; }
      else {
        packet.textContent = cipher(9);
        scramble = setInterval(function () { packet.textContent = cipher(9); }, 110);
      }
      timer = setTimeout(function () { step = (step + 1) % steps.length; apply(); }, s.ms);
    };
    whileVisible(vault, function () {
      if (running) return;
      running = true; step = 0; apply();
    }, function () {
      running = false; clearTimeout(timer); clearInterval(scramble);
    });
  }

  /* ---------- privacy tiers ---------- */
  var tiers = $('[data-tiers]');
  if (tiers) {
    var tabs = $$('[role="tab"]', tiers);
    var panel = $('[role="tabpanel"]', tiers);
    var text = $('[data-tp-text]', tiers);
    var PLAIN = text.textContent;
    var order = ['anon', 'zdr', 'e2ee'];
    var TIER_MS = 5200;
    var auto = !reduce, autoTimer = null, fxTimer = null, fxInterval = null, inView = false;
    tiers.style.setProperty('--tier-ms', TIER_MS + 'ms');

    var select = function (key, focus) {
      clearTimeout(fxTimer); clearInterval(fxInterval);
      tiers.classList.remove('is-dissolved');
      tiers.setAttribute('data-active', key);
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tier') === key;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (on) { panel.setAttribute('aria-labelledby', t.id); if (focus) t.focus(); }
      });
      text.textContent = PLAIN;
      if (key === 'zdr') {
        fxTimer = setTimeout(function () { tiers.classList.add('is-dissolved'); }, reduce ? 0 : 1100);
      } else if (key === 'e2ee') {
        var len = PLAIN.length;
        if (reduce) { text.textContent = cipher(len); }
        else {
          var n = 0;
          fxInterval = setInterval(function () {
            n++;
            var keep = Math.max(0, len - n * 2);
            text.textContent = PLAIN.slice(0, keep) + cipher(len - keep);
          }, 70);
        }
      }
      // restart the progress bar animation on the active tab
      tabs.forEach(function (t) { var b = $('.tt-bar', t); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; });
    };
    var schedule = function () {
      clearTimeout(autoTimer);
      if (!auto || !inView) { tiers.classList.remove('is-auto'); return; }
      tiers.classList.add('is-auto');
      autoTimer = setTimeout(function () {
        var i = order.indexOf(tiers.getAttribute('data-active'));
        select(order[(i + 1) % order.length]);
        schedule();
      }, TIER_MS);
    };
    var stopAuto = function () { auto = false; schedule(); };

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { stopAuto(); select(t.getAttribute('data-tier')); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, next = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') next = (i + 1) % tabs.length;
        if (k === 'ArrowUp' || k === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        if (k === 'Home') next = 0;
        if (k === 'End') next = tabs.length - 1;
        if (next !== null) { e.preventDefault(); stopAuto(); select(tabs[next].getAttribute('data-tier'), true); }
      });
    });
    tiers.addEventListener('pointerenter', function () { if (auto) { clearTimeout(autoTimer); tiers.classList.remove('is-auto'); } });
    tiers.addEventListener('pointerleave', function () { if (auto) schedule(); });
    select('anon');
    whileVisible(tiers, function () { inView = true; schedule(); }, function () { inView = false; schedule(); });
  }

  /* ---------- simple cyclers: model picker and wallet top-up ---------- */
  function cycler(el, itemsSel, ms, onStep) {
    if (!el) return;
    var items = $$(itemsSel, el);
    var i = 0, t = null;
    var go = function () {
      items.forEach(function (it, k) { it.classList.toggle('is-on', k === i); });
      el.classList.remove('is-pulse'); void el.offsetWidth; el.classList.add('is-pulse');
      if (onStep) onStep(i);
      i = (i + 1) % items.length;
      t = setTimeout(go, ms);
    };
    if (reduce) return;
    whileVisible(el, function () { if (!t) go(); }, function () { clearTimeout(t); t = null; });
  }

  var picker = $('[data-picker]');
  var hl = picker && $('.pk-hl', picker);
  cycler(picker, '.pk-list li', 2600, function (i) { hl.style.setProperty('--i', i); });

  var topup = $('[data-topup]');
  var meter = topup && $('[data-meter]', topup);
  var fills = ['34%', '58%', '82%'];
  cycler(topup, '.tu-methods li', 2400, function (i) {
    setTimeout(function () { meter.style.setProperty('--fill', fills[i]); }, 650);
  });

  /* ---------- usage bars stagger ---------- */
  $$('.u-bars span').forEach(function (b, i) { b.style.setProperty('--i', i); });

  /* ---------- Unicorn Studio (optional, self-hosted at assets/unicornStudio.umd.js) ---------- */
  var slots = $$('.unicorn-slot').filter(function (el) {
    return (el.dataset.usProject || el.dataset.usProjectSrc || '').trim() !== '';
  });
  if (slots.length && !reduce) {
    var s = document.createElement('script');
    s.src = body.dataset.usRuntime || 'assets/unicornStudio.umd.js';
    s.onload = function () {
      if (!window.UnicornStudio || typeof window.UnicornStudio.init !== 'function') return;
      window.UnicornStudio.init().then(function () {
        slots.forEach(function (el) { var art = el.closest('.hero-art'); if (art) art.classList.add('has-unicorn'); });
      }).catch(function () {});
    };
    document.head.appendChild(s);
  }
})();
