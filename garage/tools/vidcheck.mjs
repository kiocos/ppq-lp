// Load each video on a page at phone width and report whether it can play (diagnoses 'failed' requests)
import { chromium } from 'playwright';
import path from 'node:path';
const file = path.resolve(process.argv[2]);
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const fails = [];
p.on('requestfailed', (r) => fails.push(r.url().split('/').pop() + ' ' + r.failure()?.errorText));
await p.goto('file://' + file);
const res = await p.evaluate(async () => Promise.all([...document.querySelectorAll('video')].filter((v) => getComputedStyle(v).display !== 'none').map((v) => new Promise((r) => { v.preload = 'auto'; v.load(); v.addEventListener('canplay', () => r(v.currentSrc.split('/').pop() + ' ok ' + v.videoWidth + 'x' + v.videoHeight), { once: true }); v.addEventListener('error', () => r(v.currentSrc + ' ERROR ' + v.error?.code), { once: true }); setTimeout(() => r(v.currentSrc.split('/').pop() + ' timeout'), 8000); }))));
console.log(res.join('\n')); console.log('failed requests:', fails.join(' | ') || 'none');
await b.close();
