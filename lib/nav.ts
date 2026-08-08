/**
 * The one navigation source. Header and Footer both read from here, so a route
 * can never exist in one and not the other (§6.0) — the failure mode is a page
 * that ships, is unreachable, and nobody notices for a month.
 *
 * Adding a route means adding it here in the same commit as the page.
 */

export interface NavItem {
  href: string;
  label: string;
}

/** Header nav. Deliberately short — four links plus the CTA (§6.1). */
export const primaryNav: NavItem[] = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/careers", label: "Careers" },
];

/** The single CTA. Its label is the action, and keeps that name through the
 *  whole flow — the button, the page title, and the confirmation (§8). */
export const primaryCta: NavItem = { href: "/schedule", label: "Book a call" };

/** Footer columns. Includes everything the header omits. */
export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Work",
    items: [
      { href: "/work", label: "Selected work" },
      { href: "/about", label: "How we work" },
    ],
  },
  {
    heading: "Company",
    items: [
      { href: "/team", label: "Team" },
      { href: "/careers", label: "Careers" },
    ],
  },
  {
    heading: "Talk to us",
    items: [
      { href: "/contact", label: "Contact" },
      { href: "/schedule", label: "Book a call" },
    ],
  },
];

/**
 * Active-state test. `/` must match exactly or every route lights up; deeper
 * routes match on prefix so /work/[slug] keeps "Work" active — including when
 * the detail view is showing as an intercepted modal (§6.2).
 */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
