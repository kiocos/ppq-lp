// Star of the darkroom page, round 2.
// 1 the real chat develops out of grain under the safelight · 2 a prompt is typed
// 3 the typed line is sealed into noise (the "packet"), then the UI dissolves around it
// 4 the packet crosses PayPerQ: only the model, token count and time are legible
// 5 it lands where the user's message develops, and the answer develops below it · 6 colour returns ("fixed")
import React from 'react';
import { AbsoluteFill, Freeze, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { AMBER, DUO_FILTER, DuoTint, Fonts, Safelight, clamp01, developMask, ease, grainField, grainFieldDark, lin, prog } from './common';

type Key = { f: number; s: number; x: number; y: number };
type Rect = { x0: number; y0: number; x1: number; y1: number };
type Box = { left: number; top: number; width: number; height: number };
type Layout = {
  src: { w: number; h: number };
  typing: { file: string; frames: number };
  answer: string;
  mask: [number, number];
  grain: [number, number];
  cam1: Key[];
  cam2: Key[];
  composer: Rect; // composer box in the typing state (source-normalized)
  typed: Rect; // the typed text itself
  bubble: Rect; // the user's message bubble in the answer state
  relay: { w: number; h: number; cy: number }; // packet size and centre while relayed, as fractions of the frame
  sidebar: number;
  label: number;
};

export const LAYOUTS: Record<'wide' | 'phone', Layout> = {
  wide: {
    src: { w: 2880, h: 1800 },
    typing: { file: 'app/typing-dark-master.mp4', frames: 284 },
    answer: 'app/answer-dark.png',
    mask: [640, 400],
    grain: [960, 600],
    cam1: [{ f: 0, s: 1, x: 0.5, y: 0.5 }, { f: 100, s: 1, x: 0.5, y: 0.5 }, { f: 150, s: 1.45, x: 0.585, y: 0.57 }, { f: 360, s: 1.45, x: 0.585, y: 0.57 }],
    cam2: [{ f: 440, s: 1.32, x: 0.6, y: 0.36 }, { f: 560, s: 1.32, x: 0.6, y: 0.46 }, { f: 612, s: 1, x: 0.5, y: 0.5 }, { f: 700, s: 1, x: 0.5, y: 0.5 }],
    composer: { x0: 0.31, y0: 0.525, x1: 0.87, y1: 0.65 },
    typed: { x0: 0.338, y0: 0.546, x1: 0.805, y1: 0.578 },
    bubble: { x0: 0.3655, y0: 0.0824, x1: 0.844, y1: 0.176 },
    relay: { w: 0.5, h: 0.1, cy: 0.5 },
    sidebar: 0.183,
    label: 30,
  },
  phone: {
    src: { w: 1200, h: 2460 },
    typing: { file: 'app/m-typing-dark-master.mp4', frames: 312 },
    answer: 'app/m-answer-dark.png',
    mask: [360, 738],
    grain: [540, 960],
    cam1: [{ f: 0, s: 1, x: 0.5, y: 0.5 }, { f: 100, s: 1, x: 0.5, y: 0.5 }, { f: 150, s: 1.22, x: 0.5, y: 0.56 }, { f: 360, s: 1.22, x: 0.5, y: 0.56 }],
    cam2: [{ f: 440, s: 1.12, x: 0.5, y: 0.34 }, { f: 560, s: 1.12, x: 0.5, y: 0.46 }, { f: 612, s: 1, x: 0.5, y: 0.5 }, { f: 700, s: 1, x: 0.5, y: 0.5 }],
    composer: { x0: 0.05, y0: 0.5, x1: 0.95, y1: 0.72 },
    typed: { x0: 0.135, y0: 0.53, x1: 0.91, y1: 0.62 },
    bubble: { x0: 0.04, y0: 0.091, x1: 0.96, y1: 0.226 },
    relay: { w: 0.84, h: 0.11, cy: 0.5 },
    sidebar: 0,
    label: 40,
  },
};

// Timeline at 30 fps. The page's step list uses the same marks (in seconds)
export const T = {
  devIn: [14, 96] as const,
  typeStart: 100, typeLen: 150,
  sealText: [262, 300] as const,
  sealAll: [306, 352] as const,
  travel1: [336, 384] as const,
  relay: [366, 452] as const,
  travel2: [446, 484] as const,
  answer: [458, 566] as const,
  fix: [572, 606] as const,
  out: [640, 668] as const,
};
export const DEVELOP_FRAMES = 670;

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
const lerpBox = (a: Box, b: Box, t: number): Box => ({ left: a.left + (b.left - a.left) * t, top: a.top + (b.top - a.top) * t, width: a.width + (b.width - a.width) * t, height: a.height + (b.height - a.height) * t });

export const Develop: React.FC<{ layout: 'wide' | 'phone' }> = ({ layout }) => {
  const L = LAYOUTS[layout];
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const k = Math.max(W / L.src.w, H / L.src.h);
  const rw = L.src.w * k, rh = L.src.h * k;
  const place = (c: { s: number; x: number; y: number }) => {
    const vw = W / (rw * c.s), vh = H / (rh * c.s);
    const x = Math.min(1 - vw / 2, Math.max(vw / 2, c.x));
    const y = Math.min(1 - vh / 2, Math.max(vh / 2, c.y));
    return { tx: W / 2 - x * rw * c.s, ty: H / 2 - y * rh * c.s, s: c.s };
  };
  const toScreen = (p: ReturnType<typeof place>, r: Rect): Box => ({ left: p.tx + r.x0 * rw * p.s, top: p.ty + r.y0 * rh * p.s, width: (r.x1 - r.x0) * rw * p.s, height: (r.y1 - r.y0) * rh * p.s });
  const step = Math.floor(f / 5); // grain boils at 6 fps

  // ── scene 1: typing
  const dev1 = prog(f, T.devIn[0], T.devIn[1]);
  const sealAll = lin(f, T.sealAll[0], T.sealAll[1]);
  const s1Visible = f < T.sealAll[1] + 1;
  const prio1 = (x: number, y: number) => { const d = distToRect(x, y, L.composer); let p = Math.exp(-(d * d) / 0.06); if (x < L.sidebar) p *= 0.55; return p; };
  const prioSeal = (x: number, y: number) => clamp01(1.1 - distToRect(x, y, L.composer) * 3.4); // near the composer stays longest
  let mask1: string | null = null;
  if (s1Visible) mask1 = sealAll > 0 ? developMask(L.mask[0], L.mask[1], 1 - ease(sealAll), prioSeal, { weight: 0.6, seed: 11 }) : developMask(L.mask[0], L.mask[1], dev1, prio1, { weight: 0.55, seed: 7 });
  const videoFrame = Math.round(Math.min(L.typing.frames - 1, Math.max(0, (f - T.typeStart) * ((L.typing.frames - 12) / T.typeLen))));
  const cam1 = place(camAt(L.cam1, Math.min(f, T.sealAll[1])));

  // ── scene 2: the answer
  const dev2 = prog(f, T.answer[0], T.answer[1]);
  const out = lin(f, T.out[0], T.out[1]);
  const fix = prog(f, T.fix[0], T.fix[1]);
  const prio2 = (x: number, y: number) => { const inB = distToRect(x, y, L.bubble) < 0.012 ? 0.4 : 0; let p = clamp01(1 - y * 1.05 + inB); if (x < L.sidebar) p *= 0.5; return p; };
  let mask2: string | null = 'none';
  if (f >= T.answer[0]) mask2 = out > 0 ? developMask(L.mask[0], L.mask[1], 1 - out, () => 0.5, { weight: 0, seed: 23 }) : developMask(L.mask[0], L.mask[1], dev2, prio2, { weight: 0.68, seed: 19 });
  const cam2 = place(camAt(L.cam2, Math.max(f, T.answer[0])));

  // ── the packet: the sealed message as one object, from the composer to the relay to the bubble
  const fromBox = toScreen(place(camAt(L.cam1, T.sealText[0])), L.typed);
  const midBox: Box = { width: W * L.relay.w, height: H * L.relay.h, left: (W - W * L.relay.w) / 2, top: H * L.relay.cy - (H * L.relay.h) / 2 };
  const toBox = toScreen(place(camAt(L.cam2, T.answer[0])), L.bubble);
  const tr1 = prog(f, T.travel1[0], T.travel1[1]);
  const tr2 = prog(f, T.travel2[0], T.travel2[1]);
  const box = tr2 > 0 ? lerpBox(midBox, toBox, tr2) : lerpBox(fromBox, midBox, tr1);
  const sealing = lin(f, T.sealText[0], T.sealText[1]);
  const packetOn = f >= T.sealText[0] && f < T.answer[0] + 50;
  const packetFade = 1 - prog(f, T.answer[0] + 14, T.answer[0] + 48);
  const packetMask = sealing < 1 ? developMask(160, 24, sealing, (x) => 1 - x, { weight: 0.7, seed: 31, soft: 0.2 }) : null;
  const radius = Math.min(box.height / 2, 18 + 14 * tr1);

  // ── what PayPerQ relays: label above, metadata below
  const relay = Math.min(prog(f, T.relay[0], T.relay[0] + 16), 1 - prog(f, T.relay[1] - 14, T.relay[1]));
  const lamp = { x: 0.62, y: -0.18, r: 1.05 };
  const glow = 1 - 0.6 * fix * (1 - out);

  const sceneStyle = (p: ReturnType<typeof place>, mask: string | null): React.CSSProperties => ({
    position: 'absolute', left: 0, top: 0, width: rw, height: rh, transformOrigin: '0 0', transform: `translate(${p.tx}px, ${p.ty}px) scale(${p.s})`,
    ...(mask === 'none' ? { opacity: 0 } : mask ? { WebkitMaskImage: `url(${mask})`, maskImage: `url(${mask})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' } : {}),
  });
  const maskStyle = (m: string | null): React.CSSProperties => (m === 'none' ? { opacity: 0 } : m ? { WebkitMaskImage: `url(${m})`, maskImage: `url(${m})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' } : {});

  return (
    <AbsoluteFill style={{ background: '#080604', overflow: 'hidden' }}>
      <Fonts />
      <Img src={grainFieldDark(L.grain[0], L.grain[1], step, lamp, 1)} style={{ position: 'absolute', inset: 0, width: W, height: H }} />

      {s1Visible && (
        <div style={sceneStyle(cam1, mask1)}>
          <div style={{ position: 'absolute', inset: 0, isolation: 'isolate' }}>
            <Freeze frame={videoFrame}>
              <OffthreadVideo src={staticFile(L.typing.file)} muted style={{ width: rw, height: rh, filter: DUO_FILTER(dev1) }} />
            </Freeze>
            <DuoTint />
          </div>
        </div>
      )}

      {f >= T.answer[0] && (
        <div style={sceneStyle(cam2, mask2)}>
          <div style={{ position: 'absolute', inset: 0, isolation: 'isolate' }}>
            <Img src={staticFile(L.answer)} style={{ position: 'absolute', inset: 0, width: rw, height: rh, filter: DUO_FILTER(dev2) }} />
            <DuoTint />
          </div>
          <Img src={staticFile(L.answer)} style={{ position: 'absolute', inset: 0, width: rw, height: rh, opacity: fix }} />
        </div>
      )}

      {packetOn && (
        <div style={{ position: 'absolute', ...box, borderRadius: radius, overflow: 'hidden', opacity: packetFade, boxShadow: `0 0 0 1px rgba(${AMBER.join(',')},${0.3 * tr1}), 0 0 ${60 * tr1}px rgba(${AMBER.join(',')},${0.18 * tr1})`, ...maskStyle(packetMask) }}>
          <Img src={grainField(Math.max(8, Math.round(box.width / 3)), Math.max(4, Math.round(box.height / 3)), step + 500, { x: 0.5, y: 0.5, r: 3 }, 1.9, 1)} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {relay > 0.001 && (
        <>
          <div style={{ position: 'absolute', left: midBox.left, top: midBox.top - L.label * 2.3, width: midBox.width, font: `500 ${L.label}px/1 'Geist'`, letterSpacing: '-0.01em', color: `rgba(242,237,231,${0.82 * relay})` }}>What PayPerQ relays</div>
          <div style={{ position: 'absolute', left: midBox.left, top: midBox.top + midBox.height + L.label * 1.1, width: midBox.width, display: 'flex', gap: L.label * 1.2, flexWrap: 'wrap', font: `500 ${L.label * 0.86}px/1.4 'Geist Mono'`, color: `rgba(255,206,168,${0.9 * relay})` }}>
            <span>claude-sonnet-5.5</span><span>312 tokens</span><span>19:40:12</span>
          </div>
        </>
      )}

      <Safelight x={lamp.x} y={lamp.y + 0.05} strength={0.5 * glow} />
    </AbsoluteFill>
  );
};
