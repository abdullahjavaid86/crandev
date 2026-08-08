---
name: data-persistence
description: Use when writing anything that reads JSON content or writes submitted data in this repo — content/*.json and its zod schemas, lib/content/ loaders, lib/db/ MongoDB client, Server Actions, contact/schedule/careers form submission, rate limiting, or env vars. Triggers on "mongo", "mongodb", "database", "server action", "submit", "form", "save", "store", "zod", "schema", "validate", "json", "content", "env", "MONGODB_URI", "rate limit", "spam".
---

# Data Persistence

Three concerns that must never blur into each other:

| Concern         | Source                            | Direction         |
| --------------- | --------------------------------- | ----------------- |
| Page content    | JSON in `content/`, zod-validated | read, build time  |
| Live decoration | route handler + axios             | read, revalidated |
| Submissions     | MongoDB via Server Action         | **write only**    |

**Mongo never serves page content. JSON never stores a submission.** A section that needs data reads JSON; a form that sends data writes Mongo. If you find yourself querying Mongo to render a project, stop — that is the wrong layer.

## Content: JSON behind a zod schema

JSON has no compile-time type. An unvalidated `import data from './work.json'` is `any` wearing a costume, and a typo in a slug becomes a runtime crash on a page you didn't open.

```ts
// lib/content/work.ts
import raw from "@/content/work.json";

const Project = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  client: z.string().min(1),
  outcome: z.string().min(1), // must contain a real number
  stack: z.array(z.string()).min(1),
  year: z.number().int().min(2015),
});

export type Project = z.infer<typeof Project>;
export const projects: Project[] = z.array(Project).parse(raw);
```

- **Parse at the module boundary, once.** Everything downstream consumes the parsed value.
- **`parse`, not `safeParse`, for content.** Malformed content should fail the build, not degrade at runtime.
- **Derive types with `z.infer`.** Never hand-write an interface next to a schema — they drift.
- Slug is the stable join key to dynamic routes. Kebab-case, never changes after publish.
- Copy rules from [content-and-copy](../content-and-copy/SKILL.md) still apply — JSON is a container, not permission to write filler.

**Images can't be static-imported from a JSON string.** Keep a TS map beside the loader so covers keep their blur placeholder and intrinsic sizing:

```ts
// lib/content/covers.ts
import acme from "@/public/work/acme.png";
export const covers = { "acme-migration": acme } satisfies Record<
  string,
  StaticImageData
>;
```

A slug present in JSON but missing from the map should be a type error, not a broken image.

## MongoDB: submissions only

Official `mongodb` driver. **Not Mongoose** — shapes are already defined in zod, and a second schema system plus model lifecycle is weight this site doesn't need.

```ts
// lib/db/client.ts — one cached promise, reused across invocations
let clientPromise: Promise<MongoClient> | undefined;
export function getClient() {
  clientPromise ??= new MongoClient(process.env.MONGODB_URI!).connect();
  return clientPromise;
}
```

- **Never open a connection per request.** Serverless will exhaust the pool.
- `lib/db/` is the only place that builds a query. Sections and components never import the driver.
- Add `import 'server-only'` to every module under `lib/db/` — importing the driver into a client component leaks your connection string into the bundle.
- Collections: `contact`, `meetings`, `applications`. Every document carries `createdAt` and `source`.

## Server Actions

**A Server Action is a public POST endpoint.** Anyone can call it with any payload. The client-side validation is a convenience for the user, never the gate.

```ts
"use server";
export async function submitContact(_prev: State, formData: FormData): Promise<State> {
  const parsed = ContactInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields." };
  // …rate limit, honeypot, insert…
}
```

- Live in `actions.ts`; always `async`. An `actions.ts` may export only async actions — helpers go in a sibling file.
- **Re-validate everything with zod on the server**, regardless of what the client checked. `safeParse` here — a bad submission is expected input, not a crash.
- **Cap every string length** in the schema. An uncapped textarea is an unbounded write.
- **Rate-limit by IP** before touching the database, and keep the honeypot from [data-and-forms](../data-and-forms/SKILL.md).
- Never interpolate user input into a query or a filter object.
- **Return a discriminated result** — `{ ok: true } | { ok: false; error: string }`. Never let a driver error, a stack trace, or a connection string reach the client. Log the real error server-side.
- Revalidate affected reads after a write only if a read actually depends on it. Submissions are write-only, so usually nothing to revalidate.

## Env

Server-only, never `NEXT_PUBLIC_*`. `.env.example` is committed with empty values; `.env.local` never is.

| Var            | Purpose                                                        |
| -------------- | -------------------------------------------------------------- |
| `MONGODB_URI`  | connection string — contains credentials                       |
| `MONGODB_DB`   | database name                                                  |
| `GITHUB_TOKEN` | optional; Ship Log works unauthenticated at a lower rate limit |

A missing `MONGODB_URI` should fail loudly at first use with a clear message, not `undefined` deep in the driver.

## Reject on sight

- `import data from './x.json'` used without passing through a schema.
- A hand-written interface sitting next to a zod schema for the same shape.
- Mongoose, or a second validation library.
- The driver imported outside `lib/db/`, or any `lib/db/` module without `server-only`.
- A Server Action that trusts client validation, or has no length caps.
- A raw driver error returned to the client.
- A connection opened per request.

## Related

[data-and-forms](../data-and-forms/SKILL.md) · [content-and-copy](../content-and-copy/SKILL.md) · [adding-a-page](../adding-a-page/SKILL.md) · `CLAUDE.md §7`
