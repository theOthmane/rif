# Spec 31 — Integration, inspector run, release prep (gates only, no new design)

## Goal
After specs 24–30, prove the redesign is whole: consistent, accessible, fast, and safe to hand to the owner. This spec builds nothing new.

## Read first
`specs/24-monument.md` (guardrails), `AGENTS.md` §6, §6b, the taste-skill gate (`scripts/lint.mjs`, `scripts/inspect.mjs` in the plugin folder `~/.claude/plugins/cache/taste-skill/taste-skill/2.0.0/skills/taste-skill`).

## Files (touch only these)
- Fixes found by the gates, **in the files of the spec that caused them** (list them in the reply)
- `AGENTS.md` Progress rows for 24–31

## Steps
1. **Lint + inspect** the home, a collection, product, content and system page on the preview URL. Run with explicit, reported exemptions for brand assets only: the silver-gradient logo wordmark, the 3D hero canvas, and Tenor's uppercase wordmark. Every other FAIL is fixed; every WARN is fixed or defended in one sentence.
2. **Full Gate C matrix:** home, boutique, collection, product, cart (empty + item), search, FAQ, mission, contact, packs, 404, password × 375/768/1440. Overflow 0, console 0, "translation missing" 0, fonts live → `tools/shots/31-*.png` contact sheet.
3. **Accessibility:** axe on six pages; keyboard walkthrough of header → menu drawer → home rows → CTA band → footer; reduced-motion pass. Target: no new violations versus the spec-15 baseline.
4. **Performance:** Lighthouse mobile median on home, product, collection vs spec-15 baseline (91 / 86 / 84): drop of more than 3 points on any page is a FAIL to fix or explain.
5. **Buy-path regression:** add to cart → drawer → `/cart` → remove; the `@app` slot present on the product page; COD copy present once or twice per viewport.
6. **Content audit:** no invented prices, reviews, people, dates or promises; no third-party brand names; every new string French and in `fr.default.json`.
7. **Owner to-do list** in the reply: upload a favicon in theme settings, rename the footer "Search" menu item to "Recherche" and add the real footer links, create the missing FAQ/mission/SAV pages, add real products.

## Release (only when the owner asks, per AGENTS.md §6b)
Merge `redesign/taste-v2` into `main` only after the owner approves the preview. The main store `xpziwn-tw` is touched only through §6b (staging theme, owner publishes). `config/settings_data.json` never goes to `xpziwn-tw`. New JSON templates are pushed as *added* files; modified ones need the owner's yes (warn that editor changes on those templates will be reset: `templates/index.json` gained `home-cta`).

## Acceptance
Every item above reported PASS / FAIL / CAN'T VERIFY with a path or a number. Nothing faked.
