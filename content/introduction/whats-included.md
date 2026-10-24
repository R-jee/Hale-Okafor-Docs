---
title: What's included
lead: Everything that comes with the theme, in one list: page types, sections, blocks, selling features, languages and the tools for developers.
order: 20
---

## Pages

| Page | Template | What's special |
| --- | --- | --- |
| Home | `index` | The studio: kiln stage opening, film, catalogue contents, firing, shelf, object record, sale room, making log, materials, glaze matcher, archive, maker, release record, journal |
| Product | `product` | The object record, with dimension lines, scale drawing, true size, specification, making log, maker and certificate |
| Sale room lot | `product.lot` | A bid sheet: lot number, estimate, current bid, closing clock and a sealed bid |
| Edition | `product.edition` | For prints and small editions, with the edition ledger |
| Made to order | `product.commission` | Options styled as a work order, with the lead time |
| Collection | `collection` | The shelf (true relative scale) or the index (a catalogue table), with filters as a ledger |
| Archive | `collection.archive` | Sold objects, kept on record, each leading to a commission |
| Collections list | `list-collections` | Every series as a catalogue entry |
| Cart | `cart` | The packing list: parcel weight, handling, dispatch date, order note and discount |
| Search | `search` | Results as index rows with the same filters; never a blank page |
| Journal | `blog`, `article` | Notes from the studio, tagged and translated |
| Studio | `page.studio` | A day at the wheel, the studio placard, the maker, visits |
| Commission | `page.commission` | The work order form |
| Sealed bids | `page.sealed-bids` | How the sale room works |
| Contact | `page.contact` | A contact form styled as a work order |
| Not found | `404` | "Not in the catalogue", with search and objects from the shelf |
| Password | `password` | The studio closed for a firing: an opening card, newsletter sign-up and the password form |
| Gift card | `gift_card.liquid` | The issued card: balance, code with copy, QR code, Apple Wallet and print |

## Sections and blocks

- **Story sections** for the home page and content pages, **five film sections**, **sale room and commission sections**, the header and footer, and the main section of every template. See the [Sections overview](../sections/index.html).
- **Blocks** for the object record (object header, edition state, price, variant picker, buy buttons, stock, delivery estimate, specification, making log, scale drawing, true size, certificate, maker card, reserve, make an offer, lot bid, share, rating, volume pricing, complementary products) and content blocks (heading, text, image, button, group, divider, spacer, custom Liquid). See the [Blocks overview](../blocks/index.html).

## Selling features

- Variant picker with glaze and finish swatches, buttons or dropdowns, including Shopify's native swatches and combined listings
- Quick view and quick add from cards, cart drawer or cart page
- Filters (Search & Discovery), catalogue index tags, sorting, two collection views
- Predictive search with object numbers, series, journal and pages
- Subscriptions (selling plans), gift card recipient form, unit prices, volume pricing and quantity rules (B2B)
- Pickup availability, estimated delivery dates, express checkout buttons
- Complementary products and recommendations, "Often paired with" in the cart
- Sealed bids, reserve a piece, make an offer, commission requests and visit bookings, sent through Shopify's contact form
- Newsletter sign-up, social links, share button, product ratings from review apps

## International

- **Ten languages:** English, French, German, Spanish, Hebrew, Arabic, Urdu, Japanese, Korean and Simplified Chinese, with right-to-left layouts for Hebrew, Arabic and Urdu
- A compact language and country panel, with local currencies and symbols per market
- A logo per language for the header and footer
- Filter values, sort names, dates and tags translated

## For developers

- No framework and no build step: native web components, ES modules and cascade layers
- Every snippet documented with a `{% doc %}` header
- Linting, type checks, unit tests, Playwright end-to-end tests, Lighthouse CI, Theme Check and a size budget
- A seed script that builds the whole demo store (products, metafields, collections, pages, articles, menus, videos, markets, languages and translations) from one catalog file

See [Architecture](../developers/architecture.html).
