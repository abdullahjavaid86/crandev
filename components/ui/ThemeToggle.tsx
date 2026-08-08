"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { buttonStyles } from "./Button";

/**
 * A leaf client component — the only interactive part of the header chrome, so
 * nothing above it needs 'use client'.
 *
 * Renders a reserved-size placeholder until mounted. The server can't know the
 * resolved theme, so an icon rendered during SSR would be a guess, and a wrong
 * guess flips visibly on hydration. The placeholder keeps the header from
 * shifting when the real button arrives.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  if (theme === null) {
    return <span aria-hidden="true" className="inline-block size-11 shrink-0" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={buttonStyles("ghost", "sm", "size-11 shrink-0 px-0")}
    >
      {isDark ? (
        <Sun aria-hidden="true" className="size-5" />
      ) : (
        <Moon aria-hidden="true" className="size-5" />
      )}
    </button>
  );
}
