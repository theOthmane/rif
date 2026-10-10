# QA-REPORT-2 — RIFANO theme, preview QA (specs 00–05, 08)

Date: 2026-10-11 · Tree: `80ff130` (`docs: adversary report`), `theme/` working tree clean · Preview: theme `rifano-smoke` **#185969639647** on `fexgzv-pq` (storefront password `rahste`).
Owner complaint: "something messed up" / "messed everything" (`HANDOFF-rifano-pm.md:28`, `ADVERSARY-REPORT.md:31`).
Method: `theme check` + `agent-browser` (Chrome) + axe-core 4.12.1 + `impeccable` detector/context, read-only. QA changed no file except this report.

## Summary (5 lines)

1. Gate: `theme check` — **42 files, 0 errors**, 2 pre-existing warnings (`OrphanedSnippet`: `snippets/price.liquid`, `snippets/product-card.liquid`); no push was run this session.
2. The shell (announcement, header, menu drawer, footer) passes every testable spec 00–04 acceptance item on the live preview at 375/768/1440: palette exactly `#000000` / `#080808` / silver, no horizontal scroll, zero console errors, keyboard/focus behaviour verified.
3. **BLOCKER: spec 08 was never built** — `/collections` and `/collections/all` are still the spec-00 stubs (no tiles, no grid, no sort, no empty state); 0 of its 4 acceptance items pass beyond theme check.
4. Axe: the only theme-caused violation on every page is the announcement bar sitting outside any landmark; the other reported violations belong to Shopify's preview bar, not the theme.
5. 8 findings (1 BLOCKER · 3 MAJOR · 4 MINOR); spec 05's card rendering, cart count > 0 and the theme-editor check remain CAN'T VERIFY on a zero-product store; Impeccable audit: shell clean, collection surfaces unbuilt (13/20 Acceptable).

## 1. Gates

`npx @shopify/cli@latest theme check --path theme`:

```
42 files inspected with 2 total offenses found across 2 files.
2 warnings.
```

- `snippets/price.liquid` — `OrphanedSnippet: This snippet is not referenced by any other files`
- `snippets/product-card.liquid` — `OrphanedSnippet: This snippet is not referenced by any other files`

**Push smoke: NOT RUN** (per instruction "do not push in this session"). Indirect uploadability evidence: theme #185969639647 renders every route tested (`/`, `/collections`, `/collections/all`, `/cart`, `/search`, `/policies/privacy-policy`, password gate) with no `Liquid error` text anywhere.

## 2. Findings

### Q1 — Spec 08 is absent: collection and Boutique surfaces are the spec-00 stubs · **BLOCKER**

- **Page / width:** `/collections`, `/collections/all` — 375, 768, 1440 (all).
- **Evidence:** screenshots `qa-collections-375/768/1440.png`, `qa-collection-all-375/768/1440.png`. `theme/sections/main-collection.liquid` and `theme/sections/main-list-collections.liquid` are still the spec-00 ports (`git log` for both files ends at `0851189 feat(00)`); `collection.css`, `collection-sort.js`, `collection-header.liquid`, `product-grid.liquid`, `collection-tiles.liquid`, `snippets/pagination.liquid` do not exist; `product-card.liquid` / `price.liquid` still have no consumer (the two warnings above). Live DOM on `/collections/all`: zero `select` elements, zero filter elements, zero product cards, no "bientôt" text.
- **Exact fix:** run `specs/08-collection-boutique.md` as its own build → review → fix cycle (its file list and acceptance already define everything), then push smoke + re-verify the 4 acceptance items.

### Q2 — `/collections` renders its collection link in browser-default blue · **MAJOR**

