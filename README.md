# Marca AI — Landing (Motion v1)

Landing page da **Marca AI** (`marca-ai.online`) — sistema operacional de atendimento,
agenda e automação para negócios locais, com a **Maya** (IA recepcionista no WhatsApp)
como protagonista.

## Stack

- **Astro 5** + TypeScript strict (build estático)
- **Tailwind CSS v4** (tokens via CSS vars + `@theme`)
- **GSAP + ScrollTrigger** (motion / scroll-driven)
- **Lenis** (smooth scroll sincronizado com ScrollTrigger)

## Comandos

| Comando | O que faz |
|---|---|
| `npm install` | Instala dependências |
| `npm run dev` | Dev server em `localhost:4321` |
| `npm run build` | `astro check` (TS strict) + build de produção em `dist/` |
| `npm run preview` | Serve o build local |
| `npm run tokens:sync` | Sincroniza `docs/brand-guidelines.md` → `assets/design-tokens.{json,css}` |
| `npm run tokens:validate` | Acusa cores hardcoded em `src/` |

## Fontes da verdade

- `docs/brand-guidelines.md` — marca, cores, tipografia, voz.
- `design-system/marca-ai/MASTER.md` — regras globais de UI (com override de marca).
- `src/styles/global.css` — tokens implementados (primitivo → semântico → Tailwind `@theme`).

## Regras duras

- **Nenhum fundo preto.** Preto `#111827` é texto/estrutura; laranja `#ff6a21` é ação/CTA.
- Laranja nunca em texto pequeno (contraste AA) — texto usa `--ink`.
- Componentes usam apenas tokens (`var(--…)` / utilitários do `@theme`), nunca hex.
- `prefers-reduced-motion`: conteúdo sempre visível sem animação (a classe `.motion-ok`
  no `<html>` é pré-condição de qualquer estado inicial oculto).

## Motion

- `src/scripts/motion/lenis-setup.ts` — Lenis roda no ticker do GSAP; `lenis.on('scroll', ScrollTrigger.update)`; `ScrollTrigger.refresh()` debounced no resize.
- `src/scripts/motion/index.ts` — bootstrap; reveals genéricos via `[data-reveal]` (+ `data-reveal-delay`).
- Animar apenas `transform`/`opacity`.

## Estrutura

```
docs/brand-guidelines.md      fonte da verdade da marca
assets/design-tokens.*        artefatos gerados (skill brand/design-system)
design-system/marca-ai/       MASTER.md (ui-ux-pro-max, com override de marca)
public/fonts/                 Clash Display, General Sans, Space Mono (self-host)
public/frames/                (Etapa 2) sequência de frames do hero
src/layouts/Base.astro        head/SEO/preload + Header/Footer
src/components/               Header, Footer, Button…
src/sections/                 (Etapa 3) seções da landing
src/scripts/motion/           Lenis/GSAP setup e efeitos
materiais/                    vídeo do hero (5s, 960×960) e logo
```

## Roadmap (RPI)

- [x] Etapa 0 — Research + plano
- [x] Etapa 1 — Fundação (tokens, fontes, layout base, Lenis+GSAP)
- [x] Etapa 2 — Hero scroll-driven video (120 frames webp em canvas, 2.7 MB)
- [x] Etapa 3 — Seções de conteúdo com copy real PT-BR
- [x] Etapa 4 — Polish de motion & parallax
- [x] Etapa 5 — Performance, acessibilidade, SEO & QA

## Checklist de qualidade (v1)

### Performance
- [x] Poster do hero (`<img fetchpriority=high>`, ~20 KB) protege o LCP; canvas assume depois
- [x] JS total ~52 KB gzip (orçamento: 90 KB)
- [x] Frames: 120 webp / 2.7 MB, carregamento progressivo por passadas; mobile usa metade
- [x] Fontes woff2 subset latin (~110 KB), preload das 2 fontes do above-the-fold
- [x] Só `transform`/`opacity` animados; listeners passivos; DPR do canvas limitado a 2
- [ ] Lighthouse ≥ 90 mobile/desktop — **medir em produção/preview com Chrome**

### Acessibilidade
- [x] HTML semântico (header/nav/main/section/footer, h1 único, listas, dl, figure)
- [x] Contraste AA: texto em `--ink`/`--muted`; laranja só em CTA/acento/mono-labels
- [x] Foco visível (`:focus-visible` outline laranja), touch targets ≥ 44px nos CTAs
- [x] `prefers-reduced-motion`: conteúdo 100% visível sem animação (classe `.motion-ok`)
- [x] Chat da Maya com `role=figure` + `aria-label`; decorativos com `aria-hidden`
- [ ] Teste com leitor de tela e teclado em dispositivo real

### SEO
- [x] Title/description focados em "IA de atendimento e agendamento no WhatsApp"
- [x] OG/Twitter cards + `og.jpg` 1200×630
- [x] JSON-LD Organization, canonical, `robots.txt`, `sitemap.xml`, `lang=pt-BR`

### Pendências para o lançamento
- [ ] Número real do WhatsApp nos links `https://wa.me/` (hoje sem número)
- [ ] Depoimento + nome/foto do piloto Espaço Vinícius Maçon (placeholders em `Prova.astro`)
- [ ] Confirmar tom do laranja (`#ff6a21` token vs `#e87430` medido na logo)
- [ ] Lighthouse em produção e teste iOS/Android reais
