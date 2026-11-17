import { chromium } from 'playwright';
const out = '/Users/kio/ppq/landing-page/prometheus/chat/review/r10';
await import('node:fs').then(fs => fs.mkdirSync(out, { recursive: true }));
const b = await chromium.launch();
for (const [w, h, t] of [[1440, 900, 'd'], [390, 844, 'm']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = [], ext = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  p.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) ext.push(r.url()); });
  await p.goto('file:///Users/kio/ppq/landing-page/prometheus/index.html'); await p.waitForURL(/r10/); await p.waitForTimeout(500);
  const go = async (sel, off) => { await p.evaluate(([s, o]) => scrollTo(0, document.querySelector(s).getBoundingClientRect().top + scrollY - o), [sel, off]); await p.waitForTimeout(900); };
  await go('#api', 0); await p.screenshot({ path: `${out}/${t}-api.png` });
  await go('#chat', 40); await p.screenshot({ path: `${out}/${t}-chat.png` });
  const A = await p.$('#chat .cmp');
  await (await A.$('textarea')).fill('Compare these two job offers for me'); await (await A.$('textarea')).dispatchEvent('input');
  await (await A.$('.trig')).click(); await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/${t}-pick.png` });
  await p.keyboard.press('Escape');
  await go('#chat .app', 120); await p.screenshot({ path: `${out}/${t}-app.png` });
  await go('#pricing', 0); await p.screenshot({ path: `${out}/${t}-pricing.png` });
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(t, 'overflow', ov, 'errors', errs, 'external', ext);
  await p.close();
}
await b.close();
