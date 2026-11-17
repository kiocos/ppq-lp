// Ordered (Bayer 8x8) dither of the hero paintings, one dot per pixel, meant to be shown at an
// integer scale (2 px per dot) with image-rendering: pixelated. Dots are a warm grey at low alpha;
// the ember keeps the brand orange. Writes ../assets/art/dither-<name>-<w>.png
// Usage: node dither.mjs [darkness=1.35]
import sharp from 'sharp';
// three levels: no dot, a dim dot, a brighter dot; the image is contrast-stretched first so the figure keeps its form
const GAMMA = +(process.argv[2] || 1.1), DOT = [[0, 0, 0, 0], [150, 138, 122, 105], [184, 172, 154, 200]], EMBER = [217, 96, 52, 255];
const B8 = [0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21];
const jobs = [
  ...['wide-descent-panorama', 'wide-procession', 'wide-threshold', 'wide-ultra-descent'].flatMap((n) => [[n, 720], [n, 960]]),
  ['hero-descent-portrait', 312],
];
for (const [name, w] of jobs) {
  const { data, info } = await sharp(`../paintings/${name}.png`).resize({ width: w, kernel: 'lanczos3' }).normalise({ lower: 1, upper: 99.5 }).sharpen({ sigma: 0.6 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 3, o = (y * info.width + x) * 4, R = data[i], G = data[i + 1], B = data[i + 2];
    const L0 = (0.2126 * R + 0.7152 * G + 0.0722 * B) / 255;
    const L = Math.pow(Math.max(0, (L0 - 0.08) / 0.92), GAMMA);   // a floor keeps the near-black sky mostly empty
    const t = (B8[(y & 7) * 8 + (x & 7)] + 0.5) / 64;
    const v = L * 2, base = Math.floor(v), lvl = Math.min(2, base + (v - base > t ? 1 : 0));
    const ember = R > 200 && R - G > 80 && G > B && L0 > 0.45;     // only the glow itself, not warm skin
    const c = ember && lvl > 0 ? EMBER : DOT[lvl];
    out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = c[3];
  }
  const file = `../assets/art/dither-${name}-${w}.png`;
  const r = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png({ palette: true, colours: 8 }).toFile(file);
  console.log(file, r.width + 'x' + r.height, Math.round(r.size / 1024) + ' KB');
}
