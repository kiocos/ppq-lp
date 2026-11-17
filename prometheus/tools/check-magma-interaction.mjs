import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.join(root, 'unicorn/magma/review');
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
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
  await page.goto(pathToFileURL(path.join(root, 'prometheus/r11/prometheus.html')).href);
  await page.waitForFunction(() => document.getElementById('hero-magma')?.dataset.sceneStatus === 'ready');
  await page.evaluate(() => window.__heroScene.setVariables({ Motion: false }));
  await page.mouse.move(200, 220);
  await page.waitForTimeout(1500);
  const left = await page.evaluate(() => window.__heroScene.getMouse());
  const before = await page.locator('#hero-magma').screenshot();
  await page.mouse.move(1100, 280);
  await page.waitForTimeout(1500);
  const right = await page.evaluate(() => window.__heroScene.getMouse());
  const after = await page.locator('#hero-magma').screenshot();
  assert(right.x > left.x + 0.4, 'Pointer is tracked behind the HTML');
  assert(!before.equals(after), 'Pointer changes the artwork while ambient flow is paused');
  const preview = await page.evaluate(() => {
    const hero = document.querySelector('.hero').cloneNode(true);
    hero.querySelector('#hero-magma').replaceChildren();
    hero.querySelector('#hero-magma').classList.remove('is-ready');
    delete hero.querySelector('#hero-magma').dataset.sceneStatus;
    hero.querySelector('#hero-art-toggle').hidden = true;
    return {
      styles: [...document.querySelectorAll('style')].map(style => style.textContent).join('\n'),
      nav: document.querySelector('.nav').outerHTML,
      hero: hero.outerHTML,
      icons: [...document.querySelectorAll('body > svg')].map(svg => svg.outerHTML).join('\n')
    };
  });
  await fs.writeFile(path.join(out, 'hero-markup.json'), JSON.stringify(preview));
  await page.route('https://storage.googleapis.com/unicornstudio-production/**', route => route.abort());
  await page.reload();
  await page.waitForFunction(() => document.getElementById('hero-magma')?.dataset.sceneStatus === 'fallback');
  assert.equal(await page.locator('#hero-art-toggle').isVisible(), false);
  const background = await page.locator('#hero-magma').evaluate(element => getComputedStyle(element, '::before').backgroundImage);
  assert(background.includes('magma-poster.webp'));
  await page.locator('#chat textarea').fill('The chat remains usable');
  await page.screenshot({ path: path.join(out, 'fallback-1440.png') });
  await fs.writeFile(path.join(out, 'interaction.json'), JSON.stringify({ mouse: { left, right, visualChange: true }, fallback: 'pass' }, null, 2));
  console.log('Mouse response and network fallback passed');
} finally {
  await browser.close();
}
