---
name: motion-system
description: Use when adding, changing, or reviewing ANY animation, transition, scroll effect, hover state, or page transition in this repo. Read BEFORE importing from motion/react. Triggers on "animate", "animation", "motion", "framer", "transition", "scroll", "reveal", "stagger", "parallax", "hover", "sticky", "fade", "slide", "marquee", "count up", "feels janky", "too slow", "reduced motion".
---

# Motion System

Motion here is restraint, not decoration. **One orchestrated moment per section**, not five competing ones. If a section already has a reveal, the new element joins that reveal rather than starting its own.

## Single source of truth

All easings, durations, and shared variants live in `lib/motion.ts`. Components import; they never define timing inline. A magic `duration: 0.7` in a component file is a bug.

```ts
export const ease = {
  out: [0.16, 1, 0.3, 1], // default reveal
  inOut: [0.65, 0, 0.35, 1], // moves that return
} as const;

export const dur = { micro: 0.18, base: 0.5, reveal: 0.8, hero: 1.2 } as const;

export const spring = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 0.9,
} as const;

export const viewport = { once: true, margin: "-12% 0px -8% 0px" } as const;
```

**The installed package is `motion` (v13), not `framer-motion`.** Framer Motion renamed itself; the `framer-motion` package is a mirror with no `./react` subpath, so `import { motion } from 'motion/react'` only resolves against the `motion` package. Never `npm i framer-motion` — you will get a second copy of the same library and an unresolvable import.

`motion` is the default animation library and stays the default. **`three` is the single named exception**, confined to `lib/scene/` for the one ambient scene (§ The scene, below) — a fragment-shader gradient with refracting glass panes is not something `motion`, CSS, or SVG can produce. No other library gets added without naming the specific capability `motion` lacks; one extra library for one named reason, never a collection.

## Rules

1. **Animate only `transform`, `opacity`, `filter`, `clip-path`.** Never `height`, `width`, `top`, `margin`.
2. **Travel is small.** Reveals move 20–32px. Further looks cheap.
3. **Everything scroll-triggered is `once: true`.** Elements re-animating on scroll-up is the single loudest "AI built this" tell.
4. **Stagger is `0.06–0.09s`.** Slower reads as buffering.
5. **Hover uses springs. Scroll reveals use eased tweens.** Do not mix.
6. **`prefers-reduced-motion` is not optional.** `useReducedMotion()` at the top of every motion component. When true: plain opacity fade, zero travel, no parallax, no infinite loops, no count-ups (render the final number).
7. **`'use client'` at the leaf.** The motion primitive is a client component; the section wrapper stays a server component wherever it can.
8. **Parallax on at most one element per section.**

## The three named techniques

Build these once as primitives in `components/motion/`, then compose. Do not hand-roll a fourth variant of a reveal.

**`<MaskedText />`** — headline reveal. Split by **line, not character** (per-character on a 60px headline is a gimmick and thrashes layout). Each line in `overflow-hidden`; inner span animates `y: '110%' → 0` with `dur.reveal`, `ease.out`, `0.08` stagger. Hero only, plus one section headline max per page.

**`<Reveal />`** — the workhorse. `opacity 0→1`, `y 24→0`, `filter: blur(6px)→blur(0)`. Accepts `delay`. Used for prose, images, single cards.

**`<StaggerGroup />`** — parent holds `staggerChildren`, children consume a shared `item` variant. For the work grid, stat row, team grid, role list. The parent triggers on viewport; **children never carry their own `whileInView`**.

## Micro-interactions

- **Buttons:** `whileHover={{ y: -2 }}`, `whileTap={{ scale: 0.98 }}`, `spring`. Accent glow via `box-shadow` transition — never a scale-up.
- **Cards:** 1px border lightens on hover. Gate on `(hover: hover)` — desktop pointer only.
- **Magnetic pull:** primary CTA only. **One magnetic element on the entire site.**
- **Page transitions:** 400ms opacity + `y` exit/enter via `AnimatePresence` in a client wrapper in `app/layout.tsx`. Nothing more theatrical. Route changes must not restart the ambient scene's own scroll math.
- **Count-ups:** `useMotionValue` + `animate`. No counter library.

## Touch and mobile

Motion here is mobile-first like everything else: the base case runs on a phone, and the pointer-dependent effects are added at a breakpoint.

