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

## Tokens — roles, never colours

Declared once in `app/globals.css`, exposed to Tailwind via `@theme`. Never redeclared per component. **Both themes are first-class**: `.dark` on `<html>` swaps the values, so a token name can never mention a colour.

| Utility | Role | Light | Dark |
|---|---|---|---|
| `bg-surface` | page background | `#FAFBFC` | `#06070A` |
| `bg-raised` | cards, raised surfaces | `#FFFFFF` | `#0E1017` |
| `bg-inset` | hover, inset panels | `#F1F3F6` | `#171A22` |
| `border-line` / `border-line-strong` | every border, 1px | black 10% / 22% | ice 8% / 22% |
| `text-fg` | primary text | `#0E1017` | `#E8EDF5` |
| `text-muted` | secondary, captions | `#5A6274` | `#8A93A6` |
| `bg-accent` + `text-accent-on` | the accent **fill** | cyan + dark ink | cyan + dark ink |
| `text-accent-ink` | accent **text/border** | `#0A6B5E` | `#35F0DC` |
| `--ion` | secondary glow | `#3A55D9` | `#4C6FFF` |

Radius: `rounded-sm` 8px, `rounded-md` 14px, `rounded-lg` 24px. Nothing fully rounded except avatars and pills.

Also themed: `--glass-tint`, `--glass-catch`, `--glass-drop`, `--grain-opacity`.

## The accent's two roles — the thing that breaks light mode

`--accent` is a **fill**. `--accent-ink` is for **text and borders**. They are not interchangeable.

Cyan `#35F0DC` as text on white is **1.43:1** — invisible. As a fill under dark ink it is 14:1 in both themes. So light mode keeps the cyan fill and swaps the *ink* role to a darkened teal at 6.4:1; dark mode collapses both roles back to the one cyan.

**Using `bg-accent`/`text-accent` where `text-accent-ink` belongs ships unreadable text to every light-mode visitor, and it looks fine on your dark screen.**

## Accent discipline

The accent appears on **one element per viewport-height of scroll** — the thing you want clicked or read first.

- If two things glow, nothing glows.
- Body copy never takes the accent.
- Borders never take it, except `:focus-visible` and the active nav item.
- Tailwind's stock `cyan-400` is not our accent. Use the token.

When adding a section, ask what already glows in this viewport. If something does, your new element does not.

## Translucent layers do not translate between themes

A colour that works on dark will not work on light by symmetry, and this bites hardest on anything semi-transparent — ambient washes, tinted overlays, glass.

The scroll-background fields shipped invisible in light mode: a bright field at `0.14` alpha is a **2.8x luminance step** over near-black and **1.04x** over `#FAFBFC`. Same alpha, same colour, one theme sees it and the other sees nothing.

**Bake the alpha into a themed token** (`--field-a/b/c`), so light can use a deeper, more saturated hue at roughly double the alpha, and let the component animate only a relative `0..1` band on top. Never theme this by reading the theme in JS — that costs a flash on first paint.

## Tailwind v4: CSS variables use PARENTHESES, not brackets

`duration-[--d-base]` is wrong. The bracket form is an arbitrary *literal*, so
it compiles to `transition-duration: --d-base` — a bare property name as a
value, which is invalid, silently dropped, and falls back to `0s`.

The variable shorthand is `duration-(--d-base)` → `var(--d-base)`.

This shipped across 11 files and 21 usages before anyone noticed, because a
transition that does not run looks like a transition that is simply fast. Same
rule for every var-driven utility: `ease-(--e-out)`, `w-(--x)`, and so on.

## Checking a change

Both themes, every time. `--muted` is the token that fails first — the dark-mode `#8A93A6` is only 3.09:1 on white. Toggle and re-read before calling anything done.

## Glass recipe

One recipe. Do not invent a variant per section.

```css
background: linear-gradient(148deg, var(--glass-tint), var(--glass-tint-soft));
border: 1px solid var(--line);
backdrop-filter: blur(20px) saturate(140%);
box-shadow:
  0 1px 0 0 var(--glass-catch) inset,   /* top light catch */
  0 24px 60px -24px var(--glass-drop);
```

Every value is themed. On light the tint darkens and the catch lightens — the recipe is one shape, not one set of numbers.

Two conditions, both required:

