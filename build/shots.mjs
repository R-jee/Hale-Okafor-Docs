/**
 * Screenshots for the docs, from the live demo store. Each section is captured in place on the
 * page whose template uses it (found through the template JSON key), at desktop and phone widths,
 * with reduced motion so animated sections show composed. Templates get a top-of-page capture.
 *
 * Env: STORE_URL, STOREFRONT_PASSWORD, THEME_DIR (for Playwright and the templates).
 * Usage: npm run shots [-- only-this-template]
 */
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { THEME_DIR, templates } from './theme.mjs';

const { chromium } = await import(pathToFileURL(join(THEME_DIR, 'node_modules', '@playwright', 'test', 'index.mjs')).href);

const STORE = process.env.STORE_URL || 'https://hale-okafor-zjf5mtr1.myshopify.com';
const PASSWORD = process.env.STOREFRONT_PASSWORD;
const ONLY = process.argv[2];
const OUT = join(process.cwd(), 'shots');
for (const d of ['sections', 'templates']) mkdirSync(join(OUT, d), { recursive: true });

const URLS = {
  index: '/',
  product: '/products/peony-jar',
  'product.lot': '/products/yixing-teapot-with-calligraphy',
  'product.edition': '/products/ash-glaze-bud-vase?view=edition',
  'product.commission': '/products/ash-glaze-bud-vase?view=commission',
  collection: '/collections/tea',
  'collection.archive': '/collections/archive',
  'list-collections': '/collections',
  cart: '/cart',
  search: '/search?q=tea',
  blog: '/blogs/journal',
  article: '/blogs/journal/opening-the-spring-wood-firing',
  'page.contact': '/pages/contact',
  'page.commission': '/pages/commission',
  'page.studio': '/pages/studio',
  'page.sealed-bids': '/pages/sealed-bids',
  404: '/404-nope',
};

const browser = await chromium.launch({ headless: !process.env.HEADED });
const done = new Set();

async function context(viewport, unlocked = true) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce', isMobile: viewport.width < 600, hasTouch: viewport.width < 600 });
  if (unlocked && PASSWORD) {
    const page = await ctx.newPage();
    await page.goto(STORE + '/password');
    await page.locator('summary').first().click().catch(() => {});
    await page.fill('input[type="password"]', PASSWORD).catch(() => {});
    await page.press('input[type="password"]', 'Enter').catch(() => {});
    await page.waitForTimeout(2500);
    await page.close();
  }
  return ctx;
}

/** Scrolls through so lazy images load, then back to the top. */
async function settle(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
  await page.addStyleTag({ content: '.back-to-top, [class*="back-to-top"], #shopify-pc__banner, .shopify-pc__banner__dialog { display: none !important; }' }).catch(() => {});
}

async function shootSection(page, selector, file, maxHeight) {
  const el = page.locator(selector).first();
  if (!(await el.count())) return false;
  const box = await el.boundingBox();
  if (!box || box.height < 20) return false;
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const fresh = await el.boundingBox();
  const scrollY = await page.evaluate(() => scrollY);
  const height = Math.min(fresh.height, maxHeight);
  // Clip from the document so tall sections are cut at a sensible height.
  await page.screenshot({
    path: file,
    type: 'jpeg',
    quality: 74,
    fullPage: true,
    clip: { x: Math.max(fresh.x, 0), y: fresh.y + scrollY, width: Math.min(fresh.width, page.viewportSize().width), height },
  });
  return true;
}

const views = [
  { name: '', viewport: { width: 1440, height: 900 }, maxHeight: 1500 },
  { name: '-mobile', viewport: { width: 390, height: 844 }, maxHeight: 1700 },
];

