import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, F, CIPHER, PCR0, HEX, Caption, Fonts, clamp, ease, easeIO, keys, lerp, noiseChar, ramp } from './lib';

/**
 * The enclave explainer, 48 s, in the cipher-mosaic grammar of the pre-play loop (after unkey.com's hero:
 * one graphic primitive, flat blacks, tiny type as texture, one accent).
 * Colour is meaning: your message is a dark pill with a hairline and bright text, a grey pill is ciphertext, an
 * orange pill is readable, and only inside the AWS Nitro Enclave. Small annotation boxes say what each party sees.
 * Order: opening title → you type → before sending, the browser checks the enclave's fingerprint (PCR0) against
 * the published one, step by step, including a modified build that fails → encrypted → PayPerQ relays it (sees
 * only the envelope) → the camera follows it into the enclave, where it is decrypted → the provider gets the
 * words, not your IP (pixelated out), held long enough to read → end card.
 */
export const MF_OPEN = 5;
export const MF_DURATION = MF_OPEN + 46;

// sound effects (public/sfx/, built by sfx-build.sh): [video frame at 30 fps, file, volume]. Each file starts on its
// transient, so the frame is the one where the picture changes. Video time = film time + MF_OPEN.
const SFX: Array<[number, string, number]> = [
  [15, 'scramble', 0.7],    // 0:00.5 opening title decrypts
  [168, 'keys', 1],         // 0:05.6 typing the message
  [244, 'click', 1],        // 0:08.1 send pressed (held back for the check)
  [504, 'ticks-check', 1],  // 0:16.8 the 12 PCR0 columns compared, one tick per column turning green
  [552, 'chime', 1],        // 0:18.4 "match"
  [630, 'ticks-fast', 1],   // 0:21.0 modified build: columns compared fast
  [654, 'deny', 1],         // 0:21.8 mismatch, the message dims
  [738, 'chime', 1],        // 0:24.6 real build again: match
  [764, 'click', 1],        // 0:25.5 send
  [780, 'scramble', 1],     // 0:26.0 the words encrypt, left to right
  [1051, 'pressure', 1],    // peaks at 0:35.7 as the message passes the enclave wall (wall flash)
  [1080, 'unlock', 1],      // 0:36.0 decrypted: the pill turns orange
  [1285, 'ticks-pixel', 1], // 0:42.8 your IP pixelates out in 4 steps
  [1410, 'scramble', 0.14], // 0:47.0 end title decrypts (the music is nearly out here)
];

type R = { x: number; y: number; w: number; h: number };
const pad = (r: R, p: number): R => ({ x: r.x - p, y: r.y - p, w: r.w + 2 * p, h: r.h + 2 * p });
const union = (...rs: R[]): R => { const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y)); return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y }; };
const overlaps = (a: R, b: R) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const mixRGB = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',');

const TEXT = 'Summarize these board notes into five decisions.';
const CAPS: Array<[number, number, string]> = [
  [0.5, 3.3, 'You send a message.'],
  [3.6, 7.4, 'The enclave’s code is open source. This is its fingerprint.'],
  [7.6, 11.2, 'The enclave reports the fingerprint of the code it’s running.'],
  [11.4, 15.0, 'Before sending, your browser checks that they match.'],
  [15.2, 19.0, 'If the code were changed, they wouldn’t match, and nothing would be sent.'],
  [19.2, 20.6, 'They match. Safe to send.'],
  [20.8, 23.6, 'Your words leave your device encrypted.'],
  [24.6, 26.4, 'PayPerQ relays it.'],
  [26.4, 28.6, 'Your conversation stays unreadable to us.'],
  [28.8, 31.6, 'Not even our staff can log in to the enclave.'],
  [32.0, 34.6, 'Decrypted inside isolated hardware.'],
  [35.4, 41.4, 'The model provider sees your message, but not your IP.'],
];
// a fingerprint that differs from the real one at every position (the "modified build")
const PCR_BAD = PCR0.split('').map((ch, i) => { const set = HEX.replace(ch, ''); return set[Math.floor(random(`bad${i}`) * set.length)]; }).join('');

// ---------- the mosaic: rows of ciphertext pills drifting left to right ----------
const PH = 22, PITCH = 29, FS = 11.5, CW = FS * 0.6, PAD = 8, GAP = 5;
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
type Pill = { x: number; w: number; text: string; base: number; lit: boolean };
type Row = { P: number; pills: Pill[]; v: number; jit: number };
const ROWS = new Map<string, Row>();
const rowPattern = (seed: string, r: number): Row => {
  const key = `${seed}:${r}`;
  const hit = ROWS.get(key);
  if (hit) return hit;
  const P = 900 + Math.floor(random(`${key}P`) * 7) * 100;
  const pills: Pill[] = [];
  let x = 0, i = 0;
  for (;;) {
    const len = 3 + Math.floor(Math.pow(random(`${key}l${i}`), 1.3) * 13);
    const w = Math.round(len * CW + PAD * 2);
    if (x + w > P - GAP) break;
    if (random(`${key}s${i}`) >= 0.1) {
      const set = random(`${key}t${i}`) < 0.55 ? HEX : B64;
      let text = '';
      for (let j = 0; j < len; j++) text += set[Math.floor(random(`${key}c${i}-${j}`) * set.length)];
      pills.push({ x, w, text, base: random(`${key}b${i}`), lit: random(`${key}w${i}`) < 0.018 });
    }
    x += w + GAP; i++;
  }
  const row = { P, pills, v: 0.7 + random(`${key}v`) * 0.6, jit: (random(`${key}j`) - 0.5) * 160 };
  ROWS.set(key, row);
  return row;
};

