import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin route gate — UX ONLY. **This is not the authorization boundary.**
 *
 * All this does is look for the presence of a session cookie. It never reads
 * the database, never validates the token, and never checks `active`, so a
 * forged cookie of the right NAME gets past it. That is fine, because the real
 * gate is `requireAdmin()` (lib/admin/guard.ts), which every admin page and
 * every admin Server Action calls, and which resolves the session by token
 * hash and asserts `active` on every single request.
 *
 * Next's own proxy documentation is explicit about why the check must be
 * duplicated inside the page rather than trusted here:
 *
 *   "Server Functions are not separate routes in this chain. They are handled
 *    as POST requests to the route where they are used, so a Proxy matcher
 *    that excludes a path will also skip Server Function calls on that path. A
 *    matcher change or a refactor that moves a Server Function to a different
 *    route can silently remove Proxy coverage. Always verify authentication
 *    and authorization inside each Server Function rather than relying on
 *    Proxy alone."
 *
 * In other words the `matcher` below is one edit away from covering nothing,
 * and nothing about that edit would look dangerous in review. Treat this file
 * as a redirect for anonymous visitors, and nothing more.
 *
 * No `runtime` export: Proxy defaults to the Node.js runtime in Next 16 and
 * setting the option in a proxy file throws.
 */

/**
 * Source of truth is `SESSION_COOKIE` in lib/admin/session.ts. It is duplicated
 * rather than imported because that module is `server-only` and pulls in the
 * MongoDB driver and node:crypto through ./collections — a whole database
 * client dragged into the request path just to learn a string. If you rename
 * the cookie, rename it in both places.
 */
const SESSION_COOKIE = "cranedev_admin_session";

const LOGIN_PATH = "/admin/login";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isLogin = pathname === LOGIN_PATH;

  // Anonymous, anywhere in the portal but the login page → go log in.
  if (!hasSession && !isLogin) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  /*
   * Deliberately NO redirect from /admin/login when a cookie is present.
   *
   * "Has a cookie" and "has a session" are different claims, and conflating
   * them here is an infinite redirect: a stale cookie passes the presence
   * check, /admin bounces it to requireAdmin(), that finds no session and
   * sends it back to /admin/login, where the cookie is still present.
   *
   * Sending an already-signed-in admin away from the login form is a nicety,
   * and it belongs where the answer is actually known — the login page calls
   * getCurrentAdmin() and redirects on a REAL session. That is correct by
   * construction rather than guarded by a timer.
   */

  return NextResponse.next();
}

export const config = {
  /*
   * Scoped to the portal, and excluding everything the portal itself needs to
   * render. Without the exclusions this gate redirects the admin CSS and JS
   * bundles to /admin/login and the login page loads unstyled and dead — the
   * matcher must never be widened to a bare "/:path*".
   *
   * Excluded: _next/static (JS/CSS), _next/image (the optimizer), favicon.ico,
   * and any path containing a dot, which covers everything served out of
   * public/.
   *
   * Two entries because a `:param` pattern requires the segment to be present:
   * the first matches `/admin` itself, the second everything below it.
   */
  matcher: [
    "/admin",
    "/admin/:path((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)",
  ],
};
