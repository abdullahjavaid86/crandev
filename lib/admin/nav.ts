import { LayoutDashboard, Inbox, Settings, type LucideIcon } from "lucide-react";

/**
 * The portal's navigation source. The rail and the mobile drawer both read
 * from here, so a screen cannot appear in one and not the other — the same
 * rule the marketing site follows in `lib/nav.ts`, for the same reason.
 *
 * Only routes that EXIST belong here. A rail that lists screens which 404 is
 * worse than a short rail: it teaches you not to trust the navigation.
 */

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /**
   * What the item does, shown as the tooltip in icon mode. The label alone is
   * what a tooltip would repeat; this earns the hover.
   */
  hint: string;
}

/** The working screens. Ordered by how often they are opened. */
export const adminNav: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    hint: "Dashboard — submission counts at a glance",
  },
  {
    href: "/admin/contacts",
    label: "Contacts",
    icon: Inbox,
    hint: "Contacts — every submission, with status and notes",
  },
];

/**
 * Pinned to the bottom of the rail. Separate from `adminNav` because it is a
 * separate group visually AND semantically: these act on the account, not on
 * the data. Sign out is not here — it is a form, not a link.
 */
export const adminFooterNav: AdminNavItem[] = [
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    hint: "Settings — your account and security",
  },
];

/**
 * Active-state test.
 *
 * `/admin` must match EXACTLY. It is a prefix of every other admin route, so
 * a `startsWith` test would light up Dashboard on every screen in the portal.
 * Deeper routes match on prefix so a future `/admin/contacts/[id]` keeps
 * Contacts lit.
 */
export function isAdminActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
