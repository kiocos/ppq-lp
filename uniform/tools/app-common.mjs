// Shared setup for driving the local PPQ chat app: persistent guest profile, clean chrome, staged balance
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const APP = 'http://localhost:3000';
export const PROFILE = path.join(here, '.chrome-profile');

export async function openApp({ theme = 'dark', width = 1440, height = 900, dpr = 2, balance = '18.42' } = {}) {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    viewport: { width, height }, deviceScaleFactor: dpr, colorScheme: theme,
  });
  // Hide dev-only overlays so captures look like production
  await ctx.addInitScript(() => {
    const css = 'nextjs-portal,[data-nextjs-toast],#__next-build-watcher{display:none!important}';
    const add = () => { const s = document.createElement('style'); s.textContent = css; document.documentElement.appendChild(s); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
  });
  // Staged balance so the guest session does not read $0.00
  await ctx.route('**/api/payments/account/*/credit', async (route) => {
    const res = await route.fetch();
    let body = await res.json().catch(() => ({}));
    const rec = body.creditRecord || {};
    for (const k of ['balance', 'amount', 'amount_usd']) rec[k] = Number(balance);
    body.creditRecord = rec;
    await route.fulfill({ response: res, json: body });
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  return { ctx, page };
}

export async function setTheme(page, theme) {
  await page.evaluate((t) => {
    try { localStorage.setItem('theme', t); } catch {}
    document.documentElement.classList.toggle('dark', t === 'dark');
    document.documentElement.classList.toggle('light', t === 'light');
    document.documentElement.style.colorScheme = t;
  }, theme);
}

export async function seedConversations(page, conversations, selectedId) {
  await page.evaluate(async ({ conversations, selectedId }) => {
    const db = await new Promise((resolve, reject) => {
      const r = indexedDB.open('ppq-conversations-db', 2);
      r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
      r.onupgradeneeded = () => reject(new Error('db not initialised by app yet'));
    });
    const tx = db.transaction(['conversations', 'app_state'], 'readwrite');
    const store = tx.objectStore('conversations');
    await new Promise((res) => { const c = store.clear(); c.onsuccess = res; });
    for (const c of conversations) {
      store.put({ ...c, created_at: new Date(c.created_at), updated_at: new Date(c.updated_at) });
    }
    tx.objectStore('app_state').put({ key: 'selectedConversationId', value: selectedId });
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
    db.close();
  }, { conversations, selectedId });
}

// High quality recording: a device-pixel screenshot loop (DevTools screencast only yields CSS-pixel frames)
export async function startScreencast(page, { quality = 90 } = {}) {
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  let running = true;
  const loop = (async () => {
    while (running) {
      const t = Date.now() / 1000;
      try {
        const r = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality, optimizeForSpeed: true, clip: { x: 0, y: 0, width: 1440, height: 900, scale: 2 } });
        frames.push({ data: r.data, t });
      } catch { break; }
    }
  })();
  return {
    async stop() { running = false; await loop; await cdp.detach().catch(() => {}); return frames; },
  };
}
