// Palettes and real catalogue data shared by every composition

export type Palette = {
  name: string;
  bg: string;
  panel: string;
  panel2: string;
  text: string;
  dim: string;
  faint: string;
  accent: string;
  accentInk: string;
  glow: string;
  good: string;
  sans: string;
  display: string;
  mono: string;
  displayWeight: number;
  displayStretch?: string;
  displayTracking: string;
  grain: number;
  invertMonoLogos: boolean;
};

const base = {
  sans: 'Geist',
  mono: 'Geist Mono',
  display: 'Geist',
  displayWeight: 500,
  displayTracking: '-0.035em',
};

export const palettes: Record<string, Palette> = {
  ink: {
    ...base, name: 'ink', bg: '#0a0a0a', panel: '#141414', panel2: '#1c1c1c', text: '#ededed', dim: '#8f8f8f', faint: '#3a3a3a',
    accent: '#f0743f', accentInk: '#ff9a66', glow: '255,122,60', good: '#5fd39a', grain: 0.07, invertMonoLogos: true,
  },
  graphite: {
    ...base, name: 'graphite', display: 'Archivo', displayStretch: '125%', displayWeight: 600, displayTracking: '-0.02em',
    bg: '#100f0e', panel: '#191816', panel2: '#22201d', text: '#efece6', dim: '#948f86', faint: '#3b3833',
    accent: '#f0743f', accentInk: '#ff9a66', glow: '255,122,60', good: '#7fd3a2', grain: 0.08, invertMonoLogos: true,
  },
  paper: {
    ...base, name: 'paper', display: 'Source Serif 4', displayWeight: 600, displayTracking: '-0.02em',
    bg: '#f4f1ea', panel: '#fbfaf6', panel2: '#ece8df', text: '#1b1a17', dim: '#6f6a60', faint: '#d6d0c4',
    accent: '#c9471c', accentInk: '#b63d14', glow: '232,104,48', good: '#2f8a5b', grain: 0.05, invertMonoLogos: false,
  },
  amber: {
    ...base, name: 'amber', display: 'Martian Mono', displayWeight: 500, displayTracking: '-0.04em', mono: 'Martian Mono',
    bg: '#0b0907', panel: '#15110d', panel2: '#1e1812', text: '#f3e9dc', dim: '#9b8a76', faint: '#3d3127',
    accent: '#ffad42', accentInk: '#ffc06b', glow: '255,150,50', good: '#b6e388', grain: 0.1, invertMonoLogos: true,
  },
  night: {
    ...base, name: 'night', display: 'Funnel Display', displayWeight: 600, displayTracking: '-0.03em',
    bg: '#0b1630', panel: 'rgba(14,26,54,0.86)', panel2: 'rgba(28,44,82,0.9)', text: '#eef2fb', dim: '#9aa8c7', faint: '#33476f',
    accent: '#ff8a4c', accentInk: '#ffa877', glow: '255,138,76', good: '#7fe0b3', grain: 0.06, invertMonoLogos: true,
  },
};

export type ModelRow = {
  name: string; provider: string; logo: string; privacy: 'Anon' | 'ZDR' | 'E2E'; median: number; samples: number; apiId: string; mono?: boolean;
};

// Source: api.ppq.ai/models-pricing (median UI cost per message and sample size), fetched 2026-11-13
export const models: ModelRow[] = [
  { name: 'Claude Opus 5.5', provider: 'Anthropic', logo: 'claude', privacy: 'Anon', median: 0.134, samples: 6456, apiId: 'claude-opus-5.5' },
  { name: 'GPT-6.1 Sol', provider: 'OpenAI', logo: 'openai', privacy: 'Anon', median: 0.0585, samples: 4169, apiId: 'gpt-6.1-sol', mono: true },
  { name: 'Gemini 4 Argon', provider: 'Google', logo: 'gemini', privacy: 'Anon', median: 0.0139, samples: 9444, apiId: 'gemini-4-argon' },
  { name: 'GLM 5.3', provider: 'Z.ai', logo: 'zai', privacy: 'ZDR', median: 0.0195, samples: 960, apiId: 'glm-5.3', mono: true },
  { name: 'Kimi K3.1 Pro', provider: 'Moonshot AI', logo: 'moonshot', privacy: 'ZDR', median: 0.0431, samples: 567, apiId: 'moonshotai/kimi-k3.1-pro', mono: true },
  { name: 'DeepSeek V4.1 Flash', provider: 'DeepSeek', logo: 'deepseek', privacy: 'ZDR', median: 0.0098, samples: 3619, apiId: 'deepseek/deepseek-v4.1-flash' },
  { name: 'Grok 4.7', provider: 'SpaceXAI', logo: 'xai', privacy: 'Anon', median: 0.0537, samples: 190, apiId: 'grok-4.7', mono: true },
  { name: 'GPT-OSS 120B', provider: 'OpenAI · private', logo: 'openai', privacy: 'E2E', median: 0.0048, samples: 575, apiId: 'private/gpt-oss-120b', mono: true },
  { name: 'Claude Haiku 5.5', provider: 'Anthropic', logo: 'claude', privacy: 'Anon', median: 0.0023, samples: 569, apiId: 'claude-haiku-5.5' },
  { name: 'GPT-6 Luna', provider: 'OpenAI', logo: 'openai', privacy: 'Anon', median: 0.0176, samples: 9493, apiId: 'gpt-6-luna', mono: true },
];

export const privacyCopy: Record<ModelRow['privacy'], string> = {
  Anon: 'Provider may keep prompts under its policy. Never sees your IP.',
  ZDR: 'Provider agreed not to store prompts or replies.',
  E2E: 'The model itself runs inside an enclave.',
};

export const enclave = { version: 'v0.73.0', commit: 'd47912c', pcr0: '3ef8468bfeafb86689d2d0117773be96594f350e41b9743e6cb4f8c749c0d360' };

export const fmtUsd = (v: number, digits = 4) => '$' + v.toFixed(digits);
