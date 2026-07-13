import { gsap, ScrollTrigger } from './lenis-setup';

/**
 * Efeitos de polish (Etapa 4). Todos pressupõem .motion-ok no <html> —
 * os estados iniciais ocultos vivem no CSS sob essa classe, então sem
 * motion nada aqui roda e o conteúdo permanece visível.
 */

/** Manifesto: linhas sobem de dentro da máscara com stagger. */
function initLineReveals(): void {
  gsap.utils.toArray<HTMLElement>('[data-lines]').forEach((el) => {
    gsap.to(el.querySelectorAll('.line-inner'), {
      y: 0,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.14,
      scrollTrigger: { trigger: el, start: 'top 75%' },
    });
  });
}

/**
 * Conversa da Maya, como no WhatsApp real: o cliente manda (vistos cinza →
 * azuis quando ela "visualiza"), o status do header vira "digitando…",
 * a bolha dela aparece com pontos e o texto entra em seguida.
 * Com abas: cada troca de conversa reseta e toca a animação do painel.
 */
function resetChatPanel(panel: HTMLElement, status: HTMLElement | null): void {
  if (status) status.textContent = 'online';
  panel
    .querySelectorAll<HTMLElement>('[data-chat-bubble], [data-chat-confirm]')
    .forEach((b) => gsap.set(b, { opacity: 0, y: 14, scale: 0.97 }));
  panel.querySelectorAll<HTMLElement>('.chat-dots').forEach((d) => gsap.set(d, { opacity: 1 }));
  panel.querySelectorAll<HTMLElement>('.chat-text').forEach((t) => gsap.set(t, { opacity: 0 }));
  panel.querySelectorAll('.chat-ticks').forEach((t) => t.classList.remove('ticks-read'));
}

function buildChatTimeline(
  panel: HTMLElement,
  status: HTMLElement | null,
): gsap.core.Timeline {
  const setStatus = (text: string) => () => {
    if (status) status.textContent = text;
  };
  const tl = gsap.timeline({ paused: true });

  panel
    .querySelectorAll<HTMLElement>('[data-chat-bubble], [data-chat-confirm]')
    .forEach((item) => {
      if (item.hasAttribute('data-chat-confirm')) {
        tl.to(
          item,
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(2.5)' },
          '+=0.5',
        );
        return;
      }

      if (item.dataset.from === 'maya') {
        // Maya visualiza… e começa a digitar
        tl.call(setStatus('digitando…'), undefined, '+=0.5');
        tl.to(item, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }, '+=0.5');
        const dots = item.querySelector('.chat-dots');
        const text = item.querySelector('.chat-text');
        if (dots && text) {
          tl.to(dots, { opacity: 0, duration: 0.12 }, '+=1.1').to(
            text,
            { opacity: 1, duration: 0.2 },
            '<',
          );
        }
        tl.call(setStatus('online'));
      } else {
        // Cliente envia; pouco depois os vistos ficam azuis (visualizado)
        tl.to(item, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }, '+=0.4');
        const ticks = item.querySelector('.chat-ticks');
        if (ticks) {
          tl.call(() => ticks.classList.add('ticks-read'), undefined, '+=0.6');
        }
      }
    });

  return tl;
}

