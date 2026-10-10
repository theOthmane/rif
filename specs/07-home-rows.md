# Spec 07 — Home category rows + "Plus"

## Goal
The middle of the sketch: rows of products per category (**Montres, Colliers, Pochettes & Sacs**), each with a small
line icon and its title, products scrolling horizontally. Under them, a **"Plus"** control reveals more rows.

## Data model (menu-driven)
- `settings.home_rows_menu` (link_list, from spec 01). Each **link pointing to a collection** = one row, in menu order. Non-collection links are skipped.
- Row title = link title. Products = `link.object.products` (first 10).
- Icon chosen by collection handle: contains `montre` or `watch` → `watch`; `collier` or `necklace` → `necklace`; `pochette`, `sac` or `bag` → `pouch`; else no icon.
- **No menu set or menu empty** → render 3 placeholder rows titled "Montres", "Colliers", "Pochettes & Sacs" with icons and 4 placeholder cards each (spec 05 placeholder mode).
- Collection with 0 products → the row shows 4 placeholder cards.

## Files
- `theme/sections/home-rows.liquid` (new), `theme/assets/home-rows.css`, `theme/assets/home-rows.js` (new)
- `theme/templates/index.json` (add the `home-rows` section after the hero section), `theme/locales/fr.default.json`

## Layout
- Each row: `<section class="row" aria-labelledby="row-title-N">`.
  - Header line: icon (24px, `--c-silver-2`) + title (Bodoni Moda `--fs-xl`) on the left; "Voir tout →" link (`.t-label`) to `link.url` on the right.
  - A thin vertical silver hairline on the left edge of the rows group (from the sketch), 1px `--c-line`, desktop only.
- Track: horizontal `scroll-snap-type: x mandatory`, `overflow-x: auto`, hidden scrollbar (keep it scrollable), `gap: var(--s-4)`, padding-inline `--gutter`, `scroll-padding-inline: var(--gutter)`.
  Card width: 46vw on mobile (≈2.2 visible, so the next card peeks), 30vw at 768px, 22% at 1200px (4.5 visible).
- Desktop (`pointer: fine`): prev/next arrow buttons appear on row hover, scroll by one viewport of cards (`scrollBy` with smooth behaviour unless reduced motion). Disabled state at the ends.
- First row's first 2 card images `loading: 'eager'`, everything else lazy.
- Rows enter with a 16px fade-up when 15% visible (IntersectionObserver, once). Reduced motion: none.

## "Plus"
- Rows beyond `settings.rows_visible` (default 3) render with the `hidden` attribute.
- Under the rows, a centred button styled as three vertical dots (⋮, like the sketch) + label "Plus" (`.t-label`): `aria-expanded`, `aria-controls` = id of the hidden group.
  Click → reveal the hidden rows (fade-up), move focus to the first revealed row title, and the button disappears.
- If there are **no hidden rows**, the same control is a link to `routes.collections_url` ("Toute la boutique").

## Acceptance
- [ ] With no menu: 3 placeholder rows with correct icons
- [ ] With a menu of 4+ collections and rows_visible=3: the 4th row is hidden until "Plus"
- [ ] Touch swipe smooth on mobile, snap aligned to the gutter; arrows work with keyboard on desktop
- [ ] No horizontal page overflow at 375px
- [ ] theme check 0 errors

Impeccable: `/impeccable critique home` after this spec; fix high-severity items.
Commit: `feat(07): home category rows + plus`
