---
name: data-and-forms
description: Use when touching anything async or interactive in this repo — the axios client, route handlers under app/api/, the GitHub integration, env vars and secrets, loading/empty/error states, or any form (contact, schedule a meeting, careers application, newsletter). Triggers on "fetch", "api", "axios", "route handler", "github", "token", "env", "form", "validation", "submit", "input", "select", "skeleton", "loading", "error state", "rate limit".
---

# Data and Forms

There is no backend, no database, and no auth. Everything async is either a Next.js route handler proxying a public API, or a mocked promise behind a real interface. Build both as if the real thing were coming, because it is.

## One axios instance

`lib/api/client.ts` exports the single configured instance. **Nothing else creates one, and no component imports `axios` directly.**

```ts
import axios from 'axios';

export const api = axios.create({ timeout: 8000 });

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(normalizeError(err)),   // -> { status, message, code }
);
```

Typed call sites live in `lib/api/<domain>.ts` (e.g. `lib/api/github.ts`) and return **our** types from `types/index.ts`. A raw upstream object must never cross into a component.

## Route handlers

- Secrets are **server-side only**. `GITHUB_TOKEN` in `.env.local`, never `NEXT_PUBLIC_*`. Commit `.env.example` with empty values.
- Client components never call a third-party API directly. They call `app/api/<name>/route.ts`, which uses the axios instance server-side and returns a narrowed shape.
- Set `export const revalidate = 3600` on the handler. Axios bypasses Next's fetch cache, so caching happens at the route level, not the request level.
- GitHub headers: `Accept: application/vnd.github+json`, `X-GitHub-Api-Version: 2022-11-28`, and `Authorization: Bearer ${token}` **only when the token exists**.
- **Rate limits and outages are normal, not exceptional.** On failure, the section renders its typed fallback from `content/` and logs server-side. The user never sees an error state for decorative data.

## The three states

Every async surface ships all three at the same time as the happy path. Building the happy path alone and adding states later is how a section gets rebuilt.

- **Loading** — a skeleton matching the final layout's dimensions exactly. Glass surface, no spinner, subtle shimmer that respects reduced motion. If the skeleton and the loaded content are different heights, the layout shifts and the section fails the quality gate.
- **Empty** — a sentence saying what would appear here, plus an action. Never "No data."
- **Error** — what happened and what to do, in the interface's voice. No apology, no stack trace.

Copy for all three comes from [content-and-copy](../content-and-copy/SKILL.md).

## Forms

Applies to contact, schedule-a-meeting, careers application, and anything else that submits.

**Structure**

- Build on the shared `ui/Field` primitive: label, control, description, error, all wired with `htmlFor`/`id`. No unlabelled inputs, no placeholder-as-label.
- Native `<form>` with a real `onSubmit`. Submit works on Enter.
- Client-side validation only, and **hand-rolled** — a validation library is a dependency; state why before adding one.
- Submit resolves through `lib/api/client.ts` against a mocked promise, so swapping in a real endpoint is a one-line change. Never `fetch()` inline in a component.

**Behaviour**

- Validate on blur and on submit, never on every keystroke.
- On submit: disable the button, show in-flight state, keep the label's verb ("Sending…" for "Send").
- On error: focus the first invalid field, set `aria-invalid`, link the message with `aria-describedby`, and announce it in an `aria-live="polite"` region.
- On success: replace the form with a designed success state that says what happens next and by when. Do not just toast and leave the form sitting there.
- Never clear what the user typed on a failed submit.
- Honeypot field for spam, visually hidden and `aria-hidden`, never a CAPTCHA.

**Fields**

- Contact: name, company, what you're building, budget range. Budget as a select of real bands.
- Careers: name, email, links (URL fields — no file upload, there is no backend), one substantive question specific to the role.
- Schedule: date, slot, timezone (derived from `Intl.DateTimeFormat().resolvedOptions().timeZone`, editable), plus what they want to discuss.

**Accessibility floor** — full keyboard path, visible cyan `:focus-visible` ring on every control, 44px minimum tap targets, correct `type`/`inputMode`/`autoComplete` on every input.

## Reject on sight

- `axios` imported into a component, or a second axios instance.
- A secret in a `NEXT_PUBLIC_*` var or reaching the client bundle.
- A raw upstream API shape used in JSX.
- A spinner where a skeleton belongs.
- A form with no error state, no success state, or no `aria-live` announcement.
- A validation library added without stating why first.

## Related

[content-and-copy](../content-and-copy/SKILL.md) · [adding-a-page](../adding-a-page/SKILL.md) · [quality-gate](../quality-gate/SKILL.md)
