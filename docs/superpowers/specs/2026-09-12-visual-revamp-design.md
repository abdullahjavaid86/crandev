# Visual revamp — quiet obsidian, indigo, frosted glass

**Date:** 2026-09-12 · **Scope:** the site layout shell and the home page. Other routes do not exist yet (M5) and are built on this system when they land.

## Why

The shipped site reads as robotic: monospace uppercase labels on every section, commit hashes and timestamps in a left rail, a reading panel in the right gutter (a three-column desktop layout), a wireframe polyhedron, and a teal-green accent. The owner wants it to read as professional and quiet, with a subtle glass treatment in the way modern operating systems do it, and scroll-linked depth done in three.js.

## Direction

Reference points: Linear, Raycast, Apple marketing pages. A lot of air, one sans family, panels that look like an OS window rather than a terminal. The only "machine output" left on the page is the live commit list itself.

Decisions taken with the owner (2026-09-12):

| Question | Decision |
| --- | --- |
| Accent | One soft indigo blue. The teal and the secondary "ion" blue go. |
| Type | Geist Sans for headlines and body. Geist Mono only for commit shas and stat figures. |
| three.js | One ambient full-page scene: shader gradient plus three frosted panes that drift and tilt on scroll. |
| Side rails | Remove the Ship Log rail and the reading panel. Single centred column. Commit feed stays in the hero as a static list. |

## Tokens (`app/globals.css`)

- `--accent` / `--accent-ink`: indigo, `#3B5BDB` on light and `#6E82FF` on dark (final values may move a step, but must be ≥ 4.5:1 as text on `--surface` and the button ink on the fill must be ≥ 4.5:1 in both themes). `--accent-on` is white on light, `#06070A` on dark. Both roles keep their names; they hold the same hex per theme now, which is acceptable because the fill/ink distinction is still real and may diverge again.
- Deleted: `--ion`, `--field-a/b/c`, `--lattice-line`, `--lattice-node`, and the `data-bg` / `data-shape` lines in `ThemeScript`.
- Surfaces unchanged: `--surface`, `--raised`, `--inset`, `--line`, `--line-strong`, `--fg`, `--muted`.
- Glass tokens reworked for the OS look: `--glass-fill` (translucent `--raised`, ~55% dark / ~65% light), `--glass-catch` (1px inner top highlight), `--glass-drop`. Blur `24px`, saturate `160%`.
- Radius: `--r-sm 10px`, `--r-md 16px`, `--r-lg 24px`.
- Type scale: display `clamp(2.5rem, …, 5.5rem)`, h2 `clamp(1.75rem, …, 3rem)`, h3 `1.25–1.5rem`, body `1.0625rem`, small `0.875rem`. Headings weight 600, tracking `-0.02em`, `text-wrap: balance`.
- Grain opacity lowered: `0.02` dark, `0.012` light.
- `--font-display` and `--font-body` both resolve to Geist Sans; `--font-mono` to Geist Mono. The two role names stay so components do not churn.

## Glass recipe (one recipe, every surface)

```css
background: var(--glass-fill);
border: 1px solid var(--line);
backdrop-filter: blur(24px) saturate(160%);
box-shadow: 0 1px 0 0 var(--glass-catch) inset, 0 20px 50px -24px var(--glass-drop);
border-radius: var(--r-md);
```

Budget unchanged: two blurred surfaces per viewport below `md`, about six above, never stacked more than two deep, never on a full-page wrapper. Below `md` a glass surface that is not the header or a modal renders solid `--raised` with the same border. Glass always sits above the scene, which is what gives it something to refract.

## Layout shell

- **Header**: full-width glass bar on phones; at `md` and up it is a floating panel inset `12px` from the top with `--r-md` corners, `max-w-[1240px]`. Glass from the first pixel of scroll (no transparent-to-glass switch). Wordmark, four links, theme toggle, one accent button, mobile overlay unchanged in behaviour.
- **Scroll progress**: a 2px accent line fixed at the top of the viewport, all sizes. It is the only fixed chrome besides the header.
- **Main**: single column, `Container` at `max-w-[1240px] px-6 md:px-10`. No rail, no reading panel.
- **Background**: `<Scene />` (three.js) fixed `inset-0 -z-10`, then `<Grain />` above content.
- **Footer**: hairline top, wordmark plus one-line description, nav columns from `lib/nav`, a small sans legal line and the GitHub link. No mono.

## The scene (`components/layout/Scene.tsx`, `lib/scene/`)

