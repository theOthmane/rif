/**
 * RIFANO cart — spec 10.
 *
 * Three custom elements and one small coordinator:
 *
 * - <cart-drawer>: the dialog. Opens from the header cart link or after an
 *   add; the native modal does the inerting and the Esc handling, this file
 *   adds the focus trap, the focus return and the backdrop click.
 * - <cart-items>: one cart region — the drawer's and the page's. Steppers
 *   and remove links inside it go through /cart/change.js.
 * - <quantity-input>: one line's stepper. Button clicks are debounced 300ms
 *   and typed values commit at once; the number updates immediately either
 *   way, so the shopper never waits to see their own click.
 *
 * Every mutation sends `sections` (drawer, header, and the cart page when it
 * is on the page) and `sections_url`, so the Cart API returns the freshly
 * rendered HTML in the same response — no follow-up request. Responses are
 * applied to [data-cart-contents] in every region, plus the header count and
 * the drawer's item count; focus and scroll are restored across the swap.
 *
 * No route is invented: the change URL comes from the section (rendered from
 * routes.cart_change_url), and section ids are read from the rendered DOM,
 * because sections in groups and JSON templates have dynamic ids.
 */

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/* ------------------------------------------------------------------ */
/* Coordinator                                                          */
/* ------------------------------------------------------------------ */

/** line key -> quantity; the last write per line wins, 0 removes. */
const pendingChanges = new Map();
let drainRunning = false;

function requestChange(key, quantity) {
  if (!key) return;
  pendingChanges.set(key, quantity);
  if (!drainRunning) drainChanges();
}

/**
 * One change at a time, in order: a response re-renders the DOM the next
 * change is read from, so letting two overlap would race the two renders.
 * Each entry is resolved against the current DOM by line key, which survives
 * a re-render, unlike the 1-based line index the API wants.
 */
async function drainChanges() {
  drainRunning = true;
  try {
    while (pendingChanges.size > 0) {
      setBusy(true);
      const [key, quantity] = pendingChanges.entries().next().value;
      pendingChanges.delete(key);
      await sendChange(key, quantity);
    }
  } finally {
    drainRunning = false;
    setBusy(false);
  }
}

async function sendChange(key, quantity) {
  const element = findLineElement(key);
  if (!element) return; // the line is already gone; nothing left to change
  const line = Number(element.dataset.cartLine);
  const url = changeUrl();
  if (!line || !url) return;

  const errorRegion = element.querySelector('[data-cart-line-error]');
  if (errorRegion) errorRegion.textContent = '';

  const payload = { line, quantity };
  const ids = sectionIds();
  if (ids.length > 0) {
    payload.sections = ids.join(',');
    payload.sections_url = window.location.pathname;
  }

  let data = null;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    data = await response.json().catch(() => null);
    if (!response.ok) {
      showLineError(key, data);
      return;
    }
  } catch (error) {
    showLineError(key, null);
    return;
  }

  await applyCartData(data);
  announce();
}

/**
 * The API's own message goes inline under the line (spec 10 §3); the
 * region's data-message is the French fallback for a response that carries
 * none. The quantity snaps back to what the server last confirmed, so the
 * control never sits on a number the cart does not have.
 */
function showLineError(key, data) {
  const element = findLineElement(key);
  if (!element) return;

  const region = element.querySelector('[data-cart-line-error]');
  if (region) {
    region.textContent =
      (data && (data.description || data.message)) || region.dataset.message || '';
  }

  for (const quantity of element.querySelectorAll('quantity-input')) {
    if (typeof quantity.reset === 'function') quantity.reset();
  }
}

/* ------------------------------------------------------------------ */
/* Applying a response                                                  */
/* ------------------------------------------------------------------ */

async function applyCartData(data) {
  let sections = data && data.sections ? data.sections : null;
  // The bundle is the normal path; if a response ever arrives without it,
  // one Section Rendering API request fetches the same HTML.
  if (!sections) sections = await fetchSections();

  const focus = captureFocus();
  const scroll = captureScroll();

  for (const items of document.querySelectorAll('cart-items')) {
    const id = sectionIdOf(items);
    const html = id && sections ? sections[id] : null;
    if (!html) continue;
    const fresh = parseSection(html);
    const live = items.querySelector('[data-cart-contents]');
    const next = fresh.querySelector('[data-cart-contents]');
    if (live && next) live.innerHTML = next.innerHTML;
  }

  updateDrawerCount(sections);
  updateHeaderCount(data, sections);

  restoreScroll(scroll);
  restoreFocus(focus);
}

