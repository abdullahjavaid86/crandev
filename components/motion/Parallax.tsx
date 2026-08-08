"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Total travel in px across the element's full pass through the viewport.
   * Keep it small — past ~60px the element visibly detaches from the page.
   */
  distance?: number;
}

/**
 * Vertical parallax on a single element. **One per section, maximum** (§5.1) —
 * two elements drifting at different rates reads as a broken layout, not depth.
 *
 * Off under reduced motion, and off below `md` where a scroll-linked repaint
 * buys a few pixels nobody notices. Children render exactly once in every
 * case: branching the JSX would duplicate DOM, IDs, and image requests.
 */
export function Parallax({ children, className, distance = 40 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const active = isDesktop && !isReduced;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    active ? [distance / 2, -distance / 2] : [0, 0],
  );

  return (
    <motion.div ref={ref} style={{ y }} className={cn(className)}>
      {children}
    </motion.div>
  );
}
