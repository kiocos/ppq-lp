// Privacy explainer: a chat request crosses browser → PayPerQ → enclave → provider and back
// layout 'wide' (desktop, stations left to right) or 'tall' (phones, stations top to bottom)
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Fonts, Grain, prog, scramble } from './common';
import { enclave, palettes } from './theme';

type Rect = { x: number; y: number; w: number; h: number };
type Layout = {
  panel: (i: number) => Rect; packet: (pos: number) => { x: number; y: number; w: number };
  rowsTop: number; rowsW: number; caption: Rect & { size: number }; dots: (g: number) => React.CSSProperties; dotsDir: 'row' | 'column';
  titleSize: number; subSize: number; mono: number;
};

const wideLayout = (stretched: boolean): Layout => {
  const PW = 332, GAP = 40, LEFT = (1600 - (PW * 4 + GAP * 3)) / 2, TOP = 64, PH = 480;
  const px = (i: number) => LEFT + i * (PW + GAP);
  return {
    panel: (i) => ({ x: px(i), y: TOP, w: PW, h: PH }),
    packet: (pos) => ({ x: LEFT + pos * (PW + GAP) + 22, y: TOP + 128, w: PW - 44 }),
    rowsTop: 300, rowsW: PW - 48,
    caption: { x: LEFT, y: TOP + PH + 50, w: 1600 - LEFT * 2, h: 100, size: 38 },
    dots: (g) => ({ left: px(g) + PW + 9, top: TOP + 128 + 64, width: GAP - 18 }), dotsDir: 'row',
    titleSize: stretched ? 25 : 32, subSize: 21, mono: 21,
  };
};
const tallLayout = (stretched: boolean): Layout => {
  const PW = 960, PH = 262, GAP = 30, LEFT = 60, TOP = 50;
  const py = (i: number) => TOP + i * (PH + GAP);
  return {
    panel: (i) => ({ x: LEFT, y: py(i), w: PW, h: PH }),
    packet: (pos) => ({ x: LEFT + 470, y: TOP + pos * (PH + GAP) + 26, w: 464 }),
    rowsTop: 116, rowsW: 410,
    caption: { x: LEFT, y: py(4) + 30, w: PW, h: 200, size: 46 },
    dots: (g) => ({ left: LEFT + 470 + 220, top: py(g) + PH + 3, height: GAP - 6 }), dotsDir: 'column',
    titleSize: stretched ? 30 : 38, subSize: 25, mono: 25,
  };
};

const PROMPT = 'Draft a reply to my landlord about the 18% rent increase.';
const REPLY = 'Hi Daniel, thanks for sending the renewal terms. I’d like to stay…';

type Stage = { from: number; to: number; lead: string; rest: string };
const STAGES: Stage[] = [
  { from: 0, to: 80, lead: 'Sealed in your browser.', rest: ' Encrypted to the enclave before it leaves your device.' },
  { from: 80, to: 215, lead: 'PayPerQ relays and bills.', rest: ' We see the model and token count, not the words.' },
  { from: 215, to: 300, lead: 'Opened only inside the enclave.', rest: ' Isolated hardware running a published build.' },
  { from: 300, to: 348, lead: 'The provider runs the model.', rest: ' It sees the prompt, not your IP address.' },
  { from: 348, to: 450, lead: 'The reply comes back sealed.', rest: ' Only your browser can read it.' },
];

