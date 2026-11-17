// Capture the real PPQ chat app (localhost:3000) with scripted conversations: stills + screencast videos
import { openApp, APP, seedConversations, startScreencast } from './app-common.mjs';
import { conversations, ids } from './seed-data.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('../app-captures');
const only = process.argv[2]; // optional: 'stills' | 'videos'
fs.mkdirSync(path.join(OUT, '_masters'), { recursive: true });
let SLOW = 1; // > 1 while recording: interactions run slower and are sped back up at encode time
const wait = (p, ms) => p.waitForTimeout(ms * SLOW);

// A visible pointer for recordings (headless screencasts do not paint the OS cursor)
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
    try {
      const prefs = JSON.parse(localStorage.getItem('ppq-preferences') || '{}');
      prefs.settings = { ...(prefs.settings || {}), theme };
      localStorage.setItem('ppq-preferences', JSON.stringify(prefs));
    } catch {}
    localStorage.setItem('theme', theme);
  }, { theme, privacyPane });
  await seedConversations(page, conversations, convId);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await wait(page, 7000);
  // Theme toggle fallback: compare the html class with the requested theme
  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  if ((theme === 'dark') !== isDark) {
    const toggle = page.locator('button[aria-label*="theme" i], button[aria-label*="mode" i]').first();
    if (await toggle.count()) { await toggle.click(); await wait(page, 800); }
  }
  const dismiss = page.getByRole('button', { name: 'Dismiss' });
  if (await dismiss.count()) { await dismiss.first().click().catch(() => {}); await wait(page, 400); }
  if (convId) {
    const name = conversations.find((c) => c.id === convId).name;
    await page.getByText(name, { exact: true }).first().click();
    await wait(page, 2500);
  }
  // Notification dot and similar transient chrome are left as the app renders them
}

