import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' });
const p = await ctx.newPage();
const lists = process.argv.slice(2);
const uses = new Map();
for (const u of lists) {
  await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 }); await p.waitForTimeout(2000);
  const links = await p.evaluate(() => [...document.querySelectorAll('a[href*="/uses/"]')].map(a => [a.href, (a.innerText||a.title||'').trim()]));
  for (const [h, t] of links) if (!uses.has(h.split('#')[0]) && /\/uses\/\d+/.test(h)) uses.set(h.split('#')[0], t);
  if (u.includes('search')) await p.screenshot({ path: '../research/fiu-search.png' });
}
console.log('uses found', uses.size);
let i = 0;
for (const [h] of uses) {
  if (i++ >= 40) break;
  try { await p.goto(h, { waitUntil: 'domcontentloaded', timeout: 20000 }); } catch { continue; }
  const r = await p.evaluate(() => {
    const t = document.querySelector('h1')?.innerText.trim();
    const tf = [...document.querySelectorAll('.fiu-typeface-list a[href*="/typefaces/"], [class*=typeface] a[href*="/typefaces/"]')].map(a => a.innerText.trim());
    const all = tf.length ? tf : [...document.querySelectorAll('a[href*="/typefaces/"]')].map(a => a.innerText.trim()).slice(0, 8);
    return t + ' :: ' + [...new Set(all.filter(Boolean))].join(' + ');
  });
  console.log(r);
}
await b.close();
