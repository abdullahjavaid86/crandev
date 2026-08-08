"use client";

import { useCallback, useSyncExternalStore } from "react";

export type BackgroundVariant = "fields" | "lattice";

/**
 * Which ambient background is showing. Deliberately the same shape as
 * useTheme: the DOM owns the value (`data-bg` on <html>, set before paint by
 * ThemeScript), and this subscribes to it rather than holding its own state.
 *
 * This exists to settle a design question by looking at both, not as a
 * permanent feature. When one wins, delete the loser, this hook, the toggle,
 * and the data-bg line in ThemeScript.
 *
 * Returns null until mounted — the server cannot know a localStorage value,
 * and guessing means rendering one background then swapping it.
 */
function subscribe(onChange: () => void) {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-bg"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): BackgroundVariant {
  return document.documentElement.dataset.bg === "lattice" ? "lattice" : "fields";
}

export function useBackground() {
  const variant = useSyncExternalStore<BackgroundVariant | null>(
    subscribe,
    getSnapshot,
    () => null,
  );

  const setVariant = useCallback((next: BackgroundVariant) => {
    document.documentElement.dataset.bg = next;
    try {
      localStorage.setItem("bg", next);
    } catch {
      // Private mode — the choice just won't survive a reload.
    }
  }, []);

  const toggle = useCallback(() => {
    setVariant(getSnapshot() === "lattice" ? "fields" : "lattice");
  }, [setVariant]);

  return { variant, setVariant, toggle };
}
