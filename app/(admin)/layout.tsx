import type { Metadata } from "next";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdminOrNull } from "@/lib/admin/guard";

/**
 * Admin portal chrome.
 *
 * No Header, no Footer, no Scene, no Grain — the portal is a tool, not the
 * marketing site. That is achieved by the root layout rendering none of
 * those: they live in `app/(site)/layout.tsx`, which this group is a sibling
 * of. There is no `<html>`/`<body>` here; `app/layout.tsx`
 * is still the one root layout and owns the document, the fonts and the theme
 * script, so both themes work in here for free.
 *
 * This layout does NOT call requireAdmin(). A layout is preserved across soft
 * navigations within its segment, so a guard here would be checked less often
 * than it looks like it is — every page owns its own call instead (see
 * `app/(admin)/admin/page.tsx`). The `requireAdminOrNull()` below is the
 * non-redirecting variant and is used for CHROME only: /admin/login shares
 * this layout, and navigation to screens you cannot open is not a login form.
 */

export const metadata: Metadata = {
  title: "Admin — CraneDev",
  // Nothing in the portal belongs in an index, including the login form.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/">) {
  const admin = await requireAdminOrNull();

  // Signed out: no rail, no bar, just the page. /admin/login renders its own
  // centred card, and everything else redirects before it gets this far.
  if (!admin) {
    return <main className="flex-1 pb-[env(safe-area-inset-bottom)]">{children}</main>;
  }

  return (
    <>
      <AdminSidebar admin={admin} />
      <AdminMobileNav admin={admin} />

      {/*
        The content offset reads the SAME `--rail-w` the rail is drawn from, so
        the two cannot disagree — a hardcoded padding here is exactly how a
        collapsed rail ends up with a gap beside it. Below `lg` the rail is
        hidden and the offset is not applied.
      */}
      <div className="flex flex-1 flex-col transition-[padding] duration-(--d-micro) ease-(--e-in-out) lg:pl-(--rail-w)">
        <main className="flex-1 pb-[env(safe-area-inset-bottom)]">{children}</main>
      </div>
    </>
  );
}
