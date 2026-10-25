# Hale Okafor theme documentation

The documentation site for **Hale Okafor**, a Shopify theme for makers of one-of-a-kind and small-batch objects. Published with GitHub Pages from `docs/`.

**Read it:** https://r-jee.github.io/Hale-Okafor-Docs/ · **Demo store:** https://hale-okafor-zjf5mtr1.myshopify.com

## How it's made

- `content/` holds the hand-written pages (Markdown with a small front matter block): introduction, getting started, guides, developers and support.
- `build/theme.mjs` reads the theme repository (section and block schemas, the English schema locale, snippet `{% doc %}` headers, templates, assets, metafield definitions) so the reference pages always match the code.
- `build/shots.mjs` and `build/guide-shots.mjs` take the screenshots from the demo store: every section in place, at desktop and phone widths.
- `build/build.mjs` writes the static site into `docs/`.

## Rebuild

```sh
# from this folder, with the theme checked out next to it (../shopify-theme-solenne) or THEME_DIR set
STOREFRONT_PASSWORD=… npm run shots      # optional: refresh screenshots from the demo store
npm run build                            # regenerate docs/
npm run serve                            # preview on http://localhost:4173
```

Commit `docs/` and push; GitHub Pages serves it from the `main` branch, `/docs` folder.
