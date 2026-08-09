---
name: admin-portal
description: Use when working on anything under app/(admin)/, lib/admin/, proxy.ts, admin authentication, sessions, login, 2FA, the contacts table, submission status, or notes. Covers the auth architecture, the session model, and the rules that keep admin data off public routes. Triggers on "admin", "login", "session", "auth", "password", "bcrypt", "2FA", "TOTP", "backup codes", "seeder", "requireAdmin", "proxy", "contacts table", "status", "notes", "dashboard".
---

# Admin Portal

Design spec: `docs/superpowers/specs/2026-08-09-admin-portal-design.md`. It is
the source of truth for scope and decisions; this skill is the operational how-to.

## The authorization boundary is `requireAdmin()`, not the proxy

Two checks, and they are not interchangeable.

**`proxy.ts`** — Next 16 renamed `middleware.ts` to `proxy.ts`, and it now
defaults to the Node runtime. It does a **cookie-presence check only** and
redirects anonymous requests to `/admin/login`. That is UX.

**`requireAdmin()`** — the real gate. Called at the top of **every** admin page
and **every** admin Server Action. It loads the session by token hash, loads the
admin, and asserts `active === true`.

Next's own documentation is why:

> A matcher change or a refactor that moves a Server Function to a different
> route can silently remove Proxy coverage. Always verify authentication and
> authorization inside each Server Function rather than relying on Proxy alone.

**A Server Action that does not call `requireAdmin()` is unauthenticated**, no
matter where it lives. Route position is not protection.

The proxy matcher must exclude `_next/static`, `_next/image` and `public/`, or
the gate blocks the portal's own assets.

## Sessions

- Cookie carries a random 32-byte token. `httpOnly`, `secure`, `sameSite=lax`,
  **path `/admin`** so the marketing site never carries it.
- The database stores only the token's SHA-256 hash. A leaked dump cannot be
  replayed as a live session.
- Rows, not JWTs. Revocation and the per-request `active` check both need a
  lookup, so statelessness buys nothing and costs revocability.
- Changing password, enabling 2FA, or disabling 2FA **revokes every other
  session** for that admin.

## Rules that are easy to break

- **`active` is checked per request**, not at login. An admin deactivated
  mid-session loses access on their next action.
- **Generic failure messages on login.** Distinguishing "no such admin" from
  "wrong password" enumerates accounts.
- **Never render submission data on a public route.** Reads live under
  `app/(admin)/` behind `requireAdmin()`.
- **`bcryptjs`, `otplib` and `qrcode` are server-only.** They must never reach
  the client bundle — the same check that caught zod shipping to visitors.
- Admin pages are server components; `'use client'` only on interaction leaves,
  exactly as on the marketing site.
- The portal reuses the design system — role tokens, both themes, mobile-first
  (`CLAUDE.md §4.7`). Cards below `md`, table above: a five-column table at
  360px is unreadable.
- The admin layout renders **no** Header, Footer, Ship Log, background or grain,
  and sets `robots: { index: false, follow: false }`.

## Navigation

`lib/admin/nav.ts` is the one source. A screen that is not in it is unreachable;
a screen in it that does not exist teaches people not to trust the rail. Add
the entry in the same commit as the page.

Two containers render that source: `AdminSidebar` (a persistent rail at `lg`
and up) and `AdminMobileNav` (a Radix drawer below it). Both mount the same
`AdminNav`, so an item cannot appear in one and not the other.

**The collapsed state is CSS, not React.** `html[data-sidebar]` holds it,
`ThemeScript` resolves it before paint, and the `rail-icons:` variant reads it.
That is why the rail is a **server component** and why there is no flash of the
wrong width. Only `SidebarToggle` needs JavaScript.

- The rail's width and the content offset both read `--rail-w`. Never hardcode
  either — one number, two consumers, or they drift and leave a gap.
- Tailwind v4 CSS-variable utilities take **parentheses**: `w-(--rail-w)`.
  The bracket form silently emits an invalid value. CI guards this.
- Collapsing must not remove a label from the accessibility tree. Use
  `rail-icons:sr-only`, never `hidden` — an icon-only rail still has to
  announce "Dashboard".
- `AdminNav` takes `collapsible`. It is **off** in the drawer: the drawer is
  full width, and collapsing its labels because the desktop rail happens to be
  collapsed is nonsense.
- The drawer closes on the link's `onClick`, not in an effect watching the
  pathname — tapping the screen you are already on does not change the path.

## Data

```
admins    { _id, email (unique), name, password, active,
            totpSecret?, totpEnabled, backupCodes[], createdAt, updatedAt }
sessions  { _id, adminId, tokenHash, userAgent, ip,
            createdAt, lastSeenAt, expiresAt }
notes     { _id, subjectType, subjectId, adminId, body, createdAt }
```

`password` holds the bcrypt hash — the name is the owner's choice, made
knowingly.

**`notes` is generic** over `subjectType`/`subjectId`, so meetings and
applications inherit annotation with no schema change. Keep it that way; do not
add a `contactId` field.

Submission status: `pending` (default) · `contacted` · `responded` · `closed` ·
`lost`.

## Related

[data-persistence](../data-persistence/SKILL.md) · [data-and-forms](../data-and-forms/SKILL.md) · [design-system](../design-system/SKILL.md) · `CLAUDE.md §2`