function initChat(): void {
  document.querySelectorAll<HTMLElement>('[data-chat-widget]').forEach((widget) => {
    const deck = widget.querySelector<HTMLElement>('[data-chat-deck]');
    if (!deck) return;
    const cards = Array.from(deck.querySelectorAll<HTMLElement>('[data-chat-card]'));
    if (cards.length === 0) return;

    // ordem circular: [0] = frente, [1] = direita (próximo), [2] = esquerda
    let ordem = [...cards];
    let tlAtual: gsap.core.Timeline | null = null;
    let autoCall: gsap.core.Tween | null = null;
    let pendente = false;
    let hovering = false;

    const aplicar = () => {
      ordem.forEach((card, i) => {
        card.classList.toggle('is-front', i === 0);
        card.classList.toggle('is-right', i === 1);
        card.classList.toggle('is-left', i === 2);
      });
    };

    const label = widget.querySelector<HTMLElement>('[data-chat-label]');
    const labelText = widget.querySelector<HTMLElement>('[data-chat-label-text]');

    const trocarRotulo = (titulo: string) => {
      if (!label || !labelText) return;
      gsap.to(label, {
        opacity: 0,
        y: -8,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          labelText.textContent = titulo;
          gsap.fromTo(
            label,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
          );
        },
      });
    };

    const tocarFrente = () => {
      const card = ordem[0];
      const panel = card.querySelector<HTMLElement>('[data-chat-panel]');
      const status = card.querySelector<HTMLElement>('[data-chat-status]');
      if (!panel) return;
      trocarRotulo(card.dataset.chatTitle ?? '');
      tlAtual?.kill();
      resetChatPanel(panel, status);
      tlAtual = buildChatTimeline(panel, status);
      // fim da conversa → avança sozinho em 2s (se o mouse não estiver em cima)
      tlAtual.eventCallback('onComplete', () => {
        autoCall?.kill();
        autoCall = gsap.delayedCall(2, () => {
          if (hovering) pendente = true;
          else avancar(1);
        });
      });
      tlAtual.play();
    };

    const avancar = (dir: 1 | -1) => {
      autoCall?.kill();
      pendente = false;
      if (dir === 1) ordem.push(ordem.shift() as HTMLElement);
      else ordem.unshift(ordem.pop() as HTMLElement);
      aplicar();
      tocarFrente();
    };

    // pausa o auto-avanço enquanto o mouse estiver sobre o deck
    widget.addEventListener('mouseenter', () => {
      hovering = true;
    });
    widget.addEventListener('mouseleave', () => {
      hovering = false;
      if (pendente) {
        pendente = false;
        avancar(1);
      }
    });

    widget
      .querySelector('[data-chat-next]')
      ?.addEventListener('click', () => avancar(1));
    widget
      .querySelector('[data-chat-prev]')
      ?.addEventListener('click', () => avancar(-1));

    aplicar();
    // primeira conversa toca quando a seção entra em cena
    gsap.timeline({
      scrollTrigger: { trigger: deck, start: 'top 65%', onEnter: () => tocarFrente() },
    });
  });
}

/** Parallax leve: data-parallax="0.9" (mais lento) a "1.15" (mais rápido). */
function initParallax(): void {
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const speed = Number(el.dataset.parallax ?? 1);
    gsap.fromTo(
      el,
      { y: (1 - speed) * -60 },
      {
        y: (1 - speed) * 60,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section') ?? el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
  });
}

/** Números em mono entram contando até data-count. */
function initCounters(): void {
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count ?? 0);
    const state = { value: 0 };
    gsap.to(state, {
      value: target,
      duration: 1.4,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
      onUpdate: () => {
        el.textContent = String(Math.round(state.value));
      },
    });
  });
}

/** Passos do "Como funciona": destaque laranja quando o passo cruza o centro. */
function initSteps(): void {
  gsap.utils.toArray<HTMLElement>('[data-step]').forEach((el) => {
    gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 60%',
        end: 'bottom 40%',
        toggleClass: { targets: el, className: 'step-active' },
      },
    });
  });

  // Linha laranja da timeline preenche conforme o scroll avança pelos passos.
  const line = document.querySelector<HTMLElement>('[data-steps-line]');
  if (line?.parentElement) {
    gsap.to(line, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: line.parentElement,
        start: 'top 65%',
        end: 'bottom 45%',
        scrub: true,
      },
    });
  }
}

/** Cards com máscara: clip-path abre quando o elemento entra em cena. */
function initClips(): void {
  gsap.utils.toArray<HTMLElement>('[data-clip]').forEach((el) => {
    gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        onEnter: () => el.classList.add('clip-open'),
      },
    });
  });
}

