"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media query subscription. Returns false on the server and on the
 * first client render, then the real value — so nothing hydration-mismatches.
 *
 * Shared by every "desktop only" enhancement: parallax, sticky card stacking,
 * cursor-following highlights, the Ship Log rail.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined") return () => {};
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  // Server snapshot is always false: enhancements are opt-in, never assumed.
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** Tailwind's `md`. Keep these in step with the breakpoints in globals.css. */
export const useIsDesktop = () => useMediaQuery("(min-width: 48rem)");

/** True for a real pointer. False on touch, where hover never fires. */
export const useHasHover = () => useMediaQuery("(hover: hover)");
