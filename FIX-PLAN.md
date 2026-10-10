# FIX-PLAN — Adversary + QA-2 merged findings

Date: 2026-10-11 · Sources: `ADVERSARY-REPORT.md` (A1–A14), `QA-REPORT-2.md` (Q1–Q8).
Preview: theme `rifano-smoke` #185969639647 on `fexgzv-pq` · Preview link:
https://fexgzv-pq.myshopify.com/?preview_theme_id=185969639647

## 0. Reverts

`git rev-list 5856b4d..HEAD` = `3fe1a96` + 2 docs commits (`80ff130`, `fddacde`).
Adversary verdict on `3fe1a96`: **KEEP (code) · PARTIAL (documentation) · REVERT not applicable**
— "Nothing in this commit should be reverted — reverting would undo an explicit owner
decision." The PARTIAL part is two documentation corrections (A1, A2), which are
follow-up edits, not rollbacks. The two docs commits are reports, not code.
**No `git revert` is run. No reset, no force-push.** This section is the record.

## 1. Merged list (BLOCKER → MAJOR → MINOR, deduplicated)

| ID | Sev | Sources | Finding (page / widths) | Fix |
|---|---|---|---|---|
| F1 | BLOCKER | Q1, A12 (covers A4/A5/A6 as symptoms) | Spec 08 never built: `/collections` + `/collections/all` are spec-00 stubs, no tiles/grid/sort/empty state (all widths) | Build `specs/08-collection-boutique.md` exactly (its file list) |
| F2 | MAJOR | Q2, A4 | `/collections` collection link in UA blue `rgb(158,158,255)` + underline (all widths) | Rebuilt tiles with tokens (F1) + global `a` safety net in `base.css` |
| F3 | MAJOR | Q3, A6 | `/collections/all` zero-product: 51px `h1` + black, no empty state/grid/sort/pagination (all widths) | Ship spec-08 empty state + toolbar + paginated grid (F1) |
| F4 | MAJOR | A5 | No `h1` display rule; collection headings in default Manrope bold, not Bodoni | `.t-page-title` helper (`--font-display`/`--fs-2xl`), used by new sections |
| F5 | MAJOR | A2 | `specs/13` (:62, :79 + the §B lift block) and `specs/16` (:11) still prescribe old `#0d0e10` ground; page is `#000000` | Update both specs to `#000000`, drop the 13/14/16 lift, re-flag in STATUS |
| F6 | MAJOR | A8 | Unconfirmed `[PH]` delivery/warranty claims live (`footer_delivery_default`, `footer_warranty_default`, blank `settings_data.json`) | OWNER action (real values in theme settings / spec 16). No code change |
| F7 | MAJOR | Q4 | English/default store data in French storefront (menus, `all` title "Products", `frontpage` tile, policies, "My Store") | OWNER admin action (spec-16 checklist). Not theme code |
| F8 | MINOR | A1 | `DESIGN.md:49-52` surface ratios wrong (`1.06`/`1.12`, real `1.05`/`1.08`) | Two-number docs correction (with F5 docs group) |
| F9 | MINOR | A3 | `STATUS.md:500-501` stale `5.41:1` note (true on `#050505`, now `5.57:1` on `#000000`) | Historical entry — left as-is, new figure recorded in STATUS (no rewrite) |
| F10 | MINOR | Q5 | Announcement bar outside any landmark (axe `region`, all pages) | DEFERRED — `announcement.liquid` not touched in this pass |
| F11 | MINOR | A9 | Search placeholder `rgb(117,117,117)` on `--c-surface-2` = `4.22:1` (needs 4.5:1) | `::placeholder { color: var(--c-text-2) }` in `base.css` (touched for F2) |
| F12 | MINOR | Q6, A14 | Drawer search placeholder hard-clips at 375 ("…un c", 31px cut) | Reduce input horizontal padding (`base.css`, no copy change); then verify — shorten key only if still clipped |
| F13 | MINOR | Q7, A11 | Raw px inline `style="--grid-gap: 10px"` in Boutique stub | Disappears with F1 rebuild (stub deleted) |
| F14 | MINOR | Q8 | Dead code: `.header__monogram` CSS, `hello_world.*`/`customers.login.*`/`rifano.email_label` keys | DEFERRED to spec-15 cleanup (only locale part shares a touched file; system keys kept) |
| F15 | MINOR | A10 | (a) drawer close double accessible name; (b) 1px focus ring; (c) `.cart-count` position unproven with count > 0 | DEFERRED — files (`menu-drawer.liquid`, `critical.css`, `header.css`) not touched in this pass |
| F16 | MINOR | A7 | Home `main` 0 height until spec 06 | Expected, spec-06 scope — no action |
| F17 | MINOR | A13 | COD promise 3× in one viewport (announcement + drawer note + footer ×2) | OWNER call, needs `menu-drawer.liquid` edit — not touched in this pass |

