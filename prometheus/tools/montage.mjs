// Puts screenshots side by side for review. Usage: node montage.mjs out.png a.png b.png ...
import sharp from 'sharp';
const [out, ...files] = process.argv.slice(2);
const imgs = await Promise.all(files.map(async (f) => { const m = await sharp(f).metadata(); return { f, w: m.width, h: m.height }; }));
const H = Math.max(...imgs.map((i) => i.h)), gap = 24, W = imgs.reduce((a, i) => a + i.w, 0) + gap * (imgs.length - 1);
let x = 0; const comp = imgs.map((i) => { const c = { input: i.f, left: x, top: 0 }; x += i.w + gap; return c; });
await sharp({ create: { width: W, height: H, channels: 3, background: '#2a2a2a' } }).composite(comp).png().toFile(out);
console.log(out, W, H);
