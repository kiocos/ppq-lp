import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.join(root, 'unicorn/magma/review');
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch();
const report = [];
try {
  const context = await browser.newContext({ viewport: { width: 1600, height: 760 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => { errors.push(error.message); console.error('PAGE', error.message); });
  page.on('console', message => { if (message.type() === 'error') { errors.push(message.text()); console.error('CONSOLE', message.text()); } });
  page.on('requestfailed', request => console.error('REQUEST', request.url(), request.failure()?.errorText));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'UnicornStudio', {
      configurable: true,
      set(sdk) {
        delete window.UnicornStudio;
        window.UnicornStudio = sdk;
        Object.defineProperty(sdk, 'addScene', {
          configurable: true,
          set(addScene) {
            delete sdk.addScene;
            sdk.addScene = async options => {
              const scene = await addScene.call(sdk, options);
              window.__heroScene = scene;
              return scene;
            };
          }
        });
      }
    });
  });
  await page.goto(pathToFileURL(path.join(root, 'unicorn/magma/art.html')).href);
  await page.waitForFunction(() => window.artScene, null, { timeout: 25000 });
  await page.waitForTimeout(2200);
  const artFirst = await page.screenshot({ path: path.join(out, 'art-01.png') });
  await sharp(artFirst).webp({ quality: 87 }).toFile(path.join(root, 'prometheus/assets/unicorn/magma-poster.webp'));
  await page.waitForTimeout(1800);
  const artSecond = await page.screenshot({ path: path.join(out, 'art-02.png') });
  assert(!artFirst.equals(artSecond), 'Artwork must change over time');
  report.push({ check: 'full-canvas artwork animates', result: 'pass' });

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(pathToFileURL(path.join(root, 'prometheus/r11/prometheus.html')).href);
    await page.waitForFunction(() => document.getElementById('hero-magma')?.dataset.sceneStatus === 'ready');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1600);
    const dimensions = await page.evaluate(() => {
      const hero = document.querySelector('.hero').getBoundingClientRect();
      const canvas = document.querySelector('#hero-magma canvas').getBoundingClientRect();
      return { viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth, heroWidth: hero.width, canvasWidth: canvas.width, heroHeight: hero.height, canvasHeight: canvas.height };
    });
    assert(dimensions.scrollWidth <= width + 1, 'No horizontal overflow');
    assert(Math.abs(dimensions.heroWidth - dimensions.canvasWidth) < 1, 'Canvas covers hero width');
    assert(Math.abs(dimensions.heroHeight - dimensions.canvasHeight) < 1, 'Canvas covers hero height');
    await page.screenshot({ path: path.join(out, `hero-${width}.png`) });
    await page.locator('#chat textarea').fill('Explain private AI');
    assert.equal(await page.locator('#chat textarea').inputValue(), 'Explain private AI');
    await page.locator('#chat .trig').click();
    assert(await page.locator('#chat .pick').isVisible(), 'Model picker remains interactive');
    await page.keyboard.press('Escape');
    await page.locator('#chat textarea').fill('');
    await page.locator('#hero-art-toggle').click();
    assert.equal(await page.evaluate(() => window.__heroScene.paused), true);
    await page.waitForTimeout(200);
    const pausedFirst = await page.locator('#hero-magma').screenshot();
    await page.waitForTimeout(300);
    const pausedSecond = await page.locator('#hero-magma').screenshot();
    assert(pausedFirst.equals(pausedSecond), 'Pause holds the background frame');
    await page.locator('#hero-art-toggle').click();
    assert.equal(await page.evaluate(() => window.__heroScene.paused), false);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => window.__heroScene.paused === true);
    assert.equal(await page.locator('#hero-art-toggle').getAttribute('aria-pressed'), 'true');
    await page.screenshot({ path: path.join(out, `hero-${width}-reduced.png`) });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.evaluate(() => window.scrollTo(0, 1600));
    await page.waitForFunction(() => window.__heroScene.isInView === false);
    report.push({ width, dimensions, composer: 'pass', pause: 'pass', reducedMotion: 'pass', offscreen: 'pass' });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.waitForFunction(() => document.getElementById('hero-magma')?.dataset.sceneStatus === 'ready');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(out, 'reduced-on-load.png') });
  assert.equal(await page.evaluate(() => window.__heroScene.paused), true);
  report.push({ check: 'reduced motion on load', result: 'pass', errors });
  assert.equal(errors.length, 0, errors.join('\n'));
  await context.close();
} finally {
  await browser.close();
  await fs.writeFile(path.join(out, 'validation.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
