// Star of the darkroom page: the real chat develops out of grain under the safelight.
// 1 the app develops · 2 a prompt is typed · 3 it dissolves back into noise (sealed in the browser)
// 4 PayPerQ relays noise; only the model, token count and time are legible · 5 the answer develops · 6 color returns ("fixed")
import React from 'react';
import { AbsoluteFill, Freeze, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { AMBER, Fonts, SAFE_TONE, Safelight, clamp01, developMask, ease, grainField, lin, prog } from './common';

type Key = { f: number; s: number; x: number; y: number };
type Rect = { x0: number; y0: number; x1: number; y1: number };
type Layout = {
  src: { w: number; h: number };
  typing: { file: string; frames: number; still: string };
  answer: string;
  mask: [number, number];
  grain: [number, number];
  cam1: Key[];
  cam2: Key[];
  composer: Rect; // typed prompt line, in source-normalized coordinates (typing state)
  bubble: Rect; // the user's message bubble in the answer state
  sidebar: number; // x where the sidebar ends (0 on phones)
  meta: number; // readout font size
};

export const LAYOUTS: Record<'wide' | 'phone', Layout> = {
  wide: {
    src: { w: 2880, h: 1800 },
    typing: { file: 'app/typing-dark-master.mp4', frames: 284, still: 'app/typed-dark.png' },
    answer: 'app/answer-dark.png',
    mask: [640, 400],
    grain: [960, 600],
    cam1: [
      { f: 0, s: 1, x: 0.5, y: 0.5 }, { f: 100, s: 1, x: 0.5, y: 0.5 },
      { f: 150, s: 1.45, x: 0.585, y: 0.57 }, { f: 330, s: 1.45, x: 0.585, y: 0.57 },
    ],
    cam2: [
      { f: 330, s: 1.32, x: 0.6, y: 0.36 }, { f: 440, s: 1.32, x: 0.6, y: 0.46 },
      { f: 500, s: 1, x: 0.5, y: 0.5 }, { f: 600, s: 1, x: 0.5, y: 0.5 },
    ],
    composer: { x0: 0.335, y0: 0.54, x1: 0.81, y1: 0.585 },
    bubble: { x0: 0.3655, y0: 0.0824, x1: 0.844, y1: 0.176 },
    sidebar: 0.183,
    meta: 30,
  },
  phone: {
    src: { w: 1200, h: 2460 },
    typing: { file: 'app/m-typing-dark-master.mp4', frames: 312, still: 'app/m-typed-dark.png' },
    answer: 'app/m-answer-dark.png',
    mask: [360, 738],
    grain: [540, 960],
    cam1: [
      { f: 0, s: 1, x: 0.5, y: 0.5 }, { f: 100, s: 1, x: 0.5, y: 0.5 },
      { f: 150, s: 1.22, x: 0.5, y: 0.56 }, { f: 330, s: 1.22, x: 0.5, y: 0.56 },
    ],
    cam2: [
      { f: 330, s: 1.12, x: 0.5, y: 0.34 }, { f: 440, s: 1.12, x: 0.5, y: 0.46 },
      { f: 500, s: 1, x: 0.5, y: 0.5 }, { f: 600, s: 1, x: 0.5, y: 0.5 },
    ],
    composer: { x0: 0.08, y0: 0.53, x1: 0.95, y1: 0.61 },
    bubble: { x0: 0.04, y0: 0.091, x1: 0.96, y1: 0.226 },
    sidebar: 0,
    meta: 34,
  },
};

// Timeline at 30 fps
const T = {
  devIn: [14, 96] as const,
  typeStart: 100, typeLen: 150,
  seal: [258, 304] as const,
  relay: [290, 362] as const,
  answer: [336, 446] as const,
  fix: [452, 486] as const,
  out: [566, 598] as const,
};
export const DEVELOP_FRAMES = 600;

const camAt = (keys: Key[], f: number) => {
  let i = 0;
  while (i < keys.length - 2 && f >= keys[i + 1].f) i++;
  const a = keys[i], b = keys[i + 1];
  const t = ease((f - a.f) / Math.max(1, b.f - a.f));
  return { s: a.s + (b.s - a.s) * t, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
};

const distToRect = (x: number, y: number, r: Rect) => {
  const dx = Math.max(r.x0 - x, 0, x - r.x1);
  const dy = Math.max(r.y0 - y, 0, y - r.y1);
  return Math.sqrt(dx * dx + dy * dy);
};

export const Develop: React.FC<{ layout: 'wide' | 'phone' }> = ({ layout }) => {
  const L = LAYOUTS[layout];
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const k = Math.max(W / L.src.w, H / L.src.h);
  const rw = L.src.w * k, rh = L.src.h * k;

  // Placement of a scene for a camera: returns the transform for a box of size rw × rh
  const place = (c: { s: number; x: number; y: number }) => {
    // keep the view inside the recording
    const vw = W / (rw * c.s), vh = H / (rh * c.s);
    const x = Math.min(1 - vw / 2, Math.max(vw / 2, c.x));
    const y = Math.min(1 - vh / 2, Math.max(vh / 2, c.y));
    return { tx: W / 2 - x * rw * c.s, ty: H / 2 - y * rh * c.s, s: c.s };
  };
  const toScreen = (p: ReturnType<typeof place>, r: Rect) => ({
    left: p.tx + r.x0 * rw * p.s, top: p.ty + r.y0 * rh * p.s,
    width: (r.x1 - r.x0) * rw * p.s, height: (r.y1 - r.y0) * rh * p.s,
  });

  // ── scene 1: typing state
  const dev1 = prog(f, T.devIn[0], T.devIn[1]);
  const seal = lin(f, T.seal[0], T.seal[1]);
  const s1Visible = f < T.seal[1] + 1;
  const prio1 = (x: number, y: number) => {
    const d = distToRect(x, y, L.composer);
    let p = Math.exp(-(d * d) / 0.07);
    if (x < L.sidebar) p *= 0.55;
    return p;
  };
  // sealing: the typed words go first, the rest follows outward
  const prioSeal = (x: number, y: number) => {
    const d = distToRect(x, y, L.composer);
    return clamp01(d * 3.2);
  };
  let mask1: string | null = null;
  if (s1Visible) {
    if (seal > 0) mask1 = developMask(L.mask[0], L.mask[1], 1 - ease(seal), prioSeal, { weight: 0.62, seed: 11 });
    else mask1 = developMask(L.mask[0], L.mask[1], dev1, prio1, { weight: 0.55, seed: 7 });
  }
  const videoFrame = Math.round(Math.min(L.typing.frames - 1, Math.max(0, (f - T.typeStart) * ((L.typing.frames - 12) / T.typeLen))));
  const cam1 = place(camAt(L.cam1, f));
  const density1 = 0.55 + 0.45 * dev1;

  // ── scene 2: the answer
  const dev2 = prog(f, T.answer[0], T.answer[1]);
  const out = lin(f, T.out[0], T.out[1]);
  const fix = prog(f, T.fix[0], T.fix[1]);
  const prio2 = (x: number, y: number) => {
    const inBubble = distToRect(x, y, L.bubble) < 0.01 ? 0.35 : 0;
    let p = clamp01(1 - y * 1.05 + inBubble);
    if (x < L.sidebar) p *= 0.5;
    return p;
  };
  let mask2: string | null = 'none';
  if (f >= T.answer[0]) {
    mask2 = out > 0 ? developMask(L.mask[0], L.mask[1], 1 - out, () => 0.5, { weight: 0, seed: 23 }) : developMask(L.mask[0], L.mask[1], dev2, prio2, { weight: 0.68, seed: 19 });
  }
  const cam2 = place(camAt(L.cam2, f));
  const density2 = 0.6 + 0.4 * dev2;

  // ── relay: what PayPerQ's servers see (noise in the shape of the message, plus metadata)
  const relayIn = prog(f, T.relay[0], T.relay[0] + 18);
  const relayOut = 1 - prog(f, T.answer[0] + 10, T.answer[0] + 40);
  const relay = Math.min(relayIn, relayOut);
  const bubbleBox = toScreen(place(camAt(L.cam2, T.answer[0])), L.bubble);
  const grainStep = Math.floor(f / 4); // grain boils at 7.5 fps: film-like, and far cheaper to encode

  // ── darkroom field, the safelight
  const lamp = { x: 0.62, y: -0.18, r: 1.05 };
  const field = grainField(L.grain[0], L.grain[1], grainStep, lamp, 1);
  const glow = 1 - 0.55 * fix * (1 - out);

  const sceneStyle = (p: ReturnType<typeof place>, mask: string | null): React.CSSProperties => ({
    position: 'absolute', left: 0, top: 0, width: rw, height: rh, transformOrigin: '0 0',
    transform: `translate(${p.tx}px, ${p.ty}px) scale(${p.s})`,
    ...(mask === 'none' ? { opacity: 0 } : mask ? { WebkitMaskImage: `url(${mask})`, maskImage: `url(${mask})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' } : {}),
  });

  return (
    <AbsoluteFill style={{ background: '#0a0806', overflow: 'hidden' }}>
      <Fonts />
      <Img src={field} style={{ position: 'absolute', inset: 0, width: W, height: H, imageRendering: 'pixelated' }} />

      {s1Visible && (
        <div style={sceneStyle(cam1, mask1)}>
          <Freeze frame={videoFrame}>
            <OffthreadVideo src={staticFile(L.typing.file)} muted style={{ width: rw, height: rh, filter: `${SAFE_TONE} contrast(${density1}) brightness(${0.7 + 0.3 * dev1})` }} />
          </Freeze>
        </div>
      )}

      {f >= T.answer[0] && (
        <div style={sceneStyle(cam2, mask2)}>
          <Img src={staticFile(L.answer)} style={{ position: 'absolute', inset: 0, width: rw, height: rh, filter: `${SAFE_TONE} contrast(${density2}) brightness(${0.72 + 0.28 * dev2})` }} />
          <Img src={staticFile(L.answer)} style={{ position: 'absolute', inset: 0, width: rw, height: rh, opacity: fix }} />
        </div>
      )}

      {relay > 0.001 && (
        <>
          <div style={{ position: 'absolute', ...bubbleBox, borderRadius: 26 * k * 1.3 * 2, overflow: 'hidden', opacity: relay * 0.9, boxShadow: `0 0 0 1px rgba(${AMBER.join(',')},0.25)` }}>
            <Img src={grainField(Math.round(bubbleBox.width / 3), Math.round(bubbleBox.height / 3), grainStep + 500, { x: 0.5, y: 0.5, r: 3 }, 2.1, 1)} style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }} />
          </div>
          <div style={{ position: 'absolute', left: bubbleBox.left, top: bubbleBox.top - L.meta * 2.1, width: bubbleBox.width, display: 'flex', justifyContent: 'space-between', font: `500 ${L.meta}px/1 'Geist Mono'`, letterSpacing: '0.02em', color: `rgba(255,214,180,${0.92 * relay})` }}>
            {layout === 'wide' ? (<><span>claude-sonnet-5.5</span><span>312 tokens</span><span>19:40:12</span></>) : (<><span>claude-sonnet-5.5</span><span>312 tok</span></>)}
          </div>
        </>
      )}

      <Safelight x={lamp.x} y={lamp.y + 0.05} strength={0.55 * glow} />
    </AbsoluteFill>
  );
};
