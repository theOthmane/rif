/**
 * RIFANO home category rows — spec 07.
 *
 * Three behaviours, all progressive: the section renders complete with JS off
 * (rows visible, "Plus" a plain control), so this file only adds what markup
 * cannot.
 *
 * 1. Rows fade up 16px once, at 15% visible. Never bound under reduced motion.
 * 2. On a fine pointer, prev/next arrows scroll a track by one viewport of
 *    cards and disable themselves at the ends.
 * 3. "Plus" unhides the rows past the visible count, moves focus to the first
 *    revealed row's title and removes itself.
 */

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const REVEAL_CLASS = 'row--reveal';

const reduced = () => matchMedia(REDUCED_MOTION).matches;

for (const group of document.querySelectorAll('[data-home-rows]')) {
  reveal(group);
  arrows(group);
  plus(group);
}

/** Fade-up entrance, once per row, when 15% of it is on screen. A row hidden
    behind "Plus" has not intersected yet, so the observer is still watching it
    when the button reveals it and the same animation plays. */
function reveal(group) {
  if (reduced() || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add(REVEAL_CLASS);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.15 }
  );

  for (const row of group.querySelectorAll('.row')) observer.observe(row);
}

/** Arrows: one viewport of cards per press, smooth unless reduced motion, with
    the end state read back from the track itself. */
function arrows(group) {
  for (const row of group.querySelectorAll('.row')) {
    const track = row.querySelector('[data-row-track]');
    const prev = row.querySelector('[data-row-prev]');
    const next = row.querySelector('[data-row-next]');
    if (!track || !prev || !next) continue;

    let frame = 0;
    const update = () => {
      frame = 0;
      const max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft < 1;
      next.disabled = track.scrollLeft > max - 1;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    track.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    // Images landing late can widen the scrollable area, so re-measure once
    // per image.
    for (const image of track.querySelectorAll('img')) {
      image.addEventListener('load', schedule, { once: true });
    }

    const behaviour = () => (reduced() ? 'auto' : 'smooth');
    prev.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth, behavior: behaviour() }));
    next.addEventListener('click', () => track.scrollBy({ left: track.clientWidth, behavior: behaviour() }));

    update();
  }
}

/** "Plus": reveal, focus, disappear. */
function plus(group) {
  const button = group.querySelector('[data-plus-button]');
  if (!button) return;

  button.addEventListener('click', () => {
    const rows = group.querySelectorAll('.row[hidden]');
    for (const row of rows) row.removeAttribute('hidden');
    button.setAttribute('aria-expanded', 'true');

    // Rows already on screen fade up in this frame; the observer takes care of
    // the ones still below the fold.
    if (!reduced()) {
      for (const row of rows) {
        const box = row.getBoundingClientRect();
        if (box.top < innerHeight && box.bottom > 0) row.classList.add(REVEAL_CLASS);
      }
    }

    // The first revealed row's title carries tabindex="-1", so focusing it both
    // moves the reading position and scrolls the new rows into view.
    const title = rows[0] && rows[0].querySelector('.row__title');
    if (title) title.focus();

    button.closest('.rows-plus').remove();
  });
}
