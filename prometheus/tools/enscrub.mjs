// Captures the scroll-scrubbed privacy story at fractional positions p (0 = title … 4 = verified).
// Usage: node enscrub.mjs <page> <prefix> [w h] [p list, comma-separated]
import { chromium } from 'playwright';
import path from 'node:path';
const file = path.resolve(process.argv[2]), pre = process.argv[3], W = +process.argv[4] || 1440, H = +process.argv[5] || 800;
const ps = (process.argv[6] || '0,0.15,0.3,0.5,0.7,1,1.35,1.65,2,2.4,2.7,3,3.4,3.7,4').split(',').map(Number);
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto('file://' + file + (process.env.Q || '')); await p.addStyleTag({ content: '.pair{display:none!important}' });
await p.waitForTimeout(700);
const out = [];
for (const v of ps) {
  await p.evaluate(([v, W]) => {
    const steps = [...document.querySelectorAll('.en-step')], line = innerHeight * (W <= 900 ? 0.72 : 0.5);
    const c = steps.map((el) => el.getBoundingClientRect().top + scrollY + el.getBoundingClientRect().height / 2);
    const n = Math.min(c.length - 2, Math.floor(v)), f = v - n, y = c[n] + (c[n + 1] - c[n]) * f;
    scrollTo(0, y - line);
  }, [v, W]);
  await p.waitForTimeout(1300);
  const f = `../review/${pre}-p${String(v).replace('.', '_')}.png`; await p.screenshot({ path: f }); out.push(f);
}
console.log(errs.length ? errs.join('\n') : 'no errors'); console.log(out.join(' '));
await b.close();
