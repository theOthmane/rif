# Spec 12 — Search, 404, Password "Bientôt", policies, gift card

## Files
- `theme/sections/main-search.liquid`, `theme/sections/main-404.liquid`, `theme/sections/main-password.liquid` (rewrite the spec-00 stubs; `theme/templates/search.json`, `404.json` and `password.json` already compose them)
- `theme/layout/password.liquid`, `theme/templates/gift_card.liquid`
- delete `theme/templates/blog.json`, `theme/templates/article.json` and their `theme/sections/main-blog.liquid` / `main-article.liquid` **only if** theme check allows it (blog is out of scope). If they're required, restyle them minimally instead.
- `theme/assets/system.css`, `theme/locales/fr.default.json`

## Search
- Big search field at the top (prefilled with `search.terms`), results count "{{ n }} résultats pour « … »".
- Results: products with `product-card` in the collection grid; pages/articles as simple text rows below. Paginate 24.
- No results: "Aucun résultat pour « … »." + suggestions: links to the home-row collections + the Boutique.
- No predictive search in v1.

## 404
Centred: monogram 64px, "Page introuvable", "Le temps est précieux, ne le perdez pas ici." (owner may change), buttons "Accueil" and "Boutique".

## Password page ("Bientôt")
Full-viewport, `--c-bg`, centred column:
lockup logo → Bodoni "Bientôt." → `rifano.tagline_*` → `rifano.welcome` small → email signup (`{% form 'customer' %}` with `contact[tags]=prospect`, success "Merci, vous serez prévenu en premier.") → small "Accès boutique" `<details>` revealing the password form (`{% form 'storefront_password' %}`).
Socials at the bottom. Uses tokens.css + critical.css, no header/footer, no announcement bar.

## Policies
Shopify renders policy pages through `theme.liquid` with `.shopify-policy__container`. Style it in `system.css`: max-width 65ch, centred, title in Bodoni, body uses the rte rules from spec 11.

## Gift card
Keep it functional (it's required). Restyle with tokens: dark card, monogram, code in a mono-spaced pill, "Copier le code" button, QR code. Don't over-invest.

## Acceptance
- [ ] Search works for products; empty and no-result states look intentional
- [ ] Password page works with password protection on (preview it via `/password`)
- [ ] A policy page (e.g. `/policies/refund-policy`) looks styled
- [ ] theme check 0 errors

Commit: `feat(12): search, 404, password, policies, gift card`
