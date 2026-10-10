# STATUS — RIFANO theme

Date: 2026-10-10

## Done

### Setup (commits 8c04487, 4a0d07d, 23c725e)
1. Moved `rifano-logo.PNG` -> `brand/`, `Watch-1..4.png` -> `brand/watches/` (unmodified).
2. Skeleton theme cloned into `theme/` (via `npx @shopify/cli@latest`; global `shopify` binary is broken).
3. Installed Impeccable for OpenCode (project scope) into `.opencode/`; installed `design-taste-frontend` into `.agents/skills/`; cloned scroll-craft into `tools/scroll-craft/` (gitignored); ran doctor.
4. `.gitignore`: node_modules/, .env, tools/scroll-craft/, scrollcraft/builds/, .shopify/, plus the Impeccable ignore block.
5. Committed `docs: PRODUCT.md via impeccable init` and `docs: PLAN, AGENTS rules, specs 01-16`, pushed to `main`.

### Spec 01 — Foundations (this session)
6. PRODUCT.md: removed CLI-binary / last-theme-check / scroll-craft lines from Operating Context; fixed "cash-on-delivered" → "cash-on-delivery"; set Accessibility to WCAG 2.2 AA; resolved Hero production (Nano Banana + Veo + ffmpeg, see specs/13), Fonts (self-hosted variable WOFF2, OFL), RF monogram (traced in specs/02), Analytics (out of v1 scope); added brand/watches third-party-brands note under Evidence on Hand.
7. Locale: created `theme/locales/fr.default.json` (all keys in French + `rifano.*`: announcement, tagline_1/2, welcome, skip_to_content); deleted `theme/locales/en.default.json`; added RIFANO labels to `en.default.schema.json`.
8. Fonts: copied Latin variable WOFF2 from `@fontsource-variable/bodoni-moda` + `@fontsource-variable/manrope` (via throwaway `tools/fonts-tmp/`, removed after) to `theme/assets/bodoni-moda-var.woff2`, `bodoni-moda-italic-var.woff2`, `manrope-var.woff2`. No node_modules committed.
9. Tokens: created `theme/assets/tokens.css` with the exact spec-01 values; loaded before `critical.css` in both layouts.
10. Base CSS: rewrote `critical.css` (reset, dark ground, Manrope body, focus-visible, visually-hidden, page-width, skip-link, container grid — no raw hex/px) and `base.css` (`.t-display`/`.t-label`/`.t-body`/`.t-muted`, `.btn`/`.btn--ghost`/`.btn--block`, token-based inputs + skeleton residuals).
11. Snippet/layouts: `css-variables.liquid` now holds the three `@font-face` rules + `--page-max`/`--gutter` overrides (only if set); `theme.liquid` + `password.liquid` preload the two fonts via `preload_tag`, load tokens → critical → base, and start `<body>` with a `rifano.skip_to_content` skip link targeting `#main-content`.
12. Settings: removed `type_primary_font`; kept `max_page_width`/`min_page_margin`; added `RIFANO` group (`announcement_text`, `whatsapp_number`, `instagram_url`, `tiktok_url`, `support_email`, `delivery_text`, `warranty_text`, `returns_text`, `home_rows_menu`, `rows_visible` 1–6 default 3).
13. DESIGN.md created (tokens, type rules, silver rule, motion, imagery, component list, brand commitments).
14. Home: `templates/index.liquid` is now one empty container with a visually-hidden shop-name `h1`; deleted `blocks/hello-world.liquid`, `blocks/liquid-tips.liquid`, `assets/liquid-tips.js`, `assets/shoppy-x-ray.svg` (partial-refresh pattern noted for spec 10).

