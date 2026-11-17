import { openApp, APP, seedConversations } from './app-common.mjs';
import { conversations, ids } from './seed-data.mjs';
const { ctx, page } = await openApp({ dpr: 1 });
await page.goto(APP + '/chat', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await seedConversations(page, conversations, ids.code);
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
// dismiss the PII announcement if present
const x = page.locator('button[aria-label*="ismiss" i], button[aria-label*="close" i]').filter({ hasNot: page.locator('nav') });
console.log('close buttons', await x.count());
await page.screenshot({ path: '../app-captures/_scratch/t-conv.png' });
await ctx.close();
