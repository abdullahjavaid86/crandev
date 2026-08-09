import { Container } from "@/components/layout/Container";
import Link from "next/link";
import type { Metadata } from "next";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { logout } from "@/lib/admin/actions";
import { requireAdminOrNull } from "@/lib/admin/guard";

/**
 * Admin portal chrome.
 *
 * No Header, no Footer, no BackgroundLayer, no Grain, no Ship Log — the portal
 * is a tool, not the marketing site. That is achieved by the root layout
 * rendering none of those: they live in `app/(site)/layout.tsx`, which this
 * group is a sibling of. There is no `<html>`/`<body>` here; `app/layout.tsx`
 * is still the one root layout and owns the document, the fonts and the theme
 * script, so both themes work in here for free.
 *
 * A fragment rather than a wrapper div, so the bar and the content stay direct
 * children of the `flex min-h-full flex-col` body and `flex-1` on <main> fills
 * a short page.
 *
 * This layout does NOT call requireAdmin(). A layout is preserved across soft
 * navigations within its segment, so a guard here would be checked less often
 * than it looks like it is — every page owns its own call instead (see
 * `app/(admin)/admin/page.tsx`). The `requireAdminOrNull()` below is the
 * non-redirecting variant and is used for CHROME only: /admin/login shares
 * this layout, and a login form with a "Sign out" button on it is nonsense.
 */

export const metadata: Metadata = {
  title: "Admin — CraneDev",
  // Nothing in the portal belongs in an index, including the login form.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/">) {
  const admin = await requireAdminOrNull();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-surface pt-[env(safe-area-inset-top)]">
        <Container as="div" className="flex min-h-14 items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center gap-2 font-display text-h3 font-semibold tracking-[-0.03em] text-fg"
          >
            CraneDev
            <span className="font-mono text-small tracking-[0.18em] text-muted uppercase">
              Admin
            </span>
          </Link>

          {/*
            A Server Action in a plain form: no client component, no onClick, and
            it still works with JavaScript off. `logout` destroys the session row
            and clears the cookie before redirecting.
          */}
          {admin ? (
            <form action={logout} className="ml-auto">
              <button type="submit" className={buttonStyles("secondary", "sm")}>
                Sign out
              </button>
            </form>
          ) : null}
        </Container>
      </header>

      <main className="flex-1 pb-[env(safe-area-inset-bottom)]">{children}</main>
    </>
  );
}
