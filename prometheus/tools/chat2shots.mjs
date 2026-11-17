import { chromium } from 'playwright';
const out = '/Users/kio/ppq/landing-page/prometheus/chat/review/r2';
await import('node:fs').then(fs => fs.mkdirSync(out, { recursive: true }));
const b = await chromium.launch();
for (const [w, h, t] of [[1440, 900, 'd'], [390, 844, 'm']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file:///Users/kio/ppq/landing-page/prometheus/chat/r2/index.html'); await p.waitForTimeout(300);
  const at = async (sel, off = 0) => { await p.evaluate(([s, o]) => scrollTo(0, document.querySelector(s).getBoundingClientRect().top + scrollY - o), [sel, off]); await p.waitForTimeout(400); };
  await at('#a', 40); await p.screenshot({ path: `${out}/${t}-a.png` });
  // typed + picker open + tier filter + badge hover
  const A = (await p.$$('.cmp'))[0];
  await at('.a-head', t === 'd' ? -120 : -20);
  await (await A.$('textarea')).fill('Compare these two job offers for me');
  await (await A.$('textarea')).dispatchEvent('input');
  await (await A.$('.trig')).click(); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/${t}-a-pick.png` });
  await (await A.$('.tiers [data-k="Z"]')).click(); await p.waitForTimeout(200);
  const badge = await A.$('.list .tier'); await badge.hover(); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/${t}-a-zdr.png` });
  await p.keyboard.press('Escape');
  await (await A.$('.send')).click(); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/${t}-a-send.png` });
  await at('#b', 40); await p.waitForTimeout(2600);
  await p.screenshot({ path: `${out}/${t}-b.png` });
  await at('#app', 40); await p.screenshot({ path: `${out}/${t}-app.png` });
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(t, 'overflow', ov, errs);
  await p.close();
}
await b.close();
