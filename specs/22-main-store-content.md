# Spec 22 — Main store content setup (xpziwn-tw) + dev mirror

## Goal
Put the store content the theme needs into the main store `xpziwn-tw`, done by the agent through the Admin API instead of by hand: French menus, the four content pages, the Packs collection + metafields, policies, contact values and the RIFANO theme's settings.
Mirror the **structure** (same handles, test data only) into the dev store `fexgzv-pq`, so dev QA covers packs/FAQ/mission/SAV from now on.
This closes the spec 15 ⚠️ (packs Lighthouse + live QA) and the "admin data" items of the spec 15 backlog.

**Owner decision (2026-10-14):** the agent may write **content** to `xpziwn-tw` in this spec. It never touches payments, checkout, shipping, taxes, languages, domains, apps, billing or theme publishing. Those stay in spec 16 as owner steps.

## Runs when
After spec 16's first push: the unpublished "RIFANO v1.0.0" theme must exist on `xpziwn-tw` (`theme list --store xpziwn-tw`). If it's missing, stop.

## Hard rules
- **No invented values.** Every phone number, handle, email, delay, warranty, return period, price and policy sentence comes from the owner in this session. Anything not supplied stays out, and gets listed as an owner to-do. The theme already hides blank settings. Never ship `+212 6 00 00 00 00` or any `[PH]`.
- **Draft → approve → write.** Text the agent writes in French (FAQ answers, mission page, policies) is shown to the owner in full first. It's written only after an explicit "ok".
- Before every mutation batch, print what it will create or change (store, object, handle, title) and run a read-only query to check the current state. Make it idempotent: update if the handle exists, create if not. Never delete anything that existed before this session.
- Store data only. The repo gets no new tracked files except this spec's Progress line. Query/variable files go in a gitignored scratch folder (`tools/shots/` or the session scratchpad).
- The agent doesn't approve OAuth itself. The owner approves `store auth` in their browser.

## Step 0 — Access
1. Use the Shopify Dev MCP to confirm each mutation and the **exact scopes** for the current Admin API version: menus (`menuCreate`/`menuUpdate`), pages (`pageCreate`/`pageUpdate`), collections (`collectionCreate`, `collectionAddProducts`), `metafieldDefinitionCreate`, `shopPolicyUpdate`, files (`stagedUploadsCreate` + `fileCreate`).
2. Ask the owner to run, in their own terminal, once per store (it opens the browser for approval):
   `npx @shopify/cli@latest store auth --store xpziwn-tw.myshopify.com --scopes <the verified list>`
   (and the same for `fexgzv-pq.myshopify.com`).
3. Every mutation then runs via `npx @shopify/cli@latest store execute --store <store>.myshopify.com --allow-mutations --query-file … --variable-file …`. Read-only queries run without `--allow-mutations`.

## Step 1 — Collect the owner's values (one message, then wait)
Ask for all of these at once. Mark each one supplied / not yet:
- WhatsApp number (digits, e.g. 2126XXXXXXXX), Instagram URL, TikTok URL, support email
- Delivery delay, warranty length, return period (replace the `[PH]` 24–72h / 12 months / 7 days, or confirm them)
- Announcement-bar sentence (default: the current COD + free-delivery line)
- Legal identity for policies: business name, city, contact address (or "leave policies to me")
- The main store's storefront password: the owner adds it to `.env` as `MAIN_STOREFRONT_PASSWORD`. Never echo it, never write it to a tracked file.
Also update PRODUCT.md's `[PH]` line with the confirmed values. That's the one tracked doc this spec may edit, and it's in the file list.

## Step 2 — Menus (both stores, French titles)
| Handle | Links (in order) |
|---|---|
| `main-menu` | Montres, Colliers, Pochettes & Sacs (collections), Packs (page), Boutique (all collections), Notre mission, FAQ, Contact & SAV (pages) |
| `footer` | Montres, Colliers, Pochettes & Sacs, Packs, Boutique |
| `footer-help` | FAQ, Contact & SAV, Livraison (shipping policy), Retours (refund policy) |
| `home-rows` | Montres, Colliers, Pochettes & Sacs (+ Packs collection once it holds products) |

- Rename any English title (e.g. "Home", "Catalog", "Contact", "Search" → drop Home/Catalog, "Search" → "Recherche" only if a search link is kept). On `fexgzv-pq` this fixes the English titles that spec 15 found.
- Collection links need the collections to exist. On `xpziwn-tw`, create **empty** collections `montres`, `colliers`, `pochettes-sacs`, `packs` if missing (titles: Montres, Colliers, Pochettes & Sacs, Packs). Spec 19 hides empty rows on the live store, so this is safe.

