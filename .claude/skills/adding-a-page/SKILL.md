---
name: adding-a-page
description: Use when creating a new route or reworking an existing one in this repo — /about, /team, /contact, /schedule, /careers, /careers/[slug], /work, /work/[slug], legal pages, or a 404. Covers route layout, metadata, OG tags, nav registration, and the per-page-type recipes. Triggers on "new page", "add a route", "about us", "team page", "careers", "contact page", "schedule a meeting", "book a call", "project details", "case study", "not found".
---

# Adding a Page

Each route is a full deliverable: real copy, correct metadata, keyboard path, and a place in the nav. A route that exists but is not linked and has no OG tags is not shipped.

## Route map

| Route             | Purpose                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------- |
| `/`               | Home — hero, proof, services, work, testimonials, brands, process, open source, contact |
| `/work`           | All projects, filterable by stack or sector                                             |
| `/work/[slug]`    | Project detail / case study                                                             |
| `/team`           | The people, with real substance per person                                              |
| `/about`          | Who we are, how we work, why we exist                                                   |
| `/contact`        | Form + direct channels                                                                  |
| `/schedule`       | Book a call                                                                             |
| `/careers`        | Open roles + how we hire                                                                |
| `/careers/[slug]` | Role detail + application                                                               |
| `/not-found`      | Real 404 in the site's voice                                                            |

## Checklist for every new route

1. `app/<route>/page.tsx` — **default export**, server component, composes sections from `components/sections/`.
2. Export `metadata` (or `generateMetadata` for dynamic routes): title, description, `openGraph`, `twitter`. Title pattern: `<Page> — <Agency>`. Description is one specific sentence, not the tagline.
3. Add the route to the shared nav source so `Header` and `Footer` both pick it up. Active item gets the cyan border — the one place a cyan border is legal.
4. Reuse the section shell (`py-28 md:py-40`, `<Container>`). One `h1` on the page, headings ordered. Compose and check the page at 360px before looking at it wide.
5. Register the page's sections with the Ship Log rail.
6. Dynamic routes: `generateStaticParams()` from the typed content file, plus `notFound()` for an unknown slug.
   **`params` and `searchParams` are async in Next 15+/16 — you must `await` them.** This is the single most common way code written from memory breaks on this stack:

   ```tsx
   export default async function Page({
     params,
   }: {
     params: Promise<{ slug: string }>;
   }) {
     const { slug } = await params;
   }
   ```

   `cookies()` and `headers()` are async too, and awaiting any of them opts the segment into dynamic rendering. A page reading only typed content from `content/` should stay static — don't reach for them.

7. Every page ends with the same CTA band → footer. One cyan element in that band.
8. Run [quality-gate](../quality-gate/SKILL.md), then update `MILESTONES.md`.

## Route state files

The three designed states from [data-and-forms](../data-and-forms/SKILL.md) have App Router file conventions. Co-locate them in the segment folder alongside `page.tsx` — do not hand-roll equivalents inside the page.

| File            | Role                                                                                |
| --------------- | ----------------------------------------------------------------------------------- |
| `loading.tsx`   | Route-level pending UI. Skeleton matching the final layout, never a spinner.        |
| `error.tsx`     | Error boundary. **Must be a client component** (`'use client'`), and takes `reset`. |
| `not-found.tsx` | Rendered by `notFound()`. The root one is the site 404.                             |

Wrap a slow or uncacheable part in its own `<Suspense>` so the static shell paints immediately and the rest of the route stays cacheable — the GitHub-fed sections are the case for this. A route group `(group)` organizes files without adding a URL segment; use it if the marketing routes need a shared layout that `/` does not.

## Shared chrome on mobile

Every route inherits these, so get them right once in `layout/`:

- **Header** — transparent, blurring to glass past 40px. It is the one glass surface allowed below `md`. Honours `env(safe-area-inset-top)`.
- **Nav overlay** — full-screen at `100dvh` (never `100vh`), links staggering in. It **locks body scroll, traps focus, closes on Escape and on route change**, and returns focus to the trigger. The trigger is an icon button with an `aria-label` and `aria-expanded`.
- **Footer** — single column on mobile, columns at `md`. Honours `env(safe-area-inset-bottom)`.
- **Scroll progress** — below `lg` the Ship Log rail becomes a 2px cyan bar under the header. Do not build a per-page variant.

## Page recipes

**`/work` (Projects index)** — `<StaggerGroup />` over `content/work.ts`. Filter chips for stack or sector, driven by client-side state on a leaf component; filtering must not remount the grid. If there are fewer than 6 projects, ship the grid without filters rather than an empty filter bar.

**`/work/[slug]` (Project details)** — the page a CTO reads before booking. Structure:
`problem → what we built → how → measurable outcome`. Hero with client name and one-line outcome carrying a real number; mono metadata row (stack, duration, team size, year); the narrative in `65ch` prose; at least one real artifact (architecture sketch, screenshot, or metric); a pull-quote from the client if one exists; next/previous project links. No generic "challenges and solutions" headings.

**`/team`** — grid of real people (see [building-a-section](../building-a-section/SKILL.md)). Then a short "how we work" block. Never pad the grid with placeholder members; a three-person agency reads as honest, a fake eight-person one does not survive one call.

**`/about`** — the origin, the operating principles, and what we decline to do. Saying what you don't take on is the most credible thing on this page. Prose in `65ch`, one masked headline max, no stock office photography.

**`/contact`** — form plus the direct channels (email, GitHub, location, timezone) in mono. Set expectations explicitly: "We reply within one business day." See [data-and-forms](../data-and-forms/SKILL.md).

**`/schedule`** — booking. There is no backend, so the default build is a self-hosted slot picker: a typed availability source in `content/availability.ts`, a keyboard-navigable calendar, a timezone note derived from `Intl.DateTimeFormat().resolvedOptions().timeZone`, and a submit routed through `lib/api/client.ts` to a mocked resolver. Keep the handler swappable in one line so a real scheduler drops in later. **Embedding a third-party scheduler is a dependency and a design-consistency decision — ask before adding one.**

**`/careers`** — roles from `content/roles.ts`. Each row: title, mono metadata (level, location, comp band, stack). State the comp band; withholding it costs more senior applicants than it saves. Include how we hire, step by step, with real timings. If there are no open roles, say so and offer a way to be told when there are — never an empty list.

**`/careers/[slug]`** — the role in full: what you'd own, what the first 90 days look like, what we expect you to already know, the interview loop, the band. Application form with a résumé/portfolio link field (URL, not upload — no backend).

**`/not-found`** — in the interface's voice, with a route back and links to the two most useful pages. No apology, no ASCII art.

## Reject on sight

- A route with no `metadata` export or no OG tags.
- A page not reachable from `Header` or `Footer`.
- More than one `h1`, or a heading level skipped.
- A `#` href in shipped navigation.
- A dynamic route with no `notFound()` path.
- Legal or comp claims invented to fill space.

## Related

[building-a-section](../building-a-section/SKILL.md) · [data-and-forms](../data-and-forms/SKILL.md) · [content-and-copy](../content-and-copy/SKILL.md) · [quality-gate](../quality-gate/SKILL.md)
