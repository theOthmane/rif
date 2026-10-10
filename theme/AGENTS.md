# RIFANO Theme Agent Guide

A standard **Online Store 2.0** theme. Pages are built from **sections**, the
layout composes **section groups**, and templates are **JSON**. Theme **blocks**
nest inside sections through `{% content_for 'blocks' %}`. The code is the
source of truth.

## Non-negotiables when editing this theme

- **No `{% block %}` / `{% partial %}` tags** (nor `{% endblock %}` /
  `{% endpartial %}`). The preview/test store (`fexgzv-pq`) rejects them at
  upload with `Unknown tag`, exactly as it rejects Shopify's own skeleton
  theme. Composition is sections + JSON templates + section groups.
- **No Liquid-embedded assets:** no `{% stylesheet %}`, no `{% javascript %}`.
  All CSS and JavaScript live in `assets/`.
- **Never put a Liquid tag inside a `{% # %}` inline comment:** the first ` %}`
  ends the comment and the rest prints on the page. Use
  `{% comment %}…{% endcomment %}` instead.
- **No static `{% section %}` calls** unless a spec explicitly requires one for
  a stable section ID (spec 10's cart drawer does). Prefer JSON templates and
  section groups, which merchants can edit.
- **Whitespace matters:** include whitespace between an HTML tag name and a
  following Liquid delimiter (`<li {% ... %}`, not `<li{% ... %}`).
- **Translated UI only:** every user-facing string uses a literal
  `{{ 'key' | t }}` call.
- **Shopify routes for storefront URLs:** use Liquid `routes.*` for every
  storefront path; never hardcode `/cart`, `/search`, or `/collections`.
- `.theme-check.yml` stays a pristine `extends: theme-check:recommended` with
  **zero overrides**. Fix Theme Check findings in the Liquid, never in config.

## Page structure

```
layout/theme.liquid    → {% sections 'header-group' %} + <main>content_for_layout</main> + {% sections 'footer-group' %}
layout/password.liquid → <main>content_for_layout</main> (the password page gets no header/footer groups)
sections/*.liquid      → page regions and layout sections
sections/header-group.json, sections/footer-group.json → the layout's merchant-editable section lists
blocks/*.liquid        → theme blocks, nested inside sections
templates/*.json       → which sections compose each page, in which order
templates/gift_card.liquid → the only Liquid template ({% layout none %})
```

A page is composed like this:

1. `templates/<page>.json` lists its sections (`sections` + `order`). Every page
   template points at a `main-*` section; specs add and rebuild the rest.
2. `layout/theme.liquid` renders `content_for_layout` inside
   `<main id="main-content">`, with the header and footer groups around it.
3. A section renders one region. Parts that merchants should add, remove or
   rearrange become theme blocks inside that section.
4. Layout width comes from CSS (`.page-width`, `--page-max`, `--gutter`); there
   is no width-wrapper block any more.

## Sections

- One section per file in `sections/`; one region per section.
- Every section has a `{% schema %}` with `name`, `settings` and — for sections
  a merchant should be able to add — `presets`. **Presets are allowed on
  sections** (they were banned under the old `{% block %}` architecture).
- Give every setting a sensible default so the theme editor works (for example
  `menu`: `main-menu`).
- A section that merchants fill with nestable content declares
  `"blocks": [{ "type": "@theme" }]` (add `{ "type": "@app" }` when app blocks
  are wanted) and renders `{% content_for 'blocks' %}` where the blocks go.
- Global settings stay in the RIFANO settings group
  (`config/settings_schema.json`); per-section behaviour goes in the section
  schema.
- `link_list` settings accept only `main-menu` and `footer` as defaults.

## Section groups

- The header and footer areas are section groups:
  `sections/header-group.json` and `sections/footer-group.json`.
- The file shape is `type` (`header` or `footer`), `name`, `sections`, `order`.
- `layout/theme.liquid` renders them with `{% sections 'header-group' %}` and
  `{% sections 'footer-group' %}`. Order inside a group is merchant-editable, so
  never hardcode header/footer sections anywhere else.
- Current groups: `header-group` = announcement → header → menu-drawer;
  `footer-group` = footer.

## JSON templates

- Page composition lives in `templates/*.json`. Section keys in `sections` are
  stable ids; `order` lists the render order. Duplicate ids are not allowed.
- A JSON template can render up to 25 sections, and each section up to 50
  blocks.
- `templates/password.json` sets `"layout": "password"` so the password shell
  keeps rendering it. `templates/gift_card.liquid` is the only Liquid template.

## Theme blocks

- `blocks/*.liquid` are theme blocks, never pages. Sections render them with
  `{% content_for 'blocks' %}` (all configured blocks, in the JSON template or
  section group) or — rarely — with
  `{% content_for 'block', type: 'name', id: 'static-id' %}` (one static block).
- Every theme block starts with a `{% doc %}` header (LiquidDoc is for snippets
  and theme blocks, not sections) and has a `{% schema %}`.
- Keep `{{ block.shopify_attributes }}` on the block's root element so the theme
  editor can identify it.
- Theme blocks can nest other theme/app blocks by declaring `blocks` and
  rendering `{% content_for 'blocks' %}`.
- App blocks (`@app`) only work inside sections that are part of a JSON template
  or section group — never in statically rendered sections.

## Static sections

`{% section 'name' %}` renders a section statically at that spot, with the
filename as its ID (`{% section 'cart-drawer' %}` → id `cart-drawer`). Its
settings cannot be changed from the editor because it is not in a template or
group. Use it only when a spec explicitly needs a stable section ID; otherwise
prefer JSON templates and section groups.

## The Section Rendering API

There is no `{% partial %}`. When a region must be re-rendered from the server,
use the Section Rendering API:

- **Section IDs:** a statically rendered section's ID is its filename (`cart-drawer`
  → `cart-drawer`). Sections inside JSON templates and section groups get a
  dynamic ID (`template--123__product-info`, `sections--123__header`); read it
  from `{{ section.id }}` or the section wrapper, never hardcode it. Requesting a
  template or group section by filename does not return the configured section.
