// Checks privacy/video.html: teaser playing, play click starts the film, phone cut. Usage: node videoshots.mjs
import { chromium } from 'playwright';
import path from 'node:path';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [w, h, pre] of [[1440, 900, 'video'], [390, 844, 'video-390']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + path.resolve('../privacy/video.html'));
  await p.evaluate(() => document.getElementById('vp').scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(2500);
  const s1 = await p.evaluate(() => { const t = document.querySelector('.vp-teaser'); return { teaser: t.currentSrc.split('/').pop(), playing: !t.paused, time: t.currentTime.toFixed(2) }; });
  await p.screenshot({ path: `../review/${pre}-teaser.png` });
  await p.click('.vp-play'); await p.waitForTimeout(5200);
  const s2 = await p.evaluate(() => { const f = document.querySelector('.vp-film'); return { film: f.currentSrc.split('/').pop(), playing: !f.paused, time: f.currentTime.toFixed(2), state: document.getElementById('vp').dataset.state }; });
  await p.screenshot({ path: `../review/${pre}-playing.png` });
  console.log(pre, JSON.stringify(s1), JSON.stringify(s2), errs.join(' | ') || 'no errors');
  await p.close();
}
await b.close();
