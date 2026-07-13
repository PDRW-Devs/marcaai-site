import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

/**
 * Lenis + ScrollTrigger sincronizados:
 * - Lenis notifica o ScrollTrigger a cada scroll.
 * - O raf do Lenis roda dentro do ticker do GSAP (fonte única de tempo).
 */
export function initSmoothScroll(): Lenis {
  if (lenis) return lenis;

  lenis = new Lenis({ autoRaf: false });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  let resizeTimer: ReturnType<typeof setTimeout>;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });

  return lenis;
}

export { gsap, ScrollTrigger };
