"use client";

import { useBackground } from "@/hooks/useBackground";
import { buttonStyles } from "./buttonStyles";

/**
 * DEVELOPMENT ONLY — a design-comparison control, not a feature.
 *
 * The caller gates this on NODE_ENV, which Next inlines, so the whole thing is
 * removed from a production build. A switch for choosing between two draft
 * backgrounds has no business shipping to a visitor.
 */
export function BackgroundToggle() {
  const { variant, toggle } = useBackground();
  if (variant === null) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Background: ${variant}. Switch to ${variant === "lattice" ? "fields" : "lattice"}.`}
      className={buttonStyles(
        "secondary",
        "sm",
        "fixed right-4 bottom-4 z-50 font-mono text-xs tracking-[0.18em] uppercase",
      )}
    >
      bg: {variant}
    </button>
  );
}
