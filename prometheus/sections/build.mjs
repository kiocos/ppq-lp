// Section-division study: three copies of r11 that separate the sections in different ways.
// r11 stays untouched. Rebuild with: node build.mjs (re-run after r11 changes).
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const src = fs.readFileSync(path.join(here, '../r11/prometheus.html'), 'utf8');

// Shared fix in all three: the API use cases were titled larger (24–34 px) than the sections (32 px)
// and spaced like sections (120 px vs 128 px). Demote them to the 20 px subhead and pull them closer.
const SHARED = `
  :root { --section-space: clamp(104px, 12vw, 176px); }
  .story .story-copy h3 { max-width: 20em; font-size: 20px; line-height: 1.3; letter-spacing: -0.01em; }
  .story .story-copy p { font-size: 16px; margin-top: 12px; }
  .story .story-copy .story-kicker { margin-bottom: 14px; }
  .story.ax-story { gap: clamp(40px, 5vw, 72px); margin-top: clamp(56px, 7vw, 96px); }
  .story .ax-stage { height: 440px; }
  .hero + .sec { padding-top: var(--section-space); }
  .pair { position: fixed; right: 16px; bottom: 16px; z-index: 60; display: flex; gap: 4px; padding: 4px; border-radius: 8px; background: rgba(20,19,17,.92); backdrop-filter: blur(10px); box-shadow: 0 0 0 1px rgba(255,255,255,.1); font: 500 13px var(--f-body); }
  .pair a { padding: 6px 10px; border-radius: 5px; color: var(--fg-2); }
  .pair a[aria-current] { background: rgba(255,255,255,.1); color: var(--fg); }
`;

// No category labels ("Privacy", "API"…) above the headings. Each heading is the section title and says
// what the section is about. Pricing reuses the approved line "Pay per message. Nothing monthly."
const TITLES = [
  ['Privacy', 'Privacy demands proof.', 'Private chats you can verify.'],
  ['API', 'Build on your own terms.', 'One API key for all your AI tools.'],
  ['Mobile app', 'Your choice goes with you.', 'PayPerQ on iPhone and Android.'],
  ['Pricing', 'You decide what to spend.', 'Pay per message. Nothing monthly.'],
];
const retitle = (h) => TITLES.reduce((acc, [label, from, to]) => {
  const out = acc.replace(new RegExp(`\\n\\s*<p class="label">${label}</p>`), '').replace(`>${from}</h2>`, `>${to}</h2>`);
  if (out.includes(`<p class="label">${label}</p>`) || !out.includes(`>${to}</h2>`)) throw new Error('r11 changed: ' + label);
  return out;
}, h);

