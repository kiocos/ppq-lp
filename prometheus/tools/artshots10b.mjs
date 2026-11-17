// r10 first screen after the composition/copy fixes, option 1 at four sizes. Usage: node artshots10b.mjs
import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [w, h] of [[1920, 1080], [1440, 900], [1024, 768], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file:///Users/kio/ppq/landing-page/prometheus/r10/prometheus.html?art=1');
  await p.addStyleTag({ content: '.pair{display:none!important}' }); await p.waitForTimeout(2200);
  const ov = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  await p.screenshot({ path: `../review/r10b-hero-${w}.png` }); await p.close();
  console.log(w, 'overflow', ov, errs.join('; '));
}
await b.close();
