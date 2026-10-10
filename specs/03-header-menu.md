# Spec 03 — Announcement bar, header, menu drawer

## Goal
The shell from the owner's sketch: **☰ left · RF monogram centre · cart right**, with a persistent COD bar above it
and a full-height menu drawer holding navigation, search and contact.

## Files
- `theme/blocks/announcement.liquid` (new), `theme/blocks/header.liquid` (rewrite), `theme/blocks/menu-drawer.liquid` (new)
- `theme/layout/theme.liquid` (compose: announcement → header → menu drawer, all inside the existing header container, or a second container if cleaner)
- `theme/assets/header.css`, `theme/assets/menu-drawer.js` (new)
- `theme/locales/fr.default.json`

## Requirements

### Announcement bar
- Text = `settings.announcement_text` (fallback to `rifano.announcement`). Single line, centred, `.t-label`, `--c-text-2`, background `--c-surface`, 1px bottom `--c-line`, height 36px.
- If text is too long on mobile: truncate with ellipsis. **No marquee, no auto-rotation.**
- Hidden on the password page.

### Header
- Sticky (`position: sticky; top: 0; z-index: var(--z-header)`), height 64px mobile / 76px ≥1200px, background `--c-bg` at 85% with `backdrop-filter: blur(12px)`; 1px bottom hairline that appears only after scrolling 8px (toggle a class via a tiny IntersectionObserver sentinel, no scroll listener).
- 3-column grid: `[menu button] [logo] [cart]`, logo perfectly centred regardless of side widths.
- Menu button: `icon menu`, `aria-controls="menu-drawer"`, `aria-expanded`, label "Menu" (visually hidden).
- Logo: `{% render 'logo', variant: 'monogram' %}` at 32px height, links to `routes.root_url`; always a `<div>` (the home `<h1>` is the hero tagline, spec 06).
- Cart: `icon cart` + count badge (small silver dot with number, hidden at 0), `href=routes.cart_url`, `aria-label` "Panier (n articles)". Add `id="cart-icon-bubble"` wrapped in `{% partial 'cart-count' %}` so spec 10 can refresh it.
- ≥1200px: also show the main menu links inline to the left of the logo? **No.** Keep the sketch layout at every width. The drawer is the navigation.
- Remove the customer account icon (accounts are out of v1).

### Menu drawer
- `<dialog id="menu-drawer" class="menu-drawer">` opened with `showModal()`. Slides in from the left (`transform` transition `--dur-2 --ease-out`). Width `min(420px, 100vw)`; full height; background `--c-surface`.
- Top: close button (icon `close`) + small `rifano.welcome` "Mrehba bik" in `.t-label`.
- Search: `<form action="{{ routes.search_url }}">` with `type=search name=q`, placeholder "Rechercher une montre, un collier…", `<input type=hidden name=type value=product>`.
- Navigation: the `main-menu` link list (block setting `menu`, default `main-menu`). Top-level links in Bodoni Moda `--fs-xl`. If a link has children, use `<details>` with chevron. Active link marked `aria-current="page"`.
- Bottom: WhatsApp link (`https://wa.me/{{ settings.whatsapp_number }}`), Instagram, TikTok (only if URL set), support email. Then the COD + delivery line in `.t-muted`.
- Close on: close button, Esc (native), backdrop click, link click. Return focus to the menu button. Lock body scroll while open (`overflow: hidden` on `html`).
- `menu-drawer.js`: custom element `<menu-drawer>` wrapping the button + dialog logic. No inline `onclick`.
- Reduced motion: no slide, just show.

## Acceptance
- [ ] 375px: ☰ / RF / cart on one row, logo centred, no overflow; same at 1440px
- [ ] Drawer opens and closes with mouse, keyboard (Enter, Esc) and touch; focus returns to ☰
- [ ] Search from the drawer lands on `/search?q=…`
- [ ] Cart badge hidden when the cart is empty, shows the count otherwise
- [ ] Announcement bar shows the setting text and never animates
- [ ] theme check 0 errors

Impeccable: after building, run `/impeccable critique header` and fix anything rated high.
Commit: `feat(03): announcement bar, header, menu drawer`
