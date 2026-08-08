"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useShipLog, type ShipLogSection } from "@/hooks/useShipLog";
import { dur, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * PROTOTYPE — the right gutter, currently empty at wide viewports.
 *
 * The container is 1240px centred, so past ~1600px there is roughly 180px of
 * dead space on each side and only the left one does anything. This fills the
 * right with a live "currently reading" block: where you are, out of how many,
 * and one line on what the section actually shows.
 *
 * It is deliberately NOT a second rail. The rail is navigation and owns the
 * accent; this is a status readout and takes none, so the two do not compete
 * (§4.1). It is `aria-hidden` for the same reason the rail is not: the rail is
 * interactive and must be reachable, whereas this duplicates information the
 * headings already carry and would only be read twice.
 *
 * Only from 1400px, which is where the gutter actually exists. Below that it
 * does not render at all — no observer, no subscription.
 *
 * KNOWN COST while this is a prototype: it calls useShipLog, so a second
 * IntersectionObserver watches the same seven sections. That is cheap (IO is
 * off-main-thread and fires only on boundary crossings) but it is duplication.
 * If this survives, lift the observer into one provider that both the rail and
 * this consume.
 */
interface ReadingPanelProps {
  sections: readonly ShipLogSection[];
  className?: string;
}

export function ReadingPanel({ sections, className }: ReadingPanelProps) {
  // The gutter only exists once the viewport clears the container plus room to
  // read. `useIsDesktop` is `md` and the rail's own gate is `lg`; neither is
  // wide enough here, so this has its own.
  const hasGutter = useMediaQuery("(min-width: 87.5rem)");
  if (!hasGutter) return null;
  return <Panel sections={sections} className={className} />;
}

function Panel({ sections, className }: ReadingPanelProps) {
  const isReduced = useReducedMotion();
  const { commits, activeId } = useShipLog(sections);

  const index = commits.findIndex((c) => c.id === activeId);
  const current = index >= 0 ? commits[index] : commits[0];
  if (!current) return null;

  return (
    <aside
      aria-hidden="true"
      style={{ paddingRight: "env(safe-area-inset-right)" }}
      className={cn("sticky top-1/2 -translate-y-1/2", className)}
    >
      <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
        Reading
      </p>

      {/* The label and note cross-fade as the active section changes. Keyed on
          the id so motion treats each section as a different element. */}
      <div className="mt-4 min-h-24">
        <motion.div
          key={current.id}
          initial={isReduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.base, ease: ease.out }}
        >
          {/* Position in the list, NOT the section's ordinal. The hero is
              authored as 00, so showing current.index here would read "00 / 07"
              — the ordinal is the rail's job and is already on screen. */}
          <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
            {String(Math.max(index, 0) + 1).padStart(2, "0")}
            <span className="mx-1">/</span>
            {String(commits.length).padStart(2, "0")}
          </p>

          <p className="mt-2 text-fg">{current.label}</p>

          {current.note ? (
            <p className="mt-2 max-w-[22ch] text-small text-muted">{current.note}</p>
          ) : null}
        </motion.div>
      </div>

      {/* Position through the page as discrete ticks — one per section, so it
          reads as an index rather than duplicating the rail's continuous fill. */}
      <ul className="mt-6 flex flex-col gap-1.5">
        {commits.map((c, i) => (
          <li
            key={c.id}
            className={cn(
              "h-px w-6 origin-left",
              isReduced
                ? null
                : "transition-transform duration-(--d-base) ease-out-soft",
              i === index ? "scale-x-150 bg-line-strong" : "bg-line",
            )}
          />
        ))}
      </ul>
    </aside>
  );
}
