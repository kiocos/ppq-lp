import React, { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

const FONT_FILES: Array<[string, string, FontFaceDescriptors?]> = [
  ['Geist', 'Geist.woff2', { weight: '100 900' }],
  ['Geist Mono', 'GeistMono.woff2', { weight: '100 900' }],
  ['Archivo', 'Archivo-normal.woff2', { weight: '100 900', stretch: '62% 125%' }],
  ['Barlow Condensed', 'BarlowCondensed-500.woff2', { weight: '500' }],
  ['Barlow Condensed', 'BarlowCondensed-600.woff2', { weight: '600' }],
  ['Barlow Condensed', 'BarlowCondensed-700.woff2', { weight: '700' }],
  ['Big Shoulders', 'BigShoulders-100-900.woff2', { weight: '100 900' }],
];

let fontsPromise: Promise<unknown> | null = null;
const loadFonts = () => {
  if (!fontsPromise) {
    fontsPromise = Promise.all(FONT_FILES.map(([family, file, desc]) => new FontFace(family, `url(${staticFile('fonts/' + file)})`, desc).load().then((f) => document.fonts.add(f))));
  }
  return fontsPromise;
};

export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => { loadFonts().then(() => continueRender(handle)).catch(() => continueRender(handle)); }, [handle]);
  return null;
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const smooth = (t: number) => { const x = clamp01(t); return x * x * (3 - 2 * x); };
export const easeInOut = (t: number) => { const x = clamp01(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Deterministic hash noise in [0,1)
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
// Smooth 1D value noise, periodic over `period` integer steps (loop-safe)
export const vnoise = (x: number, period: number, seed = 0) => {
  const i = Math.floor(x); const f = x - i;
  const a = hash(((i % period) + period) % period + seed * 101);
  const b = hash((((i + 1) % period) + period) % period + seed * 101);
  return lerp(a, b, f * f * (3 - 2 * f));
};
