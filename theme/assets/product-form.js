/**
 * RIFANO product page — spec 09.
 *
 * Six behaviours, all progressive. The whole column is a real
 * `{% form 'product' %}`: with JS off it posts to /cart/add and the page is
 * complete. This file only adds what markup cannot.
 *
 * 1. Variants. One array of every variant is read once from a JSON script
 *    tag — id, options, availability, prices already formatted by Liquid, and
 *    the `featured_media` id. A change resolves the selection against it and
 *    updates in one pass: the hidden id, the price, the button, the URL and the
 *    gallery. An option value with no available variant behind it is struck
 *    through and labelled, but stays selectable: a shopper who wants the sold
 *    out size can still see it and ask for it.
 * 2. Add to cart. In `drawer` mode, posts JSON to `routes.cart_add_url + '.js'`.
 *    Before the request goes out, a `cart:before-add` event lets the cart
 *    module (spec 10) add its `sections` bundle to the body, so the response
 *    carries the rendered drawer and header HTML. On success it dispatches
 *    `cart:added` on `document`, carrying the cart, the line and the button
 *    that triggered it. Spec 10 listens for that event, opens the drawer and
 *    calls `preventDefault()`; until then nothing listens, the event stays
 *    uncancelled, and this module falls back to `routes.cart_url` so the
 *    shopper still sees their order. In `page` mode the form is left alone
 *    and posts natively to /cart/add, landing on /cart.
 * 3. The WhatsApp link rewrites itself on variant change. The message lives
 *    once, in French, in the locale file; this module splices the new variant
 *    title into the part the sentinel marks.
 * 4. The sticky add-to-cart bar, below 1024px only, while the real button is
 *    off screen and while no dialog is open. It submits the real form rather
 *    than posting anything of its own.
 * 5. The sticky info column: the chrome's real height is measured and published
 *    as a custom property, and the column stands down when it is taller than
 *    the viewport, because a sticky box taller than the screen pins with its
 *    own bottom cut off.
 *
 * Nothing here hard-codes a route, a price or a French string: all three come
 * from the section, which read them from `routes`, `settings` and the locale
 * file.
 *
 * Vanilla, no framework. Loaded as a module, so the document is already parsed.
 */

const info = document.querySelector('[data-product-info]');

/* The breakpoint the sticky bar and the two-column split share: one string, so
   the bar can never appear in the layout that has already pinned the real
   button beside the gallery. */
const STICKY_BREAKPOINT = '(min-width: 1024px)';

if (info) {
  const state = {
    variants: readVariants(),
    form: info.querySelector('form'),
    idInput: info.querySelector('[data-variant-id]'),
    quantity: info.querySelector('[data-qty-input]'),
    atc: info.querySelector('[data-atc]'),
    atcLabel: info.querySelector('[data-atc-label]'),
    error: info.querySelector('[data-atc-error]'),
    price: info.querySelector('.price'),
    currentPrice: info.querySelector('.price__current'),
    // The sticky bar is a sibling of [data-product-info], not a child: the
    // section renders it after the info column closes, so it is read off the
    // document. One product template means one bar, so this cannot pick up a
    // stranger's node.
    bar: document.querySelector('[data-sticky-atc-bar]'),
    stickyButton: document.querySelector('[data-sticky-atc]'),
    stickyLabel: document.querySelector('[data-sticky-atc-label]'),
    stickyPrice: document.querySelector('[data-sticky-price]'),
    whatsapp: info.querySelector('[data-whatsapp]'),
    fieldsets: Array.from(info.querySelectorAll('[data-option]')),
    cartAddUrl: info.dataset.cartAddUrl,
    cartUrl: info.dataset.cartUrl,
    cartType: info.dataset.cartType,
    pending: false,
  };

  // The variant id only starts being submitted once this module has taken
  // responsibility for it: with the name absent the browser never sends the
  // input, so the <noscript> select is the only variant control without JS.
  if (state.idInput) state.idInput.name = 'id';

  bindQuantity(state);
  bindVariants(state);
  bindAddToCart(state);
  bindStickyBar(state);
  measureChrome(info);
}

