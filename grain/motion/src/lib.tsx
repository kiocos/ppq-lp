import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// ---------- tokens ----------
export const C = {
  bg: '#0b0b0c',
  text: '#ededed',
  dim: 'rgba(237,237,237,0.62)',
  faint: 'rgba(237,237,237,0.5)',
  line: 'rgba(237,237,237,0.22)',
  brand: '#bf3c1b', // PPQ app token, fills with white text
  brandInk: '#e97d49', // PPQ dark-theme ink, for 1px strokes and small text on dark
  select: '#e8e6e1',
};
export const F = {
  mono: '"Geist Mono", ui-monospace, monospace',
  cond: '"Martian Mono", ui-monospace, monospace', // used at font-stretch 75%
};

// ---------- fonts ----------
const FONT_FILES: Array<[string, string, FontFaceDescriptors?]> = [
  ['Geist Mono', 'GeistMono.woff2', { weight: '100 900' }],
  ['Geist', 'Geist.woff2', { weight: '100 900' }],
  ['Martian Mono', 'MartianMono-normal.woff2', { weight: '100 800', stretch: '75% 112.5%' }],
];
let fontsPromise: Promise<unknown> | null = null;
const ensureFonts = () =>
  (fontsPromise ??= Promise.all(
    FONT_FILES.map(([fam, file, d]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, d).load().then((f) => document.fonts.add(f))),
  ));
export const useFontsReady = () => {
  const [ready, setReady] = useState(false);
  const [h] = useState(() => delayRender('canvas-fonts'));
  useEffect(() => {
    ensureFonts().then(() => setReady(true)).catch(() => setReady(true));
  }, []);
  // runs after the layout effect that paints the canvas with the real font
  useEffect(() => { if (ready) continueRender(h); }, [ready, h]);
  return ready;
};
export const Fonts: React.FC = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    ensureFonts().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
  return null;
};

// ---------- deterministic randomness ----------
export const hash = (n: number) => {
  let t = (n | 0) + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const h2 = (a: number, b: number) => hash(a * 73856093 ^ b * 19349663);
export const h3 = (a: number, b: number, c: number) => hash(a * 73856093 ^ b * 19349663 ^ c * 83492791);

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ease = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const ramp = (f: number, a: number, b: number) => ease((f - a) / (b - a));

// ---------- text scramble ----------
// Base64 alphabet: what the prompt actually looks like on the wire, not decoration
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const HEX = '0123456789abcdef';
export const glyph = (seed: number, frame: number, set = B64) => set[Math.floor(h3(seed, Math.floor(frame / 2), 7) * set.length)];

/** progress 0 = fully ciphertext, 1 = fully plaintext. Characters resolve left to right with jitter. */
export const scramble = (text: string, progress: number, frame: number, salt = 0, set = B64) => {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === ' ' && set !== HEX) {
      out += progress > 0.02 ? ' ' : glyph(i + salt * 977, frame, set);
      continue;
    }
    const th = (i / Math.max(1, text.length)) * 0.72 + hash(i * 31 + salt) * 0.28;
    out += progress >= th ? ch : glyph(i + salt * 977, frame, set);
  }
  return out;
};
export const HEXSET = HEX;

/** typed text: n characters visible */
export const typed = (text: string, f: number, start: number, cps = 1.2) => text.slice(0, clamp(Math.floor((f - start) * cps), 0, text.length));

// ---------- selection-block caption ----------
export const Select: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties; accent?: boolean }> = ({ children, size = 30, style, accent }) => (children === '' ? null :
  <span
    style={{
      fontFamily: F.mono,
      fontSize: size,
      lineHeight: 1.42,
      color: accent ? '#fff' : C.bg,
      background: accent ? C.brand : C.select,
      padding: '0.06em 0.32em',
      boxDecorationBreak: 'clone',
      WebkitBoxDecorationBreak: 'clone',
      whiteSpace: 'pre',
      ...style,
    }}
  >
    {children}
  </span>
);

export const Label: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 20, color = C.dim, style }) => (
  <div style={{ fontFamily: F.mono, fontSize: size, color, letterSpacing: '0.01em', whiteSpace: 'pre', ...style }}>{children}</div>
);

// ---------- film grain over everything ----------
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.11 }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const W = 960, H = 540;
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext('2d')!;
    const img = ctx.createImageData(W, H);
    const d = img.data;
    let s = (Math.floor(frame / 1) * 2654435761) >>> 0;
    for (let i = 0; i < d.length; i += 4) {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
      const v = s & 255;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [frame]);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity }}>
      <canvas ref={ref} width={W} height={H} style={{ width: '100%', height: '100%' }} />
    </AbsoluteFill>
  );
};

/** faint dot lattice so the black is never flat */
export const Lattice: React.FC<{ opacity?: number; step?: number }> = ({ opacity = 0.07, step = 24 }) => (
  <AbsoluteFill
    style={{
      opacity,
      backgroundImage: `radial-gradient(circle, ${C.text} 1px, transparent 1.2px)`,
      backgroundSize: `${step}px ${step}px`,
    }}
  />
);

