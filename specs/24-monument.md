# Spec 24 — The name as a monument (taste-skill v2 redesign)

Branch `redesign/taste-v2`. Owner asked for big, risky changes using `design-taste-frontend`.
Direction dealt by `draw.mjs` (seed 1562837384, `--keep palette`): **name-as-monument**.

## Idea
On this page, **the RIFANO name** becomes **architecture**: it returns at the full width of the
viewport as the footer, and one verb at the same scale is the last button on the home page.
Competitor test: another watch seller's name is not RIFANO, and nobody else owns the "Be RIFANO." line.
Live thing (unchanged, already the strongest on the site): the scroll-scrubbed watch.

## Redraws and keeps (reasons)
- Hero blueprint "pinned title over portraits" → **kept the shipped 3D scrub hero** (specs 13/14/18). No portraits exist; the engine is measured and owner-approved.
- Section "about — portraits pass" → **dropped**. No people photographs exist; nothing invented.
- Type (Libre Franklin / Source Serif) → **kept Tenor Sans + Hanken Grotesk**. The pair is the brand (AGENTS.md §2).
- Palette → **kept** black, void, brushed silver (`--keep palette`).
- Header (hamburger / monogram / cart) → **kept**, fixed by the owner's sketch in PRODUCT.md.

## Changes
1. `sections/home-cta.liquid` + `assets/home-cta.css` (new): a full-bleed silver band, the whole band is one link to the boutique. One verb at ~20vw, one sentence top-left, an arrow top-right. Hover / focus swaps field and word instantly.
2. `templates/index.json`: add `home-cta` after `home-rows`.
3. Footer rebuilt as the monument: columns on top (brand mark, navigation, contact, legal), the RIFANO wordmark across the full width at the bottom (inline SVG, `textLength`), min-height one viewport. No hairlines.
4. Home rows: titles at display scale (`--fs-display`), more air between rows, spine hairline and outlined arrows removed (filled instead).
5. `tokens.css`: add `--fs-display`. `DESIGN.md`: one line for it.
6. `locales/fr.default.json`: `cta_word`, `cta_line`.

## Guardrails for specs 24–31 (every monument spec inherits these)
Owner approved (2026-10-17) the taste-skill composition direction for specs 24–31 only. It does not reopen anything else in AGENTS.md §2.
1. **Branch:** all work on `redesign/taste-v2`. One spec per session, one commit per spec (`feat(NN): …`). `main` is never touched. Rollback of any spec = `git revert <its commit>`.
2. **Touch only the files the spec lists.** If another file is needed, stop and say why.
3. **Protected, in every spec:** the hero engine (`home-hero.*`, `hero-scrub.js`, hero frames), header markup and behaviour, cart drawer + `cart.js`, the product form and its `@app` COD slot, depth layers' class contract (`data-depth-*`, `depth.css`), every locale key already in use, routes via `routes.*`.
4. **PRODUCT.md rules stand:** French only, never invent prices, reviews, stats, people or promises; no third-party brand names; COD and free delivery stay clear and are not repeated more than twice per viewport.
5. **Tokens only.** New sizes go in `tokens.css` first. No raw hex/px in component CSS (SVG viewBox numbers and `textLength` are geometry, not styling).
6. **Kept from the brand, never redrawn:** Tenor Sans + Hanken Grotesk, black / void / brushed silver, the RF monogram, the silver-gradient logo wordmark. The skill's "no gradients / no uppercase tracked labels / no hairlines" rules apply to *new* work and to places a spec names; they never justify touching the logo or the type pair.
7. **Safety nets that must still hold after each spec:** zero-products safe, empty states intact, no horizontal scroll at 375/768/1440, `prefers-reduced-motion` keeps all content, 44×44 targets, visible `:focus-visible`, 0 theme-check errors.
8. **Gates:** A theme check → B push to `fexgzv-pq` theme `185969639647` (`--allow-live`, owner logs in) → C screenshots 375/768/1440 into `tools/shots/NN-*.png` (gitignored). A visual item passes only with a screenshot path.
9. **Verification harness:** for pure layout work, a static page in `tools/shots/` served from the repo root is allowed (see spec 24 session); delete the server when done.
10. **Stop rule:** if a change breaks a protected item or a gate and cannot be fixed inside the spec's files, revert that spec's edits, mark it ⚠️ in AGENTS.md Progress and stop.

## Spec map
| Spec | Area | Risk |
|---|---|---|
| 24 | Footer monument, closing band, row titles | done on branch, uncommitted |
| 25 | Poster page titles (opt-in class) | low |
| 26 | Boutique + collection pages | low–medium |
| 27 | Product page | **high** (COD form, `@app`, ATC) |
| 28 | Content pages: mission, FAQ, contact, packs | medium |
| 29 | System pages: 404, password, cart page, search | medium |
| 30 | Menu drawer | low–medium (focus trap) |
| 31 | Integration, inspector run, release prep | gate only |

Order: 25 first (others reuse its class). 26, 28, 29, 30 are independent. 27 last of the building specs. 31 closes.

## Not touched
Hero markup/JS/CSS, header, cart, product page, COD/free-delivery copy, `@app` slot, depth-layer engine.

## Acceptance
- A. theme check 0 errors.
- B. smoke push 0 errors.
- C. 375 / 768 / 1440: no horizontal overflow, no console errors, no "translation missing", Tenor + Hanken live; the CTA band is one link with a visible focus state; the footer wordmark spans the content width on one line; the footer is reachable by keyboard; reduced motion keeps all content.
- Screenshots → `tools/shots/24-*.png`.
