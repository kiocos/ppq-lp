import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import {
  C, F, Fonts, Grain, Lattice, Glitch, edgeGlitch, CipherField, NoiseBlock, Select, Label, Caption,
  scramble, typed, ramp, clamp, HEXSET,
} from './lib';

// Facts (re-check before shipping): PCR0 from PayPerQ/ppq-enclave-proxy attestation/published-pcr.json, v0.79.0, 2026-11-16
const PCR0 = '07cb03ca95c9c68e878e8946c991b9838d1f3f91ffd5d564bba3a00cde5a5bfc363c797fe857b72849d1aca77cc069a5';
const PCR_SHORT = `${PCR0.slice(0, 24)}…${PCR0.slice(-8)}`;
const PROMPT = 'Review this NDA before I sign it.';
const MODEL = 'claude-sonnet-5.5';

// Scene boundaries (30 fps)
const S = { you: [0, 96], host: [96, 200], enclave: [200, 312], verify: [312, 408], end: [408, 474] } as const;
export const HERO_FRAMES = 474;

const L = 300; // left text edge

const Scene: React.FC<{ range: readonly [number, number]; seed: number; children: React.ReactNode; drift?: number }> = ({ range, seed, children, drift = 0.025 }) => {
  const f = useCurrentFrame();
  const [a, b] = range;
  if (f < a || f >= b) return null;
  const p = (f - a) / (b - a);
  return (
    <Glitch amount={edgeGlitch(f, a, b)} seed={seed}>
      <AbsoluteFill style={{ transform: `scale(${1 + drift * p})`, transformOrigin: '50% 50%' }}>{children}</AbsoluteFill>
    </Glitch>
  );
};

// ---------- 1. you ----------
// Your device: a grain surface, like the enclave. Plaintext only ever sits on these.
const DEV = { x: L - 48, y: 360, w: 1080, h: 250 };
const deviceLight = (u: number, v: number, t: number) =>
  clamp(0.05 + 0.32 * Math.exp(-Math.pow((u * 0.8 - v * 0.3 - 0.15 - t * 0.12) / 0.3, 2)));

const You: React.FC = () => {
  const f = useCurrentFrame();
  const shown = typed(PROMPT, f, 10, 1.3);
  const enc = 1 - ramp(f, 52, 78); // 1 plaintext -> 0 ciphertext
  const plain = f < 52;
  const text = plain ? shown : scramble(PROMPT, enc, f, 1);
  const cursorOn = plain && Math.floor(f / 8) % 2 === 0;
  const lineW = ramp(f, 58, 86) * (1920 - DEV.x - DEV.w);
  const blockIn = ramp(f, 0, 12);
  const fs = 44;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: DEV.x, top: DEV.y, opacity: 0.8 * blockIn * (1 - 0.5 * ramp(f, 56, 80)) }}>
        <NoiseBlock width={DEV.w} height={DEV.h} light={deviceLight} />
      </div>
      <div style={{ position: 'absolute', left: DEV.x, top: DEV.y - 44, opacity: ramp(f, 4, 12) }}>
        <Select size={22}>your device</Select>
      </div>
      <div style={{ position: 'absolute', left: L, top: DEV.y + DEV.h / 2 - fs * 0.72, fontFamily: F.mono, fontSize: fs, lineHeight: 1.4, whiteSpace: 'pre' }}>
        {plain ? (
          <span style={{ color: C.bg, background: shown ? C.select : 'transparent', padding: '0 0.25em', marginLeft: '-0.25em' }}>{text}</span>
        ) : (
          <span style={{ color: enc > 0.5 ? C.text : C.dim }}>{text}</span>
        )}
        <span style={{ display: 'inline-block', width: '0.55em', height: '1em', background: C.text, verticalAlign: '-0.14em', marginLeft: 6, opacity: cursorOn ? 1 : 0 }} />
      </div>
      {/* the wire */}
      <div style={{ position: 'absolute', left: DEV.x + DEV.w, top: DEV.y + DEV.h / 2, width: lineW, height: 1, background: C.line }} />
      <Label size={20} color={C.faint} style={{ position: 'absolute', left: DEV.x + DEV.w + 24, top: DEV.y + DEV.h / 2 - 34, opacity: ramp(f, 64, 74) }}>
        TLS 1.3
      </Label>
      <div style={{ position: 'absolute', left: L, top: 760 }}>
        <Caption>{typed('Sent over TLS.', f, 60, 1.4)}</Caption>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. host ----------
