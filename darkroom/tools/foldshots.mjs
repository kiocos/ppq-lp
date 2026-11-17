// First screen in real motion: the hero at several moments, and a print mid-development
import { chromium } from 'playwright';
import path from 'node:path';
const file = path.resolve(process.argv[2]); const tag = process.argv[3] || 'r1';
const times = (process.argv[4] || '2,5.5,9.4,10.8,13,18').split(',').map(Number);
const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  await p.goto('file://' + file, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
  for (const t of times) {
    await p.evaluate(async (t) => { const v = [...document.querySelectorAll('video[data-steps]')].find((v) => v.offsetParent); if (!v) return; v.pause(); v.preload = 'auto'; if (v.readyState < 2) { v.load(); await new Promise((r) => { v.addEventListener('loadeddata', r, { once: true }); setTimeout(r, 4000); }); } v.currentTime = t; await new Promise((r) => { v.addEventListener('seeked', r, { once: true }); setTimeout(r, 2000); }); v.play(); await new Promise((r) => setTimeout(r, 120)); v.pause(); }, t);
    await p.waitForTimeout(250);
    await p.screenshot({ path: `../review/${tag}-fold-${w}-t${t}.png` });
  }
  if (w === 1440) { // scroll a print into view and catch it mid-development
    await p.evaluate(() => document.querySelector('#privacy .print')?.scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(700); await p.screenshot({ path: `../review/${tag}-print-mid.png` });
  }
  await ctx.close();
}
await b.close(); console.log('ok');
