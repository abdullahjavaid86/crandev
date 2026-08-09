"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { adminNav, adminFooterNav, isAdminActive } from "@/lib/admin/nav";
import { spring } from "@/lib/motion";
import { railIconStyles, railItemStyles, railLabelStyles } from "./railItemStyles";

/**
 * The rail's list of screens. A client component because active state needs
 * `usePathname` — a layout does not re-render on navigation, so the server
 * cannot know which item is current.
 *
 * That is the ONLY reason it is a client component. It holds no data and no
 * state: the collapsed appearance is CSS reading an ancestor attribute, so
 * this renders identically at either width.
 */

interface AdminNavProps {
  /**
   * Whether this instance shrinks to icons. True in the rail, false in the
   * mobile drawer — the drawer is full width, so collapsing its labels
   * because the desktop rail happens to be collapsed would be nonsense.
   */
  collapsible?: boolean;
  /**
   * Namespaces the sliding indicator. The rail and the drawer are both mounted
   * at once; sharing one `layoutId` would make a single indicator try to be in
   * two trees, and it would fly across the screen between them.
   */
  idPrefix: string;
  /** The bottom group instead of the main one. Same rendering, different source. */
  group?: "main" | "footer";
  /** Closes the drawer. Unused by the rail, where navigation changes nothing. */
  onNavigate?: () => void;
}

export function AdminNav({
  collapsible = false,
  idPrefix,
  group = "main",
  onNavigate,
}: AdminNavProps) {
  const pathname = usePathname();
  const isReduced = useReducedMotion();
  const items = group === "main" ? adminNav : adminFooterNav;

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isAdminActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              // The hint rather than the label: in icon mode a tooltip that
              // repeats the hidden label is the bare minimum, and this says
              // more. Set at both widths because it is useful at both.
              title={item.hint}
              aria-current={active ? "page" : undefined}
              className={railItemStyles({ active, collapsible })}
            >
              {/*
                The active ground and its accent edge, shared across items by
                `layoutId` so they SLIDE from the old row to the new one rather
                than blinking out and in. Only one of each is ever rendered,
                which is what makes a shared-layout animation possible.

                Reduced motion gets the same two elements without the shared
                layout — the indicator still moves, it just does not travel.
              */}
              {active ? (
                <>
                  {isReduced ? (
                    <span className="absolute inset-0 rounded-md bg-inset" />
                  ) : (
                    <motion.span
                      layoutId={`${idPrefix}-active`}
                      transition={spring}
                      className="absolute inset-0 rounded-md bg-inset"
                    />
                  )}
                  {isReduced ? (
                    <span className="absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-accent-ink" />
                  ) : (
                    <motion.span
                      layoutId={`${idPrefix}-edge`}
                      transition={spring}
                      className="absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-accent-ink"
                    />
                  )}
                </>
              ) : null}

              <Icon aria-hidden="true" className={railIconStyles(active)} />
              <span className={railLabelStyles(collapsible)}>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
