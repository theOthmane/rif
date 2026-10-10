# PLAN — RIFANO Shopify theme

Owner: theOthmane · Repo: https://github.com/theOthmane/rif (branch `main`)
Builder: OpenCode (DeepSeek v4.1 flash / muse-spark-1.3), one spec per session.
PM: Claude. The specs live in `specs/`.

## 1. What we are building

A luxury, black-and-silver, **French**, **mobile-first** Shopify storefront for RIFANO (watches,
necklaces, pouches/bags) with a **scroll-scrubbed 3D watch hero**. It runs on Shopify Basic in MAD,
with Cash on Delivery and free delivery across Morocco through the **native Shopify checkout**.

Product truth: `PRODUCT.md`. Visual system: `DESIGN.md` (spec 01). Agent rules: `AGENTS.md`.

## 2. Fixed decisions (do not reopen)

| Topic | Decision |
|---|---|
| Base | **Online Store 2.0**: sections + JSON templates + section groups. Theme blocks allowed inside sections. No `{% block %}` or `{% partial %}` tags (the store rejects them). See `theme/AGENTS.md` and `specs/00-migration.md` |
| Language | UI French only (`fr.default.json`). Darija only as brand touches ("Mrehba bik") |
| Fonts | **Bodoni Moda** (display) + **Manrope** (body), self-hosted variable WOFF2 in `theme/assets/` |
| Colour | **Pure black `#000000` + void essence `#080808` + brushed silver**; header, bars and footer share the page black, separated by 1px hairlines. Warm-neutral light text |
| Checkout | Native Shopify checkout with "Paiement à la livraison". The product form must stay compatible with COD-form apps (EasySell…) |
| Cart | Drawer (`<dialog>`) + `/cart` page share one cart section, refreshed through the Section Rendering API |
| Home rows | Driven by a **navigation menu** (each link = a collection). Placeholders when empty |
| "Plus" | Reveals the hidden extra rows. If there are none, it links to Boutique (all collections) |
| 3D hero | **Canvas frame-sequence scrub** (WebP frames in theme assets), poster fallback, reduced-motion fallback |
| Hero watch | An **original RIFANO watch** (RF on the dial), generated from Watch-2 as a *reference only*. No third-party logos anywhere on the site |
| JS | Vanilla ES modules + custom elements. No jQuery, no frameworks, no CDN scripts |
| Skills | Impeccable = tokens, critique, audit, polish. scroll-craft = hero art direction and verification only. taste-skill = one optional polish pass. Priority on conflict: **PRODUCT.md > DESIGN.md > Impeccable > scroll-craft > taste-skill** |
| Gate | `theme check` 0 errors AND `theme push --unpublished` to the preview store (fexgzv-pq) returns 0 errors, before every commit. Record both results in STATUS.md. |
| CLI | Global `shopify` is broken. Always use `npx @shopify/cli@latest` |

## 3. Phases and specs

| Phase | Spec | Result | Depends on |
|---|---|---|---|
| **A. Foundations** | 00-migration | Reopened §2: Skeleton blocks → sections + JSON templates + section groups; shell ported; push smoke 0 errors on fexgzv-pq | — |
| | 01-foundations | fr locale, fonts, tokens.css, DESIGN.md, base CSS, RIFANO settings, hello-world removed | — |
| | 02-brand-assets | RF monogram SVG (traced), wordmark, icon sprite | 00, 01 |
| **B. Shell** | 03-header-menu | Announcement bar, header (☰ · RF · cart), menu drawer with search | 02 |
| | 04-footer | Footer: logo, menus, socials, COD note, policies | 02 |
| | 05-product-card | `product-card` snippet, price, placeholders | 01 |
| **C. Home** | 06-home-intro | "Be different / Be RIFANO" + hero *poster* version (no scrub yet) | 03 |
| | 07-home-rows | Category rows with icons, horizontal scroll, "Plus" | 05 |
| **D. Shopping** | 08-collection-boutique | Collection page + Boutique (all collections) | 05 |
| | 09-product | Product page: gallery, variants, ATC, trust badges, WhatsApp, sticky ATC, recommendations | 05 |
| | 10-cart | Cart drawer + cart page, empty state with suggestions | 09 |
| **E. Content** | 11-content-pages | Contact & SAV, Notre mission, FAQ, default page | 04 |
| | 12-system-pages | Search, 404, Password "Bientôt", policies, gift card | 05 |
| **F. 3D hero** | 13-hero-assets | **Human task**: generate the watch + video, then the agent extracts frames | — (can run anytime) |
| | 14-hero-scroll | Canvas scrub hero replacing the poster from 06 | 06, 13 |
| **G. Ship** | 15-audit-polish | Impeccable audit/polish, taste pass, perf, a11y, final theme check | all |
| | 16-launch | Admin checklist (COD, shipping, menus, collections, pages, money format), publish | 15 |

Run the specs **in order, starting from 00**. Spec 01 is done; spec 02 runs after 00, then the
queue is 06–16. 11/12 can run before 08–10 if you like. 13 is your own work and can start today.

## 4. How to run one spec (every time)

1. New OpenCode session. Paste: `Read AGENTS.md, then execute specs/NN-name.md exactly.`
2. The agent works only inside the files the spec lists.
3. The agent runs theme check, fixes until 0 errors, updates `STATUS.md`, then commits `feat(NN): …` and pushes.
4. **You** preview: `npx @shopify/cli@latest theme dev --path theme --store fexgzv-pq` (storefront password in `QA-REPORT.md`). Check on a phone-width window.
5. If it looks wrong, paste me a screenshot plus the agent's summary. I'll write a fix prompt.
6. Model tip: use muse-spark for 03, 07, 09, 10, 14 (logic-heavy). Flash is fine for the rest and for theme-check fixes.

## 5. Definition of done (whole project)

- [ ] All v1 pages render on a 375px screen without horizontal scroll, and look right at 1440px
- [ ] Every page works with **zero products** (placeholders, empty states)
- [ ] Add to cart → drawer → checkout works with a real test product and COD
- [ ] Hero scrubs smoothly on desktop and a mid-range Android, with poster on reduced-motion / save-data
- [ ] No third-party watch brand visible anywhere
- [ ] `theme check`: 0 errors · Impeccable `audit`: no critical findings · Lighthouse mobile ≥ 80 performance, ≥ 95 a11y
- [ ] All UI strings in `fr.default.json`; no hard-coded routes
- [ ] Placeholders `[PH]` replaced (spec 16)

## 6. Open items (owner)

- Confirm the hero approach: original RIFANO watch generated from Watch-2 (spec 13).
- Real WhatsApp / socials / email, delivery time, warranty, returns. Placeholders are in theme settings and can be changed without code.
- Real products and photos (until then, placeholders).
