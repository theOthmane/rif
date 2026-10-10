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

## Theme-check result
`npx @shopify/cli@latest theme check --path theme`: 24 files inspected with no offenses found (0 errors, 0 warnings). Fixed 4 initial AssetPreload warnings by switching to `preload_tag`.

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
- Next: spec 02 (brand assets). Do not start until told.
