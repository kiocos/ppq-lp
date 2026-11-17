// Round checks: step sync follows the video, the pause control works, local assets exist
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('file://' + path.resolve('../r3/index.html'), { waitUntil: 'load' });
const res = await p.evaluate(async () => {
  const v = document.querySelector('.stage .d-only video');
  await new Promise((r) => { if (v.readyState >= 2) r(); else { v.addEventListener('loadeddata', r, { once: true }); setTimeout(r, 4000); } });
  const out = [];
  for (const t of [3, 10, 13, 18]) {
    v.currentTime = t; await new Promise((r) => { v.addEventListener('seeked', r, { once: true }); setTimeout(r, 1500); });
    await v.play().catch(() => {}); await new Promise((r) => setTimeout(r, 400));
    out.push(t + 's → ' + [...document.querySelectorAll('[data-step].on')].map((s) => s.querySelector('.n').textContent).join(','));
  }
  const btn = v.parentElement.querySelector('.vctl');
  btn.click(); await new Promise((r) => setTimeout(r, 200));
  out.push('after pause click: paused=' + v.paused + ' label=' + btn.textContent.trim());
  return out;
});
console.log(res.join('\n'));
await b.close();
// local references in every darkroom page must exist
let missing = 0;
for (const f of ['../index.html', '../r1/index.html', '../r2/index.html', '../r2/print.html', '../r3/index.html', '../r3/print.html']) {
  const s = fs.readFileSync(f, 'utf8'), base = path.dirname(f);
  for (const m of s.matchAll(/(?:src|poster|href|data-poster-still)="([^"#?]+)"/g)) {
    const ref = m[1]; if (/^(https?:|mailto:|data:)/.test(ref)) continue;
    if (!fs.existsSync(path.join(base, ref))) { console.log('MISSING', f, ref); missing++; }
  }
}
for (const css of ['../r1/darkroom.css', '../r2/darkroom.css', '../r3/darkroom.css']) for (const m of fs.readFileSync(css, 'utf8').matchAll(/url\((\.\.\/[^)]+)\)/g)) if (!fs.existsSync(path.join(path.dirname(css), m[1]))) { console.log('MISSING', css, m[1]); missing++; }
console.log('missing local assets:', missing);
