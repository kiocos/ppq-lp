import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [1920, 1080], [1024, 768]]) for (const a of [1, 2, 3]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(`file:///Users/kio/ppq/landing-page/prometheus/r7/prometheus.html?art=${a}`);
  await p.addStyleTag({ content: '.pair{display:none!important}' }); await p.waitForTimeout(2000);
  await p.screenshot({ path: `../review/r7-hero-art${a}-${w}.png` }); await p.close();
}
await b.close(); console.log('ok');
