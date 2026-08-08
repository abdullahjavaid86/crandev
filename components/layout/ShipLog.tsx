"use client";

import { motion, useReducedMotion, useScroll } from "motion/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useShipLog, type ShipLogSection } from "@/hooks/useShipLog";
import { cn } from "@/lib/utils";

export type { ShipLogSection };

interface ShipLogProps {
  /**
   * The page's sections in reading order. Each needs the `id` of its section
   * element; `hash` is optional and derived from the id when absent.
   */
  sections: readonly ShipLogSection[];
  className?: string;
}

/**
 * The Ship Log rail — the signature element (§4.5).
 *
 * A thin vertical rail pinned in the left gutter. Each registered section is a
 * commit: a node, a zero-padded index, a mono short hash, and (where there is
 * room) its label. The node lights with the accent as its section crosses the
 * reading band, and the line fills as the page scrolls, so the rail doubles as
 * scroll progress without a second progress element existing anywhere.
 *
 * **It is navigation, not decoration.** Each commit is an anchor to its
 * section, so the rail is also the page's table of contents. That is why it is
 * a `<nav>` with a real accessible name rather than `aria-hidden`: an
 * interactive control hidden from assistive tech is unreachable, which would
 * be worse than duplicating a heading.
 *
 * `lg` and up only. Below that it does not render at all — there is no gutter
 * to pin to when the container padding is 24px — and `<ScrollProgress />`,
 * composed by the header, carries the progress as a 2px bar. Section
 * navigation on a phone is the header's job, not a shrunken rail's.
 */
export function ShipLog({ sections, className }: ShipLogProps) {
  // Tailwind's `lg`. `useIsDesktop` is `md` (48rem) and is deliberately not
  // reused: the rail needs a real gutter, which arrives two breakpoints later.
  const isWideEnough = useMediaQuery("(min-width: 64rem)");

  // Gating here rather than inside means no scroll subscription and no
  // observer are created on a phone at all.
  if (!isWideEnough) return null;

  return <Rail sections={sections} className={className} />;
}

function Rail({ sections, className }: ShipLogProps) {
  const isReduced = useReducedMotion();
  const { commits, activeId } = useShipLog(sections);

  /**
   * The one scroll read here, and it is for the fill only. `IntersectionObserver`
   * answers "which section", but a fill that jumped one section at a time would
   * not read as progress, and page progress cannot be derived from the observer.
   * Motion reads this from the shared frameloop's ScrollTimeline rather than a
   * scroll listener (§4.6), so it is a cheap per-frame read.
   */
  const { scrollYProgress } = useScroll();

  // Reduced motion: the rail still renders and still marks the active commit,
  // it just arrives there instantly. Colour, opacity and scale are the only
  // things that ever change, so killing the transition is the whole job.
  const settle = isReduced
    ? null
    : "transition-[color,background-color,opacity,scale] duration-(--d-micro) ease-out-soft";

  if (commits.length === 0) return null;

  return (
    <nav
      aria-label="Page sections"
      style={{ paddingLeft: "env(safe-area-inset-left)" }}
      className={cn("fixed top-1/2 left-4 z-30 -translate-y-1/2", className)}
    >
      <ol className="relative flex flex-col gap-4">
        {/* Track and fill run from the first node's centre to the last's.
            `top-2`/`bottom-2` is half of the h-4 row — the nodes sit at those
            exact centres, so the geometry holds at any commit count. Both are
            decorative and must never intercept a click meant for a link. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-2 bottom-2 left-[3px] w-px -translate-x-1/2 bg-line"
        />
        <motion.span
          aria-hidden="true"
          style={{ scaleY: scrollYProgress }}
          className="pointer-events-none absolute top-2 bottom-2 left-[3px] w-px origin-top -translate-x-1/2 bg-line-strong"
        />

        {commits.map((commit) => {
          const isCurrent = commit.id === activeId;

          return (
            <li key={commit.id} className="relative flex h-4 items-center">
              <a
                href={`#${commit.id}`}
                aria-current={isCurrent ? "true" : undefined}
                className={cn(
                  "group relative flex h-4 items-center gap-2 rounded-sm",
                  /* The visible row is 16px tall, which is far too small to
                     click at. The pseudo-element grows the hit area to the full
                     32px row pitch and out to the left, without touching the
                     layout the rail is measured by. */
                  "before:absolute before:-inset-x-3 before:-inset-y-2 before:content-['']",
                  settle,
                  isCurrent ? "opacity-100" : "opacity-60 hover:opacity-100",
                )}
              >
                {/* The label is the link's accessible name. Everything visible
                    below is hidden from assistive tech, because "01 1B3B5C5
                    INTRO" is a worse name than "Intro", and at most widths the
                    label is not rendered at all. */}
                <span className="sr-only">{commit.label}</span>

                {/* The only accented element in the rail. One node lit; if they
                    all glowed, none would (§4.1). `bg-accent` is the fill role —
                    the accent as a background is 14:1 in both themes. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 shrink-0 rounded-[1px]",
                    settle,
                    isCurrent
                      ? "scale-[1.35] bg-accent"
                      : "scale-100 bg-line-strong group-hover:bg-accent-ink",
                  )}
                />

                {/* Mono metadata appears only where the gutter can hold it.
                    The container is 1240px wide, so at 1400px there is ~120px of
                    clear space to the left of it and at 1600px there is ~180px.
                    Below that the rail is nodes and the line, which is the whole
                    signal anyway. */}
                <span
                  aria-hidden="true"
                  className="hidden font-mono text-xs tracking-[0.18em] uppercase min-[1400px]:flex min-[1400px]:items-baseline min-[1400px]:gap-2"
                >
                  <span className={cn("text-muted", settle)}>{commit.index}</span>
                  <span
                    className={cn(
                      settle,
                      isCurrent ? "text-accent-ink" : "text-muted",
                    )}
                  >
                    {commit.hash}
                  </span>
                  <span
                    className={cn(
                      "hidden max-w-[12ch] truncate min-[1600px]:inline",
                      settle,
                      isCurrent ? "text-fg" : "text-muted group-hover:text-fg",
                    )}
                  >
                    {commit.label}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
