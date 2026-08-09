# Admin portal — design

**Date:** 2026-08-09
**Status:** approved, not yet implemented

## Why

Contact submissions are written to MongoDB and nothing reads them back. A real
enquiry is invisible until someone opens Atlas. This adds the smallest portal
that makes submitted data usable: see it, triage it, annotate it.

### What this reverses

`CLAUDE.md §2` currently reads:

> MongoDB stores submitted data only … **No auth, no user accounts, no admin UI.**

All three clauses go. MongoDB becomes read-write, admin accounts exist, and the
portal is part of this app. §2 must be rewritten before implementation starts,
and an `admin-portal` skill added, or every future task will be working from a
constraint that is no longer true.

### Standing principle

When a website feature captures data, its admin surface is part of that
feature, not a later project. The schema below is generic over submission type
so `meetings` and `applications` inherit the same treatment without a rewrite.

---

## Phases

Reviewed between each. Phase 1 has almost nothing to look at and is where
mistakes are most expensive, which is exactly why it is not bundled with UI.

| Phase                      | Contents                                                                   | Done when                                                                  |
| -------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **1 — Auth foundation**    | seeder, login, DB sessions, `active` enforcement, `proxy.ts` gate, logout  | You can log in, see an empty shell, and be locked out by flipping `active` |
| **2 — Contacts**           | dashboard stats, paginated table, status dropdown, notes modal             | The portal is actually useful                                              |
| **3 — Account & security** | change password, 2FA enable/disable/enforce, backup codes, session manager | An admin can secure their own account without a shell                      |

---

## Routing

`app/(admin)/admin/*` — a route group with its own layout.

- **No** Header, Footer, Ship Log, `BackgroundLayer`, or Grain. The portal is a
  tool, not the marketing site.
- Reuses the design system: role tokens, both themes, `Container`, `Card`,
  `Button`, `Field`, `Badge`, the Radix `Modal`.
- Mobile-first, same as the site (`CLAUDE.md §4.7`).
- `robots: { index: false, follow: false }` on the admin layout.

| Route                | Phase            |
| -------------------- | ---------------- |
| `/admin/login`       | 1                |
| `/admin` (dashboard) | 1 shell, 2 stats |
| `/admin/contacts`    | 2                |
| `/admin/account`     | 3                |

---

## Authentication

### The check happens twice, on purpose

**`proxy.ts`** (Next 16 renamed `middleware.ts` → `proxy.ts`; it now defaults to
the Node.js runtime) does a **cookie-presence check only** and redirects
anonymous requests to `/admin/login`. This is UX, not authorization.

**`requireAdmin()`** is the real gate. It runs inside every admin page and every
Server Action: load session by token hash → load admin → assert `active`. Any
failure destroys the session and redirects.

Next's own documentation is explicit about why both:

> A matcher change or a refactor that moves a Server Function to a different
> route can silently remove Proxy coverage. Always verify authentication and
> authorization inside each Server Function rather than relying on Proxy alone.

This also delivers the requirement that `active` is checked **per request**: an
admin deactivated mid-session loses access on their next action, not at their
next login.

The proxy matcher must exclude `_next/static`, `_next/image` and `public/`, or
the gate blocks the portal's own CSS and JS.

### Session model

- Cookie holds a random 32-byte token. `httpOnly`, `secure`, `sameSite=lax`,
  path `/admin`.
- The database stores only the token's SHA-256 hash. A stolen database dump
  cannot be replayed as a live session.
- Sessions are rows, not JWTs — revocation and per-request `active` checks both
  require a lookup anyway, so statelessness buys nothing here.
- Sliding expiry: 7 days, `lastSeenAt` refreshed on use.

### Login flow

1. Rate-limit by email + IP (same collection-count approach as the contact form).
2. `bcrypt.compare` against `admins.password`.
3. Assert `active`.
4. If `totpEnabled` → second step accepting a TOTP code **or** an unused backup
   code.
5. Create session, set cookie.

Failure at any step returns one generic message. Distinguishing "no such admin"
from "wrong password" enumerates accounts.

---

## Data model

