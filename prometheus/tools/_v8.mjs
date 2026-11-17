import { chromium } from 'playwright';
const b = await chromium.launch();
const url = 'file:///Users/kio/ppq/landing-page/prometheus/api/v8.html';
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text())); p.on('requestfailed', r => errs.push('failed ' + r.url()));
await p.goto(url); await p.evaluate(() => document.fonts.ready); await p.addStyleTag({ content: 'body::after{display:none}' });
await p.evaluate(() => scrollTo(0, 230)); await p.waitForTimeout(1500);
for (let i = 0; i < 3; i++) { await p.screenshot({ path: `../api/review/v8-hub-${i}.png`, clip: { x: 640, y: 330, width: 160, height: 160 } }); await p.waitForTimeout(1200); }
const tops = await p.evaluate(() => [...document.querySelectorAll('.step')].map(s => s.getBoundingClientRect().top + scrollY + s.offsetHeight / 2 - innerHeight / 2));
for (let i = 0; i < tops.length; i++) {
  await p.evaluate(v => scrollTo(0, v), tops[i]);
  await p.waitForTimeout(3200); await p.screenshot({ path: `../api/review/v8-1440-step${i}-mid.png` });
  await p.waitForTimeout(7500); await p.screenshot({ path: `../api/review/v8-1440-step${i}-end.png` });
}
console.log('errors', errs, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));
await b.close();
