# QA-REPORT — RIFANO theme

Date: 2026-10-10 · QA session · Tree at `9a06265` (+ untracked session tooling, see §Uncommitted).
Stores: preview target `fexgzv-pq` (per owner), launch store `xpziwn-tw` (untouched by this QA).

## Summary

1. Specs **01, 03, 04, 05 are committed and clean**; **02 is half-done** (no commit of its own); **06–16 are not started**. Spec work has been paused since `6f101a8`.
2. **BLOCKER: the store rejects the theme's core architecture at upload.** Every file using `{% block %}` or `{% partial %}` is dropped by `theme push`, the stored theme is un-renderable (verified by pulling the store's themes), and `theme dev` previews return `500 / Unknown tag 'block'`.
3. This is an **environment limitation, not a repo defect**: Shopify's own `skeleton-theme` fails identically on the same store, and `theme check` — the project's only gate — cannot detect it.
4. Acceptance criteria that require a **rendered page** (specs 03/04/05, parts of 01) have **never been visually verified**. The store password (`rahste`) is now known, but previews are blocked by the same environment problem.
5. Recommended path: **fix forward (A)** — resolve the store's Liquid environment (or formally reopen PLAN §2) and add upload validation to the per-spec gate. Reverting (B) is not applicable: no commit is broken.

## Phase 1 — Spec status (facts from git)

`git log` is linear and clean: `8c04487` initial skeleton → `4a0d07d`/`23c725e` docs → specs. No stashes, no merges, no detached work. The owner committed `9a06265 docs: preview on dev store fexgzv-pq` during this QA session (PROMPTS.md only).

| Spec | Status | Commit(s) | Review/fix commit | Evidence |
|---|---|---|---|---|
| 01 foundations | **done** | `0cf0f1c` | `21f6686` | `ts/fr.default.json`→`theme/locales/fr.default.json`, 3 WOFF2 in `theme/assets/`, `tokens.css`, rewritten `critical.css`/`base.css`, `DESIGN.md`, RIFANO settings group (`settings_schema.json:10-74`) |
| 02 brand assets | **partial** | *none of its own* — files landed in `5f7bc11`, `6f8611c` | none | `brand/rf-monogram.svg` + `theme/snippets/logo.liquid` exist; **`snippets/icon.liquid` + 20-icon set missing**; `icon-account.svg`/`icon-cart.svg` still in `assets/`; owner trace approval not recorded |
| 03 header/menu | **done** | `3b429b5` | `b40625e` | `blocks/announcement.liquid`, `blocks/header.liquid`, `blocks/menu-drawer.liquid`, `header.css`, `menu-drawer.js`, layout composition |
| 04 footer | **done** | `5f7bc11` | `6f8611c`, `d452be9` | `blocks/footer.liquid`, `footer.css`; logo lockup landed in the fix commit |
| 05 product card | **done** | `02b0b1a` | `ff06e7b` | `snippets/product-card.liquid`, `snippets/price.liquid`, `product-card.css/.js` |
| 06 home intro | not started | — | — | no `blocks/home-hero.liquid`, no `home-hero.css` |
| 07 home rows | not started | — | — | no `home-rows.*` |
| 08 collection/boutique | not started | — | — | no `collection-header`/`product-grid`/`collection-tiles` blocks, no `collection.css` |
| 09 product | not started | — | — | `templates/product.liquid` is still the Skeleton stub |
| 10 cart | not started | — | — | no `cart-drawer`/`cart-contents` blocks, no `cart.css`/`cart.js` |
| 11 content pages | not started | — | — | no `page.contact/mission/faq` templates |
| 12 system pages | not started | — | — | search/404/password still Skeleton stubs |
| 13 hero assets | **partial (owner Part A)** | `5f7bc11` | — | `brand/hero/hero.mp4`, `poster.png` committed; **no frames** in `theme/assets/`, no `scripts/make-hero-frames.sh`; `_contact.png`/`_poster_small.png` still present |
| 14 hero scroll | not started | — | — | no `hero-scrub.js`, no settings |
| 15 audit/polish | not started | — | — | — |
| 16 launch | not started | — | — | — |

