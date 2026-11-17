// Page stills cropped from the 2880 px app captures, plus the page grain tile
import sharp from 'sharp';
const A = '../app-captures/', O = '../assets/shots/';
await sharp(A + 'picker-dark.png').extract({ left: 975, top: 548, width: 1135, height: 1012 }).webp({ quality: 88 }).toFile(O + 'picker.webp');
await sharp(A + 'privacy-tech-dark.png').extract({ left: 2244, top: 830, width: 636, height: 970 }).webp({ quality: 88 }).toFile(O + 'verified.webp');
await sharp(A + 'privacy-dark.png').extract({ left: 2244, top: 0, width: 636, height: 1300 }).webp({ quality: 88 }).toFile(O + 'who-sees.webp');
// neutral grain tile, 192 px, mid-grey centred so overlay blend adds texture without shifting tone
const S = 192, buf = Buffer.alloc(S * S);
let seed = 42; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
for (let i = 0; i < S * S; i++) buf[i] = Math.max(0, Math.min(255, Math.round(128 + (rnd() + rnd() + rnd() - 1.5) * 120)));
await sharp(buf, { raw: { width: S, height: S, channels: 1 } }).png().toFile('../assets/grain.png');
console.log('ok');
// round 2: only the "who can see your chat data" table, dark and light
for (const t of ['dark', 'light']) await sharp(A + `privacy-${t}.png`).extract({ left: 2244, top: 96, width: 636, height: 740 }).webp({ quality: 90 }).toFile(O + `who-table-${t}.webp`);
for (const t of ['light']) {
  await sharp(A + `picker-${t}.png`).extract({ left: 975, top: 548, width: 1135, height: 1012 }).webp({ quality: 88 }).toFile(O + `picker-${t}.webp`);
}
console.log('r2 crops');
