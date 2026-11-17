// Build: an OpenAI-compatible snippet pointed at PayPerQ; only the model string changes between calls
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Fonts, Grain, clamp01, ease, scramble } from './common';
import { palettes } from './theme';

const QUESTION = 'Explain a mutex in one sentence.';
// Costs: 28 input + 42 output tokens at each model's API price in the public catalogue
const RUNS = [
  { id: 'claude-sonnet-5.5', answer: 'A mutex lets only one thread into a critical section at a time, so shared data never changes underneath you.', cost: '0.000502' },
  { id: 'gpt-6.1-sol', answer: 'A mutex is a lock: whoever holds it gets exclusive access to a shared resource until they release it.', cost: '0.000502' },
  { id: 'glm-5.3', answer: 'A mutex serializes access to shared state so two threads can never modify it at the same moment.', cost: '0.000236' },
  { id: 'deepseek/deepseek-v4.1-flash', answer: 'Mutual exclusion: one holder at a time, and everyone else waits until the lock is released.', cost: '0.000062' },
  { id: 'gemini-4-argon', answer: 'Think of it as the single key to a room; threads take turns using the shared data inside.', cost: '0.000502' },
];
const INTRO = 70;
const CYCLE = 78;

type Tok = { t: string; k?: 'kw' | 'str' | 'pun' | 'fn' | 'model' };

