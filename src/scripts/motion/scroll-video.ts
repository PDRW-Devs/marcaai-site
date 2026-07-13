import { gsap } from './lenis-setup';
import { loadFrames } from '../utils/frame-loader';

/**
 * Hero scroll-driven video: sequência de frames desenhada em <canvas>,
 * dirigida pelo progresso de um ScrollTrigger pinado (estilo Apple AirPods).
 *
 * Técnica escolhida em vez de <video currentTime>: seeking por frame é
 * determinístico e suave em todos os browsers (currentTime depende de
 * keyframes e engasga no iOS/Safari).
 *
 * Fallbacks (ver initHero): reduced-motion → poster estático, sem pin;
 * mobile → metade dos frames (step 2).
 */
interface HeroRefs {
  section: HTMLElement;
  canvas: HTMLCanvasElement;
  poster: HTMLImageElement;
}

const FRAMES_DIR = '/frames';
const TOTAL_FRAMES = 120;

function getRefs(): HeroRefs | null {
  const section = document.getElementById('hero');
  const canvas = section?.querySelector<HTMLCanvasElement>('canvas[data-hero-canvas]');
  const poster = section?.querySelector<HTMLImageElement>('img[data-hero-poster]');
  return section && canvas && poster ? { section, canvas, poster } : null;
}

function setupCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = canvas.clientWidth;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  return ctx;
}

function initScrub(refs: HeroRefs, step: number): void {
  const { section, canvas, poster } = refs;
  const total = Math.floor(TOTAL_FRAMES / step);
  const seq = loadFrames(FRAMES_DIR, total, step);

  let ctx = setupCanvas(canvas);
  let currentIndex = -1;

  const draw = (index: number) => {
    const img = seq.nearest(index);
    if (!img) return;
    const size = canvas.clientWidth;
    ctx.drawImage(img, 0, 0, size, size);
  };

  gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=200%',
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        const target = Math.round(self.progress * (total - 1));
        if (target !== currentIndex) {
          currentIndex = target;
          draw(currentIndex);
        }
      },
    },
  });

  // Primeiro frame decodificado assume o lugar do poster sem flash.
  loadFramePromise(seq, 0).then(() => {
    draw(0);
    canvas.classList.remove('opacity-0');
    poster.classList.add('opacity-0');
  });

  window.addEventListener('resize', () => {
    ctx = setupCanvas(canvas);
    draw(Math.max(currentIndex, 0));
  });

  // Overlay: headline sobe/some suavemente conforme o scrub avança.
  const overlay = section.querySelector('[data-hero-overlay]');
  if (overlay) {
    gsap.to(overlay, {
      opacity: 0,
      y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: '30% top',
        end: '80% top',
        scrub: true,
      },
    });
  }
}

function loadFramePromise(
  seq: ReturnType<typeof loadFrames>,
  index: number,
): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (seq.frames[index]) return resolve();
      requestAnimationFrame(check);
    };
    check();
  });
}

export function initHeroScrollVideo(): void {
  const refs = getRefs();
  if (!refs) return;

  // Sem .motion-ok (reduced-motion ou bootstrap não rodou): poster estático.
  if (!document.documentElement.classList.contains('motion-ok')) return;

  const mm = gsap.matchMedia();
  // Desktop/tablet: sequência completa; mobile: metade dos frames —
  // mesma duração visual, metade do payload.
  mm.add('(min-width: 768px)', () => initScrub(refs, 1));
  mm.add('(max-width: 767px)', () => initScrub(refs, 2));
}
