import { chromium } from 'playwright';
import path from 'node:path';
const file = 'file://' + path.resolve('../chat/index.html');
const out = path.resolve('../chat/review'); await import('node:fs').then(fs => fs.mkdirSync(out, { recursive: true }));
const browser = await chromium.launch();
for (const [w, h, tag] of [[1440, 900, 'd'], [390, 844, 'm']]) {
  const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(file); await p.waitForTimeout(400);
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  // A: each step centred
  for (const s of [1, 2, 3, 4]) {
    await p.evaluate((s) => { const el = document.querySelector(`.step[data-s="${s}"]`); const r = el.getBoundingClientRect(); scrollTo(0, scrollY + r.top + r.height / 2 - innerHeight / 2); }, s);
    if (s === 3) { await p.waitForTimeout(500); await p.screenshot({ path: `${out}/${tag}-a${s}-pop.png` }); await p.waitForTimeout(1700); }
    else await p.waitForTimeout(1100);
    await p.screenshot({ path: `${out}/${tag}-a${s}.png` });
  }
  await p.evaluate(() => scrollTo(0, document.querySelector('#a').getBoundingClientRect().top + scrollY + 60)); await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/${tag}-a0.png` });
  // B
  await p.evaluate(() => scrollTo(0, document.querySelector('#b').getBoundingClientRect().top + scrollY - 60)); await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/${tag}-b0.png` });
  const cards = await p.$$('.pcard');
  for (let i = 0; i < cards.length; i++) {
    await p.evaluate((i) => { const c = document.querySelectorAll('.pcard')[i]; const top = c.offsetTop; scrollTo(0, (c.offsetParent ? c.getBoundingClientRect().top + scrollY : top) - 70); }, i);
    await p.waitForTimeout(500); await p.screenshot({ path: `${out}/${tag}-b${i + 1}.png` });
  }
  // C
  for (const v of ['browser', 'desktop', 'iphone']) {
    await p.evaluate(() => document.querySelector('.c-band').scrollIntoView()); await p.waitForTimeout(300);
    await p.click(`.tabs [data-v="${v}"]`); await p.waitForTimeout(900);
    await p.screenshot({ path: `${out}/${tag}-c-${v}.png` });
  }
  console.log(tag, 'overflow', ov, 'errors', errs);
  await p.close();
}
await browser.close();
