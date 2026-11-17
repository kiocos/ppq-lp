// Contact sheet: node sheet.mjs out.png cols width img1 img2 ...
import sharp from 'sharp';
const [out, cols, width, ...files] = process.argv.slice(2);
const C = Number(cols), Wd = Number(width);
const bufs = await Promise.all(files.map((f) => sharp(f).resize({ width: Wd }).toBuffer({ resolveWithObject: true })));
const H = Math.max(...bufs.map((b) => b.info.height));
const rows = Math.ceil(bufs.length / C);
await sharp({ create: { width: C * (Wd + 10), height: rows * (H + 10), channels: 3, background: '#2a2a2a' } })
  .composite(bufs.map((b, i) => ({ input: b.data, left: (i % C) * (Wd + 10), top: Math.floor(i / C) * (H + 10) }))).png().toFile(out);
