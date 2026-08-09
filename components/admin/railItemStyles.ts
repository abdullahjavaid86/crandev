import { cn } from "@/lib/utils";

/**
 * One row in the rail.
 *
 * A plain module, not a component: the rows are three different elements —
 * a `<Link>`, and a `<button>` inside the sign-out form — and forcing them
 * through one component would mean a prop that switches which tag it renders.
 * Sharing the classes instead keeps them identical without that.
 *
 * Non-client on purpose (the `buttonStyles` lesson): every export of a
 * `'use client'` module is a client reference, so putting this beside a client
 * component would stop the server-rendered rail from importing it.
 */
export function railItemStyles(
  opts: {
    /** Current route. Only links are ever active. */
    active?: boolean;
    /** Whether this row shrinks with the rail. False inside the mobile drawer. */
    collapsible?: boolean;
    className?: string;
  } = {},
) {
  const { active = false, collapsible = false, className } = opts;

  return cn(
    "group relative flex min-h-11 w-full items-center gap-3 rounded-md px-3",
    "text-left text-small transition-colors duration-(--d-micro)",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink",
    active ? "text-fg" : "text-muted hover:bg-inset hover:text-fg",
    // Centred with no horizontal padding once there is no label to sit beside.
    collapsible && "rail-icons:justify-center rail-icons:px-0",
    className,
  );
}

/** The icon in a rail row. Active rows carry the one legal accent. */
export function railIconStyles(active = false) {
  return cn(
    "relative size-5 shrink-0 transition-colors duration-(--d-micro)",
    active ? "text-accent-ink" : "text-muted group-hover:text-fg",
  );
}

/**
 * The label. Never removed from the DOM — `sr-only` keeps it in the
 * accessibility tree, so an icon-only rail still announces "Dashboard"
 * rather than an unlabelled link.
 */
export function railLabelStyles(collapsible = false) {
  return cn("relative truncate", collapsible && "rail-icons:sr-only");
}
