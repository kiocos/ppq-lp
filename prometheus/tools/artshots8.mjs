// First-screen captures of every hero option. Usage: node artshots8.mjs [count] [round, default r8]
import { chromium } from 'playwright';
const n = +process.argv[2] || 9, round = process.argv[3] || 'r8';
const b = await chromium.launch();
for (let a = 1; a <= n; a++) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`file:///Users/kio/ppq/landing-page/prometheus/${round}/prometheus.html?art=${a}`);
  await p.addStyleTag({ content: '.pair{display:none!important}' }); await p.waitForTimeout(2200);
  await p.screenshot({ path: `../review/${round}-hero-art${a}-1440.png` }); await p.close();
}
await b.close(); console.log('ok');
