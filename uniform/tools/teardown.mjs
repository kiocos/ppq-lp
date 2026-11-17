// Capture reference sites: screenshots + computed typography, color and spacing data
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT = path.resolve(process.argv[2] || '../research');
const sites = [
  ['vercel', 'https://vercel.com/'],
  ['cursor', 'https://cursor.com/'],
  ['aihero', 'https://www.aihero.dev/'],
  ['commandcode', 'https://commandcode.ai/'],
];

const extract = () => {
  const cs = (el) => getComputedStyle(el);
  const pick = (el) => {
    const s = cs(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      text: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 90),
      font: s.fontFamily.split(',')[0].replace(/["']/g, ''),
      size: s.fontSize, weight: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing,
      color: s.color, tt: s.textTransform, w: Math.round(r.width), y: Math.round(r.top + scrollY),
    };
  };
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const take = (sel, n) => [...document.querySelectorAll(sel)].filter(visible).slice(0, n).map(pick);
  const fonts = new Set();
  document.fonts.forEach((f) => { if (f.status === 'loaded') fonts.add(`${f.family} ${f.weight} ${f.style}`); });
  const root = cs(document.documentElement);
  const vars = {};
  for (const sheet of [...document.styleSheets]) {
    try {
      for (const rule of [...sheet.cssRules]) {
        if (rule.selectorText === ':root' || rule.selectorText === ':root, .light' ) {
          for (const p of rule.style) if (p.startsWith('--') && Object.keys(vars).length < 120) vars[p] = rule.style.getPropertyValue(p).trim();
        }
      }
    } catch {}
  }
  // section rhythm: top-level blocks inside main/body
  const main = document.querySelector('main') || document.body;
  const sections = [...main.children].filter(visible).slice(0, 30).map((el) => {
    const s = cs(el); const r = el.getBoundingClientRect();
    return { tag: el.tagName.toLowerCase(), cls: (el.className?.toString() || '').slice(0, 60), y: Math.round(r.top + scrollY), h: Math.round(r.height), pt: s.paddingTop, pb: s.paddingBottom, mt: s.marginTop, bg: s.backgroundColor, bt: s.borderTopWidth + ' ' + s.borderTopColor };
  });
  // max widths in use
  const widths = {};
  document.querySelectorAll('div,section,header,main,footer').forEach((el) => {
    const mw = cs(el).maxWidth; if (mw && mw !== 'none' && mw.endsWith('px')) widths[mw] = (widths[mw] || 0) + 1;
  });
  // button / link styles
  const buttons = [...document.querySelectorAll('a,button')].filter((el) => visible(el) && el.getBoundingClientRect().top < 900).slice(0, 25).map((el) => {
    const s = cs(el); const r = el.getBoundingClientRect();
    return { text: (el.innerText || '').trim().slice(0, 40), bg: s.backgroundColor, color: s.color, radius: s.borderRadius, h: Math.round(r.height), pad: s.padding, font: s.fontSize + '/' + s.fontWeight, border: s.border };
  }).filter((b) => b.text);
  return {
    title: document.title, bodyBg: cs(document.body).backgroundColor, bodyColor: cs(document.body).color,
    bodyFont: cs(document.body).fontFamily, pageH: document.documentElement.scrollHeight,
    fonts: [...fonts], vars, widths,
    h1: take('h1', 3), h2: take('h2', 14), h3: take('h3', 10), p: take('p', 18), nav: take('nav a, header a', 12),
    sections, buttons,
  };
};

const browser = await chromium.launch();
for (const [name, url] of sites) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'dark' });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (e) { console.log(name, 'networkidle timeout, continuing'); }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/${name}-hero.png` });
  // scroll through to trigger lazy content / reveals
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 700) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(250); }
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(800);
  const data = await page.evaluate(extract);
  fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify(data, null, 1));
  const full = `${OUT}/${name}-full.png`;
  await page.screenshot({ path: full, fullPage: true });
  // contact sheet: downscale the full page into 2-column strips for quick viewing
  const meta = await sharp(full).metadata();
  const segH = 2400; const parts = Math.ceil(meta.height / segH);
  for (let i = 0; i < parts; i++) {
    const h = Math.min(segH, meta.height - i * segH);
    await sharp(full).extract({ left: 0, top: i * segH, width: meta.width, height: h }).resize({ width: 720 }).png().toFile(`${OUT}/${name}-seg${String(i).padStart(2, '0')}.png`);
  }
  console.log(name, 'pageH', data.pageH, 'fonts', data.fonts.slice(0, 8).join(' | '), 'segments', parts);
  await ctx.close();
}
await browser.close();
