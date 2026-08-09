"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useDomFlag } from "@/hooks/useDomFlag";
import { cn } from "@/lib/utils";

const RAIL_STATES = ["full", "icons"] as const;

/**
 * Collapses the rail to icons and back.
 *
 * The state lives on <html> as `data-sidebar` and in localStorage, resolved
 * before paint by ThemeScript — the same mechanism as the theme, and reusing
 * `useDomFlag` rather than a second copy of it (§10).
 *
 * Everything this button says about the current state is expressed in CSS,
 * not in React state. That matters: `useDomFlag` returns null until mounted
 * (the server cannot read localStorage), so a label derived from it would
 * either flash the wrong word or force the whole rail to wait for hydration.
 * Two spans and a variant have neither problem.
 */
export function SidebarToggle({ className }: { className?: string }) {
  const { cycle } = useDomFlag("data-sidebar", RAIL_STATES, "sidebar");

  return (
    <button
      type="button"
      onClick={cycle}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-md",
        "text-muted transition-colors duration-(--d-micro) hover:bg-inset hover:text-fg",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink",
        className,
      )}
    >
      {/* The accessible name, swapped by CSS. `hidden` removes the other one
          from the accessibility tree, so the button has exactly one name. */}
      <span className="sr-only rail-icons:hidden">Collapse sidebar</span>
      <span className="sr-only hidden rail-icons:inline">Expand sidebar</span>

      <PanelLeftClose aria-hidden="true" className="size-5 rail-icons:hidden" />
      <PanelLeftOpen aria-hidden="true" className="hidden size-5 rail-icons:block" />
    </button>
  );
}
