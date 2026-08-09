import { LogOut } from "lucide-react";
import { logout } from "@/lib/admin/actions";
import type { CurrentAdmin } from "@/lib/admin/types";
import { AdminNav } from "./AdminNav";
import { AdminWordmark } from "./AdminWordmark";
import { SidebarToggle } from "./SidebarToggle";
import { railIconStyles, railItemStyles, railLabelStyles } from "./railItemStyles";

/**
 * The desktop rail. A SERVER component: nothing here holds state.
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
      <div className="flex flex-col gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {/* Side by side while there is room; stacked once there is not —
            a wordmark and a toggle do not both fit in 4.5rem. */}
        <div className="flex items-center gap-2 rail-icons:flex-col">
          <AdminWordmark collapsible className="min-w-0 flex-1 px-1" />
          <SidebarToggle />
        </div>
      </div>

      <nav aria-label="Admin sections" className="flex-1 overflow-y-auto px-3 py-2">
        <AdminNav collapsible idPrefix="rail" />
      </nav>

      {/*
        The account group, pinned to the bottom. `mt-auto` is what pins it:
        the nav above is `flex-1`, so this sits at the end of a short list and
        stays put when the list grows.
      */}
      <div className="mt-auto flex flex-col gap-1 border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <AdminNav collapsible idPrefix="rail-footer" group="footer" />

        {/*
          A Server Action in a plain form: no client component, no onClick, and
          it still works with JavaScript off. `logout` destroys the session row
          and clears the cookie before redirecting.
        */}
        <form action={logout}>
          <button
            type="submit"
            title={`Sign out of ${admin.email}`}
            className={railItemStyles({ collapsible: true })}
          >
            <LogOut aria-hidden="true" className={railIconStyles()} />
            <span className={railLabelStyles(true)}>Sign out</span>
          </button>
        </form>

        {/*
          Who you are signed in as. Worth the two lines: the whole portal is
          one account's view of the data, and "which admin am I?" is otherwise
          unanswerable without opening Settings.

          Hidden outright when collapsed rather than made screen-reader-only —
          an email is not navigation, and repeating it to a screen reader on
          every page would be noise.
        */}
        <div className="px-3 pt-2 rail-icons:hidden">
          <p className="truncate text-small text-muted" title={admin.email}>
            {admin.name}
          </p>
          <p className="truncate font-mono text-small text-muted/80">{admin.email}</p>
        </div>
      </div>
    </aside>
  );
}
