"use client";

import { useCallback, useRef } from "react";
import { useHasHover } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface CardProps extends React.ComponentProps<"div"> {
  /** Glass costs a backdrop-filter — 2 per viewport below md (§4.2). */
  glass?: boolean;
  /** Cursor-following highlight. Desktop pointers only. */
  highlight?: boolean;
}

export function Card({
  glass = false,
  highlight = false,
  className,
  children,
  ...props
}: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number>(0);
  const hasHover = useHasHover();

  /**
   * Writes pointer position to CSS vars, throttled to one write per frame
   * (§5.3). Reading layout on every mousemove is what makes this pattern
   * janky; rAF collapses a burst of events into a single paint.
   */
  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const { clientX, clientY } = e;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${clientX - rect.left}px`);
        el.style.setProperty("--my", `${clientY - rect.top}px`);
      });
    },
    [],
  );

  const wantsHighlight = highlight && hasHover;

  return (
    <div
      ref={ref}
      onMouseMove={wantsHighlight ? onMouseMove : undefined}
      className={cn(
        "relative overflow-hidden rounded-md border border-hairline",
        "transition-colors duration-[--d-base] hover:border-[rgba(232,237,245,0.16)]",
        glass
          ? "bg-[linear-gradient(148deg,rgba(232,237,245,0.055),rgba(232,237,245,0.015))] md:backdrop-blur-[20px] md:backdrop-saturate-[140%]"
          : "bg-carbon",
        className,
      )}
      {...props}
    >
      {wantsHighlight ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[--d-base] [background:radial-gradient(240px_circle_at_var(--mx)_var(--my),rgba(53,240,220,0.06),transparent_70%)] group-hover:opacity-100 hover:opacity-100"
        />
      ) : null}
      {children}
    </div>
  );
}
