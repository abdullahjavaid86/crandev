import "server-only";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "./session";
import type { CurrentAdmin } from "./types";

/**
 * THE authorization boundary.
 *
 * Call this at the top of every admin page and every admin Server Action.
 * `proxy.ts` only checks that a cookie exists — that is UX, not authorization.
 * Next's own docs are explicit:
 *
 *   "A matcher change or a refactor that moves a Server Function to a
 *    different route can silently remove Proxy coverage. Always verify
 *    authentication and authorization inside each Server Function rather than
 *    relying on Proxy alone."
 *
 * A Server Action without this call is unauthenticated, wherever it lives.
 * Route position is not protection.
 */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/**
 * For Server Actions that must return a value rather than redirect — a redirect
 * mid-action loses the form state the caller was going to render.
 */
export async function requireAdminOrNull(): Promise<CurrentAdmin | null> {
  return getCurrentAdmin();
}
