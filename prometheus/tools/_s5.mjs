import { chromium } from 'playwright';
const f = process.argv[2], pre = process.argv[3];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 800 } });
await p.goto('file://' + f);
await p.waitForTimeout(500);
await p.evaluate(() => document.querySelector('.intro').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(800);
await p.screenshot({ path: `../privacy-ideas/${pre}-0.png` });
const n = await p.$$eval('.step', e => e.length);
for (let i = 1; i <= n; i++) {
  await p.evaluate(i => { const el = document.querySelector(`.step[data-s="${i}"]`); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - (innerHeight - el.offsetHeight) / 2); }, i);
  await p.waitForTimeout(1600);
  await p.screenshot({ path: `../privacy-ideas/${pre}-${i}.png` });
}
await b.close();
