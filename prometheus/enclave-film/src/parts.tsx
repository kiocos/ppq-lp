import React from 'react';
import { Img, random, staticFile } from 'remotion';
import { C, F, HEX, noiseChar, clamp } from './lib';

export type R = { x: number; y: number; w: number; h: number };
const abs = (r: R): React.CSSProperties => ({ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h });

// ---------- world layout: the journey runs top to bottom ----------
export const MSG = { w: 400, h: 152, pad: 20, font: 17, lh: 27, cols: 34 };
export const WORLD = (() => {
  const wall = 26;
  const B: R = { x: 20, y: 40, w: 480, h: 44 + 30 + MSG.h + 22 + 56 + 22 };
  const S: R = { x: 10, y: B.y + B.h + 130, w: 500, h: 0 };
  const Lg: R = { x: 30, y: S.y + 70, w: 460, h: MSG.h + 112 };
  const V: R = { x: 24, y: Lg.y + Lg.h + 36, w: 472, h: wall * 2 + 50 + MSG.h + 46 };
  S.h = V.y + V.h + 28 - S.y;
  const P: R = { x: 40, y: S.y + S.h + 130, w: 440, h: 72 + MSG.h + 26 };
  const U = {
    dev: B.y + 44 + 30 + MSG.h / 2,
    log: Lg.y + 8 + MSG.h / 2,
    encIn: V.y + wall / 2,
    enc: V.y + wall + 50 + MSG.h / 2,
    encOut: V.y + V.h - wall / 2,
    pro: P.y + 72 + MSG.h / 2,
  };
  return { W: 520, H: P.y + P.h + 60, wall, B, S, Lg, V, P, U, cx: 260 };
})();

// ---------- browser ----------
export const Browser: React.FC<{ r: R; sent: number; children?: React.ReactNode }> = ({ r, sent, children }) => (
  <div style={{ ...abs(r), borderRadius: 16, border: '1px solid rgba(255,255,255,.12)', background: 'linear-gradient(180deg,#1a1816,#121110)', boxShadow: '0 40px 80px -40px #000, inset 0 1px rgba(255,255,255,.05)', overflow: 'hidden' }}>
    <BarChrome />
    {children}
    <div style={{ position: 'absolute', left: 18, right: 18, bottom: 22, height: 56, display: 'flex', alignItems: 'center', gap: 14, padding: '0 9px 0 18px', borderRadius: 15, border: '1px solid rgba(255,255,255,.1)', background: '#1c1a18' }}>
      <span style={{ color: C.fg3, fontSize: 22, lineHeight: 1 }}>+</span>
      <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 7, font: `400 14px ${F.body}`, color: C.fg2 }}><Img src={staticFile('logos/claude.svg')} style={{ width: 15, height: 15 }} />Claude Sonnet 5</span>
      <span style={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 11, background: C.brand, transform: `scale(${1 - 0.14 * sent})`, boxShadow: `0 0 0 ${8 * sent}px rgba(191,60,27,${0.22 * sent})` }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5m-6 6 6-6 6 6" /></svg>
      </span>
    </div>
  </div>
);
export const BarChrome: React.FC<{ lock?: 'open' | 'ok' | 'bad' }> = ({ lock = 'open' }) => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.025)' }}>
    {[0, 1, 2].map((i) => <i key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(255,255,255,.14)' }} />)}
    <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 7, height: 28, padding: '0 16px', borderRadius: 8, background: 'rgba(255,255,255,.05)', font: `400 15px ${F.body}`, color: lock === 'ok' ? C.good : lock === 'bad' ? C.bad : C.fg2 }}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" style={{ transform: lock === 'open' ? 'translateY(-2px) rotate(18deg)' : 'none', transformOrigin: '16px 11px' }} /></svg>
      ppq.ai
    </span>
  </div>
);

