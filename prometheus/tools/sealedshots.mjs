// Captures privacy/sealed.html at raw scroll progress values (0 … 4, one unit = one step of scroll).
// Usage: node sealedshots.mjs <prefix> <w> <h> <comma list> [page]
import { chromium } from 'playwright';
import path from 'node:path';
const [pre, W, H, list, page = '../privacy/sealed.html'] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +W, height: +H } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto('file://' + path.resolve(page)); await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
await p.waitForTimeout(800);
for (const v of list.split(',').map(Number)) {
  await p.evaluate((v) => { const r = document.getElementById('en-story'); const top = r.getBoundingClientRect().top + scrollY; scrollTo(0, top - +r.dataset.pinTop + v * +r.dataset.stepLen); }, v);
  await p.waitForTimeout(1400);
  await p.screenshot({ path: `../review/${pre}-${String(v).replace('.', '_')}.png` });
}
console.log(errs.join('\n') || 'no errors'); await b.close();
