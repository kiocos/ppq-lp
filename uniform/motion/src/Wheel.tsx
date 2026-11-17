// Many models, one balance: a wheel of real catalogue models with median cost per message
// layout 'wide' (1920×1080, wheel left, details right) or 'tall' (1080×1350, wheel above details)
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Fonts, Grain, Logo, clamp01, ease } from './common';
import { fmtUsd, models, palettes, privacyCopy } from './theme';

const PER = 48;
const ROLL = 18;
const START_BALANCE = 18.42;

const LAYOUTS = {
  wide: { CY: 540, ROW: 124, R: 430, left: 110, right: 1090, nameSize: 68, logo: 58, fadeW: 1140, fadeH: 260, detail: { x: 1210, y: 170, w: 600 }, balance: { x: 1210, y: 760 }, costSize: 132, showProvider: true },
  tall: { CY: 330, ROW: 112, R: 300, left: 50, right: 1030, nameSize: 62, logo: 52, fadeW: 1080, fadeH: 150, detail: { x: 60, y: 690, w: 960 }, balance: { x: 60, y: 1110 }, costSize: 120, showProvider: false },
} as const;

export const Wheel: React.FC<{ palette: keyof typeof palettes; layout?: 'wide' | 'tall' }> = ({ palette, layout = 'wide' }) => {
  const p = palettes[palette];
  const L = LAYOUTS[layout];
  const f = useCurrentFrame();
  const n = models.length;
  const idx = Math.floor(f / PER);
  const local = f - idx * PER;
  const s = idx - 1 + ease(clamp01(local / ROLL));
  // while rolling, the details fading out still belong to the outgoing model
  const sel = local >= ROLL ? models[idx % n] : models[(idx - 1 + n) % n];
  const debit = models[idx % n];
  const settled = local >= ROLL;

  let balance = START_BALANCE;
  for (let k = 0; k <= idx; k++) if (f >= k * PER + 40) balance -= models[k % n].median;
  const chipT = clamp01((local - 26) / 14);
  const chipOpacity = local >= 24 && local < 44 ? Math.sin(chipT * Math.PI) : 0;
  const detailIn = ease(clamp01((local - ROLL + 4) / 10));
  const nameStretch = p.displayStretch && layout === 'tall' ? '112%' : p.displayStretch;

  const rows: React.ReactNode[] = [];
  for (let k = Math.floor(s) - 5; k <= Math.floor(s) + 5; k++) {
    const m = models[((k % n) + n) % n];
    const d = k - s;
    const angle = d * (layout === 'tall' ? 0.36 : 0.31);
    if (Math.abs(angle) > 1.45) continue;
    const y = L.CY + Math.sin(angle) * L.R;
    const near = 1 - Math.min(1, Math.abs(d));
    const opacity = Math.pow(Math.cos(angle), 2.2) * (0.38 + 0.62 * near);
    rows.push(
      <div key={k} style={{ position: 'absolute', left: L.left + 32, right: 1920 - L.right + 30, top: y - L.ROW / 2, height: L.ROW, width: L.right - L.left - 62, display: 'flex', alignItems: 'center', gap: 26, opacity, transform: `scaleY(${Math.cos(angle)})` }}>
        <Logo name={m.logo} size={L.logo} p={p} mono={m.mono} style={{ opacity: 0.55 + 0.45 * near }} />
        <div style={{ font: `${p.displayWeight} ${L.nameSize}px/1 '${p.display}'`, fontStretch: nameStretch, letterSpacing: p.displayTracking, color: near > 0.5 ? p.text : p.dim, whiteSpace: 'nowrap', flex: 1 }}>{m.name}</div>
        {L.showProvider && <div style={{ font: `400 22px/1 '${p.sans}'`, color: p.dim, whiteSpace: 'nowrap' }}>{m.provider}</div>}
      </div>,
    );
  }

  const chipColor = sel.privacy === 'Anon' ? p.dim : sel.privacy === 'ZDR' ? p.text : p.good;
  const wheelTop = L.CY - L.R - 80;
  const wheelBottom = L.CY + L.R + 80;
  return (
    <AbsoluteFill style={{ background: p.bg, fontFamily: p.sans, overflow: 'hidden' }}>
      <Fonts />
      <div style={{ position: 'absolute', left: L.left, width: L.right - L.left, top: L.CY - L.ROW / 2 + 4, height: L.ROW - 8, borderRadius: 22, background: p.panel }} />
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(${Math.max(0, wheelTop)}px 0 ${Math.max(0, (layout === 'tall' ? 1350 : 1080) - wheelBottom)}px 0)` }}>{rows}</div>
      <div style={{ position: 'absolute', left: 0, width: L.fadeW, top: Math.max(0, wheelTop), height: L.fadeH, background: `linear-gradient(${p.bg}, transparent)` }} />
      <div style={{ position: 'absolute', left: 0, width: L.fadeW, top: wheelBottom - L.fadeH, height: L.fadeH, background: `linear-gradient(transparent, ${p.bg})` }} />

      <div style={{ position: 'absolute', left: L.detail.x, width: L.detail.w, top: L.detail.y, opacity: settled ? detailIn : 1 - ease(clamp01(local / 8)) }}>
        <div style={{ font: `400 ${layout === 'tall' ? 30 : 22}px/1 '${p.sans}'`, color: p.dim }}>{layout === 'tall' ? `${sel.provider} · median cost per message` : 'Median cost per message'}</div>
        <div style={{ font: `${p.displayWeight} ${L.costSize}px/1 '${p.display}'`, fontStretch: p.displayStretch, letterSpacing: '-0.04em', color: p.text, marginTop: 22, fontVariantNumeric: 'tabular-nums' }}>{fmtUsd(sel.median)}</div>
        <div style={{ font: `400 ${layout === 'tall' ? 28 : 20}px/1.4 '${p.sans}'`, color: p.dim, marginTop: 18 }}>across {sel.samples.toLocaleString('en-US')} messages in PayPerQ chat</div>
        <div style={{ marginTop: layout === 'tall' ? 40 : 64, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ font: `600 ${layout === 'tall' ? 24 : 18}px/1 '${p.mono}'`, letterSpacing: '0.06em', color: chipColor, padding: '10px 14px', borderRadius: 999, background: p.panel2 }}>{sel.privacy.toUpperCase()}</span>
          <span style={{ font: `400 ${layout === 'tall' ? 28 : 21}px/1.35 '${p.sans}'`, color: p.dim, maxWidth: layout === 'tall' ? 760 : 440 }}>{privacyCopy[sel.privacy]}</span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: L.balance.x, top: L.balance.y }}>
        <div style={{ font: `400 ${layout === 'tall' ? 30 : 22}px/1 '${p.sans}'`, color: p.dim }}>One balance</div>
        <div style={{ font: `500 ${layout === 'tall' ? 72 : 60}px/1 '${p.mono}'`, letterSpacing: '-0.03em', color: p.text, marginTop: 18, fontVariantNumeric: 'tabular-nums' }}>{fmtUsd(Math.max(0, balance))}</div>
        <div style={{ position: 'absolute', left: layout === 'tall' ? 520 : 360, top: interpolate(chipT, [0, 1], [layout === 'tall' ? -190 : -250, 26]), font: `500 ${layout === 'tall' ? 34 : 26}px/1 '${p.mono}'`, color: p.accentInk, opacity: chipOpacity, whiteSpace: 'nowrap' }}>−{fmtUsd(debit.median)}</div>
      </div>
      <Grain opacity={p.grain} />
    </AbsoluteFill>
  );
};
