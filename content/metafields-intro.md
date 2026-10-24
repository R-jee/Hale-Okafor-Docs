Every part of the record is optional. A product with no metafields still shows as a normal product; each piece of the record appears as soon as its data exists.

## How the record is built

| What shoppers see | Where it comes from |
| --- | --- |
| Object number (`No. 0101`) | `atelier.object_number`, or the prefix from Theme settings → Studio plus the first variant's SKU |
| Measurements and dimension lines | `atelier.height`, `atelier.width`, `atelier.depth` (dimension metafields) |
| Weight | The variant's shipping weight |
| The wall label's note | `atelier.label_note` |
| Edition state ("1 of 1", "Edition of 12, 4 remain") | `atelier.edition_size` and inventory |
| Made to order, ships in 6 weeks | `atelier.lead_time_days` |
| Materials and technique | `atelier.materials` and `atelier.technique` (lists of material and technique metaobjects) |
| Finish, year, origin and care | `atelier.finish`, `atelier.year`, `atelier.origin`, `atelier.care` |
| Fragile handling in the packing list | `atelier.fragile` |
| Making log | `atelier.making_log` (a list of making step metaobjects: date, step, note, photo) |
| The maker card | `atelier.maker` (a maker metaobject) |
| Series ("From the same series") | `atelier.series` (a series metaobject) |
| Scale drawing cut-out | `atelier.scale_image` (a transparent image of the object) |
| Reserved for someone | `atelier.reserved_until` |
| Sold stamp and archive | Out of stock, or the Sold tag from Theme settings → Studio |
| Sale room lot | `atelier.lot_number`, `atelier.period`, `atelier.provenance`, `atelier.estimate_low`, `atelier.estimate_high`, `atelier.opening_bid`, `atelier.current_bid`, `atelier.bid_count`, `atelier.bid_increment`, `atelier.bidding_closes` |
| Complementary products, size guide | `custom.complementary`, `custom.size_guide` (an info panel metaobject) |
| Collection banner image | `custom.banner` on the collection |

## Filling in a product

1. Open the product in **Products**, scroll to **Metafields** and fill in the fields. Measurements take a value and a unit; the theme converts to your chosen units.
2. For materials, technique, the maker and the series, pick entries you've created in **Content → Metaobjects**.
3. For the making log, add **Making step** entries (date, step, note, optional photo) and pick them in order.

> Tip: Store the object number as the variant SKU as well. Shopify's search then finds `0142` and takes the shopper straight to the object.

The full list of definitions follows. Create them in **Settings → Custom data** with exactly these namespaces, keys and types.
