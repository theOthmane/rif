# PROMPTS — copy/paste for OpenCode

Cycle for every spec: **BUILD** (new session) → **REVIEW** (new session, ideally the other model) → **FIX** (same review session) → next spec.

---

## 1. BUILD (replace NN-name)

```text
Read AGENTS.md (and everything it tells you to read), then execute specs/NN-name.md exactly.
Work only on the files the spec lists. Follow the AGENTS.md workflow: theme check to 0 errors, check every acceptance item, update STATUS.md, commit with the message given in the spec, push.
Reply with: files changed, acceptance checklist (pass/fail per item), and anything I must do in Shopify admin. Then stop. Do not start the next spec.
```

### Extra lines per spec (paste under the BUILD prompt)

- **02**: `Also fix first: in theme/snippets/css-variables.liquid set --gutter to max({{ settings.min_page_margin }}px, clamp(1rem, 0.6rem + 1.6vw, 2rem)) so the fluid gutter isn't overridden. After tracing, save brand/_trace-check.png (original PNG left, SVG with silver gradient on #0d0e10 right) and STOP until I reply "approved". Include the PM's updated specs/13 and specs/14 in your commit.`
- **03**: `Use muse-spark-level care: the drawer must trap focus, close on Esc and backdrop, and return focus to the menu button.`
- **06**: `Run /impeccable shape home hero first, as the spec says.`
- **07**: `Test both cases: no home_rows_menu set (3 placeholder rows), and a menu with 4 collections (4th hidden behind "Plus").`
- **09**: `Before writing the app-block slot and recommendations, look up the Skeleton/theme-block rules with the Shopify Dev MCP and write what you found in STATUS.md.`
- **10**: `Reuse the partial-refresh pattern described in theme/AGENTS.md for cart-contents and cart-count.`
- **13 (Part B only)**: `Part A is done by the owner (brand/hero/hero.mp4 and poster.png exist). Execute only Part B, using the "Actual source" block. Create scripts/make-hero-frames.sh. Delete brand/hero/_contact.png and brand/hero/_poster_small.png.`
- **14**: `Read the scroll-craft references the spec lists before coding. Do not copy the scroll-craft engine into the theme.`
- **15**: `Commit after each numbered step that changes code. Paste the Lighthouse scores into STATUS.md.`
- **16**: `Only do the steps marked 🤖. Print the owner checklist back to me as a to-do list.`

---

## 2. REVIEW (new session, replace NN-name)

```text
You are the REVIEWER for this repo, not the builder. Do not write code in this step.
Read AGENTS.md, theme/AGENTS.md, PRODUCT.md, DESIGN.md, PLAN.md §2 and specs/NN-name.md.
Then review the last commit for this spec: run `git show --stat HEAD` and `git diff HEAD~1 HEAD`.

Check and report, item by item:
1. Acceptance criteria of the spec: PASS / FAIL with evidence (file:line).
2. AGENTS.md non-negotiables: no sections/JSON templates/{% stylesheet %}; all strings via 'key' | t in fr.default.json; routes.* only; no raw hex/px outside tokens.css (except 0/1px/100%); one CSS/JS file per component; no external CDNs; no third-party brand names (grep -riE "rolex|armani|piguet|audemars|casio" theme/).
3. Zero-products safety: what renders with no products, no collections and no menus.
4. Accessibility: focus-visible, tap targets ≥ 44px, labels on icon buttons, dialogs (Esc, focus return), reduced motion.
5. Mobile at 375px: anything that could overflow horizontally.
6. Run `npx @shopify/cli@latest theme check --path theme` and paste the summary.
7. Run `/impeccable critique` on the surface this spec built, and list only high/critical findings.
8. Files touched that the spec did not list.

Output format:
- VERDICT: APPROVE or CHANGES NEEDED
- BLOCKING (must fix): numbered, each with file:line and the exact fix
- NON-BLOCKING (nice to have): max 5
Do not fix anything yet.
```

---

## 3. FIX (same session as the review, after reading the verdict)

```text
Fix all BLOCKING items from your review, nothing else. Do not refactor unrelated code.
Then: theme check to 0 errors, re-check the failed acceptance items, update STATUS.md ("review fixes for spec NN"), commit "fix(NN): review fixes", push.
Reply with each blocking item → fixed (file:line). Stop.
```

---

## 4. VISUAL CHECK (you, before moving on)

```text
npx @shopify/cli@latest theme dev --path theme --store fexgzv-pq
```
Open the preview link on your phone and on desktop. If something looks wrong, paste this into the same session with a screenshot:

```text
Visual issue on <page> at <375px / 1440px>: <what is wrong> (screenshot attached).
Fix it within the rules of AGENTS.md and DESIGN.md, theme check to 0 errors, commit "fix(NN): visual <short>", push. Stop.
```

---

## 5. RESUME (if a session crashed or ran out of context)

```text
Read AGENTS.md and STATUS.md. Run `git status` and `git log --oneline -5`.
We were executing specs/NN-name.md. Tell me what is already done vs the spec's acceptance list, then finish only what's missing, following the AGENTS.md workflow. Stop when done.
```

---

## Order
01 ✅ → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 (Part B) → 14 → 15 → 16
