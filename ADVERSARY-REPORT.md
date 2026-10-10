# ADVERSARY REPORT — the commits after `5856b4d`

Date: 2026-10-10 · Author: adversarial audit (read-only on the repo; no fixes applied).
Audience: the owner. Baseline: `5856b4d feat(02): RF monogram, logo sizing, icon set` — the owner-accepted last good state.

**Scope.** `git rev-list 5856b4d..HEAD` = **exactly one commit**: `3fe1a96 style: black + void essence + silver palette` (2026-10-10 22:06). No other commits exist on any ref; no stashes, no dangling commits (`git log --all`, `git reflog`, `git stash list`, `git fsck --unreachable` all agree). The working tree under `theme/` is clean.

**Method (reproducible).**
- Full read of the required docs + full `git diff 5856b4d HEAD` (10 files, 60+ / 37−).
- `npx @shopify/cli@latest theme check --path theme` on HEAD.
- `theme pull` of preview theme `185969639647` from `fexgzv-pq`, then a semantic JSON comparison against the repo.
- `git worktree add /tmp/rif-good 5856b4d` + `theme dev` (this reused development theme `#185966854367`; theme `185969639647` was never pushed to in this session) and agent-browser screenshots at 375 / 768 / 1440 of home, open menu drawer, `/collections`, `/collections/all` and the footer — **both versions, 30 shots** in `tools/shots/adv-good-*.png` / `adv-now-*.png` (gitignored scratch).
- PIL pixel diffs, axe-core audits, DOM geometry and computed-colour measurements on both versions.
- `/impeccable critique` with two isolated sub-agent assessments (design review + detector/browser evidence).
- OpenCode session-database forensics to recover the actual owner instruction behind `3fe1a96`.

**Limitations.** Per instruction, nothing was pushed to `185969639647`; its "0 upload errors" claim is therefore verified **indirectly** (pulled store copy is semantically identical to repo HEAD, every page renders, no Liquid-error text anywhere). Claims that depend on the Shopify admin UI (e.g. "owner approved the trace") cannot be verified from the repo and are marked as such.

---

## 1. Verdict per commit

| Commit | Verdict | Reasons |
|---|---|---|
| `3fe1a96` `style: black + void essence + silver palette` | **KEEP** (code) · **PARTIAL** (documentation) · **REVERT not applicable** | The code is exactly what the owner ordered, verified live, with **no rendering regressions**. Keep `theme/assets/tokens.css`, `theme/layout/theme.liquid`, `theme/sections/footer.liquid`, `theme/assets/footer.css`, `.gitignore` as-is. Keep the doc edits too, but two corrections are required before the next spec: the DESIGN.md surface contrast ratios are numerically wrong (A1) and `specs/13` + `specs/16` still prescribe the two-palettes-old `#0d0e10` (A2). Nothing in this commit should be reverted — reverting would undo an explicit owner decision and restore a palette the owner asked to replace. Calling the whole commit PARTIAL would be misleading, because no *code* part is at fault; the fixes are follow-up edits, not rollbacks. |

There are no other commits after `5856b4d` to judge. The `5856b4d` (spec 02) STATUS claims were re-audited as part of §3 and hold.

---

## 2. What the before/after actually shows (the "messed everything" check)

**The two versions render pixel-identically apart from the requested palette darkening.** Per-pair maximum channel deltas (16.7M comparisons, `tools/shots/adv-good-*` vs `adv-now-*`):

| Pair | Max channel delta | What it is |
|---|---|---|
| home 375 / 768 / 1440 | **5** | `--c-bg` `#050505` → `#000000` |
| collections 375 / 768 / 1440 | **5** | same |
| collections/all 375 / 768 / 1440 | **5** | same |
| footer 375 / 768 / 1440 | **5** | same |
| drawer 375 / 768 / 1440 | **15** | `--c-surface` `#0d0d0d` → `#080808` + glyph antialiasing; **zero pixels above 16** |

No pixel anywhere differs by more than 15/255, and nothing above 15 exists in any pair. The preview bar was hidden for the captures; theme identity was confirmed during capture (`rifano-smoke Draft`).

**Therefore the audited commit cannot be the source of "messed everything".** The sore points a human looking at the preview would actually notice exist **identically at `5856b4d`** and are unfinished-spec debt:

- `/collections` renders its one collection as a browser-default **blue underlined link** (`rgb(158,158,255)`) — the only saturated colour in the build (A4).
- `/collections/all` is a heading over ~90–117px of pure black — no empty state (A6).
- The home page has no content yet between shell and footer (spec 06 not started).
- The hamburger drawer and footer carry English store data ("Catalog", "Contact", "Search") — Shopify admin data, not theme copy.

Separately, the session that produced `3fe1a96` was instructed to deliver **two commits** — Part 1 palette and **Part 2 = spec 08 (collection page + Boutique)**. Part 2 has no commit and no files (A12). That is the real distance between the builder's "done" and the owner's "messed": the visible collection pages are still the untouched spec-00 skeleton, and the session said it would build them.

---

## 3. Claims audit — STATUS.md, Spec 02 → end

| # | Claim (source) | Verdict | Evidence |
|---|---|---|---|
| 1 | Spec 02: "42 files … 0 errors, 2 warnings" (`theme check`) | **TRUE** | Re-run: `42 files inspected with 2 total offenses … 2 warnings` — both `OrphanedSnippet` (`product-card.liquid`, `price.liquid`) |
| 2 | Spec 02: "scrollWidth == clientWidth at 375/768/1440 (no horizontal overflow)" | **TRUE** | Measured on both versions: e.g. `sw=cw=375`, `768`, `1440` on every page checked |
| 3 | Spec 02: header monogram 32px @375/768, 40px @1440; footer 48px | **TRUE** | `getBoundingClientRect().height` = 32 / 32 / 40 and 48 / 48 / 48 |
| 4 | Spec 02: monogram centre-y equals menu-button centre-y "to the pixel" | **TRUE** | 92.00/92.00 @375; 74.50/74.50 @768; 80.50/80.50 @1440 |
| 5 | Spec 02: two monograms carry two distinct gradient ids | **TRUE** | Live DOM: `["rf-mono-…", "rf-mono-…"]`, distinct per render |
| 6 | Spec 02: axe `.site-chrome, .site-footer` → "0 violations, 17 passes, 1 incomplete" | **TRUE, reproduced exactly** | Combined selector on the current preview: `violations 0, passes 17, incomplete 1` — the incomplete is `.logo__wordmark` colour-contrast, exactly as described |
| 7 | Spec 02: all 18 inline SVGs gone; 20-icon set; unknown key renders nothing | **TRUE** | `grep -rn "<svg" theme/sections/ theme/layout/ theme/templates/` → empty; `icon.liquid` has all 20 `when '…'` keys; unknown key leaves `icon_body` blank and `{% if icon_body != blank %}` renders nothing |
| 8 | Spec 02: `logo.liquid` + `brand/rf-monogram.svg` byte-identical; temporary grid removed (`main-index.liquid` byte-identical) | **TRUE** | `git diff 5856b4d HEAD -- theme/snippets/logo.liquid brand/rf-monogram.svg` empty; `git diff HEAD -- theme/sections/main-index.liquid` empty |
| 9 | Spec 02: `css-variables.liquid:29` gutter fix already in place | **TRUE** | Line present as quoted |
| 10 | Spec 02: push smoke 0 errors (run 3× during the session) | **Consistent** | Store pull of `185969639647` is semantically identical to repo HEAD (only Shopify's generated header comments / formatting differ); all pages render with no `Liquid error` |
| 11 | Part 1: palette exactly `#000000` / `#080808` / `#0d0d0d`, neutral `#2a2a2a` / `#666666`; silver/text unchanged | **TRUE** | `tokens.css:4-14`; silver and text values differ from `5856b4d` by nothing (`git diff` of those lines) |
| 12 | Part 1: text contrasts 17.62 / 16.80 / 8.93 / 8.52:1 | **TRUE** | Recomputed from the WCAG relative-luminance formula — exact |
| 13 | Part 1: "Updated the four current palette descriptions" (PRODUCT/PLAN/DESIGN/AGENTS) | **Partly true** | All four were updated, but the new DESIGN.md **surface** ratios are wrong (see F1/A1) |
| 14 | Part 1: footer.css moved to the layout head; `.footer__icon` dead rule deleted; `tools/shots/` ignored | **TRUE** | `theme.liquid:12`; `footer.liquid` no longer loads it; `grep footer__icon` → none; `.gitignore:5` |
| 15 | Part 1: theme check "42 files … 0 errors; 2 pre-existing warnings" | **TRUE** | Re-run identical |
| 16 | Part 1: push smoke "successful, 0 upload errors" | **Consistent (indirect)** | Store pull equality + clean rendering; see Limitations |
| 17 | Part 1: browser "body, announcement, header, footer = rgb(0,0,0); no horizontal overflow; drawer rgb(8,8,8)" | **TRUE** | Recomputed live at 375 and 1440 on the preview: all four `rgb(0, 0, 0)`, `sw == cw`, drawer `rgb(8, 8, 8)` |
| 18 | Part 1: screenshots `part1-*.png` exist | **TRUE** | Present in `tools/shots/` |
| 19 | Spec 02: "the owner approved the trace" | **Unverifiable** | No in-repo record; no contradicting evidence |

**False or inaccurate claims (details in §4):**

- **F1.** The `3fe1a96` commit's DESIGN.md rewrite states `--c-surface` is "1.06:1 against `--c-bg`" and `--c-surface-2` is "1.12:1" (`DESIGN.md:49-52`). Both are wrong: the real ratios are **1.05:1** (`#080808` on `#000000`) and **1.08:1** (`#0d0d0d` on `#000000`). The `1.12` was carried over from the old `#151515`-on-`#050505` pair. → A1.
- **F2.** The `3fe1a96` entry presents the palette switch as complete and notes only that `specs/01` is "historical", but **`specs/13-hero-assets.md:62,79` and `specs/16-launch.md:11` still prescribe `#0d0e10`** — upcoming, owner-facing documents. An earlier STATUS entry had explicitly flagged them for re-derivation; that warning disappeared in this entry. → A2.
- **F3.** The spec-02 entry's accessibility justification, "the darkest gradient stop … `--c-silver-3` at 5.41:1 on `--c-bg`" (`STATUS.md:500-501`), was true on `#050505` but is stale on `#000000` (now **5.57:1**). → A3.
- **F4.** At session scope, the implicit "done and good" is false for the other half of the instruction: **spec 08 was never built and never committed** (quoted instruction below; no spec-08 files exist; `main-collection.liquid` / `main-list-collections.liquid` unchanged since the spec-00 migration `0851189`; `collection.css` absent; the product-card snippets still have no consumer). STATUS.md itself stays honest on this point ("Next: spec 08").

---

## 4. Findings

Each finding: severity, **origin** (did `3fe1a96` cause it?), evidence, exact fix.

### A1 — DESIGN.md surface contrast ratios are numerically wrong · MINOR · origin: `3fe1a96`
Evidence: `DESIGN.md:49-52` ("1.06:1", "1.12:1"). WCAG computation: `#080808` on `#000000` = (0.002428+0.05)/0.05 = **1.05:1**; `#0d0d0d` on `#000000` = 0.054028/0.05 = **1.08:1**.
Fix: replace `1.06:1` → `1.05:1` and `1.12:1` → `1.08:1` in `DESIGN.md` (or drop the surface ratios; they are not WCAG levels).

### A2 — `specs/13` and `specs/16` still prescribe the old `#0d0e10` ground · MAJOR · origin: palette change, not re-propagated
Evidence: `specs/13-hero-assets.md:62` — *"Background must match `--c-bg` (#0d0e10), not pure black… lifts the blacks to 13/14/16"*; `:79` — *"must read `#0d0e10 ±1`"*; `specs/16-launch.md:11` — *"set background/button colours close to `#0d0e10` / silver"*. `tokens.css:5` is now `#000000`. The spec-13 instructions were written for a purely different ground; the earlier `600f0a1` entry had flagged exactly this ("must re-derive the lift … before the hero is cut") and the `3fe1a96` entry lost that flag.
Fix: update both specs to the `#000000` page ground and explicitly re-derive the frame lift (e.g. lift to `#000000 ±1`, or document a deliberate matching band), and to `#000000`/`#080808` in the spec-16 checkout colours — **before** spec 13's frame extraction or spec 16's admin checklist are executed. Add the flag back to STATUS.md.

### A3 — stale 5.41:1 contrast note · MINOR · origin: palette change
Evidence: `STATUS.md:500-501` (spec-02 entry). `#7f848b` on `#050505` = 5.41:1; on `#000000` = **5.57:1**. Not false when written; stale now, and it is quoted as an accessibility justification.
Fix: when that justification is next cited, use the `#000000` figure (5.57:1) — no code change.

### A4 — `/collections` renders collection links in browser-default blue · MAJOR (pre-existing at `5856b4d`; spec 08 owns) · origin: none — skeleton stub
Evidence: computed `color: rgb(158, 158, 255)`, `text-decoration: underline`, on both versions (`adv-now-collections-375.png`, `adv-good-collections-375.png` show it identically). `theme/sections/main-list-collections.liquid:7` renders `<a class="collection-card">`; `base.css:218-222` gives `.collection-card` layout only — no colour, no decoration reset. It is the only saturated colour in the build and a direct contradiction of "black + silver".
Fix: when spec 08 rebuilds the page, style the card text with tokens and add a global safety net in `base.css` (`a { color: var(--c-text-2); } a:hover { color: var(--c-text); }` or equivalent) so no future unstyled Liquid link can fall back to `#0000EE`-family blue.

### A5 — no `h1` typography rule exists; both collection pages use browser-default type · MAJOR (pre-existing; spec 08 owns) · origin: none
Evidence: `critical.css:51-53` only sets `overflow-wrap` for headings; `grep -rn "h1" theme/assets/*.css` shows margin resets only. "Collections" / "Products" render in default Manrope bold instead of Bodoni (`DESIGN.md:105` requires Bodoni for display ≥ `--fs-xl`).
Fix: a `.t-page-title` helper using `--font-display` / `--fs-2xl` / `--tracking-display`, applied by spec 08's `collection-header` section.

### A6 — zero-product pages have no empty state · MAJOR (pre-existing; spec 08 owns) · origin: none
Evidence: `main-collection.liquid` has no `{% else %}`; `main-list-collections.liquid` has no `{% else %}`; `/collections/all` = H1 + ~90px (375) / ~117px (1440) of black (`adv-now-collections-all-375.png`). PRODUCT.md:53 requires a clean empty state for every template.
Fix: spec 08 acceptance already specifies the empty state ("Cette collection arrive bientôt" + Boutique button); ensure it ships with the rebuild.

### A7 — home `main` renders 0 height until spec 06 · MINOR (expected; not a defect of `3fe1a96`) · origin: none
Evidence: `main.getBoundingClientRect().height == 0` on home; body text is announcement + header + footer only. This is the empty band the owner sees; it is spec-06 scope.
Fix: none now; spec 06 builds the home intro. Flagging so it is not misattributed to the palette commit.

### A8 — unconfirmed `[PH]` delivery and warranty claims are live on the storefront · MAJOR (pre-existing; owner decision) · origin: none
Evidence: `footer.liquid:22` renders `rifano.footer_delivery_default` = "Livraison 24–72h · gratuite" and `footer.liquid:32` renders `footer_warranty_default` = "Garantie 12 mois" whenever the settings are blank — and `config/settings_data.json` is `{"current": {}}`, so both render. PRODUCT.md:57 marks both values `[PH]` (must stay marked until the owner supplies final text).
Fix: owner supplies the real values in theme settings (or spec 16 replaces them); alternatively gate the two rows until confirmed. Until then the store promises unconfirmed delivery/warranty terms.

### A9 — search placeholder fails 4.5:1 · MINOR · origin: pre-existing; the palette change improved but did not fix it
Evidence: computed `::placeholder` colour `rgb(117, 117, 117)` on `--c-surface-2` (`base.css:172-174`) = **4.22:1** (was 3.96:1 on `#151515`). No `::placeholder` rule exists anywhere in `theme/assets/`.
Fix: add `::placeholder { color: var(--c-text-2); }` (8.26:1 on `--c-surface-2`) in `base.css`.

### A10 — minor a11y/consistency debt · MINOR · origin: pre-existing
Evidence: (a) drawer close button carries both `aria-label` and a visually-hidden span with identical text (`menu-drawer.liquid:11-19`); (b) focus ring is 1px (`critical.css:74-77) — passes 2.4.7 but easy to lose; (c) `.cart-count` is absolutely positioned `top: var(--s-2)` / `right: var(--s-1)` against a 64px button (`header.css:181-195`) — unproven while the cart is empty, but likely reads detached once count > 0.
Fix: keep one accessible name per control; consider a 2px focus ring; re-check the badge with a test cart (spec 10/15).

### A11 — raw inline `style="--grid-gap: 10px"` · MINOR (pre-existing; spec 08 owns) · origin: none
Evidence: `main-list-collections.liquid:4` — a raw px value referencing a custom property nothing reads (`base.css:207-211` uses `gap: var(--gutter)`). Token-rule smell.
Fix: spec 08 deletes this stub file when the Boutique page is rebuilt.

### A12 — the other half of the owner's instruction was never delivered (spec 08) · MAJOR (process) · origin: session scope, not the commit
Evidence: the owner's prompt for the `3fe1a96` session, verbatim: *"This session has two parts, with two commits. **PART 1: Palette** (owner decision, overrides 'never #000') … **PART 2: Build `specs/08-collection-boutique.md` exactly**"*. `git log 5856b4d..HEAD` has one commit. `main-collection.liquid` / `main-list-collections.liquid` unchanged since `0851189`; `theme/assets/collection.css` does not exist; `collection-header`/`product-grid`/`collection-tiles`/`pagination` do not exist; the two `OrphanedSnippet` warnings persist because product-card still has no consumer. The session's own plan at 22:20 ("in addition to completing spec 08") was never executed, and the follow-up spacing session (22:25–22:31) also produced zero commits. STATUS.md is honest ("Next: spec 08 — collection page + Boutique"), but a "done and good" claim at session scope is false.
Fix: run spec 08 now as its own build → review → fix cycle (the spec and its acceptance criteria are already written), then the spacing pass the owner asked for.

### A13 — the COD promise renders 4 times, 3 visible at once · MINOR (pre-existing; owner decision) · origin: none
Evidence: `fr.default.json:72` (`announcement`) and `:95` (`cod_delivery`) are **byte-identical strings**; the announcement bar and the drawer note both render it; `footer.liquid:14,20-22` renders "Paiement à la livraison" + "Livraison 24–72h · gratuite" again. On the 375px home, announcement (y≈25), footer row 1 (y≈272) and footer row 2 (y≈321) are all in one viewport. DESIGN.md:37-41: *"Show it clearly once or twice. Three times is boilerplate."* The announcement and footer strip are also typographically identical, so repetition reads as one element duplicated.
Fix: keep the announcement bar + one footer variant; drop the drawer note (the announcement stays visible behind the drawer). Owner call, spec 08/15.

### A14 — drawer search placeholder hard-clips mid-word · MINOR (pre-existing) · origin: none
Evidence: `adv-now-drawer-375.png` shows "Rechercher une montre, un c" and `adv-now-drawer-1440.png` "…un colli" — no ellipsis, a hard cut. `header.css:4-7` documents fixing exactly this class of bug for the announcement bar.
Fix: shorten `rifano.search_placeholder` ("Rechercher un article…") and/or reduce the input's horizontal padding (`base.css:169`, `--s-4` → `--s-3`); verify at 375.

---

## 5. Screenshot pairs (the damage check)

All pairs live in `tools/shots/` (gitignored; committed separately from this report): `adv-good-*` = `5856b4d` via `theme dev` on `127.0.0.1:9292`; `adv-now-*` = the current preview `https://fexgzv-pq.myshopify.com/?preview_theme_id=185969639647`.

| Pair (375/768/1440) | Max channel delta | Verdict |
|---|---|---|
| `adv-good-home-*` vs `adv-now-home-*` | 5 | identical but for `#050505` → `#000000` |
| `adv-good-drawer-*` vs `adv-now-drawer-*` | 15 (0 px > 16) | identical but for the drawer surface `#0d0d0d` → `#080808` |
| `adv-good-collections-*` vs `adv-now-collections-*` | 5 | identical; both show the blue link defect |
| `adv-good-collections-all-*` vs `adv-now-collections-all-*` | 5 | identical; both show the empty state defect |
| `adv-good-footer-*` vs `adv-now-footer-*` | 5 | identical but for the ground |

**The pairs show no damage beyond the palette the owner ordered.** The defects they *do* show on both sides — blue collection links, empty `/collections/all`, empty home — are pre-existing spec-06/08 debt (A4–A7, A12), not products of `3fe1a96`.

---

## 6. `/impeccable critique` of the "now" state, against the brief

Method: **dual-agent** (A: design review · B: detector + browser evidence), read-only, no fixes. The deterministic detector returned **0 findings** on every theme file, and its `.liquid` handling is silently "clean" (confirmed: a Liquid target returns `[]` with exit 0, indistinguishable from a clean CSS result) — so the detector is not evidence of quality here; the findings below come from the design and browser assessments. The detector's URL mode could not see the theme (no storefront-password cookie) and was discarded as evidence. Brief: *"the 1%: simple, prestigious, premium, trusted; black #000 + void essence #080808 + silver"*.

**Design specificity — half-authored.** The shell could not be lifted by another brand: one silver mark per viewport (`tokens.css:12`), one hairline token the whole shell shares, the scroll hairline that lights a single 1px line, the icon set that encodes this store's actual taxonomy (`watch`/`necklace`/`pouch`) and promise mechanism (`cash`/`truck`/`shield`), and an optically corrected wordmark with the drift written down (`base.css:53-63`). The content layer is the opposite: the collection pages are the untouched Shopify skeleton, and "the 1%" never appears anywhere in the build.

**Heuristic score (Nielsen, 0–4): 18/36 = 50% — Acceptable.** Visibility 2 · Real-world match 2 (English merchant navigation in a French storefront) · Control 3 (native dialog, Esc, focus return — verified) · Consistency 2 · Error prevention 2 · Recognition 2 · Flexibility n/a · Aesthetic 3 (the shell earns it) · Error recovery 1 (the empty catalogue has no message) · Help 1 (WhatsApp/email live, but no FAQ/SAV/returns). The shell alone would score ~26/36; the deficit is concentrated in the two collection surfaces — i.e. in spec 08.

**Cognitive load: 3 failures — moderate.** Failures: the same COD promise competing with itself three times in one viewport (A13); the type-hierarchy inversion on `/collections` (A4/A5); the working-memory bridge on `/collections/all` (A6). Grouping, chunking, progressive disclosure and option counts all pass.

**Strengths, kept:** (1) the silver rule is genuinely held — one silver object per viewport, enforced in code and documented; (2) the shell cannot visually drift apart — one `--hairline` token consumed identically across announcement, header, drawer and footer; (3) the drawer's native `<dialog>` behaviour — Esc closes, `aria-expanded` toggles, focus returns to `#menu-button` (re-verified: `document.activeElement.id == "menu-button"` after Escape), zero console errors.

**Priority issues** (mapped to findings, attributions kept): **P0** blue/stub collection links (A4) · **P0** no display type on page headings (A5) · **P1** empty state missing on the catalogue (A6) · **P1** promise repeated into boilerplate (A13) · **P2** clipped drawer search placeholder (A14). None is caused by `3fe1a96`; all are the unbuilt-spec surface the owner is reacting to.

**Persona spot-checks:** *Casey* (mobile/TikTok) — arrives with a product in mind; no search/category in the header, taps "Catalog", meets a void; leaves before the reassurance. *Jordan* (first-timer) — the drawer's only landmark is a 12px "MREHBA BIK" label; English navigation in a French store reads as broken. *Sam* (a11y) — contrast and tap targets largely pass; the placeholder fails AA (4.22:1, A9) and the collection markup is an unlabelled div run rather than a list.

**Questions worth a decision:** (1) Is the empty catalogue a restraint choice or an unfinished one? A one-line "the collection is being assembled — WhatsApp us" is arguably more premium than a black void. (2) The store's one uncopyable differentiator is stated three times and proved zero times — what does it take to ship the FAQ first? (3) The most beautiful object in the build (the footer lockup) peaks after the decision; what moves it up?

---

## 7. Housekeeping and limitations

- No repo file was edited except this report. The 30 new screenshots are in the gitignored `tools/shots/`; the `theme dev` worktree used the existing development theme, not `185969639647`, and was removed after capture.
- The "0 upload errors" and "push smoke" claims are verified indirectly (store pull == repo HEAD semantically; all pages render; no Liquid errors). A direct re-push to `185969639647` was forbidden in this audit session.
- Claims about Shopify admin state (trace approval, policies, menus) are outside what the repo can prove.

**Bottom line:** `3fe1a96` is a faithful, verifiable implementation of the owner-ordered palette — keep it. The "messed everything" the owner experienced is not this commit: it is the still-unbuilt spec 08 (Part 2 of the same instruction) and, behind it, the unfinished spec-06 home — the blue collection link, the empty catalogue and the empty home are the visible symptoms, all of which exist in the owner-accepted baseline too. Fix the two documentation items (A1, A2) and run spec 08.
