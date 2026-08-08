"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

/**
 * Reads the theme from the one place that owns it: the `dark` class on <html>,
 * set before paint by ThemeScript.
 *
 * useSyncExternalStore rather than useState + useEffect — no setState during an
 * effect, and the DOM stays the single source of truth, so a change made
 * anywhere (another toggle, devtools) is observed here.
 *
 * Returns null until mounted. The server cannot know the resolved theme, and a
 * guess that flips on hydration is worse than a moment of nothing.
 */
function subscribe(onChange: () => void) {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useTheme() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, getSnapshot, () => null);

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    root.style.colorScheme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode — the choice just won't survive a reload.
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(getSnapshot() === "dark" ? "light" : "dark");
  }, [setTheme]);

  return { theme, setTheme, toggle };
}
