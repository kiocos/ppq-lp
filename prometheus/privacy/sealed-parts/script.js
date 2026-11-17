  // privacy, "sealed" study. Both columns stay pinned while the page scrolls a tall track; scroll drives p (0 → 4).
  // The message is the star: typed in a browser window on ppq.ai, encrypted letter by letter (real AES-GCM bytes
  // from WebCrypto), carried by a point of light into PayPerQ's server, where a scanner reads only its envelope
  // (IP, model, tokens). It drops into the enclave bay and each character decrypts as it crosses the bay's edge,
  // is re-sealed on the way out, and opens at the provider (its logo, among others) with the IP struck out.
  // Then the scene fades out and, in the same place, the browser checks the enclave's PCR0 against the published one.
  (() => {
    const root = document.getElementById('en-story'), sx = document.getElementById('sx');
    if (!root || !sx) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const ramp = (p, a, b) => clamp((p - a) / (b - a));
    const ease = (x) => x * x * (3 - 2 * x);
    const lerp = (a, b, k) => a + (b - a) * k;
    const bump = (p, a, b) => Math.sin(Math.PI * ramp(p, a, b)); // 0 → 1 → 0 across [a, b]
    // piecewise path through [p, value] keys, eased between keys
    const path = (keys, p) => {
      if (p <= keys[0][0]) return keys[0][1];
      for (let i = 1; i < keys.length; i++) if (p <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], ease((p - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])));
      return keys[keys.length - 1][1];
    };
    const HEX = '0123456789abcdef';
    const noise = () => HEX[(Math.random() * 16) | 0];

    // ---------- progress: one "stepLen" of scroll per step, the first and last 12% of each held still ----------
    const pin = root.querySelector('.sx-pin'), steps = [...root.querySelectorAll('.story-step')], ticks = [...root.querySelectorAll('.sx-ticks i')];
    const N = steps.length - 1;
    let stepLen = 600, pinTop = 64;
    const sizeTrack = () => {
      stepLen = Math.max(420, innerHeight * 0.8);
      pinTop = parseFloat(getComputedStyle(pin).top) || 64;
      root.style.height = pin.offsetHeight + stepLen * (N + 0.5) + 'px';
      root.dataset.stepLen = stepLen; root.dataset.pinTop = pinTop;
    };
    const progress = () => {
      const raw = clamp((pinTop - root.getBoundingClientRect().top) / stepLen, 0, N);
      const n = Math.min(N - 1, Math.floor(raw)), f = raw - n;
      const p = n + clamp((f - 0.12) / 0.76);
      return reduce.matches ? Math.round(p) : p;
    };
    // the copy swaps when the animation has arrived at each stage
    const ARRIVE = [0, 0.92, 1.92, 2.92, 3.4];
    let active = -1;
    const setStep = (p) => {
      let k = 0; ARRIVE.forEach((a, i) => { if (p >= a) k = i; });
      if (k === active) return; active = k;
      steps.forEach((el, i) => { el.classList.toggle('on', i === k); el.classList.toggle('past', i < k); });
      ticks.forEach((el, i) => { el.classList.toggle('on', i < k); el.classList.toggle('now', i === k); });
    };

    // ---------- elements ----------
    const $ = (s) => sx.querySelector(s), $$ = (s) => [...sx.querySelectorAll(s)];
    const cam = $('.sx-cam'), msg = $('.sx-msg'), t = $('.sx-t');
    const dev = $('.sx-dev'), server = $('.sx-server'), bay = $('.sx-bay'), foot = $('.sx-foot'), scan = $('.sx-scan'), provider = $('.sx-provider');
    const fibres = $$('.sx-fibre'), comet = $('.sx-comet');
    const ver = $('.sx-ver'), got = $('.sx-got'), verdict = $('.sx-verdict span'), verdictBox = $('.sx-verdict'), tamper = $('.sx-tamper');

    const TEXT = 'Summarize these board notes into five decisions.';
    // PCR0 as shown in the 05 study; wire to the live verifier (lib/nitro/browser-verify.mjs) before shipping
    const PUB = '3ef8 468b feaf b866 …';
    const BAD = 'a71c 05d9 3b2e 4f07 …'; // no character in common with PUB, position by position

    // ciphertext: real AES-GCM over the message, shown as hex; a seeded stand-in until WebCrypto answers
    let cipherHex = '';
    { let s = 7; for (let i = 0; i < 160; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; cipherHex += HEX[s % 16]; } }
    (async () => {
      try {
        const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt']);
        const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(12)) }, key, new TextEncoder().encode(TEXT)));
        cipherHex = [...ct].map((b) => b.toString(16).padStart(2, '0')).join('');
        if (L) wrap();
      } catch {}
    })();

    // ---------- layout: one centred column ----------
    let L = null, lines = [], cipherLines = [];
    const box = (el, r) => { el.style.left = r.x + 'px'; el.style.top = r.y + 'px'; el.style.width = r.w + 'px'; el.style.height = r.h + 'px'; };

    function wrap() {
      // word-wrap the message in monospace columns; the ciphertext takes the same shape, so each character changes in place
      const probe = document.createElement('span'); probe.className = 'sx-t'; probe.style.cssText = 'position:absolute;visibility:hidden;padding:0'; probe.textContent = '0'.repeat(20);
      cam.appendChild(probe); const cw = probe.getBoundingClientRect().width / 20; probe.remove();
      const cols = Math.max(16, Math.floor((L.cardW - 28 - 30) / cw));
      lines = []; let line = '';
      for (const w of TEXT.split(' ')) { if (line && (line + ' ' + w).length > cols) { lines.push(line); line = w; } else line = line ? line + ' ' + w : w; }
      lines.push(line);
      let k = 0; cipherLines = lines.map((l) => { const c = cipherHex.slice(k, k + l.length); k += l.length; return c; });
    }

    function layout() {
      const pw = sx.clientWidth, ph = sx.clientHeight;
      const W = Math.min(440, Math.max(300, pw));
      const s = Math.min(pw >= 470 ? 1.14 : 1, pw / W);
      const cardX = 22, cardW = W - 44;
      L = { W, s, ph, cardW };
      msg.style.left = cardX + 'px'; msg.style.width = cardW + 'px';
      wrap(); t.textContent = lines.join('\n');
      const cardH = msg.offsetHeight || 120; L.cardH = cardH;
      const GAP = 84;
      // browser: bar, the message, the composer
      const D = { x: 0, y: 0, w: W }; D.hold = 34 + 16; D.h = D.hold + cardH + 14 + 42 + 14;
      // server: face, the message under the scanner, the enclave bay, the foot
      const S = { x: 0, y: D.h + GAP, w: W }; S.hold = S.y + 48;
      const B = { x: 12, w: W - 24, y: S.hold + cardH + 22 }; B.hold = B.y + 38; B.h = 38 + cardH + 16;
      S.h = B.y + B.h + 40 - S.y;
      // provider: logos, then the message
      const P = { x: 0, y: S.y + S.h + GAP, w: W }; P.hold = P.y + 52; P.h = 52 + cardH + 16;
      Object.assign(L, { D, S, B, P, H: P.y + P.h + 4 });
      box(dev, D); box(server, S); box(provider, P);
      // the bay and the foot sit inside the server, in its own coordinates
      bay.style.left = B.x + 'px'; bay.style.top = B.y - S.y + 'px'; bay.style.width = B.w + 'px'; bay.style.height = B.h + 'px';
      foot.style.top = B.y + B.h - S.y + 16 + 'px';
      const fx = W / 2;
      [[fibres[0], D.y + D.h, S.y], [fibres[1], S.y + S.h, P.y]].forEach(([el, y1, y2]) => { el.style.left = fx + 'px'; el.style.top = y1 + 'px'; el.style.height = y2 - y1 + 'px'; });
      cam.style.width = W + 'px'; cam.style.height = L.H + 'px';
      ver.style.width = W + 'px';
    }

    // ---------- per-frame ----------
    let shown = -1, typedAt = 0, tampered = false, tamperAt = -1e9;

    // one character: 'p' plain, 'c' cipher, 'n' noise (mid-change)
    function charState(i, row, col, p, cardY) {
      if (p < 0.6) {
        const e = ramp(p, 0.06, 0.45), band = 7, front = e * (TEXT.length + band);
        return i < front - band ? 'c' : i < front ? 'n' : 'p';
      }
      const y = cardY + 12 + row * 20.8 + 10; // centre of this text row
      let best = 'c';
      for (const z of [L.B, L.P]) {
        const d = Math.min(y - z.y, z.y + z.h - y) - col * 0.8;
        if (d > 5) return 'p';
        if (d > -5) best = 'n';
      }
      return best;
    }

    function textHTML(p, cardY, typed) {
      let out = '', i = 0;
      for (let r = 0; r < lines.length && i < typed; r++) {
        const line = lines[r];
        if (r) { out += '\n'; i++; } // the space the line break replaced
        let run = '', cls = null;
        const flush = () => { if (run) out += cls === 'p' ? run : `<span class="${cls}">${run}</span>`; run = ''; };
        for (let c = 0; c < line.length && i < typed; c++, i++) {
          let st = charState(i, r, c, p, cardY);
          if (st === 'n' && reduce.matches) st = 'c';
          const ch = st === 'p' ? line[c] : st === 'c' ? (cipherLines[r][c] || '0') : noise();
          if (st !== cls) { flush(); cls = st; }
          run += ch;
        }
        flush();
      }
      if (typed < TEXT.length) out += '<span class="cur"></span>';
      return out;
    }

    function hashHTML(target, k) {
      // the enclave's PCR0 against the published one: characters turn green (or red) from left to right
      let out = 'PCR0 ';
      for (let i = 0; i < target.length; i++) {
        const ch = target[i];
        if (ch === ' ' || ch === '…' || i / target.length >= k) { out += ch; continue; }
        out += `<span class="${ch === PUB[i] ? 'ok' : 'no'}">${ch}</span>`;
      }
      return out;
    }

    function render() {
      if (!L) return;
      const p = shown < 0 ? 0 : shown, now = performance.now();
      const typed = p > 0.03 || reduce.matches ? TEXT.length : typedAt ? clamp(Math.floor((now - typedAt) / 34), 0, TEXT.length) : 0;
      const { D, S, B, P } = L;

      // the message: browser → server (under the scanner) → enclave bay → provider
      const cardY = path([[0.5, D.hold], [1, S.hold], [1.5, S.hold], [2.05, B.hold], [2.4, B.hold], [3, P.hold]], p);
      msg.style.transform = `translateY(${cardY}px)`;
      t.innerHTML = textHTML(p, cardY, typed);
      const inBay = cardY > B.y && cardY + L.cardH < B.y + B.h + 4;
      msg.classList.toggle('hot', inBay && p > 1.9);
      msg.classList.toggle('sealed', p > 0.45 && !(p > 1.95 && p < 2.55) && p < 2.95);
      msg.classList.toggle('open', (p > 1.95 && p < 2.55) || p > 2.95);
      msg.classList.toggle('read', p > 1.05 && p < 2.7);
      msg.style.setProperty('--strike', ease(ramp(p, 2.6, 2.85)));
      dev.classList.toggle('sent', p > 0.46 && p < 0.56);

      // the light that carries it: runs just ahead of the card while it moves, lighting the fibre it is in
      const moving = Math.max(bump(p, 0.5, 1), bump(p, 2.4, 3));
      comet.style.opacity = moving;
      comet.style.left = L.W / 2 + 'px'; comet.style.top = cardY + L.cardH + 10 + 'px';
      fibres[0].style.setProperty('--lit', bump(p, 0.5, 1));
      fibres[1].style.setProperty('--lit', bump(p, 2.45, 2.95));

      // the scanner sweeps the card once at the server: the envelope is read, the letter is not
      const sc = ramp(p, 1.0, 1.3);
      scan.style.opacity = bump(p, 1.0, 1.3);
      scan.style.top = S.hold - S.y + sc * L.cardH + 'px';

      // the bay warms while it holds the message
      bay.style.setProperty('--warm', ease(ramp(p, 1.75, 2.05)) * (1 - ease(ramp(p, 2.45, 2.8))));
      provider.style.setProperty('--pl', ease(ramp(p, 2.85, 3.05)));

      // the end: the scene fades out where it stands, the verification fades in at the same spot
      const out = ease(ramp(p, 3.1, 3.35)), vin = ease(ramp(p, 3.35, 3.6));
      cam.style.opacity = 1 - out;
      ver.style.opacity = vin; ver.style.visibility = vin ? 'visible' : 'hidden';
      ver.style.transform = `translate(-50%, calc(-50% + ${(1 - vin) * 10}px)) scale(${L.s})`;
      const cmp = ease(ramp(p, 3.6, 3.85));
      const scr = clamp((now - tamperAt) / 650);
      let target = tampered ? BAD : PUB;
      if (scr < 1) target = [...target].map((ch, i) => (ch === ' ' || ch === '…' || i / target.length < scr) ? ch : noise()).join('');
      got.innerHTML = hashHTML(target, scr < 1 ? 0 : cmp);
      const vo = ease(ramp(p, 3.82, 3.95)) * (scr < 1 ? 0 : 1);
      verdictBox.style.setProperty('--vo', vo); verdictBox.style.setProperty('--ck', 1 - vo);
      ver.classList.toggle('bad', tampered && scr >= 1);
      verdict.textContent = tampered ? 'Doesn’t match. Nothing is sent.' : 'Matches. Safe to send.';
      const to = ease(ramp(p, 3.88, 4));
      tamper.style.opacity = to; tamper.style.pointerEvents = to > .5 ? 'auto' : 'none'; tamper.tabIndex = to > .5 ? 0 : -1;
      tamper.textContent = tampered ? 'Show the real build' : 'Try a modified build';

      // camera: follows the message, clamped to the scene
      const mid = (z) => z.y + z.h / 2;
      const f = path([[0, mid(D)], [0.5, mid(D)], [1, S.hold + L.cardH * .7], [1.5, mid(B) - 50], [2.05, mid(B)], [2.4, mid(B)], [3, mid(P) - 20], [4, mid(P) - 20]], p);
      const s = L.s, viewH = L.ph, sceneH = L.H * s;
      let ty = viewH / 2 - f * s;
      ty = sceneH <= viewH ? (viewH - sceneH) / 2 : clamp(ty, viewH - sceneH - 24, 24);
      cam.style.transform = `translate(${(sx.clientWidth - L.W * s) / 2}px, ${ty}px) scale(${s})`;
    }

    let running = false, visible = false, last = 0;
    function frame(now) {
      const goal = progress();
      // glide toward the scroll position at the same speed whatever the frame rate
      const k = 1 - Math.pow(0.84, Math.min(6, (now - (last || now)) / 16.7 || 1)); last = now;
      shown = shown < 0 || reduce.matches ? goal : shown + (goal - shown) * k;
      if (Math.abs(goal - shown) < 0.0005) shown = goal;
      render(); setStep(shown);
      if (visible) requestAnimationFrame(frame); else { running = false; last = 0; }
    }
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !typedAt) typedAt = performance.now() + 300;
      if (visible && !running) { running = true; requestAnimationFrame(frame); }
    }).observe(sx);
    tamper.addEventListener('click', () => { tampered = !tampered; tamperAt = performance.now(); });
    new ResizeObserver(() => { sizeTrack(); layout(); render(); }).observe(sx);
    addEventListener('resize', sizeTrack);
    document.fonts && document.fonts.ready.then(() => { layout(); render(); });
    sizeTrack(); layout(); setStep(0); render();
  })();