- **Page / width:** `/collections` — all widths.
- **Evidence:** the `Home page` link computes `color: rgb(158, 158, 255)` + `text-decoration: underline` (`qa-collections-375.png`) — the only saturated colour in the build, against a black/silver system. `theme/sections/main-list-collections.liquid:6` (`<a class="collection-card">`); `assets/base.css:218-222` gives layout only, no colour/decoration reset. Confirmed pre-existing at the owner-accepted `5856b4d` (ADVERSARY-REPORT A4).
- **Exact fix:** spec 08 rebuilds the tiles with tokens; additionally add a global safety net in `assets/base.css` (add the file to spec 08's list): `a { color: var(--c-text-2); }` / `a:hover { color: var(--c-text); }` so no future unstyled Liquid link can fall back to UA blue.

### Q3 — `/collections/all` with zero products: no empty state, no grid, no sort, no pagination · **MAJOR**

- **Page / width:** `/collections/all` — all widths. The store has **0 products** (`/products.json?limit=10` → `productCount: 0`), so this is the page's primary live state.
- **Evidence:** only `<h1>Products</h1>`; `main` measures **51px** tall, then pure black (`qa-collection-all-375.png`). `theme/sections/main-collection.liquid:4-27` has no `{% else %}` and no toolbar; DOM counts: sort selects 0, filters 0, cards 0. Violates `PRODUCT.md:53` ("every template must render a clean placeholder and a clean empty state") and spec 08 acceptance items 2–3.
- **Exact fix:** ship spec 08's empty state ("Cette collection arrive bientôt." + "Voir toute la boutique" → `routes.collections_url`), the sort toolbar and the paginated grid. Because the store is empty, the zero-products path is the first thing a visitor sees — it cannot be treated as an edge case.

### Q4 — French-only storefront shows English/default store data · **MAJOR** (store admin, not theme code)

- **Page / width:** all pages — all widths.
- **Evidence:** drawer navigation "Home / Catalog / Contact" and footer link "Search" (from `main-menu` / `footer` menus in admin); `/collections/all` heading "Products" (Shopify's default title for the `all` collection); `/collections` tile title "Home page" (the `frontpage` system collection); `/policies/privacy-policy` in English; the monogram's accessible name and the tab title read "My Store" (`<a aria-label="RF — My Store">`). `PRODUCT.md:34`: "UI language: French. Darija is permitted only for small brand touches." Nothing here is fixable in Liquid — the theme renders merchant data faithfully.
- **Exact fix (owner, Shopify admin):** rename the store (Settings → Store details); create French navigation menus and select them in the theme editor (Header group `main-menu` + Footer `menu_shop`/`menu_help`); replace the policy text with French versions; optionally rename the "all" collection display title. Add to the spec-16 launch checklist.

### Q5 — Announcement bar is outside any landmark · **MINOR**

- **Page / width:** every page — all widths.
- **Evidence:** axe `region` (moderate) violation targets `#shopify-section-…__announcement` on all pages; `theme/sections/announcement.liquid` root is `<div class="announcement">`; live check `document.querySelector('.announcement').closest('header, footer, main, [role=region], aside, nav')` → `null` (the header/footer/main are proper landmarks).
- **Exact fix:** in `theme/sections/announcement.liquid` change the root to `<aside class="announcement" aria-label="{{ 'rifano.announcement_label' | t }}">` (or `role="region"` on the div), and add one key to `theme/locales/fr.default.json`: `"announcement_label": "Annonce"`.

### Q6 — Drawer search placeholder hard-clips mid-word at 375 · **MINOR**

- **Page / width:** menu drawer (all pages) — 375.
- **Evidence:** visible text "Rechercher une montre, un c" in `qa-drawer-375.png` — a hard cut, no ellipsis. Measured: placeholder 259px vs input content width 228px (31px cut); string at `theme/locales/fr.default.json:79` = "Rechercher une montre, un collier…" (34 chars).
- **Exact fix:** shorten the key to fit (e.g. `"Rechercher un article…"`) or reduce the input's horizontal padding in `theme/assets/base.css:169` from `--s-4` to `--s-3`; verify at 375 that the full string renders.

### Q7 — Raw px inline style in the Boutique stub · **MINOR**

- **Page / width:** `/collections` (source-level) — all widths.
- **Evidence:** `theme/sections/main-list-collections.liquid:4` — `style="--grid-gap: 10px"`: a raw px value, and the custom property has no consumer (`assets/base.css:210` uses `gap: var(--gutter)`). Pre-existing (ADVERSARY-REPORT A11).
- **Exact fix:** the line disappears when spec 08 rebuilds/deletes this stub (the file is in spec 08's list). No separate action.

### Q8 — Dead code from superseded implementations · **MINOR**

- **Page / width:** n/a (source).
- **Evidence:** `theme/assets/header.css:150-165` `.header__monogram` ("Inline RF fallback until spec-02 …") — no consumer since spec 02 replaced the text fallback with `{% render 'logo' %}` (`grep header__monogram` → CSS only); `hello_world.*` (17 keys) and `customers.login.*` (4 keys) plus `rifano.email_label` in `theme/locales/fr.default.json` have **0** references in any `*.liquid`.
- **Exact fix:** delete in spec 15's cleanup pass (or any spec that lists `header.css` / `fr.default.json`).

## 3. Functional pass (live preview, 375 / 768 / 1440)

| Check | 375 | 768 | 1440 | Evidence / notes |
|---|---|---|---|---|
| Announcement bar | PASS | PASS | PASS | Setting text renders ("Paiement à la livraison · Livraison gratuite partout au Maroc"); wraps to 2 lines at 375, 1 line ≥768 (owner-approved brand pass, supersedes spec 03's truncate rule); `animation-name: none` (never animates); hidden on the password gate (no header group) |
| Header sticky + scroll hairline | PASS | PASS | PASS | `.site-chrome` sticky `top: 0`; `is-scrolled` toggles the 1px `#2a2a2a` border after 8px and hides again at top (tested on the tall policy page at 375) |
| Header row ☰ · RF · cart | PASS | PASS | PASS | Logo centre-x = viewport centre (187.5 / 384 / 720); menu/cart 64×64; header 65px / 65px / 77px; no overflow |
| Menu drawer — open | PASS | PASS | PASS | Click, `Enter` on the focused button, and `tap` all open; `aria-expanded` false → true |
| Menu drawer — close + focus return | PASS | PASS | PASS | Esc, backdrop click (elementFromPoint = dialog; low-level mouse click), close button and tap all close; focus returns to `#menu-button` every time |
| Menu drawer — focus trap | PASS | — | — | Tab cycles 9 drawer controls and wraps to close; Shift+Tab wraps to last control; never escapes |
| Menu drawer — search | PASS | PASS | PASS | Submits to `/search?q=montre&type=product` (`name=q`, `type=search`, hidden `type=product`, `routes.search_url`) |
| Menu drawer — content/width | PASS | PASS | PASS | "MREHBA BIK", 420px wide (full width at 375), full height, `--c-surface` `rgb(8,8,8)`, body scroll locked (`html { overflow: hidden }`) |
| Footer — promise strip / lockup | PASS | PASS | PASS | 3 promises (cash / truck "Livraison 24–72h · gratuite" / shield "Garantie 12 mois"); monogram lockup + Bodoni-italic tagline |
| Footer — accordions vs desktop nav | PASS | PASS | PASS | 375: `<details>` "Boutique" keyboard-toggles; ≥768: `<details>` hidden, `nav` column(s) open side by side (CSS-only switch) |
| Footer — links | PASS | PASS | PASS | WhatsApp `wa.me/212600000000` + `mailto:contact@rifano.ma` render; Instagram/TikTok hidden (blank settings); only Privacy policy renders of the policies (others absent in admin, conditional correct) |
| `/collections` (Boutique) | FAIL (Q1/Q2) | FAIL | FAIL | Stub: "Collections" + one blue "Home page" link; no tiles/4:5/gradient/count, no empty state |
| `/collections/all` | FAIL (Q1/Q3) | FAIL | FAIL | Stub: "Products" h1 + 51px of black; no cards, sort, filters, pagination or empty state |
| `/cart` | PASS (renders) | PASS | PASS | "Panier" renders, no Liquid error (cart page is spec 10's stub) |
| Cart icon count | PASS (0) / CAN'T VERIFY (>0) | PASS | PASS | `#cart-icon-bubble` hidden at empty cart; count>0 untestable — store has 0 products (`/products.json`). Badge is a `--c-text` numeral, no silver fill |
| Console errors | 0 | 0 | 0 | Only Shopify's preview-bar `[HotReload]` info line; no errors/warnings on any page |
| Horizontal scroll | none | none | none | `scrollWidth == clientWidth` on `/`, `/collections`, `/collections/all`, `/cart`, `/search` at all three widths |

## 4. Accessibility

**axe-core 4.12.1, 8 page/width runs** (`/`, `/collections`, `/collections/all`, `/cart`, `/search` @375; `/`, `/collections`, `/collections/all` @1440): same 3 rule hits every time.

- `aria-dialog-name` + `frame-title` + (at 1440) `button-name` and extra `region` nodes: all inside `#PBarNextFrame` — Shopify's **preview bar**, injected only because of `?preview_theme_id`; not theme code.
- **Theme-caused: `region`** — announcement section not contained by a landmark (Q5). Impact moderate, best-practice rule.
- `color-contrast` appears only as **incomplete** (axe can't evaluate: wordmark `background-clip:text`; contact spans overlapped). Manual check: worst silver gradient stop `--c-silver-3` = 5.57:1 and `--c-text-2` = 8.93:1 on `--c-bg` — no real failure. No violations inside `.site-chrome` / `.site-footer` apart from the preview bar.

**Keyboard-only navigation (375):** Tab 1 = skip link "Aller au contenu" (visible, silver outline) → Tab 2 = menu button → `Enter` opens the drawer with focus on the close button; full focus trap; `Esc` closes and returns focus; footer `summary` + `Enter` toggles the accordion; `aria-current="page"` on the active drawer link. No keyboard traps outside the modal.

**Focus-visible:** `1px solid rgb(185,189,195)` (`--c-accent`) with 4px offset, consistently on skip link, menu button, footer links (`qa-focus-skiplink-375.png`, `qa-focus-menubutton-375.png`). Passes WCAG 2.4.7; a 2px ring would be more robust (recorded, not high/critical).

**Tap targets:** full scan of visible interactive elements — home 375: 20/20 ≥ 44×44px; drawer open 375: 9/9 ≥ 44; home 768: 0 under 44. PASS.

## 5. Design system

- **Raw hex outside `tokens.css`: none** in CSS/Liquid/JSON (`grep -rnE "#[0-9a-fA-F]{3,8}"` → only comments/docs).
- **Raw px outside `tokens.css`:** component CSS px is limited to `1px` hairlines, the 480/768/1200 media breakpoints and comments; Liquid has one raw px — the stub inline style (Q7).
- **Palette (computed live):** body / announcement / header / footer `rgb(0,0,0)` (`#000000`); drawer `rgb(8,8,8)` (`--c-surface` `#080808`); `--c-surface-2` `#0d0d0d` defined; text/silver tokens unchanged. No grey bands; separation is 1px `--c-line` hairlines. Correct per DESIGN.md and the owner's palette decision.
- **Silver accent discipline:** `--c-silver*` consumers are `.btn` background, monogram gradient, wordmark `background-clip:text`, `--c-silver-2` hover colour shift, badge 1px border, placeholder tint `--c-silver-3`, focus ring via `--c-accent` — all within DESIGN.md's permitted uses; the cart count is a `--c-text` numeral, not a filled badge.
- **Spacing tokens:** component CSS uses `var(--s-*)`, `--section-y`, `--gutter`, `--hairline` throughout; no hardcoded spacing values found.
- **Fonts:** Manrope 200–800 + Bodoni Moda 400–900 (incl. italic) load; body = Manrope, wordmark `.t-display` = Bodoni 500, tagline = Bodoni italic. PASS.

## 6. /impeccable audit — shell + collection pages (high and critical findings only)

**Score: 13/20 — Acceptable** (shell alone ≈ 17/20 Good; the collection surfaces drag Theming/Implementation-Integrity down). Detector `impeccable detect --json` → `[]` on all shell CSS and section files, **with the standing caveat that the detector does not scan `.liquid` — it is not evidence of Liquid quality here** (proven in ADVERSARY-REPORT §6). Implementation Integrity verdict: **PASS for the shell** (coherent, product-specific system — verified live: one black, one `--hairline` token, one silver mark per viewport, no plates); **FAIL for the collection surfaces** (interchangeable with an untouched Shopify skeleton).

- **P0 (critical) — Collection surfaces unbuilt** (= Q1/Q2/Q3): no product grid, sort, pagination or empty state; UA-blue link and default heading type; the build's only saturated colour. Blocks the core browse task and contradicts the brand system. Fix: execute spec 08.
- **P1 (high): none on the shell.** No a11y/theming/responsive finding rated high or critical: 1 moderate axe rule (Q5), tap targets pass, contrast AA, no overflow at any width, lean assets (30KB CSS + 6.6KB JS + 79KB fonts). The moderate/minor items (Q5–Q8) stay as QA findings, not audit blockers.

## 7. Acceptance tables

### Spec 00 — migration

| # | Acceptance item | Verdict | Evidence |
|---|---|---|---|
| 1 | `theme check` 0 errors | **PASS** | §1: 42 files, 0 errors |
| 2 | push smoke on `fexgzv-pq` 0 errors | **CAN'T VERIFY** (no push this session) | Indirect: theme #185969639647 renders all routes with no Liquid errors |
| 3 | `theme dev` renders `/`, `/cart`, `/collections/all`, `/search` at 375/1440 with header, drawer, footer working | **PASS** | Live-preview equivalent tested at all widths; drawer open/close/focus and footer verified (§3) |
| 4 | No `{% block %}`/`{% partial %}` outside `{% doc %}` | **PASS** | `grep -rnE "\{%-? *(block\|partial)[ %>-]"` over `*.liquid`/`*.json` → empty |
| 5 | tokens/fonts/base/critical/component CSS/JS/snippets/locales/settings unchanged by the migration | **PASS** | `git diff 9e278c8 0851189` over those paths → empty |

### Spec 01 — foundations

| # | Acceptance item | Verdict | Evidence |
|---|---|---|---|
| 1 | theme check 0 errors; no ref to deleted files / `type_primary_font` | **PASS** | §1; grep → only the README recovery pointer to pinned hash `8c04487` |
| 2 | html background `#0d0e10`, body Manrope, `.t-display` Bodoni | **PASS** (palette superseded) | Background is now `#000000` per the later owner palette decision (ADVERSARY-REPORT: KEEP); Manrope + Bodoni load and render; computed styles verified |
| 3 | No raw hex outside `tokens.css` | **PASS** | §5 |
| 4 | `fr.default.json` only storefront locale; `rifano.*` keys | **PASS** | 28 `rifano.*` keys; `en.default.schema.json` is editor-labels only |
| 5 | RIFANO settings group visible in theme editor | **CAN'T VERIFY** (admin UI) | Schema group "RIFANO" present with all 10 settings |
| 6 | DESIGN.md states the silver rule + brand commitments | **PASS** | `DESIGN.md:119-134,213-227` |
| 7 | PRODUCT.md TBDs resolved | **PASS** | `PRODUCT.md` current text |

### Spec 02 — brand assets

| # | Acceptance item | Verdict | Evidence |
|---|---|---|---|
| 1 | Monogram R+F+hands, crisp at 32/400px, silver gradient on `--c-bg` | **PASS** | Live: 32px header, 48px footer, gradient renders on black (`qa-monogram-header-375.png`, `qa-footer-lockup-375.png`); 400px not used by the theme; owner-approved trace (`brand/rf-monogram.svg`) |
| 2 | Two monograms, distinct gradient ids | **PASS** | Live DOM: two ids; each `path fill` points at its own gradient |
| 3 | All 20 icons, same visual weight; unknown renders nothing | **PASS** | `snippets/icon.liquid` has all 20 `when` keys incl. `watch`/`necklace`/`pouch`; `:97` renders nothing when blank; shell icons all render |
| 4 | No PNG logo in `theme/assets/` | **PASS** | assets contains only CSS/JS/WOFF2 — no images |
| 5 | theme check 0 errors | **PASS** | §1 |

### Spec 03 — announcement bar, header, menu drawer

| # | Acceptance item | Verdict | Evidence |
|---|---|---|---|
| 1 | 375: ☰/RF/cart one row, logo centred, no overflow; same at 1440 | **PASS** | §3: centre-x = viewport centre at all three widths; no overflow |
| 2 | Drawer opens/closes with mouse, keyboard (Enter, Esc), touch; focus returns to ☰ | **PASS** | §3: click, Enter, tap, Esc, backdrop and close-button paths all verified; focus return every time |
| 3 | Search from the drawer lands on `/search?q=…` | **PASS** | `/search?q=montre&type=product` |
| 4 | Cart badge hidden when empty, shows count otherwise | **PASS at 0 / CAN'T VERIFY >0** | Hidden + `hidden` attr at 0; store has 0 products, no cart can be built |
| 5 | Announcement shows the setting text, never animates | **PASS** | §3; `animation-name: none`; hidden on the password gate |
| 6 | theme check 0 errors | **PASS** | §1 |

Note: the bar's `.t-label`/truncation/`--c-surface` details were deliberately superseded by the owner-approved brand pass (wrap instead of truncate, sentence case, `--c-bg`); the acceptance item above is the behaviour that matters and it passes.

### Spec 04 — footer

| # | Acceptance item | Verdict | Evidence |
|---|---|---|---|
| 1 | Works with no menus (columns hidden, no errors) | **PASS** | `menu_help` is unset → "Aide" column hidden, no errors; guards intact |
| 2 | All policy links resolve when policies exist | **PASS** | Only Privacy policy exists → `/policies/privacy-policy` renders; the other three are correctly absent |
| 3 | Accordions keyboard-operable; no layout shift on open | **PASS** | `summary` focus + Enter toggles; nothing above moves (content below shifts by the revealed list height — expected disclosure behaviour) |
| 4 | theme check 0 errors | **PASS** | §1 |

### Spec 05 — product card, price, placeholders

| # | Acceptance item | Verdict | Evidence |
|---|---|---|---|
| 1 | Temporary grid rendered 4 placeholders + real products; removed before commit | **CAN'T VERIFY live** | No consumer exists in the theme (still `OrphanedSnippet`); store has 0 products; prior sessions verified it only via theme check |
| 2 | No layout shift when images load | **CAN'T VERIFY live** (code path present) | `assets/product-card.css:21-23`: `aspect-ratio: 4/5` + absolutely positioned contained image reserve the box |
| 3 | Sold-out / on-sale states correct | **CAN'T VERIFY** (0 products) | Code path only: single-variant badge maths + compare-at strike (STATUS `fix(05)` B1) |
| 4 | theme check 0 errors | **PASS** | §1 |

### Spec 08 — collection page + Boutique

| # | Acceptance item | Verdict | Evidence |
|---|---|---|---|
| 1 | Sort changes the grid without reload; URL updates; Back restores | **FAIL** | No sort control exists (`select` count 0); no grid; `collection-sort.js` absent (Q1) |
| 2 | Empty collection shows the empty state, not a broken grid | **FAIL** | `/collections/all` with 0 products = 51px h1 + black; no "bientôt" text, no CTA (Q3) |
| 3 | Boutique renders with zero collections (empty-state text) and with many | **FAIL** | Stub renders the `frontpage` system collection as a blue link; no empty-state branch in `main-list-collections.liquid` (Q1/Q2) |
| 4 | theme check 0 errors | **PASS** | §1 |

## 8. Screenshots (`tools/shots/`, gitignored)

- `qa-home-375.png`, `qa-home-768.png`, `qa-home-1440.png` — full shell, all widths
- `qa-drawer-375.png`, `qa-drawer-768.png`, `qa-drawer-1440.png` — open menu drawer
- `qa-collections-375.png`, `qa-collections-768.png`, `qa-collections-1440.png` — Boutique stub + blue link (Q1/Q2)
- `qa-collection-all-375.png`, `qa-collection-all-768.png`, `qa-collection-all-1440.png` — empty catalogue (Q1/Q3)
- `qa-scrolled-header-375.png` — sticky header + scroll hairline
- `qa-focus-skiplink-375.png`, `qa-focus-menubutton-375.png` — focus-visible rings
- `qa-monogram-header-375.png`, `qa-footer-lockup-375.png`, `qa-footer-375.png` — brand details

## 9. Limits / not verified

- No push smoke (instructed); the theme-editor view (settings group) needs admin access.
- Cart count > 0, spec 05's card rendering live, and the 400px monogram could not be exercised (0 products; no consumer; not used by the theme).
- "Touch" was exercised through the CLI's `tap` alias (same CDP click path) plus a low-level mouse backdrop click, not a physical touch stack.
- Policy text, menus, collection titles and the store name are merchant data; Q4 is an admin action, not a theme fix.
