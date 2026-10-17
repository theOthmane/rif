# Spec 29 — System pages: 404, password, cart page, search

## Goal
Carry the monument language to the pages visitors hit by accident or before launch, keeping their jobs untouched: recover from a dead link, wait for the launch, review a cart, find a product.

## Read first
`specs/24-monument.md`, `PRODUCT.md` (password page reads "Bientôt"), `theme/sections/main-404.liquid`, `main-password.liquid`, `main-cart.liquid`, `main-search.liquid`, `theme/layout/password.liquid`, `theme/assets/system.css`, `cart.css`.

## Files (touch only these)
- `theme/sections/main-404.liquid`, `main-password.liquid`
- `theme/assets/system.css`, `cart.css` (title and spacing only)
- `theme/locales/fr.default.json` only if a new visible string is unavoidable

## Protected
Cart line items, quantity controls, totals, checkout button and the `cart.js` Section Rendering contract; the search form, results markup and pagination; the password form, its email-signup branch and error/success states; `layout/password.liquid` (shell stays minimal: tokens + critical + base + system); the gift-card template.

## Changes
1. **404:** the title (existing `not_found_title`) at poster scale; keep the monogram (64px), the one-line text and the two buttons. Add the one-word closing treatment only if it uses an existing locale key; otherwise leave the buttons as they are.
2. **Password ("Bientôt"):** the RIFANO wordmark across the full width (same inline-SVG technique as the footer: `viewBox`, `textLength`, `font-size` as an SVG attribute), "Bientôt" as the one headline below it, then the existing form. No new copy, no dates, no promises.
3. **Cart page:** title via `.t-page-title--poster` only if it stays on one line at 375 for "Votre panier"; otherwise keep the current size. Nothing else on the page changes.
4. **Search:** result headings and the empty state keep their structure; title uses the spec 25 class (already applied there) — this spec only verifies it.

Token adoption: replace `min-height: 100svh` in `system.css` (lines ~154, ~422) with `var(--screen)`.

## Acceptance
- A. 0 errors. B. smoke 0 errors.
- C. 375/768/1440: `/this-does-not-exist` (404), `/cart` empty and with an item, `/search` empty + query + no-result, the password page (view it on a theme preview with the password enabled, or in a local harness, and say which). No overflow, no console errors, buttons keyboard reachable.
- Cart: add → drawer → `/cart` quantity change and remove still work (regression, spec 10 behaviour).
- Password: the form still submits to its original action (inspect `form[action]`); never submit a real signup from QA.
- Screenshots `tools/shots/29-*.png`.

## Rollback
`git revert` the spec 29 commit.