const hostShape = (u: number, v: number, t: number) => {
  // a slow diagonal swell plus two drifting lobes, faded at the edges
  const band = Math.exp(-Math.pow((v - 0.5 - (u - 0.5) * 0.55 + Math.sin(t * 0.7 + u * 3) * 0.06) / 0.2, 2));
  const lobe1 = Math.exp(-(Math.pow((u - 0.28 - t * 0.02) / 0.16, 2) + Math.pow((v - 0.36) / 0.22, 2)));
  const lobe2 = Math.exp(-(Math.pow((u - 0.74 + t * 0.015) / 0.18, 2) + Math.pow((v - 0.66) / 0.2, 2)));
  const edge = clamp(Math.min(u, 1 - u) * 6) * clamp(Math.min(v, 1 - v) * 6);
  return clamp((band * 1.0 + lobe1 * 0.7 + lobe2 * 0.65) * edge);
};

const Host: React.FC = () => {
  const f = useCurrentFrame() - S.host[0];
  const x = -700 + ramp(f, 0, 90) * 2100; // ciphertext crosses the host
  const meta: Array<[string, string]> = [
    ['host', 'api.ppq.ai'],
    ['model', MODEL],
    ['tokens', '412'],
    ['status', '200'],
  ];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 0.7 + 0.3 * ramp(f, 0, 20) }}>
        <CipherField width={1920} height={1080} shape={hostShape} cell={15} />
      </AbsoluteFill>
      {/* the prompt, as the host sees it */}
      <div style={{ position: 'absolute', left: x, top: 510, fontFamily: F.mono, fontSize: 40, color: C.text, whiteSpace: 'pre', background: C.bg, padding: '2px 10px' }}>
        {scramble(PROMPT, 0, f + 200, 2)}
      </div>
      <div style={{ position: 'absolute', right: 300, top: 250, background: C.bg, padding: '14px 18px' }}>
        {meta.map(([k, v], i) => (
          <Label key={k} size={22} color={C.text} style={{ opacity: ramp(f, 14 + i * 5, 24 + i * 5), lineHeight: 1.7 }}>
            <span style={{ color: C.faint }}>{k.padEnd(8)}</span>
            {v}
          </Label>
        ))}
      </div>
      <div style={{ position: 'absolute', left: L, top: 760 }}>
        <Caption>{typed("PPQ's servers see ciphertext and metadata.", f, 22, 1.5)}</Caption>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3. enclave ----------
const EB = { x: 700, y: 250, w: 1000, h: 500 };
const enclaveLight = (u: number, v: number, t: number) => {
  const sweep = Math.exp(-Math.pow((u * 0.9 + v * 0.45 - 0.2 - t * 0.22) / 0.22, 2));
  const fold = Math.exp(-Math.pow((u - 0.68 + Math.sin(t * 0.8 + v * 2.4) * 0.08) / 0.12, 2)) * 0.6;
  return clamp(0.08 + sweep * 0.55 + fold * 0.45);
};

const Enclave: React.FC = () => {
  const f = useCurrentFrame() - S.enclave[0];
  const fs = 40;
  const cw = fs * 0.6; // Geist Mono advance
  const textW = PROMPT.length * cw;
  const restX = EB.x + (EB.w - textW) / 2;
  const x = -textW + ramp(f, 6, 64) * (restX + textW);
  const edge = EB.x; // characters to the right of this x are decrypted
  const ty = EB.y + EB.h / 2 - fs * 0.7;
  const blockIn = ramp(f, 0, 14);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: EB.x, top: EB.y, opacity: 0.85 * blockIn, clipPath: `inset(0 ${(1 - blockIn) * 100}% 0 0)` }}>
        <NoiseBlock width={EB.w} height={EB.h} light={enclaveLight} />
      </div>
      <div style={{ position: 'absolute', left: EB.x - 1, top: EB.y - 1, width: EB.w + 2, height: EB.h + 2, border: `1px solid ${C.brandInk}`, opacity: ramp(f, 10, 20) }} />
      <div style={{ position: 'absolute', left: EB.x - 1, top: EB.y - 44, opacity: ramp(f, 12, 20) }}>
        <Select accent size={22}>AWS Nitro Enclave</Select>
      </div>
      {/* ciphertext outside */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: edge, height: 1080, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: x, top: ty, fontFamily: F.mono, fontSize: fs, color: C.dim, whiteSpace: 'pre', lineHeight: 1.4 }}>
          {scramble(PROMPT, 0, f + 400, 3)}
        </div>
      </div>
      {/* plaintext inside, as a selection: readable */}
      <div style={{ position: 'absolute', left: edge, top: 0, width: 1920 - edge, height: 1080, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: x - edge, top: ty, fontFamily: F.mono, fontSize: fs, color: C.bg, background: C.select, whiteSpace: 'pre', lineHeight: 1.4, padding: '0 0.25em', marginLeft: '-0.25em' }}>
          {PROMPT}
        </div>
      </div>
      <div style={{ position: 'absolute', left: L, top: 820 }}>
        <Caption>{typed("Decrypted here. Not on PPQ's servers.", f, 40, 1.5)}</Caption>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. verify ----------