### Uncommitted / untracked (and the spec they belong to)

- `skills-lock.json` (modified) — registers the `retro` skill. **Session tooling, not a spec.**
- `.agents/skills/retro/` and the symlink `.claude/skills/retro` — **session tooling, not a spec.**
- Nothing uncommitted inside `theme/`. The earlier uncommitted PROMPTS.md store-name edit was committed by the owner as `9a06265`.

### STATUS.md vs git

- No case of "claimed done but no commit": spec 02 is explicitly flagged incomplete by STATUS itself, and git agrees.
- STATUS `:168` said `theme dev` could not get past the storefront password prompt. **Resolved**: password `rahste` works; the finding under it (previews fail) is re-verified below with stronger evidence.
- STATUS `:97` says `5f7bc11 feat(04)` contains 21 files of spec-02/PM work — confirmed by `git show --stat`.
- Otherwise STATUS matches git exactly. The store-render section (`:142-196`) is accurate and remains the most important read in the repo.

## Phase 2 — QA of the current tree

### 5. `theme check` (full summary)

```
npx @shopify/cli@latest theme check --path theme
29 files inspected with 2 total offenses found across 2 files.
2 warnings.
```

- `snippets/price.liquid` — `OrphanedSnippet`: "This snippet is not referenced by any other files"
- `snippets/product-card.liquid` — `OrphanedSnippet`

0 errors. Both warnings are expected until the first consumer lands (specs 07/08/09/12); they disappeared when a temporary consumer was present during spec 05, so they are proof-of-consumer, not a defect.

### 6. Broken references

**None missing.** Checked every reference in `theme/`:

- `{% render %}` targets — `css-variables`, `meta-tags`, `image`, `logo`, `price`, `product-card`: all exist in `snippets/`.
- `{% block %}` targets — `container`, `announcement`, `header`, `menu-drawer`, `footer`: all exist in `blocks/`. Executable block calls appear only in `layout/` + `templates/` (the calls in `blocks/container.liquid:9,15` are inside `{% doc %}` examples, which `theme/AGENTS.md:87-90` allows).
- `asset_url` targets — `tokens.css`, `critical.css`, `base.css`, `header.css`, `footer.css`, `product-card.css`, `menu-drawer.js`, `product-card.js`, 3 WOFF2: all exist. `gift-card/*.svg` use `shopify_asset_url` (platform-provided).
- `'key' | t` — **68 storefront usages, 0 missing** from `fr.default.json`; **9 schema `t:` refs, 0 missing** from `en.default.schema.json`.
- `{% partial %}` — one region, `cart-count` (`blocks/header.liquid:47`); no JS consumer yet, so nothing can mismatch. (Parsing of this tag is store-gated — see BLOCKER 1.)

### 7. Non-negotiables sweep

| Check | Result | Evidence |
|---|---|---|
| `sections/` or JSON templates | **PASS** | no `sections/`; templates are `.liquid`; only config/locale JSON exists |
| `{% stylesheet %}` / `{% javascript %}` | **PASS** | only mentioned in docs (`theme/AGENTS.md:11`, `theme/README.md:139`) |
| Hard-coded routes | **PASS** | no `href="/cart|/collections|/search"`; `routes.*` used (`header.liquid:32`, `menu-drawer.liquid:29`) |
| Raw hex outside `tokens.css` | **PASS** | none in CSS or templates |
| Raw px outside `tokens.css` | **MINOR FAIL** | only breakpoints (`footer.css:48,176,261`, `header.css:366,372`) plus one legacy `style="--grid-gap: 10px"` at `templates/list-collections.liquid:4` (spec 08 owns this file) |
| External CDNs | **PASS** | none |
| Third-party brands | **PASS** | `grep -riE "rolex\|armani\|piguet\|audemars\|casio" theme/` → empty; no `brand/watches` files in `theme/assets/` |
| Unused Skeleton assets | MINOR | `theme/assets/icon-account.svg`, `icon-cart.svg` unreferenced; spec 02 owns their deletion |
| Hard-coded UI string | MINOR | `templates/product.liquid:33` `value="Add to cart"`; spec 09 rewrites this template |

