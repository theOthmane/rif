# Spec 14 — Scroll-scrubbed 3D hero

## Goal
Turn the spec 06 poster hero into the signature moment: as the visitor scrolls, the RIFANO watch turns from
three-quarter to front view while "Be RIFANO." resolves. It should feel realistic, calm and weighty, not like a gimmick.

## Read first
- `tools/scroll-craft/plugins/nateherk-design/skills/scroll-craft/references/feel.md`, `hero-depth.md`, `taste.md`, `verify.md`
  Use them for **art direction and verification only**. Do **not** copy `engine/scrollcraft.js` into the theme. We scrub a WebP frame sequence on a canvas (Shopify can't serve all-keyframe video reliably), and our engine is our own ~150-line module.
- Spec 06 markup (class names are fixed).

## Files
- `theme/sections/home-hero.liquid` (extend), `theme/assets/home-hero.css` (extend), `theme/assets/hero-scrub.js` (new)
- `theme/config/settings_schema.json` (RIFANO group: `hero_scrub_enabled` checkbox default true, `hero_frames_desktop` number default 96, `hero_frames_mobile` number default 72)

## Markup additions
- Inside `.hero__stage`: `<canvas class="hero__canvas" aria-hidden="true"></canvas>` above the poster. The poster stays in the DOM as LCP and fallback.
- A JSON script with frame URLs for both sets, built in Liquid:
  loop `(1..settings.hero_frames_desktop)`, zero-pad to 3 digits (`'00' | append: i | slice: -3, 3`), `'hero-d-' | append: n | append: '.webp' | asset_url`. Same for `hero-m-`.
- `<hero-scrub>` custom element wrapping the section.

## Behaviour
1. **Activation gate**: run the scrub only if `hero_scrub_enabled`, **and** not `prefers-reduced-motion`, **and** not `navigator.connection?.saveData`, **and** not `(navigator.deviceMemory && navigator.deviceMemory < 2)`. Otherwise: keep the spec 06 poster version, hero height 100svh, done.
2. **Runway**: when active, add class `is-scrub` → `.hero { height: 260svh }` (desktop) / `220svh` (<768px); `.hero__sticky { position: sticky; top: header height; height: calc(100svh - header) }`.
3. **Progress**: `p = clamp((scrollY - heroTop) / (heroHeight - viewportHeight), 0, 1)`. Compute in a passive scroll handler that only stores the value; draw in `requestAnimationFrame` only when the frame index changes. Publish `--hero-p` on the section for CSS.
4. **Frame set**: mobile set if `innerWidth < 768`, else desktop. Canvas backing size = CSS size × `min(devicePixelRatio, 2)`. Draw with `object-fit: contain` math, centred. Re-size on `resize` (debounced 150ms).
5. **Loading**: poster first (already eager). After `window.load` + `requestIdleCallback` (fallback `setTimeout 200`), load frames as `Image` + `decode()`, **coarse-to-fine**: every 8th frame, then every 4th, every 2nd, then all. Max 6 concurrent requests. Draw the **nearest loaded** frame, so scrubbing works early and gets smoother. Hide the poster (opacity 0, `--dur-2`) once frame 1 is drawn.
6. **Choreography** (CSS driven by `--hero-p`):
   - p 0 → 0.15: "Be different." fully visible, watch at start frame.
   - p 0.15 → 0.85: rotation (frames). Line 1 fades to 40% opacity.
   - p 0.55 → 0.85: "Be RIFANO." rises 16px and fades in. **This is the peak**: give it the most scroll room and nothing else moving.
   - p 0.85 → 1: watch at front frame, contact shadow tightens (`.hero__floor` scale 1.15 → 1), CTA fades in.
   - No scroll cue arrows, no "scroll down" text (scroll-craft refuse list).
7. **Pause off-screen**: IntersectionObserver stops all work when the hero is out of view.
8. **Errors**: if more than 10% of frames fail to load, fall back to the poster version silently.

## Performance budget
- JS ≤ 6 KB minified, no dependencies. Main-thread work per scroll frame < 4 ms (DevTools Performance check).
- First frame batch (every 8th = 12 frames) ≤ 600 KB desktop.
- LCP stays the poster; CLS 0.

## Verification
- Manual: real phone (Android mid-range if possible) via the `theme dev` URL; desktop Chrome at 1440px.
- If `playwright-core` + Chrome are available (`npm i playwright-core` in `tools/hero-verify/`), write a tiny script that loads the preview URL at 390×844 and 1440×900, scrolls to p = 0, 0.25, 0.5, 0.75, 1, waits 300 ms, and saves screenshots into `tools/hero-verify/out/`. Following scroll-craft's `verify.md`, confirm: no dead scroll inside the runway, "Be RIFANO." reaches full opacity, text contrast ≥ 4.5:1 over the brightest frame behind it. Attach the contact sheet to your reply.

## Acceptance
- [ ] Smooth scrub on desktop and phone; no jank, no blank canvas flashes
- [ ] Reduced motion / save-data → poster version, page height normal
- [ ] Peak moment reads clearly; nothing else animates during it
- [ ] Budgets met; theme check 0 errors

Commit: `feat(14): scroll-scrubbed 3D hero`
