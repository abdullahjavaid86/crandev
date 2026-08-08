"use client";

import { motion, useReducedMotion } from "motion/react";
import { dur, ease, viewport } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds. Use sparingly — for more than two siblings, use StaggerGroup. */
  delay?: number;
}

/**
 * The workhorse reveal: opacity, 24px of travel, and a blur that resolves.
 * Used for prose, images, and single cards.
 *
 * Fires once (§5.1) — re-animating on scroll-up is the loudest generated-
 * looking tell there is. Under reduced motion it collapses to a plain fade
 * with zero travel and no blur.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const isReduced = useReducedMotion();

  const hidden = isReduced
    ? { opacity: 0 }
    : { opacity: 0, y: 24, filter: "blur(6px)" };

  const visible = isReduced
    ? { opacity: 1, transition: { duration: dur.base, delay } }
    : {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: dur.reveal, ease: ease.out, delay },
      };

  return (
    <motion.div
      className={cn(className)}
      initial={hidden}
      whileInView={visible}
      viewport={viewport}
    >
      {children}
    </motion.div>
  );
}
