// Fonts In Use: what designers pair with the garage anchor candidates. Saves screenshots + text pairings.
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
const OUT = '../research';
const terms = ['barlow', 'big shoulders', 'archivo', 'geist'];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' });
const p = await ctx.newPage();
const report = {};
for (const t of terms) {
  await p.goto('https://fontsinuse.com/search?terms=' + encodeURIComponent(t), { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);
  const links = await p.evaluate((t) => [...document.querySelectorAll('a[href*="/typefaces/"]')].map((a) => ({ href: a.href, text: a.innerText.trim() })).filter((x) => x.text.toLowerCase().includes(t.split(' ')[0])), t);
  report[t] = { links: links.slice(0, 8) };
  const first = links[0];
  if (!first) continue;
  await p.goto(first.href, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2500);
  // the typeface page lists uses; each use card names the typefaces used together
  const uses = await p.evaluate(() => [...document.querySelectorAll('.fiu-gallery-item, article, li')].map((el) => el.innerText.trim().replace(/\s+/g, ' ')).filter((s) => s.length > 20 && s.length < 260).slice(0, 40));
  const pairedWith = await p.evaluate(() => {
    const out = {};
    document.querySelectorAll('a[href*="/typefaces/"]').forEach((a) => { const n = a.innerText.trim(); if (n) out[n] = (out[n] || 0) + 1; });
    return Object.entries(out).sort((a, b) => b[1] - a[1]).slice(0, 30);
  });
  report[t].page = first.href; report[t].pairedWith = pairedWith; report[t].uses = uses.slice(0, 20);
  const file = `${OUT}/fiu-${t.replace(/\s+/g, '-')}.png`;
  await p.screenshot({ path: file, fullPage: true });
  const m = await sharp(file).metadata();
  await sharp(file).extract({ left: 0, top: 0, width: 1440, height: Math.min(m.height, 3600) }).resize({ width: 900 }).toFile(file.replace('.png', '-s.png'));
  console.log(t, first.href, 'paired:', pairedWith.slice(0, 14).map((x) => x[0]).join(', '));
}
fs.writeFileSync(`${OUT}/fiu.json`, JSON.stringify(report, null, 1));
await b.close();