// ---------- PayPerQ's server, with its request log ----------
const MODELS = ['gpt-5.4', 'claude-sonnet-5', 'gemini-3-pro', 'grok-5', 'deepseek-v4', 'claude-opus-5', 'qwen-4-max'];
const LOG_ROWS = Array.from({ length: 24 }, (_, i) => {
  const r = (k: string) => random(`log-${i}-${k}`);
  const ip = `${[198, 203, 192][Math.floor(r('a') * 3)]}.${[51, 0, 0][Math.floor(r('b') * 3)]}.${[100, 113, 2][Math.floor(r('c') * 3)]}.${Math.floor(r('d') * 250) + 2}`;
  return { ts: `14:0${Math.floor(r('m') * 10)}:${String(Math.floor(r('s') * 60)).padStart(2, '0')}`, ip, model: MODELS[Math.floor(r('e') * MODELS.length)], tok: String(Math.floor(r('f') * 3000) + 120), red: 5 + Math.floor(r('g') * 9) };
});
export const Server: React.FC<{ r: R; lg: R; t: number; hit: number; hitTop: number; ledFrame: number }> = ({ r, lg, t, hit, hitTop, ledFrame }) => {
  const off = (t * 16) % (26 * LOG_ROWS.length);
  const led = (p: number, o: number) => ((ledFrame + o) % p) / p > 0.6;
  return (
    <div style={{ ...abs(r), borderRadius: 20, border: '1px solid rgba(255,255,255,.09)', background: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.05) 1px, transparent 0) 0 0 / 7px 7px, linear-gradient(180deg,#1c1b1a,#121212 50%,#0f0f0f)', boxShadow: '0 60px 120px -60px #000, inset 0 1px rgba(255,255,255,.06)' }}>
      <div style={{ position: 'absolute', left: 24, right: 24, top: 22, display: 'flex', alignItems: 'center', gap: 18, height: 28 }}>
        <Img src={staticFile('ppq-icon.png')} style={{ width: 28, height: 28, borderRadius: 7 }} />
        <span style={{ flex: 1, height: 12, borderRadius: 3, background: 'repeating-linear-gradient(90deg, rgba(0,0,0,.6) 0 3px, rgba(255,255,255,.05) 3px 4px, transparent 4px 7px)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,.6)' }} />
        <span style={{ display: 'flex', gap: 8 }}>
          <i style={{ width: 7, height: 7, borderRadius: '50%', background: C.good, boxShadow: '0 0 8px rgba(95,211,154,.7)' }} />
          {[[39, 0], [63, 12]].map(([p, o], i) => <i key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: led(p, o) ? '#9fb4ff' : '#34302c', boxShadow: led(p, o) ? '0 0 8px rgba(159,180,255,.7)' : 'none' }} />)}
        </span>
      </div>
      <div style={{ position: 'absolute', left: lg.x - r.x, top: lg.y - r.y, width: lg.w, height: lg.h, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 16%, #000 84%, transparent)', maskImage: 'linear-gradient(180deg, transparent, #000 16%, #000 84%, transparent)' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: -off, font: `400 13px/26px ${F.mono}`, color: 'rgba(236,235,232,.18)', whiteSpace: 'pre' }}>
          {[...LOG_ROWS, ...LOG_ROWS].map((row, i) => <div key={i}>{`${row.ts}  ${row.ip.padEnd(15)} ${row.model.padEnd(16)}${row.tok.padStart(5)} tok  ${'█'.repeat(row.red)}`}</div>)}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: hitTop, height: 26, display: 'flex', alignItems: 'center', gap: 7, font: `400 13px/1 ${F.mono}`, whiteSpace: 'nowrap', opacity: hit, transform: `translateX(${(1 - hit) * -10}px)`, background: 'rgba(10,9,8,.85)' }}>
          <span style={{ color: 'rgba(236,235,232,.45)', marginRight: 4 }}>14:02:09</span>
          {['203.0.113.7', 'claude-sonnet-5', '1,840 tok'].map((s) => <b key={s} style={{ fontWeight: 500, padding: '4px 6px', borderRadius: 3, background: C.fg, color: '#0c0b0a' }}>{s}</b>)}
          <span style={{ flex: 1, minWidth: 30, height: 12, borderRadius: 2, background: 'repeating-linear-gradient(90deg, rgba(236,235,232,.25) 0 8px, transparent 8px 10px)' }} />
        </div>
      </div>
    </div>
  );
};

