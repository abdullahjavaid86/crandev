---
name: building-a-section
description: Use when building or substantially reworking any section of a page in this repo — hero, services, work grid, testimonials, brands strip, process, team grid, stats, FAQ, CTA band, footer. The end-to-end recipe from content type to shipped section. Triggers on "build the X section", "add a section", "hero", "testimonials", "logos", "brands", "work grid", "process", "stats", "compose the page".
---

# Building a Section

A section is the unit of work in this repo. Build one at a time, take it all the way to the quality gate, then stop for review. Never scaffold five sections at once — five half-sections is worse than one finished one.

## Order of operations

Work in this order. Skipping step 1 or 2 is what produces sections that need rebuilding.

1. **Content type first.** Define the shape in `types/index.ts`, then write the real data in `content/<thing>.ts`. Typed, no CMS. Writing the copy first tells you what the layout has to hold — see [content-and-copy](../content-and-copy/SKILL.md).
2. **Static markup at 360px, zero motion.** Server component, real copy, real tokens, written mobile-first — unprefixed classes are the phone layout and `md:`/`lg:` only add. It must look right frozen and narrow. A section that only works once it moves, or only once it is wide, is a broken section.
3. **Motion last, one moment.** Add the single orchestrated reveal from [motion-system](../motion-system/SKILL.md). Existing primitives only.
4. **States, if async.** Loading, empty, and error designed at the same time as the happy path — see [data-and-forms](../data-and-forms/SKILL.md).
5. **[quality-gate](../quality-gate/SKILL.md).** Then update `MILESTONES.md` and report.

## Search before you build

**Before writing any component, hook, helper, type, or piece of logic, search for it.** Not just components — one `cn()`, one date formatter, one slug lookup. Duplication is invisible in review until there are four copies.

1. Grep `components/`, `hooks/`, `lib/`, and `types/` by name **and** by behaviour — the existing one may not be called what you'd call it.
2. Found it → use it. Close but missing a case → **add a variant or parameter to the existing one**, never fork a near-copy.
3. Genuinely absent → create it in the shared location so the next task finds it.

**Before hand-building interactive behaviour, check whether Radix or shadcn already solves it.** Dialog, popover, tooltip, select, and anything involving focus management are hard to get right and easy to get subtly wrong. Buttons and cards stay hand-built — a dependency for those is not worth it.

When adopting a shadcn component: take the behaviour and the ARIA wiring, then **strip its palette and restyle against our tokens**. If it still references `--background`, `--foreground`, or stock Tailwind greys, it isn't adopted — it's pasted, and it will drift from the design system on the first hover state.

This matters most when sections are built in parallel by separate agents (`CLAUDE.md §15`): three agents each needing a quote card will each invent one unless the primitive already exists or is claimed. **Build shared primitives first, sequentially; fan out only over sections that consume them.**

## Component conventions

- Typed props via an explicit `interface`, extending the native element so consumers get standard attributes: `interface ButtonProps extends React.ComponentProps<'button'>`.
- Variants and sizes come from a single typed variant map merged through `cn()` — not ad-hoc conditional strings.
- Forward `ref` wherever the DOM node matters (focus management, measurement, motion targets).
- Accessible by default: wire `aria-*`, support keyboard interaction, expose `disabled` and `aria-invalid`.
- Presentational primitives stay server components unless they need interactivity, and never fetch data — pass it in as props.
- Non-trivial stateful logic becomes a custom hook in `hooks/`, named for its owner (`hooks/useTheme.ts`).
- **Shared style functions and helpers live in a module with no `'use client'`.** A helper exported from a client module cannot be called by a server component — it fails at prerender, and re-exporting it through another file does not help. Put the helper in its own plain module and have the client component import it too.

## Anatomy

```
components/sections/Testimonials.tsx    // server component; composes, holds no primitives
components/ui/QuoteCard.tsx             // reusable primitive, named export
content/testimonials.ts                 // typed data + real copy
types/index.ts                          // Testimonial interface
```

Rules:

- **A section file composes. It does not define primitives inline.** If you write a card's markup inside the section, extract it.
- **More than ~120 lines of JSX means split.** Not negotiable at 200.
- Server component by default. `'use client'` goes on the motion or interaction leaf, never on the section wrapper.
- Named exports for components. Default export only for Next.js pages and layouts.
- Section root is a semantic `<section>` with an `aria-labelledby` pointing at its own heading.

## The section shell

Every section shares one shell so vertical rhythm never drifts:

