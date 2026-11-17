// Pay per use: a usage receipt printing one line per message, against a prepaid balance
import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Fonts, Grain, clamp01, ease } from './common';
import { palettes } from './theme';

type Line = { t: string; model: string; tok: string; cost: number };
// Costs are representative single messages near each model's catalogue median
const LINES: Line[] = [
  { t: '09:12', model: 'Claude Haiku 5.5', tok: '210 → 140', cost: 0.0011 },
  { t: '09:40', model: 'GPT-6 Luna', tok: '640 → 268', cost: 0.0081 },
  { t: '11:05', model: 'Gemini 4 Argon', tok: '1,120 → 380', cost: 0.0139 },
  { t: '13:22', model: 'GLM 5.3', tok: '410 → 236', cost: 0.0034 },
  { t: '14:30', model: 'Claude Opus 5.5', tok: '3,120 → 120', cost: 0.0388 },
  { t: '16:20', model: 'Claude Opus 5.5', tok: '1,840 → 412', cost: 0.0412 },
  { t: '17:02', model: 'DeepSeek V4.1 Flash', tok: '900 → 520', cost: 0.0098 },
  { t: '18:44', model: 'GPT-OSS 120B · E2E', tok: '760 → 300', cost: 0.0048 },
];
const START = 18.42;

export const Ledger: React.FC<{ palette: keyof typeof palettes }> = ({ palette }) => {
  const p = palettes[palette];
  const f = useCurrentFrame();
  const PER = 34;
  const FIRST = 40 - 3 * PER; // three lines are already printed when the loop starts
  const printed = LINES.filter((_, i) => f >= FIRST + i * PER).length;
  const totalAt = FIRST + LINES.length * PER + 10;
  const showTotal = f >= totalAt;
  const spent = LINES.slice(0, printed).reduce((a, l) => a + l.cost, 0);
  const LINE_H = 66;
  // paper feeds out of the printer slot as lines print
  const feedLines = printed + (showTotal ? 3.2 : 0);
  const feedPrev = Math.max(0, printed - 1) + (f >= totalAt ? 3.2 : 0);
  const lastPrintAt = showTotal ? totalAt : FIRST + (printed - 1) * PER;
  const feedT = ease(clamp01((f - lastPrintAt) / 14));
  const feed = (feedPrev + (feedLines - feedPrev) * feedT) * LINE_H;
  const paperTop = 210;
  const paperH = 150 + feed + 34;
  const loopFade = interpolate(f, [438, 450], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ink = '#24211c';
  const inkDim = '#7b746a';
  const paper = '#fbf9f4';

  return (
    <AbsoluteFill style={{ background: p.bg, fontFamily: p.sans }}>
      <Fonts />
      {/* printer slot */}
      <div style={{ position: 'absolute', left: 150, right: 150, top: 170, height: 46, borderRadius: 18, background: p.panel2, boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.12)' }} />
      <div style={{ position: 'absolute', left: 190, right: 190, top: paperTop, height: Math.min(paperH, 1240), opacity: loopFade, overflow: 'hidden', background: paper, boxShadow: '0 30px 60px rgba(40,30,20,0.18), 0 2px 0 rgba(0,0,0,0.04)', clipPath: 'polygon(0 0,100% 0,100% calc(100% - 14px),97.5% 100%,95% calc(100% - 14px),92.5% 100%,90% calc(100% - 14px),87.5% 100%,85% calc(100% - 14px),82.5% 100%,80% calc(100% - 14px),77.5% 100%,75% calc(100% - 14px),72.5% 100%,70% calc(100% - 14px),67.5% 100%,65% calc(100% - 14px),62.5% 100%,60% calc(100% - 14px),57.5% 100%,55% calc(100% - 14px),52.5% 100%,50% calc(100% - 14px),47.5% 100%,45% calc(100% - 14px),42.5% 100%,40% calc(100% - 14px),37.5% 100%,35% calc(100% - 14px),32.5% 100%,30% calc(100% - 14px),27.5% 100%,25% calc(100% - 14px),22.5% 100%,20% calc(100% - 14px),17.5% 100%,15% calc(100% - 14px),12.5% 100%,10% calc(100% - 14px),7.5% 100%,5% calc(100% - 14px),2.5% 100%,0 calc(100% - 14px))' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, padding: '44px 58px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 26 }}>
            <Img src={staticFile('flame2.png')} style={{ width: 40, height: 40, objectFit: 'contain' }} />
            <div style={{ font: `600 30px/1 'Geist'`, color: ink, letterSpacing: '-0.02em' }}>PayPerQ</div>
            <div style={{ marginLeft: 'auto', font: `400 22px/1 '${p.mono}'`, color: inkDim }}>Usage · Nov 13</div>
          </div>
          <div style={{ borderTop: `2px dashed #d9d2c4`, paddingTop: 18 }}>
            {LINES.slice(0, printed).map((l, i) => {
              const born = FIRST + i * PER;
              const reveal = clamp01((f - born) / 10);
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '86px 1fr 170px 130px', alignItems: 'baseline', height: LINE_H, font: `400 25px/1 '${p.mono}'`, color: ink, opacity: reveal }}>
                  <span style={{ color: inkDim }}>{l.t}</span>
                  <span style={{ font: `500 26px/1 'Geist'`, letterSpacing: '-0.01em' }}>{l.model}</span>
                  <span style={{ color: inkDim, fontSize: 21 }}>{l.tok}</span>
                  <span style={{ textAlign: 'right' }}>${l.cost.toFixed(4)}</span>
                </div>
              );
            })}
            {showTotal && (
              <div style={{ borderTop: `2px dashed #d9d2c4`, marginTop: 10, paddingTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', font: `400 25px/1 '${p.mono}'`, color: inkDim, height: 54 }}>
                  <span>8 messages · 0 subscriptions</span><span style={{ color: ink }}>${spent.toFixed(4)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', height: 92 }}>
                  <span style={{ font: `500 30px/1 'Geist'`, color: ink }}>Balance left</span>
                  <span style={{ font: `600 54px/1 '${p.mono}'`, color: ink, letterSpacing: '-0.03em' }}>${(START - spent).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Grain opacity={p.grain} blend="soft-light" />
    </AbsoluteFill>
  );
};
