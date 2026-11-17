import { chromium } from 'playwright';
import fs from 'node:fs';
const dir = '/tmp/en/video3d'; fs.rmSync(dir, { recursive: true, force: true });
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 800 }, recordVideo: { dir, size: { width: 1440, height: 800 } } });
const p = await ctx.newPage();
await p.goto('file:///Users/kio/ppq/landing-page/prometheus/r10/prometheus.html'); await p.addStyleTag({ content: '.pair{display:none!important}' });
await p.waitForTimeout(1500);
const top = await p.evaluate(() => document.getElementById('privacy').getBoundingClientRect().top + scrollY - 100);
await p.evaluate((y) => scrollTo(0, y), top); await p.waitForTimeout(1500);
const end = await p.evaluate(() => { const t = document.querySelector('.en-tech'); return t.getBoundingClientRect().top + scrollY - innerHeight * 0.8; });
const t0 = Date.now();
for (let y = top; y < end; y += 7) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(12); }
await p.waitForTimeout(2500);
console.log('scroll seconds', (Date.now() - t0) / 1000);
await ctx.close(); await b.close();
console.log(fs.readdirSync(dir));
