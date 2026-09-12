---
name: design-system
description: Use when writing or reviewing ANY visual code in this repo — Tailwind classes, globals.css, colors, glass surfaces, typography, spacing, radius, shadows, borders, the grain overlay, or the ambient scene. Read BEFORE the first line of markup. Triggers on "style", "color", "theme", "glass", "card", "border", "font", "heading", "spacing", "layout", "dark", "accent", "looks off", "make it prettier".
---

# Design System

The direction is fixed: **quiet obsidian, one indigo, frosted glass.** Every color, radius, and shadow derives from the tokens below. A raw hex or an off-scale value in a component file is a bug, not a shortcut.

## Mobile first — read this before the first class name

**The unprefixed class is the mobile implementation. `md:` and `lg:` may only add.** A breakpoint prefix that undoes something the base declared means the base was written for desktop and is wrong.

Design at 360px first: decide what the thing is when there is no room, then spend the extra width. Everything desktop-only — the Services sticky-row split, magnetic pull, parallax — is an enhancement layered on top of a base case that is already complete. The ambient scene and the "Recently shipped" panel are not desktop-only: the scene renders a static frame below `md`, and the panel is ordinary hero content that stacks on phones.

- `dvh`, never `vh`. iOS Safari's collapsing toolbar makes `100vh` overflow.
- `env(safe-area-inset-*)` on the sticky header, the nav overlay, and anything fixed.
- Every `next/image` sets a real `sizes`. Without it, mobile downloads the desktop asset.
- Touch has no hover: every interactive element is legible and obviously interactive at rest. Hover affordances go behind `@media (hover: hover)`; touch gets a real `:active` state.
- Horizontal scrollers use `overscroll-behavior-x: contain` and never scroll the page sideways.

## Tokens — roles, never colours

Declared once in `app/globals.css`, exposed to Tailwind via `@theme`. Never redeclared per component. **Both themes are first-class**: `.dark` on `<html>` swaps the values, so a token name can never mention a colour.

| Utility                                 | Role                   | Light           | Dark         |
| --------------------------------------- | ---------------------- | --------------- | ------------ |
| `bg-surface`                            | page background        | `#FAFBFC`       | `#06070A`    |
| `bg-raised`                             | cards, raised surfaces | `#FFFFFF`       | `#0E1017`    |
| `bg-inset`                              | hover, inset panels    | `#F1F3F6`       | `#171A22`    |
| `border-line` / `border-line-strong`    | every border, 1px      | black 10% / 22% | ice 8% / 22% |
| `text-fg`                               | primary text           | `#0E1017`       | `#E8EDF5`    |
| `text-muted`                            | secondary, captions    | `#5A6274`       | `#8A93A6`    |
| `bg-accent`                             | the accent **fill**    | `#3B5BDB`       | `#6E82FF`    |
| `text-accent-on`                        | ink **on** the fill    | `#FFFFFF`       | `#06070A`    |
| `text-accent-ink` / `border-accent-ink` | accent **text/border** | `#3B5BDB`       | `#6E82FF`    |

Radius: `rounded-sm` 10px, `rounded-md` 16px, `rounded-lg` 24px. Nothing fully rounded except avatars and pills.

Also themed: `--glass-fill`, `--glass-catch`, `--glass-drop`, `--grain-opacity` (`0.02` dark / `0.012` light), and the scene tokens `--scene-a/b/c` + `--scene-pane` (§ Signature element, below).

## The accent's two roles — the thing that breaks light mode

`--accent` is a **fill**. `--accent-ink` is for **text and borders**. They currently hold the same hex per theme, but the two names stay distinct because the fill and the ink are allowed to diverge again — do not collapse them into one variable in code.

Indigo `#3B5BDB` (light) / `#6E82FF` (dark) as text on `--surface` clears 5.5:1 and 6.0:1. `--accent-on` — the ink that sits **on top of** the fill, white on light and `#06070A` on dark — is a different token from `--accent-ink` and is tuned for a different background. Using `text-accent-on` for body text or a border reads correctly on the fill and fails everywhere else.

**Using `text-accent-on` where `text-accent-ink` belongs ships unreadable or mismatched text, and it may still look fine sitting directly on the button it was tuned for.**

## Accent discipline

The accent appears on **one element per viewport-height of scroll** — the thing you want clicked or read first.

- If two things glow, nothing glows.
- Body copy never takes the accent.
- Borders never take it, except `:focus-visible` and the active nav item.
- Tailwind's stock palette colours (`cyan-400`, `indigo-500`, whatever) are not our accent. Use the token.

When adding a section, ask what already glows in this viewport. If something does, your new element does not.

## Translucent layers do not translate between themes

A colour that works on dark will not work on light by symmetry, and this bites hardest on anything semi-transparent — ambient washes, tinted overlays, glass.

The scroll-background fields shipped invisible in light mode: a bright field at `0.14` alpha is a **2.8x luminance step** over near-black and **1.04x** over `#FAFBFC`. Same alpha, same colour, one theme sees it and the other sees nothing.

**Bake the alpha into a themed token** (`--field-a/b/c`), so light can use a deeper, more saturated hue at roughly double the alpha, and let the component animate only a relative `0..1` band on top. Never theme this by reading the theme in JS — that costs a flash on first paint.

## Tailwind v4: CSS variables use PARENTHESES, not brackets

`duration-[--d-base]` is wrong. The bracket form is an arbitrary _literal_, so
it compiles to `transition-duration: --d-base` — a bare property name as a
value, which is invalid, silently dropped, and falls back to `0s`.

