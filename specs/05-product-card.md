# Spec 05 — Product card, price, placeholders

## Goal
One product card used everywhere (home rows, collection, search, recommendations, cart suggestions) that looks premium with real products **and** with none.

## Files
- `theme/snippets/product-card.liquid` (new), `theme/snippets/price.liquid` (new), `theme/snippets/image.liquid` (adjust if needed)
- `theme/assets/product-card.css` (new), `theme/locales/fr.default.json`

## product-card.liquid
LiquidDoc params: `product` (product or nil), `placeholder_index` (1–6, used when product is nil), `sizes` (string), `loading` (`'lazy'` default, `'eager'` for first row).
- Markup: `<article class="card">` → link wrapping media + info (one link only, `aria-label` = title).
- Media: aspect-ratio **4/5**, background `--c-surface`, image `object-fit: contain` (watches on black must not be cropped), `srcset` via `image_url` widths 360/540/720/960, `sizes` param. If the product has a second image, show it on hover (desktop only, opacity crossfade `--dur-2`). No hover swap on touch.
- Info: title (Manrope 500 `--fs-sm`, 2-line clamp), price (`render 'price'`).
- Badges: only `Épuisé` (sold out) and `-X%` when `compare_at_price > price`. `.t-label`, 1px silver border, no filled colours. No "Hot", "Best seller" or invented badges.
- Placeholder mode (product nil): `{{ 'product-' | append: placeholder_index | placeholder_svg_tag: 'card__placeholder' }}` tinted with `--c-silver-3` stroke on `--c-surface`, title "Produit à venir", price hidden.

## price.liquid
Params: `product` or `variant`. Shows `price | money` in **Bodoni Moda** (allowed: prices use display font), compare-at struck through in `--c-text-2`. `price_varies` → "À partir de …". The money format itself is set in admin (spec 16), not here.

## Card motion
Hover (pointer: fine only): image scale 1.03 over `--dur-3 --ease-out`, card lift none. Focus-visible ring on the link.

## Acceptance
- [ ] A temporary test grid on the home page renders 4 placeholder cards + any real products (remove the test grid before commit)
- [ ] No layout shift when images load (aspect-ratio reserved)
- [ ] Sold-out and on-sale states correct (test with a product in admin if one exists; otherwise review the code path)
- [ ] theme check 0 errors

Commit: `feat(05): product card, price, placeholders`