const Field: React.FC<{ r: R; seed: string; t: number; frame: number; o?: number; clears?: R[]; keep?: R[]; sweep?: { front: number; dir: 1 | -1 }; speed?: number }> = ({ r, seed, t, frame, o = 1, clears = [], keep = [], sweep, speed = 24 }) => {
  if (o <= 0.002) return null;
  const n = Math.floor(r.h / PITCH), step = Math.floor(frame / 4);
  const ph = (t / 14) * Math.PI * 2, sig = Math.max(r.w, r.h) * 0.2;
  const blobs = [
    { x: r.w * (0.5 + 0.34 * Math.cos(ph)), y: r.h * (0.5 + 0.3 * Math.sin(ph + 0.6)) },
    { x: r.w * (0.5 + 0.3 * Math.cos(ph + Math.PI)), y: r.h * (0.5 + 0.32 * Math.sin(2 * ph + 2)) },
  ];
  const lift = (x: number, y: number) => Math.max(...blobs.map((b) => Math.exp(-((x - b.x) ** 2 + (y - b.y) ** 2) / (2 * sig * sig))));
  // stair-stepped silhouette; cells follow the row grid so no pill is sliced lengthwise
  const COLS = Math.max(4, Math.round(r.w / 180)), cw = r.w / COLS, RPC = 5, ch = PITCH * RPC, holes: R[] = [];
  for (let k = 0; k * RPC < n + RPC; k++) for (let c = 0; c < COLS; c++) {
    const cell = { x: c * cw, y: k * ch, w: cw + 0.5, h: ch + 0.5 };
    const dx = Math.abs(cell.x + cw / 2 - r.w / 2) / (r.w / 2), dy = Math.abs(cell.y + ch / 2 - r.h / 2) / (r.h / 2);
    const abs = { ...cell, x: cell.x + r.x, y: cell.y + r.y };
    if (!keep.some((kr) => overlaps(kr, abs)) && Math.pow(dx, 4) + Math.pow(dy, 4) > 0.5 + (random(`${seed}h${c}-${k}`) - 0.5) * 0.3) holes.push(cell);
  }
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const row = rowPattern(seed, i), y = i * PITCH + (PITCH - PH) / 2;
    const off = (t * speed * row.v) % row.P;
    let rep = 0;
    for (let x0 = off - row.P; x0 < r.w; x0 += row.P, rep++) {
      row.pills.forEach((p, pi) => {
        const x = x0 + p.x;
        if (x > r.w || x + p.w < 0) return;
        let vis = 1;
        if (sweep) { const pos = r.x + x + p.w / 2 + row.jit; vis = sweep.dir > 0 ? clamp((sweep.front - pos) / 90) : clamp((pos - sweep.front) / 90); }
        if (vis <= 0) return;
        const h = lift(x + p.w / 2, y + PH / 2), q = Math.pow(p.base, 2.2);
        let txt = '';
        for (let j = 0; j < p.text.length; j++) txt += random(`${seed}f${i}-${pi}-${rep}-${j}-${step}`) < 0.035 ? HEX[Math.floor(random(`${seed}g${i}-${pi}-${rep}-${j}-${step}`) * 16)] : p.text[j];
        out.push(
          <div key={`${i}-${rep}-${pi}`} style={{
            position: 'absolute', left: x, top: y, width: p.w, height: PH, borderRadius: 3, opacity: vis,
            background: p.lit ? `rgba(236,235,232,${0.45 + h * 0.3})` : `rgba(236,235,232,${0.03 + q * 0.06 + h * 0.06})`,
            color: p.lit ? C.bg : `rgba(236,235,232,${0.1 + q * 0.3 + h * 0.4})`,
            font: `400 ${FS}px/${PH}px ${F.mono}`, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden',
          }}>{txt}</div>,
        );
      });
    }
  }
  return (
    <div style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, overflow: 'hidden', opacity: o }}>
      {out}
      {holes.map((c, i) => <div key={'h' + i} style={{ position: 'absolute', left: c.x, top: c.y, width: c.w, height: c.h, background: C.bg }} />)}
      {clears.map((c, i) => <div key={'c' + i} style={{ position: 'absolute', left: c.x - r.x, top: c.y - r.y, width: c.w, height: c.h, background: C.bg }} />)}
    </div>
  );
};

