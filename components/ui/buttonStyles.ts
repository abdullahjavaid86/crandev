import { cn } from "@/lib/utils";

/**
 * Button styling, deliberately OUTSIDE any client boundary.
 *
 * This used to live in Button.tsx, which is `'use client'`. Every export of a
 * client module is a client reference, so a server component could not call it
 * — which defeated the whole point of having one shared style function (§10).
 * A pure string builder has no reason to sit behind that boundary.
 *
 * Button.tsx re-exports `buttonStyles` so existing imports keep working.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md";

/**
 * Variant maps own colour and border; the base owns layout. They never declare
 * the same property, because cn() joins rather than merges — an overlap would
 * resolve by stylesheet order, not argument order.
 */
const variants: Record<ButtonVariant, string> = {
  /** THE accent. One per viewport-height of scroll (§4.1). */
  primary:
    "bg-accent text-accent-on shadow-[0_0_0_0_rgba(53,240,220,0)] hover:shadow-[0_8px_32px_-8px_rgba(53,240,220,0.45)]",
  secondary: "border border-line bg-raised text-fg hover:bg-inset",
  ghost: "border border-transparent text-muted hover:text-fg",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-small",
  md: "px-5 py-3",
};

/**
 * Shared style function. Anything that must *look* like a button but be a link
 * uses this with next/link rather than a second component — one Button, and no
 * near-duplicate that drifts on the next hover tweak (§10).
 */
export function buttonStyles(
  variant: ButtonVariant = "secondary",
  size: ButtonSize = "md",
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
