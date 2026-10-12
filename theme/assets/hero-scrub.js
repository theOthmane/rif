/** RIFANO hero scrub — spec 18. Scroll-scrubbed WebP frame sequence on canvas.
    Own engine (not scroll-craft): a passive scroll handler only stores raw
    progress, a rAF loop eases a smoothed playhead toward it (frame-rate
    independent, tau 140ms fine / 90ms coarse) and stops at idle; the frame
    between two decoded neighbours is blended on top of the base one;
    coarse-to-fine loading (every 8th, 4th, 2nd, then all) with at most 6
    concurrent decodes; the poster stays in the DOM as LCP and fallback.
    Vanilla, no dependencies. */
(() => {
  const root = document.querySelector('hero-scrub');
  const hero = root && root.querySelector('[data-hero]');
  const sticky = hero && hero.querySelector('.hero__sticky');
  const canvas = hero && hero.querySelector('.hero__canvas');
  const framesEl = root && root.querySelector('[data-frames]');
  const cta = hero && hero.querySelector('.hero__cta');
  if (!hero || !sticky || !canvas || !framesEl || !cta || !canvas.getContext) return;

  /* The runway height is reserved by CSS from this same attribute so the hero
     is the right height at first paint (see home-hero.css). Any path that ends
     the scrub has to hand the height back, or the visitor scrolls through empty
     space: the media queries there cannot see save-data or deviceMemory. */
  const releaseRunway = () => hero.removeAttribute('data-scrub');

  /* Activation gate: merchant switch, motion, data-saver, memory. Anything
     off keeps the spec 06 poster version at normal page height. */
  if (hero.dataset.scrub !== 'true') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (navigator.connection && navigator.connection.saveData) {
    releaseRunway();
    return;
  }
  if (navigator.deviceMemory && navigator.deviceMemory < 2) {
    releaseRunway();
    return;
  }

  let sets = null;
  try {
    sets = JSON.parse(framesEl.textContent);
  } catch (err) {
    releaseRunway();
    return;
  }
  if (!sets || !sets.desktop || !sets.mobile || !sets.desktop.length || !sets.mobile.length) {
    releaseRunway();
    return;
  }

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
  const geom = { start: 0, travel: 1 };

  /* Chase constants (spec 18). Touch momentum is already smooth, so a coarse
     pointer gets the shorter time constant and stays connected to the finger;
     a mouse gets the longer one, which is what turns a 100px wheel notch into
     a few frames of motion instead of one 15-frame jump. */
  const TAU = window.matchMedia('(pointer: fine)').matches ? 140 : 90;
  const SNAP = 0.0005;
  /* raw = the scroll position, smooth = the published playhead. */
  let raw = -1;
  let smooth = -1;
  let lastPub = -1;
  let key = '';
  let raf = 0;
  let lastT = 0;

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

  /* Choreography (spec 18), read from the smoothed playhead:
     - p 0 → 0.05: start frame, "Be different." at 1, "Be RIFANO." still out.
     - p 0.05 → 0.60: the rotation sweeps the whole set; line 1 holds until
       0.30 then eases to 0.6 by 0.50, and line 2 rises 16px and fades in over
       that same 0.30 → 0.50.
     - p 0.60 → 0.75: the front frame holds and the floor tightens 1.15 → 1.
     - p 0.75 → 1: the CTA fades in 0.75 → 0.90 and goes live at p >= 0.90.
     The frame index is a float, not an integer: the neighbours blend, so the
     rotation reads as motion rather than as steps. */
  const frameAt = (s) => {
    const t = Math.min(1, Math.max(0, (s - 0.05) / 0.55));
    return t * (urls.length - 1);
  };

  const nearestIdx = (idx) => {
    if (store.has(idx)) return idx;
    for (let d = 1; d < urls.length; d += 1) {
      if (idx - d >= 0 && store.has(idx - d)) return idx - d;
      if (idx + d < urls.length && store.has(idx + d)) return idx + d;
    }
    return -1;
  };

  /* One bitmap, centred and contained. globalAlpha is set and reset here so a
     blend never leaks into the next paint. */
  const blit = (img, alpha) => {
    const w = canvas.width;
    const h = canvas.height;
    const s = Math.min(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * s;
    const dh = img.naturalHeight * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    ctx.globalAlpha = 1;
  };

  /* Paints whenever the playhead lands somewhere new: a different base frame,
     a different blend partner, or a blend weight that moved enough to see.
     The alpha is bucketed to 1/64 so a chase still inside one pair does not
     redraw two bitmaps for an invisible difference.
     The canvas is never cleared while waiting for a frame: fill and draw
     happen in the same task, so the last frame stays up until then. */
  const paint = (s) => {
    if (!inview) return;
    const f = frameAt(s);
    const lo = Math.floor(f);
    const hi = Math.min(urls.length - 1, lo + 1);
    const frac = f - lo;
    const base = nearestIdx(lo);
    const blend = frac > 0.05 && frac < 0.95 && store.has(hi) ? hi : -1;
    const alpha = blend < 0 ? 1 : Math.round(frac * 64) / 64;
    const next = base + ':' + blend + ':' + alpha;
    if (base < 0 || next === key) return;
    key = next;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    blit(store.get(base), 1);
    if (blend >= 0) blit(store.get(blend), alpha);
    if (!framed) {
      framed = true;
      hero.classList.add('is-framed');
    }
  };

  /* Both the text and the frame index come from the same number, so the
     tagline can never drift out of sync with the watch. */
  const publish = (s) => {
    if (s === lastPub) return;
    lastPub = s;
    hero.style.setProperty('--hero-p', s.toFixed(4));
    /* Gated in JS, not only in CSS: no focusable, clickable CTA parked
       invisible. */
    cta.classList.toggle('is-live', s >= 0.9);
  };

  /* Jump straight to the scroll position: activation, a resize that moves the
     runway, and coming back into view. Anywhere else the playhead chases. */
  const sync = () => {
    raw = progress();
    smooth = raw;
    publish(smooth);
    paint(smooth);
  };

  const tick = (now) => {
    raf = 0;
    if (dead || !inview) {
      lastT = 0;
      return;
    }
    const dt = lastT ? Math.min(64, now - lastT) : 16.7;
    lastT = now;
    smooth += (raw - smooth) * (1 - Math.exp(-dt / TAU));
    if (Math.abs(raw - smooth) <= SNAP) {
      smooth = raw;
      publish(smooth);
      paint(smooth);
      lastT = 0;
      return;
    }
    publish(smooth);
    paint(smooth);
    raf = window.requestAnimationFrame(tick);
  };

  const kick = () => {
    if (dead || !inview || raf) return;
    lastT = 0;
    raf = window.requestAnimationFrame(tick);
  };

  const abort = () => {
    dead = true;
    hero.classList.remove('is-scrub', 'is-framed');
    releaseRunway();
    /* The fallback changes the page height under the visitor's feet: anyone
       deep in the runway would be dropped into the middle of the rows below.
       Put them back at the top of the hero, which is the poster version this
       falls back to. */
    if (window.scrollY > geom.start) window.scrollTo(0, Math.max(0, geom.start));
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
          /* A decode that lands under the current playhead is worth a repaint
             even with no scrolling: first paint, coarse-to-fine refinement,
             or a neighbour arriving to blend with. */
          if (!dead) paint(smooth);
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

  window.addEventListener(
    'scroll',
    () => {
      if (dead || !inview) return;
      raw = progress();
      kick();
    },
    { passive: true }
  );

  /* Any change in the canvas box re-allocates the backing store: a height-only
     resize (mobile address bar, desktop window drag) resizes the box, and
     leaving the old backing store in place stretches the frame vertically.
     fit() is a no-op when the pixel size is unchanged, so this cannot cost a
     repaint on its own; clearing the paint key forces the nearest decoded
     frame to be drawn again into the new store in the same task (no flash, no
     reset). Only a width change re-picks the frame set. */
  let lastW = window.innerWidth;
  let lastH = canvas.clientHeight;
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (dead) return;
      measure();
      const wChanged = window.innerWidth !== lastW;
      const hChanged = canvas.clientHeight !== lastH;
      if (!wChanged && !hChanged) return;
      lastW = window.innerWidth;
      lastH = canvas.clientHeight;
      if (wChanged) {
        activeKey = small() ? 'mobile' : 'desktop';
        urls = sets[activeKey];
        store = caches[activeKey];
        buildQueue();
        failed = 0;
        pump();
      }
      fit();
      key = '';
      /* A fresh set may have nothing near the current frame yet: show the
         poster until its first frame is ready instead of a blank canvas. */
      if (nearestIdx(Math.floor(frameAt(smooth))) < 0 && framed) {
        framed = false;
        hero.classList.remove('is-framed');
      }
      sync();
    }, 150);
  });

  const io = new IntersectionObserver((entries) => {
    inview = entries[0].isIntersecting;
    if (inview && !dead) {
      sync();
      pump();
    }
  });
  io.observe(hero);

  const begin = () => {
    started = true;
    measure();
    raw = progress();
    pump();
    kick();
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
  sync();
  /* Webfonts can shift the chrome/tagline heights after first measure. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (dead) return;
      measure();
      raw = progress();
      kick();
    });
  }
})();