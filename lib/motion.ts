import type { Transition } from "motion/react";

/**
 * The single source of truth for motion. CLAUDE.md §5.
 *
 * Components import from here and never declare timing inline — a magic
 * `duration: 0.7` in a component file is a bug, not a preference.
 */

type Bezier = [number, number, number, number];

export const ease: Record<"out" | "inOut", Bezier> = {
  /** Default reveal — decelerating, never returns. */
  out: [0.16, 1, 0.3, 1],
  /** Moves that return to where they started. */
  inOut: [0.65, 0, 0.35, 1],
};

export const dur = {
  micro: 0.18,
  base: 0.5,
  reveal: 0.8,
  /** Hero only. Nothing else earns this much time. */
  hero: 1.2,
} as const;

export const spring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 0.9,
};

/**
 * `once: true` is not negotiable — elements re-animating on scroll-up is the
 * loudest "generated" tell there is. The negative margins fire the reveal
 * slightly before the element is fully in view so it never appears late.
 */
export const viewport = {
  once: true,
  margin: "-12% 0px -8% 0px",
} as const;

/** Shared reveal used by <Reveal /> and anything composing it. */
export const revealVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: dur.reveal, ease: ease.out },
  },
} as const;

/**
 * Parent/child pair for staggered groups. Children consume `item` and must
 * never carry their own `whileInView` — the parent owns the trigger.
 */
export const staggerVariants = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  },
  item: revealVariants,
} as const;

/**
 * Collapses any of the above to a plain fade. Call with the result of
 * `useReducedMotion()` — travel, blur, and stagger all go to zero.
 */
export function reduced(isReduced: boolean | null) {
  return isReduced
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: dur.base } },
      }
    : revealVariants;
}
