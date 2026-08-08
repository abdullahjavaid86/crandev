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
    <Eyebrow>02 / Selected work</Eyebrow>          {/* mono, --mist */}
    <h2 id="work-heading">…</h2>                    {/* display face, text-balance */}
    …
  </Container>
</section>
```

- Eyebrow uses the mono utility face and carries the Ship Log section number.
- Register the section with the Ship Log rail rather than adding a local progress indicator.
- Exactly one `h2` per section, and headings stay ordered down the page.

## Section-specific notes

**Hero** — the thesis, stated concretely. Masked-line headline, one line of subcopy, one primary CTA, Ship Log commit ticker. Two slow ambient radial glows (cyan + ion) at very low opacity. This is the only place `dur.hero` is used.

**Proof strip** — 4 stats in mono, count-up on view. Real numbers only; if there is no number yet, cut the stat rather than inventing one.

**Work / Projects grid** — `<StaggerGroup />`, 4–6 case studies. One column on mobile, two at `md`, three at `lg`. Each card: `next/image` cover with `object-cover` and a subtle scale-on-hover inside `overflow-hidden`, client name, one-line outcome containing a real number, mono stack tags. **Set `sizes` on every cover** — `(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw` — or phones download the desktop asset. Links to `/work/[slug]`.

**Testimonials** — attributed or cut. A quote needs a name, a role, and a company; an unattributed quote reads as fabricated to exactly the audience we are addressing. Prefer 3 substantial quotes over 8 thin ones. No star ratings, no carousel that auto-advances. Stacked on mobile, grid at `md`.

**Brands / associations** — a hairline-bordered logo strip, monochrome at `--mist` opacity, lifting to full `--ice` on hover (desktop only — on touch they sit at rest). Logos as inline SVG or `next/image` with explicit dimensions; never raster logos scaled up. Label it honestly ("Teams we've shipped for" vs "Partners") — the wrong label here is a credibility leak. On mobile the strip scrolls horizontally inside its own container with `overscroll-behavior-x: contain` and a fade mask on both edges; it must never scroll the page sideways. Auto-scroll marquee only if the logos exceed one row on desktop.

**Process** — genuinely sequential, so `01 → 04` numbering is legitimate. Tied to the Ship Log rail, one reveal per step.

**Team** — `<StaggerGroup />` grid. Real photo via `next/image`, name, role, and one line of substance (what they've shipped), plus mono metadata for stack or years. No fake headshots and no generic avatar silhouettes.

**CTA band** — one per page maximum, above the footer. It holds that page's single cyan element.

## Reject on sight

- Placeholder copy, lorem ipsum, `#` links, or `console.log` left in a shipped section.
- A section built at desktop width and squeezed down afterwards.
- A `next/image` with no `sizes`, or a grid that does not start at one column.
- A section that invents its own spacing rhythm, container width, or glass variant.
- A second scene-stealer competing with the Ship Log rail.
- Two cyan elements in one viewport.
- A stat, testimonial, or logo that is not real. Ship with fewer, real items.

## Related

[design-system](../design-system/SKILL.md) · [motion-system](../motion-system/SKILL.md) · [content-and-copy](../content-and-copy/SKILL.md) · [adding-a-page](../adding-a-page/SKILL.md)
