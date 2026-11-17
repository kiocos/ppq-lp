// First-screen captures of one page at several viewport sizes, to check the hero crop.
// Usage: node heroshots.mjs ../r3/prometheus.html
import { chromium } from 'playwright';
import path from 'node:path';
const file = path.resolve(process.argv[2]);
const sizes = [[1440, 900], [1280, 720], [1920, 1080], [1024, 768], [390, 844], [360, 740], [430, 932]];
const b = await chromium.launch();
for (const [w, h] of sizes) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('file://' + file); await p.addStyleTag({ content: '.pair{display:none!important}' });
  await p.waitForTimeout(2000);
  const name = path.basename(path.dirname(file)) + '-hero-' + w + 'x' + h + '.png';
  await p.screenshot({ path: path.join('../review', name) });
  console.log(name);
  await p.close();
}
await b.close();
