// Lists every distinct text style on a page (size/weight/line-height/colour) with sample text and count.
// Usage: node typeaudit.mjs <file> [width]
import { chromium } from 'playwright';
const [file, w = 1440] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto('file://' + new URL(file, 'file://' + process.cwd() + '/').pathname); await p.waitForTimeout(1000);
const rows = await p.evaluate(() => {
  const m = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode.textContent.trim(); if (!t) continue;
    const el = walker.currentNode.parentElement; if (el.closest('.pair, script, style, [hidden]')) continue;
    const r = el.getBoundingClientRect(); if (!r.width) continue;
    const cs = getComputedStyle(el);
    const sec = el.closest('section, header, footer'); const where = sec ? (sec.id || sec.className.split(' ')[0] || sec.tagName) : '-';
    const k = `${parseFloat(cs.fontSize).toFixed(1)}px w${cs.fontWeight} lh${cs.lineHeight} ${cs.fontFamily.split(',')[0]} ${cs.color}`;
    const e = m.get(k) || { n: 0, s: new Set() }; e.n++; if (e.s.size < 4) e.s.add(`${where}:${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} "${t.slice(0, 28)}"`); m.set(k, e);
  }
  return [...m].map(([k, e]) => [k, e.n, [...e.s].join(' | ')]).sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
});
for (const [k, n, s] of rows) console.log(k.padEnd(70), String(n).padStart(3), ' ', s);
await b.close();
