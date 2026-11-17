// PayPerQ · darkroom safelight · round 1 behaviour
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const AMBER = [255, 138, 61];

  // ── Type pairing switcher (study tool): pairings live on <body data-pairings>
  const pairings = JSON.parse(document.body.dataset.pairings || '[]');
  if (pairings.length) {
    const params = new URLSearchParams(location.search);
    const wrap = document.createElement('div');
    wrap.className = 'pair';
    wrap.innerHTML = `<div class="pair-list" role="group" aria-label="Type pairings"><div class="hint">Type pairings · press T to cycle</div>${pairings.map((p, i) => `<button type="button" data-i="${i}"><span>${i + 1}. ${p.name}</span><small>${p.note || ''}</small></button>`).join('')}</div><button type="button" class="pair-btn" aria-expanded="false"><b>Aa</b><span class="pair-label"></span></button>`;
    document.body.appendChild(wrap);
    const label = wrap.querySelector('.pair-label');
    const toggle = wrap.querySelector('.pair-btn');
    const apply = (i) => {
      for (const [k, v] of Object.entries(pairings[i].vars)) root.style.setProperty(k, v);
      root.dataset.pairing = String(i);
      wrap.querySelectorAll('[data-i]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.i) === i)));
      label.textContent = pairings[i].name;
      params.set('type', String(i + 1));
      history.replaceState(null, '', '?' + params + location.hash);
    };
    toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', String(wrap.classList.toggle('open'))));
    wrap.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => apply(Number(b.dataset.i))));
    addEventListener('keydown', (e) => {
      if (e.target.closest('input,textarea,[contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 't' || e.key === 'T') apply((Number(root.dataset.pairing || 0) + 1) % pairings.length);
      if (e.key === 'Escape') wrap.classList.remove('open');
    });
    apply(Math.min(pairings.length, Math.max(1, Number(params.get('type')) || 1)) - 1);
  }

  // ── Clumped noise, 0..1 per cell (film grain is not uniform: silver clumps)
  const noise = (w, h, cell = 6) => {
    const gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2;
    const g = Float32Array.from({ length: gw * gh }, Math.random);
    const out = new Float32Array(w * h);
    const sm = (t) => t * t * (3 - 2 * t);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const fx = x / cell, fy = y / cell, x0 = fx | 0, y0 = fy | 0, tx = sm(fx - x0), ty = sm(fy - y0);
      const a = g[y0 * gw + x0], b = g[y0 * gw + x0 + 1], c = g[(y0 + 1) * gw + x0], d = g[(y0 + 1) * gw + x0 + 1];
      out[y * w + x] = ((a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty) * 0.5 + Math.random() * 0.5;
    }
    return out;
  };

  // ── Prints: media covered in safelit grain that develops away on first view
  const prints = [...document.querySelectorAll('.print')];
  const develop = (el) => {
    const r = el.getBoundingClientRect();
    const S = 3, w = Math.max(1, Math.ceil(r.width / S)), h = Math.max(1, Math.ceil(r.height / S));
    const c = document.createElement('canvas');
    c.className = 'grain'; c.width = w; c.height = h; c.setAttribute('aria-hidden', 'true');
    el.appendChild(c);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(w, h);
    const n = noise(w, h);
    const soft = 0.18, dur = 1700, t0 = performance.now();
    let colored = false;
    const frame = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const T = t * (1 + soft);
      const d = img.data;
      for (let i = 0; i < w * h; i++) {
        // what develops first: the top of the print, broken up by grain
        const y = Math.floor(i / w) / h;
        const v = 0.62 * n[i] + 0.38 * y;
        const a = Math.max(0, Math.min(1, (v - T + soft) / soft));
        const L = (0.22 + 0.78 * Math.random()) * 0.42;
        const o = i * 4;
        d[o] = AMBER[0] * L + 10; d[o + 1] = AMBER[1] * L + 8; d[o + 2] = AMBER[2] * L + 6; d[o + 3] = a * 255;
      }
      ctx.putImageData(img, 0, 0);
      if (t > 0.45 && !colored) { el.classList.add('developed'); colored = true; }
      if (t < 1) requestAnimationFrame(frame); else c.remove();
    };
    requestAnimationFrame(frame);
  };
  if (!reduce && 'IntersectionObserver' in window && prints.length) {
    root.classList.add('js-develop');
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); develop(e.target); }
    }, { threshold: 0.35 });
    prints.forEach((p) => io.observe(p));
  }

  // ── Videos play only while visible; reduced motion keeps the poster and offers controls
  const vids = [...document.querySelectorAll('video[data-inview]')];
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause();
    }, { threshold: 0.3 });
    vids.forEach((v) => { v.muted = true; v.playsInline = true; io.observe(v); });
  } else vids.forEach((v) => { v.removeAttribute('autoplay'); v.controls = true; });

  // ── Hero process steps follow the video's timeline (seconds)
  const steps = [...document.querySelectorAll('[data-step]')];
  if (steps.length) {
    const spans = steps.map((s) => s.dataset.step.split('-').map(Number));
    const sync = () => {
      const vs = [...document.querySelectorAll('video[data-steps]')].filter((v) => v.offsetParent);
      const v = vs[0];
      if (v && !v.paused) {
        const t = v.currentTime;
        steps.forEach((s, i) => {
          const [a, b] = spans[i];
          const on = t >= a && t < b;
          s.classList.toggle('on', on);
          s.style.setProperty('--p', on ? String((t - a) / (b - a)) : t >= b ? '1' : '0');
        });
      }
      requestAnimationFrame(sync);
    };
    if (!reduce) requestAnimationFrame(sync);
    else steps.forEach((s) => s.classList.add('on'));
  }

  // ── Nav: the safelight dot marks the section in view
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  if (links.length && 'IntersectionObserver' in window) {
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) links.forEach((a) => a.setAttribute('aria-current', String(a === map.get(e.target.id))));
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  // ── Code: copy buttons and tabs
  document.querySelectorAll('.code').forEach((block) => {
    const b = document.createElement('button');
    b.className = 'copy'; b.type = 'button'; b.textContent = 'Copy';
    b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(block.querySelector('code').innerText); b.textContent = 'Copied'; } catch { b.textContent = 'Select to copy'; }
      setTimeout(() => (b.textContent = 'Copy'), 1400);
    });
    block.appendChild(b);
  });
  document.querySelectorAll('[data-tabs]').forEach((group) => {
    const tabs = [...group.querySelectorAll('[role=tab]')];
    const select = (t) => tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; select(n); n.focus(); e.preventDefault(); }
      });
    });
  });
})();
