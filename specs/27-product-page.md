# Spec 27 — Product page (high risk: protect the buy path)

## Goal
Bring scale and calm to the product page — larger title and price, more air, gallery framing — **without moving, wrapping or restyling anything that touches buying**. This page is where cash-on-delivery orders happen; a regression costs sales.

## Read first
`specs/24-monument.md`, `PRODUCT.md` (COD, free delivery, `@app` slot), `AGENTS.md` §2 (Checkout, Cart), `theme/sections/product-info.liquid`, `product-gallery.liquid`, `theme/assets/product.css`, `product-form.js`, `product-gallery.js`.

## Files (touch only these)
- `theme/assets/product.css` (CSS only)
- `theme/sections/product-info.liquid` — **only** to add a class to the title/price wrappers if CSS alone cannot reach them; no markup moved, no attribute changed

## Protected (do not change, even whitespace in logic)
The `<form>` and every input name/id, the variant radios (`.product-info__pill*`), the ATC button and its busy/disabled states, the sticky ATC bar, the **`@app` block slot**, `pack-contents` render, the COD / delivery details block and its text, the gallery viewer `<dialog>` and its focus handling, structured data, `product-form.js`, `product-gallery.js`, `cart.js`.

## Changes (CSS-led)
1. Title: `--fs-2xl`→`--fs-display` upper bound is **not** allowed here; use `--fs-2xl` with `--lh-tight`, `text-wrap: balance`. Price: Tenor at `--fs-xl`, `tabular-nums` already on `.price`.
2. Spacing: product info column gets `--s-6` rhythm between title, price, variants, ATC; ATC stays at the same position in the tab order and above the fold at 375×812 for a one-variant product.
3. Gallery: square corners stay, main image on `--c-bg`, thumbnails strip spacing from tokens; no new borders, no shadows.
4. Details accordion: question rows lose any hairline in favour of `--s-5` space + tone step (`--c-surface`) when open. Open/close behaviour untouched.
5. COD/delivery block: keep its text and prominence; it may gain space, never lose size or contrast. Shown once or twice, not more.

## Acceptance (the order matters)
- A. 0 errors. B. smoke 0 errors.
- C-1 **Buy path:** on the preview, add the product to cart from the page: drawer opens with the line item, Esc closes and returns focus to the ATC button, `/cart` shows the same line.
- C-2 Sticky ATC appears and works at 375; variant radios (if the product has variants) are selectable by keyboard.
- C-3 The `@app` slot still renders its container (inspect DOM; no app installed is fine).
- C-4 375/768/1440 screenshots `tools/shots/27-*.png`; no overflow, no console errors, title ≤ 3 lines at 375.
- C-5 Lighthouse mobile performance on the product page not worse than the spec-15 baseline (86) by more than 3 points.
- Any C-1…C-3 failure → revert the spec, mark ⚠️, stop.

## Rollback
`git revert` the spec 27 commit.
