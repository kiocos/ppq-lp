// The real model picker develops out of grain, browses (chat, image, video, a search for Kimi with its E2EE version), then returns to grain
import React from 'react';
import { AbsoluteFill, Freeze, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, Img } from 'remotion';
import { DUO_FILTER, DuoTint, Safelight, developMask, grainFieldDark, lin, prog } from './common';

const SRC = { w: 2880, h: 1800, frames: 504, file: 'app/video-picker-browse-master.mp4' };
// crop around the picker: centre and source width as fractions of the recording
const CROP = { cx: 0.532, cy: 0.585, sw: 0.385 }; // round 3: inside the picker's border
const T = { devIn: [6, 70] as const, play: 52, fix: [64, 100] as const, out: [560, 590] as const };
export const PICKER_FRAMES = 592;

export const PickerDevelop: React.FC = () => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const s = W / (CROP.sw * SRC.w);
  const vw = SRC.w * s, vh = SRC.h * s;
  const tx = W / 2 - CROP.cx * vw, ty = H / 2 - CROP.cy * vh;
  const dev = prog(f, T.devIn[0], T.devIn[1]);
  const fix = prog(f, T.fix[0], T.fix[1]);
  const out = lin(f, T.out[0], T.out[1]);
  const t = out > 0 ? 1 - out : dev;
  // mask in output space: top-left first, broken by grain
  const m = developMask(300, Math.round(300 * H / W), t, (x, y) => 1 - (y * 0.7 + x * 0.3), { weight: out > 0 ? 0 : 0.5, seed: 41 });
  const vf = Math.round(Math.min(SRC.frames - 1, Math.max(0, f - T.play)));
  const tone = 1 - fix;
  return (
    <AbsoluteFill style={{ background: '#080604', overflow: 'hidden' }}>
      <Img src={grainFieldDark(400, Math.round(400 * H / W), Math.floor(f / 5), { x: 0.5, y: -0.25, r: 1.2 })} style={{ position: 'absolute', inset: 0, width: W, height: H }} />
      <AbsoluteFill style={m === 'none' ? { opacity: 0 } : m ? { WebkitMaskImage: `url(${m})`, maskImage: `url(${m})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' } : {}}>
        <div style={{ position: 'absolute', left: tx, top: ty, width: vw, height: vh }}>
          <Freeze frame={vf}><OffthreadVideo src={staticFile(SRC.file)} muted style={{ width: vw, height: vh }} /></Freeze>
        </div>
        {tone > 0.001 && (
          <AbsoluteFill style={{ isolation: 'isolate', opacity: tone }}>
            <div style={{ position: 'absolute', left: tx, top: ty, width: vw, height: vh }}>
              <Freeze frame={vf}><OffthreadVideo src={staticFile(SRC.file)} muted style={{ width: vw, height: vh, filter: DUO_FILTER(dev) }} /></Freeze>
            </div>
            <DuoTint />
          </AbsoluteFill>
        )}
      </AbsoluteFill>
      {/* round 3: a soft dark edge, so no chat text peeks in at the sides */}
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'linear-gradient(90deg, #080604 0%, rgba(8,6,4,0) 6%, rgba(8,6,4,0) 94%, #080604 100%)' }} />
      <Safelight x={0.5} y={-0.2} strength={0.35 * (1 - 0.7 * fix) + 0.25 * out} />
    </AbsoluteFill>
  );
};
