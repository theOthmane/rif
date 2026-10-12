# Spec 21 — Packs page

## Goal
A "Packs" page where customers buy ready-made sets (e.g. a watch + a necklace) at a pack price, sometimes with a free gift.

**Owner decisions:**
- **Ready-made packs**, created in admin with Shopify's free **Bundles** app. Each pack is one product with one price, so it works with native checkout + cash on delivery.
- **Offer values are not decided yet.** The theme never invents a discount, a saving or a gift. It shows only what the product data says (price, compare-at price, metafields). Copy like "-X%" or "Offert" appears only when that data exists.

## Read first
- PRODUCT.md (no invented promises), DESIGN.md (silver rule: savings are text, never a filled badge)
- `theme/snippets/product-card.liquid`, `theme/snippets/price.liquid`, `theme/sections/product-info.liquid`, `theme/assets/cart.js`, `theme/assets/product-form.js`
- Shopify Dev MCP: metafield access on product (`product.metafields.custom.*`, `.value` for references), list-of-product-reference iteration, and anything Bundles exposes to Liquid. Don't assume.
- `/impeccable shape` → build → `/impeccable polish`. Reuse spec 20 depth classes for the pack cards (layers 4 and 6), nothing new.

## Files
- `theme/templates/page.packs.json` (new)
- `theme/sections/packs.liquid` (new) + `theme/assets/packs.css` (new)
- `theme/snippets/pack-contents.liquid` (new: "Ce pack contient" list, shared by the packs page and the product page)
- `theme/sections/product-info.liquid` (render `pack-contents` when the metafield exists; nothing else)
- `theme/locales/fr.default.json`, `theme/locales/en.default.schema.json`

## Data model (owner sets it up in admin; give these exact steps in the reply)
1. Install **Shopify Bundles** (free, by Shopify). Create each pack as a fixed bundle. Set its price. Optionally set **compare-at price** = the sum of the items (that's the only source of a displayed saving).
2. Create a collection **Packs** (handle `packs`) holding the bundle products.
3. Settings → Custom data → Products: define
   - `custom.pack_contents`: list of product references (what's in the pack, for display)
   - `custom.pack_gift`: product reference (optional free gift, for display)
4. Pages → create page "Packs", template `page.packs`. Add it to the main menu (and to the home-rows menu if they want a Packs row: spec 19 picks it up automatically).

## Section `packs.liquid`
Settings (with defaults): `heading` (text, default from locale), `intro` (richtext, blank), `collection` (collection picker).
Layout, mobile first:
- Page title (Tenor) + optional intro (one or two sentences, `--c-text-2`).
- Pack cards grid: 1 column at 375, 2 at 768, 3 at 1200. Each card:
  - Image (bundle product featured image, contained on `--c-bg`, never cropped), title, price via `price.liquid` with the compare-at shown struck through **only if** `compare_at_price > price`.
  - **Saving line** only if compare-at > price: `rifano.packs_saving` = "Vous économisez {{ amount }}" (amount = difference, `money` filter). Plain text, not a badge.
  - **Contents:** `pack-contents` snippet → small thumbnails + titles of `custom.pack_contents` (max 4, then "+N"). Hidden if blank.
  - **Gift:** if `custom.pack_gift` is set → one line `rifano.packs_gift` = "Offert : {{ title }}". Hidden if blank.
  - Primary action: **"Voir le pack"** → product URL (the product page keeps the `@app` COD slot and the full ATC).
  - Quick add **only** for single-variant, available packs: "Ajouter au panier", reusing the existing add-to-cart path (`product-form.js` / `cart.js` + Section Rendering API refresh of the cart drawer). No new cart logic. Opens the drawer like the product page does.
- Empty / unset collection: editor → 3 placeholder cards (`placeholder_svg_tag`); live → one sentence `rifano.packs_empty` = "Les packs arrivent bientôt." + ghost button to `routes.collections_url` (same pattern as spec 19).

## Product page
In `product-info.liquid`, if `product.metafields.custom.pack_contents` is set, render `pack-contents` under the price ("Ce pack contient") and the gift line if set. No layout change otherwise.

## Out of scope (note in reply)
- Build-your-own pack, tiered automatic discounts, auto-adding a gift line to the cart.
- COD-form apps (EasySell etc.) may not support Bundles products. Re-check when an app is chosen (spec 16 owner item).

## Verification (Gate C)
- In the preview store, create **one test pack** only if the owner approves it (it's a product in their admin). Otherwise mark the populated states CAN'T VERIFY and verify the empty state live + populated states by inspection.
- Screenshots `tools/shots/21-packs-{375,768,1440}.png` (+ `-empty-375`), product page with contents `tools/shots/21-product-pack-375.png`.
- No saving or gift text renders when the data is absent (test both).
- Quick add → drawer opens with the pack line; Esc returns focus.

## Acceptance
- [ ] Page renders from the Packs collection, 1/2/3 columns
- [ ] Saving and gift lines appear only from real data
- [ ] Quick add uses the existing cart path; drawer refreshes
- [ ] Product page shows "Ce pack contient" when set
- [ ] Live empty state; editor placeholders
- [ ] Gate A/B/C pass; owner admin steps listed

Commit: `feat(21): packs page`
