// The descent painting with extra sky above it, so the page can fade the canvas's top edge
// without fading his hair (his head sits about 2% below the original top edge).
// The added strip is the top of the sky mirrored, blurred together with the first rows of the
// painting (so there is no edge line at the join), and settled toward plain sky colour at the top.
// Writes ../assets/art/hero-tall-*.webp.
import sharp from 'sharp';
// SKIP: the painting's first rows carry a faint darker canvas edge; they are replaced by the blur too
const SRC = '../paintings/hero-descent-a-2.png', EXT = 64, OVER = 48, SKIP = 8;
const { width: W, height: H } = await sharp(SRC).metadata();
const mirror = await sharp(SRC).extract({ left: 0, top: SKIP, width: W, height: EXT }).flip().toBuffer();
const raw = await sharp({ create: { width: W, height: H + EXT, channels: 3, background: '#15181b' } })
  .composite([{ input: mirror, top: 0, left: 0 }, { input: SRC, top: EXT, left: 0 }]).png().toBuffer();
// blur the strip plus a few painting rows, then keep only the strip
const blurred = await sharp(raw).extract({ left: 0, top: 0, width: W, height: EXT + OVER }).blur(9)
  .extract({ left: 0, top: 0, width: W, height: EXT + SKIP }).toBuffer();
const settle = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${EXT + SKIP}"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="${SKIP / (EXT + SKIP)}" stop-color="#15181b" stop-opacity="0"/><stop offset="1" stop-color="#15181b" stop-opacity=".85"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`);
const strip = await sharp(blurred).composite([{ input: settle }]).toBuffer();
const tall = await sharp(raw).composite([{ input: strip, top: 0, left: 0 }]).png().toBuffer();
for (const w of [2400, 1600]) {
  const info = await sharp(tall).resize({ width: w, kernel: 'lanczos3' }).webp({ quality: w > 1700 ? 80 : 84, effort: 5 }).toFile(`../assets/art/hero-tall-${w}.webp`);
  console.log(`hero-tall-${w}.webp`, info.width + 'x' + info.height, Math.round(info.size / 1024) + ' KB');
}
console.log('ratio', (W / (H + EXT)).toFixed(4), 'head top', ((EXT + 20) / (H + EXT) * 100).toFixed(1) + '%');
