# Marca AI — Brand Guidelines

> Fonte da verdade da marca. Alterações aqui devem ser sincronizadas com
> `assets/design-tokens.json` / `.css` (`npm run tokens:sync`) e refletidas em
> `src/styles/global.css`.

## Identidade

- **Nome:** Marca AI
- **Domínio:** marca-ai.online (app em app.marca-ai.online)
- **Posicionamento:** Sistema operacional de atendimento, agenda e automação para negócios locais. Não é "mais um inbox de WhatsApp".
- **Protagonista:** Maya — a IA que atende no WhatsApp como recepcionista real: objetiva, carismática, proativa, humana. Nunca expõe termo técnico, nunca inventa horário/serviço/preço, só confirma quando marcou de verdade, sabe a hora de chamar um humano.
- **Público (ordem):** barbearias → salões de beleza → clínicas de estética → manicure → sobrancelha/cílios → negócios locais high ticket com agenda.
- **Prova social:** piloto ativo na barbearia Espaço Vinícius Maçon.

## Voz

- Confiante e direta, orientada a benefício. PT-BR.
- Fala com o dono do negócio, não com desenvolvedor. Zero jargão técnico.
- Hierarquia de valor: organização + resposta rápida + lembrete que reduz falta → depois a IA que agenda sozinha como diferencial.

## Cores

**Regra de marca:** preto = identidade/estrutura · laranja = ação/valor de produto. **Nenhum fundo preto no site.**

### Quick Reference

| Role | Hex |
|------|-----|
| Primary Color | #FF6A21 |
| Secondary Color | #111827 |
| Accent Color | #16A34A |

### Primary Colors

| Nome | Hex | Uso |
|------|-----|-----|
| Laranja Marca AI | #FF6A21 | CTA, ação, destaque, acento |
| Laranja Light | #FFF7ED | Tint para seções/realces suaves (`--brand-soft`) |
| Laranja Dark | #E14E0A | Hover/active de CTA |

> Nota: o laranja medido no miolo da logo (JPEG) é ≈ `#E87430`, mais queimado.
> Mantido `#FF6A21` como cor de ação digital (mapa de arquitetura do projeto);
> `--brand-logo: #E87430` fica disponível para contextos que precisem casar com a logo impressa.

### Secondary Colors

| Nome | Hex | Uso |
|------|-----|-----|
| Preto de identidade | #111827 | Texto, estrutura — nunca como fundo de seção |
| Cinza Light | #6B7280 | Texto secundário (`--muted`) |

### Accent Colors

| Nome | Hex | Uso |
|------|-----|-----|
| Verde confirmado | #16A34A | Status "confirmado"/ok, uso pontual |

### Neutros de superfície

| Nome | Hex | Uso |
|------|-----|-----|
| Base | #FFFFFF | Fundo padrão |
| Off-white quente | #FAF7F2 | Alternância de seções |
| Linha | #EDE8E1 | Divisórias sutis |

## Tipografia

| Papel | Fonte | Pesos | Origem |
|-------|-------|-------|--------|
| Display/Títulos | Clash Display | 600–700 | Fontshare (self-host) |
| Corpo | General Sans | 400–500 | Fontshare (self-host) |
| Micro-labels/números/status | Space Mono | 400, 700 | Google Fonts (self-host) |

Regras: `font-display: swap`, preload da fonte do LCP, subset latin.

## Acessibilidade

- Contraste AA. Laranja **nunca** em texto pequeno — texto usa `#111827`; laranja é acento/CTA/display grande.
- `prefers-reduced-motion` respeitado globalmente.

## Logo

- Arquivo fonte: `materiais/logomarcaai.jpeg` (lettering brush "Marca" preto + "AI" laranja).
- Uso sobre fundos claros apenas. Pendente: versão PNG transparente/SVG.
