# Spec 17 — New font pair + one-band footer

## Goal
1. Replace **Bodoni Moda + Manrope** everywhere with **Tenor Sans** (display) + **Hanken Grotesk** (body). The owner picked them from a specimen.
2. Rebuild the footer as **one calm band**. The current footer is a tall stack of centred strips (promise strip, big lockup, lonely link column, contact row): too big, badly placed.

## Files
- `theme/assets/tenor-sans-400.woff2`, `theme/assets/hanken-grotesk-var.woff2` (new)
- delete `theme/assets/bodoni-moda-var.woff2`, `bodoni-moda-italic-var.woff2`, `manrope-var.woff2`
- `theme/snippets/css-variables.liquid`, `theme/layout/theme.liquid`, `theme/layout/password.liquid`
- `theme/assets/tokens.css`, `theme/assets/base.css`, `theme/assets/home-hero.css`, `theme/assets/collection.css`, `theme/assets/header.css`, `theme/assets/product-card.css`
- `theme/sections/footer.liquid`, `theme/assets/footer.css`, `theme/locales/fr.default.json`
- comments only: `theme/sections/collection-header.liquid` ("Bodoni" → "display")
- `DESIGN.md`, `PRODUCT.md` (font names only), `AGENTS.md` (Progress line)

## Part 1: Fonts

### Files (OFL, self-hosted)
- In a temp folder outside `theme/` (e.g. `tools/fonts-tmp/`, delete it after): `npm i @fontsource/tenor-sans @fontsource-variable/hanken-grotesk`.
- Copy `tenor-sans-latin-400-normal.woff2` → `theme/assets/tenor-sans-400.woff2` and `hanken-grotesk-latin-wght-normal.woff2` → `theme/assets/hanken-grotesk-var.woff2`.
- Tenor Sans has **one weight (400) and no italic**. Never ask it for bold or italic: add `font-synthesis: none` on `.t-display`, `.t-page-title` and any rule using `--font-display`.

### Wiring
- `css-variables.liquid`: replace the 3 `@font-face` rules with 2:
  `"Tenor Sans"` (weight 400, normal, swap) and `"Hanken Grotesk"` (weight `100 900`, normal, swap).
- `theme.liquid` + `password.liquid`: preload exactly these two files (same `preload_tag` pattern as now).
- `tokens.css`:
  ```css
  --font-display: "Tenor Sans", "Optima", "Gill Sans", system-ui, sans-serif;
  --font-body: "Hanken Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif;
  --tracking-display: 0.02em;   /* Tenor reads better slightly open, never negative */
  ```
  Keep every other token.

### Usage rules (replace the old Bodoni/Manrope rules in DESIGN.md)
- **Tenor Sans (display):** hero tagline, page titles, section/row titles, prices, the RIFANO wordmark (uppercase, tracking `0.32em`). Sizes ≥ `--fs-lg` only, weight 400 only.
- **Hanken Grotesk (body):** everything else: body 400, UI and buttons 500, labels 500 uppercase with `--tracking-label`.
- **No italics anywhere.** Remove every `font-style: italic` on display text (`home-hero.css` tagline line 2, `collection.css`, `footer.css`). The silver gradient alone carries the accent on "Be RIFANO."
- Line-height: display `--lh-tight` is too tight for Tenor at small sizes. Use `1.1` for the hero (`--fs-3xl`) and `--lh-snug` for titles ≤ `--fs-2xl`.
- Update all comments that say "Bodoni"/"Manrope" to "display"/"body".

### Docs
- `DESIGN.md`: replace font names and usage rules as above (Direction point 3, Type tokens, Type pairing section, Brand commitments). Keep the rest.
- `PRODUCT.md` Brand Commitments: "Typography: Tenor Sans for display, Hanken Grotesk for body."

## Part 2: Footer: one band

Delete the promise strip (the announcement bar already carries COD + free delivery; it was the 3rd repeat on screen) and the centred stack. New structure inside `.site-footer__inner` (max-width `--page-max`, gutter `--gutter`):

