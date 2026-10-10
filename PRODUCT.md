# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are 17–40, mostly in Morocco: young working professionals, ambitious people, and entrepreneurs on their way to the top 1%. They arrive predominantly on mobile, frequently from Instagram or TikTok, and arrive with little patience for friction. Secondary usage context is the store owner (RIFANO), who configures the theme in Shopify admin and ships copy, products, and policy text in.

Accessibility requirements have not been established by the owner. TBD.

## Product Purpose

RIFANO is a Shopify storefront for Moroccan watch and men's-accessory commerce. It sells watches with a luxury look plus two accessory lines: necklaces (colliers) and pouches/bags (pochettes & sacs).

Mission, verbatim: "We sell you the watch you deserve. Your time matters, and the watch on your wrist is your prestige."

Success means a visitor landing from a short-form video or a shared link can browse, understand the product, and reach a confirmed Cash on Delivery order without friction, entirely on a phone, in French.

## Positioning

The 1% mindset: prestige, aura, ambition, productivity. RIFANO speaks to people who are on their way to the top 1%, and it treats a watch as a marker of earned status rather than an accessory.

The mechanism that a neighbouring store could not truthfully copy is positioning plus channel: Moroccan Instagram/TikTok-native discovery funnelled into a cash-on-delivered, free-delivery-anywhere-in-Morocco purchase, where the risk sits with the merchant, not the customer. Free delivery everywhere in Morocco plus COD only is a deliberate commitment, not a promotion.

## Operating Context

- Store: Shopify Basic, `xpziwn-tw.myshopify.com`, currency MAD.
- Launch market: Morocco. Spain is planned later and is explicitly out of scope for v1.
- Commerce: Cash on Delivery only, free delivery everywhere in Morocco, native Shopify checkout with COD enabled.
- UI language: French. Darija is permitted only for small brand touches (e.g. "Mrehba bik"). Tagline: "Be different. Be RIFANO."
- Storefront code: a Skeleton-based Shopify theme in `theme/`, liquid-only with Skeleton's section/block architecture.
- Toolchain: the global `shopify` binary is broken on this machine; use `npx @shopify/cli@latest`.
- Verification gate: `shopify theme check` must pass with 0 errors via the Shopify Dev MCP before every commit. Last run: 26 files inspected, no offenses.
- Motion tooling preflight (`tools/scroll-craft/`, gitignored) is Ready with optional items missing: `playwright-core` and Chrome not installed, `KIE_AI_API_KEY` not set, scrollcraft registry not created.

## Capabilities and Constraints

v1 pages: Home, Collection, Boutique (all collections), Product, Cart drawer and cart page, Contact & SAV, Notre mission, FAQ, Search, 404, policy pages, and a Password page that reads "Bientôt".

Homepage structure, from the owner's sketch, in order:
1. Header: hamburger left, RF monogram centre, cart right.
2. "Be different / Be RIFANO".
3. Scroll-scrubbed 3D hero featuring Watch-2.
4. Horizontal-scroll category rows with small icons: Montres, Colliers, Pochettes & Sacs.
5. A "Plus" control that reveals further rows.
6. Footer: RF logo, menu, socials, the COD + free-delivery note, and policies.

Constraints:

- The product section must include an `@app` block slot so a COD form app (e.g. EasySell) can be added later. No such app is installed yet.
- Real products may not exist yet, so every template must render a clean placeholder and a clean empty state rather than assuming inventory.
- Out of scope for v1: blog, reviews, customer accounts, order tracking, multi-language.
- Spain expansion is deferred.

Policy and contact copy is placeholders in this record and must stay marked as such until the owner supplies final text: delivery 24–72h [PH], warranty 12 months [PH], returns 7 days [PH]. Contact placeholders [PH]: WhatsApp `+212 6 00 00 00 00`, Instagram `@rifano.ma`, TikTok `@rifano.ma`, email `contact@rifano.ma`.

Undecided product facts: the real catalogue (products, variants, prices, photography) is TBD; whether COD is already switched on in the live store admin is TBD; shipping zones, rates, and carrier are TBD; how the scroll-scrubbed 3D hero is produced given that no image or 3D generation is available in the current harness is TBD; whether Bodoni Moda and Manrope ship via Shopify's `font_picker` or self-hosted files is TBD; whether the RF monogram exists as its own asset is TBD, since only `brand/rifano-logo.PNG` is on hand.

## Brand Commitments

These are deliberate brand decisions. They are not anti-patterns to be corrected by later design work.

- Palette: mostly black, but a tinted near-black rather than `#000`, with brushed silver accents.
- Typography: Bodoni Moda for display, Manrope for body.
- Tone: simple, prestige, premium, trusted. Realistic 3D, subtle animation, subtle scroll. Never flashy or gimmicky.

Assets on hand: `brand/rifano-logo.PNG`, and `brand/watches/Watch-1.png` through `Watch-4.png` (moved unmodified).

Anti-references, to be avoided: cluttered Moroccan dropshipping stores, mixed French/English UI, cheap badge spam, purple gradients.

Reference studied: maisonduhype.com. Keep its persistent COD announcement bar and its homepage category rows. Avoid its empty contact page, its missing FAQ, and its empty cart.

## Evidence on Hand

What exists: the brand logo and four watch renders listed above; the Skeleton base theme in `theme/` with its shipped templates; repo setup state in `STATUS.md`.

What does not exist and must never be fabricated: product photography and product data beyond the four watch renders, customer testimonials or reviews, press, benchmarks, delivery or warranty records, or sales figures. No product listings have been confirmed to exist in the store.

## Product Principles

1. Prestige is earned, not asserted. Show the product and the proof a real store can stand behind; no invented urgency, no badge spam.
2. Phone first. Instagram and TikTok traffic means the mobile experience is the product, not a fallback.
3. Friction is the enemy of the 1% mindset. One tap to buy, COD so there is no risk, clear answers on delivery, warranty, returns, and contact.
4. French is the store's voice; Darija is a seasoning, never the language of a policy or a price.
5. Restraint over spectacle. Subtle motion and realism; if a flourish needs attention to be noticed, it does not ship.