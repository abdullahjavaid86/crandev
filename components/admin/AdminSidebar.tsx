import type { CurrentAdmin } from "@/lib/admin/types";
import { AccountSection } from "./AccountSection";
import { AdminNav } from "./AdminNav";
import { AdminWordmark } from "./AdminWordmark";
import { SidebarToggle } from "./SidebarToggle";

/**
 * The desktop rail. A server component apart from its two interactive leaves
 * (the toggle and the account disclosure).
 *
 * Its width comes from `--rail-w`, which `html[data-sidebar]` sets and
 * ThemeScript resolves before paint. That is why collapsing does not need a
 * provider, a context, or a hydration wait — the toggle writes one attribute
 * and CSS does the rest, so the rail is already the right width in the first
 * frame the browser paints.
 *
 * Hidden below `lg`. At that width a persistent rail would eat a third of a
 * phone screen, so the drawer takes over (see AdminMobileNav) — the same
 * navigation, a different container.
 */
export function AdminSidebar({ admin }: { admin: CurrentAdmin }) {
  return (
    <aside
      // `fixed` rather than a flex sibling: the rail must not scroll away with
      // the page, and a sticky full-height column inside a flex row fights the
      // body's own scroll container.
      className="fixed inset-y-0 left-0 z-40 hidden w-(--rail-w) flex-col border-r border-line bg-raised transition-[width] duration-(--d-micro) ease-(--e-in-out) lg:flex"
    >
      <div className="flex shrink-0 flex-col gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {/* Side by side while there is room; stacked once there is not —
            a wordmark and a toggle do not both fit in 4.5rem. */}
        <div className="flex items-center gap-2 rail-icons:flex-col">
          <AdminWordmark collapsible className="min-w-0 flex-1 px-1" />
          <SidebarToggle />
        </div>
      </div>

      {/*
        The ONLY scroll region. `min-h-0` is what allows it to be one: a flex
        item's automatic minimum size is its content, so without this the nav
        refuses to shrink and pushes the account group off the bottom instead
        of scrolling.
      */}
      <nav
        aria-label="Admin sections"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2"
      >
        <AdminNav collapsible idPrefix="rail" />
      </nav>

      <AccountSection admin={admin} collapsible idPrefix="rail" />
    </aside>
  );
}
