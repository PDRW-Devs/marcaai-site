export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Marca o <html> com .motion-ok quando animações são permitidas. */
export const enableMotionClass = (): boolean => {
  if (prefersReducedMotion()) return false;
  document.documentElement.classList.add('motion-ok');
  return true;
};
