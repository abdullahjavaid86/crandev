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
  out:   [0.16, 1, 0.3, 1],      // default reveal
  inOut: [0.65, 0, 0.35, 1],     // moves that return
} as const;

export const dur = { micro: 0.18, base: 0.5, reveal: 0.8, hero: 1.2 } as const;

export const spring = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 } as const;

export const viewport = { once: true, margin: '-12% 0px -8% 0px' } as const;
```

**The installed package is `motion` (v13), not `framer-motion`.** Framer Motion renamed itself; the `framer-motion` package is a mirror with no `./react` subpath, so `import { motion } from 'motion/react'` only resolves against the `motion` package. Never `npm i framer-motion` — you will get a second copy of the same library and an unresolvable import.

It is the only animation library. No GSAP, AOS, or react-spring.

## Rules

1. **Animate only `transform`, `opacity`, `filter`, `clip-path`.** Never `height`, `width`, `top`, `margin`.
2. **Travel is small.** Reveals move 20–32px. Further looks cheap.
3. **Everything scroll-triggered is `once: true`.** Elements re-animating on scroll-up is the single loudest "AI built this" tell.
4. **Stagger is `0.06–0.09s`.** Slower reads as buffering.
5. **Hover uses springs. Scroll reveals use eased tweens.** Do not mix.
6. **`prefers-reduced-motion` is not optional.** `useReducedMotion()` at the top of every motion component. When true: plain opacity fade, zero travel, no parallax, no infinite loops, no count-ups (render the final number).
7. **`'use client'` at the leaf.** The motion primitive is a client component; the section wrapper stays a server component wherever it can.
8. **Parallax on at most one element per section.**

## The four named techniques

Build these once as primitives in `components/motion/`, then compose. Do not hand-roll a fifth variant of a reveal.

**`<MaskedText />`** — headline reveal. Split by **line, not character** (per-character on a 60px headline is a gimmick and thrashes layout). Each line in `overflow-hidden`; inner span animates `y: '110%' → 0` with `dur.reveal`, `ease.out`, `0.08` stagger. Hero only, plus one section headline max per page.

**`<Reveal />`** — the workhorse. `opacity 0→1`, `y 24→0`, `filter: blur(6px)→blur(0)`. Accepts `delay`. Used for prose, images, single cards.

**`<StaggerGroup />`** — parent holds `staggerChildren`, children consume a shared `item` variant. For the work grid, stat row, team grid, role list. The parent triggers on viewport; **children never carry their own `whileInView`**.

**Card stacking** — Services only, and **desktop only**. The base case is a plain vertical list of cards with a normal `<Reveal />` each; sticky stacking is an enhancement added at `lg` and up. Build the list first and confirm it reads well, then layer the stack on: each card `sticky top-24` inside a tall parent, the previous scaling to `0.94` and dimming to `0.5` via `useScroll` + `useTransform` on the container. Sticky stacking in a 700px viewport is unusable, so it is never the thing you write first and strip back.

## Micro-interactions

- **Buttons:** `whileHover={{ y: -2 }}`, `whileTap={{ scale: 0.98 }}`, `spring`. Cyan glow via `box-shadow` transition — never a scale-up.
- **Cards:** 1px border lightens on hover; cursor-following radial highlight via `--mx`/`--my` CSS vars set in `onMouseMove`, **throttled with `requestAnimationFrame`**. Gate on `(hover: hover)` — desktop pointer only.
- **Magnetic pull:** primary CTA only. **One magnetic element on the entire site.**
- **Page transitions:** 400ms opacity + `y` exit/enter via `AnimatePresence` in a client wrapper in `app/layout.tsx`. Nothing more theatrical. Route changes must not restart the Ship Log rail's own scroll math.
- **Count-ups:** `useMotionValue` + `animate`. No counter library.

## Touch and mobile

Motion here is mobile-first like everything else: the base case runs on a phone, and the pointer-dependent effects are added at a breakpoint.

- **Hover does not exist on touch.** Every hover affordance is gated on `@media (hover: hover)` and paired with a real `:active` state so a tap gives feedback. A card whose only interactivity signal is a hover border is invisible on a phone.
- **Desktop-only enhancements:** magnetic pull, cursor-following radial highlight, parallax, sticky card stacking. None of them are the base case.
- **Ambient hero glows are the mobile perf risk.** Two infinite-looping `blur(120px)` layers on a mid-range Android will drop frames. Below `md`, render them static — the drift is imperceptible on a small screen and the loop is not worth the battery.
- **The rail is desktop.** Below `lg`, scroll progress is a 2px bar under the header, not a rail. Do not animate a rail that has nowhere to sit.
- **`dvh`, never `vh`**, for any motion tied to viewport height.
- Reduced motion still overrides everything above.

## Performance

- Long-running ambient loops (hero radial glows) use `blur(120px)` at very low opacity and a long `ease.inOut` infinite loop. Kill the loop entirely under reduced motion, not just slow it.
- `will-change` only on elements actually mid-animation; never blanket-applied.
- Never animate a `backdrop-filter` value.

## Reject on sight

- `once: false` on a scroll reveal.
- Per-character splitting on a long headline.
- Animating `height`/`width`/`margin`.
- A second parallax element in one section.
- A component that imports `motion/react` but not `lib/motion.ts`.
- A motion component with no `useReducedMotion()` call.

## Related

[design-system](../design-system/SKILL.md) · [building-a-section](../building-a-section/SKILL.md) · [quality-gate](../quality-gate/SKILL.md)
