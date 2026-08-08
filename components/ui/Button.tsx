"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

/**
 * Variant maps own colour and border; the base owns layout. They never declare
 * the same property, because cn() joins rather than merges (§10) — an overlap
 * would resolve by stylesheet order, not argument order.
 */
const variants: Record<Variant, string> = {
  /** THE accent. One per viewport-height of scroll (§4.1). */
  primary:
    "bg-cyan text-void shadow-[0_0_0_0_rgba(53,240,220,0)] hover:shadow-[0_8px_32px_-8px_rgba(53,240,220,0.45)]",
  secondary: "border border-hairline bg-carbon text-ice hover:bg-graphite",
  ghost: "border border-transparent text-mist hover:text-ice",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-small",
  md: "px-5 py-3",
};

/**
 * Shared style function. Anything that must *look* like a button but be a link
 * uses this with next/link rather than a second component — one Button, and no
 * near-duplicate that drifts on the next hover tweak (§10).
 */
export function buttonStyles(
  variant: Variant = "secondary",
  size: Size = "md",
  className?: string,
) {
  return cn(
    // min-h keeps the 44px tap target even at size sm.
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md font-medium",
    "transition-[background-color,color,box-shadow] duration-[--d-micro]",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

/**
 * Extends motion's button props, not React's. React's ComponentProps<"button">
 * carries drag and animation handlers whose signatures collide with motion's
 * own — HTMLMotionProps is the same surface with those reconciled.
 */
interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
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
      // Lift on hover, press on tap — spring, never a scale-up. The cyan glow
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
