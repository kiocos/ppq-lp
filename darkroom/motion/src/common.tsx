// Darkroom shared parts: fonts, deterministic noise fields, develop masks, grain, safelight glow
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile } from 'remotion';

const FONT_FILES: Array<[string, string, FontFaceDescriptors?]> = [
  ['Geist', 'Geist.woff2', { weight: '100 900' }],
  ['Geist Mono', 'GeistMono.woff2', { weight: '100 900' }],
];
let fontsPromise: Promise<unknown> | null = null;
export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    if (!fontsPromise) fontsPromise = Promise.all(FONT_FILES.map(([f, file, d]) => new FontFace(f, `url(${staticFile('fonts/' + file)})`, d).load().then((ff) => document.fonts.add(ff))));
    fontsPromise.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
  return null;
};

// Amber of the safelight = PayPerQ orange, warmed toward the flame's core
export const AMBER: [number, number, number] = [255, 138, 61];

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const smooth = (t: number) => { const x = clamp01(t); return x * x * (3 - 2 * x); };
export const ease = (t: number) => { const x = clamp01(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const prog = (f: number, a: number, b: number) => ease((f - a) / (b - a));
export const lin = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));

// Seeded PRNG so every render of a frame is identical
const mulberry = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Film-like noise: fine white grain mixed with soft clumps, values 0..1
const fieldCache = new Map<string, Float32Array>();
export const noiseField = (w: number, h: number, seed = 7, clump = 0.45, cell = 9) => {
  const key = `${w}x${h}:${seed}:${clump}:${cell}`;
  const hit = fieldCache.get(key);
  if (hit) return hit;
  const rnd = mulberry(seed);
  const gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2;
  const grid = new Float32Array(gw * gh).map(() => rnd());
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const gy = y / cell, y0 = Math.floor(gy), ty = smooth(gy - y0);
    for (let x = 0; x < w; x++) {
      const gx = x / cell, x0 = Math.floor(gx), tx = smooth(gx - x0);
      const a = grid[y0 * gw + x0], b = grid[y0 * gw + x0 + 1], c = grid[(y0 + 1) * gw + x0], d = grid[(y0 + 1) * gw + x0 + 1];
      const v = (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
      out[y * w + x] = v * clump + rnd() * (1 - clump);
    }
  }
  fieldCache.set(key, out);
  return out;
};

const canvasFor = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
};

/**
 * Develop mask as a PNG data URL. t = 0 shows nothing, t = 1 shows everything.
 * priority(x, y) in 0..1 (normalized coordinates) says what develops first; noise breaks it into grain.
 */
export const developMask = (w: number, h: number, t: number, priority: (x: number, y: number) => number, opts: { weight?: number; soft?: number; seed?: number } = {}) => {
  const { weight = 0.6, soft = 0.16, seed = 7 } = opts;
  if (t <= 0) return 'none';
  if (t >= 1) return null; // fully developed: no mask
  const n = noiseField(w, h, seed);
  const c = canvasFor(w, h);
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const T = t * (1 + soft);
  for (let y = 0; y < h; y++) {
    const ny = (y + 0.5) / h;
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const v = weight * priority((x + 0.5) / w, ny) + (1 - weight) * n[i];
      const a = clamp01((T - (1 - v)) / soft);
      const o = i * 4;
      d[o] = d[o + 1] = d[o + 2] = 255;
      d[o + 3] = Math.round(a * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
};

/** Grain field lit by the safelight: amber speckle, brighter where the lamp falls. step changes the grain. */
export const grainField = (w: number, h: number, step: number, lamp: { x: number; y: number; r: number }, level = 1, floor = 0.1) => {
  const rnd = mulberry(1000 + step * 7919);
  const c = canvasFor(w, h);
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const aspect = w / h;
  for (let y = 0; y < h; y++) {
    const ny = y / h;
    for (let x = 0; x < w; x++) {
      const nx = x / w;
      const dx = (nx - lamp.x) * aspect, dy = ny - lamp.y;
      const dist = Math.sqrt(dx * dx + dy * dy) / lamp.r;
      const glow = floor + (1 - floor) * Math.exp(-dist * dist * 2.2);
      const g = rnd();
      const speck = g > 0.985 ? 1.6 : g; // sparse brighter grains, like silver clumps catching light
      const L = level * glow * (0.18 + 0.82 * speck) * 0.42;
      const o = (y * w + x) * 4;
      d[o] = Math.min(255, AMBER[0] * L + 6);
      d[o + 1] = Math.min(255, AMBER[1] * L + 5);
      d[o + 2] = Math.min(255, AMBER[2] * L + 4);
      d[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/jpeg', 0.9);
};

/** Neutral fine grain tile for an overlay over everything (subtle) */
export const grainTile = (size: number, step: number) => {
  const rnd = mulberry(5000 + step * 104729);
  const c = canvasFor(size, size);
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  const d = img.data;
  for (let i = 0; i < size * size; i++) {
    const v = Math.round(rnd() * 255);
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
};

export const GrainOverlay: React.FC<{ step: number; opacity: number }> = ({ step, opacity }) => (
  <AbsoluteFill style={{ backgroundImage: `url(${grainTile(256, step % 12)})`, backgroundSize: '256px 256px', mixBlendMode: 'overlay', opacity, pointerEvents: 'none' }} />
);

/** Safelight falloff: a warm cone from a lamp above the frame */
export const Safelight: React.FC<{ x: number; y: number; strength: number }> = ({ x, y, strength }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen', opacity: strength, background: `radial-gradient(ellipse 70% 55% at ${x * 100}% ${y * 100}%, rgba(255,138,61,0.55) 0%, rgba(255,110,40,0.22) 38%, rgba(255,90,30,0.06) 62%, rgba(0,0,0,0) 80%)` }} />
);

// Toning under the safelight: monochrome amber. Color returns when the print is "fixed"
export const SAFE_TONE = 'grayscale(1) sepia(1) saturate(2.7) hue-rotate(-16deg) brightness(1.02)';

/** Round 2 field: near-black with sparse, fine silver grains that only catch light inside the lamp's falloff */
export const grainFieldDark = (w: number, h: number, step: number, lamp: { x: number; y: number; r: number }, level = 1) => {
  const rnd = mulberry(2000 + step * 7919);
  const c = canvasFor(w, h);
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const aspect = w / h;
  for (let y = 0; y < h; y++) {
    const ny = y / h;
    for (let x = 0; x < w; x++) {
      const nx = x / w;
      const dx = (nx - lamp.x) * aspect, dy = ny - lamp.y;
      const dist = Math.sqrt(dx * dx + dy * dy) / lamp.r;
      const glow = 0.04 + 0.96 * Math.exp(-dist * dist * 2.6);
      const g = rnd();
      const L = level * glow * (0.10 + 0.9 * g * g * g) * 0.5;
      const o = (y * w + x) * 4;
      d[o] = Math.min(255, AMBER[0] * L + 7);
      d[o + 1] = Math.min(255, AMBER[1] * L + 6);
      d[o + 2] = Math.min(255, AMBER[2] * L + 5);
      d[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/jpeg', 0.9);
};

/** Duotone under the safelight: grayscale footage multiplied by amber, so black stays black and white becomes amber light */
export const DUO_FILTER = (density: number) => `grayscale(1) contrast(${(1.05 + 0.25 * density).toFixed(3)}) brightness(${(0.8 + 0.42 * density).toFixed(3)})`;
export const DuoTint: React.FC = () => <AbsoluteFill style={{ background: 'rgb(255,152,74)', mixBlendMode: 'multiply' }} />;
