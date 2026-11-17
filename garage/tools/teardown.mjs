// Reference teardown for the garage page: viewport-by-viewport screenshots at 1440 and 390 px
// (so scroll reveals render), stitched into strips, plus computed type, colour and spacing.
// Usage: node teardown.mjs [only-site-name]
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('../research');
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv[2];
const sites = [
  ['vercel', 'https://vercel.com/', 'dark'],
  ['cursor', 'https://cursor.com/', 'light'],
  ['aihero', 'https://www.aihero.dev/', 'dark'],
  ['commandcode', 'https://commandcode.ai/', 'dark'],
].filter((s) => !only || s[0] === only);

const extract = () => {
  const cs = (el) => getComputedStyle(el);
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const pick = (el) => {
    const s = cs(el); const r = el.getBoundingClientRect();
    return { tag: el.tagName.toLowerCase(), text: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 80), font: s.fontFamily.split(',')[0].replace(/["']/g, ''), size: s.fontSize, weight: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing, color: s.color, w: Math.round(r.width), y: Math.round(r.top + scrollY) };
  };
  const take = (sel, n) => [...document.querySelectorAll(sel)].filter(visible).slice(0, n).map(pick);
  const fonts = new Set(); document.fonts.forEach((f) => { if (f.status === 'loaded') fonts.add(`${f.family} ${f.weight}`); });
  const main = document.querySelector('main') || document.body;
  const sections = [...main.children].filter(visible).slice(0, 24).map((el) => { const s = cs(el); const r = el.getBoundingClientRect(); return { tag: el.tagName.toLowerCase(), y: Math.round(r.top + scrollY), h: Math.round(r.height), pt: s.paddingTop, pb: s.paddingBottom, bg: s.backgroundColor }; });
  const buttons = [...document.querySelectorAll('a,button')].filter((el) => visible(el) && el.getBoundingClientRect().top < 900).slice(0, 20).map((el) => { const s = cs(el); const r = el.getBoundingClientRect(); return { text: (el.innerText || '').trim().slice(0, 30), bg: s.backgroundColor, color: s.color, radius: s.borderRadius, h: Math.round(r.height), font: s.fontSize + '/' + s.fontWeight, shadow: s.boxShadow.slice(0, 80) }; }).filter((b) => b.text);
  return { title: document.title, bodyBg: cs(document.body).backgroundColor, bodyColor: cs(document.body).color, pageH: document.documentElement.scrollHeight, fonts: [...fonts].slice(0, 20), h1: take('h1', 3), h2: take('h2', 12), h3: take('h3', 8), p: take('p', 14), sections, buttons };
};

const browser = await chromium.launch();
for (const [name, url, scheme] of sites) {
  for (const W of [1440, 390]) {
    const H = W > 600 ? 900 : 844;
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, colorScheme: scheme, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    try { await page.goto(url, { waitUntil: 'networkidle', timeout: 40000 }); } catch { console.log(name, W, 'networkidle timeout, continuing'); }
    await page.waitForTimeout(2200);
    for (const t of ['Reject All', 'Reject', 'Decline', 'Accept All Cookies', 'Accept']) {
      const b = page.getByRole('button', { name: t, exact: true });
      if (await b.count()) { try { await b.first().click({ timeout: 1500 }); break; } catch {} }
    }
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const shots = [];
    for (let y = 0, i = 0; y < total && i < 14; y += H, i++) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(1100);
      shots.push(await page.screenshot());
    }
    if (W > 600) {
      await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(600);
      fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify(await page.evaluate(extract), null, 1));
    }
    // desktop: 2 viewports per strip; phone: 4 viewports side by side
    if (W > 600) {
      for (let i = 0; i < shots.length; i += 2) {
        const pair = shots.slice(i, i + 2);
        const buf = await sharp({ create: { width: W, height: H * pair.length, channels: 3, background: '#000' } }).composite(pair.map((b, k) => ({ input: b, top: k * H, left: 0 }))).png().toBuffer();
        await sharp(buf).resize({ width: 820 }).png().toFile(`${OUT}/${name}-d${String(i / 2).padStart(2, '0')}.png`);
      }
    } else {
      for (let i = 0; i < shots.length; i += 4) {
        const row = shots.slice(i, i + 4);
        const buf = await sharp({ create: { width: (W + 12) * row.length, height: H, channels: 3, background: '#444' } }).composite(row.map((b, k) => ({ input: b, top: 0, left: k * (W + 12) }))).png().toBuffer();
        await sharp(buf).resize({ width: 1000 }).png().toFile(`${OUT}/${name}-m${String(i / 4).padStart(2, '0')}.png`);
      }
    }
    console.log(name, W, 'height', total, 'viewports', shots.length);
    await ctx.close();
  }
}
await browser.close();
