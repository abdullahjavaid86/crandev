---
name: typescript
description: "TypeScript standards — strict typing, no any, type-safe data and inputs. Use when writing or reviewing TypeScript/TSX files."
metadata:
  author: biosum
  version: "1.0.0"
---

# TypeScript

`strict` is on. Lean on the type system — it's a correctness tool, and for a
PHI-handling app, type-safe data boundaries reduce the chance of mishandling
records.

- **No `any`.** Use `unknown` at untrusted boundaries (server action input,
  webhook bodies, external JSON) and narrow with a validator (zod). The only
  sanctioned `any` is the Supabase query-builder chaining inside
  `BaseRepository.scoped`, which is contained and commented.
- **No non-null `!` assertions** to silence the compiler — handle the null. The
  exception is reading guaranteed env vars in client factories.
- Prefer **inferred** return types for internal functions; write explicit types
  at module boundaries and for exported APIs.
- Model rows derive from generated Supabase types
  (`Database["public"]["Tables"]["x"]["Row"]`) once available — don't hand-write
  shapes that can drift from the schema (`supabase-repository` skill).
- Validate all external input with a schema; never cast `unknown` straight to a
  domain type.
- Use discriminated unions over boolean flags for state (the `ApiResponse` union
  is the model to follow). Prefer `type`/`interface` over enums; use `as const`
  objects + derived union types (see `ErrorCode`).
- Keep functions pure and side-effect-light where possible so they're testable;
  push I/O to repositories and the edges.
