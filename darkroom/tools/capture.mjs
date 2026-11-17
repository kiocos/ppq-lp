// Darkroom captures from the local chat app: the typed prompt (video), the answered thread, the privacy pane, the picker
import { openApp, APP, seedConversations, startScreencast } from '../../uniform/tools/app-common.mjs';
import { conversations, PROMPT } from './seed-darkroom.mjs';
import { mockGreeting } from './mock-greeting.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('../app-captures');
const only = process.argv[2];
let SLOW = 1;
const wait = (p, ms) => p.waitForTimeout(ms * SLOW);

async function prepare(page, theme, convId, privacyPane = false) {
  await page.goto(APP + '/chat', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.evaluate(({ theme, privacyPane }) => {
    localStorage.setItem('showPrivacyPane', String(privacyPane));
    try { const p = JSON.parse(localStorage.getItem('ppq-preferences') || '{}'); p.settings = { ...(p.settings || {}), theme }; localStorage.setItem('ppq-preferences', JSON.stringify(p)); } catch {}
    localStorage.setItem('theme', theme);
  }, { theme, privacyPane });
  await seedConversations(page, conversations, convId);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  if ((theme === 'dark') !== isDark) { const t = page.locator('button[aria-label*="theme" i], button[aria-label*="mode" i]').first(); if (await t.count()) { await t.click(); await page.waitForTimeout(800); } }
  const d = page.getByRole('button', { name: 'Dismiss' }); if (await d.count()) { await d.first().click().catch(() => {}); await page.waitForTimeout(400); }
  // Hide the notification dot: transient chrome that reads as an unread alert in a hero
  await page.addStyleTag({ content: 'button[aria-label="What\'s new"] span.bg-brand{display:none!important}' }).catch(() => {});
}

async function encode(frames, file, { fps = 30, speed = 2.5 } = {}) {
  const dir = fs.mkdtempSync('/tmp/drcast-');
  const list = [];
  frames.forEach((f, i) => {
    const name = path.join(dir, `f${String(i).padStart(5, '0')}.jpg`);
    fs.writeFileSync(name, Buffer.from(f.data, 'base64'));
    const next = frames[i + 1];
    list.push(`file '${name}'\nduration ${(next ? Math.max(1 / 60, (next.t - f.t) / speed) : 0.6).toFixed(4)}`);
  });
  list.push(`file '${path.join(dir, `f${String(frames.length - 1).padStart(5, '0')}.jpg`)}'`);
  fs.writeFileSync(path.join(dir, 'list.txt'), list.join('\n'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'), '-vf', `fps=${fps},format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-movflags', '+faststart', path.join(OUT, '_masters', file + '-master.mp4')]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('video', file, frames.length, 'frames');
}

async function typeSlow(page, text, delay) { for (const ch of text) { await page.keyboard.type(ch); await wait(page, delay + Math.random() * 30); } }

for (const theme of ['dark', 'light']) {
  if (only && only !== theme) continue;
  const { ctx, page } = await openApp({ theme, dpr: 2 });
  await mockGreeting(ctx);
  // 1. new chat, prompt typed into the composer (never sent)
  await prepare(page, theme, null);
  await page.getByText('New chat', { exact: true }).first().click(); await page.waitForTimeout(1800);
  await page.mouse.move(1430, 890);
  await page.screenshot({ path: path.join(OUT, `newchat-${theme}.png`) });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', { playbackRate: 0.4 }); SLOW = 2.5;
  await page.locator('textarea').first().click();
  const rec = await startScreencast(page);
  await wait(page, 700);
  await typeSlow(page, PROMPT, 34);
  await wait(page, 1400);
  const frames = await rec.stop(); SLOW = 1;
  await page.screenshot({ path: path.join(OUT, `typed-${theme}.png`) });
  await encode(frames, `typing-${theme}`);
  await page.locator('textarea').first().fill('');

  // 2. the answered thread (seeded), top of the conversation
  await page.getByText('Reply to rent increase', { exact: true }).first().click(); await page.waitForTimeout(2500);
  await page.mouse.move(760, 420); await page.mouse.wheel(0, -4000); await page.waitForTimeout(900); await page.mouse.move(1430, 890); await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, `answer-${theme}.png`) });

  // 3. privacy pane, freshly verified (shows the current enclave build)
  await page.getByText('Verified', { exact: true }).first().click(); await page.waitForTimeout(3500);
  const tech = page.getByText('Technical details', { exact: true }).first();
  await page.screenshot({ path: path.join(OUT, `privacy-${theme}.png`) });
  if (await tech.count()) { await tech.click(); await page.waitForTimeout(1500); }
  await page.screenshot({ path: path.join(OUT, `privacy-tech-${theme}.png`) });
  await page.getByText('Verified', { exact: true }).first().click().catch(() => {}); await page.waitForTimeout(800);

  // 4. picker open, filtered to private-via-TEE models
  await page.getByTestId('model-select-trigger').first().click(); await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, `picker-${theme}.png`) });
  await page.keyboard.type('private via'); await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, `picker-tee-${theme}.png`) });
  await page.keyboard.press('Escape');
  await ctx.close();
}
