// Screenshot study pages: full page at desktop and mobile widths, cut into viewable strips, plus layout checks
import { chromium } from 'playwright';
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';

const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const widthArg = process.argv.find((a) => a.startsWith('--w='));
const typeArg = process.argv.find((a) => a.startsWith('--type='));
const widths = widthArg ? widthArg.slice(4).split(',').map(Number) : [1440, 390];
const OUT = path.resolve('../review');
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
for (const file of files) {
  const abs = path.resolve(file);
  const name = path.basename(path.dirname(abs)) + '-' + path.basename(abs, '.html') + (typeArg ? '-t' + typeArg.slice(7) : '');
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w > 600 ? 900 : 844 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('requestfailed', (r) => errors.push('failed: ' + r.url()));
    await page.goto('file://' + abs + (typeArg ? '?type=' + typeArg.slice(7) : ''), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => { for (const v of document.querySelectorAll('video')) { v.pause(); v.preload = 'auto'; try { v.load(); await new Promise((r) => { v.addEventListener('loadeddata', r, { once: true }); setTimeout(r, 3000); }); v.currentTime = Math.min(6, (v.duration || 8) * 0.45); await new Promise((r) => { v.addEventListener('seeked', r, { once: true }); setTimeout(r, 1500); }); } catch {} } });
    await page.waitForTimeout(600);
    const checks = await page.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const over = [...document.querySelectorAll('body *')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > W + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed' && !el.closest('.pair');
      }).slice(0, 6).map((el) => el.tagName.toLowerCase() + '.' + (el.className?.toString() || '').split(' ')[0] + ' r=' + Math.round(el.getBoundingClientRect().right));
      const pageOver = document.documentElement.scrollWidth > W + 1;
      return { h: document.documentElement.scrollHeight, over: pageOver ? over : [] , pageOver };
    });
    const full = path.join(OUT, `${name}-${w}.png`);
    await page.screenshot({ path: full, fullPage: true });
    const meta = await sharp(full).metadata();
    const seg = w > 600 ? 1800 : 2400;
    const parts = Math.ceil(meta.height / seg);
    for (let i = 0; i < parts; i++) {
      const h = Math.min(seg, meta.height - i * seg);
      await sharp(full).extract({ left: 0, top: i * seg, width: meta.width, height: h }).resize({ width: w > 600 ? 900 : 390 }).png().toFile(path.join(OUT, `${name}-${w}-s${i}.png`));
    }
    console.log(name, w, 'height', checks.h, 'strips', parts, checks.over.length ? 'OVERFLOW ' + checks.over.join(' | ') : 'no overflow', errors.length ? 'ERRORS ' + errors.slice(0, 4).join(' | ') : '');
    await ctx.close();
  }
}
await browser.close();
