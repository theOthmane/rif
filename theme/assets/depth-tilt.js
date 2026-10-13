/**
 * RIFANO pointer tilt — spec 20, layer 6.
 *
 * The only JavaScript in the depth system: every scroll layer is a CSS
 * scroll-driven animation that runs off the main thread, and this file only
 * answers the pointer. A card turns up to 4° toward the cursor and its photo
 * lifts toward the viewer; both reset when the pointer leaves.
 *
 * Bound from the document because the collection grid and the search results
 * replace their HTML (spec 08): a card that arrives later is picked up with no
 * rebinding. Fine pointers only, off under reduced motion, so touch never fires
 * a false hover. One rAF per frame, passive listeners.
 */

const FINE = window.matchMedia('(hover: hover) and (pointer: fine)');
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

if (FINE.matches && !REDUCED.matches) {
  const MAX = 4; // degrees, per axis
  let card = null;
  let link = null;
  let frame = 0;
  let px = 0;
  let py = 0;

  // One write per frame: where the pointer is inside the card, mapped to a
  // tilt toward it. rAF-throttled, so a fast pointer never queues more than a
  // frame can paint.
  const apply = () => {
    frame = 0;
    const box = card.getBoundingClientRect();
    const ry = ((px - box.left) / box.width - 0.5) * MAX * 2;
    const rx = ((py - box.top) / box.height - 0.5) * MAX * -2;
    link.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
  };

  const drop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (card) card.classList.remove('is-tilting');
    if (link) link.style.transform = '';
    card = null;
    link = null;
  };

  document.addEventListener(
    'pointermove',
    (event) => {
      const next = event.target.closest ? event.target.closest('[data-depth-tilt]') : null;
      if (next !== card) {
        drop();
        if (next) {
          card = next;
          link = next.querySelector('.card__link');
          if (link) card.classList.add('is-tilting');
        }
      }
      if (!card || !link) return;
      px = event.clientX;
      py = event.clientY;
      if (!frame) frame = requestAnimationFrame(apply);
    },
    { passive: true }
  );

  // The pointer can leave without another move event (out of the window), and
  // the page can scroll the card out from under a stationary pointer.
  document.documentElement.addEventListener('pointerleave', drop, { passive: true });
  document.addEventListener(
    'scroll',
    () => {
      if (!card) return;
      const box = card.getBoundingClientRect();
      if (px < box.left || px > box.right || py < box.top || py > box.bottom) drop();
      else if (!frame) frame = requestAnimationFrame(apply);
    },
    { passive: true }
  );
}
