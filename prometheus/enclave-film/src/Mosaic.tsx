import React, { useMemo } from 'react';
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, F, Fonts, CIPHER, HEX, GLYPH, clamp, ease, noiseChar } from './lib';

/**
 * The silent loop before play, version C "cipher mosaic" (after unkey.com's hero grammar: one graphic
 * primitive, grain-free flat blacks, a single accent, tiny type as texture).
 * Every pill is a message in transit, shown as ciphertext; rows drift left to right and slide under the
 * walls of a clean empty rectangle, the AWS Nitro Enclave, where the play button sits. Twice per loop one
 * message glides through the enclave: it turns orange and readable inside, and is sealed again on the way out.
 * Seamless: every row moves exactly one pattern length per loop.
 */
export const MOSAIC_LOOP = 12; // seconds

const PH = 22, PITCH = 29, FS = 11.5, CW = FS * 0.6, PAD = 8, GAP = 5;
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

type Pill = { x: number; w: number; text: string; base: number; lit: boolean };
const rowPattern = (r: number) => {
  const P = 720 + Math.floor(random(`P${r}`) * 5) * 60;
  const pills: Pill[] = [];
  let x = 0, i = 0;
  for (;;) {
    const len = 3 + Math.floor(Math.pow(random(`len${r}-${i}`), 1.3) * 13);
    const w = Math.round(len * CW + PAD * 2);
    if (x + w > P - GAP) break;
    if (random(`skip${r}-${i}`) >= 0.1) {
      const set = random(`set${r}-${i}`) < 0.55 ? HEX : B64;
      let text = '';
      for (let j = 0; j < len; j++) text += set[Math.floor(random(`c${r}-${i}-${j}`) * set.length)];
      pills.push({ x, w, text, base: random(`b${r}-${i}`), lit: random(`lit${r}-${i}`) < 0.018 });
    }
    x += w + GAP; i++;
  }
  return { P, pills };
};

const EVENTS = [
  { t0: 0.9, top: true, text: 'Draft a reply to my landlord', cipher: CIPHER.b },
  { t0: 6.9, top: false, text: 'Summarize these board notes', cipher: CIPHER.a },
];
const EDUR = 4.6, EFS = 18, ECW = EFS * 0.6, EPAD = 13, EH = 38;

