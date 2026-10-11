# Spec 09 — Product page

## Goal
The page that sells. Large, calm product imagery on black, clear price, the COD / free-delivery / warranty promises
right next to the button, a WhatsApp fallback for hesitant buyers, and a sticky add-to-cart on mobile.

## Files
- `theme/templates/product.json` (compose the sections below; the spec-00 `main-product` stub is deleted once the page is rebuilt)
- `theme/sections/product-gallery.liquid`, `theme/sections/product-info.liquid`, `theme/sections/product-recommendations.liquid` (new)
- `theme/snippets/trust-badges.liquid`, `theme/snippets/whatsapp-link.liquid` (new)
- `theme/assets/product.css`, `theme/assets/product-form.js`, `theme/assets/product-gallery.js` (new)
- `theme/locales/fr.default.json`

## Layout
Mobile: gallery → info → details → recommendations. ≥1024px: two columns, gallery 7/12 (scrolls), info 5/12 (`position: sticky; top: header height + --s-5`).

### Gallery
- Mobile: horizontal scroll-snap strip, one image per screen width, `aspect-ratio: 1`, `object-fit: contain` on `--c-surface`, pagination dots below (buttons, `aria-label` "Image 2 sur 5"), dot state synced with an IntersectionObserver.
- Desktop: vertical stack of images, first one large, subsequent ones 2-up.
- Click/tap an image → fullscreen `<dialog>` zoom viewer (pinch zoom native, swipe between images, Esc to close). Keep it simple; native `<dialog>` + `<img>` at width 2000.
- Variant change → scroll the gallery to the variant's `featured_media`.
- No product images → one `product-1` placeholder.

### Info column (order)
1. `.t-label` vendor-free eyebrow: the product's first collection title (or "RIFANO").
2. Title: Bodoni `--fs-2xl`.
3. Price (`render 'price'`); "TTC · Livraison gratuite" in `.t-muted` under it.
4. **Variant picker**: one `<fieldset>` per option, values as pill radio buttons (48px tall, 1px `--c-line`, selected = silver 1px border + `--c-surface-2`). Unavailable combos: struck through, still selectable (shows "Épuisé").
   `product-form.js`: on change, find the matching variant from a `<script type="application/json">` holding `product.variants` (id, options, available, price, compare_at_price, featured_media id), update the hidden `id` input, price, ATC state, the URL `?variant=` (`history.replaceState`) and the gallery.
5. Quantity stepper (− 1 +), min 1, 44px buttons.
6. **Add to cart**: `.btn .btn--block` "Ajouter au panier". Sold out → disabled "Épuisé". Submits via `fetch(routes.cart_add_url + '.js')`. On success, dispatch `document.dispatchEvent(new CustomEvent('cart:added', {detail}))` (spec 10 opens the drawer); until spec 10 exists, fall back to redirecting to `routes.cart_url`. On error show the message inline (`role="alert"`).
   Keep a normal `{% form 'product' %}` so it works without JS **and** so COD-form apps (EasySell etc.) can hook the standard product form.
7. `{{ form | payment_button }}` → **remove**. Dynamic checkout buttons don't fit COD.
8. **App slot**: add `"blocks": [{ "type": "@app" }]` to the `product-info` section schema and render `{% content_for 'blocks' %}` right under the ATC. App blocks require the section to be part of a JSON template — they are not supported in statically rendered sections. If it does not work, document the finding in your reply and the commit message (COD apps also work as app embeds that target the product form).
9. **Trust badges** (`trust-badges` snippet): 3 rows with icon + text, `.t-sm`: `cash` "Paiement à la livraison", `truck` `settings.delivery_text` + " · Gratuite partout au Maroc", `shield` `settings.warranty_text`. Thin top/bottom hairlines. No coloured badges, no fake stock counters, no countdowns.
10. **WhatsApp** (`whatsapp-link` snippet): ghost button "Commander sur WhatsApp" with icon, link `https://wa.me/{{ settings.whatsapp_number }}?text=` + url-encoded "Bonjour RIFANO, je souhaite commander : {{ product.title }} ({{ variant title }}) {{ shop.url }}{{ product.url }}". Opens in a new tab with `rel="noopener"`.
11. **Details**: `<details>` accordions: "Description" (`product.description`, open by default), "Livraison & paiement" (delivery + COD text from settings), "Garantie & retours" (warranty + returns settings, link to refund policy).

### Sticky add-to-cart (mobile only, <1024px)
Bar fixed at the bottom with thumbnail 40px, title (1 line), price, and a compact ATC button. Appears only when the main ATC is **out of view** (IntersectionObserver), slides up `--dur-2`. Hidden when the drawer or a dialog is open. Respects the iOS safe area (`padding-bottom: env(safe-area-inset-bottom)`).

### Recommendations
"Vous aimerez aussi": use the Product Recommendations API (`routes.product_recommendations_url` + `?product_id=&limit=4&section_id=`). Render `recommendations.products` server-side in the `product-recommendations` section and fetch it with the Section Rendering API (`section_id` = the section's `section.id`). Check with the Shopify Dev MCP how recommendations + `section_id` work together. If it can't, fall back to 4 products from the product's first collection (excluding the current one). Same horizontal row style as home rows.

### SEO
Product JSON-LD (`{{ product | structured_data }}` if available via MCP check, otherwise hand-written `Product` + `Offer` with `priceCurrency` MAD and availability).

## Acceptance
- [ ] Works for: a single-variant product, a multi-option product, a sold-out variant, a product with 0 images
- [ ] Variant change updates price, availability, URL and gallery
- [ ] Add to cart works with JS on (event fired) and JS off (form post)
- [ ] Sticky bar appears/disappears correctly; never covers the footer links (add body padding when visible)
- [ ] WhatsApp link opens with the prefilled French message
- [ ] No dynamic checkout buttons, no fake urgency
- [ ] theme check 0 errors

Impeccable: `/impeccable critique product` then `/impeccable harden product` (edge cases, long titles, many variants).
Commit: `feat(09): product page`
