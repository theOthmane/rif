# Spec 18 — Hero: readable "Be RIFANO." + smooth scrub

## Goal
Fix the two problems the owner found in spec 14:
1. **"Be RIFANO." can't be read.** Line 2 is opacity 0 until p 0.55 and only fully visible from p 0.85, so it gets ~15% of the runway (≈ 3–4 mouse-wheel notches). A normal scroll skips past it.
2. **The scrub feels laggy.** One wheel notch (~100px) jumps ~15 frames at once and nothing interpolates, so the watch moves in steps. Touch flings have the same problem.

This spec retunes and smooths the existing hero. It does **not** add new effects. Site-wide depth is spec 20.

## Read first
- `theme/assets/hero-scrub.js`, `theme/assets/home-hero.css`, `theme/sections/home-hero.liquid` (contract: class names stay)
- scroll-craft `references/feel.md` §2 "The peak" and §5 "Pacing", plus `references/verify.md`
  (path: `tools/scroll-craft/plugins/nateherk-design/skills/scroll-craft/`). Use them for direction and verification only. Do not copy `engine/`.
- `/impeccable animate` on the hero once it's built (critique only; brand commitments are intentional).

## Files
- `theme/assets/hero-scrub.js` (edit)
- `theme/assets/home-hero.css` (edit)
- Nothing else. `home-hero.liquid` stays as is unless a measurement proves it must change (stop and explain first).

## 1. Smoothed playhead (the lag fix)
- Keep the passive scroll handler storing **raw** progress `p`.
- Add a **smoothed** progress `s` that chases `p` in rAF with frame-rate-independent easing:
  `s += (p - s) * (1 - Math.exp(-dt / tau))`, `dt` from rAF timestamps (clamp `dt` ≤ 64 ms).
  `tau` = **140 ms** for `(pointer: fine)`, **90 ms** for `(pointer: coarse)` (touch momentum is already smooth; don't make it feel disconnected).
- **Both** the frame index and `--hero-p` come from `s`, so text and watch stay in sync.
- The rAF loop runs only while `|p - s| > 0.0005`. Then it snaps `s = p`, does a final paint and **stops**. Zero rAF callbacks at idle. Nothing loops.
- **Sub-frame blending:** with `f = t * (N - 1)`, draw frame `floor(f)`. If frame `ceil(f)` is decoded and `0.05 < frac < 0.95`, draw it on top with `globalAlpha = frac` (reset alpha after). If not decoded, draw nearest as today.
- Do **not** convert frames to `ImageBitmap` (96 × 1280×720×4 ≈ 350 MB). Keep decoded `Image`s.
- Keep everything else: coarse-to-fine queue, ≤ 6 concurrent decodes, IO pause off-screen, resize logic, abort at > 10% failures, CTA gating.

## 2. New choreography (the readability fix)
Runway unchanged: 260svh desktop / 220svh mobile. All values are on smoothed `--hero-p`.

| p | Watch | "Be different." | "Be RIFANO." | Floor / CTA |
|---|---|---|---|---|
| 0 → 0.05 | start frame, holds | 1 | 0 | — |
| 0.05 → 0.60 | full rotation | 1 until 0.30, then → **0.6** by 0.50 | rises 16px + fades in **0.30 → 0.50** | — |
| 0.60 → 0.75 | front frame, holds | 0.6 | **1** | floor 1.15 → 1 |
| 0.75 → 1 | holds | 0.6 | **1** | CTA fades in 0.75 → 0.90; clickable (`is-live`) at p ≥ 0.90 |

- "Be RIFANO." is fully readable for **p 0.50 → 1** (half the runway, ≈ 80svh of travel on desktop, ≈ 6–8 wheel notches). That window is the peak. The watch is parked and only the floor and CTA arrive in it.
- Line 1 never drops below 0.6, so both lines read as one tagline.
- Update the choreography comment block in `home-hero.css` and the `target()` comment in `hero-scrub.js` to match. Remove the spec 14 "deviation" wording that no longer applies.

## Budgets (unchanged or tighter)
- `hero-scrub.js` ≤ 6 KB minified.
- Paint callback p95 < 4 ms **including** the blend draw (600-step sweep, 1440×900 and 390×844).
- LCP still the poster; CLS 0; overflow 0; first frame batch ≤ 600 KB desktop.

## Verification (Gate C)
Use agent-browser / playwright on the preview URL at 1440×900 and 390×844:
- **Wheel test (desktop):** patch `CanvasRenderingContext2D.prototype.drawImage` from the test script to log `(timestamp, src)` per call. Fire `mouse.wheel(0, 100)` 12 times, 50 ms apart. Report the **max frame-index step between consecutive paints**: target **≤ 2** (spec 14 measures ~15; report both).
- **Touch test (mobile):** a CDP touch fling over the runway. Same metric, target ≤ 3.
- **Idle:** 1 s after the last input, count rAF callbacks from the hero → must be **0**.
- **Settle:** after the last wheel notch, the playhead reaches `p` within **≤ 500 ms**.
- **Readability:** screenshots at p = 0.25, 0.5, 0.75, 1 → `tools/shots/18-hero-p{25,50,75,100}-{390,1440}.png`. At p ≥ 0.5, "Be RIFANO." computed opacity ≥ 0.95 and contrast ≥ 4.5:1 over what's behind it.
- Reduced motion / save-data / no-JS: still the poster version at normal height (re-shoot one each).
- Contact sheet `tools/shots/18-contact.png`.

## Acceptance
- [ ] Max frame step per paint ≤ 2 (wheel) / ≤ 3 (touch), with before/after numbers
- [ ] 0 rAF callbacks at idle; settles ≤ 500 ms
- [ ] "Be RIFANO." opacity ≥ 0.95 for p 0.50 → 1 (screenshots)
- [ ] Budgets met; Gate A/B/C pass
- [ ] Real-phone check listed as an owner to-do (headless can't reproduce mobile decoders)

Commit: `feat(18): readable tagline + smoothed hero scrub`
