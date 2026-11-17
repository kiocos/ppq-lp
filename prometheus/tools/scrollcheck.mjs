// Regression checks for ordinary document scrolling and continuous privacy animation
// Run from any directory with node prometheus/tools/scrollcheck.mjs
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const url = new URL('../r10/prometheus.html', import.meta.url).href;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
const frame = (page) => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const position = (page) => page.evaluate(() => scrollY);

async function load(page) {
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.__enclave3d);
}

async function at(page, selector) {
  await page.locator(selector).first().evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const story = element.closest('.en-story');
    const stacked = story && getComputedStyle(story.querySelector('.story-layout')).display === 'flex';
    const visualHeight = stacked ? story.querySelector('.story-visual').offsetHeight : 0;
    const line = stacked ? 64 + visualHeight + Math.max(80, (innerHeight - 64 - visualHeight) / 2) : 64 + (innerHeight - 64) / 2;
    scrollTo({ top: rect.top + scrollY + rect.height / 2 - line, behavior: 'instant' });
  });
  await frame(page);
}

try {
  let context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  let page = await context.newPage();
  await load(page);
  assert.equal(await page.locator('.story-nav, .story-track, .story-stop').count(), 0);
  assert.equal(await page.locator('.story-step[inert], .story-step[aria-hidden="true"]').count(), 0);
  await page.mouse.move(10, 350);
  for (const id of ['en-story', 'ax-story']) {
    const copy = page.locator(`#${id} .story-step`).first();
    await at(page, `#${id} .story-step` + ':first-child');
    for (const delta of [80, 80, 240, -80, 600, -240]) {
      const before = await position(page), copyTop = (await copy.boundingBox()).y;
      await page.mouse.wheel(0, delta);
      await page.waitForFunction(([before, delta]) => Math.abs(scrollY - before - delta) <= 2, [before, delta]);
      await frame(page);
      assert.ok(Math.abs((await copy.boundingBox()).y - copyTop + delta) <= 2, `${id}: text was pinned instead of scrolling`);
      const after = await position(page);
      await page.waitForTimeout(300);
      assert.ok(Math.abs(await position(page) - after) <= 1, `${id}: page moved after input stopped`);
    }
    console.log(`PASS ${id}: native wheel distance, scrolling text and no drift`);
  }

  await at(page, '#en-story .story-step:nth-child(2)');
  const camera = [];
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => scrollBy({ top: 40, behavior: 'instant' }));
    await frame(page);
    camera.push(await page.evaluate(() => window.__enclave3d.progress));
  }
  for (let i = 1; i < camera.length; i++) {
    assert.ok(camera[i] > camera[i - 1] && camera[i] - camera[i - 1] < .2, `Camera jumped or held a chapter: ${camera}`);
  }
  const rested = camera.at(-1);
  await page.waitForTimeout(300);
  assert.ok(Math.abs(await page.evaluate(() => window.__enclave3d.progress) - rested) < .01);
  console.log('PASS continuous camera motion, without chapter holds or trailing movement');

  for (const [width, height] of [[1440, 900], [768, 1024], [390, 844], [320, 568], [844, 390], [568, 320]]) {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    await frame(page);
    const layout = await page.evaluate(() => {
      const roots = [...document.querySelectorAll('.story')];
      const copies = [...document.querySelectorAll('.story-step')];
      return {
        visible: copies.every((copy) => getComputedStyle(copy).opacity === '1' && getComputedStyle(copy).visibility === 'visible'),
        ordered: roots.every((root) => {
          const positions = [...root.querySelectorAll('.story-step')].map((step) => step.getBoundingClientRect());
          return positions.every((rect, i) => !i || rect.top >= positions[i - 1].bottom);
        }),
        overlap: [...document.querySelectorAll('.story-row')].some((row) => {
          const a = row.querySelector('.story-copy').getBoundingClientRect(), b = row.querySelector('.story-visual').getBoundingClientRect();
          return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        }),
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    assert.ok(layout.visible && layout.ordered && !layout.overlap && !layout.overflow, `${width}×${height}: ${JSON.stringify(layout)}`);
    await at(page, '#ax-story .story-row:nth-child(2)');
    if (width === 1440 || width === 390) await page.screenshot({ path: `/tmp/ppq-natural-scroll/api-${width}.png` });
    await at(page, '#en-story .story-step:nth-child(3)');
    if (width === 1440 || width === 390) await page.screenshot({ path: `/tmp/ppq-natural-scroll/privacy-${width}.png` });
    console.log(`PASS ${width}×${height}: all copy in document flow, API rows and no overflow`);
  }
  await context.close();

  context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  page = await context.newPage();
  await load(page);
  const cdp = await context.newCDPSession(page);
  for (const selector of ['#en-story .story-step:nth-child(2)', '#ax-story .story-row:nth-child(2)']) {
    await at(page, selector);
    for (const distance of [-120, 120]) {
      const before = await position(page);
      await cdp.send('Input.synthesizeScrollGesture', { x: 10, y: 600, yDistance: distance, gestureSourceType: 'touch', speed: 300, preventFling: true });
      await frame(page);
      const after = await position(page), delta = after - before;
      assert.ok(Math.sign(delta) === -Math.sign(distance) && Math.abs(delta) >= 90 && Math.abs(delta) <= 125, `${selector}: touch ${distance} moved ${delta}`);
      await page.waitForTimeout(300);
      assert.ok(Math.abs(await position(page) - after) <= 2, 'Page moved after touch release');
    }
  }
  await at(page, '.ax-scene[data-scene="store"]');
  const bubble = page.locator('.ax-cust');
  await bubble.waitFor({ state: 'visible' });
  const box = await bubble.boundingBox(), before = await position(page);
  await cdp.send('Input.synthesizeScrollGesture', { x: box.x + box.width / 2, y: box.y + box.height / 2, yDistance: -120, gestureSourceType: 'touch', speed: 300, preventFling: true });
  await frame(page);
  assert.ok(await position(page) - before >= 90, 'Interactive lens trapped scrolling');
  await cdp.detach();
  await context.close();
  assert.deepEqual(errors, []);
  console.log('PASS touch in both directions and over the interactive lens; no page errors');
} finally {
  await browser.close();
}