## 2. Status (updated after browser re-check; FIXED only with a screenshot)

| ID | Status | Evidence |
|---|---|---|
| F1 | FIXED | `tools/shots/fix-collection-all-375/768/1440.png`, `fix-boutique-375/768/1440.png`. Sort change → `?sort_by=` + grid refresh, no reload; Back restores. Grid-with-products / tiles-with-many / pagination unrenderable live (0 products; only `frontpage` exists and is skipped per spec) — those paths are theme-check clean |
| F2 | FIXED | Same shots. All `main` links compute `rgb(167,169,174)`/`rgb(236,235,232)`/`rgb(0,0,0)` (tokens); zero UA-blue anywhere |
| F3 | FIXED | Same shots. `/collections/all` (0 products) = breadcrumb + Bodoni h1 + `0 pièces` + toolbar + monogram 48px + "Cette collection arrive bientôt." + silver CTA → `routes.collections_url` |
| F4 | FIXED | Same shots. Computed h1 `font-family: "Bodoni Moda"`, 28px @375 / 40px @1440 (`--fs-2xl`); new `.t-page-title` helper in `base.css` |
| F5 | FIXED (docs-only, no visual; verified by `grep`: no `#0d0e10` prescription left outside historical "retired" notes) | `specs/13-hero-assets.md`, `specs/16-launch.md` |
| F6 | NOT FIXED (owner admin values, spec-16 owns) | — |
| F7 | NOT FIXED (owner admin action, spec-16 checklist) | — |
| F8 | FIXED (docs-only two-number correction) | `DESIGN.md:49-52` → `1.05`/`1.08` |
| F9 | NOT FIXED (historical entry, figure noted in STATUS) | — |
| F10 | NOT FIXED (deferred, file untouched) | — |
| F11 | FIXED | `tools/shots/fix-drawer-375.png`; `::placeholder` computes `rgb(167,169,174)` (`--c-text-2`, 8.26:1 on `--c-surface-2`) |
| F12 | FIXED | Same shot; measured placeholder 168px vs 236px available (−68px spare). Padding-only still cut 23px, so the prescribed shorter key was applied (meaning unchanged) |
| F13 | FIXED (stub deleted with F1) | Same shots as F1 |
| F14 | NOT FIXED (deferred to spec-15 cleanup) | — |
| F15 | NOT FIXED (deferred, files untouched) | — |
| F16 | NOT FIXED (expected, spec-06 scope) | — |
| F17 | NOT FIXED (owner call, file untouched) | — |

## 3. Gates

- `theme check`: **44 files, 0 errors, 0 warnings** (the 2 `OrphanedSnippet` warnings are gone — `product-card`/`price`/`pagination` all have consumers now).
- Push smoke to `fexgzv-pq` theme `185969639647`: **0 errors** (run 3×: after build, after placeholder-key change, final).
- `/impeccable` detector on changed CSS (`collection.css`, `base.css`): `[]` clean (standing caveat: it does not scan Liquid). Polish pass: nothing still off — no code changes (sort option names like "Featured" are Shopify-platform strings, owner admin language action F7).
