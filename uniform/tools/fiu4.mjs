import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' });
const p = await ctx.newPage();
const uses = [];
for (const u of process.argv.slice(2)) {
  await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 }); await p.waitForTimeout(1500);
  const links = await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href*="/uses/"]')].map(a => a.href.split('#')[0]).filter(h => /\/uses\/\d+/.test(h)))]);
  for (const l of links) if (!uses.includes(l)) uses.push(l);
}
for (const h of uses.slice(0, 60)) {
  try { await p.goto(h, { waitUntil: 'domcontentloaded', timeout: 20000 }); } catch { continue; }
  const r = await p.evaluate(() => {
    const t = document.querySelector('h1')?.innerText.trim();
    const txt = document.body.innerText;
    const m = [...txt.matchAll(/More (.+?) in use/g)].map(x => x[1]);
    return t + ' :: ' + [...new Set(m)].join(' + ');
  });
  console.log(r);
}
await b.close();
