// Real app footage with a camera: push into the picker, follow the composer, open the privacy pane
import React from 'react';
import { AbsoluteFill, Easing, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Fonts } from './common';
import { palettes } from './theme';

type Key = { f: number; s: number; x: number; y: number; px?: number }; // px: horizontal center override for portrait
type Cap = { from: number; to: number; text: string; sub?: string; top?: boolean };
type Cut = { src: string; keys: Key[]; caps: Cap[] };

// Keys are in frames at 30 fps; x/y are normalized centers of the camera view on the recording
export const CUTS: Record<string, Cut> = {
  search: {
    src: 'app/video-picker-search-master.mp4',
    keys: [
      { f: 0, s: 1, x: 0.5, y: 0.5 },
      { f: 38, s: 1, x: 0.5, y: 0.5 },
      { f: 64, s: 1.55, x: 0.53, y: 0.57 },
      { f: 146, s: 1.55, x: 0.53, y: 0.58 },
      { f: 178, s: 1.62, x: 0.57, y: 0.72, px: 0.47 },
      { f: 312, s: 1.66, x: 0.57, y: 0.72, px: 0.47 },
      { f: 352, s: 1, x: 0.5, y: 0.5 },
      { f: 383, s: 1, x: 0.5, y: 0.5 },
    ],
    caps: [
      { from: 52, to: 150, text: 'Search 387 chat models' },
      { from: 152, to: 192, text: 'Switch models mid-conversation' },
      { from: 196, to: 318, text: 'Served inside the enclave', sub: 'Verified by your browser', top: true },
      { from: 330, to: 383, text: 'One balance for every model' },
    ],
  },
  browse: {
    src: 'app/video-picker-browse-master.mp4',
    keys: [
      { f: 0, s: 1, x: 0.5, y: 0.5 },
      { f: 34, s: 1, x: 0.5, y: 0.5 },
      { f: 62, s: 1.5, x: 0.53, y: 0.56 },
      { f: 300, s: 1.5, x: 0.53, y: 0.56 },
      { f: 330, s: 1.62, x: 0.53, y: 0.5 },
      { f: 470, s: 1.62, x: 0.53, y: 0.5 },
      { f: 500, s: 1, x: 0.5, y: 0.5 },
      { f: 504, s: 1, x: 0.5, y: 0.5 },
    ],
    caps: [
      { from: 56, to: 168, text: '387 chat models in one list', top: true },
      { from: 172, to: 300, text: 'Image, video and audio too', sub: 'Same balance', top: true },
      { from: 316, to: 380, text: 'Search by name', top: true },
      { from: 384, to: 480, text: 'Privacy label on every model', sub: 'Anon · ZDR · E2EE', top: true },
    ],
  },
  verify: {
    src: 'app/video-verify-master.mp4',
    keys: [
      { f: 0, s: 1, x: 0.5, y: 0.5 },
      { f: 34, s: 1, x: 0.5, y: 0.5 },
      { f: 66, s: 2, x: 0.9, y: 0.3 },
      { f: 196, s: 2, x: 0.9, y: 0.32 },
      { f: 228, s: 2, x: 0.9, y: 0.6 },
      { f: 336, s: 2, x: 0.9, y: 0.62 },
      { f: 362, s: 1, x: 0.5, y: 0.5 },
      { f: 368, s: 1, x: 0.5, y: 0.5 },
    ],
    caps: [
      { from: 60, to: 196, text: 'Who can see your chat data', sub: 'From the privacy panel in the chat' },
      { from: 206, to: 336, text: 'Your browser checks the enclave', sub: 'Build v0.73.0 matches GitHub' },
    ],
  },
};

const easeCam = Easing.bezier(0.65, 0, 0.35, 1);

const SRC_W = 1920;
const SRC_H = 1200;