// ---------- labels ----------
type TabKind = 'orange' | 'light' | 'dim';
const Tab: React.FC<{ x: number; y: number; fs: number; text: string; kind: TabKind; o?: number; strike?: number }> = ({ x, y, fs, text, kind, o = 1, strike = 0 }) => (
  <div style={{
    position: 'absolute', left: x, top: y, height: fs * 2, padding: `0 ${fs * 0.72}px`, opacity: o, whiteSpace: 'nowrap',
    font: `500 ${fs}px/${fs * 2}px ${F.mono}`, letterSpacing: '.01em',
    background: kind === 'orange' ? C.brand : kind === 'light' ? C.fg : 'rgba(236,235,232,.1)',
    color: kind === 'orange' ? '#1a0904' : kind === 'light' ? C.bg : 'rgba(236,235,232,.72)',
  }}>
    <span style={{ position: 'relative' }}>{text}{strike > 0 && <i style={{ position: 'absolute', left: 0, top: '52%', height: Math.max(1, fs * 0.08), width: `${strike * 100}%`, background: 'currentColor' }} />}</span>
  </div>
);

/** the enclave: a clean rectangle, a hairline wall, a tab that names it */
const Enclave: React.FC<{ r: R; fs: number; line: number; o?: number; flash?: number; heat?: number; shake?: number }> = ({ r, fs, line, o = 1, flash = 0, heat = 0, shake = 0 }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, opacity: o, transform: `translateX(${shake}px)` }}>
    <div style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, background: `rgba(191,60,27,${0.05 * heat})`, boxShadow: `inset 0 0 0 ${line * (1 + flash)}px rgba(${mixRGB([191, 60, 27], [243, 162, 114], flash)},${0.9})` }} />
    <Tab x={r.x} y={r.y - fs * 2} fs={fs} text="AWS Nitro Enclave" kind="orange" />
  </div>
);

type CharState = 'p' | 'n' | 'c';
/** the message as one pill: a hairline while it is on your device, orange inside the enclave, lighter at the provider, grey otherwise */
const MsgPill: React.FC<{
  x: number; y: number; fs: number; frame: number; state: (j: number, xc: number) => CharState;
  orange?: number; light?: number; typed?: number; caret?: boolean; outline?: number; moat?: boolean; o?: number;
}> = ({ x, y, fs, frame, state, orange = 0, light = 0, typed = TEXT.length, caret = false, outline = 0, moat = false, o = 1 }) => {
  const cw = fs * 0.6, px = fs * 0.85, h = fs * 2, w = TEXT.length * cw + px * 2;
  const ink = '236,235,232';
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: o }}>
      {moat && <div style={{ position: 'absolute', top: 0, bottom: 0, left: -fs * 0.45, right: -fs * 0.45, background: C.bg }} />}
      <div style={{ position: 'absolute', inset: 0, borderRadius: fs * 0.25, overflow: 'hidden', background: 'rgba(236,235,232,.1)', boxShadow: outline ? `0 0 0 ${fs * 0.09}px rgba(236,235,232,${0.6 * outline})` : undefined }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(236,235,232,.2)', opacity: light }} />
        <div style={{ position: 'absolute', inset: 0, background: C.brand, opacity: orange }} />
      </div>
      <div style={{ position: 'absolute', left: px, top: 0, font: `500 ${fs}px/${h}px ${F.mono}`, whiteSpace: 'pre' }}>
        {TEXT.split('').map((ch, j) => {
          if (j >= typed) return <span key={j} style={{ opacity: 0 }}>{ch}</span>;
          const s = state(j, x + px + (j + 0.5) * cw);
          if (s === 'p') return <span key={j} style={{ color: `rgb(${ink})` }}>{ch}</span>;
          if (s === 'n') return <span key={j} style={{ color: orange > 0.5 ? 'rgba(255,255,255,.65)' : C.hot }}>{noiseChar(HEX, `m${j}`, frame)}</span>;
          return <span key={j} style={{ color: `rgba(${ink},.55)` }}>{CIPHER.a[j]}</span>;
        })}
        {caret && <i style={{ position: 'absolute', left: typed * cw + 1, top: fs * 0.45, width: Math.max(2, fs * 0.09), height: fs * 1.1, background: `rgb(${ink})`, opacity: typed >= TEXT.length && frame % 30 >= 15 ? 0 : 1 }} />}
      </div>
    </div>
  );
};
const pillW = (fs: number) => TEXT.length * fs * 0.6 + fs * 1.7;

/** text rendered small onto a canvas and blown up without smoothing: a censor mosaic of the real glyphs */
const Pixelated: React.FC<{ text: string; fs: number; color: string; block: number }> = ({ text, fs, color, block }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const w = Math.ceil(text.length * fs * 0.6), h = Math.ceil(fs * 1.55);
  const cw = Math.max(1, Math.round(w / block)), ch = Math.max(1, Math.round(h / block));
  React.useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, cw, ch);
    ctx.save();
    ctx.scale(cw / w, ch / h);
    ctx.font = `400 ${fs}px 'Geist Mono'`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(text, 0, h / 2);
    ctx.restore();
  });
  return <canvas ref={ref} width={cw} height={ch} style={{ width: w, height: h, imageRendering: 'pixelated', verticalAlign: 'top' }} />;
};

