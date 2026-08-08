---
name: components
description: "Component reuse policy — scan existing components before creating new ones. Use when building or extending any UI component."
metadata:
  author: biosum
  version: "1.2.0"
---

# Components

## Search before you build — always

Before creating ANY component, **scan the components directory first**
(`components/` and/or `app/components/`, including a `components/ui/` primitives
folder if present). Reuse or extend what exists. Only create a new component when
nothing suitable is there.

Current layout: `components/layout/` holds the TailAdmin-derived dashboard shell
(`shell.tsx`, `header.tsx`, `sidebar.tsx`, `theme-toggle.tsx`); `components/users/`
holds feature components for the users list (`users-table.tsx`). New shell pieces
go in `layout/`; new feature UI goes in a folder named for its feature, alongside
`users/` — don't scatter feature components at the `components/` root.

This applies to primitives especially — `Button`, `Input`, `Select`, `Textarea`,
`Checkbox`, `Label`, `Card`, `Dialog`, `Badge`, `Table`, etc. We want **one**
`Button`, not five near-duplicates. If an existing primitive is close but
missing a case, add a variant/prop to it rather than forking a new file.

Workflow when you need a component:
1. Grep the components dir for the name and for similar UI.
2. Found it → use it. Close-but-incomplete → extend it (new variant/prop).
3. Genuinely absent → create it following the conventions below, in the shared
   location so the next person finds it.

## Conventions for new components

- **Primitives** (generic, reusable, no business logic) live in the shared UI
  folder. **Feature components** (compose primitives + domain logic) live with
  their feature.
- Typed props via an explicit `interface`; extend the native element's props
  (e.g. `React.ComponentProps<"button">`) so consumers get standard attributes.
- Variants/sizes via a typed prop with a single source of truth (a variant map
  or `cva`), merged through the `cn()` helper — consistent with `frontend` skill.
- Presentational components stay Server Components unless they need
  interactivity; push `"use client"` to the smallest interactive piece.
- Accessible by default: forward `ref` where the DOM node matters, wire
  `aria-*`, support keyboard interaction, expose `disabled`/`aria-invalid`.
- Don't fetch data or call Supabase inside a presentational primitive — pass data
  and handlers in as props.
- **Split large components.** If a component has clearly separable parts, break it into sub-components — this takes priority over keeping things in one file, and **no single component file may exceed 500 lines.** A feature's component plus its sub-components live together in a folder named for the feature (e.g. `components/booking-wizard/` containing its step/section pieces).
- **Avoid unnecessary re-renders** — crucial for performance. Memoize with `React.memo` / `useCallback` / `useMemo` where a child would otherwise re-render on every parent update (apply where it prevents real waste, not on cheap leaves).
- **Extract non-trivial logic into a custom hook** whenever it reads better as one.
- **Hooks, types, and constants live in dedicated top-level folders at the repo root:** `hooks/`, `types/`, and `constants/` (imported via `@/hooks`, `@/types`, `@/constants`). Every component and page places its hook, type, and constant files in these root folders — never in per-component sub-folders. Name each file for its owner so it stays discoverable (e.g. `hooks/use-booking-wizard.ts`, `types/booking-wizard.ts`, `constants/booking-wizard.ts`); genuinely shared hooks/types/constants sit at the folder root under a general name. Component folders contain component files only.
