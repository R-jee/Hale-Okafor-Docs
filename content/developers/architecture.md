---
title: Architecture
lead: How Hale Okafor is put together: server-rendered Liquid, native web components, cascade-layered CSS and a strict size budget. No framework, no build step.
order: 10
---

## Principles

1. **HTML comes from Liquid, every time.** No client-side templating or routing. When something changes (a variant, a filter, the cart), the theme asks Shopify for the new HTML through the **Section Rendering API** and morphs it into the page.
2. **Works without JavaScript.** Forms are real forms (cart, filters, sort, search, contact, bids, commissions); links are real links. JavaScript improves them in place.
3. **Load only what's on the page.** Each section links its own stylesheet; components load when their element is visible or used.
4. **Accessible first.** WCAG 2.2 AA: landmarks, headings, focus handling, announcements, reduced motion.
5. **Merchant control.** Anything a merchant would reasonably change is a setting, translated into every language.

## Folder layout

| Folder | Holds |
| --- | --- |
| `layout/` | `theme.liquid` (every page) and `password.liquid` |
| `templates/` | JSON templates per page type, plus alternates (`product.lot`, `product.edition`, `product.commission`, `collection.archive`, `page.studio`…) and `gift_card.liquid` |
| `sections/` | Sections with their schema; `*-group.json` for the header, footer and overlay groups |
| `blocks/` | Theme blocks. Names starting with `_` are private to the sections that use them (footer columns) |
| `snippets/` | Reusable Liquid, each with a `{% doc %}` header ([reference](snippets.html)) |
| `assets/` | `core-*.js` (engine), `component-*.js` and `section-*.js`, `base.css`, `component-*.css`, `section-*.css`, `utility-*.css` (deferred), icons and images |
| `config/` | `settings_schema.json` (theme settings) and `settings_data.json` (the Hale Okafor preset's values) |
| `locales/` | Storefront strings in ten languages and the English schema strings |

## Rendering and data flow

- **Sections** render server-side. A section's `{% schema %}` defines its settings and blocks; its stylesheet is linked at the top of the file.
- **Object data** comes from metafields and metaobjects through snippets such as `object-number`, `dimensions`, `object-state` and `wall-label`, so every template reads the record the same way.
- **Updates** (variant change, filters, cart) fetch `?section_id=` or `sections=` HTML and morph it in (`core-utils.js` → `morph`), keeping focus and scroll.
- **Standard events**: the theme dispatches Shopify's standard storefront events (product view and variant select, cart updates, collection and search updates) and supports `Shopify.actions` so apps can open and refresh the cart.

## JavaScript

- **Core** (every page, small): `core-component.js` (a `Component` base class and `defineElement`), `core-fetch.js` (cart and section requests), `core-a11y.js` (focus trap, announcer), `core-hydrate.js` (lazy loading), `core-utils.js` (money, morph, debounce), `core-config.js` (settings and translations for scripts), `core-events.js` and `core-standard-events.js` (the theme's and Shopify's standard events), `core-motion.js` (reveals and motion settings).
- **Hydration**: an element with `data-hydrate="visible|idle|interaction"` and `data-module="…js"` loads its module only when needed. A button pressed before its module has loaded is pressed again once it has.
- **Components** are custom elements (`<product-info>`, `<facet-filters>`, `<cart-drawer>`, `<quick-add>`, `<film-stage>`, `<kiln-stage>`…). See [JavaScript components](javascript.html).

## CSS

- **Cascade layers:** `reset, base, components, sections, utilities`. `component-*` files live in `@layer components`, `section-*` files in `@layer sections`, so specificity never fights.
- **Tokens** come from `snippets/theme-tokens.liquid`: color schemes as `.color-scheme-N` classes, type scale, spacing, motion, and the record tokens (hairlines, dimension ticks).
- **Logical properties** throughout (`margin-inline-start`, `inset-inline`), so right-to-left layouts mirror without overrides; physical transforms carry `:dir(rtl)` mirrors.
- See [Stylesheets](stylesheets.html).

## Budgets

`npm run budget` fails the build if the CSS or JavaScript loaded on every page, or on a template, grows past its limit. Theme Check also enforces Shopify's limits (for example, no single script over 10 KB).
