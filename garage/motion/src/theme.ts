// Garage palette and facts. Facts re-fetched 2026-11-13 from api.ppq.ai/models-pricing and
// PayPerQ/ppq-enclave-proxy attestation/published-pcr.json (see ../facts/).

export const C = {
  ink: '#0b0a09',      // the wall and the night outside: warm-black graphite
  door: '#121110',     // door face base
  doorHi: '#1b1917',
  floor: '#0a0908',
  text: '#f2eee8',
  dim: '#a39c92',
  amber: '#f0743f',    // PPQ orange: the light, and only the light
  amberHot: '#ffb877', // the core of the strip, where the light is strongest
  amberCore: '#fff0dc',
  glow: '240,116,63',
  glowHot: '255,170,100',
};

export const facts = {
  date: 'Nov 13, 2026',
  chatModels: 388,
  providers: 66,
  openWeight: 172,
  media: 96,
  labels: { anon: 226, zdr: 156, e2e: 6 },
  enclave: { version: 'v0.75.0', commit: 'ea20ad8', pcr0: 'bd2b83aef6f4d50c5c090e30e969101ba0bc0ea4c1696f0c6b19b25a5176fe2773143805bacf36808766c56f5de85c10' },
};
