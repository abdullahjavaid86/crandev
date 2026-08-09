"use client";

import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { logout } from "@/lib/admin/actions";
import type { CurrentAdmin } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { AdminNav } from "./AdminNav";
import { railIconStyles, railItemStyles, railLabelStyles } from "./railItemStyles";

/**
 * The account group pinned to the bottom of the rail and the drawer: Settings,
 * Sign out, and who you are signed in as.
 *
 * **Below `lg` it is a disclosure**, closed by default. Expanded it is ~175px
 * of content that cannot shrink, which on a short window (a phone in
 * landscape, a small desktop window) starved the navigation above it — the nav
 * collapsed to a 39px strip with both of its links scrolled out of sight.
 * Collapsed it costs one row, so the navigation keeps the space and stays the
 * only thing that scrolls.
 *
 * At `lg` and up the group is always open and the trigger is not rendered at
 * all: a full-height rail has the room, and hiding Sign out behind a tap on a
 * desktop tool is a worse trade than the space it saves.
 *
 * One component rather than two, because the rail and the drawer had begun to
 * hold identical copies of this markup (§10).
 */
interface AccountSectionProps {
  admin: CurrentAdmin;
  /** Shrinks with the rail. False in the drawer, which is full width. */
  collapsible?: boolean;
  /** Namespaces the nav indicator — see AdminNav. */
  idPrefix: string;
  /** Closes the drawer on navigation. Unused by the rail. */
  onNavigate?: () => void;
}

export function AccountSection({
  admin,
  collapsible = false,
  idPrefix,
  onNavigate,
}: AccountSectionProps) {
  const [open, setOpen] = useState(false);
  const panelId = `${idPrefix}-account-panel`;

  return (
    <div className="mt-auto flex shrink-0 flex-col gap-1 border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {/*
        The trigger disappears only where the group can be shown open: wide
        enough for a rail AND tall enough to hold it. `lg` alone is not the
        rule — a 1280×290 window has the width and no room at all, which is
        the same starvation in a different disguise.

        A media query rather than a JavaScript breakpoint check: the rail
        renders server-side and before hydration, and reading the viewport in
        JS would mean a frame with the group in the wrong state.
      */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          railItemStyles({ collapsible }),
          "lg:[@media(min-height:37.5rem)]:hidden",
        )}
      >
        <UserRound aria-hidden="true" className={railIconStyles()} />
        <span className={cn(railLabelStyles(collapsible), "flex-1 text-left")}>
          {admin.name}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "relative size-4 shrink-0 text-muted transition-transform duration-(--d-micro)",
            open && "rotate-180",
            collapsible && "rail-icons:hidden",
          )}
        />
      </button>

      {/*
        Closed by default, and always open wherever the trigger is hidden —
        the two conditions are deliberately the same query, so there is never
        a size at which the group is both collapsed and uncollapsible.
      */}
      <div
        id={panelId}
        className={cn(
          "flex flex-col gap-1",
          !open && "hidden lg:[@media(min-height:37.5rem)]:flex",
        )}
      >
        <AdminNav
          collapsible={collapsible}
          idPrefix={`${idPrefix}-footer`}
          group="footer"
          onNavigate={onNavigate}
        />

        {/*
          A Server Action in a plain form: no onClick, and it still works with
          JavaScript off. `logout` destroys the session row and clears the
          cookie before redirecting.
        */}
        <form action={logout}>
          <button
            type="submit"
            title={`Sign out of ${admin.email}`}
            className={railItemStyles({ collapsible })}
          >
            <LogOut aria-hidden="true" className={railIconStyles()} />
            <span className={railLabelStyles(collapsible)}>Sign out</span>
          </button>
        </form>

        {/*
          The address, not the name — the name is already on the trigger above
          and on the dashboard. Hidden outright when the rail is collapsed
          rather than made screen-reader-only: an email is not navigation, and
          repeating it on every page would be noise.
        */}
        <p
          className={cn(
            "truncate px-3 pt-1 font-mono text-small text-muted",
            collapsible && "rail-icons:hidden",
          )}
          title={admin.email}
        >
          {admin.email}
        </p>
      </div>
    </div>
  );
}
