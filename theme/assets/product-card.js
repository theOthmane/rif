/**
 * RIFANO product card — hover-swap image promotion.
 *
 * The card renders its second product image with `data-src` / `data-srcset` and
 * no `src` attribute. The crossfade that reveals it lives behind
 * `(hover: hover) and (pointer: fine)`, which never matches on a touch device,
 * so an `src` in the markup would mean every phone downloads an image it can
 * never display. This module promotes those attributes — and therefore starts
 * the request — only when the pointer can actually hover.
 *
 * Vanilla, no framework. Loaded as a module, so it runs after the document is
 * parsed and needs no DOMContentLoaded guard.
 */

const HOVER_CAPABLE = '(hover: hover) and (pointer: fine)';

if (window.matchMedia(HOVER_CAPABLE).matches) {
  for (const image of document.querySelectorAll('.card__image--alt[data-srcset]')) {
    image.srcset = image.dataset.srcset;
    image.sizes = image.dataset.sizes;
    image.src = image.dataset.src;

    delete image.dataset.srcset;
    delete image.dataset.sizes;
    delete image.dataset.src;
  }
}
