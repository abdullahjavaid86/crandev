# Visual Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the layout shell and the home page from "terminal/robotic" to "quiet obsidian, indigo, frosted glass" with a single-column layout and one ambient three.js scroll scene.

**Architecture:** Tokens change first (fonts, accent, glass, radius) so every primitive re-skins for free; the shell then swaps the CSS backgrounds and side rails for one lazily-loaded three.js shader canvas; the hero and the home sections are rebuilt on the restyled primitives; the last task deletes dead modules and rewrites the docs and CI guards to the new direction.

**Tech Stack:** Next 16.3 App Router, React 19.2, TypeScript strict, Tailwind 4, `motion` 13, `lucide-react`, `three` 0.186 (+ `@types/three`), Yarn Berry 4.

**Spec:** `docs/superpowers/specs/2026-09-12-visual-revamp-design.md`

## Global Constraints

- Branch is `feature/fast-track`. No task branches. One task = one commit. Stage with explicit paths, never `git add -A`.
- Package manager is **Yarn Berry** (`yarn add`, `yarn add -D`). Never npm.
- Commit message: Conventional Commits with the milestone row in the subject, e.g. `feat(tokens): indigo accent, Geist, glass recipe [M7.1]`, body says why, and ends with these two lines:
  `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`
- Verification for every task (there is no unit-test runner in this repo): `yarn typecheck && yarn lint && yarn format:check && yarn build` must all pass with zero warnings. Run `yarn format` first if the format check fails. The dev server is already running at `http://localhost:3000` with HMR.
- Visual verification: use the Claude-in-Chrome tools (`mcp__claude-in-chrome__*`, load via ToolSearch) to screenshot `http://localhost:3000/` at 1440×900 and at 390×844, in dark and light (toggle by running `document.documentElement.classList.toggle('dark')` with the javascript tool). Report what you saw.
- **Mobile first:** unprefixed classes are the phone layout; `md:`/`lg:` only add. Never a breakpoint that undoes the base.
- **Tailwind v4 CSS-variable utilities use parentheses:** `duration-(--d-micro)`, never `duration-[--d-micro]`. CI greps for the bracket form.
- Colours, radii, durations come only from tokens. No raw hex in a component. No Tailwind palette colours (`text-slate-500`, `cyan-400`).
- Accent discipline: one accent element per viewport-height of scroll. Body copy never takes the accent.
- `useReducedMotion()` at the top of every motion component; reduced motion = fade only, no loops.
- Server components by default; `'use client'` only on the interactive leaf. A helper exported from a `'use client'` module cannot be called from a server component.
- No `any`, no `!` non-null assertions, no `<img>`, no `<a>` for internal routes, every `next/image` has `sizes`.
- Above the fold, entrances are CSS transform-only (`RiseIn`, `MaskedText`). `components/sections/Hero.tsx` must never import `components/motion/Reveal` (CI guard). `@keyframes rise-in` must not animate opacity or filter (CI guard).
- Delete files with `git rm`, never `rm -rf`.
- Copy rules: sentence case, plain, specific, no hype vocabulary. Do not invent new numbers; reuse the existing content JSON.
- Do not touch `app/(admin)/**` except to keep the build green; the portal inherits tokens and must still read correctly.

---

### Task 1: Tokens, fonts, glass recipe, primitives [M7.1]

**Files:**

- Modify: `app/globals.css`, `app/layout.tsx`
- Modify: `components/ui/Eyebrow.tsx`, `components/ui/Badge.tsx`, `components/ui/Card.tsx`, `components/ui/buttonStyles.ts`, `components/ui/Field.tsx` (only `controlStyles`), `components/ui/StatFigure.tsx`
- Modify (mechanical, keep build green): every caller of `<Eyebrow index="…">` — `components/sections/{Brands,Proof,Hero,Work,Process,Contact,Testimonials,ServiceStack,Services}.tsx` — remove the `index` attribute only. `app/(admin)/admin/StatTile.tsx` passes `highlight` to `Card` — remove that prop there.

**Interfaces:**

- Produces: CSS utility `glass` (Tailwind `@utility`) = the one glass recipe (background, backdrop-filter, box-shadow only; radius and border stay separate utilities). Usage pattern for a card: `rounded-md border border-line bg-raised md:glass`. Header and modals may use `glass` unprefixed (they are the two blurred surfaces allowed below `md`).
- Produces: tokens `--scene-a`, `--scene-b`, `--scene-c`, `--scene-pane` (themed), consumed by Task 2.
- Produces: `Card` props `{ glass?: boolean } & React.ComponentProps<"div">` — server component, no cursor light, no `highlight` prop.
- Produces: `Eyebrow` props `{ children, className? }` — no `index`.
- Produces: `buttonStyles(variant, size, className?)` unchanged signature.

- [ ] **Step 1: Fonts.** In `app/layout.tsx` replace the three font loaders with two:

```ts
import { Geist, Geist_Mono } from "next/font/google";

/** The one sans. Headlines and body are the same family at different weights. */
const sans = Geist({
  variable: "--font-sans-src",
  subsets: ["latin"],
  display: "swap",
});
/** Only for real machine data: commit shas, stat figures. */
const mono = Geist_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
```

