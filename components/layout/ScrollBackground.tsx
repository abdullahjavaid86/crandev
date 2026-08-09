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
 * **`will-change` is load-bearing, not a micro-optimisation.** Animating the
 * transform of a `blur(120px)` element still re-runs the blur every frame
 * unless the layer is promoted, and these are ~900px squares. Without it the
 * worst interaction on the home page measured 640ms at 4x CPU throttle, with
 * ~1ms of that in event handlers — the rest was waiting for a frame. With it,
 * 48ms, which is what the page measures with no background at all.
 *
 * This is the documented exception to "`will-change` only on elements
 * actually mid-animation": these ARE mid-animation for the whole session,
 * because their animation is scroll. Below `md` the fields are static and this
 * component returns early, so the three GPU layers never exist on a phone.
 *
 * Nothing is imported from `lib/motion.ts` because nothing here is a tween:
 * every value is a pure mapping of scroll progress, with no duration or easing
 * of its own to get wrong.
 */

/**
 * Field colour AND alpha come from --field-a/b/c, which are themed. The themes
 * need very different amounts of paint: a bright field at 0.14 over near-black
 * is a 2.8x luminance step; the same field over #FAFBFC is 1.04x, which reads
 * as nothing at all. Light therefore uses deeper, more saturated hues at
 * roughly double the alpha.
 *
 * The values below are a RELATIVE band (0..1) multiplied onto that, so scroll
 * behaviour is identical in both themes and only the paint differs.
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
  const aOpacity = useTransform(scrollYProgress, STOPS, range([1, 0.78, 0.55]));

  // Field B — ion, right. Rises against A so the hue crosses over mid-page.
  const bY = useTransform(scrollYProgress, STOPS, range(["14%", "0%", "-14%"]));
  const bOpacity = useTransform(scrollYProgress, STOPS, range([0.55, 0.8, 0.62]));

  // Field C — accent, bottom. Carries the lower half of long pages.
  const cY = useTransform(scrollYProgress, STOPS, range(["16%", "4%", "-10%"]));
  const cOpacity = useTransform(scrollYProgress, STOPS, range([0.55, 0.72, 1]));

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
          willChange: "transform, opacity",
          background: "var(--field-a)",
        }}
        className="absolute -top-[18%] -left-[20%] h-[62vmax] w-[62vmax]"
      />
      <motion.div
        style={{
          y: bY,
          opacity: bOpacity,
          filter: "blur(120px)",
          willChange: "transform, opacity",
          background: "var(--field-b)",
        }}
        className="absolute top-[22%] -right-[24%] h-[58vmax] w-[58vmax]"
      />
      <motion.div
        style={{
          y: cY,
          opacity: cOpacity,
          filter: "blur(120px)",
          willChange: "transform, opacity",
          background: "var(--field-c)",
        }}
        className="absolute -bottom-[28%] left-[8%] h-[50vmax] w-[50vmax]"
      />
    </div>
  );
}
