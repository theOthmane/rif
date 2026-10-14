# Spec 16 — Launch checklist

Mostly **owner** tasks in Shopify admin. The agent only does the CLI steps marked 🤖.
Launch store: **`xpziwn-tw`** (main store, not open yet, password on). Everything below runs in **its** admin.
`fexgzv-pq` stays the dev store. Nothing in its admin is copied over, so menus, pages, collections and theme settings are set up again here.
In this spec the agent only pushes code (see Deploy) and never publishes. Menus, pages, collections, metafields, policies and theme settings are set up by the agent in **spec 22**, which runs between the first push and the publish.

## Store settings (owner)
- [ ] **Languages**: Settings → Languages → add **French**, set as default, unpublish English.
- [ ] **Currency format**: Settings → General → Store defaults → Currency display → format `{{amount_no_decimals}} DH` (both "with" and "without currency" fields), or keep decimals if you prefer.
- [ ] **Payments**: Settings → Payments → Manual payment methods → **Cash on Delivery (COD)**. Rename it to "Paiement à la livraison". Add instructions: "Vous payez en espèces au livreur à la réception."
- [ ] **Shipping**: Settings → Shipping and delivery → General profile → zone **Maroc** → rate "Livraison gratuite (24–72h)", price **0 MAD**. Remove other zones you don't serve.
- [ ] **Checkout**: Settings → Checkout → customer contact = **phone or email**, shipping address phone = **required**, company = hidden, address line 2 = optional. Checkout editor: upload the RF logo, set background/button colours close to `#000000` / silver.
- [ ] **Policies**: written by spec 22 from your values (or by you, if you tell spec 22 to leave them).
- [ ] **Preferences**: homepage title + meta description (French), social sharing image (poster), password protection ON until launch.

## Content
- [ ] Owner: **Products**: at least 1 real product per collection, real photos of *your* products only (no other brand's watch or logo).
- [ ] Owner: **Packs**: install Shopify Bundles and create the packs with your real prices (set a compare-at price only if you want a saving shown). Then tell spec 22 which items each pack contains.
- [ ] 🤖 **Spec 22**: French menus (`main-menu`, `footer`, `footer-help`, `home-rows`), collections `montres` / `colliers` / `pochettes-sacs` / `packs`, pages `sav` / `mission` / `faq` / `packs`, pack metafields, policies, contact values, and the RIFANO theme settings incl. the hero poster. All from values you supply in that session.

## Deploy
- [ ] 🤖 **Access check (read-only):** `npx @shopify/cli@latest theme list --store xpziwn-tw`. Auth refused → stop, tell the owner. Record the currently published theme's name + id in the reply (it's the rollback).
- [ ] 🤖 **Preconditions:** spec 15 ✅ (⚠️ is accepted only for the packs live-QA item, which spec 22 closes), working tree clean (except files the owner said to leave), Gate A 0 errors, latest code already pushed + QA'd on `fexgzv-pq`.
- [ ] 🤖 **First push (the one allowed theme creation):**
  `npx @shopify/cli@latest theme push --path theme --store xpziwn-tw --unpublished --theme "RIFANO v1.0.0" --ignore "config/settings_data.json" --no-input`
  Check `theme push --help` first to confirm that `--unpublished` + `--theme <name>` names the new theme. `settings_data.json` stays out: it holds dev-store menus and images that don't exist on the main store. Template/group JSON **do** go (the theme needs them). Report the new theme id, 0 errors, and the preview link.
- [ ] 🤖 **Gate C on the new theme (read-only):** preview link at 375/768/1440, home + collection + product + cart drawer + packs → `tools/shots/16-*.png`. With no settings yet, the home may show the spec-19 empty state. That's expected until the owner sets `home_rows_menu`. Check: no console errors, overflow 0, no "translation missing", cart drawer opens.
- [ ] **Run spec 22 now** (new session). Then come back for the steps below.
- [ ] Owner: real-phone check (iPhone + mid-range Android) of the hero scrub and depth layers: smooth, "Be RIFANO." readable, no horizontal scroll.
- [ ] Owner: full test on your phone: home → row → product → add → drawer → Commander → checkout shows **Paiement à la livraison** and **Livraison gratuite** → place a test order → cancel/archive it. Repeat once with a pack.
- [ ] Owner: Online Store → Themes → **Publish** "RIFANO v1.0.0". Rollback = re-publish the theme recorded in the access check.
- [ ] Owner: when ready, turn password protection **off**.
- [ ] 🤖 After the owner says "published": `git tag v1.0.0 && git push --tags`; mark spec 16 ✅ in AGENTS.md Progress with the main-store theme id.
- [ ] From now on, every change is built and QA'd on `fexgzv-pq` (normal §6 workflow). It reaches `xpziwn-tw` only through the release flow in AGENTS.md §6b, when the owner asks.

## After launch (backlog, not v1)
COD form app (EasySell) if checkout drop-off is high · reviews · Spain/Spanish market · predictive search · collection filters · analytics pixels (TikTok/Meta) via Customer Events.
