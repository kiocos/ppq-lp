// Fonts In Use: technology topic + Geist Sans page, screenshots and pairing text
import { chromium } from 'playwright';
import sharp from 'sharp';
const OUT = '../research';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' });
const p = await ctx.newPage();
const shot = async (url, name) => {
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); await p.waitForTimeout(3000);
  await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  const m = await sharp(`${OUT}/${name}.png`).metadata();
  for (let i = 0, top = 0; top < Math.min(m.height, 6000); i++, top += 2000) {
    await sharp(`${OUT}/${name}.png`).extract({ left: 0, top, width: 1440, height: Math.min(2000, m.height - top) }).resize({ width: 900 }).toFile(`${OUT}/${name}-s${i}.png`);
  }
  // pull "Typefaces" lines from each use card
  const txt = await p.evaluate(() => [...document.querySelectorAll('li, article, .fiu-gallery-item, .use')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => t.length > 10 && t.length < 260).slice(0, 80));
  console.log('==', name, m.height); console.log(txt.join('\n'));
};
await shot('https://fontsinuse.com/in/1/topics/32/technology', 'fiu-tech');
await shot('https://fontsinuse.com/typefaces/237493/geist-sans', 'fiu-geist');
await b.close();
