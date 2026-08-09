---
name: data-and-forms
description: Use when touching anything async or interactive in this repo — the axios client, route handlers under app/api/, the GitHub integration, env vars and secrets, loading/empty/error states, or any form (contact, schedule a meeting, careers application, newsletter). Triggers on "fetch", "api", "axios", "route handler", "github", "token", "env", "form", "validation", "submit", "input", "select", "skeleton", "loading", "error state", "rate limit".
---

# Data and Forms

Two async surfaces, and they are not the same thing. **Reads** are route handlers proxying a public API (GitHub), cached at the route. **Writes** are Server Actions into MongoDB — see [data-persistence](../data-persistence/SKILL.md), which owns the database, the zod schemas and the Server Action rules. This file owns the axios client, the three designed states, and form behaviour.

## One axios instance

`lib/api/client.ts` exports the single configured instance. **Nothing else creates one, and no component imports `axios` directly.**

```ts
import axios from "axios";

export const api = axios.create({ timeout: 8000 });

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(normalizeError(err)), // -> { status, message, code }
);
```

Typed call sites live in `lib/api/<domain>.ts` (e.g. `lib/api/github.ts`) and return **our** types from `types/index.ts`. A raw upstream object must never cross into a component.

## Route handlers

- Secrets are **server-side only**. `GITHUB_TOKEN` in `.env.local`, never `NEXT_PUBLIC_*`. Commit `.env.example` with empty values.
- Client components never call a third-party API directly. They call `app/api/<name>/route.ts`, which uses the axios instance server-side and returns a narrowed shape.
- Set `export const revalidate = 3600` on the handler. Axios bypasses Next's fetch cache, so caching happens at the route level, not the request level.
- GitHub headers: `Accept: application/vnd.github+json`, `X-GitHub-Api-Version: 2022-11-28`, and `Authorization: Bearer ${token}` **only when the token exists**.
- **Rate limits and outages are normal, not exceptional.** On failure, the section renders its typed fallback from `content/` and logs server-side. The user never sees an error state for decorative data.

## Model async state as a discriminated union

Never a bag of booleans (`isLoading`, `isError`, `data`) — that lets `isLoading && isError` typecheck and leaves the three states as something you remember to handle rather than something the compiler enforces.

```ts
type Async<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };
```

The same shape covers form submission (`idle | submitting | success | error`). Switch on `status` and the compiler tells you when a state has no UI.

Untrusted input — an upstream API body, a form value — is `unknown` at the boundary and narrowed explicitly. Never cast straight to a domain type, and never reach for `!` to silence a null.

If the same read happens more than once in a request, wrap it in React `cache()` so it runs once.

## The three states

Every async surface ships all three at the same time as the happy path. Building the happy path alone and adding states later is how a section gets rebuilt.

At route level these have App Router files — `loading.tsx`, `error.tsx` (must be `'use client'`), `not-found.tsx`. See [adding-a-page](../adding-a-page/SKILL.md). Within a section, build them inline.

- **Loading** — a skeleton matching the final layout's dimensions exactly. Glass surface, no spinner, subtle shimmer that respects reduced motion. If the skeleton and the loaded content are different heights, the layout shifts and the section fails the quality gate.
- **Empty** — a sentence saying what would appear here, plus an action. Never "No data."
- **Error** — what happened and what to do, in the interface's voice. No apology, no stack trace.

Copy for all three comes from [content-and-copy](../content-and-copy/SKILL.md).

## Forms

Applies to contact, schedule-a-meeting, careers application, and anything else that submits.

**Structure**

- Build on the shared `ui/Field` primitive: label, control, description, error, all wired with `htmlFor`/`id`. No unlabelled inputs, no placeholder-as-label.
- Native `<form>` with a real `onSubmit`. Submit works on Enter.
- **Validate with zod on the server, always.** A Server Action is a public POST endpoint; whatever the client checked is a convenience, not a gate. Client-side checks are for the user's benefit only.
- Submit goes through a **Server Action**, not `fetch()` in a component and not the axios client — axios is for outbound reads. The action returns a discriminated result (`{ ok: true } | { ok: false; error }`); a driver error must never reach the client.

**Behaviour**

- Validate on blur and on submit, never on every keystroke.
- On submit: disable the button, show in-flight state, keep the label's verb ("Sending…" for "Send").
- On error: focus the first invalid field, set `aria-invalid`, link the message with `aria-describedby`, and announce it in an `aria-live="polite"` region.
- **Split the live region from the visible message.** A live region has to be in the DOM _before_ its text to be announced reliably — but that is not a reason to reserve space for it. Keep a permanent `sr-only` region for the announcement and render the visible error **only when there is one**. An always-present error line with `min-h-*` holds open a row per field, and as a flex child it eats a `gap` slot on each side; on a five-field form that was ~96px of dead space under the last input.
- On success: replace the form with a designed success state that says what happens next and by when. Do not just toast and leave the form sitting there.
- **Never clear what the user typed on a failed submit — and React 19 will do this for you unless you stop it.** A `<form action={…}>` resets its uncontrolled inputs once the action resolves, so a validation error silently wipes everything typed. Have the action echo the submitted values back in its error state and set them as `defaultValue`. That works _with_ the reset (a reset restores inputs to their defaultValue) and still works with JavaScript off, which a client-side ref does not. Never echo a password back.
- Honeypot field for spam, visually hidden and `aria-hidden`, never a CAPTCHA.

**Fields**

- Contact: name, company, what you're building, budget range. Budget as a select of real bands.
- Careers: name, email, links (URL fields — no file upload, since there is no blob storage), one substantive question specific to the role.
- Schedule: date, slot, timezone (derived from `Intl.DateTimeFormat().resolvedOptions().timeZone`, editable), plus what they want to discuss.

**Accessibility floor** — full keyboard path, visible `:focus-visible` ring in `--accent-ink` on every control, checked in both themes, 44px minimum tap targets, correct `type`/`inputMode`/`autoComplete` on every input.

## Reject on sight

- `axios` imported into a component, or a second axios instance.
- A secret in a `NEXT_PUBLIC_*` var or reaching the client bundle.
- A raw upstream API shape used in JSX.
- A spinner where a skeleton belongs.
- A form with no error state, no success state, or no `aria-live` announcement.
- An empty error slot reserving vertical space. Collapse it; keep the live region `sr-only`.
- A form whose fields empty themselves after a failed submit. That is React 19's reset, not the user's browser.
- A form that trusts client-side validation, or an action with no server-side zod parse.

## Related

[content-and-copy](../content-and-copy/SKILL.md) · [adding-a-page](../adding-a-page/SKILL.md) · [quality-gate](../quality-gate/SKILL.md)