### 8. Acceptance walkthrough (built specs)

**Spec 01 — PASS on all code-verifiable items; two items need a browser/admin:**
1. theme check 0 errors + no deleted-file refs — PASS (29 files, 0 errors; no `type_primary_font`/`liquid-tips`/`hello-world` refs in code).
2. `#0d0e10` ground, Manrope body, Bodoni `.t-display` — PASS by code (`tokens.css:3,16`; `critical.css:10,22`; `base.css:5-6`); "rendered fonts" check in DevTools — **CAN'T VERIFY**.
3. No raw hex outside tokens — PASS.
4. `fr.default.json` only storefront locale; `rifano.*` keys — PASS.
5. RIFANO group visible in theme editor — schema PASS (`settings_schema.json:10-74`); editor visibility **CAN'T VERIFY** without admin.
6. DESIGN.md silver rule + brand commitments — PASS (`DESIGN.md:67-76,101-107`).
7. PRODUCT.md TBDs resolved — PASS (`PRODUCT.md:13,61,81`).

**Spec 02 — PARTIAL:**
1. Monogram trace crisp, owner-approved — **CAN'T VERIFY** (file `brand/rf-monogram.svg` exists, `brand/_trace-check.png` exists, no recorded approval).
2. Unique gradient id per render — PASS (`logo.liquid:19-21`, applied `:40,:62`).
3. All 20 icons — **FAIL**: `snippets/icon.liquid` does not exist; header/footer/menu-drawer still carry inline one-off SVGs.
4. No PNG logo in theme — PASS.
5. theme check 0 errors — PASS. **No `feat(02)` commit — FAIL** (missing deliverable).

**Spec 03 — PASS by code; live behaviour CAN'T VERIFY (no browser):**
1. 375/1440 header row no overflow — **CAN'T VERIFY** (markup + CSS only; STATUS flagged owner eyeball).
2. Drawer open/close + focus return — PASS by code (`menu-drawer.js:127-156,166-180,182-198,200-221`; native `<dialog>` Esc).
3. Drawer search → `/search?q=` — PASS (`menu-drawer.liquid:29` `routes.search_url`, `type="search"` input).
4. Cart badge hidden at 0 — PASS (`header.liquid:48,51`).
5. Announcement text from setting, never animates — PASS (`announcement.liquid:7-11`; no animation code).
6. theme check 0 errors — PASS.

**Spec 04 — PASS by code; accordions/menus CAN'T VERIFY visually:**
1. No menus → columns hidden, no errors — PASS (`footer.liquid:60,62,105`).
2. Policy links resolve when present — PASS (`footer.liquid:204-226`, guarded per policy).
3. Accordions keyboard-operable, no layout shift — PASS by code (native `<details>`, CSS-only 768px switch); live **CAN'T VERIFY**.
4. theme check 0 errors — PASS.

**Spec 05 — mixed:**
1. Temporary grid rendered 4 placeholders + real products — **CAN'T VERIFY** (grid was removed before commit; theme-checked with it in place, never seen).
2. No layout shift — PASS (`product-card.css:23` `aspect-ratio: 4/5`).
3. Sold-out/on-sale correct — PASS by code path only (`product-card.liquid:40-45`, `price.liquid:36-38`); no test product exists in admin to confirm.
4. theme check 0 errors — PASS (see §5).

**Spec 13 (Part A only)** — assets exist; Part B not started (expected, spec was paused).

### 9. JS sanity

- `menu-drawer.js` — no imports; one `customElements.define('menu-drawer', …)` at `:224`; loaded with `type="module" defer` at `menu-drawer.liquid:159`. PASS.
- `product-card.js` — no imports, no custom element; loaded with `type="module" defer` at `product-card.liquid:20`. PASS.
- No other JS in `theme/`. No duplicate definitions. `snippets/meta-tags.liquid:61` is JSON-LD, not executable JS.