async function fetchSections() {
  const ids = sectionIds();
  if (ids.length === 0) return null;
  try {
    const response = await fetch(`${window.location.pathname}?sections=${ids.join(',')}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}

function parseSection(html) {
  return new DOMParser().parseFromString(html, 'text/html');
}

function sectionIdOf(element) {
  const section = element && element.closest('.shopify-section');
  if (!section || !section.id) return null;
  return section.id.replace(/^shopify-section-/, '');
}

/** The drawer, the header and (on /cart) the page, in that order. */
function sectionIds() {
  const ids = [];
  const roots = [
    document.querySelector('cart-drawer'),
    document.querySelector('.site-header'),
    document.querySelector('[data-cart-page]'),
  ];
  for (const root of roots) {
    const id = root ? sectionIdOf(root) : null;
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids.slice(0, 5);
}

function findLineElement(key) {
  for (const element of document.querySelectorAll('[data-cart-key]')) {
    if (element.dataset.cartKey === key) return element;
  }
  return null;
}

function changeUrl() {
  const root = document.querySelector('[data-cart-change-url]');
  const base = root && root.dataset.cartChangeUrl;
  if (base) return `${base}.js`;
  const shopifyRoot = window.Shopify && window.Shopify.routes && window.Shopify.routes.root;
  return shopifyRoot ? `${shopifyRoot}cart/change.js` : null;
}

function updateDrawerCount(sections) {
  const live = document.querySelector('[data-cart-drawer-count]');
  if (!live) return;
  const drawer = document.querySelector('cart-drawer');
  const id = drawer ? sectionIdOf(drawer) : null;
  const html = id && sections ? sections[id] : null;
  const fresh = html ? parseSection(html).querySelector('[data-cart-drawer-count]') : null;
  if (!fresh) return;
  live.textContent = fresh.textContent;
  live.hidden = fresh.hidden;
}

function updateHeaderCount(data, sections) {
  const count = document.querySelector('.header__cart .cart-count');
  if (!count) return;
  const link = count.closest('.header__cart');

  const header = document.querySelector('.site-header');
  const id = header ? sectionIdOf(header) : null;
  const html = id && sections ? sections[id] : null;
  const fresh = html ? parseSection(html) : null;
  const freshCount = fresh ? fresh.querySelector('.cart-count') : null;

  if (freshCount) {
    // The header's own markup carries the localised aria-label ("Panier
    // (3 articles)" / "Panier"), so both travel together.
    count.textContent = freshCount.textContent;
    count.hidden = freshCount.hidden;
    const freshLink = fresh.querySelector('.header__cart');
    if (link && freshLink) link.setAttribute('aria-label', freshLink.getAttribute('aria-label') || '');
    return;
  }

  if (data && typeof data.item_count === 'number') {
    count.textContent = String(data.item_count);
    count.hidden = data.item_count === 0;
  }
}

/* ------------------------------------------------------------------ */
/* Focus, scroll, busy, announcements                                   */
/* ------------------------------------------------------------------ */

/** Where focus should land again if the re-render destroys it. */
function captureFocus() {
  const active = document.activeElement;
  if (!active || typeof active.closest !== 'function') return null;
  const region = active.closest('cart-items');
  if (!region) return null;
  const line = active.closest('[data-cart-line]');
  return {
    region: region.dataset.cartRegion,
    line: line ? line.dataset.cartLine : null,
    action: active.dataset ? active.dataset.cartAction || null : null,
  };
}

function restoreFocus(focus) {
  if (!focus || !focus.region) return;
  const region = document.querySelector(`cart-items[data-cart-region="${focus.region}"]`);
  if (!region) return;

  let target = null;
  if (focus.line) {
    const line = region.querySelector(`[data-cart-line="${focus.line}"]`);
    if (line) {
      if (focus.action) target = line.querySelector(`[data-cart-action="${focus.action}"]`);
      if (!target) target = line.querySelector('[data-cart-action]');
    }
  }
  // The line may have been removed (Retirer, or quantity 0): land on the
  // next available control, the empty state's first link being the last
  // resort, rather than dropping focus on the body.
  if (!target) target = region.querySelector('[data-cart-action]');
  if (!target) target = region.querySelector('a[href], button');
  if (target) target.focus({ preventScroll: true });
}

function captureScroll() {
  const entries = [];
  for (const element of document.querySelectorAll('cart-items [data-cart-scroll]')) {
    const region = element.closest('cart-items');
    entries.push({ region: region.dataset.cartRegion, top: element.scrollTop });
  }
  return entries;
}

function restoreScroll(entries) {
  for (const entry of entries) {
    const element = document.querySelector(
      `cart-items[data-cart-region="${entry.region}"] [data-cart-scroll]`
    );
    if (element) element.scrollTop = entry.top;
  }
}

function setBusy(busy) {
  for (const items of document.querySelectorAll('cart-items')) {
    items.setAttribute('aria-busy', busy ? 'true' : 'false');
  }
  // A checkout posted mid-change would carry the pre-change quantities,
  // so the submit stands down until the cart is settled.
  for (const button of document.querySelectorAll('[data-cart-checkout]')) {
    button.disabled = busy;
  }
}

let announceTimer = null;

function announce() {
  const region = document.querySelector('[data-cart-announcement]');
  if (!region || !region.dataset.message) return;
  // Clearing first makes the same string announce again on the next change.
  region.textContent = '';
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => {
    region.textContent = region.dataset.message;
  }, 150);
}

/* ------------------------------------------------------------------ */
/* <cart-drawer>                                                        */
/* ------------------------------------------------------------------ */

class CartDrawer extends HTMLElement {
  constructor() {
    super();
    this.dialog = null;
    this.closeButton = null;
    this.lastFocused = null;

    this.onCloseClick = this.onCloseClick.bind(this);
    this.onDialogClick = this.onDialogClick.bind(this);
    this.onDialogClose = this.onDialogClose.bind(this);
    this.onDialogKeyDown = this.onDialogKeyDown.bind(this);
  }

  connectedCallback() {
    this.dialog = this.querySelector('dialog');
    if (!this.dialog) return;

    this.closeButton = this.dialog.querySelector('[data-cart-close]');
    if (this.closeButton) this.closeButton.addEventListener('click', this.onCloseClick);
    this.dialog.addEventListener('click', this.onDialogClick);
    this.dialog.addEventListener('close', this.onDialogClose);
    this.dialog.addEventListener('keydown', this.onDialogKeyDown);
  }

  disconnectedCallback() {
    if (this.closeButton) this.closeButton.removeEventListener('click', this.onCloseClick);
    if (this.dialog) {
      this.dialog.removeEventListener('click', this.onDialogClick);
      this.dialog.removeEventListener('close', this.onDialogClose);
      this.dialog.removeEventListener('keydown', this.onDialogKeyDown);
    }
  }

  focusables() {
    if (!this.dialog) return [];
    return Array.from(this.dialog.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => {
      if (element.hasAttribute('disabled')) return false;
      if (element.getAttribute('aria-hidden') === 'true') return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 || rect.height > 0 || element === document.activeElement;
    });
  }

  open(trigger) {
    if (!this.dialog || this.dialog.open) return;
    this.lastFocused =
      trigger instanceof HTMLElement && trigger.isConnected
        ? trigger
        : document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

    // showModal makes everything behind the dialog inert and locks the page
    // through `dialog[scroll-lock][open]` (critical.css). Focus is moved
    // deliberately rather than left to the browser's first-focusable guess.
    this.dialog.showModal();
    const target = this.closeButton || this.dialog;
    if (typeof target.focus === 'function') target.focus();
  }

  close(returnFocus = true) {
    if (!this.dialog || !this.dialog.open) return;
    if (!returnFocus) this.lastFocused = null;
    this.dialog.close();
  }

  onCloseClick() {
    this.close(true);
  }

  onDialogClick(event) {
    if (event.target === this.dialog) this.close(true);
  }

  onDialogClose() {
    const target =
      this.lastFocused && this.lastFocused.isConnected
        ? this.lastFocused
        : document.querySelector('.header__cart');
    this.lastFocused = null;
    if (target && typeof target.focus === 'function') target.focus();
  }

  onDialogKeyDown(event) {
    if (event.key !== 'Tab') return;
    const items = this.focusables();
    if (items.length === 0) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

/* ------------------------------------------------------------------ */
/* <cart-items>                                                         */
/* ------------------------------------------------------------------ */

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.onQuantityChange = this.onQuantityChange.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  connectedCallback() {
    this.addEventListener('quantity:change', this.onQuantityChange);
    this.addEventListener('click', this.onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('quantity:change', this.onQuantityChange);
    this.removeEventListener('click', this.onClick);
  }

  onQuantityChange(event) {
    const detail = event.detail;
    if (!detail || !detail.key) return;
    requestChange(detail.key, detail.quantity);
  }

  onClick(event) {
    const remove = event.target.closest('[data-cart-action="remove"]');
    if (!remove || !this.contains(remove)) return;
    const line = remove.closest('[data-cart-key]');
    if (!line) return;
    event.preventDefault();
    requestChange(line.dataset.cartKey, 0);
  }
}

/* ------------------------------------------------------------------ */
/* <quantity-input>                                                     */
/* ------------------------------------------------------------------ */

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.timer = null;
    this.input = null;
    this.down = null;
    this.up = null;
    this.line = null;
    this.committed = '1';

    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.onTyped = this.onTyped.bind(this);
  }

  connectedCallback() {
    this.input = this.querySelector('input');
    this.down = this.querySelector('[data-qty-down]');
    this.up = this.querySelector('[data-qty-up]');
    this.line = this.closest('[data-cart-key]');
    if (this.input) this.committed = this.input.value;

    if (this.down) this.down.addEventListener('click', this.onDown);
    if (this.up) this.up.addEventListener('click', this.onUp);
    if (this.input) this.input.addEventListener('change', this.onTyped);
    this.sync();
  }

  disconnectedCallback() {
    if (this.timer) clearTimeout(this.timer);
    if (this.down) this.down.removeEventListener('click', this.onDown);
    if (this.up) this.up.removeEventListener('click', this.onUp);
    if (this.input) this.input.removeEventListener('change', this.onTyped);
  }

  onDown() {
    this.step(-1);
  }

  onUp() {
    this.step(1);
  }

  step(delta) {
    if (!this.input) return;
    const current = parseInt(this.input.value, 10);
    this.set((Number.isNaN(current) ? 1 : current) + delta);
    this.schedule();
  }

  /** A typed value is finished business: it commits without the debounce. */
  onTyped() {
    if (!this.input) return;
    const value = parseInt(this.input.value, 10);
    if (Number.isNaN(value) || value < 1) {
      this.reset();
      return;
    }
    this.input.value = String(value);
    this.sync();
    this.emit();
  }

  set(value) {
    if (!this.input) return;
    this.input.value = String(Math.max(1, value));
    this.sync();
  }

  /** Snap back to the quantity the server last confirmed. */
  reset() {
    if (!this.input) return;
    this.input.value = this.committed;
    this.sync();
  }

  /** Minus is disabled at 1 — removing a line is the Retirer link's job. */
  sync() {
    if (this.down && this.input) this.down.disabled = Number(this.input.value) <= 1;
  }

  schedule() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      this.emit();
    }, 300);
  }

  emit() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (!this.input || !this.line) return;
    this.dispatchEvent(
      new CustomEvent('quantity:change', {
        bubbles: true,
        composed: true,
        detail: { key: this.line.dataset.cartKey, quantity: Number(this.input.value) },
      })
    );
  }
}

customElements.define('cart-drawer', CartDrawer);
customElements.define('cart-items', CartItems);
customElements.define('quantity-input', QuantityInput);

/* ------------------------------------------------------------------ */
/* Module wiring                                                        */
/* ------------------------------------------------------------------ */

// product-form.js asks any listener to enrich the add request before it is
// sent; the drawer's sections ride along so the add response already
// carries the HTML the drawer needs.
document.addEventListener('cart:before-add', (event) => {
  const detail = event.detail;
  if (!detail || !detail.body) return;
  const ids = sectionIds();
  if (ids.length === 0) return;
  detail.body.sections = ids.join(',');
  detail.body.sections_url = window.location.pathname;
});

document.addEventListener('cart:added', (event) => {
  const drawer = document.querySelector('cart-drawer');
  // Page mode renders no drawer: leave the event unhandled so the product
  // form falls back to the cart page redirect.
  if (!drawer) return;
  event.preventDefault();
  applyCartData(event.detail ? event.detail.cart : null);
  drawer.open(event.detail ? event.detail.trigger : null);
  announce();
});

// The header cart link stays a real link to /cart; with the drawer alive it
// opens the drawer instead, unless the click asked for a new tab or window.
document.addEventListener('click', (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  const link = event.target.closest('.header__cart');
  if (!link) return;
  const drawer = document.querySelector('cart-drawer');
  if (!drawer) return;
  event.preventDefault();
  drawer.open(link);
});
