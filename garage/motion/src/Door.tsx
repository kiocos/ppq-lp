// The star: a closed sectional door, lit only by the strip of light escaping under it.
// Everything is lit from one source (the gap), so the door face is brightest near the floor and
// fades to black upward. That keeps the top of the frame dark enough for a headline.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C } from './theme';
import { clamp01, hash, lerp, smooth } from './common';

export type Shadow = { x: number; strength: number; width: number };
export type DoorProps = {
  W: number;
  H: number;
  floorY: number;          // y of the floor line (door bottom when closed)
  doorX: number;           // opening left edge
  doorW: number;           // opening width
  doorTop: number;         // opening top (may be negative: the door runs out of frame)
  panelH: number;          // height of one door section, in px
  framed?: boolean;        // draw the wall, jambs and header around the opening
  open?: number;           // 0 closed .. 1 fully raised
  intensity?: number;      // light multiplier (flicker), around 1
  shadows?: Shadow[];      // something passing between the lamp and the door, x in 0..1 of the opening
  interior?: React.ReactNode; // what is behind the door (drawn in the opening)
  gap?: number;            // gap height when closed, px
  scale?: number;          // global size factor for glows and lines (1 at 1920 wide)
  seed?: number;
  floorReflect?: number;   // 0..1 strength of the specular reflection on the floor
  plain?: boolean;         // no door drawn: the dark above the strip is just the page (Threshold take)
};

// Light profile along the strip: uneven weather seal x passing shadows. Returns 0..1 per sample.
const profile = (n: number, shadows: Shadow[], seed: number, blur = 0, ends = 0.025) => {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1);
    // seal unevenness: a few slow undulations plus a couple of worn bright spots
    let v = 0.82 + 0.1 * Math.sin(x * 9.3 + seed) + 0.06 * Math.sin(x * 23.1 + seed * 2);
    v += 0.1 * Math.exp(-Math.pow((x - (0.18 + 0.1 * hash(seed))) / 0.03, 2));
    v += 0.08 * Math.exp(-Math.pow((x - (0.71 + 0.08 * hash(seed + 3))) / 0.04, 2));
    // the strip dims at the very ends, where the jamb seals are tighter
    v *= smooth(x / ends) * smooth((1 - x) / ends);
    for (const s of shadows) {
      const w = s.width + blur;
      v *= 1 - s.strength * Math.exp(-Math.pow((x - s.x) / w, 2));
    }
    out.push(clamp01(v));
  }
  return out;
};

const hgrad = (vals: number[], rgb: string, alpha: number) =>
  `linear-gradient(90deg, ${vals.map((v, i) => `rgba(${rgb},${(v * alpha).toFixed(3)}) ${((i / (vals.length - 1)) * 100).toFixed(1)}%`).join(', ')})`;
const hmask = (vals: number[]) =>
  `linear-gradient(90deg, ${vals.map((v, i) => `rgba(0,0,0,${v.toFixed(3)}) ${((i / (vals.length - 1)) * 100).toFixed(1)}%`).join(', ')})`;

// Static textures (SVG noise). Brushed: stretched horizontally like rolled steel; grain: fine and even.
const Noise: React.FC<{ id: string; freq: string; octaves?: number; opacity: number; blend: React.CSSProperties['mixBlendMode']; seed?: number }> = ({ id, freq, octaves = 2, opacity, blend, seed = 2 }) => (
  <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, mixBlendMode: blend, opacity }}>
    <filter id={id} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={octaves} seed={seed} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter={`url(#${id})`} />
  </svg>
);

