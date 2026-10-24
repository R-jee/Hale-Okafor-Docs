---
title: FAQ
lead: Answers to the questions merchants ask most.
order: 10
---

## My products don't show measurements or an object number

The record appears as its data exists. Fill in `atelier.height`, `atelier.width` and `atelier.depth` for measurements, and `atelier.object_number` (or a SKU, with **Show object numbers** on in Theme settings → Studio). See [Product records](../getting-started/metafields.html).

## Why do all my objects stand at the same height on the shelf?

The shelf uses each product's `atelier.height`. Products without it take a uniform height. Check **Theme settings → Studio → Shelf size range** too.

## Products show "Sold out" in other countries

Shopify sells a product only in countries your shipping reaches. Add those countries (or a "Rest of world" zone) to your shipping profile in **Settings → Shipping and delivery**. See [Markets and currencies](../guides/markets-and-currencies.html).

## Where do bids, offers, holds and commission requests go?

To your store's contact email, through Shopify's contact form. You reply by email and, for bids and holds, update the product's metafields. See [The sale room](../guides/sale-room.html) and [Commissions](../guides/commissions-and-requests.html).

## Some filter values or tags are still in English

Shopify can't translate tags. The theme translates the common values it knows (glazes, clays, forms, finishes). For your own values, use names that read well in every language, or translate product types and metafield values with Translate & Adapt.

## How do I turn off the animations?

**Theme settings → Animations**: turn off **Enable interface animations** or lower **Animation intensity**. Visitors with reduced motion set on their device always see a still page.

## Can I use a different logo in some languages?

Yes: **Theme settings → Logo and favicon → Logos by language**. See [Logos by language](../guides/logos-by-language.html).

## The sale room shows "Bids open" in the header. How do I remove it?

It shows while any lot is open (its `atelier.bidding_closes` is in the future). When every lot closes, the tag goes away.

## Does the theme need any apps?

No. Search & Discovery (free, by Shopify) adds filters and complementary products; Translate & Adapt (free) translates your content. Reviews apps that write Shopify's standard rating metafields work with the Rating block.
