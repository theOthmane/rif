# Spec 08 — Collection page + Boutique (all collections)

## Files
- `theme/templates/collection.json`, `theme/templates/list-collections.json` (compose the sections below; the spec-00 `main-collection` / `main-list-collections` stubs are deleted once the page is rebuilt)
- `theme/sections/collection-header.liquid`, `theme/sections/product-grid.liquid`, `theme/sections/collection-tiles.liquid` (new)
- `theme/snippets/pagination.liquid` (new), `theme/assets/collection.css`, `theme/assets/collection-sort.js`
- `theme/locales/fr.default.json`

## Collection page (`templates/collection.json`)
1. **Header**: breadcrumb (`Accueil / Boutique / {{ collection.title }}`, `.t-label`), title in Bodoni `--fs-2xl`, description (if any) max 60ch in `--c-text-2`, product count "{{ n }} pièces".
2. **Toolbar** (sticky under the header on scroll, 48px): sort `<select>` (options from `collection.sort_options`, current `collection.sort_by`). Changing it updates `?sort_by=` and refreshes the grid region through the Section Rendering API (`fetch` the `product-grid` section by its `section.id`; same pattern note in `theme/AGENTS.md`). Without JS: a submit button inside `<noscript>`.
   **No filters in v1.**
3. **Grid**: `{% paginate collection.products by 24 %}`, 2 columns mobile, 3 at 768px, 4 at 1200px, gap `--s-5` / `--s-4` row. Uses `product-card`. First 4 eager.
4. **Pagination**: Prev / page numbers / Next, `.t-label`, 44px targets, `aria-current`.
5. **Empty state**: monogram 48px, "Cette collection arrive bientôt.", button "Voir toute la boutique" → `routes.collections_url`. Also show 4 placeholder cards beneath at 50% opacity? **No**, keep the empty state clean.

## Boutique (`templates/list-collections.json`)
- Title "Boutique", subtitle `rifano.tagline_*`.
- Tiles for each collection (`collections` loop, skip `frontpage` and empty-handle system collections): aspect 4/5, collection image (or first product's featured image, or placeholder `collection-1..6`), title over a bottom gradient (`--c-bg` → transparent), product count. 1 column mobile, 2 at 768px, 3 at 1200px.
- Hover (pointer fine): image scale 1.03.

## Acceptance
- [ ] Sort changes the grid without a full reload; URL updates; Back button restores the previous sort
- [ ] Empty collection shows the empty state, not a broken grid
- [ ] Boutique renders with zero collections (shows the empty-state text) and with many
- [ ] theme check 0 errors

Commit: `feat(08): collection page + boutique`