// Returns the camera for frame f. View size is in normalized source units; the center is clamped so the view stays on the recording
const camera = (keys: Key[], f: number, outW: number, outH: number, portrait: boolean) => {
  let i = 0;
  while (i < keys.length - 2 && f >= keys[i + 1].f) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const t = easeCam(Math.max(0, Math.min(1, (f - a.f) / Math.max(1, b.f - a.f))));
  const raw = a.s + (b.s - a.s) * t;
  const s = portrait ? 1 + (raw - 1) * 0.55 : raw; // portrait already crops tight, so push in less
  const k = portrait ? outH / SRC_H : outW / SRC_W; // fit height in portrait, width in landscape
  const vw = outW / (SRC_W * k * s);
  const vh = outH / (SRC_H * k * s);
  const ax = portrait && a.px !== undefined ? a.px : a.x;
  const bx = portrait && b.px !== undefined ? b.px : b.x;
  const x = Math.min(1 - vw / 2, Math.max(vw / 2, ax + (bx - ax) * t));
  const y = Math.min(1 - vh / 2, Math.max(vh / 2, a.y + (b.y - a.y) * t));
  return { s, k, x, y };
};

export const AppTour: React.FC<{ cut: keyof typeof CUTS; palette: keyof typeof palettes; portrait?: boolean }> = ({ cut, palette, portrait = false }) => {
  const p = palettes[palette];
  const f = useCurrentFrame();
  const { width: W, height: H, durationInFrames } = useVideoConfig();
  const c = CUTS[cut];
  const cam = camera(c.keys, f, W, H, portrait);
  const vidW = SRC_W * cam.k;
  const vidH = SRC_H * cam.k;
  const ox = W / 2 - cam.x * vidW * cam.s;
  const oy = H / 2 - cam.y * vidH * cam.s;
  const capScale = portrait ? 1.45 : 1;
  const fade = Math.min(interpolate(f, [0, 8], [0, 1], { extrapolateRight: 'clamp' }), interpolate(f, [durationInFrames - 10, durationInFrames - 1], [1, 0], { extrapolateLeft: 'clamp' }));
  const cap = c.caps.find((k) => f >= k.from && f < k.to);
  const capT = cap ? Math.min(interpolate(f, [cap.from, cap.from + 10], [0, 1], { extrapolateRight: 'clamp' }), interpolate(f, [cap.to - 8, cap.to], [1, 0], { extrapolateLeft: 'clamp' })) : 0;

  return (
    <AbsoluteFill style={{ background: '#111' }}>
      <Fonts />
      <div style={{ position: 'absolute', left: 0, top: 0, width: vidW, height: vidH, opacity: fade, transform: `translate(${ox}px, ${oy}px) scale(${cam.s})`, transformOrigin: '0 0' }}>
        <OffthreadVideo src={staticFile(c.src)} style={{ width: vidW, height: vidH }} muted />
      </div>
      {cap && (
        <div style={{ position: 'absolute', left: 48 * capScale, ...(cap.top ? { top: 48 * capScale } : { bottom: 48 * capScale }), maxWidth: W - 96 * capScale, opacity: capT * fade, transform: `translateY(${(1 - capT) * 14}px)`, display: 'flex', alignItems: 'center', gap: 16, padding: cap.sub ? '18px 28px 18px 24px' : '18px 28px 18px 24px', borderRadius: 22, background: 'rgba(14,14,14,0.78)', backdropFilter: 'blur(14px)', boxShadow: '0 0 0 1px rgba(255,255,255,0.10), 0 20px 50px rgba(0,0,0,0.4)' }}>
          <span style={{ width: 12, height: 12, borderRadius: 12, background: p.accent, flex: 'none' }} />
          <div>
            <div style={{ font: `500 ${34 * capScale}px/1.15 'Geist'`, color: '#f2f2f2', letterSpacing: '-0.015em' }}>{cap.text}</div>
            {cap.sub && <div style={{ font: `400 ${24 * capScale}px/1.3 'Geist'`, color: '#a8a8a8', marginTop: 4 }}>{cap.sub}</div>}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