// ---------- glitch strip cut ----------
// Renders children in horizontal strips displaced sideways while `amount` > 0.
export const Glitch: React.FC<{ amount: number; seed?: number; strips?: number; children: React.ReactNode }> = ({ amount, seed = 1, strips = 14, children }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  if (amount <= 0.001) return <AbsoluteFill>{children}</AbsoluteFill>;
  const step = Math.floor(frame / 1);
  // uneven strip heights
  const cuts: number[] = [0];
  for (let i = 1; i < strips; i++) cuts.push(clamp(i / strips + (h3(seed, step, i) - 0.5) * 0.06, 0, 1));
  cuts.push(1);
  cuts.sort((a, b) => a - b);
  return (
    <AbsoluteFill>
      {cuts.slice(0, -1).map((top, i) => {
        const bottom = cuts[i + 1];
        const r = h3(seed + 11, step, i);
        const dx = r < 0.45 ? 0 : (h3(seed + 29, step, i) - 0.5) * width * 0.16 * amount;
        const drop = h3(seed + 41, step, i) < amount * 0.35; // some strips vanish
        return (
          <AbsoluteFill
            key={i}
            style={{
              clipPath: `inset(${(top * 100).toFixed(3)}% 0 ${((1 - bottom) * 100).toFixed(3)}% 0)`,
              transform: `translateX(${dx.toFixed(1)}px)`,
              opacity: drop ? 0 : 1,
            }}
          >
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/** glitch envelope for a scene living in [a, b): hits at both edges */
export const edgeGlitch = (f: number, a: number, b: number, len = 7) => {
  if (f < a + len) return 1 - (f - a) / len;
  if (f > b - len) return (f - (b - len)) / len;
  return 0;
};

// ---------- ciphertext field (ASCII grain) ----------
// Base64 characters whose density follows a slow, soft shape. This is the host's view: bytes it can't read.
export const CipherField: React.FC<{
  width: number;
  height: number;
  cell?: number;
  opacity?: number;
  shape: (u: number, v: number, t: number) => number; // 0..1 density
  seed?: number;
}> = ({ width, height, cell = 14, opacity = 1, shape, seed = 3 }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const ready = useFontsReady();
  const dpr = 1;
  useLayoutEffect(() => {
    if (!ready) return;
    const ctx = ref.current!.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.font = `500 ${Math.round(cell * 0.95)}px "Geist Mono"`;
    ctx.textBaseline = 'top';
    const cw = cell * 0.62, ch = cell * 1.18;
    const cols = Math.ceil(width / cw), rows = Math.ceil(height / ch);
    const t = frame / 30;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const d = shape(x / cols, y / rows, t);
        if (d <= 0.02) continue;
        const r = h3(x + seed * 1000, y, 1);
        if (r > d) continue;
        // characters re-roll at different speeds: a slow shimmer, not rain
        const rate = 3 + Math.floor(h3(x, y, seed) * 9);
        const c = B64[Math.floor(h3(x * 7 + seed, y * 13, Math.floor(frame / rate)) * 64)];
        const a = clamp(0.12 + d * 0.7 * (0.55 + 0.45 * h3(x, y, 5)), 0, 0.92);
        ctx.fillStyle = `rgba(237,237,237,${a.toFixed(3)})`;
        ctx.fillText(c, x * cw, y * ch);
      }
    }
  }, [frame, width, height, cell, shape, seed, ready]);
  return <canvas ref={ref} width={width * dpr} height={height * dpr} style={{ width, height, opacity, display: 'block' }} />;
};

// ---------- noise block: grain-filled surface with a soft light band ----------
export const NoiseBlock: React.FC<{ width: number; height: number; light?: (u: number, v: number, t: number) => number; opacity?: number }> = ({
  width,
  height,
  light = () => 0.5,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const W = Math.round(width / 2), H = Math.round(height / 2);
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext('2d')!;
    const img = ctx.createImageData(W, H);
    const d = img.data;
    const t = frame / 30;
    let s = ((Math.floor(frame / 2) + 17) * 2246822519) >>> 0;
    // light map evaluated on a coarse grid then interpolated (cheap)
    const gx = 48, gy = Math.max(2, Math.round((48 * H) / W));
    const grid = new Float32Array((gx + 1) * (gy + 1));
    for (let j = 0; j <= gy; j++) for (let i = 0; i <= gx; i++) grid[j * (gx + 1) + i] = light(i / gx, j / gy, t);
    for (let y = 0; y < H; y++) {
      const fy = (y / (H - 1)) * gy, j0 = Math.min(gy - 1, Math.floor(fy)), ty = fy - j0;
      for (let x = 0; x < W; x++) {
        const fx = (x / (W - 1)) * gx, i0 = Math.min(gx - 1, Math.floor(fx)), tx = fx - i0;
        const a = grid[j0 * (gx + 1) + i0], b = grid[j0 * (gx + 1) + i0 + 1];
        const c = grid[(j0 + 1) * (gx + 1) + i0], e = grid[(j0 + 1) * (gx + 1) + i0 + 1];
        const L = (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + e * tx) * ty;
        s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
        const n = (s & 1023) / 1023;
        // stochastic screening: brightness decides how many pixels light up
        const v = n < L ? 120 + (s >>> 10 & 127) : 14 + (s >>> 12 & 15);
        const k = (y * W + x) * 4;
        d[k] = d[k + 1] = d[k + 2] = v;
        d[k + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [frame, W, H, light]);
  return <canvas ref={ref} width={W} height={H} style={{ width, height, opacity, display: 'block' }} />;
};

/** plain caption: the sentence each scene says */
export const Caption: React.FC<{ children: string; size?: number; style?: React.CSSProperties }> = ({ children, size = 32, style }) => (
  <div style={{ fontFamily: F.mono, fontSize: size, color: C.text, whiteSpace: 'pre', letterSpacing: '-0.01em', background: children ? C.bg : 'transparent', padding: '6px 14px', margin: '-6px -14px', display: 'inline-block', ...style }}>
    {children}
    {children.length > 0 && <span style={{ display: 'inline-block', width: '0.5em', height: '0.08em', background: C.text, marginLeft: 4, opacity: 0.7 }} />}
  </div>
);
