// Turns the generated paintings in ../paintings into the web files in ../assets/art.
// The sources are 1672 px wide, so the 2400 px files are Lanczos upscales (see README: re-render at 4K before shipping).
// Usage: node art.mjs
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';
const SRC = path.resolve('../paintings'), OUT = path.resolve('../assets/art');
fs.mkdirSync(OUT, { recursive: true });
const jobs = [
  // [source, output, width, optional crop {left, top, width, height} in source pixels]
  ['hero-descent-a-2.png', 'hero-2400.webp', 2400],
  ['hero-descent-a-2.png', 'hero-1600.webp', 1600],
  ['hero-descent-portrait.png', 'hero-portrait-1200.webp', 1200],
  ['hero-descent-b.png', 'hero-b-2400.webp', 2400],
  ['hero-descent-b.png', 'hero-b-1600.webp', 1600],
  ['hero-descent-portrait-2.png', 'hero-b-portrait-1200.webp', 1200],
  ['hero-theft.png', 'theft-2400.webp', 2400],
  ['hero-theft.png', 'theft-1600.webp', 1600],
  ['valley-fires.png', 'valley-2400.webp', 2400],
  ['valley-fires.png', 'valley-1200.webp', 1200],
  ['detail-stalk.png', 'stalk-1100.webp', 1100, { left: 440, top: 304, width: 760, height: 950 }],
  ['valley-hearths.png', 'hearths-2400.webp', 2400],
  ['valley-hearths.png', 'hearths-1200.webp', 1200],
  ['valley-hearths-portrait.png', 'hearths-portrait-1200.webp', 1200],
  ['hero-theft-portrait.png', 'theft-portrait-1200.webp', 1200],
  ['hero-descent-a-2.png', 'thumb-hero.jpg', 960],
];
for (const [src, out, width, crop] of jobs) {
  const file = path.join(SRC, src);
  if (!fs.existsSync(file)) { console.log('skip (missing)', src); continue; }
  let img = sharp(file);
  if (crop) img = img.extract(crop);
  img = img.resize({ width, kernel: 'lanczos3' });
  img = out.endsWith('.jpg') ? img.jpeg({ quality: 82 }) : img.webp({ quality: width > 1700 ? 80 : 84, effort: 5 });
  const info = await img.toFile(path.join(OUT, out));
  console.log(out, info.width + 'x' + info.height, Math.round(info.size / 1024) + ' KB');
}
