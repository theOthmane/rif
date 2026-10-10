# Spec 01 — Foundations: locale, fonts, tokens, DESIGN.md, base CSS, settings

## Goal
Turn the bare Skeleton into a RIFANO-ready base: French locale, self-hosted fonts, a single token file,
DESIGN.md, base styles and merchant settings. **No visible components yet** besides a clean empty page.

## Files
- `PRODUCT.md` (small edits, listed below)
- `theme/locales/fr.default.json` (new; becomes the default), `theme/locales/en.default.json` (delete)
- `theme/assets/fonts/` → **not allowed** (assets is flat). Put the font files directly in `theme/assets/`.
- `theme/assets/bodoni-moda-var.woff2`, `bodoni-moda-italic-var.woff2`, `manrope-var.woff2` (new)
- `theme/assets/tokens.css` (new), `theme/assets/critical.css`, `theme/assets/base.css`
- `theme/snippets/css-variables.liquid`, `theme/layout/theme.liquid`, `theme/layout/password.liquid`
- `theme/config/settings_schema.json`, `theme/config/settings_data.json`, `theme/locales/en.default.schema.json` (labels for new settings)
- `theme/templates/index.liquid`, delete `theme/blocks/hello-world.liquid`, `theme/blocks/liquid-tips.liquid`, `theme/assets/liquid-tips.js`, `theme/assets/shoppy-x-ray.svg`
  (keep a copy of the partial-refresh pattern in your head: read `liquid-tips.liquid` + `liquid-tips.js` **before** deleting. Spec 10 uses the same pattern.)
- `DESIGN.md` (new, repo root)

## Steps

### 1. PRODUCT.md corrections
- Remove from "Operating Context" the lines about the CLI binary, the last theme-check run and the scroll-craft doctor. Those belong in STATUS.md.
- Fix the typo "cash-on-delivered" → "cash-on-delivery".
- Resolve these TBDs (replace the TBD text):
  - Accessibility: **WCAG 2.2 AA**.
  - Hero production: "Owner generates an original RIFANO watch (RF on dial) with Nano Banana, animates it with Veo, frames extracted with ffmpeg. See specs/13."
  - Fonts: "Self-hosted variable WOFF2 in theme assets (OFL licences)."
  - RF monogram: "Traced to SVG from brand/rifano-logo.PNG in specs/02."
  - Analytics: "Out of v1 theme scope; handled via Shopify customer events/apps later."
- Add under Evidence on Hand: "brand/watches/*.png show third-party brands (AP, Emporio Armani, Rolex, Casio). Reference only; never shipped or shown."

### 2. Locale
- Create `fr.default.json` with all existing keys translated to French, plus a `rifano` namespace used by later specs. Seed it with:
  `rifano.announcement` = "Paiement à la livraison · Livraison gratuite partout au Maroc",
  `rifano.tagline_1` = "Be different.", `rifano.tagline_2` = "Be RIFANO.", `rifano.welcome` = "Mrehba bik".
  (Tagline stays English by brand choice.)
- Delete `en.default.json`. Keep `en.default.schema.json` (editor labels may stay English).

### 3. Fonts (OFL, self-hosted)
- Get variable Latin WOFF2 files from npm `@fontsource-variable/bodoni-moda` and `@fontsource-variable/manrope`
  (install into a temp folder outside `theme/`, e.g. `tools/fonts-tmp/`, then copy the `latin-wght-normal` (+ Bodoni `latin-wght-italic`) woff2 files and rename as above). Do not commit node_modules.
- `@font-face` in `critical.css` with `font-display: swap`, `font-weight` ranges (Bodoni 400 900, Manrope 200 800), using `{{ 'file.woff2' | asset_url }}`.
  Since CSS assets can't run Liquid unless named `.css.liquid`, put the `@font-face` rules in `snippets/css-variables.liquid` (inline `<style>`), which already exists for this purpose.
- Preload only `manrope-var.woff2` and `bodoni-moda-var.woff2` in `theme.liquid`. Remove the old `font_picker` preload and the `type_primary_font` setting.

