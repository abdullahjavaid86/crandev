"use client";

import { useBackground } from "@/hooks/useBackground";
import { LatticeBackground } from "./LatticeBackground";
import { ScrollBackground } from "./ScrollBackground";

/**
 * Renders whichever ambient background is selected. Temporary: this exists so
 * the two can be compared on the real page instead of argued about. When one
 * wins, this file, the loser, useBackground and BackgroundToggle all go.
 *
 * Renders nothing until mounted, because the choice lives in localStorage and
 * the server cannot know it. A background is decorative, so a frame without one
 * costs nothing — guessing wrong and swapping it in view would be worse.
 */
export function BackgroundLayer() {
  const { variant } = useBackground();
  if (variant === null) return null;
  return variant === "lattice" ? <LatticeBackground /> : <ScrollBackground />;
}
