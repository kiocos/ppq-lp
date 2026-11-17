// Opens "Technical details" and captures it, plus the section's surroundings. Usage: node entech.mjs file w h prefix
import { chromium } from 'playwright';
import path from 'node:path';
const [file, W, H, pre] = [path.resolve(process.argv[2]), +process.argv[3], +process.argv[4], process.argv[5]];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await p.goto('file://' + file); await p.addStyleTag({ content: '.pair{display:none!important}' });
await p.waitForTimeout(500);
await p.click('.en-tech summary');
await p.evaluate(() => { const el = document.querySelector('.en-tech'); scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.35); });
await p.waitForTimeout(1500);
await p.screenshot({ path: `../review/${pre}-tech.png` });
// horizontal overflow check
const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
console.log('overflow px', ov);
await b.close();
