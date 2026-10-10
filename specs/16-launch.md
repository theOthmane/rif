# Spec 16 — Launch checklist

Mostly **owner** tasks in Shopify admin. The agent only does the CLI steps marked 🤖.
Store: **TBD (owner decides before spec 16; `xpziwn-tw` not accessible)**. Everything below runs in that store's admin.

## Store settings (owner)
- [ ] **Languages**: Settings → Languages → add **French**, set as default, unpublish English.
- [ ] **Currency format**: Settings → General → Store defaults → Currency display → format `{{amount_no_decimals}} DH` (both "with" and "without currency" fields), or keep decimals if you prefer.
- [ ] **Payments**: Settings → Payments → Manual payment methods → **Cash on Delivery (COD)**. Rename it to "Paiement à la livraison". Add instructions: "Vous payez en espèces au livreur à la réception."
- [ ] **Shipping**: Settings → Shipping and delivery → General profile → zone **Maroc** → rate "Livraison gratuite (24–72h)", price **0 MAD**. Remove other zones you don't serve.
- [ ] **Checkout**: Settings → Checkout → customer contact = **phone or email**, shipping address phone = **required**, company = hidden, address line 2 = optional. Checkout editor: upload the RF logo, set background/button colours close to `#000000` / silver.
- [ ] **Policies** (Settings → Policies): refund (7 days [PH]), shipping, privacy, terms, written in French. Contact information.
- [ ] **Preferences**: homepage title + meta description (French), social sharing image (poster), password protection ON until launch.

## Content (owner)
- [ ] **Collections**: Montres (`montres`), Colliers (`colliers`), Pochettes & Sacs (`pochettes-sacs`). The handles drive the row icons.
- [ ] **Products**: at least 1 real test product per collection (with real photos of *your* products only).
- [ ] **Pages**: "Contact & SAV" → template `page.contact`; "Notre mission" → `page.mission`; "FAQ" → `page.faq` (write questions as Heading 3, see `docs/faq-starter.md`).
- [ ] **Menus** (Content → Menus):
  - `main-menu`: Montres, Colliers, Pochettes & Sacs, Boutique (all collections), Notre mission, FAQ, Contact & SAV
  - `footer` (Boutique column): the 3 collections + Boutique
  - `footer-help` (Aide column): FAQ, Contact & SAV, Livraison (shipping policy), Retours (refund policy)
  - `accueil-rangees`: the 3 collections in display order
- [ ] **Theme settings → RIFANO**: real WhatsApp (digits, e.g. 2126XXXXXXXX), Instagram, TikTok, email, delivery/warranty/returns texts, `home_rows_menu` = `accueil-rangees`, `hero_poster` = the poster from spec 13.

## Deploy
- [ ] 🤖 `npx @shopify/cli@latest theme push --path theme --store <LAUNCH STORE>` → share the preview link
- [ ] Owner: full test on your phone: home → row → product → add → drawer → Commander → checkout shows **Paiement à la livraison** and **Livraison gratuite** → place a test order → cancel/archive it.
- [ ] Owner: Online Store → Themes → **Publish** the RIFANO theme.
- [ ] Owner: when ready, turn password protection **off**.
- [ ] 🤖 Tag the release: `git tag v1.0.0 && git push --tags`; final STATUS.md entry.

## After launch (backlog, not v1)
COD form app (EasySell) if checkout drop-off is high · reviews · Spain/Spanish market · predictive search · collection filters · analytics pixels (TikTok/Meta) via Customer Events.
