// Forge study captures. Usage: node shots.mjs [tag]   → ../review/<tag>-*.png
import { createRequire } from 'module';
const require = createRequire('/Users/kio/ppq/landing-page/prometheus/tools/package.json');
const { chromium } = require('playwright');
const tag = process.argv[2] || 'r1';
const url = 'file:///Users/kio/ppq/landing-page/forge/index.html';
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const logs = [];
async function seq(w, h, times, extra = '') {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: w < 600 ? 2 : 1 });
  p.on('console', (m) => logs.push(`[${w}] ${m.type()}: ${m.text()}`));
  p.on('pageerror', (e) => logs.push(`[${w}] pageerror: ${e.message}`));
  await p.goto(url + extra);
  let t0 = Date.now();
  for (const t of times) {
    const dt = t * 1000 - (Date.now() - t0); if (dt > 0) await p.waitForTimeout(dt);
    await p.screenshot({ path: `../review/${tag}-${w}-${String(t).replace('.', '_')}s.png` });
  }
  return p;
}
const p1 = await seq(1440, 900, [0.7, 1.5, 3.9, 9, 12.5, 23]);
// hover a punch + anatomy
await p1.mouse.move(330, 700); await p1.waitForTimeout(1600);
await p1.screenshot({ path: `../review/${tag}-1440-mouseheat.png` });
await p1.keyboard.press('a'); await p1.waitForTimeout(400);
await p1.screenshot({ path: `../review/${tag}-1440-anatomy.png` });
await p1.keyboard.press('a');
await p1.screenshot({ path: `../review/${tag}-1440-full.png`, fullPage: true });
await seq(390, 844, [2.3, 9]);
await seq(1920, 1080, [9]);
await seq(1440, 900, [1], '?static');
console.log(logs.join('\n') || 'no console output');
await b.close();
