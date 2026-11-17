// Screenshot darkroom pages at desktop and phone widths, cut into strips, with overflow / error / request checks
// usage: node pageshot.mjs ../r1/index.html [--type=2] [--w=1440,390] [--motion]  (default: reduced motion, final states)
import { chromium } from 'playwright';
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';

const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=')[1];
const widths = (arg('w') || '1440,390').split(',').map(Number);
const type = arg('type');
const motion = process.argv.includes('--motion');
const OUT = path.resolve('../review');
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
for (const file of files) {
  const abs = path.resolve(file);
  const base = path.basename(abs, '.html');
  const name = path.basename(path.dirname(abs)) + (base === 'index' ? '' : '-' + base) + (type ? '-t' + type : '');
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w > 600 ? 900 : 844 }, reducedMotion: motion ? 'no-preference' : 'reduce' });
    const page = await ctx.newPage();
    const errors = [], external = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('requestfailed', (r) => errors.push('failed: ' + r.url()));
    page.on('request', (r) => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) external.push(r.url()); });
    await page.goto('file://' + abs + (type ? '?type=' + type : ''), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    const checks = await page.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const over = [...document.querySelectorAll('body *')].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > W + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed' && !el.closest('.pair,.code,.tbl-scroll'); })
        .slice(0, 6).map((el) => el.tagName.toLowerCase() + '.' + (el.className?.toString() || '').split(' ')[0] + ' r=' + Math.round(el.getBoundingClientRect().right));
      return { h: document.documentElement.scrollHeight, pageOver: document.documentElement.scrollWidth > W + 1, over };
    });
    const full = path.join(OUT, `${name}-${w}.png`);
    await page.screenshot({ path: full, fullPage: true });
    await page.screenshot({ path: path.join(OUT, `${name}-${w}-fold.png`) });
    const meta = await sharp(full).metadata();
    const seg = w > 600 ? 1800 : 2400;
    for (let i = 0, top = 0; top < meta.height; i++, top += seg) {
      await sharp(full).extract({ left: 0, top, width: meta.width, height: Math.min(seg, meta.height - top) }).resize({ width: w > 600 ? 900 : 390 }).png().toFile(path.join(OUT, `${name}-${w}-s${i}.png`));
    }
    console.log(name, w, 'height', checks.h, checks.pageOver ? 'OVERFLOW ' + checks.over.join(' | ') : 'no overflow', errors.length ? 'ERRORS ' + errors.slice(0, 4).join(' | ') : 'no errors', external.length ? 'EXTERNAL ' + external.slice(0, 3).join(' ') : 'no external requests');
    await ctx.close();
  }
}
await browser.close();