/** an annotation box: what one party can see */
type NoteRow = [string, string, 'plain' | 'cipher' | 'pixel' | 'bad'];
const Note: React.FC<{ x: number; y: number; fs: number; title?: string; rows: NoteRow[]; k: number; frame: number; o?: number; pix?: number }> = ({ x, y, fs, title, rows, k, frame, o = 1, pix = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, opacity: o, background: C.bg, border: '1px solid rgba(236,235,232,.16)', borderRadius: 4, font: `400 ${fs}px/1.55 ${F.mono}`, whiteSpace: 'pre', overflow: 'hidden' }}>
    {title && <div style={{ padding: `${fs * 0.35}px ${fs * 0.8}px`, background: 'rgba(236,235,232,.08)', color: 'rgba(236,235,232,.72)', fontWeight: 500 }}>{title}</div>}
    <div style={{ padding: `${fs * 0.6}px ${fs * 0.8}px`, display: 'grid', gridTemplateColumns: 'auto auto', columnGap: fs * 1.2 }}>
      {rows.map(([key, val, kind], i) => {
        const rk = clamp(k * rows.length - i); // rows type in one after another
        const shown = Math.floor(rk * (val.length + 3));
        const chars = val.split('').map((ch, j) => {
          if (j >= shown) return <span key={j} style={{ opacity: 0 }}>{ch}</span>;
          if (j >= shown - 3 && rk < 1) return <span key={j} style={{ color: C.hot }}>{noiseChar(HEX, `n${key}${j}`, frame)}</span>;
          if (kind === 'cipher') return <span key={j}>{random(`nc${key}${j}${Math.floor(frame / 3)}`) < 0.12 ? noiseChar(HEX, `nc${key}${j}`, frame) : ch}</span>;
          return <span key={j}>{ch}</span>;
        });
        return (
          <React.Fragment key={key}>
            <span style={{ color: C.fg3, opacity: rk > 0 ? 1 : 0 }}>{key}</span>
            <span style={{ position: 'relative', color: kind === 'cipher' ? 'rgba(236,235,232,.45)' : kind === 'bad' ? C.bad : C.fg }}>
              {kind === 'pixel' && rk >= 1 && pix > 1 ? <Pixelated text={val} fs={fs} color={C.fg} block={pix} /> : chars}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  </div>
);
const VLine: React.FC<{ x: number; y1: number; y2: number; k?: number; o?: number; w?: number }> = ({ x, y1, y2, k = 1, o = 1, w = 1.2 }) => (
  <i style={{ position: 'absolute', left: x - w / 2, top: Math.min(y1, y2), width: w, height: Math.abs(y2 - y1), background: 'rgba(236,235,232,.35)', opacity: o, transformOrigin: y2 > y1 ? 'top' : 'bottom', transform: `scaleY(${k})` }} />
);
const HLine: React.FC<{ y: number; x1: number; x2: number; k?: number; o?: number; w?: number }> = ({ y, x1, x2, k = 1, o = 1, w = 1.2 }) => (
  <i style={{ position: 'absolute', top: y - w / 2, left: x1, height: w, width: x2 - x1, background: 'rgba(236,235,232,.22)', opacity: o, transformOrigin: 'left', transform: `scaleX(${k})` }} />
);

// ---------- the world: your message, PayPerQ's traffic, the enclave inside it, the provider beyond ----------
const MFS = 16; // the message pill in the world
const PW = pillW(MFS), PHM = MFS * 2;
const WF: R = { x: 0, y: 160, w: 2250, h: 1080 }; // PayPerQ's servers
const E: R = { x: 1400, y: 520, w: 700, h: 360 }; // the AWS Nitro Enclave
const PV: R = { x: 2400, y: 540, w: 640, h: 320 }; // the model provider
const LANE = WF.y + Math.round((E.y + E.h / 2 - WF.y - PITCH / 2) / PITCH) * PITCH + PITCH / 2; // the message rides exactly on one mosaic row
const AX = 420; // where the message sits among the traffic
const EX = E.x + (E.w - PW) / 2, PX = PV.x + (PV.w - PW) / 2;
const SGAP = 8; // the send button sits beside the message while it is still on your device

// ---------- the check, before anything is sent: two fingerprints compared column by column ----------
const HFS = 12, HPW = 8 * HFS * 0.6 + 14, HPH = 26, HGAP = 5;
const panelDims = (portrait: boolean) => {
  const per = portrait ? 6 : 12, lines = 12 / per;
  const rowW = per * HPW + (per - 1) * HGAP, blockH = lines * HPH + (lines - 1) * HGAP;
  return { per, rowW, blockH, h: 30 + blockH + 30 + 30 + blockH + 28 + 30 };
};
const VerifyPanel: React.FC<{ t: number; frame: number; portrait: boolean; cx: number; y: number }> = ({ t, frame, portrait, cx, y }) => {
  const { per, rowW, blockH } = panelDims(portrait);
  const x0 = cx - rowW / 2;
  const yL1 = y, yR1 = yL1 + 30, yL2 = yR1 + blockH + 30, yR2 = yL2 + 30, yV = yR2 + blockH + 28;
  const o = ramp(t, 4.2, 4.5) * (1 - ramp(t, 20.3, 20.7));
  const bad = t >= 15.2 && t < 19.0, back = t >= 19.0;
  const scrRun = bad ? (i: number) => t < 15.6 + i * 0.03 : back ? (i: number) => t < 19.2 + i * 0.02 : (i: number) => t < 8.7 + i * 0.06;
  const scrPub = (i: number) => t < 5.0 + i * 0.06;
  const cmpAt = bad ? (i: number) => 16.0 + i * 0.05 : back ? () => 19.5 : (i: number) => 11.8 + i * 0.12;
  const verdictO = bad ? ramp(t, 16.8, 17.0) : back ? ramp(t, 19.6, 19.75) : ramp(t, 13.4, 13.6);
  const run = bad ? PCR_BAD : PCR0;
  const row = (yy: number, hash: string, scr: (i: number) => boolean, seed: string, appear: number, isRun: boolean) => Array.from({ length: 12 }, (_, i) => {
    const ln = Math.floor(i / per), col = i % per;
    const done = t >= cmpAt(i) && !scr(i), match = run.slice(i * 8, i * 8 + 8) === PCR0.slice(i * 8, i * 8 + 8);
    const c = done && (match || isRun) ? (match ? C.good : C.bad) : null;
    const vis = ramp(t, appear + i * 0.04, appear + i * 0.04 + 0.2);
    return (
      <div key={seed + i} style={{
        position: 'absolute', left: x0 + col * (HPW + HGAP), top: yy + ln * (HPH + HGAP), width: HPW, height: HPH, borderRadius: 3, opacity: vis,
        background: c ? (match ? 'rgba(95,211,154,.08)' : 'rgba(223,137,121,.1)') : 'rgba(236,235,232,.07)',
        boxShadow: c ? `inset 0 0 0 1.2px ${c}` : undefined, color: c ?? C.fg2,
        font: `400 ${HFS}px/${HPH}px ${F.mono}`, textAlign: 'center', whiteSpace: 'pre',
      }}>
        {hash.slice(i * 8, i * 8 + 8).split('').map((ch, j) => scr(i) ? <span key={j} style={{ color: C.hot }}>{noiseChar(HEX, `${seed}${i}-${j}`, frame)}</span> : <span key={j}>{ch}</span>)}
      </div>
    );
  });
  const note = (yy: number, text: string, appear: number) => (
    <div style={{ position: 'absolute', left: x0, width: rowW, top: yy, height: 22, textAlign: 'right', font: `400 11px/22px ${F.mono}`, color: C.fg3, opacity: ramp(t, appear, appear + 0.3) }}>{text}</div>
  );
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: o }}>
      <Tab x={x0} y={yL1} fs={11} text={portrait ? 'PayPerQ/ppq-enclave-proxy' : 'github.com/PayPerQ/ppq-enclave-proxy'} kind="dim" o={ramp(t, 4.3, 4.6)} />
      {note(yL1, 'published PCR0', 4.5)}
      {row(yR1, PCR0, scrPub, 'p', 4.6, false)}
      <Tab x={x0} y={yL2} fs={11} text="AWS Nitro Enclave" kind="orange" o={ramp(t, 7.9, 8.2)} />
      {note(yL2, 'running PCR0', 8.1)}
      {row(yR2, run, scrRun, 'r', 8.2, true)}
      <div style={{ position: 'absolute', left: x0, width: rowW, top: yV, display: 'flex', justifyContent: 'center', opacity: verdictO }}>
        <div style={{ padding: '0 12px', height: 30, font: `500 13px/30px ${F.mono}`, whiteSpace: 'pre', borderRadius: 3, color: bad ? C.bad : C.good, boxShadow: `inset 0 0 0 1.2px ${bad ? C.bad : C.good}`, background: bad ? 'rgba(223,137,121,.08)' : 'rgba(95,211,154,.07)' }}>
          {bad ? '✕  No match. Nothing is sent.' : '✓  Match. Safe to send.'}
        </div>
      </div>
    </div>
  );
};

