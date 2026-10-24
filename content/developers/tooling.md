---
title: Tooling and checks
lead: The commands that keep the theme correct: formatting, linting, types, unit and end-to-end tests, Theme Check, the size budget and Lighthouse.
order: 20
---

## Setup

```sh
npm install
shopify theme dev --store your-store.myshopify.com   # local preview with hot reload
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run verify` | Everything below that runs locally, in order: format check, lint, typecheck, unit tests, budget, Theme Check |
| `npm run format` / `format:check` | Prettier for Liquid, JSON, CSS and JS |
| `npm run lint` | ESLint, Stylelint and the theme's own conventions (`scripts/lint-theme.js`: layers, orphaned assets, doc headers) |
| `npm run typecheck` | TypeScript over the JSDoc-typed JavaScript |
| `npm test` | Vitest unit tests: locales match English, settings, contrast of every color scheme, snippets |
| `npm run test:e2e` | Playwright against a store (`STORE_URL`, `STOREFRONT_PASSWORD`), desktop and mobile, including axe accessibility checks |
| `npm run check` | `shopify theme check --fail-level warning` |
| `npm run budget` | The CSS and JavaScript size budget |
| `npm run lhci` | Lighthouse CI on mobile (performance, accessibility, best practices, SEO) |
| `npm run scan` | Checks that no other theme's name is left in the code |

## End-to-end tests

```sh
STORE_URL=https://your-store.myshopify.com STOREFRONT_PASSWORD=… npm run test:e2e
```

- `E2E_WORKERS` sets parallel workers (2 by default; stores throttle bursts).
- `E2E_HEADED=1` runs a visible browser. myshopify.com may show a bot check to headless browsers; tests that meet it are skipped rather than failed.

## Conventions

- Every snippet starts with a `{% doc %}` header with `@param` and `@example`.
- Every section starts with a comment saying what it is and how it behaves.
- Component stylesheets are wrapped in `@layer components`, section stylesheets in `@layer sections`.
- Strings shoppers read go in `locales/`; settings labels in `locales/en.default.schema.json`.
- Commit messages say what changed for a merchant or shopper.