### 10. `theme dev` on the dev store

```
npx @shopify/cli@latest theme dev --path theme --store fexgzv-pq --store-password rahste
```
**Starts**, and prints:
- local preview: `http://127.0.0.1:<port>`
- share preview: `https://fexgzv-pq.myshopify.com/?preview_theme_id=185966854367`
- editor: `https://fexgzv-pq.myshopify.com/admin/themes/185966854367/editor`
- gift cards: `http://127.0.0.1:<port>/gift_cards/…/preview`

But **every page returns `500 / Failed to Upload Theme Files / Unknown tag 'block'`** once the CLI sync settles (home, /cart, /collections, /collections/all, /search, /password, 404). During the first seconds of a run some pages briefly returned 200; that is a transient upload-window artefact, not a working preview.

Preview URLs to open **after the environment decision**, expected at that point to be:
- home `/`, a collection `/collections/<handle>`, a product `/products/<handle>` (none exist yet — placeholders expected), cart `/cart`, password `/password`.

## Breakages

1. **BLOCKER — the store drops every block/partial file; the theme cannot be stored or previewed on `fexgzv-pq`.**
   File:line — `layout/theme.liquid:35`, `templates/{404,article,blog,cart,collection,index,list-collections,page,password,product,search}.liquid:1`, `blocks/header.liquid:47`.
   Cause: the store's upload validator does not support the new Liquid `{% block %}` / `{% partial %}` tags. `theme check` parses them; `theme push` rejects them. Verified three ways: (a) push of the current tree → 13 errors, theme `rifano-qa-check` (#185968394463) "pushed with errors"; (b) pulling dev theme #185966854367 and QA theme #185968394463 → **all 12 templates except `gift_card.liquid` and `blocks/header.liquid` are absent**, `layout/theme.liquid` on the store is a 2-line fallback; (c) `theme dev` previews → 500 `Unknown tag 'block'`. Upstream `Shopify/skeleton-theme` fails identically (prior session, `6f101a8`).
   Exact fix: **none in Liquid.** The environment must be enabled for the store that will host previews/launch (Shopify support ticket with the upstream-theme failure as evidence), or PLAN §2's architecture decision must be reopened (sections + JSON templates). This is an owner/PM decision, not a spec fix.

2. **MAJOR — the per-spec gate cannot see uploadability.**
   `PLAN.md:31` ("Gate: `theme check` 0 errors … before every commit") and `AGENTS.md` workflow step 3 rely on `theme check` only; that tool happily parses tags the store rejects.
   Exact fix: extend the gate to `theme check` 0 errors **AND** `npx @shopify/cli@latest theme push --path theme --store <target> --unpublished --theme rifano-smoke --no-input` reporting no Liquid syntax errors. Record the result in `STATUS.md` every spec.

3. **MAJOR — spec 02 is half-built and unchecked.**
   `theme/snippets/icon.liquid` missing; 20-icon set missing; `blocks/header.liquid:24-27` still renders a literal `RF` text fallback while `snippets/logo.liquid` exists; `theme/assets/icon-account.svg`, `icon-cart.svg` not deleted.
   Cause: build order was broken (03/04 built before 02 was committed; fix(04) had to land `logo.liquid` to unblock its review).
   Exact fix: run spec 02 as its own build→review→fix cycle (owner approves the trace first); then migrate the inline SVGs in header/menu-drawer/footer to `{% render 'icon' %}`, delete the two SVG assets, commit `feat(02): …`. Independent of the store decision; can start anytime.

4. **MAJOR — nothing built has ever been visually verified.**
   Specs 03/04/05 and spec 01's font/theme-editor checks are all "owner to eyeball". `theme dev` was blocked by the store password until this session; now blocked by BREAKAGE 1.
   Exact fix: after BREAKAGE 1's decision, run `theme dev` on a supporting store and walk the acceptance lists at 375px and 1440px; record results in `STATUS.md`.

