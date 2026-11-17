// Garage compositions: the hero loop (door down, someone working inside), the roll-up that
// reveals the real chat, the half-open door for the closing CTA, and the verify tour.
import React from 'react';
import { AbsoluteFill, Freeze, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Door, Shadow } from './Door';
import { Fonts, clamp01, easeInOut, lerp, smooth, vnoise } from './common';
import { C, facts } from './theme';

// ---------- light behaviour, loop-safe over `period` frames
const flicker = (f: number, period: number, amt = 1) => {
  const t = f / period;
  return 1 + amt * (0.014 * Math.sin(t * Math.PI * 2 * 3) + 0.01 * Math.sin(t * Math.PI * 2 * 7 + 1.3) + 0.012 * (vnoise(f / 6, Math.round(period / 6), 3) - 0.5));
};
// Someone inside crosses the beam, stops to work, then leaves. Strength is zero at both ends of the loop.
const worker = (f: number, period: number): Shadow[] => {
  const k = (a: number, b: number) => clamp01((f - a) / (b - a));
  const enter = easeInOut(k(period * 0.12, period * 0.36));
  const leave = easeInOut(k(period * 0.66, period * 0.9));
  const x = lerp(lerp(0.86, 0.63, enter), 0.38, leave) + 0.006 * Math.sin((f / period) * Math.PI * 2 * 4);
  const strength = 0.5 * smooth(k(period * 0.1, period * 0.24)) * (1 - smooth(k(period * 0.8, period * 0.94)));
  return [{ x, strength, width: 0.045 + 0.01 * Math.sin((f / period) * Math.PI * 2 * 2) }];
};

// ---------- hero loop
export const DoorStage: React.FC<{ layout?: 'wide' | 'tall'; fadeTop?: boolean }> = ({ layout = 'wide', fadeTop = false }) => {
  const f = useCurrentFrame();
  const { width: W, height: H, durationInFrames: D } = useVideoConfig();
  const tall = layout === 'tall';
  const geo = tall
    ? { floorY: H * 0.7, doorW: W * 0.74, doorTop: H * 0.7 - W * 0.74 * 0.78, panels: 4, scale: 1.25 }
    : { floorY: H * 0.72, doorW: W * 0.57, doorTop: H * 0.72 - W * 0.57 * 0.43, panels: 4, scale: 1.33 };
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Door W={W} H={H} floorY={geo.floorY} doorX={(W - geo.doorW) / 2} doorW={geo.doorW} doorTop={geo.doorTop}
        panelH={(geo.floorY - geo.doorTop) / geo.panels} framed scale={geo.scale} intensity={flicker(f, D)} shadows={worker(f, D)} />
      {fadeTop && <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.ink} 0%, ${C.ink} ${((geo.doorTop - 30) / H) * 100}%, rgba(11,10,9,0.55) ${((geo.doorTop + (geo.floorY - geo.doorTop) * 0.28) / H) * 100}%, rgba(11,10,9,0) ${((geo.doorTop + (geo.floorY - geo.doorTop) * 0.62) / H) * 100}%)` }} />}
    </AbsoluteFill>
  );
};

// ---------- what's behind the door: a warm workshop, and the real chat running in it
const Interior: React.FC<{ w: number; h: number; win: { x: number; y: number; w: number; h: number }; footage: React.ReactNode; warmth: number }> = ({ w, h, win, footage, warmth }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 75% at 50% -8%, rgba(255,176,110,${0.5 * warmth}) 0%, rgba(150,64,22,${0.55 * warmth}) 38%, #1a0d06 72%, #0e0805 100%)` }} />
    {/* inside floor */}
    <div style={{ position: 'absolute', left: 0, right: 0, top: h * 0.86, bottom: 0, background: `linear-gradient(180deg, rgba(120,52,20,${0.5 * warmth}), rgba(40,18,8,0.9))` }} />
    {/* light pool the screen throws on the floor */}
    <div style={{ position: 'absolute', left: win.x - win.w * 0.1, width: win.w * 1.2, top: h * 0.86, height: h * 0.14, background: 'radial-gradient(ellipse 50% 70% at 50% 0%, rgba(210,200,190,0.10), rgba(0,0,0,0))' }} />
    {/* the window */}
    <div style={{ position: 'absolute', left: win.x, top: win.y, width: win.w, height: win.h, borderRadius: 10, overflow: 'hidden', boxShadow: `0 40px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,190,140,${0.22 * warmth}), 0 -1px 0 rgba(255,200,150,${0.35 * warmth})`, background: '#111' }}>
      {footage}
      {/* warm cast from the lamp, kept light so the real UI stays true */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(255,150,80,${0.1 * warmth}), rgba(255,150,80,0) 40%)`, mixBlendMode: 'soft-light' }} />
    </div>
  </AbsoluteFill>
);

// ---------- caption: a dark card with the light edge under it (the rhyme)
const Caption: React.FC<{ text: string; sub?: string; t: number; top?: boolean; side?: boolean; s: number; W: number; maxW?: number }> = ({ text, sub, t, top, side, s, W, maxW }) => (
  <div style={{ position: 'absolute', left: (side ? 40 : 52) * s, ...(side ? { top: '50%' } : top ? { top: 52 * s } : { bottom: 52 * s }), maxWidth: side ? 312 * s : maxW ?? W - 104 * s, opacity: t, transform: `translateY(${side ? '-50%' : '0px'}) translateY(${(1 - t) * 12}px)`, padding: `${18 * s}px ${30 * s}px ${20 * s}px`, borderRadius: 18 * s, background: 'rgba(16,14,12,0.86)', boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 24px 60px rgba(0,0,0,0.45), 0 ${2 * s}px 0 0 rgba(${C.glow},0.95), 0 ${10 * s}px ${26 * s}px -${6 * s}px rgba(${C.glow},0.55)` }}>
    <div style={{ font: `500 ${(side ? 30 : 34) * s}px/1.15 'Geist'`, color: '#f4f0ea', letterSpacing: '-0.015em' }}>{text}</div>
    {sub && <div style={{ font: `400 ${24 * s}px/1.3 'Geist'`, color: '#b3aa9f', marginTop: 4 * s }}>{sub}</div>}
  </div>
);

