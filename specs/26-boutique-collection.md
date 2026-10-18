# Spec 26 — Boutique and collection pages

## Goal
Apply the monument direction to browse pages: collection names at poster scale on the Boutique tiles, a calmer collection header, no rules or soft ornaments. Product cards are not redesigned here.

## Read first
`specs/24-monument.md`, `specs/25-poster-titles.md`, `DESIGN.md` (silver rule, one accent), `theme/sections/collection-tiles.liquid`, `collection-header.liquid`, `product-grid.liquid`, `theme/assets/collection.css`.

## Files (touch only these)
- `theme/sections/collection-tiles.liquid`, `collection-header.liquid`
- `theme/assets/collection.css`
- `theme/locales/fr.default.json` only if a new visible string is truly needed (prefer none)

## Protected
`product-card.liquid` / `product-card.css` (spec 05 contract), `collection-sort.js`, pagination snippet, the `.tile` class names and `data-depth-*` hooks, the empty states (`boutique-empty`, `collection_empty_*`), the French pluralised count key.

## Changes
1. **Boutique tiles:** the tile name moves to `--fs-xl`→`--fs-2xl` display size, sits under the 4/5 media with the count as plain `--c-text-2` text (no uppercase tracked label needed; keep `.t-label` only if contrast and size are unchanged). Alternate tile offsets on desktop (every second tile drops by `--s-7`) for an uneven, gallery-wall rhythm; one column on mobile, no offset.
2. **Scrim:** if the tile name currently sits over a gradient on the image, move the name below the image instead. No gradient anywhere on the page.
3. **Collection header:** title (spec 25 modifier), product count as one quiet line, sort control aligned to the page grid. No hairline under the header.
4. **Grid spacing:** `gap` from tokens, larger row gap on desktop (`--s-7`) so cards read as objects, not a table.

Token adoption: grid gaps `--gap-grid` / `--gap-grid-lg`, tile focus ring `--focus-offset-card` (collection.css:199), transitions `--t-*`.

## Acceptance
- A. 0 errors. B. smoke 0 errors.
- C. 375/768/1440 on `/collections`, a collection with the one real product, and an empty collection: no overflow, no console errors, tiles keyboard-focusable with a visible ring, empty states render, count pluralisation correct ("1 pièce"), depth layers still animate (or are static under reduced motion). Screenshots `tools/shots/26-*.png`.
- Backlog item "1 pièces" is checked, not silently left.

## Rollback
`git revert` the spec 26 commit.

## Amendments (scout, 2026-10-18)
- **A-2 — the "1 pièces" backlog item is already closed.** `fr.default.json:65` has `one`/`other`
  and the live store renders `1 pièce` / `0 pièce`. The acceptance line "Backlog item '1 pièces'
  is checked" is satisfied by verification, not by a code change. Do not re-fix.
- **A-4 — change 1's tile name must be allowed two lines.** `--fs-2xl` at 1200px is 40px; a
  3-column Boutique tile is ≈ 442px wide; "Pochettes & Sacs" fits only if it wraps. Add
  `text-wrap: balance` to `.tile__title` and verify with harness case E.
- **A-5 — the "empty collection" to shoot is `/collections/colliers`** (measured 0 products).
  Corrected acceptance C wording: "an empty collection = `/collections/colliers`".
