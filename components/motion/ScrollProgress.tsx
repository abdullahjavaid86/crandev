"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

interface ScrollProgressProps {
  className?: string;
}

/**
 * A 2px cyan bar tracking page scroll.
 *
 * This is the Ship Log's mobile form (§4.5) — below `lg` there is no gutter to
 * pin a rail to, so the same information arrives as a bar under the header,
 * with the active section's hash riding in its own eyebrow. The consumer sets
 * `lg:hidden`; the primitive stays placement-agnostic.
 *
 * Scale, never width — animating width relayouts the page every frame.
 */
export function ScrollProgress({ className }: ScrollProgressProps) {
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
      className={cn(
        "fixed inset-x-0 top-0 z-40 h-0.5 origin-left bg-cyan",
        className,
      )}
    />
  );
}