const clampI = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const Sealed: React.FC<{ palette: keyof typeof palettes; layout?: 'wide' | 'tall' }> = ({ palette, layout = 'wide' }) => {
  const p = palettes[palette];
  const f = useCurrentFrame();
  const L = layout === 'tall' ? tallLayout(Boolean(p.displayStretch)) : wideLayout(Boolean(p.displayStretch));

  const pos =
    f < 80 ? 0 : f < 120 ? prog(f, 80, 120) : f < 175 ? 1 : f < 215 ? 1 + prog(f, 175, 215) : f < 260 ? 2 :
    f < 300 ? 2 + prog(f, 260, 300) : f < 348 ? 3 : f < 368 ? 3 - prog(f, 348, 368) : f < 380 ? 2 : f < 410 ? 2 - 2 * prog(f, 380, 410) : 0;
  const seal =
    f < 50 ? 0 : f < 80 ? prog(f, 50, 80) : f < 215 ? 1 : f < 250 ? 1 - prog(f, 215, 250) : f < 368 ? 0 :
    f < 380 ? prog(f, 368, 380) : f < 410 ? 1 : 1 - prog(f, 410, 428);

  const isReply = f >= 338;
  const typed = f < 48 ? PROMPT.slice(0, Math.floor((f / 46) * PROMPT.length)) : PROMPT;
  const text = isReply ? (f < 348 ? REPLY.slice(0, Math.floor(((f - 338) / 10) * REPLY.length)) : REPLY) : typed;
  const shown = scramble(text, seal, isReply ? 'r' : 'q', f);
  const pk = L.packet(pos);
  const loopFade = interpolate(f, [432, 449], [1, 0], clampI);
  const packetIn = interpolate(f, [0, 8], [0, 1], clampI);
  const glow = f >= 215 && f < 300 ? Math.sin(prog(f, 215, 300) * Math.PI) : f >= 348 && f < 380 ? 0.6 * Math.sin(prog(f, 348, 380) * Math.PI) : 0;
  const flicker = 0.85 + 0.15 * Math.sin(f * 0.9) * Math.sin(f * 0.37);

  const row = (k: string, v: string, o: number, color = p.text) => (
    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', font: `400 ${L.mono - 1}px/1 '${p.mono}'`, padding: '12px 0', opacity: o }}>
      <span style={{ color: p.dim }}>{k}</span><span style={{ color }}>{v}</span>
    </div>
  );
  const appear = (start: number) => interpolate(f, [start, start + 12], [0, 1], clampI);

  const Panel: React.FC<{ i: number; title: string; sub: string; children?: React.ReactNode; active: boolean }> = ({ i, title, sub, children, active }) => {
    const r = L.panel(i);
    return (
      <div style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 24, background: p.panel, overflow: 'hidden', boxShadow: active ? `inset 0 0 0 1.5px ${p.faint}` : 'inset 0 0 0 1px rgba(255,255,255,0.03)' }}>
        <div style={{ padding: '28px 26px 0' }}>
          <div style={{ font: `${p.displayWeight} ${L.titleSize}px/1.1 '${p.display}'`, fontStretch: p.displayStretch, letterSpacing: p.displayTracking, color: p.text, whiteSpace: 'nowrap' }}>{title}</div>
          <div style={{ font: `400 ${L.subSize}px/1.35 '${p.sans}'`, color: p.dim, marginTop: 8 }}>{sub}</div>
        </div>
        {children}
      </div>
    );
  };

  const stageNow = STAGES.find((s) => f >= s.from && f < s.to) ?? STAGES[STAGES.length - 1];
  const fadeIn = interpolate(f, [stageNow.from, stageNow.from + 10], [0, 1], clampI);
  const fadeOut = stageNow === STAGES[STAGES.length - 1] ? 1 : interpolate(f, [stageNow.to - 8, stageNow.to], [1, 0], clampI);
  const stageFade = Math.min(fadeIn, fadeOut);
  const lock = (
    <svg width="15" height="17" viewBox="0 0 14 16"><rect x="1" y="7" width="12" height="8" rx="2" fill="currentColor" /><path d="M3.5 7V5a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
  );
  const rows = (children: React.ReactNode) => (
    <div style={{ position: 'absolute', left: 26, width: L.rowsW, top: L.rowsTop }}>{children}</div>
  );
  const foot: React.CSSProperties = { position: 'absolute', left: 26, width: L.rowsW, bottom: 26 };

  return (
    <AbsoluteFill style={{ background: p.bg, fontFamily: p.sans }}>
      <Fonts />
      <div style={{ position: 'absolute', inset: 0, opacity: loopFade }}>
        <Panel i={0} title="Your browser" sub="Encrypts before sending" active={pos < 0.5}>
          <div style={{ ...foot, opacity: f >= 96 && f < 400 ? appear(96) : 0, font: `400 ${L.subSize - 2}px/1.4 '${p.sans}'`, color: p.dim, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ color: p.accentInk, display: 'flex' }}>{lock}</span> Sent sealed · waiting for reply
          </div>
        </Panel>
        <Panel i={1} title="PayPerQ servers" sub="Route and bill" active={pos >= 0.5 && pos < 1.5}>
          {rows(<>
            {row('model', 'gpt-6-luna', appear(126))}
            {row('tokens', '1,840 in', appear(134))}
            {row('contents', '●●●●●● sealed', appear(142), p.accentInk)}
          </>)}
        </Panel>
        <Panel i={2} title="Secure enclave" sub={`AWS Nitro · build ${enclave.version}`} active={pos >= 1.5 && pos < 2.5}>
          <div style={{ position: 'absolute', left: -40, right: -40, bottom: -170, height: 420, background: `radial-gradient(closest-side, rgba(${p.glow},${0.6 * glow * flicker}), rgba(${p.glow},0) 70%)` }} />
          <div style={foot}>
            <div style={{ font: `500 ${L.subSize - 2}px/1 '${p.sans}'`, color: p.good, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 9, height: 9, borderRadius: 9, background: p.good, display: 'inline-block' }} /> Attested measurement
            </div>
            <div style={{ font: `400 ${L.mono - 3}px/1.5 '${p.mono}'`, color: p.dim, marginTop: 10, letterSpacing: '0.04em' }}>{enclave.pcr0.slice(0, 24).match(/.{4}/g)!.join(' ')}</div>
          </div>
        </Panel>
        <Panel i={3} title="Model provider" sub="OpenAI, for this chat" active={pos >= 2.5}>
          {rows(f < 300 ? (
            <div style={{ font: `400 ${L.subSize - 2}px/1.4 '${p.sans}'`, color: p.dim, opacity: 0.7, paddingTop: 12 }}>Waiting for a request</div>
          ) : (
            <>
              {row('sees', 'the prompt', appear(306))}
              {row('your IP', 'not shared', appear(316), p.good)}
              {row('reply', f >= 350 ? 'sent' : '…', appear(326))}
            </>
          ))}
        </Panel>

        {[0, 1, 2].map((g) => (
          <div key={g} style={{ position: 'absolute', ...L.dots(g), display: 'flex', flexDirection: L.dotsDir, justifyContent: 'space-between', alignItems: 'center' }}>
            {[0, 1, 2].map((d) => <span key={d} style={{ width: 5, height: 5, borderRadius: 5, background: p.faint }} />)}
          </div>
        ))}

        <div style={{ position: 'absolute', left: pk.x, top: pk.y, width: pk.w, opacity: packetIn, borderRadius: 18, padding: '18px 20px 20px', background: seal > 0.5 ? p.bg : p.panel2, boxShadow: seal > 0.5 ? `inset 0 0 0 1px ${p.faint}` : '0 18px 40px rgba(0,0,0,0.22)' }}>
          <div style={{ font: `500 ${L.subSize - 3}px/1 '${p.sans}'`, color: seal > 0.5 ? p.accentInk : p.dim, marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            {lock}{seal > 0.5 ? 'Sealed to the enclave' : isReply ? 'Reply' : 'Your message'}
          </div>
          <div style={{ font: `400 ${L.mono}px/1.45 '${p.mono}'`, color: seal > 0.5 ? p.dim : p.text, minHeight: L.mono * 4.4, wordBreak: seal > 0.5 ? 'break-all' : 'normal', overflowWrap: 'anywhere' }}>{shown}</div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: L.caption.x, width: L.caption.w, top: L.caption.y, font: `400 ${L.caption.size}px/1.3 '${p.sans}'`, letterSpacing: '-0.015em', opacity: stageFade * loopFade }}>
        <span style={{ color: p.text }}>{stageNow.lead}</span>
        <span style={{ color: p.dim }}>{stageNow.rest}</span>
      </div>
      <Grain opacity={p.grain} />
    </AbsoluteFill>
  );
};
