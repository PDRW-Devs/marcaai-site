# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Marca AI
**Generated:** 2026-07-07 15:38:16
**Category:** Beauty/Spa/Wellness Service
**Design Dials:** Variance 5/10 (Balanced / Modern) | Motion 8/10 (Complex) | Density 4/10 (Standard)

---

## Global Rules

### Color Palette

> **OVERRIDE DE MARCA:** cores e tipografia abaixo são os tokens REAIS da Marca AI
> (fonte da verdade: `docs/brand-guidelines.md`). A paleta navy/gold sugerida pelo
> gerador foi descartada. **Regra dura: nenhum fundo preto.**

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary / CTA (laranja Marca AI) | `#FF6A21` | `--brand` |
| Brand Soft (tint p/ seções) | `#FFF7ED` | `--brand-soft` |
| Brand Hover/Active | `#E14E0A` | `--brand-strong` |
| Foreground (preto de identidade — texto, nunca fundo) | `#111827` | `--ink` |
| Muted text | `#6B7280` | `--muted` |
| Background | `#FFFFFF` | `--bg` |
| Background warm (alternância) | `#FAF7F2` | `--bg-warm` |
| Border/divisórias | `#EDE8E1` | `--line` |
| Success ("confirmado") | `#16A34A` | `--success` |

**Color Notes:** laranja = ação/valor de produto; preto = identidade/estrutura (texto apenas). Laranja nunca em texto pequeno (AA).

### Typography

- **Heading Font:** Clash Display 600/700 (Fontshare, self-host)
- **Body Font:** General Sans 400/500 (Fontshare, self-host)
- **Mono (labels/números/status):** Space Mono 400/700 (self-host)
- Sem `@import` de CDN — fontes self-host em `public/fonts/` com `font-display: swap` e preload da display.

### Spacing Variables

*Density: 4/10 — Standard*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--brand); /* #FF6A21 */
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--ink);
  border: 2px solid var(--ink);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: var(--bg-warm);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: var(--brand);
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 15%, transparent);
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Minimal & Direct

**Keywords:** Minimal text, white space heavy, single column layout, direct messaging, clean typography, visual-centric, fast-loading

**Best For:** Simple service landing pages, indie products, consulting services, micro SaaS, freelancer portfolios

**Key Effects:** Very subtle hover effects, minimal animations, fast page load (no heavy animations), smooth scroll

### Page Pattern

**Pattern Name:** Scroll-Triggered Storytelling

- **Conversion Strategy:** Narrative increases time-on-page 3x. Use progress indicator. Mobile: simplify animations.
- **CTA Placement:** End of each chapter (mini) + Final climax CTA
- **Section Order:** 1. Intro hook, 2. Chapter 1 (problem), 3. Chapter 2 (journey), 4. Chapter 3 (solution), 5. Climax CTA

---

## Motion

**Page Transition** (Complex) — Trigger: route change | Duration: 500-800ms | Easing: `expo.inOut`

```js
const state = Flip.getState('.hero-image'); navigate(); Flip.from(state, { duration: 0.6, ease: 'expo.inOut', absolute: true, zIndex: 100 });
```

**Framework notes:** Requires the GSAP Flip plugin; the 'from' and 'to' route must render the same element with a shared data-flip-id

- ✅ Verify the shared element exists in both DOM states before calling Flip.from to avoid a silent no-op
- ❌ Don't use shared-element transitions across more than one element pair per navigation; compounding Flips are hard to time correctly
- ⚡ Flip recalculates layout (FLIP technique) so test on low-end devices for jank

---

## Anti-Patterns (Do NOT Use)

- ❌ Bright neon colors
- ❌ Harsh animations
- ❌ Dark mode

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
