---
title: Motion, accessibility and speed
lead: Movement in Hale Okafor is scroll-driven and calm; it switches off for anyone who asks. The theme is built to WCAG 2.2 AA and keeps its pages light.
order: 90
---

## Motion

- Most movement is driven by scrolling (CSS scroll timelines), not by timers: nothing moves unless the visitor scrolls, except gentle details like dust in the kiln stage.
- **Theme settings → [Animations](../theme-settings/animations.html)**: turn interface animations on or off, set the **Animation intensity**, reveal sections on scroll, and smooth page transitions.
- Visitors who set **reduced motion** on their device see every section composed and at rest; films wait for a press.

## Accessibility

- Semantic HTML, a skip link, landmarks and a correct heading outline on every template.
- Everything works by keyboard: menus, drawers, dialogs, filters, the variant picker, quick view, the sale room.
- Dialogs and drawers trap focus and return it; changes (cart updates, filter counts) are announced to screen readers.
- Color schemes are checked for contrast; touch targets are at least 24 px (WCAG 2.5.8).
- **Theme settings → [Accessibility](../theme-settings/accessibility.html) → Underline links in text** for stores that prefer it.
- Forms label every field, list errors at the top and link them to the fields.

## Speed

- No framework and no jQuery. Small ES modules load only when their part of the page is visible or used.
- Each section loads its own stylesheet, so a page carries only the CSS it shows.
- Images are responsive (`srcset`), lazy below the fold, with the first image prioritised.
- A size budget is checked on every change to the theme.