### 4. Tokens: `theme/assets/tokens.css`, the single source of truth
Use these starting values exactly. `/impeccable` may refine them later, but only by editing this file.
```css
:root {
  /* colour: tinted near-black ground, never #000 */
  --c-bg: #0d0e10;          /* page */
  --c-surface: #15161a;     /* cards, drawers */
  --c-surface-2: #1d1f24;   /* hover, inputs */
  --c-line: #2a2d33;        /* hairlines */
  --c-text: #ecebe8;        /* primary text (warm) */
  --c-text-2: #a7a9ae;      /* secondary text (tinted, ≥ 4.5:1 on --c-bg) */
  --c-silver-1: #e7e9ec; --c-silver-2: #b9bdc3; --c-silver-3: #7f848b;
  --c-silver: linear-gradient(135deg, var(--c-silver-1) 0%, var(--c-silver-2) 45%, var(--c-silver-3) 70%, var(--c-silver-1) 100%);
  --c-accent: var(--c-silver-2); /* focus rings, active states */
  --c-danger: #e0796b; --c-success: #8fc5a0;

  /* type */
  --font-display: "Bodoni Moda", "Didot", Georgia, serif;
  --font-body: "Manrope", system-ui, sans-serif;
  --fs-xs: 0.75rem; --fs-sm: 0.875rem; --fs-md: 1rem; --fs-lg: 1.125rem;
  --fs-xl: clamp(1.375rem, 1.1rem + 1.2vw, 1.75rem);
  --fs-2xl: clamp(1.75rem, 1.3rem + 2vw, 2.5rem);
  --fs-3xl: clamp(2.5rem, 1.6rem + 4.5vw, 4.75rem);   /* hero tagline */
  --lh-tight: 1.05; --lh-snug: 1.25; --lh-body: 1.6;
  --tracking-label: 0.14em;  /* uppercase Manrope labels */
  --tracking-display: -0.01em;

  /* space: 4px base */
  --s-1: 0.25rem; --s-2: 0.5rem; --s-3: 0.75rem; --s-4: 1rem; --s-5: 1.5rem;
  --s-6: 2rem; --s-7: 3rem; --s-8: 4rem; --s-9: 6rem;
  --section-y: clamp(3rem, 2rem + 4vw, 6rem);
  --gutter: clamp(1rem, 0.6rem + 1.6vw, 2rem);
  --page-max: 90rem;

  /* shape and depth */
  --radius-sm: 2px; --radius-md: 4px; --radius-pill: 999px;
  --shadow-lift: 0 1px 0 rgb(255 255 255 / 0.04) inset, 0 12px 32px -12px rgb(0 0 0 / 0.6);

  /* motion */
  --ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);
  --dur-1: 160ms; --dur-2: 280ms; --dur-3: 600ms;

  /* layers */
  --z-header: 50; --z-drawer: 100; --z-toast: 150;
}
@media (prefers-reduced-motion: reduce) { :root { --dur-1: 0ms; --dur-2: 0ms; --dur-3: 0ms; } }
```
Load `tokens.css` before `critical.css` in `theme.liquid` and `password.liquid`.

### 5. Base CSS
- `critical.css`: modern reset, `html { color-scheme: dark; background: var(--c-bg); }`, body font, colour, `-webkit-font-smoothing`, `text-rendering: optimizeLegibility`, `img { max-width: 100%; height: auto; display: block }`, `:focus-visible { outline: 1px solid var(--c-accent); outline-offset: 3px }`, `.visually-hidden`, `.page-width` (max-width `--page-max`, padding-inline `--gutter`), skip link styles.
- Typography helpers in `base.css`: `.t-display` (Bodoni, `--tracking-display`, `--lh-tight`), `.t-label` (Manrope 500, `--fs-xs`, uppercase, `--tracking-label`, `--c-text-2`), `.t-body`, `.t-muted`.
- Buttons: `.btn` (primary: silver gradient background `--c-silver`, text `--c-bg`, Manrope 600, label tracking, min-height 48px, radius `--radius-sm`), `.btn--ghost` (1px `--c-line` border, text `--c-text`), `.btn--block`. Hover = subtle brightness and transition `--dur-1`.
- Inputs: `--c-surface-2` background, 1px `--c-line`, 48px min-height, label above.
- Add a skip link `Aller au contenu` (translation key) as the first element in `<body>`.

### 6. Theme settings: new group "RIFANO" in `settings_schema.json`
| id | type | default |
|---|---|---|
| `announcement_text` | text | "Paiement à la livraison · Livraison gratuite partout au Maroc" |
| `whatsapp_number` | text | "212600000000" (digits only, wa.me format) |
| `instagram_url` | url | — (blank) |
| `tiktok_url` | url | — |
| `support_email` | text | "contact@rifano.ma" |
| `delivery_text` | text | "Livraison 24–72h" |
| `warranty_text` | text | "Garantie 12 mois" |
| `returns_text` | text | "Retours sous 7 jours" |
| `home_rows_menu` | link_list | — (menu whose links = collections for home rows) |
| `rows_visible` | range 1–6 | 3 |
Remove `type_primary_font`. Keep `max_page_width` and `min_page_margin`, but map them onto `--page-max` / `--gutter` only if set.

### 7. DESIGN.md
Run `/impeccable document` (or write by hand if the command can't) to produce `DESIGN.md` describing:
the tokens above and their roles, the type pairing and usage rules (Bodoni only for display ≥ `--fs-xl` and prices; Manrope for everything else),
the silver rule (the gradient is used **only** for primary buttons, the monogram, and 1px accent hairlines, never for large fills or body text),
motion rules (subtle, ease-out, ≤ 600ms, no bounce, reduced-motion honoured), imagery (product on near-black, no lifestyle stock), the component list from PLAN.md, and "Brand commitments are intentional".

### 8. Home template
Replace `templates/index.liquid` with one empty `container` holding `<h1 class="visually-hidden">{{ shop.name }}</h1>`. Specs 06–07 fill it.

## Acceptance
- [ ] `theme check` 0 errors; no reference left to deleted files or `type_primary_font`
- [ ] `html` background is `#0d0e10`, body text is Manrope, `.t-display` renders Bodoni Moda (check in DevTools → Computed → Rendered fonts)
- [ ] No raw hex outside `tokens.css`
- [ ] `fr.default.json` is the only storefront locale; `rifano.*` keys exist
- [ ] RIFANO settings group visible in the theme editor
- [ ] DESIGN.md exists and states the silver rule and brand commitments
- [ ] PRODUCT.md TBDs resolved as listed

Commit: `feat(01): foundations: fr locale, fonts, tokens, base, settings`