Apply `${sans.variable} ${mono.variable}` on `<html>`. Update the doc comment: one preload (the sans), mono swaps. In `globals.css` `@theme inline`, set `--font-display: var(--font-sans-src); --font-body: var(--font-sans-src); --font-mono: var(--font-mono-src);` and replace every `var(--font-display-src)` / `var(--font-body-src)` in the base layer with `var(--font-sans-src)`. Grep `app components lib` for `font-display-src|font-body-src` and fix every hit (`app/global-error.tsx` may reference them).

- [ ] **Step 2: Tokens.** In `app/globals.css` `:root` (light) set exactly:

```css
--accent: #3b5bdb; /* 5.5:1 as text on --surface; white ink on it is 5.7:1 */
--accent-on: #ffffff;
--accent-ink: #3b5bdb;
--glass-fill: rgba(255, 255, 255, 0.65);
--glass-catch: rgba(255, 255, 255, 0.9);
--glass-drop: rgba(6, 7, 10, 0.1);
--grain-opacity: 0.012;
--scene-a: #e8ecff; /* pale indigo — brightest field; --muted on it is 5.1:1 */
--scene-b: #fafbfc;
--scene-c: #dce3f7;
--scene-pane: rgba(255, 255, 255, 0.35);
--r-sm: 10px;
--r-md: 16px;
--r-lg: 24px;
--t-display: clamp(2.5rem, 1.6rem + 4vw, 5.5rem);
--t-h2: clamp(1.75rem, 1.3rem + 2vw, 3rem);
```

and in `.dark`:

```css
--accent: #6e82ff; /* 6.0:1 as text on --surface; #06070A ink on it is 6.0:1 */
--accent-on: #06070a;
--accent-ink: #6e82ff;
--glass-fill: rgba(18, 21, 30, 0.6);
--glass-catch: rgba(232, 237, 245, 0.07);
--glass-drop: rgba(0, 0, 0, 0.55);
--grain-opacity: 0.02;
--scene-a: #0b1020;
--scene-b: #06070a;
--scene-c: #121a33;
--scene-pane: rgba(232, 237, 245, 0.05);
```

Delete from both themes: `--ion`, `--glass-tint`, `--glass-tint-soft`, `--field-a/b/c`, `--lattice-line`, `--lattice-node`, and `--color-ion` from `@theme inline`. Delete the `@property --lit` block (Card no longer uses it). Keep every other token. Update the comment block above the tokens to describe the new palette in one short paragraph (indigo accent, same hex for fill and ink per theme, glass tokens, scene tokens).

- [ ] **Step 3: Type base.** In `@layer base`: `h1, h2, h3 { font-weight: 600; letter-spacing: -0.02em; }` (was 650 / -0.03em). `h1 { line-height: 1.0 }`. Body stays. `:focus-visible` ring stays on `--accent-ink`, `::selection` stays.

- [ ] **Step 4: The glass utility.** Add to `globals.css`, after `@theme inline`:

```css
/* The one glass recipe (CLAUDE.md §4.2). Background, blur and shadow only —
   radius and border are the separate rounded-* / border-line utilities, so a
   glass surface is `rounded-md border border-line bg-raised md:glass`.
   backdrop-filter is the most expensive thing on the page: below md only the
   header and a modal may use it; every other surface stays solid bg-raised. */
@utility glass {
  background: var(--glass-fill);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  box-shadow:
    0 1px 0 0 var(--glass-catch) inset,
    0 20px 50px -24px var(--glass-drop);
}
```

- [ ] **Step 5: Eyebrow.** Replace the component body:

```tsx
import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

/** A small, quiet label above a heading. Sans, sentence case — never mono. */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p className={cn("text-small font-medium text-muted", className)}>{children}</p>
  );
}
```

Then remove `index="…"` from every caller (grep `index="` in `components/sections` and `app`). Keep the label text.

- [ ] **Step 6: Badge.** Pill, sans: classes `inline-flex items-center rounded-full border border-line bg-inset px-2.5 py-0.5 text-small text-muted`. Update its doc comment (no longer mono).

- [ ] **Step 7: Card.** Rewrite `components/ui/Card.tsx` as a **server** component (no `'use client'`, no hooks, no cursor light):

