# Spec 02 — Brand assets: RF monogram SVG, wordmark, icons

## Goal
Vector brand assets the whole theme can use: a traced RF monogram filled with the silver gradient,
a text wordmark, and one small icon set in one consistent style.

## Inputs
- `brand/rifano-logo.PNG`: metallic RF monogram on a **white** background. The R contains small watch hands.

## Files
- `tools/trace/` (new, gitignored scratch: add `tools/trace/node_modules/` to `.gitignore`)
- `brand/rf-monogram.svg` (source of truth, committed)
- `theme/snippets/logo.liquid` (new): renders inline SVG monogram and/or wordmark
- `theme/snippets/icon.liquid` (new): `{% render 'icon', name: 'cart' %}`
- delete `theme/assets/icon-account.svg`, `theme/assets/icon-cart.svg` once nothing references them
- `theme/assets/base.css` (logo/icon classes only)

## Steps

### 1. Trace the monogram
1. In `tools/trace/`: `npm init -y && npm i potrace sharp`.
2. With sharp: greyscale → threshold so the **metal becomes black and the white background becomes white**
   (try threshold ~235; the shape is light grey on white, so invert logic carefully) → PNG at 2× size.
3. With potrace (`turdSize: 4`, `optTolerance: 0.3`) → SVG path. Check the watch hands inside the R survive. If they vanish, lower `turdSize` to 1.
4. Clean the SVG: single `<path>`, tight `viewBox` around the shape, no width/height attributes, no fill colour (fill set from Liquid).
5. Save as `brand/rf-monogram.svg`. Show the owner a side-by-side screenshot (original PNG vs SVG on black) in your final reply. **The owner approves the trace before you continue to 03.**

### 2. `snippets/logo.liquid`
Params (LiquidDoc): `variant` = `'monogram' | 'wordmark' | 'lockup'`, `class`, `size` (CSS length).
- Monogram: inline the path; define a `<linearGradient>` with a **unique id per render** (append a counter or random suffix), stops `--c-silver-1/2/3` (use `stop-color="var(--c-silver-1)"`).
  `role="img"`, `aria-label` = `shop.name`.
- Wordmark: `<span class="logo__wordmark t-display">RIFANO</span>`: Bodoni Moda 500, uppercase, tracking 0.32em, silver gradient text via `background-clip: text` (allowed: logo is one of the 3 silver uses).
- Lockup: monogram above the wordmark, centred.

### 3. `snippets/icon.liquid`
Inline SVG, `viewBox="0 0 24 24"`, `stroke="currentColor"`, `stroke-width="1.25"`, `fill="none"`, round caps/joins, `aria-hidden="true"`, class `icon icon--{{ name }}`.
Draw consistent thin-line icons for:
`menu`, `close`, `cart`, `search`, `arrow-right`, `arrow-left`, `plus`, `minus`, `chevron-down`,
`whatsapp`, `instagram`, `tiktok`, `mail`, `truck` (delivery), `cash` (COD), `shield` (warranty), `return`,
and the **category icons** from the sketch: `watch` (side-view wristwatch), `necklace` (chain with pendant), `pouch` (small bag / clutch).
Unknown name → renders nothing (no error).

### 4. CSS (base.css)
`.icon { width: 1.5rem; height: 1.5rem; flex: none }`, `.icon--sm` 1.125rem, `.logo` sizing via `--logo-size`.

## Acceptance
- [ ] Monogram SVG shows R + F + watch hands, crisp at 32px and 400px, silver gradient on `--c-bg`
- [ ] Two monograms on the same page don't share a gradient id
- [ ] All 20 icons render at the same visual weight. Put a temporary grid in `theme/sections/main-index.liquid` for the screenshot, then remove it before commit
- [ ] No PNG logo shipped in `theme/assets/`
- [ ] theme check 0 errors

Commit: `feat(02): RF monogram svg, wordmark, icon set`
