# Spec 11 — Content pages: default page, Contact & SAV, Notre mission, FAQ

## Files
- `theme/templates/page.json` (restyle: compose `page-header` + `main-page`), `theme/templates/page.contact.json`, `theme/templates/page.mission.json`, `theme/templates/page.faq.json` (new; each composes the sections below)
- `theme/sections/page-header.liquid`, `theme/sections/contact-form.liquid`, `theme/sections/faq.liquid` (new), `theme/sections/page-mission.liquid` (new; the editorial layout), `theme/sections/main-page.liquid` (keep only the page content — `page-header` owns the title)
- `theme/assets/pages.css`, `theme/assets/rte.css` (rich-text styles), `theme/locales/fr.default.json`

The owner creates the pages in admin and assigns these templates (spec 16). All copy comes from the page content in admin, except the labels below.

## Shared
- `page-header`: `.t-label` eyebrow + `page.title` in Bodoni `--fs-2xl`, centred, `--section-y` top padding.
- `rte.css` for `page.content`: max-width 65ch, Manrope `--lh-body`, h2/h3 in Bodoni, links underlined, lists with silver bullets, blockquote with a 1px silver left rule.

## Default page
Header + content. That's it.

## Contact & SAV (`page.contact.json`)
Two columns ≥1024px, stacked on mobile:
1. **Channels first** (the reference store had none): 3 large tappable rows: WhatsApp ("Réponse rapide, 7j/7" is **not** allowed unless in PRODUCT.md; use just "WhatsApp" + the number), email, Instagram. Each row: icon, label, value, arrow.
2. **SAV summary**: three short items from settings (delivery, warranty, returns), each linking to the matching policy.
3. **Form** (`{% form 'contact' %}`): Nom, Téléphone (type tel, required; Moroccan buyers prefer phone), Email (optional), Sujet (`<select>`: Commande, Garantie / SAV, Retour, Autre), Message. Success message `form.posted_successfully?` → "Merci, nous vous répondons rapidement." Errors via `form.errors | default_errors` restyled.
4. `page.content` rendered under the header if present.

## Notre mission (`page.mission.json`)
Editorial layout: a large centred Bodoni quote of the mission sentence (from `page.content`'s first paragraph if it is a blockquote, else the content itself), then the rest of the content in `rte`. End with the monogram and "Be different. Be RIFANO." and a CTA to the Boutique. No invented history, founding dates or stats.

## FAQ (`page.faq.json`)
- The owner writes the page in admin as: each question = **Heading 3**, answer = paragraphs under it.
- Liquid splits `page.content` on `<h3` and renders each pair as `<details class="faq__item">` with `<summary>` (question) + answer. Content before the first h3 = intro.
- One open at a time? No. Native, independent `<details>`. Smooth height animation only if it's simple (`interpolate-size: allow-keywords` with fallback); otherwise none.
- Add `FAQPage` JSON-LD built from the same split.
- If the page has no h3: render the content as a normal rte page.
- Provide `docs/faq-starter.md` with suggested questions **without answers that state facts** (owner fills them): "Comment fonctionne le paiement à la livraison ?", "Quels sont les délais de livraison ?", "La livraison est-elle vraiment gratuite ?", "Quelle est la garantie ?", "Comment retourner un article ?", "Comment vous contacter ?".

## Acceptance
- [ ] Each template renders correctly with empty page content
- [ ] Contact form submits (Shopify sends the email) and shows success; phone is required
- [ ] FAQ split works with 1 and with 10 questions; keyboard accessible
- [ ] theme check 0 errors

Commit: `feat(11): content pages: contact & SAV, mission, FAQ`
