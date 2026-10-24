---
title: The sale room (sealed bids)
lead: Offer special or antique pieces as lots, by sealed bid. Shoppers see the estimate, the current bid and a closing clock, and send a bid to the studio. No auction app needed.
order: 30
---

![The sale room on the home page](../shots/sections/sale-room.jpg)

## How it works

1. A **lot** is an ordinary product using the `product.lot` template, with lot metafields: `atelier.lot_number`, `atelier.period`, `atelier.provenance`, `atelier.estimate_low`, `atelier.estimate_high`, `atelier.opening_bid`, `atelier.bid_increment` and `atelier.bidding_closes` (a date and time).
2. On the lot's page, the [Lot bid](../blocks/lot-bid.html) block shows the bid sheet: lot number and period, estimate, current bid and the number of bids, a ticking clock, and a sealed-bid form.
3. A bid is sent to the studio through **Shopify's contact form**, so it arrives at your store's contact email. It works without JavaScript.
4. You confirm bids by email and update the lot's `atelier.current_bid` and `atelier.bid_count`. The sale room and the lot page show the new figures.
5. When `atelier.bidding_closes` passes, the sheet shows the result ("Sold for $960" or "Bidding closed") instead of the form.

> Good to know: A Shopify theme has no server of its own, so bids aren't placed automatically. Keeping the decision with the studio is deliberate: a maker chooses who a piece goes to.

## The pieces

- [Sale room](../sections/sale-room.html) section: the featured lot in an arched gilt plate with its lot tag, then the rest of the sale as a catalogue index with the time left on each.
- The `product.lot` template and the [Lot bid](../blocks/lot-bid.html) block.
- The `page.sealed-bids` template: a page explaining how bidding works, linked from the sale room.
- The header shows a **Bids open** tag beside the sale room link while lots are open.

![A lot page](../shots/templates/product.lot.jpg)

## Setting up a lot

1. Create the product with its photos and description. Set inventory to 1.
2. Under **Theme template**, choose `product.lot`.
3. Fill in the lot metafields (see [Product records](../getting-started/metafields.html#mf-product)).
4. Add it to your sale room collection and pick that collection in the Sale room section.
