// Frames of the step-1 transition: the message leaving the laptop, the pulse on the track.
import { chromium } from 'playwright';
import path from 'node:path';
const file = path.resolve(process.argv[2]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 800 }, deviceScaleFactor: 2 });
await p.goto('file://' + file); await p.addStyleTag({ content: '.pair{display:none!important}' });
await p.waitForTimeout(600);
await p.evaluate(() => { const el = document.querySelectorAll('.en-step')[0]; scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.14); });
await p.waitForTimeout(1500);
await p.evaluate(() => { const el = document.querySelectorAll('.en-step')[1]; scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.14); });
for (const [ms, name] of [[450, 'a'], [600, 'b'], [450, 'c']]) { await p.waitForTimeout(ms); await p.screenshot({ path: `../review/priv-mid-${name}.png`, clip: { x: 520, y: 120, width: 920, height: 560 } }); }
await b.close();
