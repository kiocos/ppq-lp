// Records the opening (verify, then answer) and the API switch. Usage: node video.mjs → ../review/opening.webm
import { createRequire } from 'module';
const require = createRequire('/Users/kio/ppq/landing-page/prometheus/tools/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: '/tmp/forge-video', size: { width: 1440, height: 900 } } });
const p = await ctx.newPage();
await p.goto('file:///Users/kio/ppq/landing-page/forge/index.html');
await p.waitForTimeout(7000);
await p.mouse.move(420, 690, { steps: 30 }); await p.waitForTimeout(500);
await p.mouse.move(640, 690, { steps: 40 }); await p.waitForTimeout(900);
await p.mouse.move(905, 699, { steps: 25 }); await p.waitForTimeout(1600);
await p.click('[data-view="api"]'); await p.waitForTimeout(4200);
const v = p.video(); await ctx.close(); await v.saveAs('../review/opening.webm'); await b.close();
console.log('saved');
