// Review captures for garage pages: full page + one screenshot per viewport while scrolling (so lazy
// media loads), at 1440 and 390 px. Also reports page overflow, console errors and failed requests.
// Usage: node pageshot.mjs ../r1/garage.html [--w=1440,390] [--type=2]
import { chromium } from 'playwright';
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';

const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const widthArg = process.argv.find((a) => a.startsWith('--w='));
const typeArg = process.argv.find((a) => a.startsWith('--type='));
const widths = widthArg ? widthArg.slice(4).split(',').map(Number) : [1440, 390];
const OUT = path.resolve(process.env.OUT || '../review');
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
for (const file of files) {
  const abs = path.resolve(file);
  const name = path.basename(path.dirname(abs)) + '-' + path.basename(abs, '.html') + (typeArg ? '-t' + typeArg.slice(7) : '');
  for (const w of widths) {
    const H = w > 600 ? 900 : 844;
    const ctx = await browser.newContext({ viewport: { width: w, height: H }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('requestfailed', (r) => errors.push('failed: ' + r.url()));
    page.on('request', (r) => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) errors.push('EXTERNAL: ' + r.url()); });
    await page.goto('file://' + abs + (typeArg ? '?type=' + typeArg.slice(7) : ''), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    // hide the study switcher in captures
    await page.addStyleTag({ content: '.pair{display:none!important}' });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    // viewport by viewport, letting in-view videos start
    let i = 0;
    for (let y = 0; y < total && i < 16; y += H, i++) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(y === 0 ? 2400 : 900);
      await page.screenshot({ path: path.join(OUT, `${name}-${w}-v${String(i).padStart(2, '0')}.png`) });
    }
    // freeze every video on an informative frame for the full-page capture
    await page.evaluate(async () => {
      for (const v of document.querySelectorAll('video')) {
        if (getComputedStyle(v).display === 'none' || v.closest('.d-only, .m-only') && getComputedStyle(v.closest('.d-only, .m-only')).display === 'none') continue;
        v.pause(); v.preload = 'auto';
        try {
          if (v.readyState < 2) { v.load(); await new Promise((r) => { v.addEventListener('loadeddata', r, { once: true }); setTimeout(r, 4000); }); }
          v.currentTime = Number(v.dataset.shot || Math.min(6, (v.duration || 8) * 0.45));
          await new Promise((r) => { v.addEventListener('seeked', r, { once: true }); setTimeout(r, 1500); });
        } catch {}
      }
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    const checks = await page.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const pageOver = document.documentElement.scrollWidth > W + 1;
      const over = pageOver ? [...document.querySelectorAll('body *')].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > W + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed'; }).slice(0, 6).map((el) => el.tagName.toLowerCase() + '.' + (el.className?.toString() || '').split(' ')[0] + ' r=' + Math.round(el.getBoundingClientRect().right)) : [];
      return { h: document.documentElement.scrollHeight, pageOver, over };
    });
    const full = path.join(OUT, `${name}-${w}.png`);
    await page.screenshot({ path: full, fullPage: true });
    const meta = await sharp(full).metadata();
    const seg = w > 600 ? 1800 : 2400;
    for (let k = 0; k * seg < meta.height; k++) {
      const h = Math.min(seg, meta.height - k * seg);
      await sharp(full).extract({ left: 0, top: k * seg, width: meta.width, height: h }).resize({ width: w > 600 ? 900 : 390 }).png().toFile(path.join(OUT, `${name}-${w}-s${k}.png`));
    }
    console.log(name, w, 'height', checks.h, 'viewports', i, checks.pageOver ? 'OVERFLOW ' + checks.over.join(' | ') : 'no overflow', errors.length ? 'ERRORS ' + [...new Set(errors)].slice(0, 6).join(' | ') : 'no errors');
    await ctx.close();
  }
}
await browser.close();
