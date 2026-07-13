import { enableMotionClass } from '../utils/reduced-motion';
import { gsap, initSmoothScroll } from './lenis-setup';
import { initHeroScrollVideo } from './scroll-video';
import { initEffects } from './effects';

/**
 * Bootstrap global de motion. Com prefers-reduced-motion o conteúdo
 * permanece estático e visível (nenhum estado inicial oculto é aplicado).
 */
export function initMotion(): void {
  if (!enableMotionClass()) return;

  initSmoothScroll();
  initHeroScrollVideo();
  initEffects();

  // Reveal genérico: qualquer elemento com data-reveal entra com fade+rise.
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'expo.out',
      delay: Number(el.dataset.revealDelay ?? 0),
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
      },
    });
  });
}

initMotion();
