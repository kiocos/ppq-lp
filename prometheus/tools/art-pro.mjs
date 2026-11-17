// Web copies of the "professional fire" hero options (paintings/pro, Nov 15 2026, Codex GPT-6.1 Terra).
// Usage: node art-pro.mjs [source dir, default ../paintings/pro]
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';
const SRC = path.resolve(process.argv[2] || '../paintings/pro'), OUT = path.resolve('../assets/art');
for (const f of fs.readdirSync(SRC).filter((f) => f.endsWith('.png'))) {
  const base = f.replace(/\.png$/, '');
  for (const width of [1600, 2400]) {
    const info = await sharp(path.join(SRC, f)).resize({ width, kernel: 'lanczos3' }).webp({ quality: width > 1700 ? 80 : 84, effort: 5 }).toFile(path.join(OUT, `${base}-${width}.webp`));
    console.log(`${base}-${width}.webp`, info.width + 'x' + info.height, Math.round(info.size / 1024) + ' KB');
  }
}
