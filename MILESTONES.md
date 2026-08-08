# MILESTONES.md — progress tracker

Single source of truth for **what is done, what is in flight, and what is known-broken.**
Read at the start of every session. Update at the end of every task, before reporting.

Status: `todo` · `in progress` · `blocked` · `done`
A milestone is `done` only when every task in it passed the `quality-gate` skill. Date-stamp on completion (`YYYY-MM-DD`).

Each numbered row is **one commit** on `feature/fast-track` — the row is the review unit. See `CLAUDE.md §17` and the `git-workflow` skill. This file is updated in the same commit as the code it describes.

---

## M0 — Foundations

**Status:** in progress

Stack as installed: **Next 16.3.0 · React 19.2.8 · TypeScript 5 (strict) · Tailwind 4 · motion 13 · lucide-react 1.30**. App Router, no `src/`, alias `@/*`, ESLint flat config.

| # | Task | Status | Notes |
|---|---|---|---|
| 0.1 | `create-next-app` — App Router, TypeScript strict, Tailwind | done 2026-08-08 | Scaffolded in a temp dir and moved in, since `create-next-app` refuses a non-empty directory. Repo initialized by the scaffold (one commit, scaffold files only). `motion` + `lucide-react` installed; build and lint clean. |
| 0.2 | Fonts via `next/font/google`: Bricolage Grotesque, Inter Tight, JetBrains Mono | todo | |
| 0.3 | Tokens in `globals.css` + `@theme`; `lib/utils.ts` (`cn`) | todo | |
| 0.4 | `lib/motion.ts` — ease, dur, spring, viewport | todo | |
| 0.5 | Grain overlay + `<Container>` in `app/layout.tsx` | todo | |
| 0.6 | `lib/api/client.ts` axios instance + `normalizeError`; `.env.example` | todo | |
| 0.7 | Blank page proving every token renders | todo | |

**Exit:** `npm run build` clean, blank page shows the palette, type scale, and grain.

---

## M1 — Primitives

**Status:** todo

| # | Task | Status | Notes |
|---|---|---|---|
| 1.1 | `components/motion/Reveal.tsx` | todo | |
| 1.2 | `components/motion/StaggerGroup.tsx` | todo | |
| 1.3 | `components/motion/MaskedText.tsx` — line split | todo | |
| 1.4 | `components/motion/Parallax.tsx`, `ScrollProgress.tsx` | todo | |
| 1.5 | `ui/Button`, `ui/Card`, `ui/Eyebrow`, `ui/Badge`, `ui/Field` | todo | |
| 1.6 | Reduced-motion verified on every primitive | todo | blocks all downstream work |

**Exit:** every primitive renders correctly with `prefers-reduced-motion: reduce`.

---

## M2 — Shell + Hero

**Status:** todo

| # | Task | Status | Notes |
|---|---|---|---|
| 2.1 | `layout/Header` — sticky, blurs past 40px, mobile overlay | todo | |
| 2.2 | Shared nav source consumed by Header + Footer | todo | |
| 2.3 | `layout/Footer` | todo | |
| 2.4 | Ship Log rail — section registration + scroll tracking | todo | the signature element |
| 2.5 | Hero — masked headline, subcopy, CTA, ambient glows | todo | |
| 2.6 | Hero commit ticker (mocked data) | todo | |

---

## M3 — Home body

**Status:** todo

| # | Task | Status | Notes |
|---|---|---|---|
| 3.1 | Proof strip — 4 real stats, count-up | todo | real numbers or cut |
| 3.2 | Services — card stacking, list on mobile | todo | |
| 3.3 | Work grid — 4–6 projects, links to `/work/[slug]` | todo | |
| 3.4 | Testimonials — attributed quotes only | todo | |
| 3.5 | Brands / associations strip | todo | label honestly |
| 3.6 | Process — `01→04`, tied to the rail | todo | |
| 3.7 | Contact section + form | todo | |
| 3.8 | CTA band | todo | |

---

## M4 — GitHub integration

**Status:** todo

| # | Task | Status | Notes |
|---|---|---|---|
| 4.1 | `app/api/github/route.ts` — server-only token, `revalidate = 3600` | todo | |
| 4.2 | `lib/api/github.ts` — typed, mapped to our types | todo | |
| 4.3 | Open source section — pinned repos, stars, language, last push | todo | |
| 4.4 | Ticker switched from mock to live | todo | |
| 4.5 | Three states + typed `content/` fallback on failure | todo | |

---

## M5 — Routes

**Status:** todo

