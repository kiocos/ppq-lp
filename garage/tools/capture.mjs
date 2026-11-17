// Fresh captures of the real PPQ chat app (localhost:3000) for the garage page.
// Reuses the uniform study's persistent guest profile (no new accounts) and its seeded conversations.
// Captures: the privacy pane re-verifying the enclave (video, so the build shown is today's), and stills.
// Usage: node capture.mjs [stills|verify]
import { openApp, APP, seedConversations, startScreencast } from '../../uniform/tools/app-common.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// seed-data.mjs reads the catalogue from /tmp; refresh it from our dated copy first
fs.copyFileSync(path.resolve('../facts/models-pricing.json'), '/tmp/ppq-models.json');
const { conversations, ids } = await import('../../uniform/tools/seed-data.mjs');

const OUT = path.resolve('../app-captures');
fs.mkdirSync(path.join(OUT, '_masters'), { recursive: true });
const only = process.argv[2];
let SLOW = 1;
const wait = (p, ms) => p.waitForTimeout(ms * SLOW);

const CURSOR = () => {
  const install = () => {
    if (document.getElementById('__cur')) return;
    const c = document.createElement('div');
    c.id = '__cur';
    c.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M5 3l14 8.2-6.2 1.3L9.6 19z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, { position: 'fixed', left: '-40px', top: '-40px', zIndex: 2147483647, pointerEvents: 'none', transition: 'transform .12s ease', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.35))' });
    document.documentElement.appendChild(c);
    addEventListener('mousemove', (e) => { c.style.left = e.clientX - 5 + 'px'; c.style.top = e.clientY - 3 + 'px'; }, true);
    addEventListener('mousedown', () => { c.style.transform = 'scale(.86)'; }, true);
    addEventListener('mouseup', () => { c.style.transform = 'scale(1)'; }, true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
};

async function prepare(page, { theme, convId, privacyPane = false }) {
  await page.goto(APP + '/chat', { waitUntil: 'domcontentloaded' });
  await wait(page, 4000);
  await page.evaluate(({ theme, privacyPane }) => {
    localStorage.setItem('showPrivacyPane', String(privacyPane));
    try { const prefs = JSON.parse(localStorage.getItem('ppq-preferences') || '{}'); prefs.settings = { ...(prefs.settings || {}), theme }; localStorage.setItem('ppq-preferences', JSON.stringify(prefs)); } catch {}
    localStorage.setItem('theme', theme);
  }, { theme, privacyPane });
  await seedConversations(page, conversations, convId);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await wait(page, 7000);
  const dismiss = page.getByRole('button', { name: 'Dismiss' });
  if (await dismiss.count()) { await dismiss.first().click().catch(() => {}); await wait(page, 400); }
  if (convId) {
    const name = conversations.find((c) => c.id === convId).name;
    await page.getByText(name, { exact: true }).first().click();
    await wait(page, 2500);
  }
}

async function encode(frames, file, { fps = 30, width = 1920, speed = 2.5 } = {}) {
  const dir = fs.mkdtempSync('/tmp/ppqcast-');
  const list = [];
  frames.forEach((f, i) => {
    const name = path.join(dir, `f${String(i).padStart(5, '0')}.jpg`);
    fs.writeFileSync(name, Buffer.from(f.data, 'base64'));
    const next = frames[i + 1];
    const dur = next ? Math.max(1 / (fps * 2), (next.t - f.t) / speed) : 0.6;
    list.push(`file '${name}'\nduration ${dur.toFixed(4)}`);
  });
  list.push(`file '${path.join(dir, `f${String(frames.length - 1).padStart(5, '0')}.jpg`)}'`);
  fs.writeFileSync(path.join(dir, 'list.txt'), list.join('\n'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'), '-vf', `scale=${width}:-2:flags=lanczos,fps=${fps},format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-movflags', '+faststart', path.join(OUT, file + '.mp4')]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'), '-vf', `fps=${fps},format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-movflags', '+faststart', path.join(OUT, '_masters', file + '-master.mp4')]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('video', file, frames.length, 'frames');
}

async function glide(page, locator, { steps = 28, click = true } = {}) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('no box for locator');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: Math.round(steps * SLOW) });
  await wait(page, 180);
  if (click) { await page.mouse.down(); await wait(page, 90); await page.mouse.up(); }
}
async function slowMo(page, factor) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 / factor });
  SLOW = factor;
}

if (!only || only === 'stills') {
  const { ctx, page } = await openApp({ theme: 'dark', dpr: 2 });
  await prepare(page, { theme: 'dark', convId: ids.code });
  await page.mouse.move(760, 420); await page.mouse.wheel(0, -4000); await wait(page, 900); await page.mouse.move(1300, 120);
  await page.screenshot({ path: path.join(OUT, 'chat-code-dark.png') });
  await page.getByText('Verified', { exact: true }).first().click(); await wait(page, 3500);
  await page.screenshot({ path: path.join(OUT, 'chat-privacy-dark.png') });
  const text = await page.evaluate(() => document.body.innerText);
  const build = (text.match(/Build v[\d.]+[^\n]*/) || ['(no build line found)'])[0];
  fs.writeFileSync(path.join(OUT, 'build-line.txt'), build + '\n');
  console.log('build line:', build);
  const pane = page.locator('aside, [role="complementary"], div').filter({ hasText: 'Who can see your chat data' }).last();
  const pbox = await pane.boundingBox().catch(() => null);
  if (pbox) await page.screenshot({ path: path.join(OUT, 'privacy-pane-dark.png'), clip: { x: pbox.x, y: 0, width: pbox.width, height: 900 } });
  await ctx.close();
}

if (!only || only === 'verify') {
  const { ctx, page } = await openApp({ theme: 'dark', dpr: 2 });
  await ctx.addInitScript(CURSOR);
  await prepare(page, { theme: 'dark', convId: ids.code });
  await page.evaluate(CURSOR);
  await page.mouse.move(700, 300);
  await slowMo(page, 2.5);
  const rec = await startScreencast(page);
  await wait(page, 800);
  await glide(page, page.getByText('Verified', { exact: true }).first());
  await wait(page, 2200);
  const again = page.getByText('Verify again', { exact: true }).first();
  if (await again.count()) { await glide(page, again); await wait(page, 3400); }
  const tech = page.getByText('Technical details', { exact: true }).first();
  if (await tech.count()) { await glide(page, tech); await wait(page, 2600); }
  const fr = await rec.stop(); SLOW = 1; await encode(fr, 'video-verify');
  await ctx.close();
}