for (const view of views) {
  const ctx = await context(view.viewport);
  const page = await ctx.newPage();

  // Something in the cart, for the cart template and drawer.
  await page.goto(STORE + '/');
  await page.evaluate(async () => {
    const r = await fetch('/products/peony-jar.js');
    const p = await r.json();
    const v = p.variants.find((x) => x.available) || p.variants[0];
    await fetch('/cart/clear.js', { method: 'POST' });
    await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: v.id, quantity: 1 }) });
  });

  for (const t of templates()) {
    const url = URLS[t.name];
    if (!url || (ONLY && ONLY !== t.name)) continue;
    await page.goto(STORE + url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load').catch(() => {});
    await settle(page);
    if (/verifying your connection|just a moment/i.test(await page.title())) {
      console.log('bot check on', url, '— skipped');
      continue;
    }
    await page.screenshot({ path: join(OUT, 'templates', `${t.name.replace('/', '-')}${view.name}.jpg`), type: 'jpeg', quality: 72 });

    // Shared groups (header, footer, announcement) once, from the home page.
    if (t.name === 'index') {
      for (const [key, type] of [
        ['announcement-bar', 'announcement-bar'],
        ['header', 'header'],
        ['footer', 'footer'],
      ]) {
        const file = join(OUT, 'sections', `${type}${view.name}.jpg`);
        if (await shootSection(page, `[id^="shopify-section-sections--"][id$="__${key}"]`, file, view.maxHeight)) console.log('✓', type + view.name);
      }
    }

    // The sticky header would sit over the top of every capture below it.
    await page.evaluate(() => {
      for (const el of document.querySelectorAll('.shopify-section-group-header-group, .shopify-section-group-header-group *')) {
        const pos = getComputedStyle(el).position;
        if (pos === 'sticky' || pos === 'fixed') el.style.setProperty('position', 'relative', 'important');
      }
    });

    for (const s of t.sections) {
      const id = `${s.type}${view.name}`;
      if (done.has(id) || s.disabled) continue;
      const file = join(OUT, 'sections', `${id}.jpg`);
      if (await shootSection(page, `[id^="shopify-section-template--"][id$="__${s.key}"]`, file, view.maxHeight)) {
        done.add(id);
        console.log('✓', id, 'from', t.name);
      }
    }
  }

  // Cart drawer open, quick view open, search dialog open.
  await page.goto(STORE + '/collections/tea');
  await settle(page);
  const preview = page.locator('quick-add [data-ref="preview"]').first();
  if (await preview.count()) {
    await preview.click({ force: true }).catch(() => {});
    await page.waitForTimeout(2500);
    await page.screenshot({ path: join(OUT, 'sections', `quick-view${view.name}.jpg`), type: 'jpeg', quality: 74 });
    await page.keyboard.press('Escape');
    console.log('✓ quick-view' + view.name);
  }
  const cartLink = page.locator('#cart-icon-bubble').first();
  if (await cartLink.count()) {
    await cartLink.click().catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(OUT, 'sections', `cart-drawer${view.name}.jpg`), type: 'jpeg', quality: 74 });
    await page.keyboard.press('Escape');
    console.log('✓ cart-drawer' + view.name);
  }
  const searchLink = page.getByRole('link', { name: /^search$/i }).first();
  if (await searchLink.count()) {
    await searchLink.click().catch(() => {});
    await page.waitForTimeout(800);
    await page.keyboard.type('tea', { delay: 60 });
    await page.waitForTimeout(2200);
    await page.screenshot({ path: join(OUT, 'sections', `predictive-search${view.name}.jpg`), type: 'jpeg', quality: 74 });
    await page.keyboard.press('Escape');
    console.log('✓ predictive-search' + view.name);
  }
  await ctx.close();

  // The password page, from a visitor who hasn't entered it.
  const locked = await context(view.viewport, false);
  const lp = await locked.newPage();
  await lp.goto(STORE + '/password');
  await lp.waitForTimeout(1500);
  await lp.screenshot({ path: join(OUT, 'templates', `password${view.name}.jpg`), type: 'jpeg', quality: 72 });
  await lp.screenshot({ path: join(OUT, 'sections', `main-password${view.name}.jpg`), type: 'jpeg', quality: 74, fullPage: true });
  await locked.close();
}

await browser.close();
console.log('Shots in', OUT, existsSync(OUT));
