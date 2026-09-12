"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/**
 * The page's scroll indicator: a 2px accent bar across the very top, at every
 * width. It sits above the header rather than under it, which is why its
 * z-index is one step higher — the header is a floating glass panel now, and a
 * bar behind it would disappear under the blur.
 *
 * Scale, never width — animating width relayouts the page every frame.
 */
export function ScrollProgress() {
  const isReduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // The spring removes the jitter of raw wheel deltas. Under reduced motion
  // the raw value is used directly — smoothing is still motion.
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 40,
    mass: 0.4,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: isReduced ? scrollYProgress : smoothed }}
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent"
    />
  );
}
