---
title: Collections, filters and the archive
lead: Collections show objects on a shelf at their relative heights, or as a dense catalogue index. Filters work as a ledger, and sold pieces can stay, move to the archive or step aside.
order: 20
---

![A collection on the shelf](../shots/templates/collection.jpg)

## Two views: Shelf and Index

- **Shelf:** each object stands on a shared baseline at its relative real height (from `atelier.height`), so a vase stands taller than a cup. **Theme settings → Studio → Shelf size range** limits how far apart the tallest and smallest may be, so tiny pieces stay visible. Objects without a height take a uniform size.
- **Index:** a catalogue table: thumbnail, number, name, material, measurements, price and status. It suits larger ranges and furniture.

Shoppers switch between them with the **Shelf / Index** toggle; the choice is remembered. Set the default in **Theme settings → Studio → Default view**.

## The series sheet

The [collection banner](../sections/collection-banner.html) opens the page like a catalogue sheet: the series name, its description, the object count, the materials and the height range, read from the collection's products. Add a banner image with the collection's `custom.banner` metafield or its own image.

## Filters

Filters come from Shopify's **Search & Discovery** app (availability, price, product type, vendor, tags, metafields). Hale & Okafor draws them as a ledger: numbered groups (I, II, III), availability as stamps, glazes as tiles in their own colors, price as a slider with presets, counts in the record face. On desktop they sit in a sticky column (or a bar above the results); on phones they open in a full-height drawer with the sort.

Active filters show as chips above the results, each removable, with **Clear all**. When nothing matches, the page says so and offers to remove a filter or show every object.

## The catalogue index (tags)

Products can also carry **index tags** in the form `group:value`: `kind:Teapot`, `material:Ash glaze`, `technique:Carved`, `maker:Rowan Hale`, `year:2026`. Hale & Okafor lists them as extra filter groups (Kind, Materials, Technique, Maker, Year) that link to Shopify's tag URLs (`/collections/all/kind-teapot`), so they work without the Search & Discovery app and without JavaScript. Picking more tags narrows further; picked tags show as chips you can remove.

> Note: Tags can't be translated in Shopify. The theme carries translations for the common values (glazes, clays, forms) in its language files, so the index reads in the visitor's language.

## Sorting

The sort sits in the toolbar (and in the filter drawer on phones), with the sort names translated. On browsers that support it, the list opens as a styled card of choices.

## Sold objects and the archive

**Theme settings → Studio → Sold objects in collections**:

- **Keep in place with a sold stamp**: sold objects stay where they are, greyed, with a Sold stamp.
- **Show only in the archive collection**: sold objects leave the other collections and live in the **Archive collection** you choose (give it the `collection.archive` template).
- **Hide from collections**: sold objects don't show in collections.

The [Archive](../sections/archive.html) section shows sold pieces as a wall of numbered tags on any page, ending with a link to commission something similar.

![The archive](../shots/sections/archive.jpg)
