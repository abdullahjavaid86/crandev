"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { spring } from "@/lib/motion";
import { buttonStyles, type ButtonSize, type ButtonVariant } from "./buttonStyles";

// Re-exported only so existing `from "./Button"` imports keep working. This
// re-export is itself a client reference, so it does NOT help a server
// component — those must import from "./buttonStyles" directly.
export { buttonStyles };
export type { ButtonSize, ButtonVariant };

/**
 * Extends motion's button props, not React's. React's ComponentProps<"button">
 * carries drag and animation handlers whose signatures collide with motion's
 * own — HTMLMotionProps is the same surface with those reconciled.
 */
interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const isReduced = useReducedMotion();

  return (
    <motion.button
      className={buttonStyles(variant, size, className)}
      // Lift on hover, press on tap — spring, never a scale-up. The accent glow
      // is a box-shadow transition (§5.3), so it costs no layout.
      whileHover={isReduced || props.disabled ? undefined : { y: -2 }}
      whileTap={isReduced || props.disabled ? undefined : { scale: 0.98 }}
      transition={spring}
      {...props}
    >
      {children}
    </motion.button>
  );
}