5. **MAJOR — mislabeled commit with unreviewed scope.**
   `5f7bc11 feat(04): footer` contains 21 non-spec-04 files (`PROMPTS.md`, `brand/hero/*`, `tools/trace/*`, `specs/13` edits, `.gitignore`, `brand/rf-monogram.svg`, `brand/_trace-check.png`).
   Cause: spec-02/PM work ridden along instead of committed against its own spec.
   Exact fix: accept as history (documented in `STATUS.md`) or split via interactive rebase — owner call; the review prompt should gain a "files touched vs spec file list" item so this cannot pass again.

6. **MINOR — stale doc pointer.**
   `theme/AGENTS.md:107` says recover the partial-refresh example with `git show HEAD~1:theme/assets/liquid-tips.js`; that now exits 128 (`HEAD~1` no longer contains the file). Correct ref: `git show 8c04487:theme/assets/liquid-tips.js`.
   Exact fix: change the pointer to the pinned hash `8c04487`.

7. **MINOR — legacy template debt owned by later specs.**
   `templates/list-collections.liquid:4` `style="--grid-gap: 10px"` (raw px; spec 08), `templates/product.liquid:33` hardcoded `"Add to cart"` and `:34` `{{ form | payment_button }}` (spec 09 must remove the dynamic checkout button).
   Exact fix: leave in place; the owning specs already list these files.

8. **MINOR — carried a11y defects.**
   `blocks/header.liquid:25` `aria-label="{{ shop.name }}"` against a visible hidden `RF` (same SC 2.5.3 class fixed in `footer.liquid:49`); cart label plural/placement; both footer `link_list` settings share label `t:labels.menu` (`footer.liquid:239,245`); `settings.returns_text` rendered nowhere.
   Exact fix: header label in spec 09/15; schema labels in a spec that lists `en.default.schema.json`; `returns_text` in the cart/product spec.

9. **MINOR — theme-check warnings and dead locale keys.**
   2 `OrphanedSnippet` warnings (they clear when spec 07/08 lands a consumer — spec 15 requires 0 warnings). 22 never-referenced keys: `hello_world.*` (18), `customers.login.*` (4), `rifano.email_label`.
   Exact fix: cleanup step in spec 15.

