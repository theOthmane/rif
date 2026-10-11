# AGENTS.md — RIFANO theme: rules, architecture, workflow, progress

You build the RIFANO Shopify theme in `theme/`. **One spec per session.**
Only three docs exist at the root: this file, `PRODUCT.md` (product truth) and `DESIGN.md` (visual system + `theme/assets/tokens.css`).
History lives in git (`git log`), not in docs.

## 1. Read first, in this order
1. This file (all of it)
2. `PRODUCT.md`: never contradict it, never invent facts
3. `DESIGN.md` + `theme/assets/tokens.css`
4. The spec you were given: `specs/NN-*.md`

## 2. Fixed decisions (do not reopen)
| Topic | Decision |
|---|---|
| Architecture | **Online Store 2.0**: sections + JSON templates + section groups; theme blocks inside sections. See §3 |
| Language | Storefront French only (`locales/fr.default.json`). Darija only as brand touches ("Mrehba bik"). Tagline stays "Be different. Be RIFANO." |
| Colour | Pure black `#000000` + void `#080808` + brushed silver; warm-neutral light text. Values only from `tokens.css` |
| Fonts | The pair named in `DESIGN.md`, self-hosted variable WOFF2 in `theme/assets/` |
| Checkout | Native Shopify checkout + manual COD "Paiement à la livraison". Product form must stay compatible with COD-form apps (`@app` slot) |
| Cart | Drawer (`<dialog>`) + `/cart` page share one cart section, refreshed via the Section Rendering API |
| Home rows | Driven by a navigation menu (each link = a collection), placeholders when empty. "Plus" reveals hidden rows, else links to Boutique |
| 3D hero | Canvas frame-sequence scrub (WebP frames in theme assets), poster + reduced-motion fallback |
| Hero watch | Original RIFANO watch only. `brand/watches/*` are third-party brands: reference only, never shipped or shown |
| JS | Vanilla ES modules + custom elements. No jQuery, frameworks or CDNs |
| Skill priority | PRODUCT.md > DESIGN.md > Impeccable > scroll-craft (hero only) > taste-skill (optional polish) |

## 3. Theme architecture (OS 2.0)
```
layout/theme.liquid    → {% sections 'header-group' %} + <main id="main-content">content_for_layout</main> + {% sections 'footer-group' %}
layout/password.liquid → <main>content_for_layout</main> (no header/footer groups)
sections/*.liquid      → one region per file; header-group.json (announcement → header → menu-drawer), footer-group.json (footer)
blocks/*.liquid        → theme blocks, rendered inside sections with {% content_for 'blocks' %}
templates/*.json       → which sections compose each page; gift_card.liquid is the only Liquid template
snippets/              → render-only utilities (logo, icon, price, product-card, image, pagination, meta-tags, css-variables)
assets/                → CSS, JS, fonts, images (flat folder)
locales/               → fr.default.json (storefront), en.default.schema.json (editor labels)
config/                → settings_schema.json (RIFANO group), settings_data.json
```
- **Forbidden tags:** `{% block %}`, `{% partial %}` (the store rejects them at upload), `{% stylesheet %}`, `{% javascript %}`. Never put a Liquid tag inside a `{% # %}` comment; use `{% comment %}`.
- **Sections:** `{% schema %}` with `name`, `settings` (with defaults) and `presets` for addable sections. Nestable content: `"blocks": [{ "type": "@theme" }]` (+ `{ "type": "@app" }` when needed) and `{% content_for 'blocks' %}`. `link_list` defaults accept only `main-menu` and `footer`.
- **Theme blocks:** start with `{% doc %}`, have a `{% schema %}`, keep `{{ block.shopify_attributes }}` on the root. App blocks only work in sections that live in a JSON template or section group.
- **Static `{% section 'x' %}`** only when a spec needs a stable section ID (the cart drawer).
- **Section Rendering API** (replaces partials): `?sections=a,b` (JSON, max 5) or `?section_id=a` (HTML). Template/group sections have dynamic IDs: read `{{ section.id }}`, never hardcode. Cart mutations can bundle `sections`. Scripts in injected HTML don't run: bind behaviour on a stable ancestor or in `connectedCallback()`. Keep focus, form values and scroll; use `AbortController`, `aria-busy` and an `aria-live` announcement.
- `.theme-check.yml` stays `extends: theme-check:recommended` with zero overrides. Fix findings in the Liquid.
- Whitespace between an HTML tag name and a Liquid delimiter: `<li {% … %}>`.

