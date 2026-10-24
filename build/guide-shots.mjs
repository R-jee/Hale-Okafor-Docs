/**
 * Extra screenshots for the guides (other languages, right to left). Same env as shots.mjs.
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { THEME_DIR } from './theme.mjs';

const { chromium } = await import(pathToFileURL(join(THEME_DIR, 'node_modules', '@playwright', 'test', 'index.mjs')).href);
const STORE = process.env.STORE_URL || 'https://hale-okafor-zjf5mtr1.myshopify.com';
const OUT = join(process.cwd(), 'shots', 'guides');
mkdirSync(OUT, { recursive: true });

const SHOTS = [
  { file: 'rtl-home', path: '/ar/', viewport: { width: 1440, height: 900 } },
  { file: 'rtl-home-mobile', path: '/ar/', viewport: { width: 390, height: 844 } },
  { file: 'rtl-product', path: '/ar/products/peony-jar', viewport: { width: 1440, height: 900 } },
  { file: 'rtl-collection-mobile', path: '/he/collections/tea', viewport: { width: 390, height: 844 } },
  { file: 'ja-product', path: '/ja/products/iron-teapot', viewport: { width: 1440, height: 900 } },
  { file: 'zh-collection', path: '/zh/collections/tea', viewport: { width: 1440, height: 900 } },
];

const browser = await chromium.launch();
for (const shot of SHOTS) {
  const ctx = await browser.newContext({ viewport: shot.viewport, reducedMotion: 'reduce', isMobile: shot.viewport.width < 600 });
  const page = await ctx.newPage();
  await page.goto(STORE + '/password');
  await page.locator('summary').first().click().catch(() => {});
  await page.fill('input[type="password"]', process.env.STOREFRONT_PASSWORD || '').catch(() => {});
  await page.press('input[type="password"]', 'Enter').catch(() => {});
  await page.waitForTimeout(2000);
  await page.goto(STORE + shot.path);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: join(OUT, `${shot.file}.jpg`), type: 'jpeg', quality: 74 });
  console.log('✓', shot.file);
  await ctx.close();
}
await browser.close();
