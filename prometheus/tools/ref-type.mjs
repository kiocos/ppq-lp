// Computed type, colour and button styles from a reference page (first screen).
// Usage: node ref-type.mjs https://example.com
import { chromium } from 'playwright';
const url = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
await p.waitForTimeout(1500);
const out = await p.evaluate(() => {
  const pick = (el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return { tag: el.tagName.toLowerCase(), text: (el.innerText || '').trim().slice(0, 60), font: s.fontFamily.slice(0, 60), size: s.fontSize, weight: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing, color: s.color, bg: s.backgroundColor, radius: s.borderRadius, pad: s.padding, border: s.border, h: Math.round(r.height), w: Math.round(r.width), y: Math.round(r.top) }; };
  const els = [...document.querySelectorAll('h1, h2, h1 + p, header a, main a, main button, p')].filter((e) => { const r = e.getBoundingClientRect(); return r.top < 900 && r.width > 0 && r.height > 0; });
  return els.slice(0, 28).map(pick);
});
for (const o of out) console.log(JSON.stringify(o));
await p.screenshot({ path: '../review/ref-polarsignals-1440.png' });
await b.close();
