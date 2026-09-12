import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/session";

import { Container } from "@/components/layout/Container";
import { LoginForm } from "./LoginForm";

/**
 * Admin sign-in.
 *
 * The one admin route that deliberately does NOT call `requireAdmin()`: it has
 * to be reachable while signed out, or the redirect the proxy performs lands on
 * a page that redirects straight back.
 *
 * It does check for a REAL session, though, and sends a signed-in admin to the
 * dashboard. That check lives here rather than in the proxy because the proxy
 * can only see that a cookie exists — and a stale cookie bouncing between the
 * two is an infinite redirect.
 *
 * A server component with a single client leaf, same as the marketing site.
 * The shell — no Header, Footer, scene or grain — belongs to
 * `app/(admin)/layout.tsx`; this page only owns the centred column.
 *
 * No `<main>` here: the admin layout already renders one around `children`, and
 * a second main landmark is a defect, not a nesting. `min-h-full` rather than
 * `min-h-dvh` for the same reason — the layout's sticky bar is above us, so a
 * viewport-height block would push the page into a scroll it does not need.
 */
export const metadata: Metadata = {
  title: "Sign in — CraneDev admin",
  description: "Sign in to the CraneDev admin portal.",
  /**
   * Belt and braces with the admin layout. A login form in a search index is a
   * standing invitation, and `metadata` does not inherit down to a page that
   * declares its own.
   */
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // A real session, not merely a cookie. See the note above.
  if (await getCurrentAdmin()) redirect("/admin");

  return (
    <div className="flex min-h-full flex-col justify-center py-16 md:py-24">
      <Container>
        {/*
          Narrow by intent. A sign-in form that spans 1240px reads as a page
          you are meant to fill in, rather than the two fields it actually is.
        */}
        <div className="mx-auto w-full max-w-[26rem] rounded-lg border border-line bg-raised p-6 md:p-8">
          <div className="mb-8 flex flex-col gap-2">
            <h1 className="font-display text-h3 text-fg">Sign in</h1>
            <p className="text-small text-muted">
              Admin access to submitted enquiries. Accounts are created by the seeder,
              so there is nothing to sign up for here.
            </p>
          </div>

          <LoginForm />
        </div>
      </Container>
    </div>
  );
}
