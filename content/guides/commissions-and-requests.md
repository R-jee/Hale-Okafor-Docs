---
title: Commissions, holds, offers and visits
lead: Ways to buy that suit handmade work: commission a piece, ask the studio to hold one, make an offer or book a visit. Each is a short form sent to the studio through Shopify's contact form.
order: 40
---

All of these use Shopify's own contact form, so requests reach your store's email, work without JavaScript and need no app. Each form lists its errors at the top and links them to the fields.

## Commissions

![The commission page](../shots/templates/page.commission.jpg)

The [Commission form](../sections/commission-form.html) is a work order: the object it starts from, the kind of piece, its size, a budget and timing, then name, email and a brief.

- Sold and made-to-order pieces link to the commission page with `?object=0142`, so the form already knows which object the shopper means.
- Set the page in **Theme settings → Studio → Commission page**. The demo uses a page with the `page.commission` template.
- **Kinds of piece**, **Budget bands** and **Topics** are lists you edit in the section's settings, separated by commas (a figure like "1,000" stays whole).
- Set **Form** to **Contact: a message** for a plain contact form (name, email, phone, topic and message), as on the `page.contact` template.

## Reserve a piece

The [Reserve a piece](../blocks/reserve-piece.html) block lets a shopper ask you to hold a one-of-a-kind piece (48 hours by default; set **Hold for** in the block). When you agree, set the product's `atelier.reserved_until`: until then the block shows who it's held for, the buy buttons won't add it, and other shoppers can ask to be told if it comes free.

## Make an offer

The [Make an offer](../blocks/make-offer.html) block opens into a short form: an amount, which starts at a share of the price you choose (**Lowest offer**), and a note. You reply by email.

## Studio visits

The [Visit booking](../sections/visit-booking.html) section shows the next days as cards (closed days marked), then a time, the number of visitors and their details. You confirm by email.

![Visit booking on the studio page](../shots/sections/visit-booking.jpg)
