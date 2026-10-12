# Spec 19 — Home rows: no fake products on the live site

## Goal
The owner can't use the "Produit à venir" placeholder cards. They look like products but can't be clicked. **Owner decision:** placeholder cards only appear **in the Shopify theme editor** (`request.design_mode`). On the live storefront, a row whose collection has no products is **not rendered**. If no row is left, one clean "coming soon" line links to the Boutique.

## Read first
- `theme/sections/home-rows.liquid`, `theme/assets/home-rows.css`, `theme/assets/home-rows.js`, `theme/snippets/product-card.liquid`
- Shopify Dev MCP: confirm `request.design_mode` and `collection.products_count` before use.

## Files
- `theme/sections/home-rows.liquid` (edit)
- `theme/assets/home-rows.css` (edit: empty-state style only)
- `theme/locales/fr.default.json` (2 keys)
- `home-rows.js` only if the Plus logic breaks (stop and explain first)

## Behaviour
Let `show_placeholders = request.design_mode`.

1. **Menu with collection links:** a link becomes a row only if `link.type == 'collection_link'` and `link.object != blank` **and** (`link.object.products_count > 0` **or** `show_placeholders`).
   - `rows_total`, `row_number`, the `hidden` cutoff (`rows_visible`) and the "Plus" button/link all count **rendered** rows only. An empty collection must not consume a visible slot or leave a gap.
   - In the editor, an empty collection still shows its 4 placeholder cards (unchanged).
2. **No menu / no collection links:** editor → the 3 placeholder rows (unchanged). Live → the empty state.
3. **Every collection empty (live):** the empty state.
4. **Empty state** (inside the same `.rows` wrapper, so the section rhythm holds):
   - One sentence: `rifano.rows_empty` = "La sélection arrive bientôt."
   - One ghost button: `rifano.rows_empty_cta` = "Voir la boutique" → `routes.collections_url`.
   - No icon, no placeholder art, no Plus control. Styled with tokens only. Centred, `--section-y` rhythm, `--c-text-2` sentence.
5. Update the header comment of `home-rows.liquid` to describe the new rule.

## Owner admin (not code, list it in the reply)
- Put the real product(s) into the collections the home-rows menu links to (the preview store's "Montres" row is empty today, which is why it showed placeholders).
- The preview store's product image shows a third-party brand (Audemars Piguet). Replace it with an original RIFANO image or delete it (PRODUCT.md: never shown).
- The store root shows Shopify's default published theme, not RIFANO. Test on the preview URL (AGENTS.md §5) until spec 16 publishes.

## Verification
- Live preview (Gate C): with the current store data, no "Produit à venir" text anywhere on the home page (`document.body.innerText`), no empty `.row`, Plus behaves (button only if rendered rows > `rows_visible`). Screenshots `tools/shots/19-home-{375,768,1440}.png`.
- Temporarily point the menu at only empty collections (or note CAN'T VERIFY) → empty state renders; screenshot `tools/shots/19-home-empty-375.png`. Restore the menu afterwards.
- Theme editor (`design_mode`) can't be reached headless: mark CAN'T VERIFY and list it as an owner check ("open the editor, see placeholders in empty rows").

## Acceptance
- [ ] Live: no placeholder cards, empty collections produce no row
- [ ] Live: all-empty → one sentence + Boutique button
- [ ] Rendered-row count drives `rows_visible` / Plus correctly
- [ ] Editor: placeholders still shown (owner check)
- [ ] Gate A/B/C pass, overflow 0

Commit: `feat(19): hide empty home rows on the live store`
