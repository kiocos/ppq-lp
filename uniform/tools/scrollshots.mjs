// Viewport-by-viewport capture so scroll-triggered reveals render, then stitch into strips
import { chromium } from 'playwright';
import path from 'node:path';
import sharp from 'sharp';

const OUT = path.resolve(process.argv[2] || '../research');
const only = process.argv[3];
const sites = [
  ['vercel', 'https://vercel.com/', 'dark'],
  ['cursor', 'https://cursor.com/', 'light'],
  ['aihero', 'https://www.aihero.dev/', 'dark'],
  ['commandcode', 'https://commandcode.ai/', 'dark'],
].filter((s) => !only || s[0] === only);

const browser = await chromium.launch();
for (const [name, url, scheme] of sites) {
  const W = 1440, H = 900;
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, colorScheme: scheme });
  const page = await ctx.newPage();
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 40000 }); } catch {}
  await page.waitForTimeout(2000);
  // dismiss cookie banners when obvious
  for (const t of ['Reject All', 'Reject', 'Decline', 'Accept All Cookies', 'Accept']) {
    const b = page.getByRole('button', { name: t, exact: true });
    if (await b.count()) { try { await b.first().click({ timeout: 1500 }); break; } catch {} }
  }
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const shots = [];
  for (let y = 0, i = 0; y < total && i < 16; y += H, i++) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(1300);
    shots.push(await page.screenshot());
  }
  // stitch pairs of viewports into one strip at 720px wide
  for (let i = 0; i < shots.length; i += 2) {
    const pair = shots.slice(i, i + 2);
    const canvas = sharp({ create: { width: W, height: H * pair.length, channels: 3, background: '#000' } })
      .composite(pair.map((buf, k) => ({ input: buf, top: k * H, left: 0 })));
    const buf = await canvas.png().toBuffer();
    await sharp(buf).resize({ width: 760 }).png().toFile(`${OUT}/${name}-v${String(i / 2).padStart(2, '0')}.png`);
  }
  console.log(name, 'height', total, 'viewports', shots.length);
  await ctx.close();
}
await browser.close();