10. **MINOR — store hygiene.**
    This QA pushed `rifano-qa-check` (#185968394463) to `fexgzv-pq` (unpublished, carries the 13 errors). Prior throwaways remain: `rifano-spec05-review` (#185966887135), `rifano-spec05-verify` (#185966919903), `skeleton-upstream-test` (#185968001247). `xpziwn-tw` was not touched.
    Exact fix: delete the throwaway themes in admin when the environment question is settled.

## Retro (per the `retro` skill; `writing-for-agents` skill not available in this environment)

### Timeline

| When | Event |
|---|---|
| `8c04487` | Skeleton theme imported. Its architecture is `{% block %}`/`{% partial %}` — **store-environment-dependent**. |
| `23c725e` | PLAN §2 freezes the architecture ("no sections, no JSON templates") and fixes the gate: "`theme check` 0 errors before every commit". No store-feasibility prerequisite exists. |
| `0cf0f1c`→`ff06e7b` | Specs 01, 03, 04, 05 built; spec 02 skipped mid-flight; every gate green. **First upload attempt in sight was spec 05's push** (owner report). |
| `d452be9`, `6f101a8` | Push reproduces 13 errors; upstream `Shopify/skeleton-theme` fails identically on the same store → spec work paused. |
| Today (QA) | Re-verified: push still rejects; **pulled store themes show the invalid files are simply absent**; `theme dev` renders 500s after sync; password `rahste` now available; owner commits `9a06265`. |

### Exact point it went wrong

Not a bad commit and not a bad session — a missing prerequisite. The failure point is **PLAN.md §2 (`23c725e`)**: it fixed an architecture that depends on a store-side feature without ever proving the feature on the store that would run it. The first genuinely unsafe action was building specs 03–05 on top of it; the first *visible* failure was the spec-05 push attempt. The model did not misunderstand the no-sections rule (it defended it correctly throughout), the specs are not ambiguous, there was no merge/overwrite (history is linear), and no context overflow is visible in the artifacts. The root cause is **validation scope**: work was checked with a tool that cannot see store upload validation, against a store that turns out not to support the architecture, while the store named in the docs was not accessible from the build environment.

### Keep / Stop / Start

**Keep**
- One spec per session; build → review → fix; write-only file lists; `theme check` before commit.
- `STATUS.md` honesty — the store-render section documented the failure precisely and refused to fake a pass. This is why recovery is cheap.
- Placeholder discipline, route/token/translation rules — the tree is clean against every non-negotiable that can be checked locally.
- The dev-store / password workflow now that the password is on hand.

**Stop**
- Treating `theme check` as the uploadability gate.
- Deferring the first real upload until several specs deep (or behind an unresolved password prompt).
- Building on an experimental Shopify feature without a store-side proof (upstream theme test should have preceded spec 01).
- Committing out-of-spec files inside a spec commit (`5f7bc11`).

**Start**
- **Gate zero**: before any further spec, prove `theme push --unpublished` acceptance on the store that will host the theme. One command; it would have saved specs 03–05.
- Add upload validation to the per-spec exit checklist and to the CI/hook. Note `theme/.github/workflows/ci.yml` is **dead**: GitHub only reads `.github/workflows` at the repo root, and there is no root-level workflow or pre-commit hook at all.
- Store passwords/credentials recorded with the dev-store notes.
- Pin doc pointers to commit hashes, never `HEAD~1`.

Retro candidates by the skill's categories: **automated checks** (the push-validation gap above; dead nested CI), **navigation** (the rotted `HEAD~1` pointer), **coding standards** (review prompt should compare files-touched vs spec file list — `5f7bc11` proves the gap), **AGENTS.md** (add the store gate to the workflow step; keep files lean — both AGENTS.md files are fine otherwise), **information access** (store password + launch-store access were the blockers), **tool economy / no-ops** (`.claude/skills/design-taste-frontend` symlink caveat noted in STATUS; `PLAN.md §4 step 4` still names `xpziwn-tw` — owner asked it stays, so it is a known inconsistency until the decision).

## Recovery plan

### Chosen: **A) Fix forward** — with the environment decision as fix #1

Justification: **no committed state is broken.** Every commit passes `theme check`; the tree is internally consistent (0 broken references, all non-negotiables clean except minor legacy debt owned by later specs). The failure is entirely store-side, so a revert cannot fix anything. Option B would only discard work: reverting to `23c725e` loses specs 01/03/04/05, and rebuilding them reproduces the same blocker until the environment question is answered.

### Ordered fixes

1. **(Owner, blocks everything)** Resolve the store environment. Two options:
   - Get the `block`/`partial` features enabled (or confirm they are enabled) on the store that will host the theme — test on `xpziwn-tw` from an account that can access it: `npx @shopify/cli@latest theme push --path theme --store xpziwn-tw --unpublished --theme rifano-env-test --no-input`. Evidence pack for Shopify support: this repo's 13 errors + upstream `skeleton-theme`'s identical 13 errors (the still-present `skeleton-upstream-test` theme demonstrates it).
   - If no store can support it: reopen `PLAN.md §2` and switch to **sections + JSON templates**. Bounded cost: only specs 01–05 exist; CSS/JS/tokens/fonts/locale/logo/product-card port over; `layout/`, `templates/`, `blocks/` and both AGENTS.md files are rewritten.
2. **(Agent, immediately, decision-independent)** Harden the gate: update root `AGENTS.md` workflow + `PLAN.md §2` gate row to include `theme push` validation; fix `theme/AGENTS.md:107` pointer to `8c04487`; append this QA's evidence to `STATUS.md`. (See "Spec/AGENTS changes" below.)
3. **(Agent, decision-independent)** Finish spec 02 (icon set, trace approval, inline-SVG migration, delete unused SVG assets) as its own `feat(02)` + review cycle. It is needed under either architecture.
4. **(Agent, after #1)** Resume the spec queue in order from 06. Every spec reply must include the `theme push --unpublished` smoke result and the `theme dev` visual pass (375px + 1440px) for surfaces it touched.
5. **(Owner/Agent, hygiene)** Decide `5f7bc11` mislabel (accept or split); delete the throwaway store themes incl. `rifano-qa-check`; decide whether to commit the retro-skill tooling.

### What B would lose (for the record)

The "last good commit" would be the current tip `9a06265` (or `6f101a8` before the owner's docs commit) — nothing to revert to, because nothing is broken. Reverting to `23c725e` discards specs 01–05 entirely and rebuilds into the same store rejection. So B is **not applicable** while the environment question is open.

## Spec / AGENTS.md changes the PM should make

The root cause is a **gate problem**, not a spec ambiguity. The ambiguous/misleading lines:

- `PLAN.md:31` — quote: *"| Gate | `theme check` 0 errors (Shopify Dev MCP or `npx @shopify/cli@latest theme check --path theme`) before **every** commit |"* → replace with: *"| Gate | `theme check` 0 errors **and** `theme push --unpublished` to the target store returns no Liquid syntax errors, before every commit. Record both in STATUS.md. |"*
- `AGENTS.md` workflow step 3 — quote: *"Run `npx @shopify/cli@latest theme check --path theme` (or the MCP validator). Fix until **0 errors**."* → append: *"Then run `npx @shopify/cli@latest theme push --path theme --store <target> --unpublished --theme rifano-smoke --no-input` and fix any store-side Liquid errors. `theme check` alone cannot see them."*
- `PLAN.md` §2 fixed decision row (`no sections, no JSON templates`) — add a prerequisite note: *"This architecture requires a store with the new Liquid `block`/`partial` environment confirmed by a push test. Do not start spec 06+ until confirmed."*
- `theme/AGENTS.md` "The block tag" / "The partial tag" — add one sentence: *"These tags parse in theme check but stores without the new Liquid environment reject them at upload (`Unknown tag`). Validate with `theme push` before declaring a spec done."*

## Next prompt to paste into OpenCode (start of recovery)

```text
Read QA-REPORT.md first, then AGENTS.md, theme/AGENTS.md and STATUS.md.

Do recovery step 2 only: harden the gate and fix the docs. Do not touch theme/ code.

1. In AGENTS.md, extend workflow step 3: after `theme check` 0 errors, run
   `npx @shopify/cli@latest theme push --path theme --store fexgzv-pq --unpublished --theme rifano-smoke --no-input`
   and stop with an explanation if it reports Liquid syntax errors.
2. In PLAN.md §2, update the Gate row to require both theme check and the push validation,
   and add the prerequisite note that the store must support the block/partial environment
   before spec 06+.
3. In theme/AGENTS.md, fix the rotted recovery pointer: `git show HEAD~1:theme/assets/liquid-tips.js`
   becomes `git show 8c04487:theme/assets/liquid-tips.js`, and add one sentence to "The block tag"
   about store upload validation.
4. Append a short "QA recovery" entry to STATUS.md with the new evidence: pushed themes on
   fexgzv-pq keep only gift_card.liquid (all block/partial files dropped); theme dev returns
   500 "Unknown tag 'block'"; the store decision is pending with the owner.

Never push or publish anything to xpziwn-tw. Run theme check (0 errors expected), commit
"docs: recovery gate hardening + status", push. Then stop and wait for the owner's store decision.
```

---

*End of report. QA made no changes to `theme/`; the only repo change is this file. Store actions this session: read-only `theme list`, `theme pull` (twice, to /tmp), one `theme dev` smoke on `fexgzv-pq` with the provided password, and one `theme push --unpublished` to `fexgzv-pq` (`rifano-qa-check`, #185968394463 — delete when done). `xpziwn-tw` was not accessed.*
