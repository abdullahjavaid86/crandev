"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A design-comparison flag stored on <html> as a data attribute and mirrored
 * to localStorage, resolved before paint by ThemeScript.
 *
 * Generic because there are two of these now — the ambient background and the
 * hero shape — and a second hand-rolled copy would be the duplication §10
 * exists to stop. Same shape as useTheme: the DOM owns the value, this
 * subscribes to it.
 *
 * All of it is temporary. When the choices are made, delete the losers, the
 * flags, the picker, and the ThemeScript lines that resolve them.
 */
export function useDomFlag<T extends string>(
  attribute: string,
  values: readonly T[],
  storageKey: string,
) {
  const subscribe = useCallback((onChange: () => void) => {
    if (typeof document === "undefined") return () => {};
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [attribute],
    });
    return () => observer.disconnect();
  }, [attribute]);

  const getSnapshot = useCallback((): T => {
    const raw = document.documentElement.getAttribute(attribute);
    return (values as readonly string[]).includes(raw ?? "")
      ? (raw as T)
      : values[0];
  }, [attribute, values]);

  // null until mounted: the server cannot know a localStorage value, and
  // guessing means rendering one variant and swapping it in view.
  const value = useSyncExternalStore<T | null>(subscribe, getSnapshot, () => null);

  const set = useCallback(
    (next: T) => {
      document.documentElement.setAttribute(attribute, next);
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        // Private mode — the choice just won't survive a reload.
      }
    },
    [attribute, storageKey],
  );

  const cycle = useCallback(() => {
    const current = getSnapshot();
    set(values[(values.indexOf(current) + 1) % values.length]);
  }, [getSnapshot, set, values]);

  return { value, set, cycle };
}
