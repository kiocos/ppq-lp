import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, F, CIPHER, PCR_SHORT, PCR_BAD, HEX, Caption, CipherGlitch, Fonts, Grain, Scanlines, Vignette, bump, clamp, ease, easeIO, easeOut, keys, lerp, noiseChar, ramp, wrapMono } from './lib';
import { BarChrome, Browser, Cursor, Fibre, MSG, Message, Provider, R, Server, Term, Vault, WORLD, CharState } from './parts';

/**
 * The enclave explainer, 48 s: a 5 s opening title, then the film itself (43 s). One subject (your message) travels top to bottom: your browser → PayPerQ's
 * server (its log shows only the envelope) → an admin bounces off the enclave wall → the enclave, where the
 * words come back in warm light → the provider, without your IP. Then the browser checks the enclave's
 * fingerprint (a modified build fails), and an end card. Captions are part of the film.
 */
export const OPEN = 5; // the opening title card; every time below the opening is film time (t = 0 when the film starts)
export const DURATION = OPEN + 43;
const TEXT = 'Summarize these board notes into five decisions.';
const CAPS: Array<[number, number, string]> = [
  [0.6, 3.7, 'You send a message.'],
  [3.8, 7.0, 'Your words leave your device encrypted.'],
  [8.2, 10.0, 'PayPerQ relays it.'],
  [10.0, 12.3, 'Your conversation stays unreadable to us.'],
  [12.4, 15.6, 'Not even our staff can log in to the enclave.'],
  [16.8, 19.6, 'Decrypted inside isolated hardware.'],
  [19.6, 22.4, 'Isolated hardware: no logins, no disk.'],
  [23.6, 27.0, 'Know what your model provider can see.'],
  [27.6, 31.2, 'Your browser checks before sending.'],
  [31.2, 34.0, 'It matches the public build. Verified.'],
  [34.0, 37.6, 'A modified build wouldn’t match, so nothing is sent.'],
];
const GLITCH: Array<[number, number, number]> = [[-0.6, -0.05, 0.75], [-0.4, 0.7, 1], [4.0, 4.45, 0.35], [13.9, 14.3, 0.55], [27.0, 27.6, 1], [34.2, 34.55, 0.45], [37.6, 37.85, 0.3], [38.25, 38.85, 1], [42.5, 43.2, 0.7]];

const pad = (r: R, p: number): R => ({ x: r.x - p, y: r.y - p, w: r.w + 2 * p, h: r.h + 2 * p });
const union = (...rs: R[]): R => { const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y)); return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y }; };

