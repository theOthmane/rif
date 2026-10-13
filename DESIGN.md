# DESIGN.md — RIFANO visual system

Source of truth for tokens: `theme/assets/tokens.css`. This file describes
them; edit values only in `tokens.css`.

## Direction — what "the 1%" looks like here

RIFANO sells to "the ambitious one on his way to the 1%". The site has to feel
like it belongs to someone already there — never loud, never eager, never
selling. Premium is not a colour or a bevel; it is what is *withheld*.

Five levers, in priority order. When two of them disagree, the earlier wins.

1. **Restraint.** Every screen must survive the question "what can I remove
   without losing anything a buyer needs?". If the answer is "nothing", the
   screen is not restrained yet. The shell is three marks on one line and a
   thin band at the bottom; that is the standard the rest of the theme is
   measured against.
2. **Space.** Air is the cheapest prestige signal and the hardest to fake.
   Sections get more air above them than below them. Bands inside a region
   share one rhythm with a single deliberate pause at the one moment that
   matters (the RF lockup in the footer). Never pack, never justify to fill.
3. **Precise type.** Tenor Sans does the speaking, Hanken Grotesk does the work.
   Optical alignment matters more than alignment: glyph edges, label baselines
   and the cart count all sit on the same axis as the body text, so the page
   reads as one ruled object.
4. **Few words.** The shell says almost nothing. "Be different. Be RIFANO." is
   two lines. A promise is one sentence. If a line is doing two jobs, it is
   too long.
5. **One accent.** Brushed silver is the only accent, it is rare, and it is
   earned. Two silver moments in a viewport is already a lot. Everything else
   is black, hairline and grey text.

**Tone check before shipping.** Simple, prestige, premium, trusted. Realistic
3D, subtle animation, subtle scroll. Nothing flashy, nothing that loops.

**What "trusted" means concretely**, because it is the easiest one to lose by
accident: the promise the store actually makes — cash on delivery, free
delivery everywhere in Morocco — is never truncated, never shrunk into
micro-type, never covered by an effect, and never restated so often it reads as
a template. Show it clearly once or twice. Three times is boilerplate.

## Tokens and roles

### Colour

- `--c-bg: #000000` — pure-black page ground; header, announcement bar and
  footer share it and are separated by 1px hairlines, not grey bands.
- `--c-surface: #080808` — void essence for cards, drawers and dialogs (1.05:1
  against `--c-bg`); separation is the border, not the fill.
- `--c-surface-2: #0d0d0d` — the next barely raised, neutral step for inputs and
  hover states (1.08:1 against `--c-bg`).
- `--c-line: #2a2a2a` — neutral dark-grey decorative 1px hairlines and dividers only (1.46:1 on
  `--c-bg`; not a text-contrast token).
- `--c-line-strong: #666666` — neutral component boundaries (input borders, ghost
  buttons). Kept ≥ 3:1 against `--c-bg`, `--c-surface` and `--c-surface-2`
  for WCAG 1.4.11. Never use `--c-line` for a border a user must see to
  identify a control.
- `--c-text: #ecebe8` — primary text (warm-neutral). 17.62:1 on `--c-bg` and
  16.80:1 on `--c-surface` (WCAG AA on both).
- `--c-text-2: #a7a9ae` — secondary text. 8.93:1 on `--c-bg` and 8.52:1 on
  `--c-surface` (WCAG AA on both).
- `--c-silver-1: #e7e9ec`, `--c-silver-2: #b9bdc3`, `--c-silver-3: #7f848b`.
- `--c-silver` — brushed-silver gradient built from the three silvers.
- `--c-accent: var(--c-silver-2)` — focus rings, active states.
- `--c-danger: #e0796b`, `--c-success: #8fc5a0` — form/system feedback only.

### Type

- `--font-display: "Tenor Sans", "Optima", "Gill Sans", system-ui, sans-serif` — display only.
- `--font-body: "Hanken Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif` — everything else.
- Scale: `--fs-xs 0.75rem`, `--fs-sm 0.875rem`, `--fs-md 1rem`,
  `--fs-lg 1.125rem`, `--fs-xl` / `--fs-2xl` / `--fs-3xl` fluid clamps.
  `--fs-3xl` is reserved for the hero tagline.
