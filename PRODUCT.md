# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are 17–40, mostly in Morocco: young working professionals, ambitious people, and entrepreneurs on their way to the top 1%. They arrive predominantly on mobile, frequently from Instagram or TikTok, and arrive with little patience for friction. Secondary usage context is the store owner (RIFANO), who configures the theme in Shopify admin and ships copy, products, and policy text in.

Accessibility: WCAG 2.2 AA.

## Product Purpose

RIFANO is a Shopify storefront for Moroccan watch and men's-accessory commerce. It sells watches with a luxury look plus two accessory lines: necklaces (colliers) and pouches/bags (pochettes & sacs).

Mission, verbatim: "We sell you the watch you deserve. Your time matters, and the watch on your wrist is your prestige."

Success means a visitor landing from a short-form video or a shared link can browse, understand the product, and reach a confirmed Cash on Delivery order without friction, entirely on a phone, in French.

## Positioning

The 1% mindset: prestige, aura, ambition, productivity. RIFANO speaks to people who are on their way to the top 1%, and it treats a watch as a marker of earned status rather than an accessory.

The mechanism that a neighbouring store could not truthfully copy is positioning plus channel: Moroccan Instagram/TikTok-native discovery funnelled into a cash-on-delivery, free-delivery-anywhere-in-Morocco purchase, where the risk sits with the merchant, not the customer. Free delivery everywhere in Morocco plus COD only is a deliberate commitment, not a promotion.

## Operating Context

- Store: Shopify Basic, launch (main) store **`xpziwn-tw`** (not open yet, password on; owner/staff access confirmed 2026-10-14); dev/preview store `fexgzv-pq`, where all development and QA happens. Currency MAD.
- Launch market: Morocco. Spain is planned later and is explicitly out of scope for v1.
- Commerce: Cash on Delivery only, free delivery everywhere in Morocco, native Shopify checkout with COD enabled.
- UI language: French. Darija is permitted only for small brand touches (e.g. "Mrehba bik"). Tagline: "Be different. Be RIFANO."
- Storefront code: Online Store 2.0: sections + JSON templates + section groups in `theme/`, liquid-only.
- Verification gate: theme check 0 errors + push smoke 0 errors on fexgzv-pq before every commit.

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

Policy and contact values confirmed by the owner (2026-10-14): delivery 24–48h, warranty 3 months, returns within 14 days. Contact: WhatsApp `+212 6 58 25 05 49`, Instagram `@rifano.ma`, TikTok `@rifano.ma`. Still a placeholder [PH]: email `contact@rifano.ma` (no support email supplied yet).

Undecided product facts: the real catalogue (products, variants, prices, photography) is TBD; whether COD is already switched on in the live store admin is TBD; shipping zones, rates, and carrier are TBD.

Decided: Hero production — Owner generates an original RIFANO watch (RF on dial) with Nano Banana, animates it with Veo, frames extracted with ffmpeg. See specs/13. Fonts — Self-hosted variable WOFF2 in theme assets (OFL licences). RF monogram — Traced to SVG from brand/rifano-logo.PNG in specs/02. Analytics — Out of v1 theme scope; handled via Shopify customer events/apps later.

## Brand Commitments

These are deliberate brand decisions. They are not anti-patterns to be corrected by later design work.

**Identity.** RIFANO is "the ambitious one on his way to the 1%". The brand sells to people who
intend to get there, and it treats a watch as a marker of earned status rather than an accessory. Premium
is expressed by what is withheld, not by what is added: restraint, space, precise type, few words, and a
single brushed-silver accent that is rare enough to be worth something. The site must feel simple,
prestige, premium and trusted at the same time — it is a shop, not a showroom, and a visitor arriving
from Instagram or TikTok has to believe a real merchant stands behind the order within seconds.

- Palette: **pure black `#000000` + void essence `#080808` + brushed silver** — the page, header, bars and footer share pure black and are separated by 1px hairlines, not grey bands; raised surfaces use void essence. Chrome is opaque: no blur, no translucency.
- Typography: Tenor Sans for display, Hanken Grotesk for body.
- Tone: simple, prestige, premium, trusted. Realistic 3D, subtle animation, subtle scroll. Never flashy or gimmicky, and nothing loops.
- Motion: subtle, realistic and scroll-linked; reduced motion is a supported path, never a stripped one.
- Silver is earned: primary buttons, the RF monogram, and 1px accent hairlines only. Never a filled badge, pill or surface — counts are numerals.

Assets on hand: `brand/rifano-logo.PNG`, and `brand/watches/Watch-1.png` through `Watch-5.png` (third-party reference renders, never shipped or shown; Watch-5 added 2026-10-14).

Anti-references, to be avoided: cluttered Moroccan dropshipping stores, mixed French/English UI, cheap badge spam, purple gradients.

Reference studied: maisonduhype.com. Keep its persistent COD announcement bar and its homepage category rows. Avoid its empty contact page, its missing FAQ, and its empty cart.

## Evidence on Hand

What exists: the brand logo and the five reference watch renders listed above; the OS 2.0 theme in `theme/` (sections + JSON templates + section groups) with its shipped templates; progress in AGENTS.md §7.

What does not exist and must never be fabricated: product photography and product data beyond the reference watch renders, customer testimonials or reviews, press, benchmarks, delivery or warranty records, or sales figures. No product listings have been confirmed to exist in the store. `brand/watches/*.png` show third-party brands (AP, Emporio Armani, Rolex, Casio). Reference only; never shipped or shown.

## Product Principles

1. Prestige is earned, not asserted. Show the product and the proof a real store can stand behind; no invented urgency, no badge spam.
2. Phone first. Instagram and TikTok traffic means the mobile experience is the product, not a fallback.
3. Friction is the enemy of the 1% mindset. One tap to buy, COD so there is no risk, clear answers on delivery, warranty, returns, and contact.
4. French is the store's voice; Darija is a seasoning, never the language of a policy or a price.
5. Restraint over spectacle. Subtle motion and realism; if a flourish needs attention to be noticed, it does not ship.
