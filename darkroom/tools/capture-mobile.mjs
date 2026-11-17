// Phone-size captures of the same flow (the app's own mobile layout), so the portrait hero cut stays readable
import { openApp, APP, seedConversations } from '../../uniform/tools/app-common.mjs';
import { conversations, PROMPT } from './seed-darkroom.mjs';
import { mockGreeting } from './mock-greeting.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('../app-captures');
const W = 400, H = 820, DPR = 3;
const theme = process.argv[2] || 'dark';
let SLOW = 1;
const wait = (p, ms) => p.waitForTimeout(ms * SLOW);
const { ctx, page } = await openApp({ theme, width: W, height: H, dpr: DPR });
await mockGreeting(ctx);
await page.goto(APP + '/chat', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);
await page.evaluate((theme) => { localStorage.setItem('showPrivacyPane', 'false'); localStorage.setItem('theme', theme); try { const p = JSON.parse(localStorage.getItem('ppq-preferences') || '{}'); p.settings = { ...(p.settings || {}), theme }; localStorage.setItem('ppq-preferences', JSON.stringify(p)); } catch {} }, theme);
await seedConversations(page, conversations, null);
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);
await page.addStyleTag({ content: 'button[aria-label="What\'s new"] span.bg-brand{display:none!important}' }).catch(() => {});
const d = page.getByRole('button', { name: 'Dismiss' }); if (await d.count()) await d.first().click().catch(() => {});
await page.screenshot({ path: path.join(OUT, `m-newchat-${theme}.png`) });

const cdp = await ctx.newCDPSession(page);
await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', { playbackRate: 0.4 }); SLOW = 2.5;
await page.locator('textarea').first().click();
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(OUT, `m-focus-${theme}.png`) });
const frames = []; let running = true;
const loop = (async () => { while (running) { const t = Date.now() / 1000; try { const r = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90, optimizeForSpeed: true, clip: { x: 0, y: 0, width: W, height: H, scale: DPR } }); frames.push({ data: r.data, t }); } catch { break; } } })();
await wait(page, 600);
for (const ch of PROMPT) { await page.keyboard.type(ch); await wait(page, 34 + Math.random() * 30); }
await wait(page, 1400);
running = false; await loop; SLOW = 1;
await page.screenshot({ path: path.join(OUT, `m-typed-${theme}.png`) });
const dir = fs.mkdtempSync('/tmp/drm-'); const list = [];
frames.forEach((f, i) => { const n = path.join(dir, `f${String(i).padStart(5, '0')}.jpg`); fs.writeFileSync(n, Buffer.from(f.data, 'base64')); const nx = frames[i + 1]; list.push(`file '${n}'\nduration ${(nx ? Math.max(1 / 60, (nx.t - f.t) / 2.5) : 0.6).toFixed(4)}`); });
list.push(`file '${path.join(dir, `f${String(frames.length - 1).padStart(5, '0')}.jpg`)}'`);
fs.writeFileSync(path.join(dir, 'list.txt'), list.join('\n'));
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'), '-vf', 'fps=30,scale=1200:-2:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-movflags', '+faststart', path.join(OUT, '_masters', `m-typing-${theme}-master.mp4`)]);
fs.rmSync(dir, { recursive: true, force: true });
console.log('video m-typing', theme, frames.length);
await page.locator('textarea').first().fill('');
// open the answered thread from the sidebar drawer
const menu = page.locator('button[aria-label*="sidebar" i], button[aria-label*="menu" i]').first();
if (await menu.count()) { await menu.click(); await page.waitForTimeout(1200); }
await page.getByText('Reply to rent increase', { exact: true }).first().click().catch((e) => console.log('thread click failed', e.message));
await page.waitForTimeout(2500);
await page.mouse.move(200, 400); await page.mouse.wheel(0, -4000); await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, `m-answer-${theme}.png`) });
await page.mouse.wheel(0, 500); await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, `m-answer2-${theme}.png`) });
await ctx.close();
