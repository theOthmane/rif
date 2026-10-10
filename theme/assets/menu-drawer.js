/**
 * RIFANO menu drawer + header scroll hairline.
 * Custom element <menu-drawer> wraps the menu button and the dialog.
 * No inline handlers; all wiring via addEventListener.
 */

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

class MenuDrawer extends HTMLElement {
  constructor() {
    super();
    this.dialog = null;
    this.openButton = null;
    this.closeButton = null;
    this.header = null;
    this.sentinel = null;
    this.lastFocused = null;
    this.observer = null;

    this.onOpenClick = this.onOpenClick.bind(this);
    this.onCloseClick = this.onCloseClick.bind(this);
    this.onDialogClick = this.onDialogClick.bind(this);
    this.onDialogClose = this.onDialogClose.bind(this);
    this.onDialogKeyDown = this.onDialogKeyDown.bind(this);
    this.onDialogLinkClick = this.onDialogLinkClick.bind(this);
  }

  connectedCallback() {
    this.dialog =
      this.querySelector('dialog#menu-drawer') || document.getElementById('menu-drawer');
    this.openButton =
      this.querySelector('[aria-controls="menu-drawer"]') ||
      document.querySelector('[aria-controls="menu-drawer"]');
    this.header =
      this.querySelector('.site-header') || document.querySelector('.site-header');
    this.sentinel =
      this.querySelector('.header__sentinel') ||
      document.querySelector('.header__sentinel');

    if (!this.dialog) {
      return;
    }

    this.closeButton = this.dialog.querySelector('[data-menu-close]');

    if (this.openButton) {
      this.openButton.addEventListener('click', this.onOpenClick);
    }

    if (this.closeButton) {
      this.closeButton.addEventListener('click', this.onCloseClick);
    }

    this.dialog.addEventListener('click', this.onDialogClick);
    this.dialog.addEventListener('close', this.onDialogClose);
    this.dialog.addEventListener('keydown', this.onDialogKeyDown);
    this.dialog.addEventListener('click', this.onDialogLinkClick);

    this.initScrollHairline();
  }

  disconnectedCallback() {
    if (this.openButton) {
      this.openButton.removeEventListener('click', this.onOpenClick);
    }

    if (this.closeButton) {
      this.closeButton.removeEventListener('click', this.onCloseClick);
    }

    if (this.dialog) {
      this.dialog.removeEventListener('click', this.onDialogClick);
      this.dialog.removeEventListener('close', this.onDialogClose);
      this.dialog.removeEventListener('keydown', this.onDialogKeyDown);
      this.dialog.removeEventListener('click', this.onDialogLinkClick);
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  initScrollHairline() {
    if (!this.header || !this.sentinel) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        this.header.classList.toggle('is-scrolled', !entry.isIntersecting);
      },
      { threshold: 0 },
    );

    this.observer.observe(this.sentinel);
  }

  focusables() {
    if (!this.dialog) {
      return [];
    }

    return Array.from(this.dialog.querySelectorAll(FOCUSABLE_SELECTOR)).filter((el) => {
      if (el.hasAttribute('disabled')) {
        return false;
      }

      if (el.getAttribute('aria-hidden') === 'true') {
        return false;
      }

      const rect = el.getBoundingClientRect();
      return rect.width > 0 || rect.height > 0 || el === document.activeElement;
    });
  }

  open() {
    if (!this.dialog || this.dialog.open) {
      return;
    }

    this.lastFocused = document.activeElement;
    this.dialog.showModal();
    document.documentElement.style.overflow = 'hidden';

    if (this.openButton) {
      this.openButton.setAttribute('aria-expanded', 'true');
    }

    const first = this.focusables()[0] || this.dialog;
    if (typeof first.focus === 'function') {
      first.focus();
    }
  }

  close(returnFocus = true) {
    if (!this.dialog || !this.dialog.open) {
      return;
    }

    if (!returnFocus) {
      this.lastFocused = null;
    }

    this.dialog.close();
  }

  onOpenClick() {
    this.open();
  }

  onCloseClick() {
    this.close(true);
  }

  onDialogClick(event) {
    if (event.target === this.dialog) {
      this.close(true);
    }
  }

  onDialogLinkClick(event) {
    const link = event.target.closest('a[href]');
    if (!link || !this.dialog.contains(link)) {
      return;
    }

    this.lastFocused = null;
    this.close(false);
  }

  onDialogClose() {
    document.documentElement.style.overflow = '';

    if (this.openButton) {
      this.openButton.setAttribute('aria-expanded', 'false');
    }

    if (this.lastFocused && typeof this.lastFocused.focus === 'function') {
      const node = this.lastFocused;
      this.lastFocused = null;
      node.focus();
    } else if (this.openButton && document.activeElement === document.body) {
      this.openButton.focus();
    }

    this.lastFocused = null;
  }

  onDialogKeyDown(event) {
    if (event.key !== 'Tab') {
      return;
    }

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

customElements.define('menu-drawer', MenuDrawer);