- Leading: `--lh-tight 1.05` (display), `--lh-snug 1.25`, `--lh-body 1.6`.
- Tracking: `--tracking-label 0.14em` (uppercase body-font labels),
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
- `--hairline: 1px solid var(--c-line)` — **the separator.** Header, announcement
  bar, menu drawer and footer share the page black and are divided by this one
  line. Never a grey band, never a shadow, never a fill step standing in for a
  border. One token so the shell cannot drift apart.
- `--shadow-lift` — single restrained lift shadow.
- `--ease-out: cubic-bezier(0.2, 0.7, 0.2, 1)`;
  `--dur-1 160ms`, `--dur-2 280ms`, `--dur-3 600ms`.
- `--z-header 50`, `--z-drawer 100`, `--z-toast 150`.

## Type pairing and usage rules

- **Tenor Sans (display):** hero tagline, page titles, section/row titles, prices,
  the RIFANO wordmark (uppercase, tracking `0.32em`). Sizes ≥ `--fs-lg` only,
  weight 400 only — Tenor ships one weight and no italic, so every display rule
  carries `font-synthesis: none` and no display text is ever italic.
  Helpers: `.t-display` (Tenor, `--tracking-display`, `--lh-snug`).
- **Hanken Grotesk (body):** everything else: body 400, UI and buttons 500,
  labels 500 uppercase with `--tracking-label`.
  Helpers: `.t-body`, `.t-muted`, `.t-label` (Hanken 500, `--fs-xs`,
  uppercase, `--tracking-label`, `--c-text-2`).
- **`.t-label` is for labels, not for sentences.** Column headings ("Boutique",
  "Aide"), eyebrow-style field names: yes. A promise the store makes — the COD
  and free-delivery line in the announcement bar — is a
  sentence and is set in sentence case at `--fs-sm` in `--c-text-2`. Micro-type
  makes the most trust-critical line on the site read like shipping boilerplate.
- Line-height on display: `--lh-tight` closes up on Tenor, so `--lh-snug` is the
  default and only the hero at `--fs-3xl` tightens to `1.1`.
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

**Counts and states are numerals, never silver fills.** A cart badge in a
filled silver pill makes the cart the brightest object on the page and pulls the
eye off the monogram — that is badge spam, an explicit anti-reference. Render
counts as `--c-text` numerals positioned beside the glyph. Reserve silver fills
for `.btn` and nothing else.

## Motion principles

Subtle, ease-out, ≤ 600ms, no bounce. `prefers-reduced-motion: reduce` zeroes
all durations (`--dur-1/2/3: 0ms`). The 3D hero (specs 13–14) scrubs; on
reduced-motion or save-data it shows the poster.

Four rules on top of that:

1. **Subtle.** If a flourish needs attention to be noticed, it does not ship.
   Nothing loops. Nothing pulses. Nothing announces itself. Motion is
   information — where you are, what changed, what opened — and never
   entertainment. Subtlety bans attention-seeking effects, not depth: the
   stacked planes below are quiet by construction — transform and opacity only,
   no bounce, no loop, and nothing that exists only under the pointer.
2. **Realistic.** Things move the way the physical thing would. A drawer slides,
   a panel eases, an object settles. No springs, no overshoot, no elastic
   easing, no scale-and-bounce entrances.
3. **Scroll-linked, never scroll-driven decoration.** Scroll may reveal
   (the hairline arriving under the header, the hero scrubbing). It may not
   re-trigger an entrance every time a section re-enters the viewport. A
   section that animates in once and then resets when you scroll back up reads
   as a template.
4. **One conductor, many tempos.** The hero is the slow anchor and sets the
   page's pace. Secondary depth layers are allowed — a page may carry several,
   each scrubbed by its own scroll range at its own speed — but every layer
   comes from the tempo map below, and only the hero is authored. Layering is
   depth, not decoration: scroll-linked, transform/opacity only, reversible,
   and nothing re-triggers when a section re-enters the viewport.

**The tempo map.** Speeds are relative to the scroll. Each layer is built in
`assets/depth.css` from `tokens.css`, and a moving line reaches its final
position before it crosses the middle of the viewport. Nothing that is not in
this table moves.