async function still(page, file, opts = {}) {
  await page.screenshot({ path: path.join(OUT, file), ...opts });
  console.log('still', file);
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
  const vf = `scale=${width}:-2:flags=lanczos,fps=${fps},format=yuv420p`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'), '-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-movflags', '+faststart', path.join(OUT, file + '.mp4')]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'), '-vf', `fps=${fps},format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-movflags', '+faststart', path.join(OUT, '_masters', file + '-master.mp4')]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(OUT, file + '.mp4'), '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '30', '-row-mt', '1', path.join(OUT, file + '.webm')]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-sseof', '-0.3', '-i', path.join(OUT, file + '.mp4'), '-frames:v', '1', '-q:v', '2', path.join(OUT, file + '-poster.jpg')]);
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

async function typeSlow(page, text, delay = 70) { for (const ch of text) { await page.keyboard.type(ch); await wait(page, delay + Math.random() * 40); } }

async function slowMo(page, factor) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 / factor });
  SLOW = factor;
}
async function realTime(page) { SLOW = 1; }

const pickerButton = (page) => page.getByTestId('model-select-trigger').first();

// ───────────────────────── stills
if (!only || only === 'stills') {
  for (const theme of ['dark', 'light']) {
    const { ctx, page } = await openApp({ theme, dpr: 2 });
    await prepare(page, { theme, convId: ids.code });
    await page.mouse.move(760, 420); await page.mouse.wheel(0, -4000); await wait(page, 900);
    await page.mouse.move(1300, 120);
    await still(page, `chat-code-${theme}.png`);
    // scroll the thread to the fix
    await page.mouse.move(760, 420); await page.mouse.wheel(0, 700); await wait(page, 900);
    await still(page, `chat-code-fix-${theme}.png`);

    await page.getByText('Reply to rent increase', { exact: true }).first().click(); await wait(page, 2000);
    await page.mouse.move(760, 420); await page.mouse.wheel(0, -4000); await wait(page, 700); await page.mouse.move(1300, 120); await wait(page, 300);
    await still(page, `chat-writing-${theme}.png`);
    await page.getByText('How Lightning routes a payment', { exact: true }).first().click(); await wait(page, 2000);
    await page.mouse.move(1300, 120); await wait(page, 300);
    await still(page, `chat-lightning-${theme}.png`);

    // composer close-up with the enclave line
    const composer = page.locator('textarea').first();
    const cbox = await composer.boundingBox();
    if (cbox) await still(page, `composer-${theme}.png`, { clip: { x: cbox.x - 40, y: cbox.y - 40, width: Math.min(900, cbox.width + 80), height: 190 } });

    // model picker open, then filtered
    await pickerButton(page).click(); await wait(page, 1200);
    await still(page, `picker-open-${theme}.png`);
    await page.keyboard.type('claude'); await wait(page, 1000);
    await still(page, `picker-claude-${theme}.png`);
    await page.keyboard.press('Escape'); await wait(page, 600);

    // privacy pane on the code conversation
    await page.getByText('Token bucket race condition', { exact: true }).first().click(); await wait(page, 1500);
    await page.getByText('Verified', { exact: true }).first().click(); await wait(page, 3000);
    await still(page, `chat-privacy-${theme}.png`);
    const pane = page.locator('aside, [role="complementary"], div').filter({ hasText: 'Who can see your chat data' }).last();
    const pbox = await pane.boundingBox().catch(() => null);
    if (pbox) await still(page, `privacy-pane-${theme}.png`, { clip: { x: pbox.x, y: 0, width: pbox.width, height: 900 } });
    await ctx.close();
  }
}

// ───────────────────────── videos
if (!only || only === 'videos') {
  // A: pick a model by search, then start a follow-up
  {
    const { ctx, page } = await openApp({ theme: 'dark', dpr: 2 });
    await ctx.addInitScript(CURSOR);
    await prepare(page, { theme: 'dark', convId: ids.code });
    await page.evaluate(CURSOR);
    await page.mouse.move(900, 300);
    await slowMo(page, 2.5);
    const rec = await startScreencast(page);
    await wait(page, 900);
    await glide(page, pickerButton(page));
    await wait(page, 900);
    await typeSlow(page, 'sonnet', 110);
    await wait(page, 700);
    await glide(page, page.getByText('Claude Sonnet 5.5', { exact: true }).first());
    await wait(page, 900);
    await glide(page, page.locator('textarea').first());
    await typeSlow(page, 'Now write a table-driven test for Allow()', 55);
    await wait(page, 1600);
    const fr1 = await rec.stop(); await realTime(page); await encode(fr1, 'video-picker-search');
    await ctx.close();
  }
  // B: browse the catalogue across modalities, land on an open-weight model
  {
    const { ctx, page } = await openApp({ theme: 'dark', dpr: 2 });
    await ctx.addInitScript(CURSOR);
    await prepare(page, { theme: 'dark', convId: ids.lightning });
    await page.evaluate(CURSOR);
    await page.mouse.move(900, 300);
    await slowMo(page, 2.5);
    const rec = await startScreencast(page);
    await wait(page, 700);
    await glide(page, pickerButton(page));
    await wait(page, 900);
    const list = page.getByText('Recommended', { exact: true }).first();
    const lb = await list.boundingBox();
    if (lb) await page.mouse.move(lb.x + 260, lb.y + 160, { steps: 30 });
    for (let i = 0; i < 26; i++) { await page.mouse.wheel(0, 120); await wait(page, 55); }
    await wait(page, 500);
    for (let i = 0; i < 10; i++) { await page.mouse.wheel(0, -260); await wait(page, 40); }
    await wait(page, 400);
    for (const tab of ['Image', 'Video', 'Audio', 'Chat']) {
      const t = page.getByRole('tab', { name: tab }).first();
      const target = (await t.count()) ? t : page.getByText(tab, { exact: true }).nth(1);
      await glide(page, target, { steps: 16 }); await wait(page, 900);
    }
    const search = page.getByPlaceholder(/Search models/i).first();
    await glide(page, search, { steps: 18 });
    await typeSlow(page, 'kimi', 120); await wait(page, 800);
    const kimi = page.getByText(/^Kimi K3\.1 Pro$/).first();
    if (await kimi.count()) { await glide(page, kimi, { click: false }); await wait(page, 700); await page.mouse.down(); await wait(page, 80); await page.mouse.up(); }
    await wait(page, 1400);
    const fr2 = await rec.stop(); await realTime(page); await encode(fr2, 'video-picker-browse');
    await ctx.close();
  }
  // C: open the privacy pane and re-verify the enclave in the browser
  {
    const { ctx, page } = await openApp({ theme: 'dark', dpr: 2 });
    await ctx.addInitScript(CURSOR);
    await prepare(page, { theme: 'dark', convId: ids.writing });
    await page.evaluate(CURSOR);
    await page.mouse.move(700, 300);
    await slowMo(page, 2.5);
    const rec = await startScreencast(page);
    await wait(page, 800);
    await glide(page, page.getByText('Verified', { exact: true }).first());
    await wait(page, 2200);
    const again = page.getByText('Verify again', { exact: true }).first();
    if (await again.count()) { await glide(page, again); await wait(page, 3200); }
    const tech = page.getByText('Technical details', { exact: true }).first();
    if (await tech.count()) { await glide(page, tech); await wait(page, 2400); }
    const fr3 = await rec.stop(); await realTime(page); await encode(fr3, 'video-verify');
    await ctx.close();
  }
}
