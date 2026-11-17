// Fonts In Use, second pass: wait for search results, then open the real typeface pages and list co-used faces per use
import { chromium } from 'playwright';
import sharp from 'sharp';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' });
const p = await ctx.newPage();
for (const t of ['barlow', 'big shoulders', 'archivo']) {
  await p.goto('https://fontsinuse.com/search?terms=' + encodeURIComponent(t), { waitUntil: 'networkidle' }).catch(() => {});
  await p.waitForTimeout(3000);
  const hrefs = await p.evaluate(() => [...new Set([...document.querySelectorAll('a')].map((a) => a.href))].filter((h) => /typefaces\/\d+/.test(h)));
  console.log('SEARCH', t, hrefs.filter((h) => h.includes(t.split(' ')[0].toLowerCase())).slice(0, 10).join('  '));
  await p.screenshot({ path: `../research/fiu-search-${t.replace(/\s+/g, '-')}.png` });
}
await b.close();
