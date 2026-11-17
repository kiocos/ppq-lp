// Night backdrop for product shots: blue night, ridges, mist, and a hidden fire seen only as light on smoke
import React, { useMemo } from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { Grain } from './common';

const W = 1920;
const H = 1080;
const LOOP = 600;
const TAU = Math.PI * 2;

const ridge = (seed: string, base: number, amp: number, steps = 96) => {
  const ph = [random(seed + 'a') * TAU, random(seed + 'b') * TAU, random(seed + 'c') * TAU];
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W;
    const t = i / steps;
    const y = base - amp * (0.55 * Math.sin(t * 3.1 + ph[0]) + 0.3 * Math.sin(t * 7.3 + ph[1]) + 0.15 * Math.sin(t * 17 + ph[2]));
    pts.push([x, y]);
  }
  return pts;
};
const ridgePath = (pts: Array<[number, number]>) => `M0 ${H} L${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} L${W} ${H} Z`;

const pines = (seed: string, pts: Array<[number, number]>, count: number, hMin: number, hMax: number, zones?: Array<[number, number]>) => {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = random(seed + i) * W;
    if (zones && !zones.some(([a, b]) => x >= a && x <= b)) continue;
    const seg = Math.min(pts.length - 2, Math.floor((x / W) * (pts.length - 1)));
    const t = (x - pts[seg][0]) / (pts[seg + 1][0] - pts[seg][0]);
    const y = pts[seg][1] * (1 - t) + pts[seg + 1][1] * t + 4;
    const h = hMin + random(seed + 'h' + i) * (hMax - hMin);
    const w = h * (0.28 + random(seed + 'w' + i) * 0.08);
    // three stacked tiers per pine
    out.push(`M${x} ${y - h} L${x + w * 0.55} ${y - h * 0.45} L${x + w * 0.32} ${y - h * 0.47} L${x + w} ${y} L${x - w} ${y} L${x - w * 0.32} ${y - h * 0.47} L${x - w * 0.55} ${y - h * 0.45} Z`);
  }
  return out.join(' ');
};

const wave = (f: number, k: number, phase: number) => Math.sin(TAU * (f / LOOP) * k + phase);

export const Night: React.FC<{ fireX?: number }> = ({ fireX = 300 }) => {
  const f = useCurrentFrame();
  const scene = useMemo(() => {
    const far = ridge('far', 770, 70);
    const mid = ridge('mid', 850, 48);
    const near = ridge('near', 950, 26);
    const stars = Array.from({ length: 280 }, (_, i) => {
      const y = Math.pow(random('sy' + i), 1.6) * 760;
      return { x: random('sx' + i) * W, y, r: 0.5 + Math.pow(random('sr' + i), 3) * 1.9, a: 0.25 + random('sa' + i) * 0.7, k: 1 + Math.floor(random('sk' + i) * 6), ph: random('sp' + i) * TAU };
    });
    return {
      far, mid, near, stars,
      farPines: pines('fp', far, 160, 10, 22),
      midPines: pines('mp', mid, 240, 18, 40),
      nearPines: pines('np', near, 90, 60, 150, [[0, 260], [1560, W]]),
    };
  }, []);

  const groundY = 950;
  const flicker = 0.86 + 0.08 * wave(f, 37, 0.3) + 0.06 * wave(f, 61, 1.7);
  // thin wisps: many small puffs that rise slowly, drift with the wind and cool as they climb (loop-safe)
  const smoke = Array.from({ length: 46 }, (_, i) => {
    const speed = 2 + (i % 3); // integer loops per 20 s keeps the cycle seamless
    const t = ((f / LOOP) * speed + random('w' + i)) % 1;
    const drift = t * 150 + Math.sin(t * 6 + i * 0.7) * (14 + t * 40);
    return { x: fireX + drift, y: groundY - 18 - t * 560, w: 26 + t * 170, h: 18 + t * 70, a: Math.sin(Math.min(1, t * 1.25) * Math.PI) * (0.13 - t * 0.07), warm: Math.max(0, 1 - t * 2.6), rot: -20 + t * 35 };
  });

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #050d24 0%, #0b1d48 32%, #17366f 62%, #2b5590 80%, #3c6aa0 100%)', overflow: 'hidden' }}>
      {/* moon glow and crescent */}
      <div style={{ position: 'absolute', left: 1560 - 340, top: 180 - 340, width: 680, height: 680, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(170,200,255,0.16), rgba(170,200,255,0) 70%)' }} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <mask id="crescent"><circle cx={1560} cy={180} r={40} fill="#fff" /><circle cx={1576} cy={170} r={36} fill="#000" /></mask>
          <radialGradient id="star"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        </defs>
        {scene.stars.map((s, i) => {
          const a = s.a * (0.72 + 0.28 * wave(f, s.k, s.ph));
          return s.r > 1.6
            ? <circle key={i} cx={s.x} cy={s.y} r={s.r * 3.2} fill="url(#star)" opacity={a} />
            : <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#dfe8ff" opacity={a} />;
        })}
        <circle cx={1560} cy={180} r={40} fill="#f3f1e6" mask="url(#crescent)" />
      </svg>

      {/* far ridge, mist, mid ridge */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <path d={ridgePath(scene.far)} fill="#203f78" />
        <path d={scene.farPines} fill="#1b376b" />
      </svg>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: 'absolute', left: 200 + i * 560 + 70 * wave(f, 1, i * 2), top: 720 + i * 18, width: 900, height: 140, borderRadius: '50%', background: 'rgba(160,190,235,0.16)', filter: 'blur(38px)' }} />
      ))}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <path d={ridgePath(scene.mid)} fill="#132a57" />
        <path d={scene.midPines} fill="#10244c" />
      </svg>
      <div style={{ position: 'absolute', left: -100 + 50 * wave(f, 1, 4), top: 850, width: 2200, height: 120, borderRadius: '50%', background: 'rgba(140,170,220,0.12)', filter: 'blur(30px)' }} />

      {/* firelight on the smoke and ground (the flame itself stays below the rim) */}
      <div style={{ position: 'absolute', left: fireX - 360, top: groundY - 420, width: 720, height: 620, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(255,138,76,${0.3 * flicker}), rgba(255,110,50,0) 72%)`, mixBlendMode: 'screen' }} />
      {smoke.map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: s.x - s.w / 2, top: s.y - s.h / 2, width: s.w, height: s.h, borderRadius: '50%', transform: `rotate(${s.rot}deg)`, background: `rgba(${Math.round(160 + 95 * s.warm)},${Math.round(168 + 2 * s.warm)},${Math.round(200 - 120 * s.warm)},${Math.max(0, s.a)})`, filter: 'blur(14px)' }} />
      ))}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="rim" cx={fireX} cy={groundY - 6} r="240" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff9a5a" stopOpacity={0.55 * flicker} />
            <stop offset="1" stopColor="#ff9a5a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={ridgePath(scene.near)} fill="#081430" />
        <path d={ridgePath(scene.near)} fill="url(#rim)" opacity={0.35} />
        <path d={scene.nearPines} fill="#060f26" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(2,6,18,0.55) 100%)' }} />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};