```tsx
import { cn } from "@/lib/utils";

interface CardProps extends React.ComponentProps<"div"> {
  /** Glass costs a backdrop-filter, so it only applies from md up (§4.2). */
  glass?: boolean;
}

/**
 * The one surface. Solid `bg-raised` by default; `glass` adds the recipe at
 * md and up. The 1px `border-line` frame lightens to `border-line-strong`
 * on hover (pointer only — Tailwind v4 wraps hover: in (hover: hover)) and
 * on :active for touch. No scale, no translate, no accent.
 */
export function Card({ glass = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-line",
        "transition-colors duration-(--d-base) ease-out-soft",
        "hover:border-line-strong active:border-line-strong",
        glass ? "bg-raised md:glass" : "bg-raised",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

Remove the `highlight` prop from `app/(admin)/admin/StatTile.tsx`.

- [ ] **Step 8: Buttons and fields.** In `buttonStyles.ts`: base gets `rounded-sm` (10px) instead of `rounded-md`; primary stays `bg-accent text-accent-on` with the existing color-mix glow; secondary becomes `border border-line bg-raised text-fg hover:bg-inset active:bg-inset`; ghost unchanged. In `Field.tsx` `controlStyles`: `rounded-sm` instead of `rounded-md`, rest unchanged.

- [ ] **Step 9: StatFigure.** The figure `<p>` becomes `font-display text-h2 font-semibold leading-none text-fg tabular-nums` (drop `font-mono`). Suffix and label unchanged (label is already an `Eyebrow`).

- [ ] **Step 10: Verify.** `yarn typecheck && yarn lint && yarn format:check && yarn build`. Then screenshot `/` at 1440 and 390, dark and light: confirm Geist renders, the accent button is indigo, no teal remains anywhere on the page (the old rail and backgrounds are still present and will be removed in Task 2 — that is expected). Also load `/admin/login` and confirm it renders with the new tokens.

- [ ] **Step 11: Commit.**

```bash
git add app/globals.css app/layout.tsx components/ui components/sections app/\(admin\)/admin/StatTile.tsx
git commit -m "feat(tokens): indigo accent, Geist, glass recipe, quiet primitives [M7.1]"
```

Body: why (the owner's 2026-09-12 direction: professional not robotic; contrast figures for the accent in both themes).

---

### Task 2: Shell — header, footer, scroll line, three.js scene, remove rails and old backgrounds [M7.2]

**Files:**

- Add deps: `yarn add three` and `yarn add -D @types/three` (state the versions installed in the commit body).
- Create: `lib/scene/shaders.ts`, `lib/scene/createScene.ts`, `components/layout/Scene.tsx`
- Modify: `components/layout/Header.tsx`, `components/layout/Footer.tsx`, `components/layout/ThemeScript.tsx`, `app/(site)/layout.tsx`, `app/(site)/page.tsx`, `app/layout.tsx`, `components/sections/Hero.tsx` (remove `WireSolid` only), `lib/nav.ts`, `.github/workflows/ci.yml`
- Delete (`git rm`): `components/layout/ShipLog.tsx`, `hooks/useShipLog.ts`, `components/layout/ReadingPanel.tsx`, `components/motion/WireSolid.tsx`, `lib/shapes.ts`, `lib/lattice.ts`, `components/layout/LatticeBackground.tsx`, `components/layout/GridBackground.tsx`, `components/layout/ScrollBackground.tsx`, `components/layout/BackgroundLayer.tsx`, `components/ui/DevVariantPicker.tsx`, `hooks/useBackground.ts`, `hooks/useHeroShape.ts`. Keep `hooks/useDomFlag.ts` (the admin `SidebarToggle` uses it).

**Interfaces:**

- Consumes: `glass` utility, `--scene-*` tokens (Task 1).
- Produces: `export function Scene(): JSX` (client) — mounted once in `app/(site)/layout.tsx` as the first child, replacing `<BackgroundLayer />`.
- Produces: `lib/scene/createScene.ts`:

```ts
export interface SceneColors {
  a: string;
  b: string;
  c: string;
  pane: string;
} // CSS colour strings
export interface SceneHandle {
  setScroll(progress: number): void; // 0..1 target; lerped internally
  setTheme(colors: SceneColors): void;
  setSize(width: number, height: number, pixelRatio: number): void;
  renderOnce(): void; // one frame at the current state
  start(): void; // rAF loop
  stop(): void;
  dispose(): void; // renderer.dispose(), geometry/material dispose, forceContextLoss()
}
export function createScene(canvas: HTMLCanvasElement): SceneHandle; // throws if WebGL is unavailable
```

- Produces: `lib/nav.ts` gains `export const siteLinks = { email: "hello@cranedev.com", github: "https://github.com/cranedev" } as const;` (moved from Footer's `CONTACT`, still flagged as placeholders in a comment — D8). Task 4's Contact section consumes it.

- [ ] **Step 1: Install.** `yarn add three` then `yarn add -D @types/three`. Confirm `yarn.lock` changed and no `package-lock.json` appeared.

- [ ] **Step 2: Shaders.** `lib/scene/shaders.ts` exports `vertexShader` and `fragmentShader` strings. Vertex: pass `vUv`, position the fullscreen quad (`gl_Position = vec4(position.xy, 0.0, 1.0)`). Fragment, in this order:
  1. uniforms `uTime`, `uScroll`, `uResolution` (vec2), `uColorA`, `uColorB`, `uColorC` (vec3), `uPane` (vec4, rgba).
  2. A cheap 2-D value noise (`hash` from a `fract(sin(dot(...)))`, smoothstep interpolation) and a 3-octave `fbm`.
  3. Aspect-corrected coordinates `p = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0)`.
  4. Domain warp: `q = p + 0.35 * vec2(fbm(p * 1.4 + uTime * 0.02), fbm(p * 1.4 - uTime * 0.017 + 3.1))`, then `n = fbm(q * 1.1 + vec2(0.0, uScroll * 0.9))`. Gradient `col = mix(mix(uColorB, uColorA, smoothstep(0.25, 0.75, n)), uColorC, smoothstep(0.55, 0.95, fbm(q * 0.7 + uScroll)))`. **Amplitude cap:** the result must stay within the three token colours — no additive brightening of the gradient itself.
  5. Three panes. A rounded-rect SDF `sdRoundBox(p, halfSize, radius)`. For pane `i` in 0..2: centre `c_i` and rotation `r_i` are functions of `uScroll` and `uTime`: centres start at `(-0.55, 0.35)`, `(0.6, 0.05)`, `(-0.15, -0.55)`; each drifts `+ vec2(0.0, (uScroll - 0.5) * k_i)` with `k = (-0.7, 0.5, -0.4)` and floats `+ 0.02 * sin(uTime * 0.25 + i)`; rotation `0.18 * (i - 1) + (uScroll - 0.5) * 0.35 * (i == 1 ? -1.0 : 1.0)`; half sizes `(0.42, 0.26)`, `(0.34, 0.48)`, `(0.5, 0.22)`; corner radius `0.06`. Rotate `p - c_i` by `-r_i` before the SDF.
  6. Inside a pane (`d < 0`): re-sample the gradient with the coordinate offset by `0.03 * normalize(p - c_i)` (refraction) and blend toward `uPane.rgb` by `uPane.a`. Rim: `rim = 1.0 - smoothstep(0.0, 0.006, abs(d))`, add `rim * 0.18 * uPane.rgb`. Blend all three panes with `max` of their masks (front-to-back is not needed; they do not overlap by design).
  7. Output `gl_FragColor = vec4(col, 1.0)`.

- [ ] **Step 3: createScene.** `lib/scene/createScene.ts`, importing only what is used from `"three"` (`WebGLRenderer`, `Scene`, `OrthographicCamera`, `PlaneGeometry`, `ShaderMaterial`, `Mesh`, `Vector2`, `Vector3`, `Vector4`, `Color`). Orthographic camera `(-1, 1, 1, -1, 0, 1)`, `PlaneGeometry(2, 2)`. `setScroll` stores a target; the loop lerps `scroll += (target - scroll) * 0.08` per frame and advances `uTime` by the frame delta (clamped to 0.05s). `setTheme` converts the CSS strings with `new Color(str)` for `a/b/c` and parses `pane` `rgba(...)` into a `Vector4` (write a tiny `parseRgba` helper in the same file; `Color` cannot carry alpha). `setSize` calls `renderer.setPixelRatio` and `renderer.setSize(w, h, false)` and updates `uResolution`. `renderOnce` renders one frame without advancing time. `dispose` stops the loop and frees everything. `createScene` wraps `new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "low-power" })` — if it throws, let it propagate.

- [ ] **Step 4: Scene component.** `components/layout/Scene.tsx` (`'use client'`):
  - Renders `<div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(120%_80%_at_20%_10%,var(--scene-a),var(--scene-b)_60%,var(--scene-c))]"><canvas ref={ref} className="block h-full w-full" /></div>`. The div's gradient is the no-WebGL / pre-load fallback and stays underneath.
  - `useReducedMotion()` from motion and `useIsDesktop()` from `hooks/useMediaQuery`; `animate = isDesktop && !isReduced`.
  - Effect: schedule with `requestIdleCallback(cb, { timeout: 1500 })` when available, else `setTimeout(cb, 200)`. In `cb`: `const { createScene } = await import("@/lib/scene/createScene")`; `try { handle = createScene(canvas) } catch { return }` (fallback gradient remains). Read colours via a local `readSceneColors()` that does `getComputedStyle(document.documentElement).getPropertyValue("--scene-a").trim()` etc. Call `setTheme`, `setSize(innerWidth, innerHeight, Math.min(devicePixelRatio, 1.5))`.
  - If `animate`: passive `scroll` listener computing `scrollY / max(1, scrollHeight - innerHeight)` → `setScroll`; `start()`; `visibilitychange` → `stop()`/`start()`. Else: `setScroll(0.5)` and `renderOnce()`, no listeners.
  - `resize` listener debounced 150ms → `setSize` then `renderOnce()` if not animating.
  - `MutationObserver` on `document.documentElement` (`attributeFilter: ["class"]`) → `setTheme(readSceneColors())` and `renderOnce()` if not animating.
  - Cleanup removes every listener/observer, cancels the idle callback/timeout, and calls `dispose()`.
  - Doc comment: this is the site's single ambient scroll driver (CLAUDE.md §4.6); why lazy; why one draw call.

