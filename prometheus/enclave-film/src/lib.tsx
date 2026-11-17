import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, random, staticFile, useCurrentFrame } from 'remotion';

// ---------- palette (PPQ: warm near-black, one ember orange, neutrals; green only for "verified") ----------
export const C = {
  bg: '#0a0908', fg: '#ecebe8', fg2: '#a3a09a', fg3: '#8a867f', line: 'rgba(255,255,255,.08)', border: 'rgba(255,255,255,.14)',
  brand: '#bf3c1b', ink: '#e97d49', hot: '#f3a272', good: '#5fd39a', bad: '#df8979',
};
export const F = { body: "'Geist', system-ui, sans-serif", mono: "'Geist Mono', ui-monospace, monospace", display: "'Instrument Sans', system-ui, sans-serif" };

// ---------- fonts ----------
const FONT_FILES: Array<[string, string, FontFaceDescriptors?]> = [
  ['Geist', 'Geist.woff2', { weight: '100 900' }],
  ['Geist Mono', 'GeistMono.woff2', { weight: '100 900' }],
  ['Instrument Sans', 'InstrumentSans-normal.woff2', { weight: '400 700' }],
];
let fontsPromise: Promise<unknown> | null = null;
export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    fontsPromise ??= Promise.all(FONT_FILES.map(([f, file, d]) => new FontFace(f, `url(${staticFile('fonts/' + file)})`, d).load().then((ff) => document.fonts.add(ff))));
    fontsPromise.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
  return null;
};

// ---------- timing helpers (t in seconds) ----------
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const ease = (x: number) => x * x * (3 - 2 * x);
export const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const bump = (t: number, a: number, b: number) => Math.sin(Math.PI * ramp(t, a, b));
export const keys = (list: Array<[number, number]>, t: number, f = easeIO) => {
  if (t <= list[0][0]) return list[0][1];
  for (let i = 1; i < list.length; i++) if (t <= list[i][0]) return lerp(list[i - 1][1], list[i][1], f((t - list[i - 1][0]) / (list[i][0] - list[i - 1][0])));
  return list[list.length - 1][1];
};
export const HEX = '0123456789abcdef';
export const GLYPH = 'abcdefghijklmnopqrstuvwxyz0123456789';
/** deterministic "random" character: changes every 2 frames */
export const noiseChar = (set: string, seed: string | number, frame: number) => set[Math.floor(random(`${seed}-${Math.floor(frame / 2)}`) * set.length)];

// real AES-256-GCM ciphertext of the two prompts (fixed key and IV so every render is identical), hex
export const CIPHER = {
  a: '768bce6e3b5a37381f6037348e249a2c8f53819dd0b5fa1f5bbbf4918a8b34d791c11454fedbc125ade1386ce2a0946b7380a7516585f4bfcb122f965cbbb88e',
  b: '618cc2652e083f620825333092778b63cd5199cfd8f4fa1443b1f5d5c38422d7c4d35d56f39e8532abe63f2b9879e0549b75e23adea4a99ea96b9184',
};
// published-pcr.json, PayPerQ/ppq-enclave-proxy, build v0.79.0 (Nov 16, 2026)
export const PCR0 = '07cb03ca95c9c68e878e8946c991b9838d1f3f91ffd5d564bba3a00cde5a5bfc363c797fe857b72849d1aca77cc069a5';
export const PCR_SHORT = '07cb 03ca 95c9 c68e 878e …';
export const PCR_BAD = 'b21f 7e04 d3a6 19fb 2c51 …'; // no character in common with the real one, position by position

/** word-wrap into monospace columns; the ciphertext gets the same shape so each character changes in place */
export const wrapMono = (text: string, cols: number, cipher: string) => {
  const lines: string[] = []; let line = '';
  for (const w of text.split(' ')) { if (line && (line + ' ' + w).length > cols) { lines.push(line); line = w; } else line = line ? line + ' ' + w : w; }
  lines.push(line);
  let k = 0; const clines = lines.map((l) => { const c = cipher.slice(k, k + l.length); k += l.length; return c; });
  return { lines, clines };
};

