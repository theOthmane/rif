# DECISIONS.md — RIFANO decision log

Newest first. One entry per design/tech decision: date, decision, why, what it
rules out. If a change conflicts with an entry here, stop and ask the owner
before implementing it.

> **Not logged as a decision:** Michroma + Inter (named in the 2026-11-07
> hand-off brief). Neither font appears in this repo or its git history; the
> current pair is Tenor Sans + Hanken Grotesk. If the owner wants Michroma +
> Inter, it needs a new dated decision and a font migration. See
> `STATUS.md` → Open questions.

---

## 2026-11-07 — Session hand-off protocol adopted

**Decision:** Root docs now include `STATUS.md` (done / in progress / next /
open questions) and `DECISIONS.md` (this log), plus a thin `CLAUDE.md` that
defines the start/end ritual.
**Why:** Handoffs depended on a 45 KB `AGENTS.md` plus git history; decisions
and current state were expensive to reconstruct and easy to reverse by accident.
**Rules out:** ad-hoc status updates, undocumented reversals, and ending a
session without updating status/decisions and pushing the dev branch.

## 2026-11-07 — `CLAUDE.md` is a thin entry point

**Decision:** `CLAUDE.md` holds the session protocol and points to `AGENTS.md`,
`PRODUCT.md`, `DESIGN.md`, `STATUS.md` and `DECISIONS.md`. It does not duplicate
project truth.
**Why:** `AGENTS.md` already owns architecture, gates and workflow; two full
copies would drift.
**Rules out:** treating `CLAUDE.md` as the source of design/product truth, or
copying the 45 KB rules file into it.

## 2026-10-18 — Specs 24–30 approved; spec 31 is release prep

**Decision:** The `redesign/taste-v2` pages are approved: shell (announcement,
header, drawer, footer), home, collection, boutique, product, cart drawer +
cart page, Contact & SAV, Notre mission, FAQ, Packs, search, 404, password,
policies, gift card, and poster page titles.
**Why:** Each spec passed Gates A/B/C and the owner approved the composition
direction. Spec 31 is an integration/release pass, not a redesign.
**Rules out:** reworking approved layouts without a new spec and owner approval,
or treating spec 31's open items as permission to restyle pages.

## 2026-10-17 — Conflict priority: product truth over polish tools

**Decision:** `PRODUCT.md` > `DESIGN.md` + `tokens.css` > imagegen-frontend-web
art direction > Impeccable > scroll-craft > taste-skill. Brand type, palette and
the protected buy path are guardrails.
**Why:** The owner approved taste-skill's composition direction for specs 24–31
only with those guardrails; tool output must never override product facts.
**Rules out:** taste-skill (or any polish tool) changing the fonts, palette,
COD copy or buy-path behaviour for aesthetic reasons.

## 2026-10-17 — Semantic token layer; values only in `tokens.css`

**Decision:** Components reference semantic roles (`--c-field`, `--fs-display`,
`--target`, `--gap-row`, etc.), never primitives or literals. Token values live
only in `theme/assets/tokens.css`.
**Why:** One source of truth, consistent spacing/colour, and merchant overrides
via `css-variables.liquid` rendered after `tokens.css`.
**Rules out:** raw hex/px in component CSS (except `0`, `1px`, `100%`),
per-component one-off values, and editing `DESIGN.md` as if it held values.

## 2026-10-14 — Store split: preview vs launch

**Decision:** All development, Gate B pushes and Gate C QA happen on
`fexgzv-pq` (smoke theme `rifano-smoke`). `xpziwn-tw` is the launch store and is
touched only for spec 16, spec 22 content, or an owner-requested release.
**Why:** Safe iteration; prevents experiments and editor drift on the live store.
**Rules out:** pushing experiments to `xpziwn-tw`, creating/publishing/deleting
themes, or changing payments, checkout, shipping, taxes, languages, domains,
apps or billing there — those are owner actions.

## 2026-10-14 — Confirmed policy and contact facts

**Decision:** Delivery 24–48h; warranty 3 months; returns within 14 days.
WhatsApp `+212 6 58 25 05 49`; Instagram and TikTok `@rifano.ma`. Support email
stays a placeholder (`contact@rifano.ma`) until the owner supplies one.
**Why:** Owner-confirmed values; the promise is a trust signal and must not be
invented or approximated.
**Rules out:** inventing policy numbers, delivery times, a support email, or
extra contact channels.

## 2026-10-14 — Commerce model: MAD, COD only, free delivery

**Decision:** Currency MAD. Cash on Delivery only, free delivery everywhere in
Morocco, native Shopify checkout with COD enabled. Product form keeps an `@app`
slot for a COD-form app.
**Why:** The risk sits with the merchant, not the customer; this is the core
conversion promise, not a promotion.
**Rules out:** prepaid/card-first checkout, paid delivery, a currency switcher,
a custom checkout, or removing the `@app` slot.

## 2026-10-14 — Main-store content is main-only

**Decision:** The main store received 4 French menus, 4 pages, 4 empty published
collections, pack metafield definitions, the hero poster, policies and settings.
The dev mirror was skipped: the CLI account has no access to `fexgzv-pq`, and
the owner chose main-only.
**Why:** Unblock launch without duplicating owner-admin work.
**Rules out:** assuming dev and main content are mirrored; re-running the mirror
without the owner asking.

