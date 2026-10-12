/**
 * RIFANO product gallery — spec 09.
 *
 * Three behaviours, all progressive: the strip, the dots and the photos render
 * and work with JS off (the strip is native scrolling, the photos are links to
 * nothing without this module), so this file only adds what markup cannot.
 *
 * 1. The active dot follows the photo the IntersectionObserver reports as most
 *    visible. Reading scroll position directly was wrong on a strip of square
 *    slides: the observer reports the one the shopper is actually looking at,
 *    including while a programmatic scroll is still settling.
 * 2. A dot scrolls its photo to the snap position, because a dot is a promise
 *    about position and native `scrollIntoView` is the one that keeps the strip
 *    in a valid snap state.
 * 3. A photo opens the native <dialog> viewer at the same index, which is its
 *    own scroll-snap strip: swiping between photos and the browser's own pinch
 *    zoom both work without this file. Esc and the backdrop close it, and focus
 *    returns to the photo that opened it.
 *
 * `product-form.js` tells the gallery to follow a variant: it dispatches
 * `product:variant` on `document` and the gallery scrolls to that variant's
 * `featured_media`. Nothing here knows about prices or the cart.
 *
 * Vanilla, no framework. Loaded as a module, so the document is already parsed
 * when this runs.
 */

const STRIP_SLIDE = '.product-gallery__slide';
const BEHAVIOUR = '(prefers-reduced-motion: reduce)';

for (const gallery of document.querySelectorAll('[data-product-gallery]')) {
  const track = gallery.querySelector('[data-gallery-track]');
  if (!track) continue;
  initStrip(gallery, track);
  initViewer(gallery);
}

/**
 * Dots: one observer over the slides, and the dot for whichever slide reports
 * the most intersection. `rootMargin` shrinks the root by half a slide so a
 * photo only counts as "the one" once it owns the middle of the viewport, which
 * is what the dot under it is claiming.
 */
function initStrip(gallery, track) {
  const dots = Array.from(gallery.querySelectorAll('[data-gallery-dot]'));
  const slides = Array.from(track.querySelectorAll(STRIP_SLIDE));

  const activate = (index) => {
    dots.forEach((dot, i) => dot.setAttribute('aria-current', i === index ? 'true' : 'false'));
  };

  if (dots.length > 0 && slides.length > 0 && 'IntersectionObserver' in window) {
    const ratios = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best = null;
        let bestRatio = 0;
        for (const slide of slides) {
          const ratio = ratios.get(slide) || 0;
          if (ratio > bestRatio) {
            best = slide;
            bestRatio = ratio;
          }
        }
        // A strip that is off screen entirely reports no intersections at all;
        // the previous dot stays, which is more honest than snapping to the
        // first photo every time the block scrolls out and back.
        if (best) activate(slides.indexOf(best));
      },
      { root: track, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    for (const slide of slides) observer.observe(slide);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      const slide = slides[index];
      if (!slide) return;
      slide.scrollIntoView({
        behavior: matchMedia(BEHAVIOUR).matches ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    });
  });

  /**
   * Follow a variant: scroll to the photo that variant ships with. A variant
   * with no `featured_media` inherits the product's first photo, so there is
   * nothing to move and the strip stays where the shopper left it.
   */
  gallery.addEventListener('product:variant', (event) => {
    const mediaId = event.detail && event.detail.featured_media;
    if (!mediaId) return;
    const slide = track.querySelector(`[data-media-id="${mediaId}"]`);
    if (!slide) return;
    slide.scrollIntoView({
      behavior: matchMedia(BEHAVIOUR).matches ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  });
}

/**
 * The viewer. `scrollIntoView` inside a `showModal()` dialog scrolls the dialog
 * itself, so the strip is moved with `scrollLeft` directly — that also keeps the
 * counter correct before the smooth scroll settles.
 */
function initViewer(gallery) {
  const viewer = gallery.querySelector('[data-gallery-viewer]');
  const viewerTrack = viewer && viewer.querySelector('[data-viewer-track]');
  const counter = viewer && viewer.querySelector('[data-viewer-count]');
  const slides = viewerTrack ? Array.from(viewerTrack.children) : [];
  const zoomButtons = Array.from(gallery.querySelectorAll('[data-gallery-zoom]'));
  if (!viewer || !viewerTrack || slides.length === 0) return;

  let opener = null;

  const setCounter = (index) => {
    if (!counter || index < 0) return;
    const text = counter.dataset.template || '';
    counter.textContent = text
      .replace('{index}', String(index + 1))
      .replace('{total}', String(slides.length));
  };

  const goTo = (index) => {
    const slide = slides[index];
    if (!slide) return;
    viewerTrack.scrollTo({
      left: slide.offsetLeft - viewerTrack.offsetLeft,
      behavior: 'auto',
    });
    setCounter(index);
  };

  zoomButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      opener = button;
      goTo(index);
      viewer.showModal();
      document.documentElement.style.overflow = 'hidden';
      const close = viewer.querySelector('[data-viewer-close]');
      if (close) close.focus();
    });
  });

  // The counter follows the swipe: the snap point nearest the strip's left edge
  // is the photo the shopper is looking at, which is exactly what a snap
  // position means.
  let frame = 0;
  viewerTrack.addEventListener(
    'scroll',
    () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const left = viewerTrack.getBoundingClientRect().left;
        let nearest = 0;
        let bestDistance = Infinity;
        slides.forEach((slide, index) => {
          const distance = Math.abs(slide.getBoundingClientRect().left - left);
          if (distance < bestDistance) {
            bestDistance = distance;
            nearest = index;
          }
        });
        setCounter(nearest);
      });
    },
    { passive: true }
  );

  const closeButton = viewer.querySelector('[data-viewer-close]');
  if (closeButton) {
    closeButton.addEventListener('click', () => viewer.close());
  }

  viewer.addEventListener('click', (event) => {
    if (event.target === viewer) viewer.close();
  });

  viewer.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    if (opener) {
      const node = opener;
      opener = null;
      node.focus();
    }
  });
}