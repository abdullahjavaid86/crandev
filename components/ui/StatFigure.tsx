"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { StaggerItem } from "@/components/motion/StaggerGroup";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { Stat } from "@/lib/content";
import { dur, ease, viewport } from "@/lib/motion";

/**
 * One counting figure. Extracted from the Proof section so the section itself
 * stays a server component: `'use client'` is per-module, so a leaf sharing a
 * file with its section drags the whole section — and `lib/content`, and zod
 * with it — into the client bundle (§5.1.8).
 *
 * The `Stat` import above is type-only, so it is erased at compile time and
 * creates no runtime dependency on the content layer.
 */

/** Decimal places the source value actually carries: `99.98` → 2, `42` → 0. */
function decimalsOf(value: number): number {
  const [, fraction = ""] = String(value).split(".");
  return fraction.length;
}

interface StatFigureProps {
  stat: Stat;
}

export function StatFigure({ stat }: StatFigureProps) {
  const isReduced = useReducedMotion();
  const figureRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(figureRef, {
    once: viewport.once,
    margin: viewport.margin,
  });
  const count = useMotionValue(0);

  const decimals = decimalsOf(stat.value);
  const format = useMemo(() => {
    // Fixed locale so the server string and the first client string match.
    const nf = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return (value: number) => nf.format(value);
  }, [decimals]);

  const final = format(stat.value);

  /**
   * The figure is server-rendered at its final value, so the number is right
   * with no JS, with JS still loading, and under reduced motion. The count only
   * ever *takes over* that node — it writes `textContent` directly rather than
   * re-rendering four components sixty times a second.
   */
  useEffect(() => {
    const node = figureRef.current;
    if (node === null || isReduced) return;

    const unsubscribe = count.on("change", (value) => {
      node.textContent = format(value);
    });

    if (!inView) {
      // Park at zero while the strip is still below the fold, so the count has
      // somewhere to travel from and is never seen sitting at a wrong value.
      node.textContent = format(0);
      return unsubscribe;
    }

    const controls = animate(count, stat.value, {
      duration: dur.count,
      ease: ease.out,
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, format, inView, isReduced, stat.value]);

  return (
    <StaggerItem as="li" className="border-t border-line pt-6">
      <p className="font-mono text-h2 leading-none text-fg tabular-nums">
        {/* The animated node is hidden from assistive tech and mirrored by the
            static string below it: a screen reader arriving mid-count would
            otherwise be read a number that is simply not true. */}
        <span ref={figureRef} aria-hidden="true">
          {final}
        </span>
        {/* `whitespace-pre` keeps a leading space in suffixes like " yrs",
            which HTML would otherwise collapse away. Verbatim, as authored. */}
        <motion.span
          aria-hidden="true"
          className="whitespace-pre text-muted"
          initial={isReduced ? { opacity: 0 } : { opacity: 0, x: -6 }}
          animate={
            inView
              ? { opacity: 1, x: 0 }
              : isReduced
                ? { opacity: 0 }
                : { opacity: 0, x: -6 }
          }
          transition={{
            duration: dur.base,
            ease: ease.out,
            delay: isReduced ? 0 : dur.count * 0.55,
          }}
        >
          {stat.suffix}
        </motion.span>
        <span className="sr-only">
          {final}
          {stat.suffix}
        </span>
      </p>
      <Eyebrow className="mt-3">{stat.label}</Eyebrow>
    </StaggerItem>
  );
}
