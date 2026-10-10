# Spec 10 — Cart drawer + cart page

## Goal
A right-side cart drawer that opens after add-to-cart, plus a `/cart` page that renders **the same markup**.
Both must make the COD + free-delivery promise obvious right before checkout.

## Files
- `theme/sections/cart-drawer.liquid` (new; rendered statically once by the layout), `theme/sections/cart-contents.liquid` (new; the one shared cart section), `theme/sections/cart-count.liquid` (new; tiny endpoint section that re-renders the header count)
- `theme/templates/cart.json` (rebuild the spec-00 stub: compose `main-cart` — the page title — plus the shared `cart-contents`), `theme/layout/theme.liquid` (render `{% section 'cart-drawer' %}` once, after `{% sections 'footer-group' %}`)
- `theme/assets/cart.css`, `theme/assets/cart.js` (new)
- `theme/sections/header.liquid` (cart icon opens the drawer instead of navigating, when JS is available)
- `theme/locales/fr.default.json`

## cart-contents (`theme/sections/cart-contents.liquid`, the one shared cart section)
The /cart page and the drawer both display this section, so it renders the same HTML in both places: **no per-instance settings**, only `cart` and global `settings`.
- **Items**: thumbnail 72px (4/5, contain), title (link), variant title, unit price, line price, quantity stepper (− n +), remove link ("Retirer").
  Quantity/remove → `fetch(routes.cart_change_url + '.js', {line, quantity})` with the cart regions in the same payload (`sections: 'cart-contents,cart-drawer,cart-count'`) and apply the returned HTML (Section Rendering API — no `{% partial %}`). Use `aria-busy` on the list during the update and announce "Panier mis à jour" in an `aria-live="polite"` region. Cancel stale requests (AbortController).
- **Summary**: subtotal (`cart.total_price | money`), the line "Livraison : Gratuite", and the line "Paiement : à la livraison" with icons. Cart note: no.
- **Checkout**: `<button type="submit" name="checkout" class="btn btn--block">Commander</button>` inside `<form action="{{ routes.cart_url }}" method="post">`. Under it, a small `.t-muted` line: "Vous payez en espèces à la réception."
- **WhatsApp fallback** under the checkout button (ghost, small): "Une question ? Écrivez-nous sur WhatsApp".
- **Empty state**: monogram 40px, "Votre panier est vide.", button "Découvrir la boutique" → `routes.collections_url`, then "Nos pièces du moment": 4 product cards from `collections.all.products` (first 4), or placeholders.
- Errors (e.g. quantity above stock): inline message per line, `role="alert"`, quantity reset to what the server returned (see `theme/AGENTS.md` note on server-adjusted controls).

## Drawer (`theme/sections/cart-drawer.liquid`)
- `<dialog id="cart-drawer">` from the right, width `min(440px, 100vw)`, header "Panier (n)" + close button, a body area, summary pinned at the bottom.
- Rendered statically by `layout/theme.liquid` (`{% section 'cart-drawer' %}`) so it exists on every page with a stable id (`cart-drawer`).
- `cart.js` fills the drawer from the **same `cart-contents` section HTML** the /cart page renders (`fetch(routes.cart_url + '?section_id=cart-contents')`, or the `sections` bundle returned by the cart add/change calls) and warms it once after page load so opening is instant. No item markup is duplicated in the drawer.
- Opens on: `cart:added` event (spec 09), or clicking the header cart icon (prevent navigation only when JS is ready).
  On `cart:added`, first refresh the cart sections via the Section Rendering API, then `showModal()`, focus the dialog heading.
- Close: button, Esc, backdrop click. Return focus to the trigger. Lock page scroll.
- Hides the product page's sticky ATC while open.
- Reduced motion: no slide.

## Cart count (`theme/sections/cart-count.liquid`)
Tiny static endpoint section that renders exactly the header's `#cart-icon-bubble` markup. `cart.js` replaces that element with the Section Rendering API result (`sections: 'cart-count'` bundle or `?section_id=cart-count`) so the badge stays in sync without re-rendering the whole header.

## Cart page (`theme/templates/cart.json`)
Title "Panier" (`main-cart`), then the shared `cart-contents` section in a centred column, max-width 720px. Works fully without JS (quantity inputs + "Mettre à jour" submit in `<noscript>`).

## Acceptance
- [ ] Add from product page → drawer opens showing the new item and the updated count in the header badge
- [ ] Change quantity / remove → totals and badge update without reload; screen reader announces it
- [ ] "Commander" goes to Shopify checkout (COD is offered there once enabled in admin, spec 16)
- [ ] Empty state with suggestions; no errors when `collections.all` is empty
- [ ] `/cart` works with JS disabled
- [ ] theme check 0 errors

Commit: `feat(10): cart drawer + cart page`