export const OneLine: React.FC<{ palette: keyof typeof palettes }> = ({ palette }) => {
  const p = palettes[palette];
  const f = useCurrentFrame();
  const run = f < INTRO ? -1 : Math.floor((f - INTRO) / CYCLE);
  const local = f < INTRO ? 0 : (f - INTRO) % CYCLE;
  const cur = RUNS[Math.max(0, run) % RUNS.length];
  const prev = RUNS[(Math.max(0, run) - 1 + RUNS.length) % RUNS.length];

  // model string: scramble from previous id to current id during the first frames of each cycle
  let modelText = RUNS[0].id;
  if (run >= 1 && local < 16) {
    const t = local / 16;
    modelText = t < 0.5 ? scramble(prev.id, t * 2, 'm' + run, f) : scramble(cur.id, 1 - (t - 0.5) * 2, 'n' + run, f);
  } else if (run >= 0) modelText = cur.id;

  const colors = { kw: p.accentInk, str: p.text, pun: p.dim, fn: p.text, model: p.accentInk } as const;
  const L = (...toks: Tok[]) => toks;
  const code: Tok[][] = [
    L({ t: 'from', k: 'kw' }, { t: ' openai ' }, { t: 'import', k: 'kw' }, { t: ' OpenAI' }),
    L(),
    L({ t: 'client = ' }, { t: 'OpenAI', k: 'fn' }, { t: '(', k: 'pun' }),
    L({ t: '    base_url=' }, { t: '"https://api.ppq.ai/v1"', k: 'str' }, { t: ',', k: 'pun' }),
    L({ t: '    api_key=os.environ[' }, { t: '"PPQ_API_KEY"', k: 'str' }, { t: '],', k: 'pun' }),
    L({ t: ')', k: 'pun' }),
    L(),
    L({ t: 'reply = client.chat.completions.' }, { t: 'create', k: 'fn' }, { t: '(', k: 'pun' }),
    L({ t: '    model=' }, { t: '"' + modelText + '"', k: 'model' }, { t: ',', k: 'pun' }),
    L({ t: '    messages=[{' }, { t: '"role"', k: 'str' }, { t: ': ' }, { t: '"user"', k: 'str' }, { t: ', ' }, { t: '"content"', k: 'str' }, { t: ': question}],' }),
    L({ t: ')', k: 'pun' }),
    L({ t: 'print', k: 'fn' }, { t: '(reply.choices[0].message.content)' }),
  ];
  const LH = 52;
  const CODE_Y = 96;
  const baseBand = interpolate(f, [18, 30, 62, 74], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const modelBand = f < 66 ? 0 : interpolate(f, [66, 80], [0, 1], { extrapolateRight: 'clamp' });
  const codeIn = ease(clamp01(f / 16));

  // terminal state for the current run
  const streamT = clamp01((local - 18) / 40);
  const answer = run >= 0 ? cur.answer.slice(0, Math.floor(streamT * cur.answer.length)) : '';
  const metaIn = ease(clamp01((local - 60) / 8));
  const history = run >= 1 ? RUNS[(run - 1) % RUNS.length] : null;
  const loopFade = interpolate(f, [INTRO + CYCLE * 5 - 12, INTRO + CYCLE * 5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: p.bg, fontFamily: p.sans }}>
      <Fonts />
      <div style={{ position: 'absolute', inset: 0, opacity: loopFade }}>
        {/* editor */}
        <div style={{ position: 'absolute', left: 100, top: 130, width: 1060, height: 820, borderRadius: 24, background: p.panel, opacity: codeIn }}>
          <div style={{ position: 'absolute', left: 36, top: 30, font: `400 20px/1 '${p.sans}'`, color: p.dim }}>ask.py</div>
          {/* line bands */}
          <div style={{ position: 'absolute', left: 16, right: 16, top: CODE_Y + 3 * LH, height: LH, borderRadius: 12, background: `rgba(${p.glow},0.12)`, opacity: baseBand }} />
          <div style={{ position: 'absolute', left: 16, right: 16, top: CODE_Y + 8 * LH, height: LH, borderRadius: 12, background: `rgba(${p.glow},0.12)`, opacity: modelBand }} />
          <div style={{ position: 'absolute', left: 40, top: CODE_Y }}>
            {code.map((line, i) => (
              <div key={i} style={{ display: 'flex', height: LH, alignItems: 'center', font: `400 25px/1 '${p.mono}'`, whiteSpace: 'pre' }}>
                <span style={{ width: 46, color: p.faint, fontSize: 21 }}>{i + 1}</span>
                {line.map((tk, j) => <span key={j} style={{ color: tk.k ? colors[tk.k] : p.text, fontWeight: tk.k === 'model' ? 600 : 400 }}>{tk.t}</span>)}
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', left: 40, bottom: 34, font: `400 22px/1.4 '${p.sans}'`, opacity: baseBand }}>
            <span style={{ color: p.text }}>Point any OpenAI-compatible client at PayPerQ.</span>
          </div>
          <div style={{ position: 'absolute', left: 40, bottom: 34, font: `400 22px/1.4 '${p.sans}'`, opacity: f > 80 ? 1 : 0 }}>
            <span style={{ color: p.text }}>Change one string to change the model.</span>
            <span style={{ color: p.dim }}> Same key, same balance.</span>
          </div>
        </div>

        {/* terminal */}
        <div style={{ position: 'absolute', left: 1190, top: 130, width: 630, height: 820, borderRadius: 24, background: p.panel2, padding: '30px 34px', boxSizing: 'border-box', opacity: codeIn }}>
          <div style={{ font: `400 20px/1 '${p.sans}'`, color: p.dim, marginBottom: 40 }}>Terminal</div>
          {history && (
            <div style={{ font: `400 22px/1.55 '${p.mono}'`, color: p.dim, opacity: 0.55, marginBottom: 34 }}>
              <div>$ python ask.py</div>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{history.answer}</div>
            </div>
          )}
          {run >= 0 && (
            <div style={{ font: `400 23px/1.55 '${p.mono}'` }}>
              <div style={{ color: p.dim }}>$ python ask.py</div>
              <div style={{ color: p.dim, marginTop: 6 }}>› {QUESTION}</div>
              <div style={{ color: p.text, marginTop: 18, minHeight: 180 }}>{answer}<span style={{ opacity: streamT < 1 && Math.floor(f / 8) % 2 === 0 ? 1 : 0, color: p.accentInk }}>▍</span></div>
              <div style={{ marginTop: 22, opacity: metaIn, font: `400 20px/1.6 '${p.mono}'` }}>
                <div><span style={{ color: p.good }}>✓</span> <span style={{ color: p.text }}>{cur.id}</span></div>
                <div style={{ color: p.dim }}>served in enclave · 42 tokens · ${cur.cost}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Grain opacity={p.grain} />
    </AbsoluteFill>
  );
};
