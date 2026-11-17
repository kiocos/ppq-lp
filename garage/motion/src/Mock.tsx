// Hero-only mocks at page size (1440 x 900), to choose a composition before building the page.
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Door } from './Door';
import { Fonts } from './common';
import { C, facts } from './theme';

type V = 'A' | 'B' | 'C' | 'D';
const LOGOS = [['openai', 1], ['claude', 0], ['gemini', 0], ['xai', 1], ['meta', 0], ['mistral', 0], ['deepseek', 0], ['qwen', 0], ['moonshot', 1], ['zai', 1]] as const;

const Nav: React.FC = () => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 64, display: 'flex', alignItems: 'center', padding: '0 120px', gap: 36, font: "400 14px 'Geist'", color: '#a39c92' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, font: "600 19px 'Geist'", color: C.text, letterSpacing: '-0.02em' }}><Img src={staticFile('flame2.png')} style={{ width: 22, height: 22 }} />PayPerQ</div>
    <span>Models</span><span>Privacy</span><span>API</span><span>Pricing</span>
    <div style={{ marginLeft: 'auto', display: 'flex', gap: 20, alignItems: 'center' }}><span>Sign in</span><span style={{ height: 34, padding: '0 14px', borderRadius: 999, background: C.amber, color: '#1a0d05', display: 'inline-flex', alignItems: 'center', fontWeight: 500 }}>Start chatting</span></div>
  </div>
);

const Logos: React.FC<{ y: number; center?: boolean }> = ({ y, center }) => (
  <div style={{ position: 'absolute', left: 120, right: 120, top: y, display: 'flex', alignItems: 'center', gap: 34, justifyContent: center ? 'center' : 'space-between' }}>
    <span style={{ font: "400 13px 'Geist'", color: '#8f887e', marginRight: 10 }}>Models from {facts.providers} providers</span>
    {LOGOS.map(([n, inv]) => <Img key={n} src={staticFile(`logos/models/${n}.svg`)} style={{ height: 24, width: 'auto', opacity: 0.78, filter: inv ? 'invert(1)' : undefined }} />)}
  </div>
);

export const HeroMock: React.FC<{ v: V }> = ({ v }) => {
  const W = 1440, H = 900;
  const display = v === 'D' ? "'Big Shoulders'" : "'Barlow Condensed'";
  const h1Size = v === 'D' ? 104 : 108;
  const headline = (align: 'left' | 'center', top: number) => (
    <div style={{ position: 'absolute', left: 120, right: 120, top, textAlign: align }}>
      <div style={{ font: `600 ${h1Size}px/0.92 ${display}`, letterSpacing: v === 'D' ? '-0.005em' : '-0.012em', color: C.text }}>Chat and build privately.</div>
      <div style={{ font: "400 22px/1.45 'Geist'", letterSpacing: '-0.012em', marginTop: 24, maxWidth: align === 'center' ? 640 : 560, marginLeft: align === 'center' ? 'auto' : 0, marginRight: align === 'center' ? 'auto' : 0 }}>
        <span style={{ color: C.text }}>Your favorite AI models, with privacy you can verify.</span> <span style={{ color: '#aaa297' }}>Use them in chat or through our API, all from one prepaid balance.</span>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 34, justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
        <span style={{ height: 44, padding: '0 20px', borderRadius: 999, background: C.amber, color: '#1a0d05', display: 'inline-flex', alignItems: 'center', font: "500 15px 'Geist'" }}>Start chatting →</span>
        <span style={{ height: 44, padding: '0 20px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)', color: C.text, display: 'inline-flex', alignItems: 'center', font: "500 15px 'Geist'" }}>Get an API key</span>
      </div>
    </div>
  );
  const shadows = [{ x: 0.64, strength: 0.55, width: 0.05 }];
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Fonts />
      {(v === 'A' || v === 'D') && (
        <>
          <Door W={W} H={H} floorY={690} doorX={0} doorW={W} doorTop={-40} panelH={150} scale={0.75} shadows={shadows} />
          {headline('left', 150)}
          <Logos y={812} />
        </>
      )}
      {v === 'B' && (
        <>
          <Door W={W} H={H} floorY={720} doorX={(W - 860) / 2} doorW={860} doorTop={350} panelH={92} scale={0.75} framed shadows={shadows} />
          {headline('center', 104)}
          <Logos y={826} center />
        </>
      )}
      {v === 'C' && (
        <>
          <Door W={W} H={H} floorY={740} doorX={0} doorW={W} doorTop={-40} panelH={330} gap={6} scale={1.1} shadows={[{ x: 0.66, strength: 0.6, width: 0.06 }]} />
          {headline('left', 150)}
          <Logos y={834} />
        </>
      )}
      <Nav />
    </AbsoluteFill>
  );
};
