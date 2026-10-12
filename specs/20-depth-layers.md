# Spec 20 — Depth layers: scroll-linked 3D across the site

## Goal
The owner finds the site too static outside the hero: "when we are moving, some things are happening." They want **variety of tempo**: some layers faster, some slower. It has to stay aesthetic and easy with a mouse wheel or a thumb.

**Owner decision:** depth layers built from what already exists (cards, titles, icons, monogram, gallery). No new video. The hero stays the slow, weighty anchor. Everything else moves in layers at different speeds so the page reads as 3D space.

This **replaces** DESIGN.md's "one authored moment per screen" with a new rule set (step 1). It still forbids loops, bounce, flash and badge spam.

## Read first
- DESIGN.md "Motion principles" (you'll rewrite it), PRODUCT.md "Brand Commitments"
- scroll-craft `references/hero-depth.md` (depth planes, five depth tools), `references/feel.md` §4–§5, `references/devices.md`, `references/verify.md`
- `/impeccable animate` to plan, then `/impeccable polish` on home after the build. Brand commitments are intentional.

## Engine decision (fixed)
- **CSS scroll-driven animations** (`animation-timeline: view()` / `scroll()`, `animation-range`) are the engine. They run off the main thread, so a slow phone doesn't lag. Wrap all of it in `@supports (animation-timeline: view())`.
- Browsers without support (e.g. Firefox today) get the **static final state**. That's acceptable and must look finished, not broken.
- JS only for pointer tilt (fine pointers): one module `depth-tilt.js`, ≤ 1.5 KB min, rAF-throttled, passive listeners.
- Animate **only** `transform` and `opacity` (`translate`, `rotate`, `scale`, `perspective` on the parent). No layout properties, no `filter: blur` on scroll (too expensive on phones).
- No re-triggered entrances: everything is scrubbed by position, so scrolling back up reverses it naturally (DESIGN rule 3 holds).

## Files
- `DESIGN.md` (rewrite "Motion principles" rules 1 and 4 + add the tempo table below; nothing else)
- `theme/assets/depth.css` (new, the shared layer utilities and keyframes) + `theme/assets/depth-tilt.js` (new)
- `theme/assets/home-rows.css`, `theme/sections/home-rows.liquid` (add classes/attributes only)
- `theme/assets/product-card.css`, `theme/snippets/product-card.liquid` (classes/attributes only)
- `theme/assets/footer.css`, `theme/sections/footer.liquid` (monogram turn)
- `theme/assets/product.css`, `theme/sections/product-gallery.liquid` (gallery depth)
- `theme/layout/theme.liquid` only to load `depth.css` / `depth-tilt.js` once (stop and explain if a per-section load works better)

## The tempo map (the variety the owner asked for)
Speeds are relative to the scroll. Every value goes in `depth.css` as custom properties built from `tokens.css` (spacing tokens for travel, `--ease-out`). Add new tokens to `tokens.css` only if a value can't be expressed, and say so.

| # | Layer | Where | Tempo | Motion (scrubbed by its own `view()` range) |
|---|---|---|---|---|
| 1 | Hero watch | home | **slowest**, weighty | spec 18, unchanged |
| 2 | Hero → rows handoff | first row as the hero unpins | slow | first row track rises from `translateY(var(--s-8))` + `rotateX(8deg)` to flat over `entry 0% → cover 35%` |
| 3 | Row titles + icons | each row head | **slow** (0.6×) | title drifts `var(--s-6)` → 0; icon turns `rotateY(-40deg)` → 0, a beat ahead of the title |
| 4 | Product cards in a row | each card | **medium**, staggered | cards rise at different rates: card n gets `--depth-lag: n × 4%` on its `animation-range` start, so they arrive like a wave, not as a block. Max 4 lagged cards, the rest share the last value |
| 5 | Horizontal row track | while swiping/arrowing a row | **fast**, follows the finger | cards get `rotateY` from their position in the track's own horizontal `scroll()` timeline: max ±6°, flat at centre (coverflow-lite). Mobile: ±4° |
| 6 | Card pointer tilt | card hover, fine pointer | instant | `depth-tilt.js`: ≤ 4° toward the cursor + image `translateZ` lift, resets on leave |
| 7 | "Plus" reveal | rows revealed by Plus | medium, one-shot on click | revealed rows unfold `rotateX(12deg)` → 0 over `--dur-3` (click-triggered, allowed) |
| 8 | Product gallery | product page | slow | main image eases `scale(1.04)` → 1 and `translateY(var(--s-5))` → 0 as it enters; the info column does not move (the buy area stays still) |
| 9 | Footer RF monogram | footer | **slowest**, the closing beat | monogram turns `rotateY(-35deg)` → 0 as the footer enters (`entry 10% → cover 40%`): the page ends on the brand mark settling to front view, echoing the hero watch |

Rules for all layers:
- **Text must be still while it's read.** Any moving text reaches its final position before it passes the middle 60% of the viewport.
- Max travel `var(--s-8)`, max rotation 12° (row unfold) / 8° (scroll) / 6° (track), no scale beyond 1.04.
- `perspective` on the nearest stable parent (row viewport, card, footer brand). Never on `body`.
- Rotated or translated elements must never cause horizontal overflow: `overflow-x: clip` on the row viewport, and verify `scrollWidth === clientWidth`.
- Focus rings and 44×44 targets are unaffected. Hit-testing stays correct; nothing clickable is mid-animation at rest.
- **Reduced motion:** every layer off, static final state (`@media (prefers-reduced-motion: reduce)` resets `animation: none` and transforms to identity). Page reads completely.

## DESIGN.md rewrite (step 1, before any CSS)
Replace rule 4 "One authored moment per screen" with **"One conductor, many tempos"**: the hero is the slow anchor. Secondary depth layers are allowed when they follow the tempo map: scroll-linked, transform/opacity only, reversible, no loops, no bounce, text still while read. Update rule 1 so "Subtle" still bans attention-seeking effects but allows layered depth. Add the tempo map as a short table. Keep everything else in DESIGN.md as is.

## Budgets
- No new long tasks; CLS 0; overflow 0 at 375/768/1440.
- Main-thread scripting during a scroll sweep must not grow vs spec 18 (report both numbers).
- Lighthouse mobile Performance on home doesn't drop by more than 3 points vs before this spec (report both).
- `depth.css` ≤ 6 KB, `depth-tilt.js` ≤ 1.5 KB minified.

## Verification (Gate C)
- Scroll-sweep video frames or screenshot sequences for home (375, 1440): `tools/shots/20-home-sweep-{375,1440}-NN.png`, plus product and footer. Contact sheet `tools/shots/20-contact.png`.
- Show the tempo difference: same scroll offset, layers 3 / 4 / 9 at different completion %, measured via `getAnimations()[0].effect.getComputedTiming().progress`.
- Row swipe at 375: card rotation tracks the swipe, no overflow.
- Reduced motion: static, complete, screenshot.
- An unsupported-engine check: force-disable via a test stylesheet or run in Firefox if available. The final state looks finished.
- Keyboard: Tab through a row and the footer. Focus visible, nothing jumps.

## Acceptance
- [ ] DESIGN.md motion rules rewritten as above (diff in reply)
- [ ] All 9 layers behave per the tempo map (evidence per layer)
- [ ] Tempos visibly differ (progress numbers at one offset)
- [ ] Reduced motion + unsupported engine = finished static page
- [ ] Budgets met, overflow 0, CLS 0; Gate A/B/C pass

Commit: `feat(20): scroll-linked depth layers`