function readVariants() {
  const payload = document.querySelector('[data-product-variants]');
  if (!payload) return [];
  try {
    return JSON.parse(payload.textContent) || [];
  } catch (error) {
    // A malformed payload must not take the whole page's JavaScript down with
    // it: the form still posts, the picker still works, nothing is priced live.
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Quantity                                                             */
/* ------------------------------------------------------------------ */

function bindQuantity(state) {
  const { quantity } = state;
  const field = quantity && quantity.closest('[data-qty]');
  if (!field) return;

  const clamp = (value) => {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
  };
  const set = (value) => {
    quantity.value = String(clamp(value));
    sync();
  };

  const down = field.querySelector('[data-qty-down]');
  const up = field.querySelector('[data-qty-up]');

  // Minus is disabled at 1 rather than silently refusing to go lower: the
  // shopper can see why nothing happened.
  function sync() {
    if (down) down.disabled = Number(quantity.value) <= 1;
  }

  if (down) down.addEventListener('click', () => set(Number(quantity.value) - 1));
  if (up) up.addEventListener('click', () => set(Number(quantity.value) + 1));
  quantity.addEventListener('change', () => set(quantity.value));
  quantity.addEventListener('input', sync);

  sync();
}

/* ------------------------------------------------------------------ */
/* Variants                                                             */
/* ------------------------------------------------------------------ */

/** The selection, as an array aligned to `variant.options`. */
function selection(state) {
  return state.fieldsets.map((fieldset) => {
    const checked = fieldset.querySelector('[data-option-input]:checked');
    return checked ? checked.value : '';
  });
}

function findVariant(state, values) {
  return (
    state.variants.find((variant) => variant.options.every((option, i) => option === values[i])) ||
    null
  );
}

function bindVariants(state) {
  if (state.fieldsets.length === 0 || state.variants.length === 0) return;

  for (const fieldset of state.fieldsets) {
    fieldset.addEventListener('change', () => apply(state, true));
  }

  // Paint once on load: a sold-out size has to read as sold-out before anyone
  // touches the picker.
  apply(state, false);
}

function apply(state, push) {
  const values = selection(state);
  const variant = findVariant(state, values);
  if (!variant || !state.idInput) return;

  state.idInput.value = String(variant.id);

  paintPrice(state, variant);
  paintAvailability(state, variant);
  paintCombos(state, values);
  paintWhatsapp(state, variant);

  if (push) {
    const url = new URL(window.location.href);
    url.searchParams.set('variant', String(variant.id));
    window.history.replaceState({ variant: variant.id }, '', url.toString());

    document.dispatchEvent(
      new CustomEvent('product:variant', {
        detail: {
          id: variant.id,
          title: variant.title,
          available: variant.available,
          featured_media: variant.featured_media,
        },
      })
    );
  }
}

function paintPrice(state, variant) {
  if (state.stickyPrice) state.stickyPrice.textContent = variant.price_money;
  if (!state.price || !state.currentPrice) return;

  // The current price is live: the server rendered the first variant's price,
  // and every later selection overwrites it with that variant's own formatted
  // money, so the figure beside the button is never one selection behind.
  state.currentPrice.textContent = variant.price_money;

  // The compare-at price is rendered server-side by the `price` snippet and only
  // exists when it is a real markdown, so it is only touched for a variant that
  // actually has one.
  let compare = state.price.querySelector('.price__compare');
  if (variant.compare_at_money) {
    if (!compare) {
      compare = document.createElement('s');
      compare.className = 'price__compare';
      state.currentPrice.after(compare);
    }
    compare.textContent = variant.compare_at_money;
  } else if (compare) {
    compare.remove();
  }
}

function paintAvailability(state, variant) {
  for (const button of [state.atc, state.stickyButton]) {
    if (button) button.disabled = !variant.available;
  }
  // When nothing can be bought, the WhatsApp link is the only action left, so it
  // takes the primary treatment the dead button gave up. Ghost when the product
  // can be bought, primary when it cannot.
  if (state.whatsapp) state.whatsapp.classList.toggle('btn--ghost', variant.available);
  // Both labels were rendered by Liquid with both of their strings as data
  // attributes, so a state flip never invents a word in a language this module
  // does not speak.
  for (const label of [state.atcLabel, state.stickyLabel]) {
    if (!label) continue;
    label.textContent = variant.available ? label.dataset.add : label.dataset.soldOut;
  }
}

/**
 * Strike through every value that cannot lead to an available variant given the
 * rest of the current selection. Re-derived on every change, so picking a
 * different colour updates which sizes read as sold out.
 */
function paintCombos(state, values) {
  for (const fieldset of state.fieldsets) {
    // `data-option` is the 1-based option position from Liquid; the probe
    // array is 0-based, so the position is shifted down by one.
    const index = Number(fieldset.dataset.option) - 1;
    for (const label of fieldset.querySelectorAll('[data-pill]')) {
      const input = label.querySelector('[data-option-input]');
      const flag = label.querySelector('[data-pill-flag]');
      const probe = values.slice();
      probe[index] = input.value;
      const candidate = findVariant(state, probe);
      const unavailable = !candidate || !candidate.available;

      label.classList.toggle('is-unavailable', unavailable);
      if (flag) flag.hidden = !unavailable;
      // `aria-disabled` rather than `disabled`: the value must stay reachable
      // and readable, because a control a screen reader cannot focus is a
      // control it cannot report either.
      input.setAttribute('aria-disabled', unavailable ? 'true' : 'false');
    }
  }
}

/**
 * The message was rendered once, URL-encoded, with the variant's place marked
 * by a sentinel. Splitting on that sentinel puts the product title and the link
 * exactly where the store's French copy put them, whatever they are.
 */
function paintWhatsapp(state, variant) {
  const link = state.whatsapp;
  const sentinel = link && link.dataset.waSentinel;
  const template = link && link.dataset.waTemplate;
  if (!link || !sentinel || !template) return;

  const parts = decodeURIComponent(template).split(sentinel);
  const message = parts.length > 1 ? parts[0] + variant.title + parts[1] : parts[0];
  link.href = link.dataset.waBase + encodeURIComponent(message);
}

/* ------------------------------------------------------------------ */
/* Add to cart                                                          */
/* ------------------------------------------------------------------ */

function bindAddToCart(state) {
  const { form, atc } = state;
  if (!form || !atc || !state.cartAddUrl) return;

  form.addEventListener('submit', async (event) => {
    // `page` mode keeps the form native: no interception, the browser posts
    // to /cart/add and Shopify lands the shopper on /cart. Only the drawer
    // needs the fetch path.
    if (state.cartType === 'page') return;

    event.preventDefault();
    if (state.pending) return;

    if (state.error) state.error.textContent = '';

    const id = state.idInput ? Number(state.idInput.value) : 0;
    const quantity = state.quantity ? Number(state.quantity.value) || 1 : 1;
    const line = { id, quantity };

    // Captured before the busy state: the drawer hands focus back to this
    // element on close.
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : state.atc;

    // Spec 10's cart module listens here and adds `sections` (drawer,
    // header) to the request, so the add response already carries the
    // rendered HTML the drawer opens with. With no listener the body is
    // untouched and the add behaves exactly as before.
    const request = { items: [line] };
    document.dispatchEvent(new CustomEvent('cart:before-add', { detail: { body: request } }));

    setBusy(state, true);

    try {
      const response = await fetch(state.cartAddUrl + '.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) throw new Error(String(response.status));

      const cart = await response.json();

      // Spec 10 listens here, opens the drawer and cancels the event. A
      // `true` return means nobody handled the add, and the redirect is the
      // only feedback the shopper gets.
      const unhandled = document.dispatchEvent(
        new CustomEvent('cart:added', {
          detail: { cart, item: line, trigger },
          cancelable: true,
        })
      );

      if (unhandled && state.cartUrl) window.location.href = state.cartUrl;
    } catch (error) {
      if (state.error) state.error.textContent = state.error.dataset.message || '';
    } finally {
      setBusy(state, false);
    }
  });

  if (state.stickyButton) {
    state.stickyButton.addEventListener('click', () => {
      if (typeof form.requestSubmit === 'function') form.requestSubmit();
    });
  }
}

function setBusy(state, busy) {
  state.pending = busy;
  for (const button of [state.atc, state.stickyButton]) {
    if (!button) continue;
    button.setAttribute('aria-busy', busy ? 'true' : 'false');
    // `aria-disabled`, not `disabled`, while pending: a disabled button drops
    // focus to <body> for the whole request. The re-entrancy guard
    // (`state.pending` in the submit handler) is what stops a second line
    // being added. `disabled` stays owned by the variant picker, so a
    // sold-out button is never touched here.
    if (busy) button.setAttribute('aria-disabled', 'true');
    else button.removeAttribute('aria-disabled');
  }
}

/* ------------------------------------------------------------------ */
/* Sticky add-to-cart bar                                               */
/* ------------------------------------------------------------------ */

function bindStickyBar(state) {
  const { bar, atc } = state;
  if (!bar || !atc || !('IntersectionObserver' in window)) return;

  const wide = matchMedia(STICKY_BREAKPOINT);
  let buttonOutOfView = false;
  let visible = false;

  const paint = () => {
    // `dialog[open]` rather than this page's own dialog: the bar belongs to the
    // product page and must stand down for the menu drawer as well as the
    // gallery viewer, and for the cart drawer spec 10 will add.
    //
    // Above the breakpoint the bar normally stands down, because the sticky info
    // column keeps the real button on screen. But `measureChrome` stands that
    // column down too when it is taller than the viewport — and at that point the
    // bar is the only buy affordance left, so it takes over. CSS and this gate
    // key off the same `is-tall` class, so the two can never disagree.
    const columnStandsDown = info.classList.contains('is-tall');
    const show =
      (!wide.matches || columnStandsDown) &&
      buttonOutOfView &&
      !document.querySelector('dialog[open]');
    if (show === visible) return;
    visible = show;
    bar.classList.toggle('is-visible', show);
    // The bar is fixed, so without this the last footer links sit under it and
    // cannot be tapped. The space goes on the page, not on the footer, so the
    // footer keeps its own rhythm. The reserve is the bar's real height, so a
    // taller bar (or a wrapped title) can never eat the footer's last row.
    document.body.classList.toggle('has-sticky-atc', show);
    if (show) {
      document.documentElement.style.setProperty(
        '--sticky-atc-h',
        `${bar.offsetHeight}px`
      );
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      // `intersectionRatio`, not `isIntersecting`: the bar appears the moment
      // the real button is mostly behind the bar itself, not once it is
      // entirely gone.
      buttonOutOfView = entries[0].intersectionRatio < 0.6;
      paint();
    },
    { threshold: [0, 0.6] }
  );
  observer.observe(atc);

  wide.addEventListener('change', paint);
  // Dialogs open by markup elsewhere on the page, so the DOM is watched rather
  // than the events — one observer, no knowledge of who owns which dialog.
  new MutationObserver(paint).observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ['open'],
  });

  paint();
}

/* ------------------------------------------------------------------ */
/* Sticky column geometry                                               */
/* ------------------------------------------------------------------ */

/**
 * The chrome's height is a guess in CSS (the announcement bar wraps with the
 * merchant's text), so it is measured and published as a custom property, which
 * is what lets the info column pin exactly below the header instead of under
 * the header's own bottom edge.
 */
function measureChrome(root) {
  const chrome = document.querySelector('.site-chrome');
  const wide = matchMedia(STICKY_BREAKPOINT);

  // The room the column needs at the bottom of the screen for the last thing on
  // it — the warranty link — to be reachable: one --s-8 step, written out
  // because CSS cannot hand a custom property to JS as a number.
  const FLOOR = 64;

  const apply = () => {
    if (chrome) {
      document.documentElement.style.setProperty(
        '--product-chrome-h',
        `${Math.ceil(chrome.getBoundingClientRect().height)}px`
      );
    }

    if (!wide.matches) return;
    const box = root.getBoundingClientRect();
    // Sticky only helps while the column fits on the screen. A column taller
    // than the viewport pins with its own bottom unreachable, which is worse
    // than not pinning at all.
    root.classList.toggle('is-tall', root.scrollHeight > window.innerHeight - box.top - FLOOR);
  };

  apply();
  window.addEventListener('resize', apply);
  window.addEventListener('load', apply, { once: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
}