const VARIANTS = {
  // A: full-bleed tonal bands. The surface changes at each section boundary; no lines.
  'a-bands': {
    name: 'A · Bands',
    css: `
  .sec { padding-bottom: var(--section-space); }
  .hero + .sec { padding-top: clamp(88px, 9vw, 128px); }
  #privacy, #mobile { --bg: #17140f; --panel: #1f1b16; --line: rgba(255,255,255,.07); background: var(--bg); }
  #api, #pricing { background: #0c0b0a; }
  .close { margin-top: 0; }
  /* the band is the card now */
  .app { background: transparent; border: 0; padding: 0; min-height: 0; }
  .app .vis { padding-top: 0; height: 520px; align-items: center; }
  @media (max-width: 860px) { .app .vis { height: auto; } }
`,
  },
  // B: one surface. Numbered chapter openers, more air, a warm light where each chapter begins,
  // and a contents rail that marks where you are.
  'b-chapters': {
    name: 'B · Chapters',
    css: `
  .sec { position: relative; isolation: isolate; }
  .sec::before { content: ''; position: absolute; z-index: -1; left: 0; right: 0; top: calc(var(--section-space) - 240px); height: 620px; pointer-events: none;
    background: radial-gradient(48% 52% at 18% 40%, rgba(191,60,27,.10), transparent 70%); }
  #mobile::before { display: none; }
  #mobile { padding-top: clamp(64px, 7vw, 104px); }
  .story .story-copy .story-kicker > span { display: none; }
  .rail { position: fixed; z-index: 40; top: 50%; left: max(20px, calc((100vw - var(--wrap)) / 2 - 132px)); transform: translateY(-50%); display: grid; gap: 4px; opacity: 0; transition: opacity .4s var(--ease); pointer-events: none; }
  .rail.on { opacity: 1; pointer-events: auto; }
  .rail a { display: flex; align-items: baseline; gap: 10px; padding: 6px 0; font-size: 13px; color: var(--fg-3); transition: color .25s; }
  .rail a span { font: 12px var(--f-mono); }
  .rail a[aria-current] { color: var(--fg); }
  .rail a[aria-current] span { color: var(--brand-ink); }
  .nav-links a[aria-current] { color: var(--fg); background: rgba(255,255,255,.06); }
  @media (max-width: 1399px) { .rail { display: none; } }
`,
    html: (h) => h
      .replace('</main>', `</main>
<nav class="rail" id="rail" aria-label="Sections"><a href="#privacy"><span>01</span>Privacy</a><a href="#api"><span>02</span>API</a><a href="#mobile"><span>03</span>App</a><a href="#pricing"><span>04</span>Pricing</a></nav>`),
    js: `
  (() => {
    const rail = document.getElementById('rail');
    const ids = ['privacy', 'api', 'mobile', 'pricing'];
    const secs = ids.map((id) => document.getElementById(id));
    const links = [...rail.querySelectorAll('a'), ...document.querySelectorAll('.nav-links a')];
    const tick = () => {
      const y = innerHeight * 0.45;
      let cur = null;
      for (const s of secs) { const r = s.getBoundingClientRect(); if (r.top < y && r.bottom > y) cur = s.id; }
      const close = document.querySelector('.close').getBoundingClientRect().top < innerHeight * 0.6;
      rail.classList.toggle('on', !!cur && !close);
      for (const a of links) a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + cur);
    };
    addEventListener('scroll', tick, { passive: true }); addEventListener('resize', tick); tick();
  })();
`,
  },
  // C: sections are rounded sheets on a black tray, with gaps between them; pricing is the one daylight sheet.
  'c-sheets': {
    name: 'C · Sheets',
    css: `
  body { background: #060505; }
  .hero { background: transparent; }
  .sec { --sheet: #131210; --bg: var(--sheet); --panel: #1c1a17; margin: 0 12px; padding: clamp(80px, 9vw, 128px) 0; border-radius: 28px; background: var(--sheet);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.05); }
  .sec + .sec { margin-top: 12px; }
  .hero + .sec { padding-top: clamp(80px, 9vw, 128px); }
  .app { background: transparent; border: 0; padding: 0; min-height: 0; }
  .app .vis { padding-top: 0; height: 520px; align-items: center; }
  .close { margin-top: 12px; }
  .close::before { background: linear-gradient(180deg, #060505 0%, rgba(6,5,5,.5) 15%, rgba(6,5,5,.12) 40%, rgba(6,5,5,0) 60%), linear-gradient(0deg, #060505 0%, rgba(6,5,5,0) 16%); }
  .foot { background: #060505; }
  /* daylight sheet */
  #pricing { --sheet: #eceae5; --fg: #171512; --fg-2: #48443e; --fg-3: #5f5a53; color: var(--fg); box-shadow: none; }
  #pricing .prices .bar { background: rgba(0,0,0,.09); }
  #pricing .block { box-shadow: 0 30px 60px -36px rgba(80,30,10,.55); }
  @media (max-width: 860px) {
    .sec { margin: 0 6px; border-radius: 20px; }
    .sec + .sec, .close { margin-top: 6px; }
    .app .vis { height: auto; }
  }
`,
  },
};

const order = Object.keys(VARIANTS);
for (const [key, v] of Object.entries(VARIANTS)) {
  let h = src
    .replace('href="story.css"', 'href="../r11/story.css"')
    .replace('src="story.js"', 'src="../r11/story.js"')
    .replace(/<title>([^<]*)<\/title>/, `<title>${v.name} · section study · $1</title>`);
  h = retitle(h);
  if (v.html) h = v.html(h);
  const pair = `<div class="pair" aria-label="Section study options">${order.map((k) => `<a href="${k}.html"${k === key ? ' aria-current="page"' : ''}>${VARIANTS[k].name}</a>`).join('')}<a href="../r11/prometheus.html">r11</a></div>`;
  h = h.replace('</head>', `<style id="section-study">${SHARED}${v.css}</style>\n</head>`);
  h = h.replace(/<\/body>(?![\s\S]*<\/body>)/, `${pair}\n${v.js ? `<script>${v.js}</script>\n` : ''}</body>`);
  fs.writeFileSync(path.join(here, key + '.html'), h);
  console.log('wrote', key + '.html');
}