export const MosaicFilm: React.FC<{ portrait?: boolean }> = ({ portrait = false }) => {
  const frame = useCurrentFrame();
  const { fps, width: fw, height: fh } = useVideoConfig();
  const T = frame / fps, t = T - MF_OPEN;
  const capSize = portrait ? 50 : 46, capBottom = portrait ? 110 : 76, capSpace = portrait ? 300 : 210;

  // ---------- layout ----------
  const A: R = { x: AX, y: LANE - PHM / 2, w: PW, h: PHM };
  const group: R = { x: AX, y: A.y, w: PW + SGAP + PHM, h: PHM }; // message + send button
  const gcx = group.x + group.w / 2;
  const pd = panelDims(portrait), panelY = A.y + PHM + 56;
  const panel: R = { x: gcx - pd.rowW / 2, y: panelY, w: pd.rowW, h: pd.h };

  // ---------- camera (4:5 frames are width-bound, so the phone cut gets tighter shots) ----------
  const shots: Record<string, R> = {
    device: { x: group.x - 50, y: group.y - 60, w: group.w + 100, h: group.h + 110 },
    verify: pad(union(group, panel), portrait ? 30 : 50),
    relay: portrait ? { x: AX - 110, y: 400, w: PW + 220, h: 500 } : { x: 120, y: 360, w: 1260, h: 680 },
    enclave: pad(E, portrait ? 30 : 60),
    provider: portrait ? { x: 2290, y: 440, w: 790, h: 520 } : { x: 1820, y: 440, w: 1280, h: 520 },
    providerClose: portrait ? { x: 2420, y: 520, w: 600, h: 380 } : { x: 2330, y: 520, w: 780, h: 380 },
  };
  const SH: Array<[number, string]> = [[0, 'device'], [3.3, 'device'], [4.5, 'verify'], [20.3, 'verify'], [21.3, 'device'], [22.8, 'device'], [24.6, 'relay'], [28.2, 'relay'], [32.0, 'enclave'], [34.6, 'enclave'], [36.0, 'provider'], [41.6, 'providerClose']];
  const fit = (r: R) => { const s = Math.min(fw * 0.86 / r.w, (fh - capSpace) * 0.9 / r.h, 2.5); return { cx: r.x + r.w / 2, cy: r.y + r.h / 2, ls: Math.log(s) }; };
  let a = SH[0], b = SH[0];
  for (let i = 1; i < SH.length; i++) { if (t <= SH[i][0]) { a = SH[i - 1]; b = SH[i]; break; } a = b = SH[i]; }
  const Ca = fit(shots[a[1]]), Cb = fit(shots[b[1]]);
  const ck = a === b ? 0 : easeIO(clamp((t - a[0]) / (b[0] - a[0])));
  const s = Math.exp(lerp(Ca.ls, Cb.ls, ck)) * (1 + 0.01 * Math.sin(t * 0.5));
  const camX = lerp(Ca.cx, Cb.cx, ck), camY = lerp(Ca.cy, Cb.cy, ck);
  const worldTf = `translate(${fw / 2 - camX * s}px, ${(fh - capSpace) / 2 + 20 - camY * s}px) scale(${s})`;

  // ---------- the message ----------
  const mx = keys([[28.4, AX], [32.4, EX], [34.6, EX], [36.2, PX]], t); // a slow glide in, so the crossing happens on screen
  const typed = Math.floor(ramp(t, 0.6, 3.0) * TEXT.length);
  const encFront = ramp(t, 21.0, 22.4) * (TEXT.length + 8);
  const inE = (xc: number) => Math.min(xc - E.x, E.x + E.w - xc), inP = (xc: number) => Math.min(xc - PV.x, PV.x + PV.w - xc);
  const zone = (d: number): CharState | null => (d > 70 ? 'p' : d > 34 ? 'n' : null);
  const state = (j: number, xc: number): CharState => {
    if (t < 22.6) return j < encFront - 8 ? 'c' : j < encFront ? 'n' : 'p';
    return zone(inE(xc)) ?? zone(inP(xc)) ?? 'c';
  };
  const mc = mx + PW / 2;
  const orange = ease(clamp((inE(mc) - PW * 0.3) / (PW * 0.3)));
  const light = ease(clamp((inP(mc) - PW * 0.3) / (PW * 0.3)));
  const dim = 0.6 * ramp(t, 16.8, 17.1) * (1 - ramp(t, 19.6, 19.8)); // a failed check holds the message back
  const outline = Math.max(0.75 * (1 - ramp(t, 21.4, 22.4)), ramp(t, 24.4, 24.8) * (1 - ramp(t, 28.4, 28.9)));
  const sendO = ramp(t, 0.1, 0.4) * (1 - ramp(t, 20.9, 21.3)) * (1 - dim);
  const press = Math.sin(Math.PI * ramp(t, 3.1, 3.5)) + Math.sin(Math.PI * ramp(t, 20.4, 20.8));

  // ---------- scene state ----------
  const worldO = ramp(t, -0.2, 0.2) * (1 - ramp(t, 41.4, 41.7));
  const fieldFront = lerp(-300, 2700, easeIO(ramp(t, 23.0, 25.0)));
  const encO = ramp(t, 23.8, 24.4);
  const relayK = ramp(t, 25.0, 26.5), relayO = ramp(t, 24.8, 25.0) * (1 - ramp(t, 28.2, 28.6));
  const flash = 0.6 * clamp(1 - Math.abs(mc - E.x) / 160) + 0.6 * clamp(1 - Math.abs(mc - (E.x + E.w)) / 160); // the wall lights as the message passes
  const heat = ease(ramp(t, 31.4, 32.2)) * (1 - ease(ramp(t, 34.6, 35.2)));
  const provO = ramp(t, 34.6, 35.2);
  const provK = ramp(t, 36.4, 37.3);
  const provPix = [1, 2, 3, 4, 6][Math.min(4, Math.floor(ramp(t, 37.7, 38.3) * 5))]; // your IP pixelates out

  const world = (
    <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: worldTf, opacity: worldO }}>
      {t > 23 && (
        <Field r={WF} seed="world" t={t} frame={frame} sweep={{ front: fieldFront, dir: 1 }}
          keep={[{ x: 0, y: E.y - 70, w: WF.w, h: E.h + 140 }]}
          clears={[{ x: E.x - 14, y: E.y - 14 - 30, w: E.w + 28, h: E.h + 28 + 30 }]} />
      )}
      {/* the line on to the provider */}
      <HLine y={LANE} x1={E.x + E.w} x2={PV.x} o={provO} k={ease(ramp(t, 34.6, 35.4))} />
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: provO }}>
        <div style={{ position: 'absolute', left: PV.x, top: PV.y, width: PV.w, height: PV.h, boxShadow: 'inset 0 0 0 1.5px rgba(236,235,232,.28)' }} />
        <Tab x={PV.x} y={PV.y - 30} fs={15} text="Model provider" kind="dim" />
        <div style={{ position: 'absolute', left: PV.x + PV.w - 4 * 44 - 18, top: PV.y + 22, display: 'flex', gap: 18, opacity: 0.55 }}>
          {['claude', 'openai', 'gemini', 'xai'].map((l) => <Img key={l} src={staticFile(`logos/${l}.svg`)} style={{ width: 26, height: 26, filter: 'brightness(0) invert(1)' }} />)}
        </div>
      </div>
      <Enclave r={E} fs={15} line={1.5} o={encO} flash={flash} heat={heat} />
      {/* the check happens on your device, before anything leaves */}
      {t > 4 && t < 21 && <VerifyPanel t={t} frame={frame} portrait={portrait} cx={gcx} y={panelY} />}
      {/* your message, with the send button while it is still on your device */}
      <div style={{ position: 'absolute', left: AX + PW + SGAP, top: A.y, width: PHM, height: PHM, borderRadius: 4, opacity: sendO, background: `rgba(236,235,232,${0.12 + 0.3 * press})`, display: 'grid', placeItems: 'center' }}>
        <svg viewBox="0 0 24 24" width={PHM * 0.5} height={PHM * 0.5} fill="none" stroke={C.fg} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7M12 19V5" /></svg>
      </div>
      <MsgPill x={mx} y={A.y} fs={MFS} frame={frame} state={state} orange={orange} light={light} typed={typed} caret={t < 3.2} outline={outline} moat={t > 22.6} o={ramp(t, 0, 0.3) * (1 - dim)} />
      {/* what PayPerQ's servers see */}
      <VLine x={AX + PW / 2} y1={A.y - 4} y2={A.y - 52} k={ease(ramp(t, 24.8, 25.1))} o={relayO} />
      <Note x={AX + PW / 2 - 190} y={A.y - 52 - 196} fs={18} title="PayPerQ server" k={relayK} frame={frame} o={relayO}
        rows={[['ip', '203.0.113.7', 'plain'], ['model', 'claude-sonnet-5', 'plain'], ['tokens', '1,840', 'plain'], ['content', '768bce6e3b5a37…', 'cipher']]} />
      {/* what the provider sees */}
      <VLine x={PX + PW / 2} y1={LANE + PHM / 2 + 4} y2={LANE + PHM / 2 + 40} k={ease(ramp(t, 36.3, 36.6))} o={provK > 0 ? 1 : 0} />
      <Note x={PX + PW / 2 - 130} y={LANE + PHM / 2 + 40} fs={18} k={provK} frame={frame} o={ramp(t, 36.3, 36.5) * (1 - ramp(t, 41.4, 41.7))} pix={provPix}
        rows={[['from', 'PayPerQ', 'plain'], ['your ip', '203.0.113.7', 'pixel']]} />
    </div>
  );

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: F.body }}>
      <Fonts />
      {/* soundtrack (ElevenLabs, 50.96 s), the user's pick, Nov 17 */}
      <Audio src={staticFile('soundtrack.wav')} />
      {SFX.map(([f, name, v], i) => <Sequence key={i} from={f} layout="none"><Audio src={staticFile(`sfx/${name}.wav`)} volume={v} /></Sequence>)}
      {T < MF_OPEN + 0.2 && <Title T={T} t={T} frame={frame} portrait={portrait} kind="open" />}
      {worldO > 0 && world}
      {t > 41.5 && <Title T={T} t={t} frame={frame} portrait={portrait} kind="end" />}
      {/* a dark band so captions never sit on top of the picture */}
      <AbsoluteFill style={{ pointerEvents: 'none', opacity: ramp(t, -0.3, 0) * (1 - ramp(t, 41.2, 41.6)), background: `linear-gradient(0deg, rgba(10,9,8,.96) 0, rgba(10,9,8,.85) ${capSpace * 0.45}px, rgba(10,9,8,0) ${capSpace}px)` }} />
      {CAPS.map(([ca, cb, text]) => <Caption key={ca} t={t} a={ca} b={cb} text={text} size={capSize} bottom={capBottom} frame={frame} />)}
      <AbsoluteFill style={{ background: '#000', opacity: ramp(t, 45.4, 46), pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

// ---------- opening and end card: the loop's own picture, with a title inside the enclave ----------
const decrypt = (text: string, front: number, band: number, size: number, frame: number, seed: string, cipher: string, caret?: number) => {
  let n = 0;
  const words = text.split(' ');
  return words.map((w, wi) => {
    const chars = w.split('').map((ch) => {
      const i = n++, plain = i < front - band, noise = !plain && i < front;
      return (
        <span key={i} style={{ position: 'relative' }}>
          <span style={{ opacity: plain ? 1 : 0 }}>{ch}</span>
          {!plain && ch !== ' ' && <span style={{ position: 'absolute', left: -20, right: -20, top: '50%', transform: 'translateY(-50%)', textAlign: 'center', font: `400 ${size * 0.56}px/1 ${F.mono}`, letterSpacing: 0, color: noise ? C.hot : 'rgba(236,235,232,.42)' }}>{noise ? noiseChar(HEX, `${seed}${i}`, frame) : cipher[(i * 2) % cipher.length]}</span>}
        </span>
      );
    });
    n++;
    // the caret lives inside the last word so it never wraps onto a line of its own
    const last = wi === words.length - 1 && caret !== undefined;
    return (
      <React.Fragment key={wi}>
        {wi > 0 && ' '}
        <span style={{ whiteSpace: 'nowrap' }}>{chars}{last && <i style={{ display: 'inline-block', width: Math.max(3, size * 0.055), height: size * 0.92, marginLeft: size * 0.08, verticalAlign: `-${size * 0.12}px`, background: '#fff', opacity: caret }} />}</span>
      </React.Fragment>
    );
  });
};
const Title: React.FC<{ T: number; t: number; frame: number; portrait: boolean; kind: 'open' | 'end' }> = ({ T, t, frame, portrait, kind }) => {
  const { width: fw, height: fh } = useVideoConfig();
  const open = kind === 'open';
  const text = open ? 'Inside the AWS Nitro Enclave' : 'Chat privacy you can verify.';
  const size = portrait ? (open ? 84 : 78) : open ? 88 : 86;
  const ew = portrait ? 900 : 1240, eh = portrait ? 560 : 440;
  const Er: R = { x: (fw - ew) / 2, y: (fh - eh) / 2 + (portrait ? 0 : 10), w: ew, h: eh };
  const fs = portrait ? 22 : 20;
  const field: R = { x: 30, y: 30, w: fw - 60, h: fh - 60 };
  // the opening starts on the loop's picture and clears out at the end; the end card sweeps in
  const tt = open ? T : t - 41.6;
  const front = (open ? ramp(T, 0.5, 1.6) : ramp(tt, 0.4, 1.4)) * (text.length + 6);
  const out = open ? ramp(T, 4.3, 4.95) : 0;
  const sweep = open ? { front: lerp(-200, fw + 200, easeIO(out)), dir: -1 as const } : { front: lerp(-200, fw + 200, easeIO(ramp(tt, 0, 1.0))), dir: 1 as const };
  const encO = open ? 1 - ramp(T, 4.55, 4.95) : ramp(tt, 0.1, 0.4);
  const titleO = open ? 1 - ramp(T, 4.3, 4.6) : 1;
  const detO = open ? ramp(T, 1.0, 1.3) * (1 - ramp(T, 4.3, 4.5)) : ramp(tt, 1.0, 1.4);
  const pk = open ? ramp(T, 1.0, 1.9) : ramp(tt, 1.0, 1.9);
  const det = (txt: string, seed: string) => txt.split('').map((ch, n) => ch === ' ' || ch === '…' || ch === '·' || n / txt.length < pk ? <span key={n}>{ch}</span> : <span key={n} style={{ color: C.hot }}>{noiseChar(HEX, `${seed}${n}`, frame)}</span>);
  const left = open ? 'PCR0 07cb 03ca 95c9 c68e 878e …' : 'open source · reproducible build';
  const right = open ? '' : portrait ? 'PayPerQ/ppq-enclave-proxy' : 'github.com/PayPerQ/ppq-enclave-proxy';
  const meta: React.CSSProperties = { position: 'absolute', bottom: fs * 1.4, font: `400 ${fs}px/1 ${F.mono}`, whiteSpace: 'pre', color: 'rgba(233,125,73,.8)', opacity: detO };
  const blink = open ? (Math.floor(T * 2) % 2 === 0 ? 1 : 0) * ramp(T, 0.3, 0.4) : undefined; // a typing caret after "Enclave"
  const o = open ? 1 : ramp(tt, -0.1, 0.1);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Field r={field} seed={open ? 'open' : 'end'} t={open ? T + 6 : t} frame={frame} sweep={open ? (out > 0 ? sweep : undefined) : sweep}
        keep={[{ x: 0, y: Er.y - 80, w: fw, h: Er.h + 160 }]} clears={[{ x: Er.x - 16, y: Er.y - 16 - fs * 2, w: Er.w + 32, h: Er.h + 32 + fs * 2 }]} />
      <Enclave r={Er} fs={fs} line={2} o={encO} />
      <div style={{ position: 'absolute', left: Er.x, top: Er.y, width: Er.w, height: Er.h, opacity: encO }}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 7%', flexDirection: 'column', gap: 24 }}>
          {!open && <Img src={staticFile('flame.png')} style={{ width: 60, height: 60, objectFit: 'contain', opacity: ease(ramp(tt, 0.3, 0.8)) }} />}
          <div style={{ font: `400 ${size}px/1.1 ${F.display}`, letterSpacing: '-0.03em', color: '#fff', opacity: titleO, textWrap: 'balance' } as React.CSSProperties}>
            {decrypt(text, front, 6, size, frame, kind, CIPHER.b, blink)}
          </div>
        </AbsoluteFill>
        <span style={{ ...meta, left: fs * 1.4 }}>{det(left, kind + 'l')}</span>
        {right && <span style={{ ...meta, right: fs * 1.4 }}>{det(right, kind + 'r')}</span>}
      </div>
    </AbsoluteFill>
  );
};
