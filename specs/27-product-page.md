# Spec 27 — Product page (high risk: protect the buy path)

## Goal
Bring scale and calm to the product page — larger title and price, more air, gallery framing — **without moving, wrapping or restyling anything that touches buying**. This page is where cash-on-delivery orders happen; a regression costs sales.

## Read first
`specs/24-monument.md`, `PRODUCT.md` (COD, free delivery, `@app` slot), `AGENTS.md` §2 (Checkout, Cart), `theme/sections/product-info.liquid`, `product-gallery.liquid`, `theme/assets/product.css`, `product-form.js`, `product-gallery.js`.

## Files (touch only these)
- `theme/assets/product.css` (CSS only)
- `theme/sections/product-info.liquid` — **only** to add a class to the title/price wrappers if CSS alone cannot reach them; no markup moved, no attribute changed

## Protected (do not change, even whitespace in logic)
The `<form>` and every input name/id, the variant radios (`.product-info__pill*`), the ATC button and its busy/disabled states, the sticky ATC bar, the **`@app` block slot**, `pack-contents` render, the COD / delivery details block and its text, the gallery viewer `<dialog>` and its focus handling, structured data (`product | structured_data` lives in `snippets/meta-tags.liquid`, not in this section — do not touch it), `product-form.js`, `product-gallery.js`, `cart.js`.

## Changes (CSS-led)
1. Title: `--fs-2xl`→`--fs-display` upper bound is **not** allowed here; use `--fs-2xl` with `--lh-tight`, `text-wrap: balance`. Price: Tenor at `--fs-xl`, `tabular-nums` already on `.price`.
2. Spacing: product info column gets `--s-6` rhythm between title, price, variants, ATC; ATC stays at the same position in the tab order and above the fold at 375×812 for a one-variant product.
3. Gallery: square corners stay, main image on `--c-bg`, thumbnails strip spacing from tokens; no new borders, no shadows.
4. Details accordion: question rows lose any hairline in favour of `--s-5` space + tone step (`--c-surface`) when open. Open/close behaviour untouched.
5. COD/delivery block: keep its text and prominence; it may gain space, never lose size or contrast. Shown once or twice, not more.

Token adoption (value-identical swaps only): `--opacity-dim` at `product.css` opacity 0.7, `--focus-offset` at the pill focus ring, `--screen`-based heights where `100svh` literals appear.

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

## Amendments (scout, 2026-10-18)
- **A-15 — the token-adoption line is factually wrong.** There is no `100svh` literal in
  `product.css`; it uses `100dvh` (line 158) and `100vw`. Corrected: "value-identical swaps
  only: `--opacity-dim` (opacity 0.7) and `--focus-offset` at the pill focus ring. Leave every
  `100dvh`/`100vw` literal alone — `--screen` is `100svh`, which is not the same unit on
  mobile."
- **A-16 — change 1's "Price: Tenor at `--fs-xl`" is already the current state**
  (`product.css:229`); the only real work is the title's `--lh-tight` and the `--s-6` rhythm.
- **A-17 — C-5's baseline number is restated.** Measured 2026-10-18 on the preview (spec-24
  build, median of 3, mobile, shared-CDP harness): product **82 / A11y 97 / BP 100**, LCP 2.3 s,
  CLS 0, TBT 390–700 ms. Judge C-5 against a clean 3-run median taken in the build session with
  nothing else touching the browser, and state which number was used.
- **A-18 — C-2's variant-radio half is CAN'T VERIFY live**: the only product has 1 variant, so
  `product.has_only_default_variant` is true and the radio block (`product-info.liquid:81-112`)
  never renders. Report it as such; only the `--focus-offset` swap touches
  `.product-info__pill*`.