/**
 * A esfera da Maya com spotlight mask por rolagem: o palco fica pinado e a
 * máscara circular nasce na esfera, crescendo com o scroll até revelar a
 * página laranja — rolando de volta, ela se desfaz (scrub reversível).
 * Depois do pin, os cards do corpo se formam no fluxo normal da rolagem.
 */
function initSystemTree(): void {
  const section = document.getElementById('system-tree');
  if (!section) return;
  const pinBox = section.querySelector<HTMLElement>('[data-maya-pin]');
  const cover = section.querySelector<HTMLElement>('[data-maya-cover]');
  const hint = section.querySelector<HTMLElement>('[data-maya-hint]');
  if (!pinBox || !cover) return;

  // a máscara nasce logo abaixo da seta do "role para entrar"
  const centro = () => {
    const p = pinBox.getBoundingClientRect();
    if (hint) {
      const h = hint.getBoundingClientRect();
      return {
        x: h.left - p.left + h.width / 2,
        y: h.bottom - p.top + 48,
        r: 26,
      };
    }
    return { x: p.width / 2, y: p.height * 0.46, r: 26 };
  };

  // aquecimento sutil: a bolinha já cresce um pouco enquanto a seção se
  // aproxima, antes do pin (e do texto) chegarem — nada muito forte
  gsap.fromTo(
    cover,
    {
      clipPath: () => {
        const c = centro();
        return `circle(5px at ${c.x}px ${c.y}px)`;
      },
    },
    {
      clipPath: () => {
        const c = centro();
        return `circle(${c.r}px at ${c.x}px ${c.y}px)`;
      },
      ease: 'none',
      scrollTrigger: {
        trigger: pinBox,
        start: 'top 75%',
        end: 'top top',
        scrub: 0.4,
        invalidateOnRefresh: true,
      },
    },
  );

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pinBox,
      start: 'top top',
      end: '+=110%',
      pin: true,
      scrub: 0.5,
      invalidateOnRefresh: true,
    },
  });

  tl.fromTo(
    cover,
    {
      clipPath: () => {
        const c = centro();
        return `circle(${c.r}px at ${c.x}px ${c.y}px)`;
      },
    },
    {
      clipPath: () => {
        const c = centro();
        const p = pinBox.getBoundingClientRect();
        const R = Math.ceil(
          Math.hypot(Math.max(c.x, p.width - c.x), Math.max(c.y, p.height - c.y)),
        );
        return `circle(${R}px at ${c.x}px ${c.y}px)`;
      },
      ease: 'power2.inOut',
      duration: 1,
    },
    0,
  )
    .to(hint, { opacity: 0, duration: 0.12 }, 0);

  // fluxos estilo n8n: coreografia autônoma (motion design), disparada uma
  // vez quando o fluxo entra em cena — nó materializa (blur → pop + anel de
  // impacto), o pulso viaja pela linha enquanto ela se desenha, o próximo nó
  // nasce na chegada do pulso, o check final se desenha e a linha fica "viva".
  gsap.utils.toArray<HTMLElement>('[data-flow]').forEach((flow) => {
    const tlFluxo = gsap.timeline({ paused: true });

    tlFluxo.fromTo(
      flow.querySelector('[data-flow-label]'),
      { opacity: 0, letterSpacing: '0.6em' },
      { opacity: 1, letterSpacing: '0.25em', duration: 0.5, ease: 'power3.out' },
      0,
    );

    let t = 0.25;
    flow
      .querySelectorAll<HTMLElement>('[data-flow-node], [data-flow-conn]')
      .forEach((el) => {
        if (el.hasAttribute('data-flow-conn')) {
          // a faísca viaja pela linha até a próxima caixa (curso contínuo)
          const path = el.querySelector<SVGPathElement>('.flow-link');
          const pulse = el.querySelector<SVGCircleElement>('.flow-pulse');
          tlFluxo
            .to(el, { opacity: 1, duration: 0.08 }, t)
            .to(path, { strokeDashoffset: 0, duration: 0.35, ease: 'power1.inOut' }, t);
          if (path && pulse) {
            const len = path.getTotalLength();
            const prog = { p: 0 };
            tlFluxo.to(
              prog,
              {
                p: 1,
                duration: 0.35,
                ease: 'power1.inOut',
                onStart: () => gsap.set(pulse, { opacity: 1 }),
                onUpdate: () => {
                  const pt = path.getPointAtLength(prog.p * len);
                  pulse.setAttribute('cx', String(pt.x));
                  pulse.setAttribute('cy', String(pt.y));
                },
                onComplete: () => gsap.set(pulse, { opacity: 0 }),
              },
              t,
            );
          }
          t += 0.35; // só segue depois que a linha chegou
        } else {
          // …a faísca contorna a caixa, desenhando o perímetro no percurso
          const trace = el.querySelector<SVGGeometryElement>('.node-trace-rect');
          const spark = el.querySelector<SVGCircleElement>('.node-spark');
          tlFluxo.to(trace, { strokeDashoffset: 0, duration: 0.55, ease: 'power1.inOut' }, t);
          if (trace && spark) {
            const prog = { p: 0 };
            tlFluxo.to(
              prog,
              {
                p: 1,
                duration: 0.55,
                ease: 'power1.inOut',
                onStart: () => {
                  gsap.set(spark, { opacity: 1 });
                },
                onUpdate: () => {
                  const len = trace.getTotalLength();
                  const pt = trace.getPointAtLength(prog.p * len);
                  spark.setAttribute('cx', String(pt.x));
                  spark.setAttribute('cy', String(pt.y));
                },
                onComplete: () => gsap.set(spark, { opacity: 0 }),
              },
              t,
            );
          }
          // contorno fechado → o corpo acende
          tlFluxo
            .to(el.querySelector('.node-fill'), { opacity: 1, duration: 0.24 }, t + 0.52)
            .to(
              el.querySelectorAll('.node-port, .node-accent'),
              { opacity: 1, duration: 0.2 },
              t + 0.56,
            )
            .fromTo(
              el.querySelector('.node-body'),
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' },
              t + 0.56,
            )
            .fromTo(
              el.querySelector('.node-chip'),
              { scale: 0.4, rotate: -12 },
              { scale: 1, rotate: 0, duration: 0.35, ease: 'back.out(2.2)' },
              t + 0.6,
            );
          const check = el.querySelector('.flow-check');
          if (check) {
            tlFluxo.to(check, { strokeDashoffset: 0, duration: 0.25, ease: 'power2.out' }, t + 0.7);
          }
          t += 0.72; // a faísca só parte quando o contorno terminou o curso
        }
      });

    // pulso de conclusão: "pronto — é isso que você viu se formar"
    const halo = flow.querySelector('.flow-halo');
    if (halo) {
      tlFluxo
        .fromTo(
          halo,
          { opacity: 0, scale: 0.9 },
          { opacity: 0.55, scale: 1.04, duration: 0.5, ease: 'power2.out' },
          t,
        )
        .to(halo, { opacity: 0.22, scale: 1, duration: 0.6, ease: 'power2.inOut' }, t + 0.5);
    }

    // linha "viva" (tracejado corrente) quando o fluxo termina de montar
    tlFluxo.call(() => flow.classList.add('flow-live'), undefined, t + 0.6);

    ScrollTrigger.create({
      trigger: flow,
      start: 'top 80%',
      once: true,
      onEnter: () => tlFluxo.play(),
    });
  });
}

export function initEffects(): void {
  // o pin do SystemTree precisa ser criado ANTES dos triggers das seções
  // abaixo dele, senão as posições calculadas ignoram o espaço do pin
  initSystemTree();
  initLineReveals();
  initChat();
  initParallax();
  initCounters();
  initSteps();
  initClips();
}
