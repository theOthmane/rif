# Spec 28 — Content pages: mission, FAQ, contact, packs

## Goal
Give the editorial pages the monument rhythm: a wide poster heading, a narrow calm text column, generous space, no rules. Words stay the owner's; nothing is invented.

## Read first
`specs/24-monument.md`, `specs/25-poster-titles.md`, `PRODUCT.md` (mission verbatim, policy/contact values), `theme/sections/page-header.liquid`, `page-mission.liquid`, `faq.liquid`, `contact-form.liquid`, `packs.liquid`, `theme/assets/pages.css`, `packs.css`, `rte.css`.

## Files (touch only these)
- `theme/assets/pages.css`, `packs.css` (CSS)
- `theme/sections/faq.liquid` (markup for the heading/question layout only)
- `theme/sections/page-mission.liquid` (classes only)
- `theme/locales/fr.default.json` only for a genuinely new label

## Protected
Contact form fields, names, hCaptcha/phone-required behaviour and the success/error branches (`contact-form.liquid` markup and logic untouched — CSS only); the `<details>` per-question structure in the FAQ (keyboard accessible for free); mission content parsing (first blockquote = the quote; never paraphrased); pack data logic (`custom.pack_contents`, `custom.pack_gift`, compare-at saving only when data exists).

## Changes
1. **Mission:** the quote stays one large Tenor statement, left-aligned instead of centred, measure `--measure-display`; body column `--measure`; the closing lockup keeps the monogram + tagline + CTA (the wordmark monument is the footer's job, not repeated here).
2. **FAQ (blueprint "wide heading, indented questions"):** page title poster scale on the left; questions start at column 5 on desktop (full width on mobile), no rules; an open row gets a `--c-surface` tile with `--s-5` padding; answer measure 48ch. Still `<details>`.
3. **Contact:** the three groups (channels, SAV, form) separated by space and a tone step, not lines; group titles stay readable `--fs-md` sentence case if the uppercase label fails the 4.5:1 / 13px floor, otherwise unchanged.
4. **Packs:** cards keep the data rules; grid gets the larger row gap; the heading uses spec 25's class.

## Acceptance
- A. 0 errors. B. smoke 0 errors.
- C. 375/768/1440 on mission, FAQ, contact, packs (empty state is acceptable) — note any page that 404s on the preview (backlog: faq/mission/sav may not exist): that page is **CAN'T VERIFY**, not a pass. Screenshots `tools/shots/28-*.png`.
- Contact form still posts from a real browser (owner check; headless hCaptcha limitation as in spec 11).
- FAQ rows open/close with Enter/Space; focus visible.

## Rollback
`git revert` the spec 28 commit.
