// Small demo for the direct page: a tight crop of the real chat (picker, then composer), no captions.
// Sized to be shown at ~520 px wide on desktop and full width on phones while staying legible.
import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp01, easeInOut, lerp } from './common';

const SRC = 'app/video-picker-search-master.mp4'; // 1920 x 1200 units, 383 frames
type K = { f: number; s: number; x: number; y: number };
const at = (keys: K[], f: number) => {
  let i = 0;
  while (i < keys.length - 2 && f >= keys[i + 1].f) i++;
  const a = keys[i], b = keys[i + 1];
  const t = easeInOut((f - a.f) / Math.max(1, b.f - a.f));
  return { s: lerp(a.s, b.s, t), x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
};

export const DEMO_FRAMES = 372;
export const Demo: React.FC<{ portrait?: boolean }> = ({ portrait = false }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const k = W / 1920; // fit width, then zoom with s
  // x/y: normalised centre of the view on the recording
  const keys: K[] = portrait
    ? [
        { f: 0, s: 3.4, x: 0.45, y: 0.5 },
        { f: 146, s: 3.4, x: 0.45, y: 0.53 },
        { f: 182, s: 3.4, x: 0.44, y: 0.79 },
        { f: 262, s: 3.4, x: 0.44, y: 0.79 },
        { f: 292, s: 3.4, x: 0.585, y: 0.8 },
        { f: DEMO_FRAMES, s: 3.4, x: 0.585, y: 0.8 },
      ]
    : [
        { f: 0, s: 1.9, x: 0.52, y: 0.54 },
        { f: 146, s: 1.9, x: 0.52, y: 0.56 },
        { f: 182, s: 1.9, x: 0.56, y: 0.72 },
        { f: DEMO_FRAMES, s: 1.9, x: 0.56, y: 0.72 },
      ];
  const c = at(keys, f);
  const vw = 1920 * k * c.s, vh = 1200 * k * c.s;
  // keep the view on the recording
  const x = Math.min(1 - W / (2 * vw), Math.max(W / (2 * vw), c.x));
  const y = Math.min(1 - H / (2 * vh), Math.max(H / (2 * vh), c.y));
  const fade = Math.min(clamp01(f / 8), clamp01((DEMO_FRAMES - 1 - f) / 8));
  return (
    <AbsoluteFill style={{ background: '#151515' }}>
      <div style={{ position: 'absolute', left: W / 2 - x * vw, top: H / 2 - y * vh, width: vw, height: vh, opacity: fade }}>
        <OffthreadVideo src={staticFile(SRC)} muted style={{ width: vw, height: vh }} />
      </div>
    </AbsoluteFill>
  );
};
