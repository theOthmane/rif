# Spec 15 — Audit and polish

## Goal
One consistent, shippable theme. This spec **fixes**. It doesn't add features.

## Steps (in order, commit after each numbered step that changes code)
1. **Brand safety sweep**: `grep -riE "rolex|armani|piguet|audemars|casio" theme/` → must return nothing. Confirm no file from `brand/watches/` is in `theme/assets/`.
2. **Token sweep**: find raw colours/sizes outside `tokens.css` (`grep -rnE "#[0-9a-fA-F]{3,8}\b|[0-9]+px" theme/assets/*.css`, ignoring tokens.css, `1px`, `0px`) → replace with tokens.
3. **String sweep**: find hard-coded French/English text in `.liquid` outside translation calls → move to `fr.default.json`. Find hard-coded routes (`"/cart"`, `"/collections"`, `"/search"`) → `routes.*`.
4. `/impeccable audit` on: home, collection, product, packs, cart drawer, contact, FAQ, search, 404, password. Fix every **critical/high** finding. List medium ones in the commit message.
5. `/impeccable polish` on home, product and packs. Remember the brand commitments are intentional. Check the spec 20 depth layers against the DESIGN.md tempo map: nothing loops, text is still while read, reduced motion = a finished static page.
6. **Taste pass (optional, owner decides)**: if the `design-taste-frontend` skill is not installed (it was removed from `.claude/skills/`), skip this step and say so. Otherwise load `design-taste-frontend` with dials `DESIGN_VARIANCE: 4`, `MOTION_INTENSITY: 3`, `VISUAL_DENSITY: 3`. Ask it only for a **critique list**. Apply items that don't conflict with DESIGN.md / PRODUCT.md. Note rejected items and why.
7. **Performance** (Chrome DevTools Lighthouse, mobile, on the preview URL (AGENTS.md §5)): target Performance ≥ 80, Accessibility ≥ 95, Best Practices ≥ 95. Typical fixes: `sizes` attributes, lazy-loading below the fold, deferring JS modules, removing unused CSS files from `theme.liquid`.
8. **Accessibility**: keyboard-only walkthrough (menu, rows, product form, drawer, checkout button), screen-reader labels on icon buttons, focus never lost, contrast ≥ 4.5:1 for text (≥ 3:1 for large display text).
9. **Edge cases** (`/impeccable harden`): very long product title, product with 10 variants, 0 images, price 0, 50 items in cart, collection with 1 product, empty menus, every home-row collection empty (spec 19), a pack with no contents/gift metafields and no compare-at price (spec 21).
   **Backlog**: close every code item under "Spec 15 backlog" in AGENTS.md; list the owner-only ones in the reply.
10. **Cleanup**: delete unused assets/snippets/locale keys; `theme check` 0 errors **and 0 warnings**.

## Acceptance
- [ ] All sweeps clean
- [ ] Lighthouse targets met (paste scores into the commit message)
- [ ] No critical/high Impeccable findings left
- [ ] theme check: 0 errors, 0 warnings

Commit(s): `fix(15): …` per step, final `chore(15): audit & polish complete`


## Deferred findings to close in this spec (from the earlier QA/adversary passes)
- Announcement bar sits outside any landmark (axe `region`): make it part of the header landmark or give it `role="region"` + a label.
- Dead code: `.header__monogram` CSS; unused locale keys (`hello_world.*`, `customers.login.*`, `rifano.email_label`).
- Menu drawer close button has a double accessible name; the focus ring is 1px (make it clearly visible); verify `.cart-count` position when the count is > 0.
- COD promise repeated too often in one viewport (announcement + drawer + footer): keep it in the announcement bar, product page and cart.
- Owner admin items (not code, see spec 16): real `[PH]` values for delivery/warranty, French store data (menu titles, "Products"/"My Store", policies).
