---
title: Demo content (seed)
lead: One command builds the whole demo store from a catalog file: definitions, products, metafields, collections, pages, articles, files, films, menus, discounts, markets, languages, translations, checkout branding and the theme.
order: 60
---

The seed lives in the theme repository under `scripts/seed/`. It's for developers and agencies setting up a demo or development store; merchants installing from the Theme Store don't need it.

## Authorise the store

```sh
shopify store auth --store your-store.myshopify.com --scopes write_products,write_inventory,read_locations,write_publications,write_metaobject_definitions,write_metaobjects,write_content,write_files,write_online_store_navigation,write_discounts,write_markets,write_locales,write_translations,write_checkout_branding_settings
```

## Run it

```sh
npm run seed -- --catalog kiln --store your-store.myshopify.com --dry-run   # see what would change
npm run seed -- --catalog kiln --store your-store.myshopify.com             # create what's missing
```

Running it again is safe: it creates what's missing and leaves the rest.

## Options

| Option | Effect |
| --- | --- |
| `--update` | Also rewrites existing products, pages and articles |
| `--only a,b` | Runs only some steps (below) |
| `--locales ja,ko` | Limits the translations step to those languages |
| `--dry-run` | Prints what would change |

## Steps

| Step | What it does |
| --- | --- |
| `definitions` | Metafield and metaobject definitions (see [Product records](../getting-started/metafields.html)) |
| `metaobjects` | Materials, techniques, makers, series, making steps, exhibitions, info panels |
| `products` | Products with photos, options, prices, stock and SKUs |
| `metafields` | The object record for each product |
| `variant-media` | A photo per variant (glazes, finishes) |
| `collections` | Series, the sale room, the archive, made to order |
| `pages`, `articles` | The studio, commission, contact and sealed-bids pages; the journal |
| `files`, `videos` | Images and the films for the five film sections |
| `menus`, `discounts` | The header and footer menus; demo discounts |
| `markets` | Markets with local currencies |
| `languages`, `translations` | The ten languages, published, and the store content translated |
| `branding`, `checkout` | Store branding; checkout and customer account branding (Plus or development store) |
| `theme` | Pushes and publishes the theme with its Hale Okafor preset and the Kiln demo templates |
