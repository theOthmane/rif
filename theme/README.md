<h1 align="center" style="position: relative;">
  <br>
    <img src="./assets/tokens.css" alt="" width="200">
  <br>
  RIFANO theme
</h1>

A RIFANO Shopify theme built on sections + JSON templates + section groups.
Templates compose each page from sections and theme blocks, snippets, and inline
markup. It's designed to stay lean and to be edited by coding agents as
readily as by people.

<p align="center">
  <a href="./LICENSE.md"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
  <a href="./actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Shopify/skeleton-theme/actions/workflows/ci.yml/badge.svg"></a>
</p>

## Getting started

### Prerequisites

Before starting, ensure you have the latest Shopify CLI installed:

- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) – helps you download, upload, preview themes, and streamline your workflows

If you use VS Code:

- [Shopify Liquid VS Code Extension](https://shopify.dev/docs/storefronts/themes/tools/shopify-liquid-vscode) – provides syntax highlighting, linting, inline documentation, and auto-completion specifically designed for Liquid templates

### Clone

Clone this repository using Git or Shopify CLI:

```bash
git clone git@github.com:Shopify/skeleton-theme.git
# or
shopify theme init
```

### Preview

Preview this theme using Shopify CLI:

```bash
shopify theme dev
```

## Theme architecture

```bash
.
├── assets          # CSS, JavaScript, and other static assets
├── blocks          # Theme blocks, nested inside sections
├── config          # Global theme settings and customization options
├── layout          # Top-level page wrappers
├── locales         # Translation files for theme internationalization
├── sections        # Page regions, plus header-group.json / footer-group.json
├── snippets        # Reusable Liquid code or HTML fragments
└── templates       # JSON composition roots, one per page type (gift_card.liquid only Liquid)
```

To learn more, refer to the [theme architecture documentation](https://shopify.dev/docs/storefronts/themes/architecture).

## Sections + JSON templates + section groups

Every page is composed from sections. The composition flows in one direction:

```
templates/*.json → sections/main-*.liquid → snippets / inline markup
```

`layout/theme.liquid` renders the `header-group` and `footer-group` section
groups around `content_for_layout` in `<main id="main-content">`.
`layout/password.liquid` renders `content_for_layout` only.

### Templates

[Templates](https://shopify.dev/docs/storefronts/themes/architecture/templates#template-types)
control what's rendered on each type of page. In this theme they are JSON
files (`templates/*.json`), each listing its sections (`sections` + `order`).
Every page template points at one `main-*` section; `templates/password.json`
additionally sets `"layout": "password"`. `templates/gift_card.liquid` is the
only Liquid template (it uses `{% layout none %}` and manages its own
document).

For example, `templates/index.json` composes the home page from its main
section:

```json
{
  "sections": {
    "main": { "type": "main-index", "settings": {} }
  },
  "order": ["main"]
}
```

### Sections

[Sections](https://shopify.dev/docs/storefronts/themes/architecture/sections)
are the theme's building units. Each section is a single file in `sections/`
with a `{% schema %}` (`name`, `settings`, `presets` so it can be re-added
from the theme editor). The shell sections (`announcement`, `header`,
`menu-drawer`, `footer`) live in the `header-group` and `footer-group`
section groups, which `layout/theme.liquid` renders. Layout width comes from
CSS (`.page-width`), not from a wrapper section.

### Section groups

[Section groups](https://shopify.dev/docs/storefronts/themes/architecture/section-groups)
are merchant-editable lists of sections rendered by the layout:
`sections/header-group.json` (announcement → header → menu-drawer) and
`sections/footer-group.json` (footer). The file shape is `type` (`header` or
`footer`), `name`, `sections`, `order`.

### Theme blocks

[Theme blocks](https://shopify.dev/docs/storefronts/themes/architecture/blocks)
nest inside sections that declare `"blocks": [{ "type": "@theme" }]` and
render where the blocks go. Each block is a single file in `blocks/`, opens
with a `{% doc %}` header, keeps `{{ block.shopify_attributes }}` on its
root element, and ends with a `{% schema %}`.

## Non-negotiables

This theme is a standard Online Store 2.0 theme. When editing it:

- No `{% section %}` static calls except where a spec explicitly requires a
  stable section ID. Prefer JSON templates and section groups.
- No JSON-template overrides in config: page composition lives in
  `templates/*.json` only.
- No Liquid-embedded assets: keep all CSS and JavaScript in `assets/` rather
  than embedded asset tags.
- Compose pages from sections and theme blocks, not single-use Liquid
  templates.

[`AGENTS.md`](./AGENTS.md) is the source of truth for the theme's dialect and the
full set of rules coding agents follow.

## CSS and JavaScript

All theme CSS and JavaScript live in [`assets/`](./assets/), rather than being
embedded in Liquid. This keeps blocks focused on markup without requiring
assets to live in a single file.

## Section Rendering API

Regions that must be re-rendered from the server use the Section Rendering
API: request `?sections=id1,id2` (JSON, up to five sections per request) or
`?section_id=id` (that section's HTML directly). Cart mutations can bundle
several sections in one Cart API response so the regions stay synchronized.
The previous `liquid-tips` snippet and `assets/liquid-tips.js` demonstrated
the equivalent interaction and were removed in spec 01; recover them with
`git show 8c04487:theme/assets/liquid-tips.js` for the request shape only.

Build URLs from the current page URL or Liquid `routes.*` so requests
preserve locale and market routing. Scripts in returned HTML do not run when
inserted with `innerHTML`, so bind behaviour from an ancestor that is never
replaced. Applying returned markup must preserve focus, text selection, form
values, and scroll position. If the server corrects a form value, such as a
cart quantity, explicitly update the control after applying the response; the
returned markup alone does not replace its preserved value. Cancel stale
requests, provide loading feedback and accessible announcements, and restore
transient state such as open disclosures. Read URL state from
`window.location.search` for shared links and browser navigation.

## Contributing

We're excited for your contributions to the Skeleton Theme! This repository aims to remain as lean, lightweight, and fundamental as possible, and we kindly ask your contributions to align with this intention.

Visit our [CONTRIBUTING.md](./CONTRIBUTING.md) for a detailed overview of our process, guidelines, and recommendations.

## License

Skeleton Theme is open-sourced under the [MIT](./LICENSE.md) License.
