---
name: api-response
description: "The single global ApiResponse contract for every server action and route handler. Use when writing API endpoints, route handlers, or server actions."
metadata:
  author: biosum
  version: "1.0.0"
---

# API response contract

There is exactly **one** response shape, in `lib/api/response.ts`. Do not invent
per-endpoint envelopes. A uniform shape means the client handles success and
failure identically everywhere, and we get one safe place to keep internal error
detail (and PHI) from leaking.

```ts
type ApiResponse<T> =
  | { success: true;  data: T;    error: null }
  | { success: false; data: null; error: { code: ErrorCode; message: string; details?: ... } };
```

## Producing responses

Wrap the body in `handle()` — it returns `ok(result)` or converts a thrown error
into a client-safe response:

```ts
// server action — returns the ApiResponse object directly
export async function cancelAppointment(id: string) {
  "use server";
  return handle(async () => {
    const user = await requireUser();
    const repo = new AppointmentRepository(await createClient());
    return repo.findOneAndUpdate({ id }, { status: "cancelled" }, { userId: user.id });
  });
}

// route handler — same body, wrapped with the HTTP-status adapter
export async function POST(req: Request) {
  return toNextResponse(await handle(async () => { /* ... */ }));
}
```

## Rules

- To fail with a specific outcome, `throw new ApiException(ErrorCode.X, "msg")`.
  `handle()` maps it to the right `code`/status.
- Use the fixed `ErrorCode` set (`UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`,
  `VALIDATION`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL`). Add to the enum rather
  than inventing free-form strings — the client branches on these.
- Unexpected errors become a generic `INTERNAL` response; the real error is
  logged server-side only. **Never** put raw DB errors, stack traces, or PHI in
  `message`/`details`.
- Client components import the **type only**: `import type { ApiResponse } from
  "@/lib/api/response"` — never the value, so server imports stay out of the
  client bundle.
