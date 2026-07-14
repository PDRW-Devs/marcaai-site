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
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  return ctx;
}

function initScrub(refs: HeroRefs, step: number, end: string, fadeOverlay: boolean): void {
  const { section, canvas, poster } = refs;
  const total = Math.floor(TOTAL_FRAMES / step);
  const seq = loadFrames(FRAMES_DIR, total, step);

  let ctx = setupCanvas(canvas);
  let currentIndex = -1;

  const draw = (index: number) => {
    const img = seq.nearest(index);
    if (!img) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    // frame quadrado: no desktop o contêiner também é (s == w == h); no
    // mobile full-bleed, cobre a largura com folga sem estourar a altura
    const s = Math.min(h, w * 1.3);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, (w - s) / 2, (h - s) / 2, s, s);
  };

  gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end,
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
  // Só no desktop — no mobile o texto vive DEPOIS do vídeo, não sobre ele.
  const overlay = section.querySelector('[data-hero-overlay]');
  if (overlay && fadeOverlay) {
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
  // Desktop/tablet: sequência completa em 200% de scroll. Mobile: metade dos
  // frames (metade do payload) e pin mais curto — o vídeo avança mais rápido
  // por centímetro de rolagem.
  mm.add('(min-width: 768px)', () => initScrub(refs, 1, '+=200%', true));
  mm.add('(max-width: 767px)', () => initScrub(refs, 2, '+=120%', false));
}
