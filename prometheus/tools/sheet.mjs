import sharp from 'sharp';
const [out, ...names] = process.argv.slice(2);
const metas = await Promise.all(names.map(n => sharp(n).metadata()));
const H = Math.max(...metas.map(m => m.height)); let x = 0; const comp = [];
names.forEach((n, i) => { comp.push({ input: n, left: x, top: 0 }); x += metas[i].width + 20; });
await sharp({ create: { width: x - 20, height: H, channels: 3, background: '#444' } }).composite(comp).png().toFile(out);