```
Desktop ≥ 1024px
┌─────────────────────────────────────────────────────────────────────┐
│ [RF 28px] RIFANO        Montres  Colliers  Pochettes  FAQ  Contact │  ← row 1: brand left, nav right
│                          ◯ WhatsApp   ✉ Email   ◎ Instagram  ♪ TikTok│  ← row 2: contact, aligned with nav
│─────────────────────────────────────────────────────────────────────│  1px hairline
│ © 2026 RIFANO · Be different. Be RIFANO.     Confidentialité · CGV …│  ← legal bar
└─────────────────────────────────────────────────────────────────────┘
Mobile (375px)
RF RIFANO
Montres      Colliers          ← nav as 2-column grid, left-aligned
Pochettes    FAQ
Contact
◯ WhatsApp  ✉ Email           ← contact wraps
───────────
© 2026 RIFANO
Be different. Be RIFANO.
Confidentialité · Remboursement · Livraison · CGV
```

### Markup (`footer.liquid`)
- `<footer class="site-footer">` → `<div class="site-footer__inner">`:
  1. `.footer__top`: `.footer__brand` (link to `routes.root_url`, `{% render 'logo', variant: 'monogram' %}` at 28px + wordmark text "RIFANO" in `--font-display`, uppercase, tracking 0.32em, `--fs-sm`) **and** `.footer__right` containing:
     - `<nav class="footer__nav" aria-label="{{ 'rifano.footer_nav' | t }}">` with **one** `<ul>`: links of `menu_shop` then `menu_help` (dedupe by URL). No column headings, no accordions.
     - `<ul class="footer__contact">`: WhatsApp, email, Instagram, TikTok (only those set), icon 18px + label.
  2. `.footer__legal`: `<p>© {{ 'now' | date: '%Y' }} RIFANO · {{ tagline_1 }} {{ tagline_2 }}</p>` + `<ul>` of the existing policies.
- Keep the section schema settings `menu_shop` / `menu_help`. Remove now-unused locale keys (`footer_cod`, `footer_free`, `footer_delivery_default`, `footer_warranty_default`, `footer_shop`, `footer_help`) **only** if no other file uses them (grep first). Add `rifano.footer_nav` = "Navigation du pied de page".

### Style (`footer.css`, rewrite)
- Footer: `border-top: var(--hairline)`, padding-block `--s-7` top / `--s-5` bottom. Background stays `--c-bg`. **Total height ≤ 240px at 1440px** (measure it).
- `.footer__top`: mobile = column, gap `--s-5`, left-aligned. ≥1024px = `display: flex; justify-content: space-between; align-items: flex-start; gap: --s-8`.
- `.footer__right`: column, gap `--s-3`; ≥1024px `align-items: flex-end`.
- `.footer__nav ul`: mobile `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: --s-5`; ≥1024px `display: flex; flex-wrap: wrap; justify-content: flex-end; column-gap: --s-5`.
- Nav links: body font 500, `--fs-sm`, `--c-text`, min-height 44px (tap target) with `align-items: center`; hover = underline offset `--s-1`.
- Contact: body 400, `--fs-sm`, `--c-text-2`; gap `--s-4`; wraps.
- Legal: hairline top, padding-top `--s-4`, margin-top `--s-6`; mobile column, ≥1024px row `space-between`; text `--fs-xs`, `--c-text-2`; tagline in the same line, same size (no display font, no italic).
- No centred text anywhere in the footer.

## Acceptance
- [ ] DevTools / agent-browser: computed fonts are Tenor Sans (h1, prices, wordmark) and Hanken Grotesk (body), not fallbacks. No `bodoni`/`manrope` string left in `theme/` (`grep -ri`)
- [ ] No `font-style: italic` on display text; no faux-bold Tenor
- [ ] Footer height ≤ 240px at 1440px; at 375px everything left-aligned and nothing overflows
- [ ] No promise strip in the footer; the COD text appears once per viewport on home (announcement bar)
- [ ] Works with no menus set (nav hidden, no empty `<ul>`), and with no contact settings
- [ ] Screenshots: `tools/shots/17-home-{375,768,1440}.png`, `17-footer-{375,1440}.png`, `17-collection-1440.png`, `17-drawer-375.png`
- [ ] Gates A, B, C pass (AGENTS.md §6)

Commit: `feat(17): Tenor Sans + Hanken Grotesk, one-band footer`
