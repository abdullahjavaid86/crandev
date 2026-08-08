"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useIsDesktop } from "@/hooks/useMediaQuery";

/**
 * The scroll-reactive background (§4.6).
 *
 * One `fixed inset-0 -z-10` layer, below content and below the grain, and the
 * only element on the site that responds continuously to scroll. The single
 * `useScroll()` below is THE driver — no section adds a second listener.
 *
 * Three large radial fields in `--accent` and `--ion` drift and cross-fade as
 * the page moves, so the hue shifts between sections without ever becoming a
 * different background. It is ambient: if you notice it while reading, it is
 * too strong.
 *
 * Only `transform` and `opacity` are animated. The gradients and the
 * `blur(120px)` are declared once and never touched — animating a gradient
 * stop or a filter value repaints the whole viewport every frame.
 *
 * Nothing is imported from `lib/motion.ts` because nothing here is a tween:
 * every value is a pure mapping of scroll progress, with no duration or easing
 * of its own to get wrong.
 */

/** Scroll progress the fields are keyed to: top, middle, bottom. */
const STOPS = [0, 0.5, 1];

/** Index of the mid stop — the frozen pose used when scroll tracking is off. */
const MID = 1;

export function ScrollBackground() {
  const isReduced = useReducedMotion();
  const isDesktop = useIsDesktop();

  // Static below `md` and under reduced motion: two full-viewport blurred
  // layers tracking scroll is the most expensive thing we could ship to a
  // mid-range phone, and the drift is imperceptible at that size anyway.
  const tracks = isDesktop && !isReduced;

  const { scrollYProgress } = useScroll();

  /** Live range while tracking; the mid-scroll value held flat when not. */
  const range = <T,>(values: [T, T, T]): T[] =>
    tracks ? values : [values[MID], values[MID], values[MID]];

  // Field A — accent, top left. Sinks slowly and fades as the page runs on.
  const aY = useTransform(scrollYProgress, STOPS, range(["-6%", "6%", "18%"]));
  const aX = useTransform(scrollYProgress, STOPS, range(["-4%", "0%", "6%"]));
  const aOpacity = useTransform(scrollYProgress, STOPS, range([0.18, 0.14, 0.1]));

  // Field B — ion, right. Rises against A so the hue crosses over mid-page.
  const bY = useTransform(scrollYProgress, STOPS, range(["14%", "0%", "-14%"]));
  const bOpacity = useTransform(scrollYProgress, STOPS, range([0.1, 0.14, 0.11]));

  // Field C — accent, bottom. Carries the lower half of long pages.
  const cY = useTransform(scrollYProgress, STOPS, range(["16%", "4%", "-10%"]));
  const cOpacity = useTransform(scrollYProgress, STOPS, range([0.1, 0.13, 0.18]));

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        style={{
          y: aY,
          x: aX,
          opacity: aOpacity,
          filter: "blur(120px)",
          background:
            "radial-gradient(circle at center, var(--accent) 0%, transparent 68%)",
        }}
        className="absolute -top-[18%] -left-[20%] h-[62vmax] w-[62vmax]"
      />
      <motion.div
        style={{
          y: bY,
          opacity: bOpacity,
          filter: "blur(120px)",
          background:
            "radial-gradient(circle at center, var(--ion) 0%, transparent 68%)",
        }}
        className="absolute top-[22%] -right-[24%] h-[58vmax] w-[58vmax]"
      />
      <motion.div
        style={{
          y: cY,
          opacity: cOpacity,
          filter: "blur(120px)",
          background:
            "radial-gradient(circle at center, var(--accent) 0%, transparent 66%)",
        }}
        className="absolute -bottom-[28%] left-[8%] h-[50vmax] w-[50vmax]"
      />
    </div>
  );
}