- **Requesting:** `?sections=id1,id2` returns JSON (up to five sections per
  request); `?section_id=id` returns that section's HTML directly (404 when the
  section does not exist). Cart mutations can bundle several sections in one
  Cart API response (`fetch(routes.cart_change_url + '.js', { …, sections:
  'cart-contents,cart-count' })`) so the regions stay synchronized.
- **URLs stay locale-aware:** build them from `routes.*` or the current page URL
  (`window.Shopify.routes.root`), not from hardcoded paths.
- **Scripts in returned HTML don't run** when inserted with `innerHTML`,
  `DOMParser` or `replaceWith`. Bind behaviour from an ancestor that is never
  replaced, or re-initialize in `connectedCallback()`.
- **UX rules (carried over from the old `{% partial %}` tag):** apply the
  returned HTML without losing focus, text selection, form values or scroll
  position; explicitly update server-adjusted controls (e.g. a quantity
  corrected by inventory validation); cancel stale requests with an
  `AbortSignal`; set `aria-busy` while loading; announce meaningful results in a
  live region; restore transient DOM state such as open disclosures; read URL
  state from `window.location.search` so shared links and browser navigation
  behave the same.

## Schemas and theme check

- Section and block schemas are strict JSON inside `{% schema %}` — one tag per
  file, never nested inside another tag.
- `.theme-check.yml` stays untouched (see Non-negotiables).
- theme check cannot see store-side upload errors. The `theme push` smoke in
  `AGENTS.md` step 3 is the gate; the required baseline on `fexgzv-pq` is
  **0 errors**.

## Theme map

```
blocks/               theme blocks (nested in sections)
sections/             page regions + header-group.json / footer-group.json
templates/            *.json page composition; gift_card.liquid only Liquid
layout/               theme.liquid shell + password.liquid
snippets/             render-only utilities (logo, price, product-card, image, meta-tags, css-variables)
assets/               CSS, JavaScript, fonts, images
locales/              fr.default.json (storefront), en.default.schema.json (editor labels)
config/               settings_schema.json (RIFANO group), settings_data.json
```
