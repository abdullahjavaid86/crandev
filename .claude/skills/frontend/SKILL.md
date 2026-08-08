---
name: frontend
description: "Frontend rules — App Router, Server Components by default, Tailwind v4 styling, accessibility. Use when working on UI, pages, or client components."
metadata:
  author: biosum
  version: "1.1.0"
---

# Frontend

## Server-first

- **Server Components by default.** Add `"use client"` only when you need
  interactivity, browser APIs, or hooks. Keep client components small and at the
  leaves; fetch data in Server Components / actions, pass it down as props.
- Data flows UI → server action / route handler → service/repository. Client
  components never query Supabase for writes or sensitive reads
  (`server-actions` skill).
- Designs come from Figma — implement them faithfully. Focus effort on structure,
  accessibility, and state handling, not re-deciding the visual design.

## Tailwind

- Tailwind CSS **v4**, configured CSS-first in `app/globals.css` (there is no
  `tailwind.config.js`). Define design tokens (colors, spacing, fonts) as CSS
  variables / `@theme` in `globals.css` and use them — **don't hardcode hex
  values or magic numbers** in markup when a token exists.
- Compose utilities in markup. Extract a **component** (not an `@apply` blob)
  when a pattern repeats — see `components` skill.
- For conditional/variant class logic use a single, consistent helper (e.g.
  `cn()` wrapping `clsx` + `tailwind-merge`). Don't hand-concatenate class
  strings with template literals.
- Respect the dark-mode strategy already in `globals.css`; use semantic tokens
  so light/dark both work without per-element overrides.

## Dashboard shell & theme

- The dashboard chrome is a **selectively-ported TailAdmin** (free, MIT) shell
  restyled to the biosum brand — layout structure only, not the full template.
  Shell components live in `components/layout/` (`shell.tsx`, `header.tsx`,
  `sidebar.tsx`, `theme-toggle.tsx`); don't re-derive layout from scratch when
  extending it.
- **Dark mode is class-based**, not `prefers-color-scheme`: `.dark` on `<html>`
  (via `@custom-variant dark (&:where(.dark, .dark *))` in `globals.css`) flips
  brand tokens. Always style with the semantic tokens (not raw Tailwind grays)
  so a component works in both modes automatically. `theme-toggle.tsx` flips the
  class and persists the choice in a cookie to avoid FOUC — don't add a second
  theme mechanism.

## Accessibility & UX

- Use semantic HTML and real `<button>`/`<a>`; label inputs; keyboard and focus
  states must work. This is a healthcare product — forms (booking, intake) must
  be clear, validated, and accessible.
- Show explicit loading and error states for every async action; never leave the
  UI in an ambiguous state after a server action returns `success: false`.
- Never render another user's data; never put PHI in URLs, `localStorage`, or
  analytics (`hipaa-compliance` skill).
