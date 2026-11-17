/* PPQ v5 fire hole hero studies — first-party, dependency-free. */
(function () {
  'use strict';

  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var NS = 'http://www.w3.org/2000/svg';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

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

  /* ---------- rail + keyboard (J / K, 1–5, F, E, T) ---------- */
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
    else if (/^[1-5]$/.test(k)) { e.preventDefault(); go(+k - 1); }
    else if (k === 'f') { e.preventDefault(); step('font'); }
    else if (k === 'e') { e.preventDefault(); step('em'); }
    else if (k === 't') { e.preventDefault(); step('copy'); }
  });

  /* ---------- switcher: font, emphasis and headline copy, kept in the URL ---------- */
  var COPY = {
    current: ['Your favorite AI models,', 'with privacy you can verify.'],
    wood: ['You build the fire.', 'We sell the wood.']
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
    if (key === 'copy') {
      $$('[data-l1]').forEach(function (el) { el.textContent = COPY[v][0]; });
      $$('[data-l2]').forEach(function (el) { el.textContent = COPY[v][1]; });
    }
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
  var panel = $('.tweak'), toggle = $('.tw-toggle');
  if (panel && toggle) toggle.addEventListener('click', function () {
    var open = panel.classList.toggle('is-collapsed') === false;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  var params = new URLSearchParams(location.search);
  apply('font', params.get('font') || 'mona', true);
  apply('em', params.get('em') || 'color', true);
  apply('copy', params.get('copy') || 'current', true);

  /* ---------- sparks: one at a time, from the fire hole to a model star ---------- */
  function sparkScene(study) {
    var svg = $('svg[data-scene]', study);
    if (!svg) return;
    var layer = $('[data-sparks]', svg);
    var targets = $$('[data-target]', svg);
    var ox = +svg.getAttribute('data-ox'), oy = +svg.getAttribute('data-oy');
    var bounds = study.querySelector('.hero, .plate, .d-fig') || study;
    var timer = null, raf = null, last = null, running = false;

    function center(t) {
      var c = $('.m-dot', t);
      return { x: +c.getAttribute('cx'), y: +c.getAttribute('cy'), el: c };
    }
    function visible(t) {
      if (t.classList.contains('is-muted')) return false;
      var r = center(t).el.getBoundingClientRect(), b = bounds.getBoundingClientRect();
      return r.width > 0 && r.left > b.left + 12 && r.right < b.right - 12 && r.top > b.top && r.bottom < b.bottom;
    }
    /* a star whose name would sit behind the headline, lede or button is muted (and gets no sparks) */
    var copy = $$('.hero-body .h1, .hero-body .lede, .hero-body .cta .btn', study);
    function muteOverlaps() {
      if (!copy.length) return;
      study.classList.add('is-measuring');           // measure the text where it ends up, not mid-entry
      var boxes = copy.map(function (n) { return n.getBoundingClientRect(); });
      var hb = bounds.getBoundingClientRect();
      targets.forEach(function (t) {
        t.classList.remove('is-muted');
        var label = $('.m-label', t) || t;
        var r = label.getBoundingClientRect(), d = center(t).el.getBoundingClientRect();
        var hit = boxes.some(function (b) {
          return Math.min(r.left, d.left) < b.right + 10 && Math.max(r.right, d.right) > b.left - 10 &&
                 Math.min(r.top, d.top) < b.bottom + 8 && Math.max(r.bottom, d.bottom) > b.top - 8;
        });
        var clipped = r.left < hb.left + 6 || r.right > hb.right - 6;
        t.classList.toggle('is-muted', hit || clipped);
      });
      study.classList.remove('is-measuring');
    }
    muteOverlaps();
    window.addEventListener('resize', muteOverlaps);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(muteOverlaps);
    if (!layer) return;                              // a scene without sparks (A) only mutes labels
    function pathFor(t) {
      var d = t.getAttribute('data-d');
      if (d) return d;
      var p = center(t), sx = ox + (Math.random() * 10 - 5);
      var cx = sx + (p.x - sx) * 0.15, cy = p.y - 40;
      return 'M' + sx.toFixed(1) + ',' + oy + ' Q' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' ' + p.x + ',' + p.y;
    }
    function el(name, attrs) {
      var n = document.createElementNS(NS, name);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      return n;
    }
    function launch() {
      var pool = targets.filter(function (t) { return t !== last && visible(t); });
      if (!pool.length) pool = targets.filter(visible);
      if (!pool.length) { timer = setTimeout(launch, 1500); return; }
      var t = pool[(Math.random() * pool.length) | 0];
      last = t;
      var trail = el('path', { d: pathFor(t), class: 'spark-trail' });
      var dot = el('circle', { class: 'spark-dot', r: study.querySelector('.plate') ? 3.4 : 2.4, cx: ox, cy: oy });
      layer.appendChild(trail); layer.appendChild(dot);
      var L = trail.getTotalLength(), seg = Math.min(80, L * 0.4);
      trail.style.strokeDasharray = seg + ' ' + (L + seg);
      trail.style.strokeDashoffset = seg;
      var dur = 1500 + L * 2.4, t0 = performance.now();
      function frame(now) {
        var k = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - k, 2.2);
        var dist = L * e, p = trail.getPointAtLength(dist);
        dot.setAttribute('cx', p.x.toFixed(2)); dot.setAttribute('cy', p.y.toFixed(2));
        trail.style.strokeDashoffset = seg - dist;
        if (k < 1) { raf = requestAnimationFrame(frame); return; }
        t.classList.add('is-hit');
        setTimeout(function () { t.classList.remove('is-hit'); }, 2600);
        trail.style.opacity = '0'; dot.classList.add('is-out'); dot.style.opacity = '0';
        setTimeout(function () { trail.remove(); dot.remove(); }, 800);
        timer = setTimeout(launch, 1600 + Math.random() * 900);
      }
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (running) return;
      running = true;
      study.classList.add('is-running');
      $$('.is-hit', svg).forEach(function (n) { n.classList.remove('is-hit'); });
      timer = setTimeout(launch, 900);
    }
    function stop() {
      running = false;
      clearTimeout(timer); cancelAnimationFrame(raf);
      while (layer.firstChild) layer.removeChild(layer.firstChild);
      targets.forEach(function (t) { t.classList.remove('is-hit'); });
    }
    if (!reduce) onLive(study, function (on) { if (on) start(); else stop(); });
  }

  /* ---------- C · the lens rests on the hole; on desktop it follows the cursor ---------- */
  function lens(study) {
    var art = $('.c-art', study), hero = $('.hero', study), home = $('[data-lens-home]', study);
    if (!art || !home) return;
    var pos = null, target = null, raf = null;
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    function homePos() {
      var r = home.getBoundingClientRect(), a = art.getBoundingClientRect();
      return { x: r.left + r.width / 2 - a.left, y: r.top + r.height / 2 - a.top };
    }
    function paint() {
      art.style.setProperty('--lx', pos.x.toFixed(1) + 'px');
      art.style.setProperty('--ly', pos.y.toFixed(1) + 'px');
    }
    function tick() {
      var dx = target.x - pos.x, dy = target.y - pos.y;
      pos.x += dx * 0.12; pos.y += dy * 0.12;
      paint();
      raf = (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) ? requestAnimationFrame(tick) : null;
    }
    function moveTo(p) {
      target = p;
      if (reduce) { pos = { x: p.x, y: p.y }; paint(); return; }
      if (!raf) raf = requestAnimationFrame(tick);
    }
    var following = false;
    pos = homePos(); target = pos; paint();
    window.addEventListener('resize', function () { if (!following) { pos = homePos(); target = pos; paint(); } });
    if (fine && !reduce) {
      hero.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var a = art.getBoundingClientRect();
        following = true;
        moveTo({ x: e.clientX - a.left, y: e.clientY - a.top });
      });
      hero.addEventListener('pointerleave', function () { following = false; moveTo(homePos()); });
    }
  }

  /* ---------- go ---------- */
  ['a', 'b', 'c', 'd'].forEach(function (id) { sparkScene(document.getElementById(id)); });
  lens(document.getElementById('c'));

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
})();
