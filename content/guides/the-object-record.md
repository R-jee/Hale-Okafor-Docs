---
title: The object record (product page)
lead: The product page presents each piece as a catalogue record: the plate on one side, the record on the other, with its size drawn, its story dated and its state stated plainly.
order: 10
---

![The object record on desktop](../shots/templates/product.jpg)

## The layout

- **The plate (left):** the photographs, with **dimension lines** drawn around the first image from the object's height and width (`H 18 cm`, `W 9 cm`), plate numbers (`Pl. 1`, `Pl. 2`) and a contact-sheet strip of thumbnails. Zoom opens a full-screen viewer; video and 3D models play in place.
- **The record (right):** the object number, the name, the wall label (material · year · maker), the price, the edition state, the buy buttons and then the ledger, drawers and log.

On phones the plate comes first and swipes; the record follows in one column.

## The blocks, in the demo order

Each piece is a block in the [Product information](../sections/main-product.html) section, so you can reorder or remove any of them in the theme editor.

| Block | What it shows |
| --- | --- |
| [Object header](../blocks/object-header.html) | Number, name (the page's heading), the wall label line and its note |
| [Price](../blocks/price.html) | Price, sale price, unit price, subscription price, tax and shipping note, Shop Pay Installments |
| [Edition state](../blocks/edition-state.html) | "1 of 1", "Edition of 12, 4 remain", "Made to order, ships in 6 weeks", or the Sold stamp |
| [Stock signal](../blocks/stock-signal.html) | A lamp: in stock, only a few left, sold out |
| [Variant picker](../blocks/variant-picker.html) | The Studio picker: glazes as glazed test tiles, sizes drawn to scale, other options as a ledger; or buttons, swatches or dropdowns |
| [Buy buttons](../blocks/buy-buttons.html) | Quantity, subscriptions, gift card recipient, add to cart, express checkout, pickup availability |
| [Reserve a piece](../blocks/reserve-piece.html) | Ask the studio to hold a one-of-a-kind piece (48 hours by default) |
| [Make an offer](../blocks/make-offer.html) | Propose a price, starting from a share of the asking price |
| [True size](../blocks/true-scale.html) | The object at its real height on the visitor's screen, calibrated with a bank card |
| [Certificate](../blocks/certificate.html) | A certificate of authenticity to print or save as a PDF |
| [Collapsible tab](../blocks/collapsible-tab.html) / [Info drawer](../blocks/info-drawer.html) | Per-product content (care, shipping, size guide), inline or in a side drawer |
| [Specification](../blocks/specification.html) | The ledger: number, measurements, weight, materials, technique, finish, year, maker, origin, care |
| [Making log](../blocks/making-log.html) | The dated steps of making the piece |
| [Scale drawing](../blocks/scale-drawing.html) | The object drawn beside a coin, a hand, an A4 sheet, a chair or a person |
| [Maker card](../blocks/maker-card.html) | Portrait, name, where they work and a short biography |
| [Delivery estimate](../blocks/delivery-estimate.html) | Estimated delivery dates from Theme settings → Shipping and delivery |
| [Complementary products](../blocks/complementary-products.html) | "Pairs well with", from the Search & Discovery app |
| [Share](../blocks/share.html), [Rating](../blocks/rating.html), [Volume pricing](../blocks/volume-pricing.html) | Sharing, review stars, B2B price breaks |

## Size, three ways

Handmade objects are returned most often because they're a different size than expected. Hale & Okafor shows size three ways:

1. **Dimension lines** on the first photograph (Theme settings → Studio → Dimension lines).
2. **The scale drawing**: the object, as its cut-out (`atelier.scale_image`) or as an outline, beside a reference everyone knows. The reference is picked by size (a coin for tiny pieces, a hand under 30 cm, a chair under 120 cm, a person above) or set per block.
3. **True size**: the visitor holds a bank card to the screen once to calibrate, then sees the object at its real height beside a centimetre rule.

![The scale drawing and true size](../shots/sections/object-record.jpg)

## When a piece sells

Out of stock (or tagged with the Sold tag) the record keeps everything, adds a **Sold** stamp, swaps the buy button for **Commission something similar** (linking to the commission page with the object number filled in) and, depending on Theme settings → Studio → Sold objects, stays in its collections stamped, moves to the archive, or is hidden from collections.

## Alternate templates

| Template | Use it for |
| --- | --- |
| `product.lot` | Sale room lots: the [Lot bid](../blocks/lot-bid.html) sheet replaces the buy buttons. See [The sale room](sale-room.html). |
| `product.edition` | Prints and small editions, with the edition ledger. |
| `product.commission` | Made-to-order pieces, with the options as a work order and the lead time. |

Choose one in the product's admin page under **Theme template**.

![A sale room lot](../shots/templates/product.lot.jpg)