| # | Layer | Tempo | Motion |
|---|---|---|---|
| 1 | Hero watch | slowest, weighty | scrubbed frame sequence (spec 18), unchanged |
| 2 | Hero → rows handoff | slow | first row track rises `--s-8` + `rotateX(8deg)` to flat |
| 3 | Row titles + icons | slow | title drifts `--s-6` → 0; icon turns into place a beat ahead |
| 4 | Cards in a row | medium, staggered | cards rise on lagged ranges, arriving like a wave |
| 5 | Row track | fast, follows the finger | cards turn ±6° (±4° on mobile) from their place in the track |
| 6 | Card pointer tilt | instant | ≤ 4° toward the cursor + a photo lift; fine pointers only |
| 7 | "Plus" reveal | medium, one-shot | revealed rows unfold `rotateX(12deg)` → 0 on the click |
| 8 | Product gallery | slow | main photo settles from `scale(1.04)` + `--s-5`; the info column is still |
| 9 | Footer monogram | slowest, the closing beat | monogram turns to front view as the footer enters |

**Reduced motion is not a downgrade.** Under `prefers-reduced-motion` the page
must still read completely: the hero shows its poster, accordions still open,
the drawer still slides (instantly), and no information is only ever delivered
by movement.

**Hover is a gentle brightness shift** on `--dur-1`, never a plate. A grey
square behind a small glyph is louder on near-black than the glyph itself.

## Do / Don't

**Do**

- Let a section breathe: more space above a heading than below it.
- Align glyph edges, label baselines and text edges to the same gutter axis.
- Say one thing per surface, in one sentence, at a readable size.
- Separate regions with `--hairline` on a shared `--c-bg`.
- Let silver appear once, in one place, with a reason.
- Earn the accent on hover with colour, not with a background plate.
- Design at 375px first, then add at 768px and 1200px.

**Don't**

- Don't grey-band a region. One black, one hairline.
- Don't blur or fade the chrome. Translucency makes the monogram's silver
  composite over moving content, so the brand's rarest asset changes brightness
  on scroll.
- Don't fill a badge, a pill or a chip with silver to make it noticeable.
- Don't set a sentence in `.t-label` micro-type. Uppercase 0.14em-tracked 12px
  is for labels ("Boutique", "Aide"), not for a promise.
- Don't truncate a promise. Wrapping to a second line is always better than an
  ellipsis on the thing that builds trust.
- Don't let a layout change axis between breakpoints — a rule that exists at
  375px and vanishes at 768px is an accident, not restraint.
- Don't repeat the same claim in three places. Twice is confidence.
- Don't add a badge, a claim, a testimonial or a statistic to fill space.
- Don't animate something on every scroll pass.

## Imagery

Product on near-black (`--c-bg`), contained (never cropped watches),
no lifestyle stock, no third-party brand marks. `brand/watches/*.png` are
reference only and never ship in `theme/assets/`.

## Component list

Announcement bar · header (☰ · RF · cart) · menu drawer with search ·
footer · product card · home intro ("Be different / Be RIFANO" + hero) ·
home category rows + "Plus" · collection page · Boutique (all collections) ·
product page (gallery, variants, ATC, trust badges, WhatsApp, sticky ATC,
recommendations) · cart drawer + cart page · content pages (Contact & SAV,
Notre mission, FAQ, default page) · system pages (search, 404, password
"Bientôt", policies, gift card) · canvas frame-sequence hero.

## Brand commitments are intentional

Pure black `#000000` + void essence `#080808` + brushed silver, Tenor Sans +
Hanken Grotesk, prestige/restraint tone, subtle motion. Header, bars and footer share
the page black and are separated by 1px hairlines rather than grey bands. Per
PRODUCT.md "Brand Commitments": these are deliberate brand decisions, never
anti-patterns to be "corrected" by later design work.
Priority on conflict: PRODUCT.md > DESIGN.md > Impeccable > scroll-craft >
taste-skill.

**The shell is the reference implementation.** When a later spec is unsure how
much air something needs or whether a flourish is allowed, open
`assets/header.css` and `assets/footer.css` and match them. Those files are
the brief made into CSS: one black, one hairline token, one accent, no plates,
no fills that are not buttons.
