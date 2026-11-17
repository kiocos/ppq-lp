// Captures privacy/film.html at film times t (0 … 7.2).
// Usage: node filmshots.mjs <prefix> <w> <h> <comma list of t> [page]
import { chromium } from 'playwright';
import path from 'node:path';
const [pre, W, H, list, page = '../privacy/film.html'] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +W, height: +H } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto('file://' + path.resolve(page)); await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
await p.waitForTimeout(900);
for (const v of list.split(',').map(Number)) {
  await p.evaluate((v) => { const r = document.getElementById('fm-track'); scrollTo(0, r.getBoundingClientRect().top + scrollY - +r.dataset.pinTop + v * +r.dataset.unit); }, v);
  await p.waitForTimeout(+(process.env.WAIT || 1500));
  await p.screenshot({ path: `../review/${pre}-${String(v).replace('.', '_')}.png` });
}
console.log(errs.join('\n') || 'no errors'); await b.close();