## Step 3 — Pages (both stores)
| Handle | Title | Template suffix | Body |
|---|---|---|---|
| `sav` | Contact & SAV | `contact` | one intro sentence (owner-approved) |
| `mission` | Notre mission | `mission` | French rendering of the PRODUCT.md mission as the first blockquote + 1–2 approved sentences |
| `faq` | FAQ | `faq` | the 6 questions in `docs/faq-starter.md` as `<h3>`, answers drafted **only from the owner's Step 1 values**, approved before writing. A question with no supplied answer is left out |
| `packs` | Packs | `packs` | empty body (the section renders the page) |

Check `templateSuffix` against the existing `page.*.json` files. If the handle the theme or footer expects differs (`/pages/sav` vs `contact`), stop and ask.

## Step 4 — Packs data
- Product metafield definitions on **both** stores: `custom.pack_contents` (list.product_reference, name "Contenu du pack"), `custom.pack_gift` (product_reference, name "Cadeau offert"). Pin them so they show in admin.
- `xpziwn-tw`: the owner installs **Shopify Bundles** and creates the real packs with their prices (app install and prices are owner actions). Then, on the owner's say-so, the agent adds those bundle products to `packs` and sets the two metafields from the item list the owner gives.
- `fexgzv-pq` (dev QA data): with owner OK, create **one** product "Pack test (dev)" (status active, the existing test watch as `pack_contents`, a compare-at price above the price so the saving line renders) in `packs`. It's test data on the dev store only, and the title says so.

## Step 5 — Policies (`xpziwn-tw`; dev store optional)
`shopPolicyUpdate` for REFUND_POLICY, SHIPPING_POLICY, PRIVACY_POLICY, TERMS_OF_SERVICE, CONTACT_INFORMATION, in French, drafted from Step 1 values, approved before writing. If the owner says "leave policies to me", skip this and list it.

## Step 6 — Theme settings on `xpziwn-tw` (the unpublished RIFANO theme only)
1. Upload `brand/hero/hero-poster.webp` with `stagedUploadsCreate` + `fileCreate`, and get its `shopify://shop_images/<name>` reference.
2. `theme pull --store xpziwn-tw --theme <RIFANO id> --only config/settings_data.json` into a **scratch folder** (not `theme/`).
3. Edit only these keys under `current`: `whatsapp_number`, `instagram_url`, `tiktok_url`, `support_email`, `delivery_text`, `warranty_text`, `returns_text`, `announcement_text` (if changed), `home_rows_menu: "home-rows"`, `hero_poster`. Leave every other key exactly as pulled.
4. Push it back from the scratch folder: `theme push --path <scratch> --store xpziwn-tw --theme <RIFANO id> --only config/settings_data.json --nodelete --no-input`.
   Never push the repo's `theme/config/settings_data.json` to `xpziwn-tw` (AGENTS.md §6b).
5. Never touch the store's currently published theme.

## Step 7 — QA (closes spec 15 ⚠️)
On the RIFANO theme preview of `xpziwn-tw` (`?preview_theme_id=<id>`, password from `.env`) **and** the dev preview URL:
- `/pages/packs`, `/pages/faq`, `/pages/mission`, `/pages/sav`, home, footer: 375/768/1440 → `tools/shots/22-{main,dev}-<page>-<width>.png`. Overflow 0, no "translation missing", no English menu titles, no `[PH]` or `600 00 00` anywhere (`document.body.innerText`).
- Dev store: the populated pack card (saving line, contents, quick add → drawer opens, Esc returns focus).
- Lighthouse mobile on `/pages/packs` (dev, and main if it has packs). Targets as spec 15: Perf ≥ 80, A11y ≥ 95, BP ≥ 95.
- LCP element on home after the poster upload (main store).
If packs passes, update the spec 15 Progress row to ✅ with the packs scores appended. That's the only other row this spec may touch.

## Stays with the owner (list in the reply, don't attempt)
- Real browser: contact form + password signup (hCaptcha blocks automated sends; never try to bypass it), gift card (needs a real code).
- Real phone: hero scrub + depth layers.
- Re-shoot the contact page after Instagram + policies are set (the agent can do it in a later session).
- Spec 16 owner settings: languages, currency format, COD payment, shipping, checkout, publish, password off.

## Files
- `AGENTS.md` (Progress: spec 22 row, and spec 15 row only as described in Step 7)
- `PRODUCT.md` (`[PH]` line → confirmed values only)
- No `theme/` changes. If QA finds a theme bug, stop and report it. It becomes its own spec.

## Acceptance
- [ ] Both stores: 4 French menus, 4 pages with the right templates, packs collection + 2 metafield definitions
- [ ] `xpziwn-tw`: only owner-supplied values; no `[PH]` / placeholder phone visible; policies set or listed as an owner to-do
- [ ] `xpziwn-tw` RIFANO theme: settings set via pull-edit-push of its own settings_data.json; poster uploaded and LCP re-checked
- [ ] Dev: test pack renders populated; packs Lighthouse meets targets; spec 15 ⚠️ resolved or the reason stated
- [ ] Screenshots for every page on both stores; owner to-dos listed

Commit: `chore(22): main-store content setup` (body: what was created/updated per store, Lighthouse scores, open owner items)
