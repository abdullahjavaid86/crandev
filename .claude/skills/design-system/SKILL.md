---
name: design-system
description: Use when writing or reviewing ANY visual code in this repo — Tailwind classes, globals.css, colors, glass surfaces, typography, spacing, radius, shadows, borders, the grain overlay, or the Ship Log rail. Read BEFORE the first line of markup. Triggers on "style", "color", "theme", "glass", "card", "border", "font", "heading", "spacing", "layout", "dark", "accent", "cyan", "looks off", "make it prettier".
---

# Design System

The direction is fixed: **deep obsidian, neon cyan, restrained glass.** Every color, radius, and shadow derives from the tokens below. A raw hex or an off-scale value in a component file is a bug, not a shortcut.

## Mobile first — read this before the first class name

**The unprefixed class is the mobile implementation. `md:` and `lg:` may only add.** A breakpoint prefix that undoes something the base declared means the base was written for desktop and is wrong.

Design at 360px first: decide what the thing is when there is no room, then spend the extra width. Everything desktop-only — sticky stacking, the Ship Log rail, magnetic pull, cursor highlights, parallax — is an enhancement layered on top of a base case that is already complete.

- `dvh`, never `vh`. iOS Safari's collapsing toolbar makes `100vh` overflow.
- `env(safe-area-inset-*)` on the sticky header, the nav overlay, and anything fixed.
- Every `next/image` sets a real `sizes`. Without it, mobile downloads the desktop asset.
- Touch has no hover: every interactive element is legible and obviously interactive at rest. Hover affordances go behind `@media (hover: hover)`; touch gets a real `:active` state.
- Horizontal scrollers use `overscroll-behavior-x: contain` and never scroll the page sideways.

## Tokens

Declared once in `app/globals.css` as CSS variables, exposed to Tailwind via `@theme`. Never redeclare them per component.

| Token | Value | Role |
|---|---|---|
| `--void` | `#06070A` | page background, deepest layer |
| `--carbon` | `#0E1017` | raised surfaces, cards |
| `--graphite` | `#171A22` | hover state, inset panels |
| `--hairline` | `rgba(232,237,245,0.08)` | every border, 1px, never heavier |
| `--ice` | `#E8EDF5` | primary text |
| `--mist` | `#8A93A6` | secondary text, captions |
| `--cyan` | `#35F0DC` | THE accent — signature only |
| `--ion` | `#4C6FFF` | secondary glow, gradient partner to cyan |

Radius: `--r-sm 8px`, `--r-md 14px`, `--r-lg 24px`. Nothing fully rounded except avatars and pills.

## Accent discipline — the rule people break first

Cyan appears on **one element per viewport-height of scroll**. It marks the thing you want clicked or read first.

- If two things glow, nothing glows.
- Body copy is never cyan.
- Borders are never cyan, except `:focus-visible` and the active nav item.
- Tailwind's stock `cyan-400` is not our cyan. Use the token.

When adding a section, ask: what already glows in this viewport? If something does, your new element does not.

## Glass recipe

One recipe. Do not invent a variant per section.

```css
background: linear-gradient(148deg, rgba(232,237,245,0.055), rgba(232,237,245,0.015));
border: 1px solid var(--hairline);
backdrop-filter: blur(20px) saturate(140%);
box-shadow:
  0 1px 0 0 rgba(232,237,245,0.06) inset,   /* top light catch */
  0 24px 60px -24px rgba(0,0,0,0.7);
```

Two conditions, both required:

1. **Glass needs something to refract.** Every glass surface sits above the grain layer or a soft radial glow. Over flat `--void` it reads as grey rectangle and you spent the blur budget for nothing.
2. **Budget: 2 blurred surfaces per viewport below `md`, ~6 above.** Never stacked more than two deep, never on a full-page wrapper. `backdrop-filter` is the most expensive thing on this page, and a mid-range Android GPU is where it shows.

Below `md`, any glass surface that is not the sticky header or a modal falls back to solid `--carbon` with the same hairline border. Against a dark ground the difference is nearly invisible and the cost drops to zero.

## Typography

Three roles, loaded with `next/font/google`, `display: 'swap'`, exposed as CSS variables. No `<link>` tags.

- **Display — Bricolage Grotesque** (variable). Headlines only. `tracking-[-0.03em]`, weight 600–700, `text-balance` on every headline.
- **Body — Inter Tight**. Paragraphs, buttons, nav. Weight 400/500. Max measure `65ch`.
- **Utility — JetBrains Mono**. Eyebrows, section numbers, stat labels, metadata. Always `uppercase tracking-[0.18em] text-xs` in `--mist`.

The mono face is a signal, not decoration: it means *machine output*. Use it for repo names, dates, latency figures, stack labels, role IDs, timestamps. Never on prose.

Fluid scale via `clamp()`: display `2.5–6.5rem` · h2 `1.75–3.5rem` · h3 `1.25–1.5rem` · body `1.0625rem` · small `0.875rem`.
Line height: `0.95` display · `1.1` h2 · `1.65` body.

**Set the floor from the smallest screen.** At 360px the container is 312px wide; a 56px condensed grotesque fits about seven characters per line, so a short headline breaks into five ragged lines. 40px holds it in two or three.

## Space and layout

- 4px grid. No `p-[13px]`.
- Section rhythm: `py-28 md:py-40`. Do not fight this per section.
- Container: `max-w-[1240px] px-6 md:px-10`. One container component, used everywhere.
- Grain overlay lives once in `app/layout.tsx`: SVG `feTurbulence`, `opacity: 0.028`, `pointer-events-none`, `fixed inset-0 z-50`. It is what makes the dark read as film rather than `#000`.

## The signature element — Ship Log

A thin vertical rail in the left gutter on desktop that tracks scroll. Each section is a "commit": monospace hash, timestamp, and a node that lights cyan as the section enters the viewport. In the hero it extends into a live commit ticker fed by the GitHub route handler.

This is the one memorable thing on the site. **No other section gets a second scene-stealer.** Before adding a bold new visual idea, check it does not compete with the rail.

**Below `lg` the rail changes form rather than shrinking** — there is no gutter to pin to at 360px. Mobile gets a 2px cyan scroll-progress bar fixed under the header, and the active section's mono hash and number ride in that section's own eyebrow. Same information, same voice, no rail. The hero commit ticker stays on every size; it is content, not chrome.

The rail persists across routes (see [adding-a-page](../adding-a-page/SKILL.md)) — every page registers its sections with it rather than inventing its own progress indicator.

## Reject on sight

- Purple-to-blue gradient blobs. Glow on everything.
- A second accent color. A per-section glass variant.
- Borders heavier than 1px, or any border that is not `--hairline`.
- Emoji as icons — we have `lucide-react`.
- A hardcoded hex, rem, or shadow that does not trace to a token.
- A `md:` or `lg:` class that undoes the base rather than adding to it.
- `100vh`, a `next/image` with no `sizes`, or a hover-only affordance with no touch equivalent.

## Related

[motion-system](../motion-system/SKILL.md) · [building-a-section](../building-a-section/SKILL.md) · [quality-gate](../quality-gate/SKILL.md)