// ---------- film stock ----------
export const Grain: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 2);
  const x = Math.floor(random('gx' + step) * 200), y = Math.floor(random('gy' + step) * 200);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity }}>
      <svg width="100%" height="100%">
        <filter id="grainf"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={step % 9} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect x={-x} y={-y} width="120%" height="120%" filter="url(#grainf)" />
      </svg>
    </AbsoluteFill>
  );
};
export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(110% 85% at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,.7) 100%)' }} />
);
export const Scanlines: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', opacity, background: 'repeating-linear-gradient(180deg, rgba(255,255,255,.6) 0 1px, transparent 1px 3px)' }} />
);

/**
 * The film's own glitch: the picture tears into horizontal slices, an ember channel splits off,
 * and blocks of ciphertext flash over it — encryption made visible. amount 0 → untouched.
 */
export const CipherGlitch: React.FC<{ amount: number; seed: string; children: React.ReactNode }> = ({ amount, seed, children }) => {
  const frame = useCurrentFrame();
  if (amount <= 0.01) return <AbsoluteFill>{children}</AbsoluteFill>;
  const step = Math.floor(frame / 2);
  const r = (k: string) => random(`${seed}-${step}-${k}`);
  const slices = Array.from({ length: 8 }, (_, i) => i).filter((i) => r('on' + i) < 0.25 + amount * 0.6);
  const blocks = Array.from({ length: Math.round(amount * 9) }, (_, i) => i);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${(r('base') - 0.5) * 18 * amount}px)` }}>{children}</AbsoluteFill>
      {slices.map((i) => {
        const y = r('y' + i) * 100, h = 1.5 + r('h' + i) * 12 * amount;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${y}% 0 ${Math.max(0, 100 - y - h)}% 0)`, transform: `translateX(${(r('x' + i) - 0.5) * 220 * amount}px)`, background: C.bg }}>
            {children}
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: 0.5 * amount, transform: `translateX(${10 * amount}px)`, filter: 'grayscale(1) sepia(1) saturate(7) hue-rotate(-18deg) brightness(.75)' }}>{children}</AbsoluteFill>
      {blocks.map((i) => {
        const kind = r('k' + i);
        const bg = kind < 0.45 ? C.brand : kind < 0.7 ? C.fg : '#000';
        const color = kind < 0.45 ? '#2a0d05' : kind < 0.7 ? '#0a0908' : C.hot;
        let txt = ''; for (let j = 0; j < 160; j++) txt += HEX[Math.floor(random(`${seed}-${step}-t${i}-${j}`) * 16)];
        return (
          <div key={'b' + i} style={{ position: 'absolute', left: `${r('bx' + i) * 92}%`, top: `${r('by' + i) * 92}%`, width: `${4 + r('bw' + i) * 16}%`, height: `${1 + r('bh' + i) * 5}%`, background: bg, color, overflow: 'hidden', font: `500 14px/14px ${F.mono}`, letterSpacing: '.1em', wordBreak: 'break-all', opacity: 0.85 }}>{txt}</div>
        );
      })}
    </AbsoluteFill>
  );
};

/** a caption typed in with a scramble at its leading edge, then fading out */
export const Caption: React.FC<{ t: number; a: number; b: number; text: string; size: number; bottom: number; frame: number }> = ({ t, a, b, text, size, bottom, frame }) => {
  if (t < a || t >= b) return null;
  const k = ramp(t, a, a + Math.min(0.9, text.length * 0.022)), band = 5, front = k * (text.length + band);
  const o = 1 - ramp(t, b - 0.25, b);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom, textAlign: 'center', font: `400 ${size}px/1.25 ${F.body}`, letterSpacing: '-0.015em', color: C.fg, opacity: o, textShadow: '0 2px 24px rgba(0,0,0,.9)', padding: '0 6%' }}>
      {text.split('').map((ch, i) => {
        if (i < front - band) return <span key={i}>{ch}</span>;
        if (i < front && ch !== ' ') return <span key={i} style={{ color: C.hot, fontFamily: F.mono, fontSize: size * 0.88 }}>{noiseChar(GLYPH, `cap${a}-${i}`, frame)}</span>;
        return <span key={i} style={{ opacity: 0 }}>{ch}</span>;
      })}
    </div>
  );
};