type CamKey = { f: number; s: number; x: number; y: number };
const camAt = (keys: CamKey[], f: number) => {
  let i = 0;
  while (i < keys.length - 2 && f >= keys[i + 1].f) i++;
  const a = keys[i], b = keys[i + 1];
  const t = easeInOut((f - a.f) / Math.max(1, b.f - a.f));
  return { s: lerp(a.s, b.s, t), x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
};
type Cap = { from: number; to: number; text: string; sub?: string; top?: boolean; side?: boolean };
const capAt = (caps: Cap[], f: number) => {
  const c = caps.find((k) => f >= k.from && f < k.to);
  if (!c) return null;
  return { ...c, t: Math.min(clamp01((f - c.from) / 10), clamp01((c.to - f) / 8)) };
};

// ---------- the roll-up: door down, it rises, the real chat is inside, the camera goes to it
const SRC = 'app/video-picker-search-master.mp4';
const FOOT_START = 75;   // the footage starts playing as the door finishes rising
export const ROLLUP_FRAMES = 615;
// The lit variant (Threshold take) has no door: it starts inside, with the window filling the frame
const LIT_FROM = 100;
const LIT_TO = 440;
export const APPLIT_FRAMES = LIT_TO - LIT_FROM;

export const RollUp: React.FC<{ layout?: 'wide' | 'tall'; variant?: 'door' | 'lit' }> = ({ layout = 'wide', variant = 'door' }) => {
  const lit = variant === 'lit';
  const local = useCurrentFrame();
  const f = lit ? local + LIT_FROM : local;
  const { width: W, height: H } = useVideoConfig();
  const tall = layout === 'tall';
  const g = tall
    ? { doorX: 90, doorW: W - 180, doorTop: 230, floorY: H - 150, panels: 5, scale: 1.2 }
    : { doorX: 200, doorW: W - 400, doorTop: 150, floorY: H - 130, panels: 5, scale: 1.15 };
  const doorH = g.floorY - g.doorTop;
  const winW = tall ? g.doorW * 0.9 : g.doorW * 0.7;
  const win = { w: winW, h: winW / 1.6, x: (g.doorW - winW) / 2, y: doorH * 0.43 - winW / 1.6 / 2 };
  // scene coords of a point on the recording (0..1)
  const P = (x: number, y: number) => ({ x: g.doorX + win.x + x * win.w, y: g.doorTop + win.y + y * win.h });
  const fill = tall ? (H * 0.98) / win.h * 0.5 : (W * 0.985) / win.w; // window fills the frame (portrait: half-height crop)
  const c0 = { x: W / 2, y: H / 2 + (tall ? 40 : 30) };
  const s0 = tall ? 1.1 : 1.18; // start close: the door fills the frame, like the hero door just above
  const wc = P(0.5, 0.5);
  const picker = P(tall ? 0.5 : 0.53, 0.57);
  const comp = P(tall ? 0.46 : 0.57, tall ? 0.8 : 0.72);
  const S = (k: number) => (tall ? fill * k * 1.5 : fill * k);
  // timeline: door rises 8-70, camera goes in 55-100, picker 122-148, composer 221-255, out 440-510, door down 515-590
  const keys: CamKey[] = [
    { f: 0, s: s0, ...c0 },
    { f: 52, s: s0, ...c0 },
    { f: 100, s: S(1), ...wc },
    { f: 118, s: S(1), ...wc },
    { f: 146, s: S(1.5), ...picker },
    { f: 221, s: S(1.5), ...picker },
    { f: 255, s: S(1.6), ...comp },
    { f: 440, s: S(1.6), ...comp },
    { f: 470, s: S(1), ...wc },
    { f: 478, s: S(1), ...wc },
    { f: 510, s: s0, ...c0 },
    { f: ROLLUP_FRAMES, s: s0, ...c0 },
  ];
  const raw = camAt(keys, f);
  // once inside the window, keep the view on the recording (no black margins)
  const inside = smooth((raw.s - s0) / Math.max(0.001, S(1) - s0));
  const hw = W / (2 * raw.s), hh = H / (2 * raw.s);
  const wl = g.doorX + win.x, wt = g.doorTop + win.y;
  const cx = win.w > 2 * hw ? Math.min(wl + win.w - hw, Math.max(wl + hw, raw.x)) : wl + win.w / 2;
  const cy = win.h > 2 * hh ? Math.min(wt + win.h - hh, Math.max(wt + hh, raw.y)) : wt + win.h / 2;
  const cam = { s: raw.s, x: lerp(raw.x, cx, inside), y: lerp(raw.y, cy, inside) };
  const open = lit ? 1 : easeInOut((f - 8) / 62) * (1 - easeInOut((f - 515) / 75));
  const warmth = lerp(0.7, 1, smooth((f - 20) / 50));
  const footage = f < FOOT_START
    ? <Freeze frame={0}><OffthreadVideo src={staticFile(SRC)} muted style={{ width: '100%', height: '100%' }} /></Freeze>
    : <Sequence from={lit ? FOOT_START - LIT_FROM : FOOT_START} layout="none"><OffthreadVideo src={staticFile(SRC)} muted style={{ width: '100%', height: '100%' }} /></Sequence>;
  const caps: Cap[] = [
    { from: 128, to: 212, text: `Pick from ${facts.chatModels} chat models`, side: !tall, top: tall },
    { from: 216, to: 254, text: 'Switch models mid-conversation', side: !tall, top: tall },
    { from: 262, to: 436, text: 'Served inside the enclave', sub: 'Verified by your browser', top: true },
  ];
  const cap = capAt(caps, f);
  const cs = tall ? 1.5 : 1;
  // lit variant: fade in and out so the loop seam is soft, and light falls from the threshold above
  const litFade = lit ? Math.min(clamp01(local / 10), clamp01((APPLIT_FRAMES - 1 - local) / 10)) : 1;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: 'hidden' }}>
      <Fonts />
      <AbsoluteFill style={{ opacity: litFade, transformOrigin: '0 0', transform: `translate(${W / 2 - cam.x * cam.s}px, ${H / 2 - cam.y * cam.s}px) scale(${cam.s})` }}>
        <Door W={W} H={H} floorY={g.floorY} doorX={g.doorX} doorW={g.doorW} doorTop={g.doorTop} panelH={doorH / g.panels} framed scale={g.scale}
          open={open} intensity={flicker(f, ROLLUP_FRAMES, open > 0.05 ? 0.3 : 1)} shadows={open > 0.02 ? [] : worker(f % 150, 150).map((s) => ({ ...s, strength: s.strength * 0.6 }))}
          interior={<Interior w={g.doorW} h={doorH} win={win} footage={footage} warmth={warmth} />} />
      </AbsoluteFill>
      {lit && <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(${C.glowHot},0.22) 0%, rgba(${C.glow},0.08) 9%, rgba(${C.glow},0) 26%)`, mixBlendMode: 'screen', opacity: litFade }} />}
      {cap && <Caption text={cap.text} sub={cap.sub} t={cap.t * litFade} top={cap.top} side={cap.side} s={cs} W={W} />}
    </AbsoluteFill>
  );
};

// ---------- Threshold take: no door drawn, only the strip, its spill, and someone moving inside
export const Threshold: React.FC<{ layout?: 'wide' | 'tall' }> = ({ layout = 'wide' }) => {
  const f = useCurrentFrame();
  const { width: W, height: H, durationInFrames: D } = useVideoConfig();
  const tall = layout === 'tall';
  const floorY = H * (tall ? 0.42 : 0.4);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Door W={W} H={H} floorY={floorY} doorX={W * 0.04} doorW={W * 0.92} doorTop={0} panelH={floorY * 0.42} plain scale={tall ? 1.1 : 1.4} gap={tall ? 4 : 5}
        intensity={flicker(f, D)} shadows={worker(f, D)} />
    </AbsoluteFill>
  );
};

// ---------- closing CTA: door halfway up, light pouring out (a still)
export const DoorHalf: React.FC<{ layout?: 'wide' | 'tall'; fadeTop?: boolean }> = ({ layout = 'wide', fadeTop = false }) => {
  const { width: W, height: H } = useVideoConfig();
  const tall = layout === 'tall';
  const g = tall ? { floorY: H * 0.62, doorW: W * 0.78, ratio: 0.8 } : { floorY: H * 0.58, doorW: W * 0.5, ratio: 0.43 };
  const doorTop = g.floorY - g.doorW * g.ratio;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Door W={W} H={H} floorY={g.floorY} doorX={(W - g.doorW) / 2} doorW={g.doorW} doorTop={doorTop} panelH={(g.floorY - doorTop) / 4} framed scale={1.3} open={0.42} intensity={1.05}
        interior={<AbsoluteFill>
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse 46% 70% at 50% 108%, rgba(255,220,180,0.9) 0%, rgba(240,128,64,0.62) 34%, rgba(110,44,14,0.55) 64%, #1a0b05 100%)' }} />
          <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(10,6,4,0.75), rgba(10,6,4,0) 22%, rgba(10,6,4,0) 78%, rgba(10,6,4,0.75))' }} />
        </AbsoluteFill>} />
      {fadeTop && <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.ink} 0%, ${C.ink} ${((doorTop - 30) / H) * 100}%, rgba(11,10,9,0.5) ${((doorTop + (g.floorY - doorTop) * 0.22) / H) * 100}%, rgba(11,10,9,0) ${((doorTop + (g.floorY - doorTop) * 0.5) / H) * 100}%)` }} />}
    </AbsoluteFill>
  );
};

