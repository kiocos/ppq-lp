import { openApp, APP } from '../../uniform/tools/app-common.mjs';
const { ctx, page } = await openApp({ theme: 'dark', dpr: 1 });
await page.goto(APP + '/chat', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(6000);
console.log(await page.evaluate(() => [...document.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.width < 12 && r.height < 12 && r.top < 60 && r.left > 1200 && s.backgroundColor !== 'rgba(0, 0, 0, 0)'; }).map(e => e.tagName + ' ' + e.className + ' ' + getComputedStyle(e).backgroundColor + ' parent:' + e.parentElement.tagName + ' ' + (e.parentElement.getAttribute('aria-label') || e.parentElement.className.slice(0, 60)))));
await ctx.close();
