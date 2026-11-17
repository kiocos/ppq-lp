import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, F, CIPHER, CipherGlitch, Fonts, Grain, Scanlines, Vignette, bump, clamp, ease, keys, ramp, wrapMono } from './lib';
import { Cursor, MSG, Message, R, Server, Vault, CharState } from './parts';

/**
 * The silent loop that plays in place before anyone presses play (8 s, seamless).
 * A close look at the enclave: every 4 s a sealed message drops through the top port, its words come back
 * inside in warm light, then it is sealed again on the way out. On the second pass someone's cursor
 * pokes the wall and bounces. A flicker of the film's cipher glitch covers the loop point.
 */
const PROMPTS = [
  { text: 'Summarize these board notes into five decisions.', cipher: CIPHER.a },
  { text: 'Draft a reply to my landlord about the rent.', cipher: CIPHER.b },
];
export const Teaser: React.FC<{ portrait?: boolean }> = ({ portrait = false }) => {
  const frame = useCurrentFrame();
  const { fps, width: fw, height: fh } = useVideoConfig();
  const t = frame / fps, cyc = Math.floor(t / 4) % 2, tau = t % 4;
  const wall = 26;
  const V: R = { x: 0, y: 0, w: 560, h: wall * 2 + 50 + MSG.h + 46 };
  const S: R = { x: -30, y: -250, w: 620, h: 250 + V.h + 40 };
  const Lg: R = { x: 0, y: -190, w: 560, h: 170 };
  const cx = V.w / 2;
  const U = { top: Lg.y + 10 + MSG.h / 2, encIn: V.y + wall / 2, enc: V.y + wall + 50 + MSG.h / 2, encOut: V.y + V.h - wall / 2, gone: V.y + V.h + 260 };
  const { text, cipher } = PROMPTS[cyc];
  const { lines, clines } = wrapMono(text, MSG.cols, cipher);
  const u = keys([[0.15, U.top], [1.0, U.encIn], [1.4, U.enc], [2.6, U.enc], [3.0, U.encOut], [3.5, U.gone]], tau);
  const near = (p: number) => clamp(1 - Math.abs(u - p) / (MSG.h / 2 + 30));
  const sq = Math.max(near(U.encIn), near(U.encOut));
  const msgTop = u - MSG.h / 2;
  const state = (_i: number, r: number, c: number): CharState => {
    const y = msgTop + MSG.pad + r * MSG.lh + MSG.lh / 2;
    const d = Math.min(y - (V.y + wall), V.y + V.h - wall - y) - c * 1.1;
    return d > 4 ? 'p' : d > -12 ? 'n' : 'c';
  };
  const warm = ease(ramp(tau, 1.2, 1.7)) * (1 - ease(ramp(tau, 2.6, 3.4)));
  const hot = ease(ramp(tau, 1.25, 1.5)) * (1 - ease(ramp(tau, 2.6, 2.8)));
  // the cursor's poke, second pass only
  const poke = cyc === 1;
  const ck = ease(ramp(tau, 1.7, 2.3)), back = ease(ramp(tau, 2.3, 2.5));
  const flash = poke ? bump(tau, 2.3, 2.85) : 0, shake = poke ? Math.sin(t * 90) * 4 * bump(tau, 2.3, 2.6) : 0;
  const glitch = Math.max(0.8 * bump(tau, 3.82, 4.0), 0.8 * bump(tau, -0.2, 0.14), 0.25 * bump(tau, 1.0, 1.25));
  // camera: fixed on the enclave with a slow, loop-safe drift
  const region: R = { x: S.x, y: S.y + 60, w: S.w, h: S.h - 60 };
  const s = Math.min(fw * 0.8 / region.w, fh * 0.86 / region.h) * (1 + 0.015 * Math.sin((t / 8) * Math.PI * 2));
  const tf = `translate(${fw / 2 - (region.x + region.w / 2) * s}px, ${fh / 2 - (region.y + region.h / 2) * s}px) scale(${s})`;
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: F.body }}>
      <Fonts />
      <CipherGlitch amount={glitch} seed={'teaser' + cyc}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 1px 1px, rgba(255,255,255,.04) 1px, transparent 0) 0 0 / 28px 28px, ${C.bg}` }}>
          <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: tf }}>
            <Server r={S} lg={Lg} t={t} hit={0} hitTop={0} ledFrame={frame} />
            <Vault r={V} wall={wall} warm={warm} t={t} portIn={near(U.encIn)} portOut={near(U.encOut)} shake={shake} flash={flash} />
            <div style={{ position: 'absolute', left: V.w / 2 - 560, top: V.h / 2 - 560, width: 1120, height: 1120, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(243,140,90,.45), rgba(191,60,27,.22) 42%, rgba(191,60,27,0) 100%)', mixBlendMode: 'screen', opacity: warm * 0.85 }} />
            <div style={{ opacity: ramp(tau, 0.05, 0.3) * (1 - ramp(tau, 3.2, 3.45)) }}>
              <Message x={cx - MSG.w / 2} y={msgTop} sx={1 - 0.72 * sq} sy={1} lines={lines} clines={clines} state={state} typed={999} frame={frame} hot={hot} read={0} strike={0} />
            </div>
            {poke && <Cursor x={V.w - 150 + 60 * (1 - ck)} y={-120 + 126 * ck - 40 * back} o={ramp(tau, 1.6, 1.75) * (1 - ramp(tau, 2.7, 2.95))} />}
          </div>
        </AbsoluteFill>
      </CipherGlitch>
      <Scanlines opacity={0.035} />
      <Grain opacity={0.16} />
      <Vignette />
    </AbsoluteFill>
  );
};
