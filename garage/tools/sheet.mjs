// Stitch phone viewport captures 4-up so a round can be reviewed in a few images.
// Usage: node sheet.mjs r1-garage-390   (reads ../review/<prefix>-vNN.png)
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const prefix = process.argv[2];
const dir = path.resolve(process.env.OUT || '../review');
const files = fs.readdirSync(dir).filter((f) => f.startsWith(prefix + '-v') && f.endsWith('.png')).sort();
for (let k = 0; k < files.length; k += 4) {
  const group = files.slice(k, k + 4);
  const metas = await Promise.all(group.map((f) => sharp(path.join(dir, f)).metadata()));
  const W = metas.reduce((s, m) => s + m.width, 0) + 12 * (group.length - 1);
  const H = Math.max(...metas.map((m) => m.height));
  let x = 0;
  const comps = group.map((f, i) => { const c = { input: path.join(dir, f), left: x, top: 0 }; x += metas[i].width + 12; return c; });
  await sharp({ create: { width: W, height: H, channels: 3, background: '#464646' } }).composite(comps).png().toFile(path.join(dir, `${prefix}-sheet${k / 4}.png`));
}
console.log('sheets', Math.ceil(files.length / 4));
