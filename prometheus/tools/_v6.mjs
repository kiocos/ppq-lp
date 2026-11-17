import { chromium } from 'playwright';
const b = await chromium.launch();
const url = 'file:///Users/kio/ppq/landing-page/prometheus/api/v6.html';
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errs = []; p.on('console', m => m.type()==='error' && errs.push(m.text())); p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('requestfailed', r => errs.push('failed ' + r.url()));
await p.goto(url); await p.evaluate(() => document.fonts.ready);
await p.addStyleTag({ content: 'body::after{display:none}' });
const shot = async (name) => p.screenshot({ path: `../api/review/v6-${name}.png` });
await p.evaluate(() => scrollTo(0, 260)); await p.waitForTimeout(1500); await shot('1440-sky');
// story: scroll so each step crosses the middle, capture mid-animation and end
const tops = await p.evaluate(() => [...document.querySelectorAll('.step')].map(s => s.getBoundingClientRect().top + scrollY + s.offsetHeight / 2 - innerHeight / 2));
for (let i = 0; i < tops.length; i++) {
  await p.evaluate(v => scrollTo(0, v), tops[i]);
  await p.waitForTimeout(2200); await shot(`1440-step${i}-mid`);
  await p.waitForTimeout(6500); await shot(`1440-step${i}-end`);
}
await p.mouse.move(1100, 450); await p.waitForTimeout(700); await shot('1440-tilt');
await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(800); await shot('1440-fund');
console.log('errors', errs, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));
await b.close();
