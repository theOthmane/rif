# Spec 06 — Home intro: tagline + hero (poster version)

## Goal
The top of the home page from the sketch: **"Be different / Be RIFANO"** over a watch stage.
This spec ships a **static, still-premium poster version**. Spec 14 later swaps in the scroll-scrubbed canvas
**inside the same markup**, so build the structure now as described.

## Files
- `theme/blocks/home-hero.liquid` (new), `theme/assets/home-hero.css` (new)
- `theme/templates/index.liquid`, `theme/locales/fr.default.json`
- `theme/config/settings_schema.json` (add `hero_poster` image_picker to the RIFANO group)

## Before coding
Run `/impeccable shape home hero` with this brief and follow its output where it does not contradict this spec:
"Luxury watch hero, near-black stage, one watch lit like a studio product shot, two-line serif tagline, subtle motion only, mobile first."

## Structure (keep these class names; spec 14 depends on them)
```html
<section class="hero" data-hero>
  <div class="hero__sticky">
    <h1 class="hero__title t-display">
      <span class="hero__line">Be different.</span>
      <span class="hero__line hero__line--accent">Be RIFANO.</span>
    </h1>
    <div class="hero__stage">
      <img class="hero__poster" …>          <!-- spec 14 adds <canvas class="hero__canvas"> here -->
      <div class="hero__floor"></div>       <!-- soft reflection / contact shadow -->
    </div>
    <p class="hero__cta"><a class="btn" href="(Boutique)">Découvrir la collection</a></p>
  </div>
</section>
```
(Strings via translation keys. This is the page's only `<h1>`. Remove the visually-hidden h1 from spec 01.)

## Requirements
- Height: `min-height: 100svh` minus header. Spec 14 will make `.hero` taller (scroll runway) and `.hero__sticky` sticky. For now `.hero` = one screen.
- Tagline: Bodoni Moda, `--fs-3xl`, centred, line 2 in italic with the silver gradient text (allowed: brand moment). Max 2 lines at 375px, no hyphenation.
- Poster: `settings.hero_poster` if set, else an elegant placeholder: a centred radial "spotlight" (`radial-gradient` from `--c-surface-2` to `--c-bg`) with a thin silver circle outline suggesting a watch dial. **Never** load files from `brand/watches/`.
  When set: `image_url: width: 1600`, `srcset` 800/1200/1600, `fetchpriority="high"`, `loading="eager"`, `object-fit: contain`, max-height 62svh.
- Floor: an ellipse `radial-gradient` contact shadow under the watch for depth.
- Entrance motion (once, on load): lines fade/translate 12px up, staggered 80ms, `--dur-3`. Watch fades in with 0.98→1 scale. Nothing loops. Reduced motion: no animation.
- Pointer parallax (desktop, `pointer: fine` only): the stage tilts max 3deg toward the cursor via CSS variables set by a ≤30-line script in `home-hero.js` (`requestAnimationFrame`, passive listeners). Optional: skip it if it looks cheap.
- CTA "Découvrir la collection" → `routes.collections_url`.

## Acceptance
- [ ] 375×667: tagline, watch area and CTA all visible without scrolling
- [ ] LCP element is the poster image (or the h1 when no poster); no CLS
- [ ] Reduced motion → completely static
- [ ] No third-party watch images anywhere in `theme/`
- [ ] theme check 0 errors

Commit: `feat(06): home hero poster + tagline`
