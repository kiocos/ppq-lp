// Phone answer still without the transient scroll buttons (round 3 fix)
import { openApp, APP, seedConversations } from '../../uniform/tools/app-common.mjs';
import { conversations } from './seed-darkroom.mjs';
import path from 'node:path';
const OUT = path.resolve('../app-captures');
const { ctx, page } = await openApp({ theme: 'dark', width: 400, height: 820, dpr: 3 });
await page.goto(APP + '/chat', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(4000);
await page.evaluate(() => { localStorage.setItem('showPrivacyPane', 'false'); localStorage.setItem('theme', 'dark'); });
await seedConversations(page, conversations, 'c-rent');
await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(7000);
await page.addStyleTag({ content: 'button[aria-label="What\'s new"] span.bg-brand{display:none!important}' }).catch(() => {});
const menu = page.locator('button[aria-label*="sidebar" i], button[aria-label*="menu" i]').first();
if (!(await page.getByText('Here’s a draft', { exact: false }).count()) && !(await page.getByText("Here's a draft", { exact: false }).count())) {
  if (await menu.count()) { await menu.click(); await page.waitForTimeout(1200); }
  await page.getByText('Reply to rent increase', { exact: true }).first().click(); await page.waitForTimeout(2500);
}
// scroll the thread to the top programmatically, then wait for any floating controls to settle
await page.evaluate(() => { for (const el of document.querySelectorAll('*')) { if (el.scrollHeight > el.clientHeight + 40 && getComputedStyle(el).overflowY.match(/auto|scroll/)) el.scrollTop = 0; } });
await page.mouse.move(399, 2); await page.waitForTimeout(4500);
const info = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => { const r = b.getBoundingClientRect(); return r.top > 560 && r.top < 680 && r.width < 60; }).map((b) => (b.getAttribute('aria-label') || b.className.slice(0, 50))));
console.log('buttons near composer:', info);
await page.addStyleTag({ content: 'button[aria-label*="Scroll to" i]{opacity:0!important}' }).catch(() => {});
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, 'm-answer-dark.png') });
await ctx.close();
