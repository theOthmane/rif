# Spec 10 — Cart drawer + cart page

## Goal
A right-side cart drawer that opens after add-to-cart, plus a `/cart` page that renders **the same markup**.
Both must make the COD + free-delivery promise obvious right before checkout.

## Files
- `theme/blocks/cart-drawer.liquid` (new), `theme/blocks/cart-contents.liquid` (new; shared by drawer and page)
- `theme/templates/cart.liquid` (rewrite), `theme/layout/theme.liquid` (render the drawer once, after the footer container)
- `theme/assets/cart.css`, `theme/assets/cart.js` (new)
- `theme/blocks/header.liquid` (cart icon opens the drawer instead of navigating, when JS is available)
- `theme/locales/fr.default.json`

## cart-contents (inside `{% partial 'cart-contents' %}`)
- **Items**: thumbnail 72px (4/5, contain), title (link), variant title, unit price, line price, quantity stepper (− n +), remove link ("Retirer").
  Quantity/remove → `fetch(routes.cart_change_url + '.js', {line, quantity})` then `partials.refresh(['cart-contents','cart-count'])`. Use `aria-busy` on the list during the update and announce "Panier mis à jour" in an `aria-live="polite"` region. Cancel stale requests (AbortController).
- **Summary**: subtotal (`cart.total_price | money`), the line "Livraison : Gratuite", and the line "Paiement : à la livraison" with icons. Cart note: no.
- **Checkout**: `<button type="submit" name="checkout" class="btn btn--block">Commander</button>` inside `<form action="{{ routes.cart_url }}" method="post">`. Under it, a small `.t-muted` line: "Vous payez en espèces à la réception."
- **WhatsApp fallback** under the checkout button (ghost, small): "Une question ? Écrivez-nous sur WhatsApp".
- **Empty state**: monogram 40px, "Votre panier est vide.", button "Découvrir la boutique" → `routes.collections_url`, then "Nos pièces du moment": 4 product cards from `collections.all.products` (first 4), or placeholders.
- Errors (e.g. quantity above stock): inline message per line, `role="alert"`, quantity reset to what the server returned (see `theme/AGENTS.md` note on server-adjusted controls).

## Drawer
- `<dialog id="cart-drawer">` from the right, width `min(440px, 100vw)`, header "Panier (n)" + close button, scrollable item list, summary pinned at the bottom.
- Opens on: `cart:added` event (spec 09), or clicking the header cart icon (prevent navigation only when JS is ready).
  On `cart:added`, first refresh partials, then `showModal()`, focus the dialog heading.
- Close: button, Esc, backdrop click. Return focus to the trigger. Lock page scroll.
- Hides the product page's sticky ATC while open.
- Reduced motion: no slide.

## Cart page (`templates/cart.liquid`)
Title "Panier", then the same `cart-contents` block in a centred column, max-width 720px. Works fully without JS (quantity inputs + "Mettre à jour" submit in `<noscript>`).

## Acceptance
- [ ] Add from product page → drawer opens showing the new item and the updated count in the header badge
- [ ] Change quantity / remove → totals and badge update without reload; screen reader announces it
- [ ] "Commander" goes to Shopify checkout (COD is offered there once enabled in admin, spec 16)
- [ ] Empty state with suggestions; no errors when `collections.all` is empty
- [ ] `/cart` works with JS disabled
- [ ] theme check 0 errors

Commit: `feat(10): cart drawer + cart page`