const Verify: React.FC = () => {
  const f = useCurrentFrame() - S.verify[0];
  const runP = ramp(f, 6, 34);
  const pubP = ramp(f, 24, 52);
  const matched = f >= 58;
  const row = (label: string, p: number, salt: number, appear: number, note?: string) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 28, opacity: ramp(f, appear, appear + 6) }}>
      <Label size={22} color={C.faint} style={{ width: 230 }}>{label}</Label>
      <span style={{ fontFamily: F.mono, fontSize: 34, color: matched ? C.text : C.dim, whiteSpace: 'pre' }}>{scramble(PCR_SHORT, p, f, salt, HEXSET)}</span>
      {note && <Label size={20} color={C.faint} style={{ opacity: ramp(f, 46, 56), marginLeft: 30 }}>{note}</Label>}
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: L, top: 380, display: 'flex', flexDirection: 'column', gap: 26 }}>
        {row('running  PCR0', runP, 4, 0)}
        {row('published PCR0', pubP, 5, 18, 'v0.79.0 · Sigstore')}
      </div>
      {/* bracket + match */}
      <div style={{ position: 'absolute', left: L + 230 + 28 + PCR_SHORT.length * 0.6 * 34 + 18, top: 392, width: 18, height: 82, borderTop: `1px solid ${C.brandInk}`, borderRight: `1px solid ${C.brandInk}`, borderBottom: `1px solid ${C.brandInk}`, opacity: matched ? 1 : 0 }} />
      <div style={{ position: 'absolute', left: L, top: 560, opacity: matched ? 1 : 0 }}>
        <Select accent size={22}>match</Select>
      </div>
      <div style={{ position: 'absolute', left: L, top: 760 }}>
        <Caption>{typed('Check the enclave before you send.', f, 40, 1.5)}</Caption>
      </div>
      <Label size={22} color={C.dim} style={{ position: 'absolute', left: L, top: 830, opacity: ramp(f, 62, 72) }}>
        $ npx ppq-private-mode
      </Label>
    </AbsoluteFill>
  );
};

// ---------- 5. end ----------
const End: React.FC = () => {
  const f = useCurrentFrame() - S.end[0];
  const a = ramp(f, 2, 22), b = ramp(f, 10, 30);
  const out = 1 - ramp(f, 54, 66);
  const style: React.CSSProperties = { fontFamily: F.cond, fontStretch: '75%', fontWeight: 400, fontSize: 112, color: C.text, letterSpacing: '0.01em', lineHeight: 1.05, whiteSpace: 'pre' };
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: 'absolute', left: L, top: 380 }}>
        <div style={style}>{scramble('CHAT AND BUILD', a, f, 6)}</div>
        <div style={{ ...style, marginLeft: 260 }}>{scramble('PRIVATELY.', b, f, 7)}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Hero: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Fonts />
    <Lattice />
    <Scene range={S.you} seed={1}><You /></Scene>
    <Scene range={S.host} seed={2} drift={0.04}><Host /></Scene>
    <Scene range={S.enclave} seed={3}><Enclave /></Scene>
    <Scene range={S.verify} seed={4}><Verify /></Scene>
    <Scene range={S.end} seed={5} drift={0.015}><End /></Scene>
    <Grain />
  </AbsoluteFill>
);
