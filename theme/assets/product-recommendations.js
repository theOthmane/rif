/**
 * RIFANO product recommendations — spec 09.
 *
 * The section renders `recommendations.products` on the server, so the row is
 * complete before this file runs and the page is complete without it. What this
 * file adds is the refresh: once the block approaches the viewport it re-fetches
 * the same section through the Section Rendering API (`?section_id=`) and swaps
 * the result in.
 *
 * Two things make that safe. The fetch happens with `rootMargin` ahead of the
 * block, so the row is usually filled before the shopper reaches it and nothing
 * moves under their thumb when they do. And the incoming HTML is parsed and
 * compared before anything is replaced: a response with no recommendations
 * leaves the server-rendered row exactly where it was rather than emptying a
 * shelf that was already full.
 *
 * `document.querySelector` is re-run after each swap rather than cached: the
 * markup that just arrived owns the new nodes.
 *
 * Vanilla, no framework. Loaded as a module.
 */

const REFRESH_MARGIN = '300px 0px';

/* product-card.js runs once, at load, and promotes the hover-swap `data-src` on
   every card that exists at that moment. Cards injected by the refresh below
   arrive after it has already run, so their second image would never be promoted
   and the hover-swap would silently never fire in this row on a pointer that can
   hover. This mirrors product-card.js for the swapped subtree only. */
const HOVER_CAPABLE = '(hover: hover) and (pointer: fine)';

function promoteHoverImages(root) {
  if (!window.matchMedia(HOVER_CAPABLE).matches) return;
  for (const image of root.querySelectorAll('.card__image--alt[data-srcset]')) {
    image.srcset = image.dataset.srcset;
    image.sizes = image.dataset.sizes;
    image.src = image.dataset.src;
    delete image.dataset.srcset;
    delete image.dataset.sizes;
    delete image.dataset.src;
  }
}

for (const block of document.querySelectorAll('[data-recommendations]')) {
  watch(block);
}

function watch(block) {
  if (block.dataset.recommendationsLoaded === 'true') return;
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      // One shot: a shopper who scrolled past and came back gets the row the
      // server already gave them, not a second request.
      observer.disconnect();
      refresh(block);
    },
    { rootMargin: REFRESH_MARGIN }
  );

  observer.observe(block);
}

async function refresh(block) {
  const url = block.dataset.recommendationsUrl;
  if (!url) return;

  block.setAttribute('aria-busy', 'true');

  try {
    const response = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    if (!response.ok) throw new Error(String(response.status));

    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const incoming = parsed.querySelector('[data-recommendations] .recommendations');
    const current = block.querySelector('.recommendations');

    if (!incoming || !current) return;

    block.innerHTML = incoming.outerHTML;
    promoteHoverImages(block);
    block.dataset.recommendationsLoaded = 'true';
  } catch (error) {
    // The server-rendered row is still on screen and still correct; there is
    // nothing to tell the shopper about a refresh they never asked for.
  } finally {
    block.setAttribute('aria-busy', 'false');
  }
}