| # | Task | Status | Notes |
|---|---|---|---|
| 5.1 | `/work` — index, filterable | todo | |
| 5.2 | `/work/[slug]` — project details | todo | `generateStaticParams` + `notFound` |
| 5.3 | `/about` | todo | |
| 5.4 | `/team` | todo | real people only |
| 5.5 | `/contact` | todo | |
| 5.6 | `/schedule` — slot picker, mocked submit | todo | third-party embed needs a decision |
| 5.7 | `/careers` | todo | state comp bands |
| 5.8 | `/careers/[slug]` + application form | todo | |
| 5.9 | `not-found.tsx` | todo | |

---

## M6 — Polish

**Status:** todo

| # | Task | Status | Notes |
|---|---|---|---|
| 6.1 | Page transitions via `AnimatePresence` | todo | must not reset the rail |
| 6.2 | Metadata + OG images per route | todo | |
| 6.3 | Responsive pass — 360 / 390 / 768 / 1024 / 1280 / 1440 / 1920 + landscape | todo | audit, not the strategy; mobile-first is enforced per section as built |
| 6.4 | Keyboard + contrast pass, all routes | todo | |
| 6.5 | Lighthouse — Perf ≥ 90, A11y 100 on `/` | todo | |
| 6.6 | Chanel pass — remove one effect per section, keep what survives | todo | |

---

## Open decisions

Things that need a human answer. Do not guess past these.

| # | Question | Raised | Status |
|---|---|---|---|
| D1 | `/schedule`: self-built slot picker, or embed a third-party scheduler (a dependency + design-consistency call)? | 2026-08-08 | open |
| D2 | Real content — client names, project outcomes, stats, testimonials, logos, team bios, comp bands. Every one of these must be real. | 2026-08-08 | open |
| D3 | Which GitHub org/user feeds the Ship Log and open-source section? | 2026-08-08 | open |
| D4 | Ship Log below `lg`: proposed a 2px cyan progress bar under the header, with the active section's hash/number in that section's eyebrow. The rail has no gutter to pin to at 360px. Written into CLAUDE.md §4.5 as the default — flag if you want a different mobile form for the signature element. | 2026-08-08 | proposed |

---

## Known gaps

Real problems we shipped past on purpose. Not a wishlist.

_(none yet)_

---

## Skill audits

One line per milestone, per `maintaining-skills`. A no-op audit is a valid entry.

| Date | Milestone | Result |
|---|---|---|
| 2026-08-08 | — | Skills authored: design-system, motion-system, building-a-section, adding-a-page, content-and-copy, data-and-forms, quality-gate, maintaining-skills. |
| 2026-08-08 | M0.1 | `motion-system` corrected: package is `motion`, not `framer-motion` (no `./react` subpath on the latter). `CLAUDE.md §2` stack row updated to match, and a Next 16 warning added at the top of `CLAUDE.md` pointing at `node_modules/next/dist/docs/`. |
| 2026-08-08 | — | **Git workflow adopted.** New `git-workflow` skill + `CLAUDE.md §17`: one branch (`feature/fast-track`), one commit per tracker row. Branch created; existing work committed as two commits. |
| 2026-08-08 | — | **Adopted from `biosum/admin` skills.** Async `params`/`searchParams` (Next 15+/16) → `adding-a-page`; route state files (`loading`/`error`/`not-found` + Suspense) → `adding-a-page` + `data-and-forms`; search-before-you-build component policy + prop conventions → `building-a-section` + §10 + §15; static image imports, `priority`/LCP, `remotePatterns` → `building-a-section` + `quality-gate`; discriminated-union async state, `unknown` at boundaries, no `!` → `data-and-forms` + §10; `hooks/` added to the tree. **Not adopted:** Supabase/RLS/HIPAA/Stripe/n8n/storage/deploy (no backend here), their caching skill (PHI-specific), their `git` skill (mandates never auto-commit — this project chose the opposite). |
| 2026-08-08 | — | **PR base corrected to `staging`.** `git-workflow` + §17 updated: every PR targets `staging`; `main` is a base only on explicit request in that request. Topology `main ← staging ← feature/fast-track`. |
| 2026-08-08 | — | **Mobile-first adopted as a project constraint.** New `CLAUDE.md §4.6` (authoring rule); §4.2 glass budget split by breakpoint; §4.3 display floor lowered `3.5rem → 2.5rem`; §4.5 mobile Ship Log defined; §9 breakpoint matrix widened. Propagated to `design-system`, `motion-system`, `building-a-section`, `adding-a-page`, `quality-gate`. |
