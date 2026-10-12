/** RIFANO hero scrub — spec 14. Scroll-scrubbed WebP frame sequence on canvas.
    Own engine (not scroll-craft): a passive scroll handler only stores progress
    and rAF draws only when the frame index changes; coarse-to-fine loading
    (every 8th, 4th, 2nd, then all) with at most 6 concurrent decodes; the
    poster stays in the DOM as LCP and fallback. Vanilla, no dependencies. */
(() => {
  const root = document.querySelector('hero-scrub');
  const hero = root && root.querySelector('[data-hero]');
  const sticky = hero && hero.querySelector('.hero__sticky');
  const canvas = hero && hero.querySelector('.hero__canvas');
  const framesEl = root && root.querySelector('[data-frames]');
  const cta = hero && hero.querySelector('.hero__cta');
  if (!hero || !sticky || !canvas || !framesEl || !cta || !canvas.getContext) return;

  /* Activation gate: merchant switch, motion, data-saver, memory. Anything
     off keeps the spec 06 poster version at normal page height. */
  if (hero.dataset.scrub !== 'true') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (navigator.connection && navigator.connection.saveData) return;
  if (navigator.deviceMemory && navigator.deviceMemory < 2) return;

  let sets = null;
  try {
    sets = JSON.parse(framesEl.textContent);
  } catch (err) {
    return;
  }
  if (!sets || !sets.desktop || !sets.mobile || !sets.desktop.length || !sets.mobile.length) return;

  const ctx = canvas.getContext('2d');
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--c-bg').trim() || 'black';
  const small = () => window.innerWidth < 768;
  /* Per-set decoded-frame caches (kept for the session so set switches stay
     instant; encoded bytes are ~1.4 MB desktop / ~0.9 MB mobile on disk). */
  const caches = { desktop: new Map(), mobile: new Map() };
  let activeKey = small() ? 'mobile' : 'desktop';
  let urls = sets[activeKey];
  let store = caches[activeKey];

  const queue = [];
  const buildQueue = () => {
    queue.length = 0;
    const seen = new Set();
    [8, 4, 2, 1].forEach((stride) => {
      for (let i = 0; i < urls.length; i += stride) {
        if (!store.has(i) && !seen.has(i)) {
          seen.add(i);
          queue.push(i);
        }
      }
    });
  };

  let started = false;
  let inview = false;
  let dead = false;
  let inflight = 0;
  let failed = 0;
  let framed = false;
  let lastIdx = -1;
  let lastP = -1;
  const geom = { start: 0, travel: 1 };

  /* Scroll position where the sticky pins (hero top minus the sticky offset)
     over the pinned travel (runway minus sticky viewport): the spec formula
     p = (scrollY - heroTop) / (heroHeight - viewportHeight), measured. */
  const measure = () => {
    const top = hero.getBoundingClientRect().top + window.scrollY;
    const pin = parseFloat(getComputedStyle(sticky).top) || 0;
    geom.start = top - pin;
    geom.travel = Math.max(1, hero.offsetHeight - sticky.offsetHeight);
  };

  const progress = () => Math.min(1, Math.max(0, (window.scrollY - geom.start) / geom.travel));

  /* Rotation window p 0.15–0.85 sweeps the whole set; the ends hold. */
  const target = (p) => {
    const t = Math.min(1, Math.max(0, (p - 0.15) / 0.7));
    return Math.round(t * (urls.length - 1));
  };

  const nearest = (idx) => {
    if (store.has(idx)) return store.get(idx);
    for (let d = 1; d < urls.length; d += 1) {
      if (idx - d >= 0 && store.has(idx - d)) return store.get(idx - d);
      if (idx + d < urls.length && store.has(idx + d)) return store.get(idx + d);
    }
    return null;
  };

  /* The canvas is never cleared while waiting: fill + draw happen in the same
     task once the frame is decoded, so the last frame stays up until then. */
  const paint = (img) => {
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    const s = Math.min(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * s;
    const dh = img.naturalHeight * s;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    if (!framed) {
      framed = true;
      hero.classList.add('is-framed');
    }
  };

  const update = (force) => {
    if (dead) return;
    const p = progress();
    const idx = target(p);
    /* The tail (p >= 0.85) carries the floor/CTA choreography with a parked
       frame index, so it updates every scroll frame; elsewhere only the
       frame index matters. */
    if (!force && idx === lastIdx && !(p >= 0.85 && p !== lastP)) return;
    lastIdx = idx;
    lastP = p;
    hero.style.setProperty('--hero-p', p.toFixed(4));
    cta.classList.toggle('is-live', p >= 0.98);
    maybePaint(idx);
  };

  /* Paints whenever a better frame is available for the current index —
     including when a decode lands without any scroll movement (first paint,
     coarse-to-fine refinement). */
  let painted = null;
  const maybePaint = (idx) => {
    const img = nearest(idx);
    if (img && img !== painted && inview) {
      painted = img;
      paint(img);
    }
  };

  const abort = () => {
    dead = true;
    hero.classList.remove('is-scrub', 'is-framed');
  };

  const pump = () => {
    if (dead || !started || !inview) return;
    while (inflight < 6 && queue.length) {
      const i = queue.shift();
      inflight += 1;
      const img = new Image();
      img.decoding = 'async';
      img.src = urls[i];
      img
        .decode()
        .then(() => {
          inflight -= 1;
          store.set(i, img);
          if (!dead) maybePaint(target(progress()));
          update(false);
          pump();
        })
        .catch(() => {
          inflight -= 1;
          failed += 1;
          if (failed > Math.max(1, Math.ceil(urls.length * 0.1))) abort();
          else pump();
        });
    }
  };

  /* Backing store = CSS size x min(dpr, 2). */
  const fit = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };

  let raf = 0;
  window.addEventListener(
    'scroll',
    () => {
      if (dead || !inview || raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update(false);
      });
    },
    { passive: true }
  );

  /* Re-pick the set and re-size only when the width changes (150 ms
     debounce). Height-only changes (mobile address bar) only refresh the
     progress geometry — the canvas is never re-allocated or cleared. */
  let lastW = window.innerWidth;
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (dead) return;
      measure();
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      activeKey = small() ? 'mobile' : 'desktop';
      urls = sets[activeKey];
      store = caches[activeKey];
      fit();
      buildQueue();
      painted = null;
      /* A fresh set may have nothing near the current frame yet: show the
         poster until its first frame is ready instead of a blank canvas. */
      if (!nearest(target(progress())) && framed) {
        framed = false;
        hero.classList.remove('is-framed');
      }
      failed = 0;
      update(true);
      pump();
    }, 150);
  });

  const io = new IntersectionObserver((entries) => {
    inview = entries[0].isIntersecting;
    if (inview && !dead) {
      update(true);
      pump();
    }
  });
  io.observe(hero);

  const begin = () => {
    started = true;
    measure();
    pump();
  };
  if (document.readyState === 'complete') {
    if ('requestIdleCallback' in window) window.requestIdleCallback(begin, { timeout: 1000 });
    else window.setTimeout(begin, 200);
  } else {
    window.addEventListener(
      'load',
      () => {
        if ('requestIdleCallback' in window) window.requestIdleCallback(begin, { timeout: 1000 });
        else window.setTimeout(begin, 200);
      },
      { once: true }
    );
  }

  hero.classList.add('is-scrub');
  measure();
  fit();
  buildQueue();
  update(true);
  /* Webfonts can shift the chrome/tagline heights after first measure. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (!dead) measure();
    });
  }
})();