- Dependency: `three` only (0.186 at time of writing). No react-three-fiber, no drei. This is the one non-`motion` animation library and the reason is specific: a refractive glass material and a fragment-shader gradient cannot be produced by `motion`, CSS or SVG.
- Loaded with `next/dynamic({ ssr: false })` from a small client wrapper, and only after first paint (`requestIdleCallback` with a timeout fallback), so it never competes with LCP.
- Layers: (1) a fullscreen quad with a fragment shader drawing a slow domain-warped gradient in three theme colours; (2) three thin rounded panes with `MeshPhysicalMaterial` transmission, drifting and tilting as a function of smoothed scroll progress plus a very slow idle float.
- Uniforms: `uTime`, `uScroll` (0..1, lerped each frame), theme colours read from CSS custom properties on mount and again when `html.class` changes (MutationObserver).
- Scroll is read once inside the scene with a passive listener; this replaces the previous `ScrollBackground` as the page's single ambient scroll driver.
- Performance: pixel ratio capped at 1.5; render loop paused when the tab is hidden; resize debounced; below `md` and under `prefers-reduced-motion` the scene renders one frame at mid-scroll and stops. If WebGL context creation fails, the wrapper renders a static CSS gradient instead.
- Contrast: gradient amplitude is a named constant and is set so `--muted` on `--surface` stays ≥ 4.5:1 at the brightest scroll position, both themes.
- The bundle cost is measured after `yarn build` and recorded in `MILESTONES.md`.

## Home page

1. **Hero** — `min-h` close to the viewport. Left: headline (CSS masked lines, unchanged mechanism), subcopy, primary "Book a call", secondary "See the work" to `/work`. Right at `md`: a glass panel titled "Recently shipped" listing three commits (message, repo, relative time; sha in mono). Static list, no timer. `RiseIn` stays for the entrance; the hero must not import `Reveal` (CI guard).
2. **Proof** — one glass band, four figures divided by hairlines; figures in Geist Sans 600, tabular; count-up kept.
3. **Services** — at `lg` a two-column split: sticky heading and intro on the left, four glass rows on the right (icon tile, title, summary, deliverable, timeline pill). Phone: heading then list. `ServiceStack` and the sticky scaling go.
4. **Work** — grid, one column base, two at `md`; the first project spans both columns with a taller cover. Glass cards: client, outcome, stack as quiet text, arrow. A "All work" link under the grid.
5. **Testimonials** — one full-width large quote, then the remaining two side by side at `md`. Single column on phones.
6. **Brands** — the marquee stays; the bordered box goes.
7. **Process** — 2×2 grid at `md` of quiet tiles: large light numeral, title, duration in muted, detail. `ProcessTimeline` goes; the reveal is one `StaggerGroup`.
8. **Contact** — copy and direct channels left, `ContactForm` inside a glass panel right at `lg`. Field styling updated to the new radius and glass.
9. **CTA band** — full-width glass panel, centred, one accent button.

Accent discipline holds: one accent element per viewport-height of scroll.

## Deletions

`ShipLog`, `useShipLog`, `ReadingPanel`, `WireSolid`, `lib/shapes.ts`, `lib/lattice.ts`, `LatticeBackground`, `GridBackground`, `ScrollBackground`, `BackgroundLayer`, `DevVariantPicker`, `useBackground`, `useHeroShape`, `ServiceStack`, `ProcessTimeline`, the `ScrollProgress` consumer in the header (the primitive is reused at the viewport top), the `index` prop on `Eyebrow`, the `ScrollBackground` CI guard. `useDomFlag` stays only if the admin sidebar still uses it.

## Documentation

`CLAUDE.md` §2 (stack: `three` for the scene), §4 (design system rewritten to this direction), §4.5 (signature element becomes the scene plus the hero's shipped list), §4.6 (background is the scene), §5 (library rule names `three`), and the `design-system`, `motion-system`, `building-a-section` skills. `MILESTONES.md` gains **M7 — Visual revamp** with five rows and closes D4, D7, D9 and D10.

## Milestone rows

| # | Task |
| --- | --- |
| 7.1 | Tokens, fonts, glass recipe, primitives (Eyebrow, Card, Badge, Button, Field) |
| 7.2 | Shell: header, scroll line, footer, `Scene` with `three`, deletions of the old backgrounds and rails |
| 7.3 | Hero with the "Recently shipped" panel |
| 7.4 | Home body: Proof, Services, Work, Testimonials, Brands, Process, Contact, CTA |
| 7.5 | Cleanup of dead modules, docs and skills, CI guards, tracker |

Each row is one commit on `feature/fast-track` after the quality gate.
