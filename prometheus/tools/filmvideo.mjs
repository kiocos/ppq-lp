// Records a scroll-through of privacy/film.html as frames → review/video/<name>.mp4
// Usage: node filmvideo.mjs <name> <w> <h>
import { chromium } from 'playwright';
import path from 'node:path'; import fs from 'node:fs'; import { execSync } from 'node:child_process';
const [name, W, H] = process.argv.slice(2);
const dir = `/tmp/filmframes-${name}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +W, height: +H } });
await p.goto('file://' + path.resolve('../privacy/film.html')); await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
await p.waitForTimeout(900);
let i = 0;
for (let t = -0.2; t <= 7.6; t += 0.025) {
  await p.evaluate((v) => { const r = document.getElementById('fm-track'); scrollTo(0, r.getBoundingClientRect().top + scrollY - +r.dataset.pinTop + v * +r.dataset.unit); }, t);
  await p.waitForTimeout(40);
  await p.screenshot({ path: `${dir}/${String(i++).padStart(4, '0')}.png` });
}
await b.close();
fs.mkdirSync('../review/video', { recursive: true });
execSync(`ffmpeg -v error -y -framerate 30 -i ${dir}/%04d.png -c:v libx264 -pix_fmt yuv420p -crf 20 ../review/video/${name}.mp4`);
console.log(`../review/video/${name}.mp4`, i, 'frames');