```
admins    { _id, email (unique), name, password, active,
            totpSecret?, totpEnabled, backupCodes[], createdAt, updatedAt }

sessions  { _id, adminId, tokenHash, userAgent, ip,
            createdAt, lastSeenAt, expiresAt }

notes     { _id, subjectType, subjectId, adminId, body, createdAt }

contact   …existing… + { status, statusUpdatedAt }
```

- `password` holds the bcrypt hash. Named per the owner's instruction; the
  trade-off (it invites someone to later store plaintext there) was raised and
  accepted.
- `active` exists from day one even though v1 has no admin-management screen, so
  deactivation never requires a migration.
- **`notes` is generic** via `subjectType` + `subjectId`. `meetings` and
  `applications` get notes with no schema change.

Indexes: `admins.email` unique; `sessions.tokenHash` unique; `sessions.expiresAt`
TTL; `notes.{subjectType, subjectId}`; `contact.createdAt`.

---

## Contacts (phase 2)

**Dashboard** — total, new this week, count per status, oldest still pending.
Real counts only; no figure is invented or estimated.

**Table** — server-side pagination, newest first. **Cards below `md`, table at
`md` and up**: a five-column table at 360px is unreadable, and the base case is
the phone (`§4.7`).

**Status** — `pending` (default) · `contacted` · `responded` · `closed` ·
`lost`. Changed by a dropdown, written by a Server Action, `statusUpdatedAt`
stamped.

**Notes** — Radix modal. Previous notes newest-first with author and timestamp;
sticky composer pinned to the bottom of the modal body. Notes are append-only in
v1: no edit, no delete.

---

## Account (phase 3)

### Change password

Requires the current password — a hijacked session must not be able to lock the
real owner out. New password is bcrypt-hashed at the same work factor.

On success, **every other session for that admin is revoked** and the current
one is rotated to a fresh token. A password change that leaves old sessions
alive has not actually changed anything for an attacker who already has one.

### Session manager

Lists that admin's active sessions: device (from user agent), IP, created,
last seen, and which one is the current session. Two actions:

- **Revoke** a single session.
- **Revoke all others** — one click, leaves only the session in front of you.

Sessions are rows, so revoking is a delete and takes effect on the target's very
next request. Expired rows are cleaned by the TTL index rather than a job.

This is also the visible half of the `active` flag: deactivating an admin stops
them at the next request, and the session list is where you confirm it.

---

## 2FA (phase 3)

- `otplib` for TOTP, `qrcode` to render the enrolment QR.
- Per-admin toggle. When enabled, that admin must pass the second factor; there
  is no global policy.
- Ten single-use backup codes shown **once** at enrolment, stored bcrypt-hashed.
  The TOTP field at login also accepts a backup code; a used code is burned.
- `yarn admin:reset-2fa <email>` clears `totpSecret`, `totpEnabled` and
  `backupCodes`, and revokes that admin's sessions. Without this, losing an
  authenticator means editing production data by hand under pressure.

Enabling 2FA, disabling it, and changing password all **revoke every other
session** for that admin.

---

## Seeding

`yarn admin:seed` — creates the first admin from prompts or env, bcrypt-hashing
the password. Refuses to overwrite an existing email. This is the only way an
admin is created in v1.

---

## Security measures

- bcrypt with a work factor of 12.
- Session tokens are random and stored hashed.
- Rate limiting on login.
- Generic failure messages; no account enumeration.
- `active` asserted per request, not per login.
- Every mutating Server Action calls `requireAdmin()` — the proxy is never the
  authorization boundary.
- Admin cookies are scoped to `/admin`, so the marketing site never carries them.
- No admin data is ever rendered in a client component without passing through
  a server-side authorization check first.

---

## Out of scope for v1

Admin management screens (seeder only), roles and permissions, an audit log
beyond notes, email or Slack notification of new submissions (that is D6, a
separate decision), export, and search beyond pagination.

---

## Dependencies to add

`bcryptjs` · `otplib` · `qrcode`

All three are server-only and must not reach the client bundle — the same check
that caught zod shipping to visitors applies here.