- [ ] **Step 5: Wire the layout.** `app/(site)/layout.tsx`: replace `<BackgroundLayer />` with `<Scene />`. `app/layout.tsx`: remove the `DevVariantPicker` import and element and its comment. `ThemeScript.tsx`: delete the `BG`/`SH`/`data-bg`/`data-shape` lines and the sentence about variants in the comment; keep theme and `sidebar`. `app/(site)/page.tsx`: delete the `SECTIONS` array, the two absolutely-positioned gutter wrappers, the `ShipLog`/`ReadingPanel` imports, and the comments about the rail; `<main className="relative">` keeps `StructuredData` and the section list. `Hero.tsx`: remove the `WireSolid` import and the `<div aria-hidden …><WireSolid/></div>` block, nothing else (Task 3 rewrites the hero).

- [ ] **Step 6: Delete.** `git rm` every file in the Delete list. Grep `app components hooks lib` for `ShipLog|ReadingPanel|WireSolid|useBackground|useHeroShape|LatticeBackground|GridBackground|ScrollBackground|BackgroundLayer|DevVariantPicker|lib/shapes|lib/lattice` — zero hits outside comments you are rewriting.

- [ ] **Step 7: Header.** Rewrite the outer structure of `components/layout/Header.tsx`; keep the Radix overlay, the derived `open` state, `Wordmark`, and the nav map. Changes:
  - Remove the `useScroll`/`useSyncExternalStore`/`GLASS_AT` scroll read and the separate glass layer. Glass is on from the first pixel.
  - Markup: `<header className="sticky top-0 z-40 pt-[env(safe-area-inset-top)] md:top-3 md:px-6 lg:px-10">` containing `<div className="glass mx-auto flex h-16 max-w-[1240px] items-center gap-2 border-b border-line px-6 md:h-14 md:gap-4 md:rounded-md md:border md:px-4">` — the phone base is a full-width glass bar with a bottom hairline; `md:` adds the inset, radius and full border. Do **not** wrap in `Container` (double gutter).
  - `<ScrollProgress />` renders unconditionally (drop `lg:hidden`); it is already `fixed inset-x-0 top-0 z-40 h-0.5 bg-accent`. Change its `z-40` to `z-50` so it draws above the header and update its doc comment (it is the page's scroll indicator, not the "Ship Log's mobile form").
  - Nav links: `text-small font-medium`, current = `text-fg` with the existing 1px `bg-accent-ink` underline; others `text-muted hover:text-fg`.
  - Wordmark: `font-display text-body font-semibold tracking-[-0.02em]`.
  - Mobile overlay: unchanged behaviour; link rows lose `text-h3` for `text-h3 font-semibold tracking-[-0.02em]` (same size, new weight); the active border stays `border-accent-ink`.

- [ ] **Step 8: Footer.** Move `CONTACT` to `lib/nav.ts` as `siteLinks` (with the D8 placeholder comment) and import it. Column headings: `<h2 className="text-small font-medium text-fg">`. Wordmark link: `font-display text-body font-semibold tracking-[-0.02em]`. Legal line: replace the `Eyebrow` with `<p className="text-small text-muted">© {year} CraneDev · Remote</p>` and drop the Eyebrow import. Everything else unchanged.

- [ ] **Step 9: CI.** In `.github/workflows/ci.yml` delete the `ScrollBackground` blur/willChange guard block (the file no longer exists; the `grep -c` on a missing file would break the step). Add to the retired-token regex: `ion|field-a|field-b|field-c|lattice-line|lattice-node|glass-tint|glass-tint-soft`. Add a guard: `three` may only be imported under `lib/scene/`:

```bash
if grep -rln 'from "three' app components hooks lib | grep -v '^lib/scene/'; then
  echo "::error::three imported outside lib/scene/. The scene is the one consumer."
  fail=1
fi
```

- [ ] **Step 10: Verify.** Full gate. Then in the browser at 1440: the header is a floating glass panel, the scene is visible behind the page and shifts as you scroll (scroll with the javascript tool and take two screenshots), no rail, no reading panel, no picker buttons bottom-right. At 390: full-width glass header, scene static. Toggle light: pale scene, header still legible. Reduced motion (`matchMedia` cannot be forced from JS; instead confirm in code that `animate` is false when `useReducedMotion()` is true). Check the Network panel or `yarn build` output: `three` must be in a separate chunk, not the first-load JS of `/`. Record the chunk size (gzip if shown, else raw) for the commit body.

- [ ] **Step 11: Commit.** `feat(layout): floating glass header, three.js ambient scene, single column [M7.2]` — body: why lazy, measured chunk size, what was deleted and why (D9/D10 resolved by the revamp).

---

### Task 3: Hero with the "Recently shipped" panel [M7.3]

**Files:**

- Rewrite: `components/sections/Hero.tsx`
- Create: `components/sections/ShippedPanel.tsx` (server component)
- Delete (`git rm`): `components/sections/CommitTicker.tsx`

**Interfaces:**

- Consumes: `RiseIn`, `MaskedText`, `buttonStyles`, `Eyebrow`, `Card`, `Container`, `primaryCta` from `lib/nav`.
- Produces: `export interface Commit { sha: string; repo: string; message: string; when: string }` and `export function ShippedPanel({ commits, className }: { commits: readonly Commit[]; className?: string })`. M4.4 will feed real commits into the same prop.

- [ ] **Step 1: ShippedPanel.** A `Card glass` with `p-5 md:p-6`. Header row: `<p className="text-small font-medium text-fg">Recently shipped</p>` and `<span className="ml-auto text-small text-muted">GitHub</span>`. Then `<ul className="mt-4 divide-y divide-line">`; each `<li className="py-3 first:pt-0 last:pb-0">`: message `<p className="text-small text-fg">` (2 lines max via `line-clamp-2`), meta `<p className="mt-1 flex flex-wrap gap-x-2 text-small text-muted"><span>{repo}</span><span aria-hidden>·</span><span>{when}</span><span className="font-mono text-xs">{sha}</span></p>`. No timer, no live region, no motion. Returns `null` for an empty list. Doc comment: this is the one place mono is allowed (a sha is machine output) and the panel is content, not chrome.

- [ ] **Step 2: Hero.** Keep `PLACEHOLDER_COMMITS` (typed as `Commit[]` from `ShippedPanel`) and the two "must not ship" comments. Copy: `HEADLINE = ["Software that ships,", "and keeps shipping."]`; subcopy `"A senior team that takes systems from architecture to production, then stays on them. No handover to people who have never seen the code."`. Markup:

```tsx
<section
  id="hero"
  aria-labelledby="hero-heading"
  className="relative py-20 md:flex md:min-h-[calc(100dvh-4rem)] md:items-center md:py-28"
>
  <Container className="md:grid md:grid-cols-12 md:items-center md:gap-10">
    <div className="md:col-span-7">
      <RiseIn>
        <Eyebrow>Senior software agency</Eyebrow>
      </RiseIn>
      <MaskedText as="h1" lines={HEADLINE} className="mt-5 max-w-[16ch]" />
      <RiseIn delay={0.15}>
        <p className="mt-6 max-w-[48ch] text-muted">{SUBCOPY}</p>
      </RiseIn>
      <RiseIn delay={0.25}>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href={primaryCta.href} className={buttonStyles("primary", "md")}>
            {primaryCta.label}
          </Link>
          <Link href="/work" className={buttonStyles("secondary", "md")}>
            See the work
          </Link>
        </div>
      </RiseIn>
    </div>
    <RiseIn delay={0.35} className="mt-14 md:col-span-5 md:mt-0">
      <ShippedPanel commits={PLACEHOLDER_COMMITS} />
    </RiseIn>
  </Container>
</section>
```

The `h1` keeps `id="hero-heading"` — check how `MaskedText` accepts an id; if it does not, add an optional `id` prop to `MaskedText` and forward it to the heading (one-line change). The secondary button is the only new element; the primary CTA remains the viewport's single accent element.

- [ ] **Step 3: Verify.** Full gate. Browser at 1440 and 390 in both themes: headline in two lines on desktop, at most three at 390; panel below the copy on the phone, to the right on desktop; the hero paints its text immediately on a hard reload (no blank frame). `grep -n "components/motion/Reveal" components/sections/Hero.tsx` returns nothing.

- [ ] **Step 4: Commit.** `feat(hero): two-column hero with a static "Recently shipped" panel [M7.3]`.

---

### Task 4: Home body — Proof, Services, Work, Testimonials, Brands, Process, Contact, CTA [M7.4]

**Files:**

- Modify: `components/sections/{Proof,Services,Work,Testimonials,Brands,Process,Contact,CtaBand}.tsx`, `components/ui/ProjectCard.tsx`, `components/ui/StatFigure.tsx` (only the `li` classes), `app/(site)/page.tsx` (only if imports change)
- Create: `components/sections/ServiceList.tsx` (server component)
- Delete (`git rm`): `components/sections/ServiceStack.tsx`, `components/sections/ProcessTimeline.tsx`

**Interfaces:**

- Consumes: `Card { glass }`, `Eyebrow`, `Badge`, `StaggerGroup`/`StaggerItem`, `Reveal`, `buttonStyles`, `siteLinks` from `lib/nav`, content loaders from `lib/content`.
- Produces: `ProjectCard` gains `featured?: boolean`.

- [ ] **Step 1: Proof.** Heading block unchanged (Eyebrow "Proof", h2). Replace the list with `<StaggerGroup as="ul" className="mt-12 grid grid-cols-2 rounded-md border border-line bg-raised md:mt-16 md:grid-cols-4 md:divide-x md:divide-line md:glass">`. In `StatFigure`, the `li` classes become `p-6 md:p-8` (drop `border-t border-line pt-6`). Nothing at `md:` undoes the base: base has no dividers, `md:` adds vertical ones.

- [ ] **Step 2: Services.** `Services.tsx` becomes `lg:grid lg:grid-cols-12 lg:gap-12` inside the Container: left `<div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">` with `Reveal` → Eyebrow "Services", h2 (existing copy), and a new `<p className="mt-6 max-w-[40ch] text-muted">Four ways to engage. Each one ends with something you own and can run without us.</p>`; right `<div className="mt-12 lg:col-span-7 lg:mt-0"><ServiceList services={services} /></div>`. `ServiceList.tsx` (server): the `ICONS` map moves here from `ServiceStack`; `<StaggerGroup as="ul" className="flex flex-col gap-4">`, each `<StaggerItem as="li">` → `<Card glass className="p-6 md:p-7"><div className="flex gap-5">` icon tile `<span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-sm border border-line bg-inset"><Icon className="size-5" strokeWidth={1.5} /></span>` + body: title row `<div className="flex items-start gap-4"><h3>{title}</h3><Badge className="ml-auto shrink-0">{timeline}</Badge></div>`, `<p className="mt-2 text-muted">{summary}</p>`, `<p className="mt-4 border-t border-line pt-4 text-small"><span className="text-muted">What you get: </span><span className="text-fg">{deliverable}</span></p>`. Delete `ServiceStack.tsx`.

- [ ] **Step 3: Work.** Grid `mt-12 grid grid-cols-1 gap-5 md:mt-16 md:grid-cols-2`; first `StaggerItem` gets `md:col-span-2` and passes `featured`. Under the grid: `<div className="mt-10 flex justify-center"><Link href="/work" className={buttonStyles("secondary", "md")}>All work</Link></div>`. In `ProjectCard`: `featured` → cover box `aspect-[16/10] md:aspect-[21/9]` and `sizes="(min-width: 1280px) 1160px, 100vw"`; otherwise `aspect-[16/10]` and `sizes="(min-width: 768px) 50vw, 100vw"` (the `/work` index and the modal still use the default). Card is `glass`. Body: `Eyebrow` category · year; title row `<div className="flex items-start gap-4"><h3>{client}</h3><span aria-hidden className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors duration-(--d-micro) group-hover:text-fg group-active:text-fg"><ArrowUpRight className="size-4" /></span></div>`; outcome `<p className="text-muted">`; stack as one line `<p className="mt-auto pt-3 text-small text-muted">{stack.join(" · ")}</p>` (drop the Badges and the mono "Read the case study" line; the arrow circle is the rest-state affordance and the whole card stays the one link). Update `COVER_SIZES` comments accordingly.

- [ ] **Step 4: Testimonials.** Grid `mt-12 grid gap-5 md:mt-16 md:grid-cols-2`; first `StaggerItem` `md:col-span-2`. Cards `glass`, `p-6 md:p-8`. The first quote's `<p>` is `text-h3 font-medium leading-snug max-w-[40ch]`; the others body size. Caption: name `font-medium text-fg`, then `<span className="mt-1 block text-small text-muted">{role}, {company}</span>` (no mono, no uppercase). Keep figure/blockquote/figcaption/cite semantics.

- [ ] **Step 5: Brands.** Remove `rounded-lg border border-line bg-raised` from the marquee wrapper (keep `overflow-hidden` and the mask). Keep everything else.

- [ ] **Step 6: Process.** `Process.tsx`: heading block unchanged; replace `ProcessTimeline` with `<StaggerGroup as="ol" className="mt-12 grid gap-5 md:mt-16 md:grid-cols-2">` and per step `<StaggerItem as="li"><Card className="h-full p-6 md:p-8"><p aria-hidden className="font-display text-h2 font-light leading-none text-muted">{i + 1}</p><h3 className="mt-6">{title}</h3><p className="mt-1 text-small text-muted">{duration}</p><p className="mt-3 text-muted">{detail}</p></Card></StaggerItem>`. The list is an `<ol>`, so the number is also announced natively; the visible numeral is `aria-hidden`. Solid cards (not glass) — the section is on a page stretch that already spends its blur budget. Delete `ProcessTimeline.tsx`.

- [ ] **Step 7: Contact.** `lg:grid lg:grid-cols-12 lg:gap-12`: left `lg:col-span-5` keeps the `Reveal` with Eyebrow/h2/p and adds `<a href={`mailto:${siteLinks.email}`} className="mt-6 inline-flex min-h-11 items-center text-small font-medium text-fg">{siteLinks.email}</a>`; right `<div className="mt-12 lg:col-span-7 lg:mt-0"><Reveal delay={0.1}><Card glass className="p-6 md:p-8"><ContactForm /></Card></Reveal></div>`. Remove the old `md:max-w-[65ch]` wrapper.

- [ ] **Step 8: CTA band.** `<Card glass className="p-8 text-center md:p-16">` with `h2 className="mx-auto max-w-[18ch]"`, `p className="mx-auto mt-5 max-w-[48ch] text-muted"`, button `mt-10`. Replace the raw `rounded-lg border … bg-raised` div with the Card.

- [ ] **Step 9: Verify.** Full gate. Browser at 1440, 768 and 390, both themes, scrolling the whole page: no three-column grid anywhere; the Proof band, Services rows, first Work card, first Testimonial, Contact form and CTA read as glass on desktop and solid on the phone; count-ups still run; the marquee still runs; nothing overflows horizontally at 390 (`document.documentElement.scrollWidth === innerWidth`). Blur budget: count `backdrop-filter` surfaces visible in one 1440×900 viewport — must be ≤ 6 (header + at most five cards).

- [ ] **Step 10: Commit.** `feat(sections): home body on glass, no card stack, no timeline [M7.4]`.

---

### Task 5: Cleanup, docs, skills, tracker [M7.5]

**Files:**

- Modify: `CLAUDE.md`, `.claude/skills/design-system/SKILL.md`, `.claude/skills/motion-system/SKILL.md`, `.claude/skills/building-a-section/SKILL.md`, `.claude/skills/adding-a-page/SKILL.md`, `.claude/skills/quality-gate/SKILL.md`, `MILESTONES.md`, `.github/workflows/ci.yml` (only if a guard still references a deleted file)
- Delete: any module with zero importers after Tasks 1–4 (check `components/motion/Parallax.tsx` and `components/ui/Modal.tsx`: Parallax is likely unused — delete it; Modal is reserved for M5.2 — keep it and say so in the tracker).

- [ ] **Step 1: Dead code sweep.** For each file under `components/`, `hooks/`, `lib/` run `grep -rl "<basename>" app components hooks lib` excluding the file itself; delete anything with no importer (except `Modal.tsx`). Grep `app components hooks lib .github` for `Ship Log|ShipLog|rail|ReadingPanel|WireSolid|lattice|cyan|Bricolage|Inter Tight|ion\b` and fix every stale comment.

- [ ] **Step 2: CLAUDE.md.** Rewrite to the new direction, keeping the structure and every rule that still holds:
  - §2 stack table: Animation row becomes `motion` (default) + `three` (the ambient scene only, `lib/scene/`). Fonts row unchanged. Add a constraint bullet: "`three` is imported only under `lib/scene/`. It exists for the one fullscreen shader scene; nothing else may use it."
  - §4 heading: "**quiet obsidian, one indigo, frosted glass.**" §4.0 table unchanged for surfaces; accent paragraph rewritten: indigo `#3B5BDB` light / `#6E82FF` dark, fill and ink share the hex per theme, white ink on light, dark ink on dark, contrast figures. §4.1 palette block: replace the old list with the role tokens and the scene tokens; delete `--ion`. §4.2 glass: the new recipe and the `glass` utility usage; budget unchanged. §4.3 typography: Geist Sans (display and body), Geist Mono for shas and stat figures only; weight 600, tracking `-0.02em`; scale `display 2.5–5.5rem / h2 1.75–3rem`; delete the mono-eyebrow rule and replace with "Eyebrows are small sans labels in sentence case." §4.4 radius `10/16/24`. §4.5 "The signature element" becomes the ambient scene plus the hero's "Recently shipped" panel; delete the rail and the mobile-rail paragraph. §4.6 rewritten around `Scene` (one lazy canvas, one draw call, static below `md` and under reduced motion, tokens `--scene-*`). §4.7 unchanged.
  - §5 rule text: "`motion` is the default. `three` is permitted for exactly one thing, the ambient scene in `lib/scene/`."
  - §6.1 Header: "floating glass panel at md, full-width glass bar on phones; 2px accent scroll line at the top of the viewport." Hero: "Left: headline, subcopy, primary and secondary CTA. Right at md: the Recently shipped panel (static list of the last three commits)." Services: "two-column split at lg, sticky heading, four glass rows." Work: "two-column grid, first project featured." Testimonials: "one featured quote then two." Process: "2×2 grid of numbered tiles." Contact: "copy left, glass form right at lg."
  - §12 anti-patterns: replace `cyan-400` with "any Tailwind palette colour as the accent"; add "a second three.js scene or any `three` import outside `lib/scene/`"; add "mono on anything that is not a sha or a figure".
  - §11 build order: add "7. **M7 Visual revamp** — tokens, shell + scene, hero, home body, cleanup."
  - Everywhere else: replace "cyan" with "accent" where it names the token role.
- [ ] **Step 3: Skills.** `design-system`: rewrite the tokens table, the accent section, the glass recipe, typography, and the signature-element section to match CLAUDE.md §4 above; delete the rail paragraphs; keep the mobile-first, Tailwind-parentheses, translucency-across-themes, and checking sections. `motion-system`: replace the "Ambient hero glows / the rail is desktop" bullets with the scene rules; the library rule names `three` as the single exception; keep the above-the-fold section verbatim. `building-a-section`: section shell example loses `index` on Eyebrow and the "register with the Ship Log rail" line; note the glass usage pattern (`bg-raised md:glass`) and the blur budget. `adding-a-page`: remove rail registration; every page still ends in the CTA band and footer. `quality-gate`: replace any rail/cyan checks with "blur budget ≤ 6 per desktop viewport, ≤ 2 below md" and "one accent element per viewport".
- [ ] **Step 4: MILESTONES.md.** Add **M7 — Visual revamp** (status done, date) with rows 7.1–7.5, each `done 2026-09-12` and a one-line note (7.2 records the measured `three` chunk size). Open decisions: D4 → closed (no rail; scroll line at top), D7 → closed (light mode redesigned with the revamp), D9 → closed (all variants deleted; the scene replaces them), D10 → closed (reading panel deleted). Known gaps: remove the reading-panel entry; the hero commit list is still placeholder (rename the entry from "ticker" to "Recently shipped panel"). Skill audits: one line for M7 naming the skills rewritten.
- [ ] **Step 5: Verify.** Full gate plus `yarn format:check` on the markdown (prettier formats `.md`). Grep the whole repo (excluding `node_modules`, `.next`, `docs/superpowers/specs`) for `Ship Log|ShipLog|Bricolage|Inter_Tight|cyan` — remaining hits must only be in history-style notes (MILESTONES skill audits) that describe the past.
- [ ] **Step 6: Commit.** `docs(design): rewrite CLAUDE.md and skills to the indigo/glass direction [M7.5]` — body lists the closed decisions.