export const Door: React.FC<DoorProps> = (p) => {
  const {
    W, H, floorY, doorX, doorW, doorTop, panelH, framed = false, open = 0, intensity = 1,
    shadows = [], interior, gap = 4, scale = 1, seed = 1, floorReflect = 1, plain = false,
  } = p;
  const doorH = floorY - doorTop;
  const lift = open * (doorH + 40 * scale); // fully raised = out of the opening
  const bottom = floorY - lift; // the door's bottom edge
  const g = Math.max(gap * scale, floorY - bottom + gap * scale * (1 - open)); // visible gap height
  const out = intensity * lerp(1, 1.25, smooth(open * 3)); // more opening, a little more light out; the interior is not a floodlight
  const N = 48;
  const ends = plain ? 0.16 : 0.025; // with no jambs, the strip simply fades out at both ends
  const prof = profile(N, shadows, seed, 0, ends);
  const profSoft = profile(N, shadows, seed, 0.06, ends);
  const profFar = profile(N, shadows, seed, 0.16, ends);
  const spillLen = (H - floorY) * lerp(0.9, 1.35, smooth(open * 2));
  const fan = lerp(0.1, 0.32, smooth(open * 2.5)); // how much the spill widens toward the viewer, per side

  // door sections: seams counted from the bottom edge
  const seams: number[] = [];
  for (let k = 1; k * panelH < doorH + lift + panelH; k++) seams.push(k * panelH);
  const ribs: number[] = [];
  seams.concat([0]).forEach((s) => { ribs.push(s + panelH * 0.36, s + panelH * 0.68); });

  // brightness of door-face details as a function of height above the door's bottom edge
  const lit = (h: number) => clamp01(Math.exp(-h / (panelH * 0.95)) * 0.9 + Math.exp(-h / (panelH * 3.2)) * 0.18) * Math.min(1.6, out);

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: 'hidden' }}>
      {/* wall: only visible when the door is framed */}
      {framed && (
        <>
          {/* flat wall in the page colour (grain is applied by the page, not baked in), warmed near the floor */}
          <div style={{ position: 'absolute', left: doorX - doorW * 0.35, width: doorW * 1.7, top: floorY - panelH * 2.6, height: panelH * 2.6, background: `radial-gradient(ellipse 50% 100% at 50% 100%, rgba(${C.glow},${(0.07 * out).toFixed(3)}), rgba(${C.glow},0) 70%)` }} />
        </>
      )}

      {/* behind the door */}
      <div style={{ position: 'absolute', left: doorX, top: doorTop, width: doorW, height: doorH, overflow: 'hidden', background: plain ? C.ink : '#140c07' }}>
        {interior}
      </div>

      {/* the door face, clipped to the opening and raised by `open` */}
      <div style={{ position: 'absolute', left: doorX, top: doorTop, width: doorW, height: doorH, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: -lift, height: doorH }}>
          {!plain && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${C.ink} 0%, ${C.door} 55%, #191512 100%)` }} />}
          {/* bounce light from the floor, warm, strongest at the bottom edge */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: panelH * 3.4, background: `linear-gradient(0deg, rgba(${C.glow},${(0.32 * Math.min(1.5, out)).toFixed(3)}) 0%, rgba(${C.glow},${(0.12 * out).toFixed(3)}) 22%, rgba(${C.glow},${(0.035 * out).toFixed(3)}) 55%, rgba(${C.glow},0) 100%)`, WebkitMaskImage: hmask(profFar.map((v) => (plain ? v : 0.35 + 0.65 * v))) }} />
          {!plain && <Noise id="brushed" freq="0.0016 0.55" opacity={0.34} blend="overlay" seed={seed} />}
          {!plain && <Noise id="doorgrain" freq="0.95" opacity={0.2} blend="overlay" seed={seed + 1} />}
          {/* ribs: shallow pressed lines, lit on their downward face */}
          {!plain && ribs.map((h, i) => {
            const a = lit(h) * 0.5;
            if (a < 0.01) return null;
            return (
              <div key={'r' + i} style={{ position: 'absolute', left: 0, right: 0, bottom: h, height: 2 * scale }}>
                <div style={{ position: 'absolute', inset: 0, top: 0, height: 1 * scale, background: `rgba(${C.glowHot},${a.toFixed(3)})`, WebkitMaskImage: hmask(profSoft.map((v) => 0.25 + 0.75 * v)) }} />
                <div style={{ position: 'absolute', left: 0, right: 0, top: 1 * scale, height: 1 * scale, background: `rgba(0,0,0,${(0.5).toFixed(2)})` }} />
              </div>
            );
          })}
          {/* seams between sections: a lit lip over a dark groove */}
          {!plain && seams.map((h, i) => {
            const a = lit(h);
            return (
              <div key={'s' + i} style={{ position: 'absolute', left: 0, right: 0, bottom: h - 3 * scale, height: 6 * scale }}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 1.5 * scale, background: `rgba(${C.glowHot},${(a * 0.85).toFixed(3)})`, WebkitMaskImage: hmask(profSoft.map((v) => 0.2 + 0.8 * v)) }} />
                <div style={{ position: 'absolute', left: 0, right: 0, top: 1.5 * scale, height: 3 * scale, background: '#030303' }} />
                <div style={{ position: 'absolute', left: 0, right: 0, top: 4.5 * scale, height: 1.5 * scale, background: `rgba(255,255,255,${(0.025 + a * 0.05).toFixed(3)})` }} />
              </div>
            );
          })}
          {/* the bottom seal: rubber edge, rim-lit by the gap */}
          {!plain && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 7 * scale, background: '#060504' }} />}
          {!plain && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 6 * scale, height: 1.5 * scale, background: hgrad(prof, C.glowHot, 0.75 * Math.min(1.4, out)) }} />}
        </div>
      </div>

      {/* jambs and header: the frame of the opening */}
      {framed && (
        <>
          <div style={{ position: 'absolute', left: doorX - 26 * scale, top: doorTop - 24 * scale, width: 26 * scale, height: floorY - doorTop + 24 * scale, background: 'linear-gradient(90deg, #080707, #0f0d0c)', boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'absolute', left: doorX + doorW, top: doorTop - 24 * scale, width: 26 * scale, height: floorY - doorTop + 24 * scale, background: 'linear-gradient(270deg, #080707, #0f0d0c)', boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'absolute', left: doorX - 26 * scale, top: doorTop - 24 * scale, width: doorW + 52 * scale, height: 24 * scale, background: '#0d0c0b', boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.05)' }} />
          {/* jamb faces catch a little of the floor light near the bottom */}
          <div style={{ position: 'absolute', left: doorX - 26 * scale, top: floorY - panelH * 1.6, width: 26 * scale, height: panelH * 1.6, background: `linear-gradient(0deg, rgba(${C.glow},${(0.18 * out).toFixed(3)}), rgba(${C.glow},0))` }} />
          <div style={{ position: 'absolute', left: doorX + doorW, top: floorY - panelH * 1.6, width: 26 * scale, height: panelH * 1.6, background: `linear-gradient(0deg, rgba(${C.glow},${(0.18 * out).toFixed(3)}), rgba(${C.glow},0))` }} />
        </>
      )}

      {/* floor: page colour. Light from an opening fans out as it travels, so the spill is a trapezoid. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: floorY, bottom: 0, background: C.ink, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, filter: `blur(${10 * scale}px)` }}>
          <div style={{ position: 'absolute', inset: 0, clipPath: `polygon(${doorX}px 0, ${doorX + doorW}px 0, ${doorX + doorW + doorW * fan}px ${spillLen * 1.3}px, ${doorX - doorW * fan}px ${spillLen * 1.3}px)` }}>
            {/* far spill: wide, soft, long */}
            <div style={{ position: 'absolute', left: doorX - doorW * (fan + 0.02), width: doorW * (1 + 2 * fan + 0.04), top: 0, height: spillLen * 1.3, WebkitMaskImage: hmask(profFar), background: `radial-gradient(ellipse 62% 100% at 50% 0%, rgba(${C.glow},${(0.34 * out).toFixed(3)}) 0%, rgba(${C.glow},${(0.11 * out).toFixed(3)}) 45%, rgba(${C.glow},0) 100%)` }} />
            {/* near spill: brighter, follows the strip closely */}
            <div style={{ position: 'absolute', left: doorX - doorW * fan * 0.4, width: doorW * (1 + fan * 0.8), top: 0, height: spillLen * 0.5, WebkitMaskImage: hmask(profSoft), background: `linear-gradient(180deg, rgba(${C.glowHot},${(0.58 * Math.min(1.3, out) * (1 - 0.35 * smooth(open * 3))).toFixed(3)}) 0%, rgba(${C.glow},${(0.24 * out).toFixed(3)}) 30%, rgba(${C.glow},0) 100%)` }} />
          </div>
        </div>
        {/* specular reflection of the strip on polished concrete */}
        <div style={{ position: 'absolute', left: doorX, width: doorW, top: 0, height: (14 + g * 0.9) * scale * floorReflect, filter: `blur(${2.5 * scale}px)`, background: hgrad(prof, C.glowHot, 0.55 * floorReflect * Math.min(1.3, out)), WebkitMaskImage: 'linear-gradient(180deg, #000, transparent)' }} />
        {/* concrete texture, only where the light falls */}
        <div style={{ position: 'absolute', left: doorX - doorW * fan, width: doorW * (1 + 2 * fan), top: 0, height: spillLen * 1.2, WebkitMaskImage: 'radial-gradient(ellipse 50% 100% at 50% 0%, #000 30%, transparent 100%)' }}>
          <Noise id="concrete" freq="0.55" octaves={3} opacity={0.45} blend="overlay" seed={seed + 7} />
        </div>
      </div>

      {/* the strip itself, and its bloom. These stay at the floor line: once the door is up the
          interior is the light, so nothing should wash over the opening. */}
      <div style={{ position: 'absolute', left: doorX - 40 * scale, width: doorW + 80 * scale, top: floorY - 70 * scale, height: 140 * scale, background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(${C.glow},${(0.16 * out).toFixed(3)}), rgba(${C.glow},0) 70%)`, mixBlendMode: 'screen' }} />
      <div style={{ position: 'absolute', left: doorX, width: doorW, top: floorY - gap * scale - 10 * scale, height: gap * scale + 20 * scale, filter: `blur(${9 * scale}px)`, background: hgrad(prof, C.glow, 0.85 * Math.min(1.4, out)), mixBlendMode: 'screen', opacity: 1 - 0.6 * smooth(open * 4) }} />
      <div style={{ position: 'absolute', left: doorX, width: doorW, top: floorY - gap * scale - 2 * scale, height: gap * scale + 4 * scale, filter: `blur(${2.2 * scale}px)`, background: hgrad(prof, C.glowHot, 0.95), mixBlendMode: 'screen', opacity: 1 - smooth(open * 6) }} />
      {open < 0.04 && (
        <div style={{ position: 'absolute', left: doorX, width: doorW, top: floorY - gap * scale, height: gap * scale * 0.7, background: hgrad(prof, '255,236,212', Math.min(1, 0.92 * intensity)), mixBlendMode: 'screen' }} />
      )}
      {/* when the door is up, its bottom edge catches the interior light */}
      {open > 0.01 && (
        <div style={{ position: 'absolute', left: doorX, width: doorW, top: bottom - 2 * scale, height: 3 * scale, background: `rgba(${C.glowHot},${(0.7 * smooth(open * 8)).toFixed(3)})`, filter: `blur(${1 * scale}px)` }} />
      )}
    </AbsoluteFill>
  );
};
