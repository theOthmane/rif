# Spec 00 — Migration: Skeleton blocks → Online Store 2.0 sections

## Context

Store `fexgzv-pq` rejects `{% block %}` and `{% partial %}` at upload (13 `Unknown tag` errors,
identical to Shopify's own `skeleton-theme`), and the owner has no access to `xpziwn-tw`. Owner
decision: reopen PLAN §2 and move `theme/` to **standard Online Store 2.0 — sections + JSON
templates + section groups**. Theme blocks inside sections (`{% content_for 'blocks' %}`) do not
use the `{% block %}` tag and are allowed. `fexgzv-pq` is the preview/test store from now on.
This spec is re-plumbing only: **no design, copy, translation, setting or behaviour changes.**

## Goal

Make `theme/` upload and render on `fexgzv-pq` under the sections architecture, with the current
shell (announcement, header, menu drawer, footer) and every current page ported as-is.

## Files

- `theme/layout/theme.liquid` (rewrite composition)
- `theme/sections/announcement.liquid`, `theme/sections/header.liquid`,
  `theme/sections/menu-drawer.liquid`, `theme/sections/footer.liquid` (moved from `theme/blocks/`;
  the `blocks/` originals are deleted, including `theme/blocks/container.liquid`)
- `theme/sections/header-group.json`, `theme/sections/footer-group.json` (new)
- one `main-*` section per page (new): `theme/sections/main-404.liquid`,
  `main-article.liquid`, `main-blog.liquid`, `main-cart.liquid`, `main-collection.liquid`,
  `main-index.liquid`, `main-list-collections.liquid`, `main-page.liquid`, `main-password.liquid`,
  `main-product.liquid`, `main-search.liquid`
- JSON templates (new; the `.liquid` originals are deleted): `theme/templates/404.json`,
  `article.json`, `blog.json`, `cart.json`, `collection.json`, `index.json`,
  `list-collections.json`, `page.json`, `password.json`, `product.json`, `search.json`
- `theme/templates/gift_card.liquid` (unchanged — stays Liquid)
- `theme/layout/password.liquid` (no change expected: it renders `content_for_layout` and carries
  no `{% block %}` tag; `templates/password.json` selects it with `"layout": "password"`)
- `theme/README.md` (update the architecture sections; they still document `{% block %}`)
- `STATUS.md` (session entry)

## Steps

### 1. Section groups

Create `theme/sections/header-group.json`:

```json
{
  "type": "header",
  "name": "Header group",
  "sections": {
    "announcement": { "type": "announcement", "settings": {} },
    "header": { "type": "header", "settings": {} },
    "menu-drawer": { "type": "menu-drawer", "settings": { "menu": "main-menu" } }
  },
  "order": ["announcement", "header", "menu-drawer"]
}
```

Create `theme/sections/footer-group.json`:

```json
{
  "type": "footer",
  "name": "Footer group",
  "sections": {
    "footer": { "type": "footer", "settings": { "menu_shop": "footer" } }
  },
  "order": ["footer"]
}
```

`type`, `name`, `sections` and `order` are the required attributes of a section group file
(Shopify Dev MCP: section groups).

### 2. Move the four blocks to sections

- `blocks/announcement.liquid` → `sections/announcement.liquid`
- `blocks/header.liquid` → `sections/header.liquid`
- `blocks/menu-drawer.liquid` → `sections/menu-drawer.liquid`
- `blocks/footer.liquid` → `sections/footer.liquid`

Keep markup, CSS, JS, translation keys and settings exactly. For each file:

- Remove the `{% doc %}` header (LiquidDoc is a snippet/theme-block feature); keep its text as a
  Liquid comment if useful.
- Remove `{{ block.shopify_attributes }}` (a section has no `block` object).
- Keep the existing schema settings and defaults: menu-drawer `menu` default `main-menu`; footer
  `menu_shop` default `footer`, `menu_help` without a default (Shopify accepts only `main-menu`
  and `footer` as `link_list` defaults).
- Add `"presets": [{ "name": "…" }]` to every moved section so it can be re-added from the theme
  editor.
- Do not add `{% stylesheet %}` / `{% javascript %}`; CSS and JS stay in `theme/assets/`.

The `announcement` and `header` sections keep reading the global RIFANO settings
(`settings.announcement_text` etc.), the menu drawer keeps its `<script src="{{ 'menu-drawer.js' |
asset_url }}" type="module" defer>` line, and the footer keeps loading `footer.css` itself.

### 3. Layout

Rewrite the `<body>` of `theme/layout/theme.liquid`:

```liquid
<body>
  <a href="#main-content" class="skip-link">{{ 'rifano.skip_to_content' | t }}</a>

  <div class="page">
    <div class="header__sentinel" aria-hidden="true"></div>

    <div class="site-chrome">
      <menu-drawer>
        {% sections 'header-group' %}
      </menu-drawer>
    </div>

    <main id="main-content">
      {{ content_for_layout }}
    </main>

    {% sections 'footer-group' %}
  </div>
</body>
```

- Keep the `<head>` (font preloads, tokens → critical → base → header.css, `css-variables`,
  `meta-tags`, `content_for_header`) and the skip link.
- `{% sections 'header-group' %}` renders the group; the `<menu-drawer>` custom element keeps
  wrapping the header area so `menu-drawer.js` finds the button and dialog (it already falls back
  to `document.querySelector`).
- Keep `.page`, the sentinel and the sticky `.site-chrome` exactly as they are — the sticky-header
  fix from `fix(03)` must not regress.
- `{% sections 'footer-group' %}` replaces the footer container call.
- No `{% block %}` call remains anywhere.

### 4. Header cart count

In `sections/header.liquid`, replace the `{% partial 'cart-count' %}` / guard pair with one copy
of the plain markup (today's fallback):

```liquid
<span id="cart-icon-bubble" class="cart-count" {% if cart.item_count == 0 %}hidden{% endif %}>{{ cart.item_count }}</span>
```

Keep the id stable — spec 10 refreshes this element with the Section Rendering API.

### 5. Templates → JSON + `main-*` sections

For each existing `.liquid` template:

1. Create `theme/templates/<name>.json` with the ported page:

   ```json
   {
     "sections": {
       "main": { "type": "main-<name>", "settings": {} }
     },
     "order": ["main"]
   }
   ```

2. Create `theme/sections/main-<name>.liquid` with the template's markup verbatim: strip the
   `{% block 'container' %}` wrapper and its `{% endblock %}`, wrap the content in
   `<div class="page-width">…</div>` (the layout width now comes from CSS), and give the section
   a schema (`name`, empty `settings`, `presets`).
3. Delete the old `.liquid` template.

The pages (old → new):

| Old template | JSON template | Main section |
|---|---|---|
| `404.liquid` | `404.json` | `main-404` |
| `article.liquid` | `article.json` | `main-article` |
| `blog.liquid` | `blog.json` | `main-blog` |
| `cart.liquid` | `cart.json` | `main-cart` |
| `collection.liquid` | `collection.json` | `main-collection` |
| `index.liquid` | `index.json` | `main-index` |
| `list-collections.liquid` | `list-collections.json` | `main-list-collections` |
| `page.liquid` | `page.json` | `main-page` |
| `password.liquid` | `password.json` | `main-password` |
| `product.liquid` | `product.json` | `main-product` |
| `search.liquid` | `search.json` | `main-search` |

- `templates/password.json` additionally carries `"layout": "password"` so the password shell
  keeps rendering it.
- `templates/gift_card.liquid` stays exactly as it is (it uses `{% layout none %}` and manages its
  own document).
- Later specs rebuild these stubs; each page spec replaces, recomposes or deletes its `main-*`
  section when it takes the page over.

### 6. README

Update `theme/README.md`: remove the `{% block %}` / `{% partial %}` documentation and describe
the new architecture (sections, JSON templates, section groups, theme blocks, Section Rendering
API). No code example may keep the removed tags.

### 7. Verify

- `npx @shopify/cli@latest theme check --path theme` → **0 errors**; fix warnings in files touched.
- `npx @shopify/cli@latest theme push --path theme --store fexgzv-pq --unpublished --theme
  rifano-smoke --no-input` → **0 errors**. This is the new baseline; any error is a fail.
- `npx @shopify/cli@latest theme dev --path theme --store fexgzv-pq --store-password <password in
  QA-REPORT.md>` and open `/`, `/cart`, `/collections/all`, `/search` at 375px and 1440px: header
  (sticky, scroll hairline, centred monogram), menu drawer (opens, closes, focus returns), footer.
- `grep -rE '\{%-? *(block|partial)[ %>-]' theme/` → nothing outside `{% doc %}` comments.

## Acceptance

- [ ] `theme check` 0 errors
- [ ] push smoke on `fexgzv-pq` shows 0 errors
- [ ] `theme dev` on `fexgzv-pq` renders `/`, `/cart`, `/collections/all` and `/search` at 375px
      and 1440px, with the header, menu drawer and footer working
- [ ] no `{% block %}` or `{% partial %}` tag remains in `theme/` outside `{% doc %}` comments
- [ ] `tokens.css`, the fonts, `base.css`, `critical.css`, every component CSS/JS file, the
      snippets, the locales and the RIFANO settings group are unchanged

Commit: `feat(00): migrate to sections + JSON templates`
