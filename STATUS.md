# STATUS.md — RIFANO handoff

Updated: 2026-11-07 · branch `redesign/taste-v2`
Read this with `DECISIONS.md` before touching code.

## Done (approved)

- Shell: announcement bar, header, menu drawer, footer.
- Home: frame-scrub hero, tagline, category rows, closing CTA band.
- Collection + Boutique; poster page titles.
- Product page + protected buy path (ATC, sticky ATC, `@app` slot, COD line).
- Cart drawer + cart page.
- Content: Contact & SAV, Notre mission, FAQ, Packs.
- System: search, 404, password "Bientôt", policies, gift card.
- Integration QA: 17 pages × 375/768/1440, a11y, Lighthouse, buy path — gates
  PASS; spec 31 stays ⚠️ for the open items below.

## In progress (awaiting approval)

- Spec 31 open items: collection 1440 first-card price sits below the fold;
  404 title wraps to 2 lines at 375 (accepted); FAQ/mission/packs 404 on preview.
- Packs page: populated state + PDP contents block CAN'T VERIFY live (no bundles).
- Contact form: live POST blocked by hCaptcha — needs a real-browser check.
- Launch readiness: Part B blocked on a real product catalogue; main store still
  runs RIFANO v1.0.0.

## Next

- Owner: replace the third-party watch image and stock Montres, Colliers,
  Pochettes & Sacs, Packs.
- Owner: confirm COD is enabled, shipping zones/rates, 4 policies, and create
  FAQ/mission/packs pages in admin.
- Re-run specs 31 + 23 on a stocked preview store.
- Real-phone hero scrub check (mid-range Android + iPhone).
- Release: duplicate live theme to `rifano-staging`, push, owner publishes.

## Open questions

- Fonts: the 2026-11-07 brief says Michroma + Inter "instead of Aura"; the repo
  and its history say Tenor Sans + Hanken Grotesk. Is a font change planned?
- Taste-skill lint: 13 pre-existing FAILs (silver button, hero gradient text,
  14px body, eyebrows, hairlines). Fix or accept?
- Support email: `contact@rifano.ma` is still a placeholder.
- Spain: still deferred for v1?