1. **Glass needs something to refract.** Every glass surface sits above the grain layer or a soft radial glow. Over a flat `--surface` it reads as a grey rectangle and you spent the blur budget for nothing.
2. **Budget: 2 blurred surfaces per viewport below `md`, ~6 above.** Never stacked more than two deep, never on a full-page wrapper. `backdrop-filter` is the most expensive thing on this page, and a mid-range Android GPU is where it shows.

Below `md`, any glass surface that is not the sticky header or a modal falls back to solid `bg-raised` with the same 1px `border-line`. The difference is nearly invisible and the cost drops to zero.

## Typography

Three roles, loaded with `next/font/google`, `display: 'swap'`, exposed as CSS variables. No `<link>` tags.

- **Display — Bricolage Grotesque** (variable). Headlines only. `tracking-[-0.03em]`, weight 600–700, `text-balance` on every headline.
- **Body — Inter Tight**. Paragraphs, buttons, nav. Weight 400/500. Max measure `65ch`.
- **Utility — JetBrains Mono**. Eyebrows, section numbers, stat labels, metadata. Always `uppercase tracking-[0.18em] text-small` in `text-muted`.

The mono face is a signal, not decoration: it means *machine output*. Use it for repo names, dates, latency figures, stack labels, role IDs, timestamps. Never on prose.

Fluid scale via `clamp()`: display `2.5–6.5rem` · h2 `1.75–3.5rem` · h3 `1.25–1.5rem` · body `1.0625rem` · small `0.875rem`.
Line height: `0.95` display · `1.1` h2 · `1.65` body.

**Set the floor from the smallest screen.** At 360px the container is 312px wide; a 56px condensed grotesque fits about seven characters per line, so a short headline breaks into five ragged lines. 40px holds it in two or three.

## Space and layout

- 4px grid. No `p-[13px]`.
- Section rhythm: `py-16 md:py-24`. **This is the gap BETWEEN two sections** — adjacent sections each contribute half, so the visible space is 128px mobile / 192px desktop. Reading it as per-section padding doubles every gap. Do not fight it per section.
- Container: `max-w-[1240px] px-6 md:px-10`. One container component, used everywhere.
- Grain overlay lives once in `app/layout.tsx`: SVG `feTurbulence` at `var(--grain-opacity)`, `pointer-events-none`, `fixed inset-0 z-50`. It is what makes the dark read as film rather than `#000`, and it lightens on the light theme.

## The signature element — Ship Log

A thin vertical rail in the left gutter on desktop that tracks scroll. Each section is a "commit": monospace hash, timestamp, and a node that takes the accent as the section enters the viewport. In the hero it extends into a live commit ticker fed by the GitHub route handler.

This is the one memorable thing on the site. **No other section gets a second scene-stealer.** Before adding a bold new visual idea, check it does not compete with the rail.

**The rail retires before the footer.** It is fixed at the vertical centre, so without this it scrolls straight over the footer's divider. An IntersectionObserver on `<footer>` with a shrunk root fades it out — and the clearance has to be measured, not guessed: at a 40% shrink there were only 14px between the trigger and the rail's lowest row, which a fast scroll outruns during a 500ms fade. Any fixed chrome added later needs the same check.

**Below `lg` the rail changes form rather than shrinking** — there is no gutter to pin to at 360px. Mobile gets a 2px cyan scroll-progress bar fixed under the header, and the active section's mono hash and number ride in that section's own eyebrow. Same information, same voice, no rail. The hero commit ticker stays on every size; it is content, not chrome.

The rail persists across routes (see [adding-a-page](../adding-a-page/SKILL.md)) — every page registers its sections with it rather than inventing its own progress indicator.

## Reject on sight

- Purple-to-blue gradient blobs. Glow on everything.
- A second accent color. A per-section glass variant.
- Borders heavier than 1px, or any border that is not `--line`.
- Emoji as icons — we have `lucide-react`.
- A hardcoded hex, rem, or shadow that does not trace to a token.
- A `md:` or `lg:` class that undoes the base rather than adding to it.
- `100vh`, a `next/image` with no `sizes`, or a hover-only affordance with no touch equivalent.

## Related

[motion-system](../motion-system/SKILL.md) · [building-a-section](../building-a-section/SKILL.md) · [quality-gate](../quality-gate/SKILL.md)
