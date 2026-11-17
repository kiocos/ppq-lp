import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await p.goto('file:///Users/kio/ppq/landing-page/prometheus/chat/index.html'); await p.waitForTimeout(300);
for (const s of [1,2,3,4]) {
  // step top lands just under the sticky stage, then nudge so the heading crosses the trigger line
  await p.evaluate((s) => { const el = document.querySelector(`.step[data-s="${s}"]`); scrollTo(0, scrollY + el.getBoundingClientRect().top - innerHeight * 0.5); }, s);
  await p.waitForTimeout(s === 3 ? 2400 : 1200);
  await p.screenshot({ path: `../chat/review/m2-a${s}.png` });
}
await b.close();
