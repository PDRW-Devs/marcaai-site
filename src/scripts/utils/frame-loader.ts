/**
 * Loader progressivo da sequência de frames do hero.
 * Estratégia: carrega o frame 0 primeiro (poster/LCP já cobre o first paint),
 * depois preenche em passadas cada vez mais densas (1/8 → 1/4 → 1/2 → todos),
 * para que o scrub tenha sempre um frame próximo disponível.
 */
export interface FrameSequence {
  frames: (HTMLImageElement | null)[];
  total: number;
  /** Frame carregado mais próximo do índice pedido. */
  nearest(index: number): HTMLImageElement | null;
  /** Resolve quando todos os frames terminarem de carregar. */
  done: Promise<void>;
}

const frameSrc = (dir: string, i: number, step = 1): string =>
  `${dir}/${String(i * step + 1).padStart(4, '0')}.webp`;

export function loadFrames(dir: string, total: number, step = 1): FrameSequence {
  const frames: (HTMLImageElement | null)[] = new Array(total).fill(null);

  const load = (i: number): Promise<void> =>
    new Promise((resolve) => {
      if (frames[i]) return resolve();
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        frames[i] = img;
        resolve();
      };
      img.onerror = () => resolve();
      img.src = frameSrc(dir, i, step);
    });

  const passes = [8, 4, 2, 1];
  const done = (async () => {
    await load(0);
    await load(total - 1);
    for (const stride of passes) {
      await Promise.all(
        Array.from({ length: Math.ceil(total / stride) }, (_, k) => load(k * stride)),
      );
    }
  })();

  return {
    frames,
    total,
    nearest(index: number) {
      const i = Math.max(0, Math.min(total - 1, Math.round(index)));
      if (frames[i]) return frames[i];
      for (let d = 1; d < total; d++) {
        if (frames[i - d]) return frames[i - d];
        if (frames[i + d]) return frames[i + d];
      }
      return null;
    },
    done,
  };
}