// ---------- the enclave: a vault cut out of the server ----------
export const Vault: React.FC<{ r: R; wall: number; warm: number; t: number; portIn: number; portOut: number; shake: number; flash: number; label?: boolean }> = ({ r, wall, warm, t, portIn, portOut, shake, flash, label = true }) => {
  const breath = 0.5 + 0.5 * Math.sin(t * 2.1);
  const inner: R = { x: wall, y: wall, w: r.w - 2 * wall, h: r.h - 2 * wall };
  const port = (top: boolean, g: number) => (
    <i style={{ position: 'absolute', left: r.w / 2 - 46, top: top ? -1 : r.h - wall - 1, width: 92, height: wall + 2, background: '#070605', boxShadow: '0 0 0 1px rgba(233,125,73,.6)' }}>
      {[0, 1].map((k) => <i key={k} style={{ position: 'absolute', top: 0, bottom: 0, [k ? 'right' : 'left']: -1, width: 2, background: C.hot, boxShadow: '0 0 10px rgba(243,162,114,.9)', opacity: 0.35 + 0.65 * g } as React.CSSProperties} />)}
    </i>
  );
  return (
    <div style={{ ...abs(r), borderRadius: 18, transform: `translateX(${shake}px)` }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 18, border: `1px solid ${flash > 0.01 ? `rgba(223,137,121,${0.45 + 0.55 * flash})` : 'rgba(233,125,73,.45)'}`, background: 'repeating-linear-gradient(45deg, rgba(233,125,73,.22) 0 1.6px, transparent 1.6px 10px), #0d0b0a', boxShadow: `0 0 0 ${7 * flash}px rgba(223,137,121,${0.28 * flash})` }} />
      <div style={{ position: 'absolute', ...{ left: inner.x, top: inner.y, width: inner.w, height: inner.h }, borderRadius: 9, border: '1px solid rgba(233,125,73,.45)', overflow: 'hidden', background: `radial-gradient(70% 70% at 50% 58%, rgba(191,60,27,${0.06 + warm * 0.34}), rgba(191,60,27,0) 75%), #070605`, boxShadow: 'inset 0 0 50px rgba(0,0,0,.9)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 40% at 50% 58%, rgba(255,190,140,.12), transparent 70%)', opacity: 0.35 + breath * 0.5 }} />
        <Embers w={inner.w} h={inner.h} t={t} amount={warm} />
        {label && <span style={{ position: 'absolute', left: 16, top: 14, font: `500 13px/1 ${F.mono}`, letterSpacing: '.06em', textTransform: 'uppercase', padding: '5px 7px', borderRadius: 3, background: C.ink, color: '#140b07' }}>AWS Nitro Enclave</span>}
      </div>
      {port(true, portIn)}
      {port(false, portOut)}
    </div>
  );
};
/** sparks rising inside the enclave while it holds readable words — the only fire in the picture */
export const Embers: React.FC<{ w: number; h: number; t: number; amount: number }> = ({ w, h, t, amount }) => {
  if (amount < 0.02) return null;
  return (
    <>
      {Array.from({ length: 26 }, (_, i) => {
        const sp = 0.12 + random(`em-s${i}`) * 0.18, ph = random(`em-p${i}`), x0 = random(`em-x${i}`);
        const life = (t * sp + ph) % 1;
        const x = x0 * w + Math.sin((t + i) * 1.7) * 10, y = h - life * h * 1.05;
        const o = amount * Math.sin(Math.PI * life) * (0.4 + random(`em-o${i}`) * 0.6);
        const s = 2 + random(`em-z${i}`) * 2.5;
        return <i key={i} style={{ position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: '#ffc9a0', boxShadow: '0 0 8px 2px rgba(243,140,90,.8)', opacity: o }} />;
      })}
    </>
  );
};

// ---------- the provider ----------
export const Provider: React.FC<{ r: R; glow: number }> = ({ r, glow }) => (
  <div style={{ ...abs(r), borderRadius: 18, border: '1px solid rgba(255,255,255,.1)', background: `radial-gradient(70% 80% at 50% 0%, rgba(217,119,87,${0.03 + glow * 0.14}), rgba(217,119,87,0) 70%), linear-gradient(180deg,#181614,#111010)`, boxShadow: '0 40px 80px -40px #000, inset 0 1px rgba(255,255,255,.05)' }}>
    <div style={{ position: 'absolute', left: 20, top: 20, display: 'flex', gap: 16 }}>
      {['claude', 'openai', 'gemini', 'xai'].map((n, i) => (
        <Img key={n} src={staticFile(`logos/${n}.svg`)} style={{ width: 28, height: 28, opacity: i === 0 ? 1 : 0.2, filter: i === 0 ? 'none' : n === 'openai' || n === 'xai' ? 'invert(1) grayscale(1)' : 'grayscale(1)' }} />
      ))}
    </div>
  </div>
);

