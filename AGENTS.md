# AGENTS.md — rules for every coding session in this repo

You are building the RIFANO Shopify theme. You get **one spec per session**.

## Read first, in this order
1. This file
2. `theme/AGENTS.md`: the theme architecture rules. **They override your Shopify habits.**
3. `PRODUCT.md`: product truth. Never contradict it, never invent facts.
4. `DESIGN.md` + `theme/assets/tokens.css`: once spec 01 has created them
5. `PLAN.md` §2: fixed decisions
6. The spec you were given (`specs/NN-*.md`)

## Non-negotiables
- **Online Store 2.0: sections + JSON templates + section groups.** Theme blocks inside sections (`blocks/` + `{% content_for 'blocks' %}`) are allowed. **No `{% block %}` or `{% partial %}` tags** — the store rejects them at upload. No `{% stylesheet %}` / `{% javascript %}` either: every component keeps one CSS file in `theme/assets/` and one JS module per behaviour.
- Every visible string is a translation key: `{{ 'rifano.key' | t }}` in `theme/locales/fr.default.json`. French only.
- Routes only via `routes.*` (`routes.cart_url`, `routes.search_url`, `routes.collections_url`, `routes.cart_add_url`…). Never hard-code `/cart`.
- Colours, sizes, spacing, radii, durations come **only** from CSS custom properties in `tokens.css`. No raw hex or px values in component CSS (exceptions: `0`, `1px` hairlines, `100%`).
- One CSS file per component in `theme/assets/` (e.g. `header.css`), loaded only where used. One JS module per behaviour (e.g. `cart-drawer.js`), loaded `type="module"` with `defer` semantics.
- Vanilla JS + custom elements. No jQuery, no frameworks, no external CDNs.
- Mobile first: design at 375px, then enhance with `min-width` media queries at 768px and 1200px.
- Accessibility: semantic HTML, visible focus (`:focus-visible`), 44×44px tap targets, `prefers-reduced-motion` respected, images have `alt`, dialogs trap focus and close with Esc.
- Never show third-party brand names or logos (Rolex, Armani, AP, Casio…). Product images in `brand/watches/` are **reference only**. Never ship them in `theme/assets/`.
- Zero-products safe: every list must render placeholders (`placeholder_svg_tag`) or a styled empty state.
- Do not touch files the spec does not list. If you must, stop and explain why.
- Do not invent prices, reviews, stats, testimonials or delivery promises beyond `PRODUCT.md`.

## Tools
- Shopify CLI: `npx @shopify/cli@latest …` (the global `shopify` binary is broken).
- Shopify Dev MCP: use it to look up Liquid objects, filters and tags **before** using one you are not 100% sure of, and to validate. This theme uses OS 2.0 tags (`section`, `sections`, `content_for`, `render`, `doc`). Check them, don't guess.
- Impeccable: `/impeccable <command>`. Use the command the spec names. Treat `PRODUCT.md` "Brand Commitments" (pure black `#000000` + void essence `#080808` + brushed silver, Bodoni Moda + Manrope) as intentional, never as anti-patterns.
- **Stores**: preview/test store `fexgzv-pq` (storefront password in `QA-REPORT.md`). Owner preview link: https://fexgzv-pq.myshopify.com/?preview_theme_id=185969639647 . Launch store: **TBD** (owner decides before spec 16; `xpziwn-tw` is not accessible from this login). Never touch `xpziwn-tw`.

## Workflow for every spec
1. Read the spec. List the files you will create or edit.
2. Implement.
3. Run `npx @shopify/cli@latest theme check --path theme` (or the MCP validator). Fix until **0 errors**. Warnings: fix if in files you touched. Then run the push smoke:

   ```
   npx @shopify/cli@latest theme push --path theme --store fexgzv-pq --theme 185969639647 --no-input
   ```

   This always updates the same unpublished preview theme (`rifano-smoke`, id `185969639647`). Never use `--unpublished` and never create new themes. If theme `185969639647` no longer exists, stop and tell the owner.

   theme check cannot see store-side Liquid errors; the push smoke can. Report both error counts. The required baseline on fexgzv-pq is **0 errors** from each; any error is a fail you must fix.
4. Check every acceptance criterion in the spec. State pass/fail for each.
5. Update `STATUS.md`: date, spec number, what changed, theme-check result, anything left open.
6. Stage only the files in the spec's file list plus `STATUS.md`. If `git status` shows anything else, list it in your reply and leave it unstaged. `git add <files> && git commit -m "feat(NN): <short summary>" && git push`.
7. Reply with: files changed, acceptance checklist, anything the owner must do in Shopify admin.

If blocked: write the blocker in `STATUS.md`, commit what passes theme check, and stop. Never fake a pass.