```tsx
<section id="work" aria-labelledby="work-heading" className="py-28 md:py-40">
  <Container>
    <Eyebrow>Selected work</Eyebrow> {/* small sans label, sentence case, text-muted */}
    <h2 id="work-heading">…</h2> {/* display face, text-balance */}…
  </Container>
</section>
```

- Eyebrow is a small sans label in sentence case — no mono, no index number.
- Exactly one `h2` per section, and headings stay ordered down the page.
- A glass surface follows `rounded-md border border-line bg-raised md:glass` — solid on phones, blurred from `md` up. Stay inside the blur budget: ≤ 2 glass surfaces per viewport below `md`, ≤ 6 above, never stacked more than two deep.

## Images

- **Static-import local images** rather than passing a string path: `import cover from '@/public/work/acme.png'`. You get an automatic blur placeholder, correct intrinsic dimensions with no layout shift, and a long-term hashed URL. The blur-up is free and reads well against the dark ground — it is the right default for every project cover and team photo.
- **`priority` goes on exactly one image per route** — the real above-the-fold LCP image, which on most of our routes is nothing at all. Everything else stays lazy. `priority` on a below-the-fold image actively hurts LCP.
- Remote images (GitHub avatars) need their host allow-listed in `next.config.ts` under `images.remotePatterns`.
- `sizes` is mandatory on anything responsive or using `fill` — see the work grid below.

## Section-specific notes

**Hero** — the thesis, stated concretely. Masked-line headline, one line of subcopy, primary CTA ("Book a call") and secondary CTA ("See the work"), and at `md` the "Recently shipped" glass panel (a static list of the last three commits). This is the only place `dur.hero` is used. The ambient scene lives once in `app/layout.tsx`, not per-section — the hero does not add its own background.

**Proof strip** — one glass band, 4 stats divided by hairlines, figures in Geist Sans 600 tabular, count-up on view. Real numbers only; if there is no number yet, cut the stat rather than inventing one.

**Work / Projects grid** — `<StaggerGroup />`, 4–6 case studies, two-column grid at `md` (one column base) with the first project spanning both columns and a taller cover. Each card: `next/image` cover with `object-cover` and a subtle scale-on-hover inside `overflow-hidden`, client name, one-line outcome containing a real number, quiet stack tags. **Set `sizes` on every cover** — `(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw` — or phones download the desktop asset. Links to `/work/[slug]`.

**Testimonials** — attributed or cut. A quote needs a name, a role, and a company; an unattributed quote reads as fabricated to exactly the audience we are addressing. Prefer 3 substantial quotes over 8 thin ones. No star ratings, no carousel that auto-advances. Stacked on mobile, grid at `md`.

**Brands / associations** — a marquee, no bordered box, monochrome at `text-muted`, lifting to `text-fg` on hover (desktop only — on touch they sit at rest). Logos as inline SVG or `next/image` with explicit dimensions; never raster logos scaled up. Label it honestly ("Teams we've shipped for" vs "Partners") — the wrong label here is a credibility leak. On mobile the strip scrolls horizontally inside its own container with `overscroll-behavior-x: contain` and a fade mask on both edges; it must never scroll the page sideways. Auto-scroll marquee only if the logos exceed one row on desktop.

**Process** — genuinely sequential, so `01 → 04` numbering is legitimate. A 2×2 grid at `md` of quiet numbered tiles (large light numeral, title, duration, detail), one `<StaggerGroup />` reveal.

**Team** — `<StaggerGroup />` grid. Real photo via `next/image`, name, role, and one line of substance (what they've shipped), plus mono metadata for stack or years. No fake headshots and no generic avatar silhouettes.

**CTA band** — one per page maximum, a full-width centred glass panel above the footer. It holds that page's single accent element.

## Reject on sight

- Placeholder copy, lorem ipsum, `#` links, or `console.log` left in a shipped section.
- A section built at desktop width and squeezed down afterwards.
- A `next/image` with no `sizes`, or a grid that does not start at one column.
- A section that invents its own spacing rhythm, container width, or glass variant.
- A second scene-stealer competing with the ambient scene or the hero's shipped panel.
- Two accent elements in one viewport.
- A `three` import anywhere outside `lib/scene/`.
- A stat, testimonial, or logo that is not real. Ship with fewer, real items.

## Related

[design-system](../design-system/SKILL.md) · [motion-system](../motion-system/SKILL.md) · [content-and-copy](../content-and-copy/SKILL.md) · [adding-a-page](../adding-a-page/SKILL.md)
