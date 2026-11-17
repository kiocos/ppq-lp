// Garage kit behaviour: type-pairing switcher (key T), in-view video playback, the roll-up trigger,
// scrollspy (the lit nav item and section edge), USD/sats toggle, copy buttons, tabs.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const body = document.body;

  // Type pairings are declared on <body data-pairings='[...]'>
  const pairings = JSON.parse(body.dataset.pairings || '[]');
  if (pairings.length) {
    const params = new URLSearchParams(location.search);
    const wrap = document.createElement('div');
    wrap.className = 'pair';
    wrap.innerHTML = `<div class="pair-list" role="group" aria-label="Type pairings"><div class="hint">Type pairings · press T to cycle</div>${pairings.map((p, i) => `<button type="button" data-i="${i}"><span>${i + 1}. ${p.name}</span><small>${p.note || ''}</small></button>`).join('')}</div><button type="button" class="pair-btn" aria-expanded="false"><b>Aa</b><span class="pair-label"></span></button>`;
    body.appendChild(wrap);
    const label = wrap.querySelector('.pair-label');
    const toggle = wrap.querySelector('.pair-btn');
    const apply = (i) => {
      const p = pairings[i];
      for (const [k, v] of Object.entries(p.vars)) root.style.setProperty(k, v);
      root.dataset.pairing = String(i);
      wrap.querySelectorAll('.pair-list button[data-i]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.i) === i)));
      label.textContent = p.name;
      params.set('type', String(i + 1));
      history.replaceState(null, '', '?' + params.toString() + location.hash);
    };
    toggle.addEventListener('click', () => { const o = wrap.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(o)); });
    wrap.querySelectorAll('.pair-list button[data-i]').forEach((b) => b.addEventListener('click', () => apply(Number(b.dataset.i))));
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input,textarea,[contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 't' || e.key === 'T') apply((Number(root.dataset.pairing || 0) + 1) % pairings.length);
      if (e.key === 'Escape') wrap.classList.remove('open');
    });
    apply(Math.min(pairings.length, Math.max(1, Number(params.get('type')) || 1)) - 1);
  }

  // Videos play only while visible. Under reduced motion the poster stays and controls appear.
  // [data-once]: the roll-up starts from the closed door the first time it is seen.
  const vids = [...document.querySelectorAll('video[data-inview]')];
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const v = e.target;
        if (e.isIntersecting) {
          if (v.dataset.once !== undefined && !v.dataset.started) { v.dataset.started = '1'; try { v.currentTime = 0; } catch {} }
          v.play().catch(() => {});
        } else v.pause();
      }
    }, { threshold: 0.4 });
    vids.forEach((v) => { v.muted = true; v.playsInline = true; io.observe(v); });
  } else {
    vids.forEach((v) => { v.removeAttribute('autoplay'); v.controls = true; });
  }

  // Scrollspy: the section in view is "alive", so its nav item and heading edge light up
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = new Map([...document.querySelectorAll('.nav-links a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      for (const e of entries) {
        e.target.classList.toggle('is-lit', e.isIntersecting);
        const a = links.get(e.target.id);
        if (a) a.classList.toggle('is-active', e.isIntersecting);
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  // USD / sats toggle: [data-units] buttons switch every [data-usd] value
  const btc = Number(document.body.dataset.btcUsd || 0);
  document.querySelectorAll('[data-units]').forEach((group) => {
    const buttons = [...group.querySelectorAll('button[data-unit]')];
    const set = (unit) => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.unit === unit)));
      document.querySelectorAll('[data-usd]').forEach((el) => {
        const usd = Number(el.dataset.usd);
        el.textContent = unit === 'sats' && btc ? `${(usd / btc * 1e8).toLocaleString('en-US', { maximumFractionDigits: usd / btc * 1e8 < 10 ? 1 : 0 })} sats` : `$${usd.toFixed(4)}`;
      });
    };
    buttons.forEach((b) => b.addEventListener('click', () => set(b.dataset.unit)));
  });

  // Copy buttons for code blocks
  document.querySelectorAll('.code').forEach((block) => {
    if (block.querySelector('.copy')) return;
    const b = document.createElement('button');
    b.className = 'copy'; b.type = 'button'; b.textContent = 'Copy';
    b.addEventListener('click', async () => {
      const text = (block.querySelector('code') || block).innerText;
      try { await navigator.clipboard.writeText(text); b.textContent = 'Copied'; } catch { b.textContent = 'Select to copy'; }
      setTimeout(() => (b.textContent = 'Copy'), 1400);
    });
    block.appendChild(b);
  });

  // Tabs: [data-tabs] > [role=tablist] > [role=tab][aria-controls]
  document.querySelectorAll('[data-tabs]').forEach((group) => {
    const tabs = [...group.querySelectorAll('[role=tab]')];
    const select = (t) => tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(x.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
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
