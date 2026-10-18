# Spec 25 — Poster page titles

## Goal
Page titles on browse and content pages take the poster scale the home rows already use (`--fs-display`), through one **opt-in modifier**, so no page changes unless it carries the class.

## Read first
`specs/24-monument.md` (guardrails), `theme/assets/base.css` (`.t-page-title`), `theme/assets/tokens.css` (`--fs-display`).

## Files (touch only these)
- `theme/assets/base.css` — add `.t-page-title--poster`
- `theme/sections/collection-header.liquid`, `collection-tiles.liquid`, `page-header.liquid`, `packs.liquid`, `main-search.liquid` — add the modifier to their `<h1>` only
- `theme/assets/collection.css`, `pages.css`, `packs.css`, `system.css` — only the spacing under/over the title if the bigger size needs it

## Protected
`.t-page-title` itself (cart, product, 404, password, gift card keep it unchanged), locale keys, the h1 count (exactly one per page).

## Changes
1. `.t-page-title--poster`: `font-size: var(--fs-display)`, `line-height: var(--lh-tight)`, `letter-spacing: var(--tracking-display)`, `text-wrap: balance`, `overflow-wrap: break-word`, `hyphens: manual`. Display face stays Tenor, weight 400, `font-synthesis: none`.
2. Add the class to the five h1s above. More air above than below (DESIGN.md): keep each page's existing top rhythm, add `--s-6` below the title only where the grid sits too tight.
3. Long merchant titles must never overflow: test with a 40-character collection title and a one-word 18-character title at 375.

Token adoption: use `--lh-poster` for the title line-height (not a literal).

## Acceptance
- A. theme check 0 errors.
- B. smoke push 0 errors.
- C. At 375/768/1440 on collection, boutique, a content page, packs (or its empty state), search (with and without a query): title ≤ 2 lines, no overflow (`scrollWidth === clientWidth`), no console errors, Tenor live. Screenshots `tools/shots/25-<page>-<w>.png`.
- Pages **not** listed (cart, product, 404, password) are visually unchanged: compare one screenshot each against the pre-spec build.

## Rollback
`git revert` the spec 25 commit; nothing else depends on it except 26/28 reusing the class.

## Amendments (scout, 2026-10-18)
- **A-1 — file list, change 2.** The measured baselines show neither `packs.css` nor `system.css`
  needs a spacing change (`.packs__header` gap `--s-3` + `.packs__grid` `padding-top: var(--s-5)`;
  `.search__title` `margin-block-end: var(--s-5)` + `.search__form` `margin-block-end: var(--s-6)`).
  Corrected: only `collection.css` and `pages.css` are expected to need a spacing line; touch
  `packs.css`/`system.css` only if a screenshot proves the grid sits tight.
- **A-2 (cross-listed from spec 26) — the "1 pièces" backlog item is already closed.**
  `fr.default.json:65` carries the `one`/`other` forms and the live store renders `1 pièce` /
  `0 pièce`. Nothing to fix here.
- **A-3 — cart title.** Spec 29 wants `.t-page-title--poster` on the cart page h1, but this
  spec's file list does not contain `main-cart.liquid`. Corrected: spec 29 changes `cart.css`
  and `system.css` only; the cart title stays `.t-page-title`. Owner-question default **B**
  (brief §9.1, no answer supplied) is taken and recorded in spec 29's amendments: no modifier
  on the cart title.
