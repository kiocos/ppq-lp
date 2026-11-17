  // privacy film. A pinned stage plays forward as you scroll, like a scrubbed video: t runs 0 → T.
  // One subject (your message) moves through three places while a camera pushes in and pulls out:
  // your browser (typed, then encrypted letter by letter with real AES-GCM bytes), PayPerQ's server (its request
  // log prints only the envelope: IP, model, tokens), an admin's cursor bouncing off the enclave wall, the enclave
  // (the message squeezes through a port and its letters come back as they cross the wall, in warm light), then the
  // provider (the IP struck out). Last scene, in place: the browser checks the enclave's PCR0 against the published one.
  // Captions are part of the film, typed in with a scramble at the leading edge.
  (() => {
    const track = document.getElementById('fm-track'), fm = document.getElementById('fm');
    if (!track || !fm) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const ramp = (t, a, b) => clamp((t - a) / (b - a));
    const ease = (x) => x * x * (3 - 2 * x);
    const easeIO = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const lerp = (a, b, k) => a + (b - a) * k;
    const HEX = '0123456789abcdef', GLYPH = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const rnd = (set) => set[(Math.random() * set.length) | 0];
    const keys = (list, t, f = easeIO) => { // [[t, value]…] → eased value
      if (t <= list[0][0]) return list[0][1];
      for (let i = 1; i < list.length; i++) if (t <= list[i][0]) return lerp(list[i - 1][1], list[i][1], f((t - list[i - 1][0]) / (list[i][0] - list[i - 1][0])));
      return list[list.length - 1][1];
    };

    const T = 7.2;
    const TEXT = 'Summarize these board notes into five decisions.';
    // PCR0 as shown in the 05 study; wire to the live verifier (lib/nitro/browser-verify.mjs) before shipping
    const PUB = '3ef8 468b feaf b866 …';
    const BAD = 'a71c 05d9 3b2e 4f07 …'; // no character in common with PUB, position by position
    const CAPS = [
      [0.7, 1.62, 'Encrypted in your browser before it leaves.'],
      [2.3, 2.96, 'PayPerQ sees the envelope, not the words.'],
      [3.0, 3.66, 'Our staff can’t log in to the enclave.'],
      [4.18, 4.96, 'Opened only inside an AWS Nitro Enclave.'],
      [5.3, 5.96, 'The provider gets the prompt, never your IP.'],
      [6.25, T + 1, 'Your browser checks the enclave’s code first.'],
    ];

    const $ = (s) => fm.querySelector(s);
    const pin = track.querySelector('.fm-pin'), world = $('.fm-world');
    const el = {
      dev: $('.fm-dev'), server: $('.fm-server'), log: $('.fm-log'), logIn: $('.fm-log-in'), logHit: $('.fm-log-hit'), face: $('.fm-face'),
      vault: $('.fm-vault'), room: $('.fm-room'), pin: $('.fm-port[data-p="in"]'), pout: $('.fm-port[data-p="out"]'),
      cursor: $('.fm-cursor'), term: $('.fm-term'), cmd: $('.fm-cmd'), deny: $('.fm-deny'),
      provider: $('.fm-provider'), msg: $('.fm-msg'), t: $('.fm-t'), bloom: $('.fm-bloom'), fibres: [...fm.querySelectorAll('.fm-fibre')],
      ver: $('.fm-ver'), got: $('.fm-got'), rowGot: $('.fm-row.got'), verdict: $('.fm-verdict'), verdictText: $('.fm-verdict span'), tamper: $('.fm-tamper'),
      cap: $('.fm-cap'), scrub: $('.fm-scrub'),
    };

    // ciphertext: real AES-GCM over the message, as hex; a seeded stand-in until WebCrypto answers
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

    // the request log: other people's requests scroll by; only metadata is readable
    {
      const models = ['gpt-5.4', 'claude-sonnet-5', 'gemini-3-pro', 'grok-5', 'deepseek-v4', 'claude-opus-5', 'qwen-4-max'];
      let s = 3, rows = [];
      const r = (n) => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s % n; };
      for (let i = 0; i < 32; i++) {
        const ip = `${[198, 203, 192][r(3)]}.${[51, 0, 0][r(3)]}.${[100, 113, 2][r(3)]}.${r(250) + 2}`;
        rows.push(`14:0${r(10)}:${String(r(60)).padStart(2, '0')}  ${ip.padEnd(15)} ${models[r(models.length)].padEnd(16)}${String(r(3000) + 120).padStart(5)} tok  ${'█'.repeat(6 + r(10))}`);
      }
      el.logIn.textContent = rows.concat(rows).join('\n');
    }

    // ---------- layout: a wide stage lays the journey left to right, a tall one top to bottom ----------
    let L = null, lines = [], cipherLines = [];
    const place = (e, r) => { e.style.left = r.x + 'px'; e.style.top = r.y + 'px'; if (r.w != null) e.style.width = r.w + 'px'; if (r.h != null) e.style.height = r.h + 'px'; };
    const pad = (r, p) => ({ x: r.x - p, y: r.y - p, w: r.w + 2 * p, h: r.h + 2 * p });
    const union = (...rs) => { const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y)); return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y }; };

    function wrap() {
      const probe = document.createElement('span'); probe.className = 'fm-t'; probe.style.cssText = 'position:absolute;visibility:hidden'; probe.textContent = '0'.repeat(20);
      world.appendChild(probe); const cw = probe.getBoundingClientRect().width / 20 / (L.scaleNow || 1); probe.remove();
      L.cw = cw;
      const cols = Math.max(14, Math.floor((L.msgW - 34) / cw));
      lines = []; let line = '';
      for (const w of TEXT.split(' ')) { if (line && (line + ' ' + w).length > cols) { lines.push(line); line = w; } else line = line ? line + ' ' + w : w; }
      lines.push(line);
      let k = 0; cipherLines = lines.map((l) => { const c = cipherHex.slice(k, k + l.length); k += l.length; return c; });
    }

    function layout() {
      const sw = fm.clientWidth, sh = fm.clientHeight;
      const wide = false; // the journey always runs top to bottom (user request); the wide layout code stays below for reference
      world.style.transform = 'none'; L = { sw, sh, wide, scaleNow: 1 };
      const msgW = wide ? 330 : 300; L.msgW = msgW;
      el.msg.style.width = msgW + 'px';
      wrap(); el.t.textContent = lines.join('\n');
      const mh = el.msg.offsetHeight || 130; L.mh = mh;
      const wall = 22; L.wall = wall; el.vault.style.setProperty('--wall', wall + 'px');
      el.vault.classList.toggle('wide', wide); el.vault.classList.toggle('tall', !wide);
      let B, S, Lg, V, P, U, cross, term, hitTop;
      if (wide) {
        const c = 640; cross = c;
        B = { x: 120, w: 600 }; B.h = 38 + 30 + mh + 18 + 46 + 18; B.y = c - mh / 2 - 38 - 30;
        S = { x: 880, y: c - 340, w: 1000, h: 680 };
        Lg = { x: S.x + 30, y: c - 200, w: 400, h: 400 };
        V = { x: 1350, y: c - 250, w: 500, h: 500 };
        P = { x: 1990, w: 420 }; P.h = 70 + mh + 30; P.y = c - mh / 2 - 70;
        U = { dev: B.x + B.w / 2, edge: B.x + B.w, log: Lg.x + Lg.w / 2, encIn: V.x + wall / 2, enc: V.x + V.w / 2, encOut: V.x + V.w - wall / 2, pro: P.x + P.w / 2 };
        el.pin.style.cssText = `left:-1px;top:${V.h / 2 - 34}px;width:${wall + 2}px;height:68px`;
        el.pout.style.cssText = `left:${V.w - wall - 1}px;top:${V.h / 2 - 34}px;width:${wall + 2}px;height:68px`;
        hitTop = c + mh / 2 + 18 - Lg.y;
        term = { x: Lg.x + 20, y: S.y + S.h - 84 };
        L.cursorFrom = { x: term.x + 170, y: term.y - 6 }; L.cursorTo = { x: V.x + 8, y: c + 170 };
        L.fibrePaths = [`M${B.x + B.w} ${c} L${S.x} ${c}`, `M${Lg.x + Lg.w} ${c} L${V.x} ${c}`, `M${V.x + V.w} ${c} L${P.x} ${c}`];
      } else {
        const c = 190; cross = c;
        B = { x: 8, y: 30, w: 364 }; B.h = 38 + 22 + mh + 16 + 46 + 16;
        S = { x: 2, y: B.y + B.h + 100, w: 376 };
        Lg = { x: 16, y: S.y + 62, w: 348, h: mh + 92 };
        V = { x: 12, y: Lg.y + Lg.h + 30, w: 356 }; V.h = wall * 2 + 46 + mh + 40;
        S.h = V.y + V.h + 24 - S.y;
        P = { x: 12, y: S.y + S.h + 100, w: 356 }; P.h = 62 + mh + 22;
        U = { dev: B.y + 38 + 22 + mh / 2, edge: B.y + B.h, log: Lg.y + 6 + mh / 2, encIn: V.y + wall / 2, enc: V.y + wall + 30 + (V.h - 2 * wall - 30) / 2, encOut: V.y + V.h - wall / 2, pro: P.y + 62 + mh / 2 };
        el.pin.style.cssText = `top:-1px;left:${V.w / 2 - 40}px;height:${wall + 2}px;width:80px`;
        el.pout.style.cssText = `top:${V.h - wall - 1}px;left:${V.w / 2 - 40}px;height:${wall + 2}px;width:80px`;
        hitTop = U.log + mh / 2 + 12 - Lg.y;
        term = { x: S.x + S.w - 186, y: Lg.y + Lg.h - 46 };
        L.cursorFrom = { x: term.x + 60, y: term.y - 12 }; L.cursorTo = { x: V.x + V.w - 90, y: V.y + 6 };
        L.fibrePaths = [`M${c} ${B.y + B.h} L${c} ${S.y}`, `M${c} ${Lg.y + Lg.h} L${c} ${V.y}`, `M${c} ${V.y + V.h} L${c} ${P.y}`];
      }
      const H = Math.max(wide ? 1300 : P.y + P.h + 40, P.y + P.h + 40), W = wide ? 2540 : 380;
      Object.assign(L, { B, S, Lg, V, P, U, cross, W, H });
      place(el.dev, B); place(el.server, S); place(el.vault, V); place(el.provider, P);
      place(el.log, { x: Lg.x - S.x, y: Lg.y - S.y, w: Lg.w, h: Lg.h });
      el.logHit.style.top = hitTop + 'px';
      place(el.term, term);
      const bs = Math.max(V.w, V.h) * 2.4; place(el.bloom, { x: V.x + V.w / 2, y: V.y + V.h / 2, w: bs, h: bs });
      const svg = fm.querySelector('.fm-fibres'); svg.setAttribute('width', W); svg.setAttribute('height', H);
      el.fibres.forEach((f, i) => f.setAttribute('d', L.fibrePaths[i]));
      world.style.width = W + 'px'; world.style.height = H + 'px';
      // camera shots
      L.shots = {
        browser: pad(B, wide ? 70 : 24),
        // vertical: instead of zooming out to the whole column, the camera follows the message down from the browser into the server
        wide: wide ? pad(union(B, S, P), 60) : pad(union(B, { x: S.x, y: S.y, w: S.w, h: Lg.y + Lg.h - S.y }), 16),
        server: pad(S, wide ? 30 : 10),
        vault: pad(V, wide ? 60 : 14),
        out: pad(union(V, P), wide ? 40 : 12),
        provider: pad(P, wide ? 70 : 20),
      };
    }

    // camera: shots fit into the stage, leaving room for the caption; moves ease between them
    const SHOTS = [[0, 'browser'], [1.35, 'browser'], [1.85, 'wide'], [2.15, 'wide'], [2.5, 'server'], [3.65, 'server'], [4.05, 'vault'], [4.95, 'vault'], [5.3, 'out'], [5.6, 'provider'], [T, 'provider']];
    function camera(t) {
      const fit = (r) => { const s = Math.min(L.sw * 0.92 / r.w, (L.sh - 120) * 0.94 / r.h, 1.7); /* capped so close-ups do not blow text up on wide screens */ return { cx: r.x + r.w / 2, cy: r.y + r.h / 2, ls: Math.log(s) }; };
      let a = SHOTS[0], b = SHOTS[0];
      for (let i = 1; i < SHOTS.length; i++) { if (t <= SHOTS[i][0]) { a = SHOTS[i - 1]; b = SHOTS[i]; break; } a = b = SHOTS[i]; }
      const A = fit(L.shots[a[1]]), Bq = fit(L.shots[b[1]]);
      const k = a === b ? 0 : easeIO(clamp((t - a[0]) / (b[0] - a[0])));
      const s = Math.exp(lerp(A.ls, Bq.ls, k)), cx = lerp(A.cx, Bq.cx, k), cy = lerp(A.cy, Bq.cy, k);
      L.scaleNow = s;
      world.style.transform = `translate(${L.sw / 2 - cx * s}px, ${(L.sh - 96) / 2 - cy * s}px) scale(${s})`;
    }

    // where the message is along the journey's main axis
    const MOVES = () => [[1.6, L.U.dev], [2.25, L.U.log], [3.8, L.U.log], [4.12, L.U.encIn], [4.32, L.U.enc], [4.95, L.U.enc], [5.15, L.U.encOut], [5.55, L.U.pro]];

    // ---------- per-frame ----------
    let shown = -1, tampered = false, tamperAt = -1e9, hitShown = false;

    function charState(i, r, c, t, u) {
      if (t < 1.25) {
        const e = ramp(t, 0.75, 1.2), band = 7, front = e * (TEXT.length + band);
        return i < front - band ? 'c' : i < front ? 'n' : 'p';
      }
      // this character's place on the main axis
      const pos = L.wide ? u - L.msgW / 2 + 16 + (c + 0.5) * L.cw : u - L.mh / 2 + 14 + (r + 0.5) * 22.4;
      const { V, P, wall } = L;
      const zones = L.wide ? [[V.x + wall, V.x + V.w - wall], [P.x, P.x + P.w]] : [[V.y + wall, V.y + V.h - wall], [P.y, P.y + P.h]];
      let st = 'c';
      for (const [a, b] of zones) { const d = Math.min(pos - a, b - pos); if (d > 4) return 'p'; if (d > -10) st = 'n'; }
      return st;
    }

    function textHTML(t, u, typed) {
      let out = '', i = 0;
      for (let r = 0; r < lines.length && i < typed; r++) {
        if (r) { out += '\n'; i++; }
        let run = '', cls = null;
        const flush = () => { if (run) out += cls === 'p' ? run : `<span class="${cls}">${run}</span>`; run = ''; };
        for (let c = 0; c < lines[r].length && i < typed; c++, i++) {
          let st = charState(i, r, c, t, u);
          if (st === 'n' && reduce.matches) st = 'c';
          const ch = st === 'p' ? lines[r][c] : st === 'c' ? (cipherLines[r][c] || '0') : rnd(HEX);
          if (st !== cls) { flush(); cls = st; }
          run += ch;
        }
        flush();
      }
      if (typed < TEXT.length) out += '<span class="cur"></span>';
      return out;
    }

    function caption(t) {
      const c = CAPS.find(([a, b]) => t >= a && t < b);
      if (!c) { el.cap.textContent = ''; return; }
      const [a, b, text] = c, k = ramp(t, a, a + 0.22), band = 5, front = k * (text.length + band);
      let out = '';
      for (let i = 0; i < text.length; i++) {
        if (i < front - band || reduce.matches) out += text[i];
        else if (i < front) out += text[i] === ' ' ? ' ' : `<span class="n">${rnd(GLYPH)}</span>`;
      }
      el.cap.innerHTML = out;
      el.cap.style.opacity = 1 - ramp(t, b - 0.08, b);
    }

    function hashHTML(target, k) {
      let out = 'PCR0 ';
      for (let i = 0; i < target.length; i++) {
        const ch = target[i];
        if (ch === ' ' || ch === '…' || i / target.length >= k) { out += ch; continue; }
        out += `<span class="${ch === PUB[i] ? 'ok' : 'no'}">${ch}</span>`;
      }
      return out;
    }

    function render(now) {
      if (!L) return;
      const t = shown < 0 ? 0 : shown;
      camera(t);
      const { U, wide, cross, msgW, mh } = L;

      // the message
      const typed = reduce.matches ? TEXT.length : Math.floor(ramp(t, 0.04, 0.55) * TEXT.length);
      const u = keys(MOVES(), t);
      // squeeze through the ports
      const near = (p) => clamp(1 - Math.abs(u - p) / ((wide ? msgW : mh) / 2 + 24));
      const sq = Math.max(near(U.encIn), near(U.encOut));
      const sx = wide ? 1 : 1 - 0.7 * sq, sy = wide ? 1 - 0.5 * sq : 1;
      const x = wide ? u - msgW / 2 : cross - msgW / 2, y = wide ? cross - mh / 2 : u - mh / 2;
      el.msg.style.transform = `translate(${x}px, ${y}px) scale(${sx}, ${sy})`;
      el.t.innerHTML = textHTML(t, u, typed);
      const inside = t > 4.2 && t < 5.1;
      el.msg.classList.toggle('hot', inside);
      el.msg.classList.toggle('sealed', t > 1.2 && !inside && t < 5.5);
      el.msg.classList.toggle('read', t > 2.3 && t < 3.0);
      el.msg.style.setProperty('--strike', ease(ramp(t, 5.5, 5.72)));
      el.dev.classList.toggle('sent', t > 1.3 && t < 1.55);
      el.vault.style.setProperty('--pg', (0.35 + 0.65 * sq).toFixed(2));

      // fibres light while the message runs through them
      el.fibres[0].classList.toggle('lit', t > 1.6 && t < 2.25);
      el.fibres[1].classList.toggle('lit', t > 3.8 && t < 4.12);
      el.fibres[2].classList.toggle('lit', t > 5.15 && t < 5.55);

      // the log: ambient scroll; our line prints when the message is read
      el.logIn.style.transform = `translateY(${-((now * 0.012) % (24 * 32))}px)`;
      const hit = ramp(t, 2.3, 2.42);
      el.logHit.style.opacity = hit; el.logHit.style.transform = `translateX(${(1 - hit) * -8}px)`;

      // someone tries to get in
      const termO = ramp(t, 2.95, 3.02) * (1 - ramp(t, 3.66, 3.76));
      el.term.style.opacity = termO;
      el.cmd.textContent = '$ ' + 'ssh enclave'.slice(0, Math.round(ramp(t, 3.0, 3.18) * 11));
      el.deny.style.opacity = ramp(t, 3.4, 3.44);
      const ck = easeIO(ramp(t, 3.08, 3.38)), back = ease(ramp(t, 3.38, 3.5));
      const cxp = lerp(L.cursorFrom.x, L.cursorTo.x, ck) + (wide ? -26 : 0) * back, cyp = lerp(L.cursorFrom.y, L.cursorTo.y, ck) + (wide ? 0 : -26) * back;
      el.cursor.style.opacity = ramp(t, 3.04, 3.1) * (1 - ramp(t, 3.66, 3.76));
      el.cursor.style.transform = `translate(${cxp}px, ${cyp}px)`;
      const hitNow = t > 3.38 && t < 3.6;
      if (hitNow && !hitShown) { el.vault.classList.remove('hit'); void el.vault.offsetWidth; el.vault.classList.add('hit'); }
      hitShown = hitNow;

      // the enclave: warm while it holds the words; one bloom of light when they come back
      const warm = ease(ramp(t, 4.15, 4.45)) * (1 - ease(ramp(t, 4.95, 5.2)));
      el.room.style.setProperty('--warm', warm.toFixed(3));
      el.room.style.setProperty('--breath', (0.5 + 0.5 * Math.sin(now / 900)).toFixed(3));
      el.bloom.style.opacity = (warm * 0.9).toFixed(3);
      el.provider.style.setProperty('--pl', ease(ramp(t, 5.45, 5.65)).toFixed(3));

      // last scene: the film cuts to the browser checking the enclave
      const out = ease(ramp(t, 5.95, 6.2)), vin = ease(ramp(t, 6.15, 6.4));
      world.style.opacity = 1 - out;
      el.ver.style.opacity = vin; el.ver.style.visibility = vin ? 'visible' : 'hidden';
      const vs = wide ? Math.min(1.15, L.sw / 640) : 1;
      el.ver.style.transform = `translate(-50%, calc(-50% + ${(1 - vin) * 14}px)) scale(${vs})`;
      const slide = easeIO(ramp(t, 6.25, 6.55));
      el.rowGot.style.setProperty('--in', `${(1 - slide) * 140}px`); el.rowGot.style.setProperty('--io', slide.toFixed(3));
      const scr = clamp((now - tamperAt) / 650);
      let target = tampered ? BAD : PUB;
      if (scr < 1) target = [...target].map((ch, i) => (ch === ' ' || ch === '…' || i / target.length < scr) ? ch : rnd(HEX)).join('');
      el.got.innerHTML = hashHTML(target, scr < 1 ? 0 : ease(ramp(t, 6.55, 6.85)));
      const vo = ease(ramp(t, 6.82, 6.95)) * (scr < 1 ? 0 : 1);
      el.verdict.style.setProperty('--vo', vo); el.verdict.style.setProperty('--ck', 1 - vo);
      el.ver.classList.toggle('ok', !tampered && vo > 0.5);
      el.ver.classList.toggle('bad', tampered && scr >= 1);
      el.verdictText.textContent = tampered ? 'Doesn’t match. Nothing is sent.' : 'Matches the published build. Safe to send.';
      const to = ease(ramp(t, 6.9, 7.05));
      el.tamper.style.opacity = to; el.tamper.style.pointerEvents = to > .5 ? 'auto' : 'none'; el.tamper.tabIndex = to > .5 ? 0 : -1;
      el.tamper.textContent = tampered ? 'Show the real build' : 'Try a modified build';

      caption(t);
      el.scrub.style.setProperty('--t', (t / T).toFixed(4));
    }

    // ---------- scroll → t ----------
    let unit = 500, pinTop = 64;
    const sizeTrack = () => {
      unit = Math.max(380, innerHeight * 0.62);
      pinTop = parseFloat(getComputedStyle(pin).top) || 64;
      track.style.height = pin.offsetHeight + unit * (T + 0.4) + 'px';
      track.dataset.unit = unit; track.dataset.pinTop = pinTop; track.dataset.t = T;
    };
    const goalT = () => clamp((pinTop - track.getBoundingClientRect().top) / unit, 0, T);

    let running = false, visible = false, last = 0;
    function frame(now) {
      const goal = goalT();
      const k = 1 - Math.pow(0.86, Math.min(6, (now - (last || now)) / 16.7 || 1)); last = now;
      shown = shown < 0 || reduce.matches ? goal : shown + (goal - shown) * k;
      if (Math.abs(goal - shown) < 0.0005) shown = goal;
      render(now);
      if (visible) requestAnimationFrame(frame); else { running = false; last = 0; }
    }
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !running) { running = true; requestAnimationFrame(frame); } }).observe(fm);
    el.tamper.addEventListener('click', () => { tampered = !tampered; tamperAt = performance.now(); });
    new ResizeObserver(() => { sizeTrack(); layout(); render(performance.now()); }).observe(fm);
    addEventListener('resize', sizeTrack);
    document.fonts && document.fonts.ready.then(() => { layout(); render(performance.now()); });
    sizeTrack(); layout(); render(performance.now());
  })();
