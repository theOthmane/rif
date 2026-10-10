# Spec 15 — Audit and polish

## Goal
One consistent, shippable theme. This spec **fixes**. It doesn't add features.

## Steps (in order, commit after each numbered step that changes code)
1. **Brand safety sweep**: `grep -riE "rolex|armani|piguet|audemars|casio" theme/` → must return nothing. Confirm no file from `brand/watches/` is in `theme/assets/`.
2. **Token sweep**: find raw colours/sizes outside `tokens.css` (`grep -rnE "#[0-9a-fA-F]{3,8}\b|[0-9]+px" theme/assets/*.css`, ignoring tokens.css, `1px`, `0px`) → replace with tokens.
3. **String sweep**: find hard-coded French/English text in `.liquid` outside translation calls → move to `fr.default.json`. Find hard-coded routes (`"/cart"`, `"/collections"`, `"/search"`) → `routes.*`.
4. `/impeccable audit` on: home, collection, product, cart drawer, contact, FAQ, search, 404, password. Fix every **critical/high** finding. List medium ones in STATUS.md.
5. `/impeccable polish` on home and product. Remember the brand commitments are intentional.
6. **Taste pass (optional, owner decides)**: load `design-taste-frontend` with dials `DESIGN_VARIANCE: 4`, `MOTION_INTENSITY: 3`, `VISUAL_DENSITY: 3`. Ask it only for a **critique list**. Apply items that don't conflict with DESIGN.md / PRODUCT.md. Note rejected items and why.
7. **Performance** (Chrome DevTools Lighthouse, mobile, on the `theme dev` preview or an unpublished theme preview link): target Performance ≥ 80, Accessibility ≥ 95, Best Practices ≥ 95. Typical fixes: `sizes` attributes, lazy-loading below the fold, deferring JS modules, removing unused CSS files from `theme.liquid`.
8. **Accessibility**: keyboard-only walkthrough (menu, rows, product form, drawer, checkout button), screen-reader labels on icon buttons, focus never lost, contrast ≥ 4.5:1 for text (≥ 3:1 for large display text).
9. **Edge cases** (`/impeccable harden`): very long product title, product with 10 variants, 0 images, price 0, 50 items in cart, collection with 1 product, empty menus.
10. **Cleanup**: delete unused assets/snippets/locale keys; `theme check` 0 errors **and 0 warnings**.

## Acceptance
- [ ] All sweeps clean
- [ ] Lighthouse targets met (paste scores into STATUS.md)
- [ ] No critical/high Impeccable findings left
- [ ] theme check: 0 errors, 0 warnings

Commit(s): `fix(15): …` per step, final `chore(15): audit & polish complete`
