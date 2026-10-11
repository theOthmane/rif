/** RIFANO home hero — pointer parallax. Fine pointers only, never under reduced
    motion: the stage leans ≤3deg toward the cursor, at most one write per frame
    (requestAnimationFrame) with passive listeners; identity with no pointer. */
const hero = document.querySelector('[data-hero]');
const stage = hero && hero.querySelector('.hero__stage');

if (stage && matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const max = 3;
  let frame = 0;
  let last = null;
  /* Normalised to -1..1 across the hero, capped at max: rotateY(+) magnifies the
     left side and rotateX(+) the bottom, so the near side comes forward. */
  const apply = () => {
    frame = 0;
    if (!last) return;
    const r = hero.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((last.clientX - r.left) / r.width) * 2 - 1));
    const y = Math.max(-1, Math.min(1, ((last.clientY - r.top) / r.height) * 2 - 1));
    stage.style.setProperty('--hero-tilt-y', `${(-x * max).toFixed(2)}deg`);
    stage.style.setProperty('--hero-tilt-x', `${(y * max).toFixed(2)}deg`);
  };
  const reset = () => {
    last = null;
    stage.style.setProperty('--hero-tilt-y', '0deg');
    stage.style.setProperty('--hero-tilt-x', '0deg');
  };
  hero.addEventListener('pointermove', (event) => { last = event; frame = frame || requestAnimationFrame(apply); }, { passive: true });
  hero.addEventListener('pointerleave', reset, { passive: true });
}
