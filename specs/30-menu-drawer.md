# Spec 30 — Menu drawer

## Goal
The hamburger menu becomes a typographic moment: navigation links at display scale, one column, lots of air, no separators. Header markup and the owner's sketch (hamburger / monogram / cart) are not changed.

## Read first
`specs/24-monument.md`, `theme/sections/menu-drawer.liquid`, `theme/assets/header.css`, the drawer's JS (find it with `grep -l menu-drawer theme/assets/*.js`), spec 15 backlog notes on focus.

## Files (touch only these)
- `theme/assets/header.css` — drawer rules only (`.menu-drawer__*`)
- `theme/sections/menu-drawer.liquid` — classes only; no change to the `<dialog>`/focus-trap markup, the search form, or the close button

## Protected
`header.liquid` and everything the header does, the dialog open/close + Esc + focus return behaviour, the search form (`routes.search_url`), `aria-*` attributes, the cart drawer, `--z-drawer` layering.

## Changes
1. Links: Tenor at `--fs-xl` on mobile, `--fs-2xl` on desktop, `--lh-snug`, 44px minimum target, `--s-4` gap, active page in the full ink, others `--c-text-2`.
2. Remove any hairline between items and between the top bar and list; separate by space.
3. The welcome label ("Mrehba bik") stays, quiet, above the list.
4. Panel width unchanged unless the larger type forces a wrap of a real menu title at 375; then allow full width on mobile only.

## Acceptance
- A. 0 errors. B. smoke 0 errors.
- C. 375/768/1440: open from the hamburger, Tab through every link and the search field (focus stays inside the dialog), Esc closes and focus returns to the hamburger, no overflow, no console errors, long French titles wrap without clipping. Screenshots `tools/shots/30-*.png`.
- Menu with one link (the preview footer menu has only "Search") and with five links both look intentional.

## Rollback
`git revert` the spec 30 commit.
