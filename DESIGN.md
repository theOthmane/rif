# DESIGN.md — RIFANO visual system

Source of truth for tokens: `theme/assets/tokens.css`. This file describes
them; edit values only in `tokens.css`.

## Tokens and roles

### Colour

- `--c-bg: #0d0e10` — page ground. Tinted near-black, never `#000`.
- `--c-surface: #15161a` — cards, drawers.
- `--c-surface-2: #1d1f24` — hover states, inputs.
- `--c-line: #2a2d33` — decorative 1px hairlines and dividers only.
- `--c-line-strong: #666c75` — component boundaries (input borders, ghost
  buttons). Kept ≥ 3:1 against `--c-bg`, `--c-surface` and `--c-surface-2`
  for WCAG 1.4.11. Never use `--c-line` for a border a user must see to
  identify a control.
- `--c-text: #ecebe8` — primary text (warm-neutral).
- `--c-text-2: #a7a9ae` — secondary text. Tinted, ≥ 4.5:1 on `--c-bg`.
- `--c-silver-1: #e7e9ec`, `--c-silver-2: #b9bdc3`, `--c-silver-3: #7f848b`.
- `--c-silver` — brushed-silver gradient built from the three silvers.
- `--c-accent: var(--c-silver-2)` — focus rings, active states.
- `--c-danger: #e0796b`, `--c-success: #8fc5a0` — form/system feedback only.

### Type

- `--font-display: "Bodoni Moda", "Didot", Georgia, serif` — display only.
- `--font-body: "Manrope", system-ui, sans-serif` — everything else.
- Scale: `--fs-xs 0.75rem`, `--fs-sm 0.875rem`, `--fs-md 1rem`,
  `--fs-lg 1.125rem`, `--fs-xl` / `--fs-2xl` / `--fs-3xl` fluid clamps.
  `--fs-3xl` is reserved for the hero tagline.
- Leading: `--lh-tight 1.05` (display), `--lh-snug 1.25`, `--lh-body 1.6`.
- Tracking: `--tracking-label 0.14em` (uppercase Manrope labels),
  `--tracking-display -0.01em`.

### Space

4px base. `--s-1` … `--s-9` (0.25rem … 6rem).
`--section-y` (fluid section rhythm), `--gutter` (fluid page gutter),
`--page-max: 90rem` (merchant-overridable via `max_page_width` /
`min_page_margin` settings, mapped onto `--page-max` / `--gutter` only if set;
`css-variables.liquid` must render **after** `tokens.css` so the override wins).

Component sizes are not spacing tokens and live in their own block:
`--card-min: 15rem` (product / search grid track), `--card-min-compact: 10rem`,
`--card-min-full: 17.5rem` (collections grid).

### Shape, depth, motion, layers

- `--radius-sm 2px`, `--radius-md 4px`, `--radius-pill 999px`.
- `--shadow-lift` — single restrained lift shadow.
- `--ease-out: cubic-bezier(0.2, 0.7, 0.2, 1)`;
  `--dur-1 160ms`, `--dur-2 280ms`, `--dur-3 600ms`.
- `--z-header 50`, `--z-drawer 100`, `--z-toast 150`.

## Type pairing and usage rules

- **Bodoni Moda only for display ≥ `--fs-xl` and for prices.**
  Helpers: `.t-display` (Bodoni, `--tracking-display`, `--lh-tight`).
- **Manrope for everything else**: body, labels, buttons, inputs, navigation.
  Helpers: `.t-body`, `.t-muted`, `.t-label` (Manrope 500, `--fs-xs`,
  uppercase, `--tracking-label`, `--c-text-2`).
- Tagline "Be different. Be RIFANO." stays English by brand choice.
  Storefront voice is otherwise French; Darija only as seasoning
  (e.g. "Mrehba bik"), never for policy or price.

## The silver rule

The `--c-silver` gradient is used **only** for:

1. primary buttons (`.btn`),
2. the RF monogram,
3. 1px accent hairlines.

Never for large fills, surfaces, or body text. Text on silver is always
`--c-bg`. Ghost buttons use a 1px `--c-line` border with `--c-text`.

## Motion rules

Subtle, ease-out, ≤ 600ms, no bounce. Hover = gentle brightness shift over
`--dur-1`. `prefers-reduced-motion: reduce` zeroes all durations
(`--dur-1/2/3: 0ms`). The 3D hero (specs 13–14) scrubs; on reduced-motion or
save-data it shows the poster.

## Imagery

Product on near-black (`--c-bg`), contained (never cropped watches),
no lifestyle stock, no third-party brand marks. `brand/watches/*.png` are
reference only and never ship in `theme/assets/`.

## Component list (from PLAN.md)

Announcement bar · header (☰ · RF · cart) · menu drawer with search ·
footer · product card · home intro ("Be different / Be RIFANO" + hero) ·
home category rows + "Plus" · collection page · Boutique (all collections) ·
product page (gallery, variants, ATC, trust badges, WhatsApp, sticky ATC,
recommendations) · cart drawer + cart page · content pages (Contact & SAV,
Notre mission, FAQ, default page) · system pages (search, 404, password
"Bientôt", policies, gift card) · canvas frame-sequence hero.

## Brand commitments are intentional

Tinted near-black (never `#000`), Bodoni Moda + Manrope, prestige/restraint
tone, subtle motion. Per PRODUCT.md "Brand Commitments": these are deliberate
brand decisions, never anti-patterns to be "corrected" by later design work.
Priority on conflict: PRODUCT.md > DESIGN.md > Impeccable > scroll-craft >
taste-skill.
