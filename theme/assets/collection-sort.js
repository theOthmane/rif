/**
 * RIFANO collection sort: refresh the product grid through the Section
 * Rendering API when the sort changes. No full reload; the URL updates and
 * the Back button restores the previous sort. Without JS the form submits
 * normally via its <noscript> button.
 *
 * Behaviour binds from outside the replaced region, so re-rendered grid HTML
 * needs no re-initialisation. While loading: stale requests abort, the
 * results region carries aria-busy, and a live region announces the outcome.
 * Focus stays on the select throughout.
 */

const SELECTOR = '[data-sort-select]';

let pending = null;

function sortParam() {
  return new URL(window.location.href).searchParams.get('sort_by');
}

function pinToolbar() {
  const chrome = document.querySelector('.site-chrome');
  const bar = document.querySelector('.collection-toolbar');
  if (!chrome || !bar) {
    return;
  }
  bar.style.top = `${Math.ceil(chrome.getBoundingClientRect().height)}px`;
}

async function refreshGrid(select, { push, signal }) {
  const section = select.closest('[data-section-id]');
  if (!section) {
    return;
  }
  const results = section.querySelector('[data-grid-results]');
  const status = section.querySelector('[data-grid-status]');
  if (!results) {
    return;
  }

  const url = new URL(window.location.href);
  if (select.value) {
    url.searchParams.set('sort_by', select.value);
  } else {
    url.searchParams.delete('sort_by');
  }
  url.searchParams.delete('page');

  if (push) {
    window.history.pushState({ sort_by: select.value }, '', url);
  }

  results.setAttribute('aria-busy', 'true');
  try {
    const request = new URL(url);
    request.searchParams.set('section_id', section.dataset.sectionId);
    const response = await fetch(request.toString(), {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      signal,
    });
    if (!response.ok) {
      throw new Error(`sort refresh failed: ${response.status}`);
    }
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const fresh = doc.querySelector('[data-grid-results]');
    if (!fresh) {
      throw new Error('sort refresh returned no grid');
    }
    results.innerHTML = fresh.innerHTML;
    if (status) {
      const headline =
        results.querySelector('.collection-empty__title') ||
        results.querySelector('.collection-grid');
      status.textContent = headline
        ? (headline.textContent || '').trim().slice(0, 140)
        : '';
    }
  } catch (error) {
    if (error && error.name === 'AbortError') {
      return;
    }
    window.location.href = url.toString();
  } finally {
    results.setAttribute('aria-busy', 'false');
  }
}

function bindSelect(select) {
  const form = select.closest('form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
    });
  }
  if (select.dataset.initial === undefined) {
    select.dataset.initial = select.value;
  }
  select.addEventListener('change', () => {
    if (pending) {
      pending.abort();
    }
    pending = new AbortController();
    refreshGrid(select, { push: true, signal: pending.signal });
  });
}

document.querySelectorAll(SELECTOR).forEach(bindSelect);

window.addEventListener('popstate', () => {
  document.querySelectorAll(SELECTOR).forEach((select) => {
    const value = sortParam();
    const known = Array.from(select.options).some((option) => option.value === value);
    if (value && known) {
      select.value = value;
    } else if (!value && select.dataset.initial !== undefined) {
      select.value = select.dataset.initial;
    }
    if (pending) {
      pending.abort();
    }
    pending = new AbortController();
    refreshGrid(select, { push: false, signal: pending.signal });
  });
});

pinToolbar();
window.addEventListener('resize', pinToolbar);
