# Spec 23 — Launch readiness (go / no-go before publish)

## Goal
Close the last gaps between "RIFANO v1.0.0 is pushed" and "the owner can publish":
fix the stale fact defaults in the theme code, then verify on the main-store preview the parts nobody could test yet because the store was empty: product page, add to cart, packs populated, Lighthouse. This closes the ⚠️ on specs 15 and 21.

## Runs when
Part A: any time. Part B: only after the owner confirms that `xpziwn-tw` has **at least 1 active product per collection** (Montres, Colliers, Pochettes & Sacs) **and at least 1 Shopify Bundles pack** in the `packs` collection with its metafields. If not, do Part A, mark Part B ⚠️ "waiting for products", stop.

## Part A — stale defaults (code, normal §6 workflow on fexgzv-pq)
The owner confirmed delivery 24–48h, warranty 3 months, returns 14 days (PRODUCT.md, 2026-10-14). `theme/config/settings_schema.json` still defaults to the old placeholders (24–72h / 12 mois / 7 jours), so the dev store shows the wrong facts.
- Set the defaults to "Livraison 24–48h", "Garantie 3 mois", "Retours sous 14 jours". Contact defaults stay blank (blank hides them).
- grep `theme/` (liquid, json, locales) for `24–72`, `24-72`, `12 mois`, `7 jours`, `600 00 00`, `[PH]` → none left.
- Gates A/B/C on fexgzv-pq (footer + product trust badges, 375/768/1440 → `tools/shots/23-dev-*.png`).
- Then bring the unpublished main theme to the same code with the §6b push command (code only, ignores as written), **targeting RIFANO v1.0.0 #189060677884** directly. It isn't published yet, so no staging duplicate is needed this one time. Never `settings_data.json`. 0 errors.

## Part B — main-store verification (read-only, preview of #189060677884)
Preview `https://xpziwn-tw.myshopify.com/?preview_theme_id=189060677884`, password `MAIN_STOREFRONT_PASSWORD` from `.env`. No writes to the store, no orders.
1. Home: rows render real products (no empty state), Plus/boutique link correct, depth layers + hero intact.
2. Product page (one per collection): gallery, price in MAD, trust badges show 24–48h / 3 mois / 14 jours, WhatsApp link opens `wa.me/212658250549`, no third-party brand visible in any image (look at every image).
3. Add to cart → drawer opens with the line, quantity +/−, remove, `/cart` page in sync, Esc returns focus. "Commander" reaches Shopify checkout (stop at the checkout page; don't fill or submit). Report whether checkout shows "Paiement à la livraison" and free delivery for Morocco, read from the page only.
4. Packs page populated: saving line only when compare-at > price, contents thumbnails, gift line only if set, quick add → drawer. Pack product page shows "Ce pack contient".
5. Lighthouse mobile (median of 3): home, product, collection, packs. Targets Perf ≥ 80, A11y ≥ 95, BP ≥ 95.
6. 375/768/1440 screenshots of every step → `tools/shots/23-main-*.png`. Console 0, overflow 0, no "translation missing", no English UI strings, fonts live.
If 4–5 pass, set the spec 15 and spec 21 rows to ✅ with the packs evidence appended. That's the only exception to "only your own row". If a theme bug shows up, stop and report it: it becomes its own spec, not a hot-fix here.

## Files
`theme/config/settings_schema.json` (Part A), `AGENTS.md` (rows 23, 15, 21).

## Acceptance
- [ ] No old placeholder fact anywhere in `theme/`; dev + main theme pushed, 0 errors
- [ ] Product page, cart drawer, cart page and checkout reach verified on the main preview (screenshots)
- [ ] Packs populated verified; Lighthouse 4 pages meet targets
- [ ] Go / no-go list for the owner: every remaining spec 16 owner item, marked done / not done from what the preview shows

Commit: `fix(23): confirmed fact defaults` (Part A), then `chore(23): launch readiness verified` (Part B)