export const Mosaic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = frame / fps;
  const L = MOSAIC_LOOP;

  // the enclave: wide enough for the play button (≈ 730 px of this frame on a 560 px player)
  const V = { x: Math.round(W * 0.1), y: Math.round(H / 2 - 165), w: Math.round(W * 0.8), h: 330 };
  const MOAT = 12;

  const rows = useMemo(() => {
    const n = Math.ceil(H / PITCH) + 1, y0 = Math.round((H - n * PITCH) / 2);
    return Array.from({ length: n }, (_, r) => ({ y: y0 + r * PITCH + (PITCH - PH) / 2, ...rowPattern(r) }));
  }, [H]);

  // blocky silhouette (unkey's stair-stepped edges): a stepped mass, full width through the enclave's band,
  // narrowing toward the top and bottom; cells follow the row grid so no pill is sliced lengthwise
  const holes = useMemo(() => {
    const n = Math.ceil(H / PITCH) + 1, y0 = Math.round((H - n * PITCH) / 2);
    const COLS = 6, cw = W / COLS, RPC = 5, ch = PITCH * RPC, out: Array<{ x: number; y: number; w: number; h: number }> = [];
    out.push({ x: 0, y: 0, w: W, h: y0 + 0.5 });
    for (let k = 0; k * RPC < n; k++) for (let c = 0; c < COLS; c++) {
      const cx = (c + 0.5) * cw, cy = y0 + (k + 0.5) * ch;
      const dx = Math.abs(cx - W / 2) / (W * 0.5), dy = Math.abs(cy - H / 2) / (H * 0.44);
      const band = Math.abs(cy - H / 2) < V.h / 2 + ch;
      const d = Math.pow(dx, 2.2) * (0.35 + 0.65 * Math.pow(dy, 0.8)) + Math.pow(dy, 3);
      if (!band && d > 0.62 + (random(`hole${c}-${k}`) - 0.5) * 0.3) out.push({ x: c * cw, y: y0 + k * ch, w: cw + 0.5, h: ch + 0.5 });
    }
    return out;
  }, [W, H, V.h]);

  // two soft highlights wander over the field on loop-periodic paths; they only lift the pills' brightness
  const ph = (t / L) * Math.PI * 2;
  const blobs = [
    { x: W * (0.5 + 0.34 * Math.cos(ph)), y: H * (0.5 + 0.3 * Math.sin(ph + 0.6)) },
    { x: W * (0.5 + 0.3 * Math.cos(ph + Math.PI)), y: H * (0.5 + 0.32 * Math.sin(2 * ph + 2)) },
  ];
  const lift = (x: number, y: number) => Math.max(...blobs.map((b) => Math.exp(-((x - b.x) ** 2 + (y - b.y) ** 2) / (2 * 230 * 230))));

  const step = Math.floor(frame / 4);

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: F.mono }}>
      <Fonts />
      {/* the mosaic */}
      {rows.map((row, r) => {
        const off = ((t / L) * row.P) % row.P;
        const reps = Math.ceil(W / row.P) + 2;
        return (
          <React.Fragment key={r}>
            {Array.from({ length: reps }, (_, rep) => row.pills.map((p, i) => {
              const x = p.x + off + (rep - 1) * row.P;
              if (x > W || x + p.w < 0) return null;
              const h = lift(x + p.w / 2, row.y + PH / 2);
              const q = Math.pow(p.base, 2.2); // most pills dim, a few bright
              const a = 0.03 + q * 0.06 + h * 0.06;
              const ta = 0.1 + q * 0.3 + h * 0.4;
              let txt = '';
              for (let j = 0; j < p.text.length; j++) txt += random(`f${r}-${i}-${rep}-${j}-${step}`) < 0.035 ? HEX[Math.floor(random(`g${r}-${i}-${rep}-${j}-${step}`) * 16)] : p.text[j];
              return (
                <div key={rep + '-' + i} style={{
                  position: 'absolute', left: x, top: row.y, width: p.w, height: PH, borderRadius: 3,
                  background: p.lit ? `rgba(236,235,232,${0.45 + h * 0.3})` : `rgba(236,235,232,${a})`,
                  color: p.lit ? C.bg : `rgba(236,235,232,${ta})`,
                  font: `400 ${FS}px/${PH}px ${F.mono}`, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden',
                }}>{txt}</div>
              );
            }))}
          </React.Fragment>
        );
      })}
      {/* silhouette */}
      {holes.map((c, i) => <div key={i} style={{ position: 'absolute', left: c.x, top: c.y, width: c.w, height: c.h, background: C.bg }} />)}
      {/* the enclave: cleared space, a hairline wall, a tab that names it */}
      <div style={{ position: 'absolute', left: V.x - MOAT, top: V.y - MOAT - 30, width: V.w + MOAT * 2, height: V.h + MOAT * 2 + 30, background: C.bg }} />
      <div style={{ position: 'absolute', left: V.x, top: V.y, width: V.w, height: V.h, boxShadow: `inset 0 0 0 1.5px rgba(191,60,27,.9)` }} />
      <div style={{ position: 'absolute', left: V.x, top: V.y - 30, height: 30, padding: '0 11px', background: C.brand, color: '#1a0904', font: `500 15px/30px ${F.mono}`, letterSpacing: '.01em' }}>AWS Nitro Enclave</div>
      {/* a message passing through */}
      <div style={{ position: 'absolute', left: V.x, top: V.y, width: V.w, height: V.h, overflow: 'hidden' }}>
        {EVENTS.map((e, n) => {
          const u = (t - e.t0) / EDUR;
          if (u <= 0 || u >= 1) return null;
          const pw = e.text.length * ECW + EPAD * 2;
          const f = u + (0.75 / (2 * Math.PI)) * Math.sin(2 * Math.PI * u); // quick in, slow in the middle, quick out
          const x = -pw + (V.w + pw) * f; // relative to the enclave
          const y = e.top ? 32 : V.h - 32 - EH;
          const c = x + pw / 2, dc = Math.min(c, V.w - c);
          const k = ease(clamp((dc - pw * 0.3) / (pw * 0.4)));
          return (
            <div key={n} style={{ position: 'absolute', left: x, top: y, width: pw, height: EH, borderRadius: 4, overflow: 'hidden', background: 'rgba(236,235,232,.1)' }}>
              <div style={{ position: 'absolute', inset: 0, background: C.brand, opacity: k }} />
              <div style={{ position: 'relative', padding: `0 ${EPAD}px`, font: `500 ${EFS}px/${EH}px ${F.mono}`, whiteSpace: 'pre' }}>
                {e.text.split('').map((ch, j) => {
                  const xc = x + EPAD + (j + 0.5) * ECW, d = Math.min(xc, V.w - xc);
                  if (d < 40) return <span key={j} style={{ color: 'rgba(236,235,232,.55)' }}>{e.cipher[j]}</span>;
                  if (d < 90) return <span key={j} style={{ color: 'rgba(255,255,255,.6)' }}>{noiseChar(GLYPH, `ev${n}-${j}`, frame)}</span>;
                  return <span key={j} style={{ color: '#fff' }}>{ch}</span>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
