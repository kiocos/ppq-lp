import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, random, staticFile, useCurrentFrame } from 'remotion';
import type { Palette } from './theme';

const FONT_FILES: Array<[string, string, FontFaceDescriptors?]> = [
  ['Geist', 'Geist.woff2', { weight: '100 900' }],
  ['Geist Mono', 'GeistMono.woff2', { weight: '100 900' }],
  ['Martian Mono', 'MartianMono-normal.woff2', { weight: '100 800', stretch: '75% 112.5%' }],
  ['Archivo', 'Archivo-normal.woff2', { weight: '100 900', stretch: '62% 125%' }],
  ['Source Serif 4', 'SourceSerif4-normal.woff2', { weight: '200 900' }],
  ['Funnel Display', 'FunnelDisplay-normal.woff2', { weight: '300 800' }],
  ['Departure Mono', 'DepartureMono-Regular.woff2'],
  ['JetBrains Mono', 'JetBrainsMono-normal.woff2', { weight: '100 800' }],
];

let fontsPromise: Promise<unknown> | null = null;
const loadFonts = () => {
  if (!fontsPromise) {
    fontsPromise = Promise.all(
      FONT_FILES.map(([family, file, desc]) =>
        new FontFace(family, `url(${staticFile('fonts/' + file)})`, desc).load().then((f) => document.fonts.add(f)),
      ),
    );
  }
  return fontsPromise;
};

export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    loadFonts().then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
  return null;
};

// Film grain: a tiled noise image whose offset jumps every two frames (cheap and loop-safe)
export const Grain: React.FC<{ opacity: number; blend?: 'overlay' | 'soft-light' | 'normal' }> = ({ opacity, blend = 'overlay' }) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 2);
  const x = Math.floor(random('gx' + step) * 200);
  const y = Math.floor(random('gy' + step) * 200);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: blend, opacity }}>
      <svg width="100%" height="100%">
        <filter id="grainf">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={step % 7} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect x={-x} y={-y} width="120%" height="120%" filter="url(#grainf)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Logo: React.FC<{ name: string; size: number; p: Palette; mono?: boolean; style?: React.CSSProperties }> = ({ name, size, p, mono, style }) => (
  <img
    src={staticFile(`logos/models/${name}.svg`)}
    style={{ width: size, height: size, objectFit: 'contain', filter: mono && p.invertMonoLogos ? 'invert(1)' : undefined, ...style }}
  />
);

// Deterministic scramble: progress 0 = plaintext, 1 = ciphertext
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
export const scramble = (text: string, progress: number, seed: string, frame: number) => {
  if (progress <= 0) return text;
  const tick = Math.floor(frame / 2);
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === ' ' && progress < 0.98) { out += ' '; continue; }
    const threshold = (i / Math.max(1, text.length)) * 0.55 + random(seed + i) * 0.45;
    if (progress >= threshold) {
      out += GLYPHS[Math.floor(random(seed + i + ':' + tick) * GLYPHS.length)];
    } else out += ch;
  }
  return out;
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const prog = (frame: number, start: number, end: number) => ease(clamp01((frame - start) / (end - start)));