// ---------- the message ----------
export type CharState = 'p' | 'c' | 'n';
export const Message: React.FC<{ x: number; y: number; sx: number; sy: number; lines: string[]; clines: string[]; state: (i: number, r: number, c: number) => CharState; typed: number; frame: number; hot: number; read: number; strike: number; caret?: boolean }> = ({ x, y, sx, sy, lines, clines, state, typed, frame, hot, read, strike, caret }) => {
  const total = lines.join(' ').length;
  // the row the caret sits on while typing
  let caretRow = lines.length - 1;
  { let acc = 0; for (let r = 0; r < lines.length; r++) { const end = acc + (r ? 1 : 0) + lines[r].length; if (typed <= end) { caretRow = r; break; } acc = end; } }
  let i = 0;
  const rows = lines.map((line, r) => {
    if (r) i++;
    const spans: React.ReactNode[] = [];
    for (let c = 0; c < line.length; c++, i++) {
      if (i >= typed) break;
      const st = state(i, r, c);
      const ch = st === 'p' ? line[c] : st === 'c' ? clines[r][c] || '0' : noiseChar(HEX, `m${i}`, frame);
      spans.push(<span key={c} style={{ color: st === 'p' ? C.fg : st === 'c' ? 'rgba(236,235,232,.42)' : C.hot }}>{ch}</span>);
    }
    const showCaret = caret && typed < total && r === caretRow;
    return <div key={r} style={{ height: MSG.lh }}>{spans}{showCaret && <i style={{ display: 'inline-block', width: 9, height: 20, verticalAlign: -4, background: C.fg2, opacity: Math.floor(frame / 15) % 2 ? 0 : 1 }} />}</div>;
  });
  const sealed = hot < 0.5;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: MSG.w, height: MSG.h, padding: `${MSG.pad - 2}px ${MSG.pad}px 0`, borderRadius: 14, border: `1px solid ${hot > 0.5 ? 'rgba(243,162,114,.8)' : sealed && read < 0.5 ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.18)'}`, background: 'linear-gradient(160deg,#24211e,#171513)', boxShadow: `0 0 0 ${6 * hot}px rgba(191,60,27,${0.16 * hot}), 0 0 ${70 * hot}px rgba(191,60,27,${0.4 * hot}), 0 24px 48px -22px #000`, transform: `scale(${sx}, ${sy})`, transformOrigin: '50% 50%', zIndex: 3 }}>
      <div style={{ font: `400 ${MSG.font}px/${MSG.lh}px ${F.mono}`, whiteSpace: 'pre', height: MSG.lh * 2 }}>{rows.slice(0, 2)}</div>
      <div style={{ display: 'flex', gap: 7, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.08)' }}>
        {['203.0.113.7', 'claude-sonnet-5', '1,840 tok'].map((s, k) => (
          <span key={s} style={{ position: 'relative', font: `400 13px/1 ${F.mono}`, padding: '5px 7px', borderRadius: 4, whiteSpace: 'nowrap', background: read > 0.5 ? C.fg : 'rgba(255,255,255,.06)', color: read > 0.5 ? '#0c0b0a' : C.fg3 }}>
            {s}
            {k === 0 && <i style={{ position: 'absolute', left: 5, right: 5, top: '50%', height: 1.5, background: 'currentColor', transform: `scaleX(${strike})`, transformOrigin: 'left' }} />}
          </span>
        ))}
      </div>
    </div>
  );
};

// ---------- someone at PayPerQ ----------
export const Cursor: React.FC<{ x: number; y: number; o: number }> = ({ x, y, o }) => (
  <svg viewBox="0 0 24 24" width="34" height="34" style={{ position: 'absolute', left: x, top: y, opacity: o, zIndex: 4, filter: 'drop-shadow(0 3px 5px rgba(0,0,0,.6))' }}>
    <path d="M5 3l14 8-6.2 1.6L9.6 19z" fill="#fff" stroke="#0c0b0a" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);
export const Term: React.FC<{ x: number; y: number; o: number; cmd: string; deny: number }> = ({ x, y, o, cmd, deny }) => (
  <div style={{ position: 'absolute', left: x, top: y, zIndex: 4, opacity: o, display: 'grid', gap: 6, padding: '10px 13px', borderRadius: 9, border: '1px solid rgba(255,255,255,.14)', background: 'rgba(16,15,14,.94)', font: `400 15px/1.3 ${F.mono}`, color: C.fg, whiteSpace: 'nowrap', boxShadow: '0 14px 34px -16px #000' }}>
    <span>$ {cmd}<i style={{ display: 'inline-block', width: 8, height: 16, verticalAlign: -3, marginLeft: 2, background: deny > 0.5 ? 'transparent' : C.fg2 }} /></span>
    <span style={{ color: C.bad, opacity: deny }}>✕ no shell access</span>
  </div>
);

// ---------- a glass fibre between places, lit while something runs through it ----------
export const Fibre: React.FC<{ x: number; y1: number; y2: number; lit: number }> = ({ x, y1, y2, lit }) => (
  <div style={{ position: 'absolute', left: x - 1, top: y1, width: 2, height: y2 - y1, borderRadius: 1, background: 'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.12) 20%, rgba(255,255,255,.12) 80%, rgba(255,255,255,0))' }}>
    <div style={{ position: 'absolute', inset: 0, borderRadius: 1, background: 'linear-gradient(180deg, rgba(243,162,114,0), rgba(243,162,114,.75), rgba(243,162,114,0))', opacity: clamp(lit) }} />
  </div>
);