## 4. Non-negotiables
- Every visible string: `{{ 'rifano.key' | t }}` in `fr.default.json`.
- Routes only via `routes.*`. Never hard-code `/cart`, `/search`, `/collections`.
- Colours, sizes, spacing, radii, durations only from `tokens.css` custom properties. No raw hex/px in component CSS (exceptions: `0`, `1px`, `100%`).
- One CSS file per component, loaded only where used; one JS module per behaviour, `type="module"`.
- Mobile first: 375px, then `min-width` 768px and 1200px. No horizontal scroll at any width.
- Accessibility (WCAG 2.2 AA): semantic HTML, `:focus-visible`, 44×44px targets, reduced motion, `alt` text, dialogs trap focus and close with Esc.
- Zero-products safe: placeholders (`placeholder_svg_tag`) or a styled empty state everywhere.
- Never show third-party brand names or logos. Never invent prices, reviews, stats or promises beyond `PRODUCT.md`.
- Touch only the files the spec lists. If you must touch another, stop and explain.
- Don't create new docs, reports or plans at the root. Results go in your reply and the commit message.

## 5. Tools and stores
- Shopify CLI: always `npx @shopify/cli@latest …` (global `shopify` is broken).
- Shopify Dev MCP: look up any Liquid tag/filter/object you are not 100% sure of, and validate.
- Impeccable: `/impeccable <command>` when the spec names one. Brand commitments in `PRODUCT.md`/`DESIGN.md` are intentional, not anti-patterns.
- **agent-browser** (visual QA): run `agent-browser skills get core` once per session before using it.
- **Preview store** `fexgzv-pq`, smoke theme `rifano-smoke` id `185969639647`.
  Preview URL: `https://fexgzv-pq.myshopify.com/?preview_theme_id=185969639647`.
  Storefront password: `STOREFRONT_PASSWORD` in the local `.env` (gitignored). Never write it into any tracked file.
- **Launch store:** TBD by the owner before spec 16. Never touch `xpziwn-tw`.

## 6. Workflow for every spec
1. Read the spec. List the files you will create or edit.
2. Implement.
3. **Gate A** `npx @shopify/cli@latest theme check --path theme` → 0 errors (fix warnings in files you touched).
4. **Gate B** push smoke → 0 errors:
   `npx @shopify/cli@latest theme push --path theme --store fexgzv-pq --theme 185969639647 --no-input`
   Always this theme id. Never `--unpublished`, never create themes. If the theme is gone, stop and tell the owner.
5. **Gate C** visual QA with agent-browser on the preview URL (enter the storefront password if asked):
   - Screenshot every page the spec touched at **375×812, 768×1024, 1440×900** → `tools/shots/NN-<page>-<width>.png` (gitignored).
   - Check: no console errors, `document.documentElement.scrollWidth === clientWidth` (no horizontal overflow), no "translation missing", fonts render (not fallback), interactive parts of the spec actually work (open/close, click, keyboard Tab/Esc).
   - A visual acceptance item is PASS **only with a screenshot path** as evidence. Otherwise mark it CAN'T VERIFY.
6. Check every acceptance item: PASS / FAIL / CAN'T VERIFY, with file:line or screenshot path.
7. Update the **Progress** table below (status + commit hash, one line). Nothing else in this file.
8. Stage only the spec's files + `AGENTS.md` (progress line). Anything else in `git status`: list it in your reply, leave it unstaged.
   `git commit -m "feat(NN): <summary>"` (body: gate results A/B/C + open items), then `git push`.
9. Reply: files changed, gate results, acceptance checklist, owner admin to-dos. Then stop.

If blocked: commit what passes Gates A+B, mark the spec ⚠️ in Progress with a one-line reason, stop. Never fake a pass.

## 7. Progress
| Spec | Status | Commit |
|---|---|---|
| 00 migration to OS 2.0 | ✅ | 0851189 |
| 01 foundations | ✅ | 0cf0f1c |
| 02 brand assets | ✅ | 5856b4d |
| 03 header + menu | ✅ | 3b429b5 |
| 04 footer | ✅ (redesign in 17) | 5f7bc11 |
| 05 product card | ✅ | 02b0b1a |
| 06 home intro | ✅ | 3b9a328 |
| 08 collection + boutique | ✅ | 7cd641d |
| 17 fonts + footer redesign | ✅ | 2e687df |
| 07 home rows | ✅ | 72d87de |
| 09 product | ⬜ | — |
| 10 cart | ⬜ | — |
| 11 content pages | ⬜ | — |
| 12 system pages | ⬜ | — |
| 13 hero frames (Part B) | ⬜ | — |
| 14 hero scroll | ⬜ | — |
| 15 audit + polish | ⬜ | — |
| 16 launch | ⬜ | — |