// ---------- verify tour: the privacy pane in the real chat, re-checking the enclave (recorded today, build v0.75.0)
const VSRC = 'app/video-verify-v075-master.mp4';
export const VERIFY_FRAMES = 380;
export const VerifyTour: React.FC<{ layout?: 'wide' | 'tall' }> = ({ layout = 'wide' }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const tall = layout === 'tall';
  const k = tall ? H / 1800 : W / 2880; // fit height (portrait) or width
  const vw = 2880 * k, vh = 1800 * k;
  const pt = (x: number, y: number) => ({ x: x * vw, y: y * vh });
  const base = tall ? { s: 1, ...pt(0.86, 0.5) } : { s: 1, x: W / 2, y: H / 2 };
  const keys: CamKey[] = [
    { f: 0, ...base },
    { f: 60, ...base },
    { f: 92, s: tall ? 1.15 : 2, ...pt(0.885, 0.32) },
    { f: 150, s: tall ? 1.15 : 2, ...pt(0.885, 0.36) },
    { f: 176, s: tall ? 1.25 : 2.1, ...pt(0.885, 0.58) },
    { f: 262, s: tall ? 1.25 : 2.1, ...pt(0.885, 0.6) },
    { f: 290, s: tall ? 1.25 : 2.1, ...pt(0.885, 0.84) },
    { f: 350, s: tall ? 1.25 : 2.1, ...pt(0.885, 0.86) },
    { f: VERIFY_FRAMES - 6, ...base },
    { f: VERIFY_FRAMES, ...base },
  ];
  const cam = camAt(keys, f);
  const caps: Cap[] = [
    { from: 96, to: 160, text: 'Who can see your chat data', sub: 'The privacy panel, inside the chat' },
    { from: 176, to: 266, text: 'Your browser checks the enclave', sub: `Build ${facts.enclave.version} matches GitHub` },
    { from: 290, to: 352, text: 'The measurement, in full', sub: 'PCR0, published build, attestation time' },
  ];
  const cap = capAt(caps, f);
  const fade = Math.min(clamp01(f / 8), clamp01((VERIFY_FRAMES - 1 - f) / 8));
  return (
    <AbsoluteFill style={{ background: '#111' }}>
      <Fonts />
      <div style={{ position: 'absolute', left: 0, top: 0, width: vw, height: vh, opacity: fade, transformOrigin: '0 0', transform: `translate(${W / 2 - cam.x * cam.s}px, ${H / 2 - cam.y * cam.s}px) scale(${cam.s})` }}>
        <OffthreadVideo src={staticFile(VSRC)} muted style={{ width: vw, height: vh }} />
      </div>
      {cap && <Caption text={cap.text} sub={cap.sub} t={cap.t * fade} s={tall ? 1.45 : 1} W={W} maxW={tall ? undefined : 440} />}
    </AbsoluteFill>
  );
};

export const Poster: React.FC<{ src: string }> = ({ src }) => <Img src={staticFile(src)} />;
