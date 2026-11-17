import { chromium } from 'playwright';
import fs from 'node:fs';
const urls = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' });
const p = await ctx.newPage();
for (const u of urls) {
  try { await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch (e) { console.log('ERR', u, e.message); continue; }
  await p.waitForTimeout(2500);
  const res = await p.evaluate(() => {
    const items = [...document.querySelectorAll('li, article, .fiu-gallery-item, [class*=gallery] > *')];
    const out = [];
    for (const it of items) {
      const title = it.querySelector('h2, h3, .fiu-gallery-item__title, a[href*="/gallery/"]');
      const tf = [...it.querySelectorAll('a[href*="/typefaces/"]')].map(a => a.innerText.trim()).filter(Boolean);
      if (title && tf.length) out.push((title.innerText || '').trim().slice(0, 70) + ' :: ' + [...new Set(tf)].join(' + '));
    }
    return { title: document.title, n: out.length, out: [...new Set(out)].slice(0, 70), txt: document.body.innerText.slice(0, 600) };
  });
  console.log('#####', u, '|', res.title, '| items', res.n);
  console.log(res.out.join('\n'));
  if (!res.n) console.log(res.txt);
}
await b.close();
