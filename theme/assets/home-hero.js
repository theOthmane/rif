/**
 * RIFANO home hero — chrome-height sync + pointer parallax.
 *
 * The hero fills one screen minus the sticky chrome (announcement + header).
 * That height depends on the merchant's announcement text and its wrapping, so
 * it is measured instead of guessed; the CSS carries a token-based fallback for
 * the no-JS case. The tilt is bound only on fine pointers, away from reduced
 * motion, writes at most once per frame (requestAnimationFrame, passive
 * listeners), and tops out at 3deg, so it reads as weight, not as an effect.
 */

const hero = document.querySelector('[data-hero]');
const chrome = document.querySelector('.site-chrome');

if (hero && chrome) {
  const sync = () => hero.style.setProperty('--hero-chrome-h', `${chrome.offsetHeight}px`);
  sync();

  if ('ResizeObserver' in window) {
    new ResizeObserver(sync).observe(chrome);
  } else {
    window.addEventListener('resize', sync, { passive: true });
  }
}

const stage = hero && hero.querySelector('.hero__stage');

if (stage && matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const maxTilt = 3;
  let frame = 0;
  let last = null;

  const apply = () => {
    frame = 0;

    if (!last) {
      return;
    }

    /* Normalised to -1..1 across the hero, capped at maxTilt: the surface leans
       toward the pointer — the side under the cursor comes forward (rotateY
       positive magnifies the left side, rotateX positive the bottom). */
    const rect = hero.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((last.clientX - rect.left) / rect.width) * 2 - 1));
    const y = Math.max(-1, Math.min(1, ((last.clientY - rect.top) / rect.height) * 2 - 1));

    stage.style.setProperty('--hero-tilt-y', `${(-x * maxTilt).toFixed(2)}deg`);
    stage.style.setProperty('--hero-tilt-x', `${(y * maxTilt).toFixed(2)}deg`);
  };

  hero.addEventListener(
    'pointermove',
    (event) => {
      last = event;
      if (!frame) {
        frame = requestAnimationFrame(apply);
      }
    },
    { passive: true },
  );

  hero.addEventListener(
    'pointerleave',
    () => {
      last = null;
      stage.style.setProperty('--hero-tilt-y', '0deg');
      stage.style.setProperty('--hero-tilt-x', '0deg');
    },
    { passive: true },
  );
}
