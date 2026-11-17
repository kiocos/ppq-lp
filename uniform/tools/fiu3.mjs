import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' });
const p = await ctx.newPage();
const lists = process.argv.slice(2);
const uses = [];
for (const u of lists) {
  await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 }); await p.waitForTimeout(1500);
  const links = await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href*="/uses/"]')].map(a => a.href.split('#')[0]).filter(h => /\/uses\/\d+/.test(h)))]);
  for (const l of links) if (!uses.includes(l)) uses.push(l);
}
for (const h of uses.slice(0, 48)) {
  try { await p.goto(h, { waitUntil: 'domcontentloaded', timeout: 20000 }); } catch { continue; }
  const r = await p.evaluate(() => {
    const t = document.querySelector('h1')?.innerText.trim();
    // typefaces appear in the main content, outside nav/aside; take links inside <main> or the first content column
    const scope = document.querySelector('main, #content, .fiu-content, article') || document.body;
    const as = [...scope.querySelectorAll('a[href*="/typefaces/"]')].filter(a => !a.closest('nav, aside, header, footer, [class*=sidebar], [class*=menu], [class*=filter]'));
    return t + ' :: ' + [...new Set(as.map(a => a.innerText.trim()).filter(x => x && x.length < 40))].slice(0, 6).join(' + ');
  });
  console.log(r);
}
await b.close();