export const Film: React.FC<{ portrait?: boolean }> = ({ portrait = false }) => {
  const frame = useCurrentFrame();
  const { fps, width: fw, height: fh } = useVideoConfig();
  const T = frame / fps, t = T - OPEN;
  const { B, S, Lg, V, P, U, wall, cx } = WORLD;
  const capSize = portrait ? 50 : 46, capBottom = portrait ? 110 : 76, capSpace = portrait ? 300 : 210;

  // ---------- camera ----------
  const shots: Record<string, R> = {
    browser: pad(B, 30), follow1: pad(union(B, Lg), 20), server: pad(union(Lg, { x: V.x, y: V.y, w: V.w, h: 150 }), 26), vault: pad(V, 34), follow2: pad(union(V, P), 20), provider: pad(P, 46),
  };
  const SH: Array<[number, string]> = [[0, 'browser'], [6.4, 'browser'], [7.6, 'follow1'], [8.5, 'server'], [15.4, 'server'], [16.6, 'vault'], [22.4, 'vault'], [23.4, 'follow2'], [24.6, 'provider'], [28, 'provider']];
  const fit = (r: R) => { const s = Math.min(fw * 0.86 / r.w, (fh - capSpace) * 0.9 / r.h, 2.5); return { cx: r.x + r.w / 2, cy: r.y + r.h / 2, ls: Math.log(s) }; };
  let a = SH[0], b = SH[0];
  for (let i = 1; i < SH.length; i++) { if (t <= SH[i][0]) { a = SH[i - 1]; b = SH[i]; break; } a = b = SH[i]; }
  const A = fit(shots[a[1]]), Bq = fit(shots[b[1]]);
  const k = a === b ? 0 : easeIO(clamp((t - a[0]) / (b[0] - a[0])));
  const s = Math.exp(lerp(A.ls, Bq.ls, k)) * lerp(0.86, 1, easeOut(ramp(t, 0, 1.6))) * (1 + 0.012 * Math.sin(t * 0.55));
  const camX = lerp(A.cx, Bq.cx, k), camY = lerp(A.cy, Bq.cy, k);
  const worldTf = `translate(${fw / 2 - camX * s}px, ${(fh - capSpace) / 2 + 20 - camY * s}px) scale(${s})`;

  // ---------- the message ----------
  const { lines, clines } = wrapMono(TEXT, MSG.cols, CIPHER.a);
  const typed = Math.floor(ramp(t, 0.8, 3.2) * TEXT.length);
  const u = keys([[6.6, U.dev], [8.4, U.log], [15.8, U.log], [16.6, U.encIn], [17.2, U.enc], [22.4, U.enc], [23.0, U.encOut], [24.4, U.pro]], t);
  const near = (p: number) => clamp(1 - Math.abs(u - p) / (MSG.h / 2 + 30));
  const sq = Math.max(near(U.encIn), near(U.encOut));
  const msgTop = u - MSG.h / 2;
  const state = (i: number, r: number, c: number): CharState => {
    if (t < 5.7) { const e = ramp(t, 4.0, 5.6), band = 8, front = e * (TEXT.length + band); return i < front - band ? 'c' : i < front ? 'n' : 'p'; }
    const y = msgTop + MSG.pad + r * MSG.lh + MSG.lh / 2;
    let st: CharState = 'c';
    for (const [za, zb] of [[V.y + wall, V.y + V.h - wall], [P.y, P.y + P.h]]) { const d = Math.min(y - za, zb - y) - c * 1.1; if (d > 4) return 'p'; if (d > -12) st = 'n'; }
    return st;
  };
  const hot = ease(ramp(t, 17.0, 17.4)) * (1 - ease(ramp(t, 22.4, 22.8)));
  const read = t > 8.5 && t < 12.3 ? 1 : 0;
  const moving = Math.max(bump(t, 6.6, 8.4), bump(t, 15.8, 16.6), bump(t, 23.0, 24.4));

  // ---------- the admin ----------
  const term = { x: S.x + S.w - 250, y: Lg.y + Lg.h - 74 };
  const cFrom = { x: term.x + 150, y: term.y + 70 }, cTo = { x: V.x + V.w - 130, y: V.y + 6 };
  const ck = easeIO(ramp(t, 12.9, 13.9)), back = ease(ramp(t, 13.9, 14.15));
  const termO = ramp(t, 12.3, 12.5) * (1 - ramp(t, 15.4, 15.8));
  const flash = bump(t, 13.9, 14.5), shake = Math.sin(t * 90) * 4 * bump(t, 13.9, 14.25);

  // ---------- enclave light ----------
  const warm = ease(ramp(t, 17.0, 17.8)) * (1 - ease(ramp(t, 22.4, 23.0)));

  // ---------- scenes ----------
  const openO = 1 - ramp(t, -0.3, -0.2); // a quick cut under the glitch, not a crossfade (orange through dark goes muddy)
  const worldO = ramp(t, -0.15, 0.35) * (1 - ramp(t, 27.15, 27.35));
  const verO = ramp(t, 27.3, 27.5) * (1 - ramp(t, 38.4, 38.6));
  const endO = ramp(t, 38.6, 39.0);
  const glitch = Math.max(...GLITCH.map(([ga, gb, gv]) => gv * bump(t, ga, gb)));

  const world = (
    <div style={{ position: 'absolute', left: 0, top: 0, width: WORLD.W, height: WORLD.H, transformOrigin: '0 0', transform: worldTf, opacity: worldO }}>
      <Fibre x={cx} y1={B.y + B.h} y2={S.y} lit={bump(t, 6.6, 8.4)} />
      <Fibre x={cx} y1={S.y + S.h} y2={P.y} lit={bump(t, 23.0, 24.4)} />
      <Browser r={B} sent={bump(t, 6.1, 6.6)} />
      <Server r={S} lg={Lg} t={t} hit={ramp(t, 8.4, 8.6)} hitTop={U.log + MSG.h / 2 + 14 - Lg.y} ledFrame={frame} />
      <Vault r={V} wall={wall} warm={warm} t={t} portIn={near(U.encIn)} portOut={near(U.encOut)} shake={shake} flash={flash} />
      <Provider r={P} glow={ease(ramp(t, 24.2, 24.8))} />
      {/* bloom: the one big moment */}
      <div style={{ position: 'absolute', left: V.x + V.w / 2 - 520, top: V.y + V.h / 2 - 520, width: 1040, height: 1040, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(243,140,90,.5), rgba(191,60,27,.25) 42%, rgba(191,60,27,0) 100%)', mixBlendMode: 'screen', opacity: warm * 0.9, pointerEvents: 'none' }} />
      <Message x={cx - MSG.w / 2} y={msgTop} sx={1 - 0.72 * sq} sy={1} lines={lines} clines={clines} state={state} typed={typed} frame={frame} hot={hot} read={read} strike={ease(ramp(t, 24.5, 25.1))} caret />
      {/* the light that carries it */}
      <i style={{ position: 'absolute', left: cx - 4, top: msgTop + MSG.h + 8, width: 8, height: 8, borderRadius: '50%', background: '#fff4e8', boxShadow: '0 0 12px 4px rgba(243,162,114,.8), 0 0 40px 10px rgba(191,60,27,.5)', opacity: moving, zIndex: 2 }} />
      <Term x={term.x} y={term.y} o={termO} cmd={'ssh enclave'.slice(0, Math.round(ramp(t, 12.6, 13.4) * 11))} deny={ramp(t, 14.0, 14.1)} />
      <Cursor x={lerp(cFrom.x, cTo.x, ck)} y={lerp(cFrom.y, cTo.y, ck) - 34 * back} o={ramp(t, 12.8, 12.95) * (1 - ramp(t, 15.4, 15.8))} />
    </div>
  );

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: F.body }}>
      <Fonts />
      <CipherGlitch amount={glitch} seed="film">
        <AbsoluteFill style={{ background: `radial-gradient(circle at 1px 1px, rgba(255,255,255,.04) 1px, transparent 0) 0 0 / 28px 28px, ${C.bg}` }}>
          {openO > 0 && <Opening t={T} frame={frame} o={openO} portrait={portrait} />}
          {worldO > 0 && world}
          {verO > 0 && <Verify t={t} frame={frame} o={verO} portrait={portrait} capSpace={capSpace} />}
          {endO > 0 && <EndCard t={t} o={endO} portrait={portrait} />}
        </AbsoluteFill>
      </CipherGlitch>
      {/* a dark band so captions never sit on top of the picture */}
      <AbsoluteFill style={{ pointerEvents: 'none', opacity: 1 - openO, background: `linear-gradient(0deg, rgba(10,9,8,.96) 0, rgba(10,9,8,.85) ${capSpace * 0.45}px, rgba(10,9,8,0) ${capSpace}px)` }} />
      {CAPS.map(([ca, cb, text]) => <Caption key={ca} t={t} a={ca} b={cb} text={text} size={capSize} bottom={capBottom} frame={frame} />)}
      <Scanlines opacity={0.035} />
      <Grain opacity={0.16} />
      <Vignette />
      <AbsoluteFill style={{ background: '#000', opacity: Math.max(1 - ramp(T, 0, 0.5), ramp(t, 42.4, 43)), pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

// ---------- opening: black, with the film's own high-tech details in orange. The screen is the inside of the
// enclave: its hatched walls close in around the title, with the in/out ports, and the build's PCR0 settles at
// the bottom. The title arrives as ciphertext and decrypts left to right, the way the message does in there ----------
const OPEN_TITLE = 'Inside the AWS\u00a0Nitro\u00a0Enclave'; // the product name never breaks across lines
const HATCH = 'repeating-linear-gradient(45deg, rgba(233,125,73,.34) 0 2px, transparent 2px 11px)'; // a touch stronger than the film's vault: the page shows it at ~60%
const EDGE = 'rgba(233,125,73,.6)';
const Opening: React.FC<{ t: number; frame: number; o: number; portrait: boolean }> = ({ t, frame, o, portrait }) => {
  const size = portrait ? 84 : 88;
  const k = easeOut(ramp(t, 0.2, 0.9));
  const band = 6, front = ramp(t, 0.7, 1.7) * (OPEN_TITLE.length + band);
  let i = 0;
  const words = OPEN_TITLE.split(' ').map((w, wi) => {
    const chars = w.split('').map((ch) => {
      const n = i++, plain = n < front - band, noise = !plain && n < front;
      // the plaintext glyph always holds its place, so the line never shifts while it decrypts
      return (
        <span key={n} style={{ position: 'relative' }}>
          <span style={{ opacity: plain ? 1 : 0 }}>{ch}</span>
          {!plain && ch !== '\u00a0' && <span style={{ position: 'absolute', left: -20, right: -20, top: '50%', transform: 'translateY(-50%)', textAlign: 'center', font: `400 ${size * 0.56}px/1 ${F.mono}`, letterSpacing: 0, color: noise ? C.hot : 'rgba(236,235,232,.42)' }}>{noise ? noiseChar(HEX, `open${n}`, frame) : CIPHER.b[n * 2]}</span>}
        </span>
      );
    });
    i++;
    return <React.Fragment key={wi}>{wi > 0 && ' '}<span style={{ whiteSpace: 'nowrap' }}>{chars}</span></React.Fragment>;
  });
  // the enclave walls
  const inset = portrait ? 44 : 60, wall = portrait ? 26 : 30, rad = 26;
  const wk = easeOut(ramp(t, 0.05, 0.95)); // walls close in
  const portLit = 0.35 + 0.65 * bump(t, 0.3, 1.2); // the message comes in through the top port
  const port = (top: boolean) => (
    <i style={{ position: 'absolute', left: '50%', marginLeft: -64, [top ? 'top' : 'bottom']: -1, width: 128, height: wall + 2, background: '#070605', boxShadow: '0 0 0 1px rgba(233,125,73,.6)' } as React.CSSProperties}>
      {[0, 1].map((e) => <i key={e} style={{ position: 'absolute', top: 0, bottom: 0, [e ? 'right' : 'left']: -1, width: 2, background: C.hot, boxShadow: '0 0 10px rgba(243,162,114,.9)', opacity: top ? portLit : 0.35 } as React.CSSProperties} />)}
    </i>
  );
  // the build's fingerprint settles in, character by character
  const pk = ramp(t, 1.0, 1.9), ms = portrait ? 24 : 20, pad = inset + wall + (portrait ? 26 : 30);
  const pcr = PCR_SHORT.split('').map((ch, n) => ch === ' ' || ch === '…' || n / PCR_SHORT.length < pk
    ? <span key={n}>{ch}</span>
    : <span key={n} style={{ color: C.hot }}>{noiseChar(HEX, `opcr${n}`, frame)}</span>);
  const meta: React.CSSProperties = { position: 'absolute', bottom: pad, font: `400 ${ms}px/1 ${F.mono}`, whiteSpace: 'pre', color: 'rgba(233,125,73,.72)', opacity: ramp(t, 0.9, 1.1) };
  return (
    <AbsoluteFill style={{ opacity: o, background: C.bg }}>
      <div style={{ position: 'absolute', inset, borderRadius: rad, border: `1px solid ${EDGE}`, background: `${HATCH}, #0d0b0a`, opacity: wk, transform: `scale(${1 + 0.04 * (1 - wk)})` }}>
        <div style={{ position: 'absolute', inset: wall, borderRadius: rad - 12, border: `1px solid ${EDGE}`, background: '#070605', boxShadow: 'inset 0 0 90px rgba(0,0,0,.9)' }} />
        {port(true)}
        {port(false)}
      </div>
      <span style={{ ...meta, left: pad }}><span style={{ color: 'rgba(233,125,73,.5)' }}>PCR0 </span>{pcr}</span>
      <span style={{ ...meta, right: pad, opacity: ramp(t, 1.6, 1.9) }}>v0.79.0</span>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 10%' }}>
        <div style={{ font: `400 ${size}px/1.1 ${F.display}`, letterSpacing: '-0.03em', color: '#fff', opacity: k, transform: `translateY(${(1 - k) * 18}px)`, maxWidth: portrait ? 900 : 1500, textWrap: 'balance' } as React.CSSProperties}>{words}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- the browser checks the enclave ----------
const Verify: React.FC<{ t: number; frame: number; o: number; portrait: boolean; capSpace: number }> = ({ t, frame, o, portrait, capSpace }) => {
  const w = portrait ? 940 : 1040, hs = portrait ? 36 : 38;
  const slide = easeOut(ramp(t, 28.0, 28.6));
  const toBad = ramp(t, 34.2, 34.8), toGood = ramp(t, 37.6, 38.1);
  const bad = t >= 34.2 && t < 37.6;
  const scr = bad ? toBad : t >= 37.6 ? toGood : 1;
  const target = bad ? PCR_BAD : PCR_SHORT;
  const cmp = bad ? ramp(t, 34.8, 35.4) : t >= 37.6 ? (toGood >= 1 ? 1 : 0) : ramp(t, 29.0, 30.2);
  const vo = bad ? ramp(t, 35.4, 35.6) : t >= 37.6 ? ramp(t, 38.1, 38.2) : ramp(t, 30.3, 30.6);
  const lock = vo > 0.5 ? (bad ? 'bad' : 'ok') : 'open';
  const chars = target.split('').map((ch, i) => {
    if (ch === ' ' || ch === '…') return <span key={i}>{ch}</span>;
    if (i / target.length >= scr) return <span key={i} style={{ color: C.hot }}>{noiseChar(HEX, `v${i}`, frame)}</span>;
    const done = i / target.length < cmp;
    return <span key={i} style={{ color: !done ? C.fg2 : ch === PCR_SHORT[i] ? C.good : C.bad }}>{ch}</span>;
  });
  return (
    <AbsoluteFill style={{ opacity: o, alignItems: 'center', justifyContent: 'center', paddingBottom: capSpace - 60 }}>
      <div style={{ width: w, borderRadius: 18, border: '1px solid rgba(255,255,255,.12)', background: 'linear-gradient(180deg,#1a1816,#121110)', boxShadow: '0 60px 120px -50px #000', overflow: 'hidden', transform: `translateY(${(1 - o) * 16}px)` }}>
        <BarChrome lock={lock as 'open' | 'ok' | 'bad'} />
        <div style={{ display: 'grid', gap: 22, padding: '40px 44px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, transform: `translateX(${(1 - slide) * 220}px)`, opacity: slide }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,.05)', flex: 'none' }}>
              <i style={{ width: 22, height: 22, borderRadius: 5, border: `2px solid ${C.ink}`, background: 'repeating-linear-gradient(45deg, rgba(233,125,73,.5) 0 1.5px, transparent 1.5px 6px)', boxShadow: '0 0 14px rgba(191,60,27,.7)' }} />
            </span>
            <span style={{ font: `400 ${hs}px/1.3 ${F.mono}`, whiteSpace: 'pre', color: C.fg3 }}>PCR0 {chars}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,.05)', color: C.fg2, flex: 'none' }}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg>
            </span>
            <span style={{ display: 'grid', gap: 6 }}>
              <span style={{ font: `400 ${hs}px/1.3 ${F.mono}`, whiteSpace: 'pre', color: C.fg }}><span style={{ color: C.fg3 }}>PCR0 </span>{PCR_SHORT}</span>
              <span style={{ font: `400 ${portrait ? 20 : 18}px/1.3 ${F.mono}`, color: C.fg3 }}>v0.79.0 · PayPerQ/ppq-enclave-proxy</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,.08)', font: `400 ${portrait ? 30 : 28}px/1.3 ${F.body}`, color: bad ? C.bad : C.good, opacity: vo }}>
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" />{bad ? <path d="m9 9 6 6m0-6-6 6" /> : <path d="m8 12.5 3 3 5-6" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - vo} />}</svg>
            {bad ? 'Doesn’t match. Nothing is sent.' : 'Matches the published build. Safe to send.'}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- end card ----------
const EndCard: React.FC<{ t: number; o: number; portrait: boolean }> = ({ t, o, portrait }) => {
  const k = easeOut(ramp(t, 38.8, 39.6)), k2 = easeOut(ramp(t, 39.4, 40.2));
  return (
    <AbsoluteFill style={{ opacity: o, alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 28, flexDirection: 'column' }}>
      <Img src={staticFile('ppq-icon.png')} style={{ width: 64, height: 64, borderRadius: 14, opacity: k, transform: `translateY(${(1 - k) * 14}px)` }} />
      <div style={{ font: `400 ${portrait ? 78 : 86}px/1.08 ${F.display}`, letterSpacing: '-0.03em', color: C.fg, opacity: k, transform: `translateY(${(1 - k) * 18}px)`, maxWidth: portrait ? 900 : 1400 }}>Chat privacy you can verify.</div>
      <div style={{ font: `400 ${portrait ? 24 : 22}px/1.6 ${F.mono}`, color: C.fg3, opacity: k2 }}>AWS Nitro Enclave · reproducible build v0.79.0<br />github.com/PayPerQ/ppq-enclave-proxy</div>
    </AbsoluteFill>
  );
};