- **Hover does not exist on touch.** Every hover affordance is gated on `@media (hover: hover)` and paired with a real `:active` state so a tap gives feedback. A card whose only interactivity signal is a hover border is invisible on a phone.
- **Desktop-only enhancements:** magnetic pull, parallax, the Services sticky-row split.
- **The scene is the mobile perf risk.** A `three.js` draw call tracking scroll on a mid-range Android will drop frames. Below `md` and under `prefers-reduced-motion`, `Scene` renders one static frame at `uScroll = 0.5` and stops — no exceptions.
- **Scroll reads are cheap; scattered ambient effects are not.** Motion reads scroll from a `ScrollTimeline` in one shared frameloop, so several `useScroll` calls are not several listeners. Element-relative `useScroll({ target })` is correct for `Parallax`. What is banned is a second ambient background or a per-section page-progress read — `Scene` owns the one passive scroll listener that drives ambient motion (§ The scene, below).
- **`dvh`, never `vh`**, for any motion tied to viewport height.
- Reduced motion still overrides everything above.

## The scene

`Scene.tsx` (`components/layout/Scene.tsx`, logic in `lib/scene/`) is the site's one continuously-animated ambient layer — a `three.js` fullscreen shader plane with a domain-warped gradient and three refracting glass panes, replacing the old scroll-linked background fields.

- **One draw call, lazily loaded.** `Scene.tsx` imports `lib/scene/createScene.ts` inside an effect scheduled with `requestIdleCallback` (1500ms timeout, `setTimeout` fallback), so `three` never enters the initial chunk.
- **One passive scroll listener** inside `Scene.tsx` feeds `uScroll` to the shader. This is the page's single ambient scroll driver — no section adds a second one.
- Pixel ratio capped at 1.5, loop paused on `visibilitychange`, resize debounced 150ms.
- **Below `md` and under reduced motion, it renders one static frame and stops.** If `WebGLRenderer` construction throws, a static CSS gradient fallback underneath the canvas is what's left.
- `three` is permitted for exactly this — a fragment-shader gradient with refracting glass panes is not something `motion`, CSS, or SVG can produce — and it is imported only under `lib/scene/`.

## Above the fold, motion may MOVE but must not HIDE

The single most expensive mistake available here, and it has already been made.

**Anything visible on load animates with CSS, transform only, via `<RiseIn>`.**
Below the fold, keep `<Reveal>` — it is scroll-triggered, so it can never be on
the critical path.

Two separate reasons, both measured on the deployed site:

1. **`Reveal` starts at `opacity: 0` and waits for hydration.** LCP ignores an
   element at zero opacity, so the hero subcopy — the LCP element — landed at
   2.36s against a 0.93s FCP. None of that gap was network: the text was in the
   server HTML the whole time, just invisible.
2. **A fade defeats LCP even without JS.** After moving the hero to a CSS
   animation that still faded in, the subcopy never registered as an LCP
   candidate at all and the metric fell through to a commit-ticker line at
   5.9s. Transform-only fixed it: LCP became 352ms, equal to FCP.

The rule reads as a metric trick and is not one. An element the user cannot
read is not painted, and LCP is right to say so. Never "fix" this by fading
from `0.01` instead of `0`.

`MaskedText` is CSS-driven and a server component for the same reason. Its
clipped lines still cannot be an LCP candidate — a clipped element paints at
near-zero size and LCP never re-measures an element that grows — so the
headline is not the LCP element and must not be relied on to be.

CI guards both halves: `rise-in` must stay transform-only, and `Hero.tsx` must
not import `Reveal`.

## Performance

- The ambient scene is the one long-running loop on the page; everything else in `components/motion/` is finite. Kill the scene's loop entirely under reduced motion and below `md` — a static frame, not a slowed one.
- `will-change` only on elements actually mid-animation; never blanket-applied.
- Never animate a `backdrop-filter` value.

## Reject on sight

- `once: false` on a scroll reveal.
- Per-character splitting on a long headline.
- Animating `height`/`width`/`margin`.
- A second parallax element in one section.
- A component that imports `motion/react` but not `lib/motion.ts`.
- A motion component with no `useReducedMotion()` call.
- `<Reveal>`, or any opacity-based entrance, on anything visible without scrolling.
- A second `three` scene, or a `three` import outside `lib/scene/`.

## Related

[design-system](../design-system/SKILL.md) · [building-a-section](../building-a-section/SKILL.md) · [quality-gate](../quality-gate/SKILL.md)
