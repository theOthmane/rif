# Spec 04 — Footer

## Goal
A calm, complete footer that fixes what the reference store lacked: real contact channels, policies, and the COD promise.

## Files
- `theme/blocks/footer.liquid` (rewrite), `theme/assets/footer.css`, `theme/locales/fr.default.json`

## Layout (mobile first, top to bottom)
1. **Promise strip**: 3 items in a row (stack on <480px): `icon cash` "Paiement à la livraison", `icon truck` `settings.delivery_text` + " · gratuite", `icon shield` `settings.warranty_text`. `.t-label`, centred, separated by 1px `--c-line`.
2. **Brand**: `{% render 'logo', variant: 'lockup' %}` centred (monogram 56px), one line under it in Bodoni italic: "Be different. Be RIFANO." (keys `rifano.tagline_1`/`_2`).
3. **Link columns** (block settings `menu_shop` default `footer`, `menu_help` default `footer-help`): column titles "Boutique" and "Aide" in `.t-label`. On mobile, each column is a `<details>` accordion; ≥768px both columns are open side by side (use CSS, plus `open` set by a tiny script, or render twice with display rules. Pick one and keep it accessible).
4. **Contact**: WhatsApp, email, Instagram, TikTok (only those with values) as icon + text links.
5. **Legal bar**: `© {{ 'now' | date: '%Y' }} RIFANO` · links to `shop.privacy_policy`, `shop.refund_policy`, `shop.shipping_policy`, `shop.terms_of_service` (render only those that exist, using `policy.url` / `policy.title`).
   No card-brand payment icons (COD only).

## Style
Background `--c-bg`, top border 1px `--c-line`, padding `--section-y` top, `--s-6` bottom. Text `--c-text-2`, links `--c-text` on hover with a 1px underline offset 4px.

## Acceptance
- [ ] Works with no menus created yet (columns simply hidden, no errors)
- [ ] All policy links resolve when policies exist in admin
- [ ] Accordions keyboard-operable; no layout shift on open
- [ ] theme check 0 errors

Commit: `feat(04): footer`