### Spec 01 — Review fixes (commit `fix(01)`)
15. **`tokens.css` was missing on the gift-card page.** `templates/gift_card.liquid` is `{% layout none %}` and builds its own `<head>`, but only loaded `critical.css` + `base.css`. Every token resolved to nothing there, so body colour, background and fonts fell back — black text on the dark UA canvas. Added `tokens.css` before `critical.css`, plus a skip link and `id="main-content"` for parity with the layouts.
16. **Merchant `--page-max` / `--gutter` overrides never applied.** `{% render 'css-variables' %}` emitted its `:root` block *before* the `tokens.css` link, and with no `@layer` anywhere the later `tokens.css` won the cascade — `max_page_width` and `min_page_margin` were dead controls. Moved the render to after `base.css` in all three documents that build a `<head>`. Also `--gutter` is now `max(<setting>, clamp(…))` so the shipped default of 20px no longer kills the fluid clamp.
17. **Removed the dead `t:general.colors` group** (`background_color` `#FFFFFF`, `foreground_color` `#333333`, `input_corner_radius`). Nothing read them after spec 01 stopped emitting `--color-background` / `--color-foreground` / `--style-border-radius-inputs`, so the owner could set a white background and see no effect — and the two hex values were the only raw hex outside `tokens.css`. Dropped the three orphaned labels from `en.default.schema.json`.
18. **Grid track minimums were spacing tokens.** `minmax(500px, 1fr)` / `minmax(200px, 1fr)` had been rewritten to `var(--s-9)` (96px), collapsing `.collection-products` to 11 columns at 1440px. Added component-size tokens `--card-min: 15rem`, `--card-min-compact: 10rem`, `--card-min-full: 17.5rem` to `tokens.css` (spacing tokens are not component sizes) and used them at `base.css:129,140,143,154`. Now 1 column at 375px, 5 at 1440px.
19. **Header overflowed 375px.** `base.css` header row had no `flex-wrap` and no `min-width: 0` while every link was floored at 64px, so any real menu forced horizontal document scroll. Added `flex-wrap: wrap` on `header` and `min-width: 0` on `.header__menu` / `.header__icons`. Spec 03 rebuilds this markup and must *override* these rules, not inherit them.
20. **`theme/AGENTS.md` and `theme/README.md` still documented files this commit deleted** — both listed `hello-world` / `liquid-tips` as current, and told agents the canonical partial-refresh example lives in `assets/liquid-tips.js`, which spec 10 is meant to copy. Corrected both: block inventory is now `container, header, footer`, and the partial-refresh pattern is described generically with a `git show HEAD~1:theme/assets/liquid-tips.js` recovery pointer.
21. **WCAG 1.4.11 non-text contrast failure.** `--c-line: #2a2d33` measured 1.40:1 on `--c-bg` and 1.19:1 on the `--c-surface-2` input fill, against a 3:1 requirement — every input and `.btn--ghost` was bounded by a line a low-vision user cannot see. Added `--c-line-strong: #666c75` (3.65 / 3.42 / 3.11:1 on bg / surface / surface-2) for component boundaries and kept `--c-line` for decorative hairlines, per DESIGN.md. The original value was dictated verbatim by the spec; `tokens.css` is the file DESIGN.md designates for refining it. Documented in DESIGN.md.

## Theme-check result
`npx @shopify/cli@latest theme check --path theme`: 24 files inspected with no offenses found (0 errors, 0 warnings). Fixed 4 initial AssetPreload warnings by switching to `preload_tag`; re-verified after the review fixes (a multi-line `{% # %}` comment had to be collapsed to one line).

## Doctor result (scroll-craft preflight)
- ok   node v22.22.1
- ok   ffmpeg (full build, 566 filters), libwebp encoder present
- warn playwright-core not installed (only needed for verification pass)
- warn Chrome not found (install Chrome or set SCROLLCRAFT_CHROME)
- warn KIE_AI_API_KEY not set (only needed to generate imagery)
- ok   workspace at ./scrollcraft; warn registry not created yet
Result: Ready, with 4 optional items missing.

## Open issues
- Global `@shopify/cli` install is broken (no `shopify` on PATH); use `npx @shopify/cli@latest`.
- playwright-core and Chrome missing for scroll-craft verification pass.
- `.claude/skills/design-taste-frontend` is a symlink; may misbehave on Windows checkouts.
- Visual confirmations left to the owner (see spec-01 reply): Rendered-fonts check in DevTools, RIFANO settings group in the theme editor, 375px empty-page eyeball.
- Review non-blocking items left open on purpose (not in the `fix(01)` scope): `.btn`/input min-height is `--s-8` = 64px vs the spec's 48px; `.btn--ghost:hover { filter: brightness(1.2) }` on a transparent background gives no perceptible hover; `--icon-stroke-width` is referenced by `icon-cart.svg` and `icon-account.svg` but defined nowhere (stroke falls back to 1); cart/account icon links have no accessible name and there is no `<nav>` landmark; `base.css` uses bare `header{}` / `footer{}` / `label{}` element selectors; `.collections` needs `var(--collection-card-size, …)` as a fallback; `fr.default.json` still carries the dead `hello_world.*` and `blog.*` namespaces; `templates/product.liquid:25` hardcodes `"Add to cart"`, `templates/list-collections.liquid:3` carries an orphaned `style="--grid-gap: 10px"`, and `blocks/footer.liquid` renders `powered_by_link` + payment icons (specs 09 / 08 / 04 own these).
- Next: spec 02 (brand assets). Do not start until told.