The variable shorthand is `duration-(--d-base)` → `var(--d-base)`.

This shipped across 11 files and 21 usages before anyone noticed, because a
transition that does not run looks like a transition that is simply fast. Same
rule for every var-driven utility: `ease-(--e-out)`, `w-(--x)`, and so on.

## Checking a change

Both themes, every time. `--muted` is the token that fails first — the dark-mode `#8A93A6` is only 3.09:1 on white. Toggle and re-read before calling anything done.

## Glass recipe

One recipe, one Tailwind `@utility glass`. Do not invent a variant per section.

```css
background: var(--glass-fill);
border: 1px solid var(--line);
backdrop-filter: blur(24px) saturate(160%);
box-shadow:
  0 1px 0 0 var(--glass-catch) inset,
  0 20px 50px -24px var(--glass-drop);
border-radius: var(--r-md);
```

**Usage pattern: `rounded-md border border-line bg-raised md:glass`.** Solid `bg-raised` on phones, the blurred `glass` utility from `md` up — this is how every card, row, and panel in the home body is built. `Header` and `Modal` use `glass` unprefixed; they're the two blurred surfaces the mobile budget allows.

Every value is themed. On light the fill lightens and the catch dims — the recipe is one shape, not one set of numbers.

Two conditions, both required:

1. **Glass needs something to refract.** Every glass surface sits above the grain layer or the ambient scene. Over a flat `--surface` it reads as a grey rectangle and you spent the blur budget for nothing.
2. **Budget: 2 blurred surfaces per viewport below `md`, ~6 above.** Never stacked more than two deep, never on a full-page wrapper. `backdrop-filter` is the most expensive thing on this page, and a mid-range Android GPU is where it shows.

Below `md`, any glass surface that is not the header or a modal falls back to solid `bg-raised` with the same 1px `border-line`. The difference is nearly invisible and the cost drops to zero.

## Typography

Two font families, loaded with `next/font/google`, `display: 'swap'`, exposed as CSS variables. No `<link>` tags.

- **Geist Sans** — `--font-display` and `--font-body` both resolve to it. Headings and body share one family: weight 600, tracking `-0.02em`, `text-balance` on every headline, `h1` line-height `1.0`.
- **Geist Mono** — `--font-mono`. Reserved for commit shas and stat figures only. Not preloaded — Geist Sans is (it's the LCP-path face).
- **Eyebrows are small sans labels in sentence case.** No mono, no uppercase, no index number.

Fluid scale via `clamp()`: display `clamp(2.5rem, 1.6rem + 4vw, 5.5rem)` · h2 `clamp(1.75rem, 1.3rem + 2vw, 3rem)` · h3 `1.25–1.5rem` · body `1.0625rem` · small `0.875rem`.
Line height: `1.0` display/h1 · `1.1` h2 · `1.65` body.

**Set the floor from the smallest screen.** At 360px the container is 312px wide; a large face at 56px fits about seven characters per line, so a short headline breaks into five ragged lines. 40px holds it in two or three.

## Space and layout

- 4px grid. No `p-[13px]`.
- Section rhythm: `py-16 md:py-24`. **This is the gap BETWEEN two sections** — adjacent sections each contribute half, so the visible space is 128px mobile / 192px desktop. Reading it as per-section padding doubles every gap. Do not fight it per section.
- Container: `max-w-[1240px] px-6 md:px-10`. One container component, used everywhere.
- Radius: `rounded-sm` 10px, `rounded-md` 16px, `rounded-lg` 24px.
- Grain overlay lives once in `app/layout.tsx`: SVG `feTurbulence` at `var(--grain-opacity)` (`0.02` dark / `0.012` light), `pointer-events-none`, `fixed inset-0 z-50`. It's what makes the surface read as film rather than a flat fill.

## The signature element — the scene

`<Scene />` (`components/layout/Scene.tsx`, logic in `lib/scene/`) is a fixed, full-page `three.js` layer behind everything: one draw call — an orthographic camera, a fullscreen plane, one `ShaderMaterial` — drawing a slow domain-warped gradient plus three frosted glass panes that drift and tilt with scroll. This is the one memorable thing on the site.

The hero's "Recently shipped" glass panel is the other half of the signature: a static list of the last three commits (message, repo, relative time; sha in Geist Mono). **No other section gets a second scene-stealer.** Before adding a bold new visual idea, check it does not compete with either of these.

`three` is imported only under `lib/scene/`. `Scene.tsx` loads it lazily via `requestIdleCallback`, so it never enters the initial chunk. Below `md` and under `prefers-reduced-motion` the scene renders one static frame and stops — no exceptions, and no separate mobile "form" to design, since the fallback state already exists on every size. See [motion-system](../motion-system/SKILL.md) for the scroll-driver and performance rules.

## Reject on sight

- Purple-to-blue gradient blobs. Glow on everything.
- A second accent color. A per-section glass variant.
- Borders heavier than 1px, or any border that is not `--line`.
- Emoji as icons — we have `lucide-react`.
- A hardcoded hex, rem, or shadow that does not trace to a token.
- A `md:` or `lg:` class that undoes the base rather than adding to it.
- `100vh`, a `next/image` with no `sizes`, or a hover-only affordance with no touch equivalent.
- Mono anywhere but a commit sha or a stat figure.
- A second `three` scene, or a `three` import outside `lib/scene/`.

## Related

[motion-system](../motion-system/SKILL.md) · [building-a-section](../building-a-section/SKILL.md) · [quality-gate](../quality-gate/SKILL.md)
