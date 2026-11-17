// Web copies of the enclave scene (Codex, Nov 15 2026; see ../art-enclave/PROMPTS.md).
// Usage: node enclave-art.mjs <source in ../art-enclave> <id>  →  ../assets/art/enclave-<id>{.webp,-2400.webp,.jpg}
import sharp from 'sharp';
import path from 'node:path';
const src = path.resolve('../art-enclave', process.argv[2] || 'scene-b1.png'), id = process.argv[3] || 'b1', out = path.resolve('../assets/art');
const img = sharp(src);
const { width, height } = await img.metadata();
await sharp(src).resize(2400, null, { kernel: 'lanczos3' }).webp({ quality: 84 }).toFile(path.join(out, `enclave-${id}-2400.webp`));
await sharp(src).webp({ quality: 86 }).toFile(path.join(out, `enclave-${id}.webp`));
await sharp(src).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(out, `enclave-${id}.jpg`));
// corner and edge colours, to blend the picture into the page background
const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
const px = (x, y) => { const i = (y * info.width + x) * info.channels; return [data[i], data[i + 1], data[i + 2]]; };
console.log(width, height, 'corners', px(4, 4), px(width - 5, 4), px(4, height - 5), px(width - 5, height - 5), 'mid-top', px(width >> 1, 4), 'mid-bottom', px(width >> 1, height - 5));
