// Fonts In Use, third pass: open each anchor's typeface page and screenshot the uses gallery
import { chromium } from 'playwright';
import sharp from 'sharp';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' });
const p = await ctx.newPage();
for (const [n, u] of [['barlow', 'https://fontsinuse.com/typefaces/132647/barlow'], ['big-shoulders', 'https://fontsinuse.com/typefaces/205793/big-shoulders'], ['archivo', 'https://fontsinuse.com/typefaces/44329/archivo']]) {
  await p.goto(u, { waitUntil: 'networkidle' }).catch(() => {});
  await p.waitForTimeout(2500);
  const info = await p.evaluate(() => {
    const txt = document.body.innerText;
    const uses = (txt.match(/In use[\s\S]{0,40}/) || [''])[0];
    // each gallery card lists "Typefaces: A, B"
    const cards = [...document.querySelectorAll('[class*="gallery"] [class*="item"], .fiu-gallery-item')].map((el) => el.innerText.replace(/\s+/g, ' ').trim()).slice(0, 24);
    return { uses, cards };
  });
  console.log('====', n, info.uses.replace(/\s+/g, ' '));
  info.cards.forEach((c) => console.log('  -', c.slice(0, 160)));
  const f = `../research/fiu-${n}.png`;
  await p.screenshot({ path: f, fullPage: true });
  const m = await sharp(f).metadata();
  await sharp(f).extract({ left: 0, top: 0, width: 1440, height: Math.min(m.height, 3400) }).resize({ width: 900 }).toFile(f.replace('.png', '-s.png'));
}
await b.close();
