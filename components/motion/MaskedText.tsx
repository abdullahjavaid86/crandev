"use client";

import { motion, useReducedMotion } from "motion/react";
import { dur, ease, viewport } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface MaskedTextProps {
  /**
   * One entry per visual line. Splitting is the author's call, not measured
   * at runtime — a resize observer that re-splits mid-animation thrashes
   * layout, and headlines here are short enough to line-break deliberately.
   */
  lines: string[];
  className?: string;
  as?: "h1" | "h2" | "p";
}

/**
 * Headline reveal: each line sits in an overflow-hidden box and rises from
 * 110% to 0.
 *
 * Split by LINE, never by character (§5.2). Per-character splitting on a
 * 60px headline is a gimmick, it costs layout thrash, and it hands screen
 * readers a pile of disconnected letters.
 *
 * Reserved for the hero plus at most one section headline per page.
 */
export function MaskedText({ lines, className, as = "h2" }: MaskedTextProps) {
  const isReduced = useReducedMotion();
  const Heading = as;

  if (isReduced) {
    return (
      <Heading className={cn(className)}>
        {lines.map((line, i) => (
          <span key={line} className="block">
            {line}
            {i < lines.length - 1 ? " " : ""}
          </span>
        ))}
      </Heading>
    );
  }

  return (
    <Heading className={cn(className)}>
      {/* The full string stays available to assistive tech as one phrase; the
          animated spans are decorative duplicates. */}
      <span className="sr-only">{lines.join(" ")}</span>

      <motion.span
        aria-hidden="true"
        className="block"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
      >
        {lines.map((line) => (
          // Padding gives descenders room; without it the mask clips a "g".
          <span key={line} className="block overflow-hidden pb-[0.12em]">
            <motion.span
              className="block"
              variants={{
                hidden: { y: "110%" },
                visible: {
                  y: 0,
                  transition: { duration: dur.reveal, ease: ease.out },
                },
              }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Heading>
  );
}
