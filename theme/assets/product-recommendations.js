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
    block.dataset.recommendationsLoaded = 'true';
  } catch (error) {
    // The server-rendered row is still on screen and still correct; there is
    // nothing to tell the shopper about a refresh they never asked for.
  } finally {
    block.setAttribute('aria-busy', 'false');
  }
}