## 2026-10-12 — Cart: one section for drawer and page

**Decision:** The cart drawer (`<dialog>`) and `/cart` share one cart section,
refreshed through the Section Rendering API; `cart.js` owns drawer, refresh,
focus and announcements.
**Why:** One markup/logic path keeps the two surfaces consistent and avoids
duplicate cart state.
**Rules out:** separate drawer/page cart implementations, a second cart JS
module, or hard-coded cart markup.

## 2026-10-12 — 3D hero: original RIFANO watch only

**Decision:** The hero uses an original RIFANO watch (RF on the dial) generated
by the owner, animated with Veo, frames extracted with ffmpeg, and scrubbed on
canvas. Poster + reduced-motion/save-data fallbacks always render.
**Why:** Brand ownership and legal safety; the hero is the page's slow anchor,
not an autoplay spectacle.
**Rules out:** shipping `brand/watches/*.png` (third-party AP, Emporio Armani,
Rolex, Casio renders), third-party marks, loops, or information delivered only
by motion.

## 2026-10-11 — Fonts: Tenor Sans + Hanken Grotesk

**Decision:** Tenor Sans 400 for display, Hanken Grotesk variable for body/UI.
Both self-hosted as WOFF2 in `theme/assets/` under OFL licences.
**Why:** A precise, quiet editorial display face plus a workhorse body face;
one display weight enforces restraint and keeps the payload small.
**Rules out:** Bodoni Moda + Manrope (the previous pair), system fonts as the
brand voice, and adding display weights or italics (Tenor has neither).

## 2026-10-11 — Home rows are merchant-driven

**Decision:** Home category rows come from a navigation menu (each link = a
collection). Empty rows are hidden on the live store; all-empty renders one
"coming soon" line. "Plus" reveals hidden rows, otherwise links to Boutique.
**Why:** The owner controls merchandising without code; the theme stays clean
with zero products.
**Rules out:** hardcoded collections, showing empty shelves, or inventing
placeholder products on the live store.

## 2026-10-10 — Palette: pure black + void essence + brushed silver

**Decision:** `#000000` page ground, `#080808` raised surfaces, brushed-silver
accent. Header, bars and footer share the black and are separated by 1px
hairlines, not grey bands. Chrome is opaque. Silver is used only for primary
buttons, the RF monogram and 1px accent hairlines; counts are numerals.
**Why:** Restraint and earned prestige; silver stays rare enough to mean
something.
**Rules out:** grey bands, blur/translucency, shadows standing in for borders,
silver-filled badges/pills/chips, filled cart badges, purple gradients, badge
spam.

## 2026-10-10 — The shell is the reference implementation

**Decision:** `theme/assets/header.css` and `footer.css` define the house
standard for air, hairlines, type scale and accent use. Later pages match them.
**Why:** Prevents each page from inventing its own spacing or accent and
drifting away from the approved shell.
**Rules out:** page-local spacing systems, new accent treatments, or "one-off"
hairline/fill patterns.

## 2026-10-10 — Online Store 2.0, Liquid only, no frameworks

**Decision:** Sections + JSON templates + section groups in `theme/`; theme
blocks with `{% content_for 'blocks' %}`; vanilla ES modules; one CSS file per
component. No jQuery, frameworks, CDNs or page builders.
**Why:** Merchant editability, Shopify-native behaviour, theme-check
compatibility and predictable performance.
**Rules out:** hardcoded page markup, `{% block %}`/`{% partial %}`,
`{% stylesheet %}`/`{% javascript %}`, third-party JS frameworks, and CDN
dependencies.

## 2026-10-10 — v1 scope and language

**Decision:** Storefront French; Darija only as small brand touches ("Mrehba
bik"). Tagline "Be different. Be RIFANO." stays English. v1 pages are home,
collection, boutique, product, cart, contact/SAV, mission, FAQ, search, 404,
policies, password and packs. Blog, reviews, accounts, order tracking,
multi-language and Spain are out.
**Why:** Focus the launch on the mobile COD funnel in the Moroccan market.
**Rules out:** mixed French/English UI, translating the tagline, adding deferred
features, or launching Spain without a new owner decision.

## 2026-10-10 — Product data is TBD; never fabricate

**Decision:** The real catalogue (products, variants, prices, photography) is
TBD. Every template must render a clean placeholder or empty state. Reference
watch renders are never shipped or shown.
**Why:** No confirmed inventory; invented products, prices, reviews or stats
would destroy the trust the COD promise depends on.
**Rules out:** fake products, testimonials, press, benchmarks, delivery records,
sales figures, or shipping third-party brand assets.

## 2026-10-10 — Mobile-first and WCAG 2.2 AA

**Decision:** Design at 375px first, then `min-width` 768px and 1200px.
Semantic HTML, visible `:focus-visible`, 44×44px targets, reduced-motion
support, dialogs that trap focus and close with Esc. Zero-products safe.
**Why:** Instagram/TikTok traffic is phone-first; accessibility and trust are
part of the premium promise.
**Rules out:** desktop-first layouts, motion-only information, custom controls
without keyboard/focus handling, horizontal scroll, and layouts with no empty
state.
