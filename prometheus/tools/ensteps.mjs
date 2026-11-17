// Captures the privacy scroll story at each step. Usage: node ensteps.mjs ../r8/prometheus.html out-prefix [w h]
import { chromium } from 'playwright';
import path from 'node:path';
const [file, pre, W = 1440, H = 800] = [path.resolve(process.argv[2]), process.argv[3], +process.argv[4] || 1440, +process.argv[5] || 800];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
const logs = []; p.on('console', (m) => logs.push(m.type() + ': ' + m.text())); p.on('pageerror', (e) => logs.push('error: ' + e.message));
await p.goto('file://' + file + (process.env.Q || '')); await p.addStyleTag({ content: '.pair{display:none!important}' });
await p.waitForTimeout(800);
const n = await p.$$eval('.en-step', (e) => e.length);
const mobile = W <= 900;
for (let i = 0; i < n; i++) {
  await p.evaluate(([i, mobile]) => {
    const el = document.querySelectorAll('.en-step')[i], top = el.getBoundingClientRect().top + scrollY;
    scrollTo(0, mobile ? (i === 0 ? top - 90 : top - innerHeight * 0.5) : top - innerHeight * 0.14);
  }, [i, mobile]);
  await p.waitForTimeout(3200);
  await p.screenshot({ path: `../review/${pre}-s${i}.png` });
}
console.log(logs.join('\n') || 'no console output');
await b.close();
