"use client";

import { buttonStyles } from "./buttonStyles";
import { useBackground } from "@/hooks/useBackground";
import { useHeroShape } from "@/hooks/useHeroShape";
import { usePathname } from "next/navigation";

/**
 * A design-comparison control, not a feature — but one that currently SHIPS.
 *
 * Cycles the ambient background and the hero solid so both can be judged on
 * the real page instead of argued about. It used to be excluded from
 * production behind a NODE_ENV-gated dynamic import; that gate is gone by
 * request, because the decision (D9) is being made on the deployed site,
 * where the backgrounds actually look like themselves. So it is visible to
 * anyone who loads the site.
 *
 * It excludes itself from the admin portal rather than being mounted lower in
 * the tree — the portal has no hero and no ambient background. Mounting it in
 * `app/(site)/layout.tsx` instead would read better and is a trap worth
 * remembering if the production gate ever comes back: from there the module
 * survives dead-code elimination and ships anyway.
 *
 * All of this is temporary. When the choices are made, delete this, the flags,
 * the losing variants, and the ThemeScript lines that resolve them.
 */
export function DevVariantPicker() {
  const pathname = usePathname();
  const { variant, cycle: cycleBg } = useBackground();
  const { shape, cycle: cycleShape } = useHeroShape();
  // Hooks first, then bail: the portal has neither a hero nor an ambient
  // background, so the control has nothing to control there.
  if (variant === null || shape === null || pathname.startsWith("/admin")) return null;

  const chip = "font-mono text-xs tracking-[0.18em] uppercase";

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={cycleShape}
        aria-label={`Hero shape: ${shape}. Next shape.`}
        className={buttonStyles("secondary", "sm", chip)}
      >
        shape: {shape}
      </button>
      <button
        type="button"
        onClick={cycleBg}
        aria-label={`Background: ${variant}. Next background.`}
        className={buttonStyles("secondary", "sm", chip)}
      >
        bg: {variant}
      </button>
    </div>
  );
}
