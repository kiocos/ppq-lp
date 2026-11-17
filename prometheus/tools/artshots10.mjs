// r10 hero captures: every option at 1440, option 1 at 1920, 1024 and 390. Usage: node artshots10.mjs
import { chromium } from 'playwright';
const b = await chromium.launch();
const shots = [[1, 1440, 900], [2, 1440, 900], [3, 1440, 900], [4, 1440, 900], [1, 1920, 1080], [1, 1024, 768], [1, 390, 844]];
for (const [a, w, h] of shots) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(`file:///Users/kio/ppq/landing-page/prometheus/r10/prometheus.html?art=${a}`);
  await p.addStyleTag({ content: '.pair{display:none!important}' }); await p.waitForTimeout(2200);
  await p.screenshot({ path: `../review/r10-hero-art${a}-${w}.png` }); await p.close();
}
await b.close(); console.log('ok');
