"use client";

import { usePathname } from "next/navigation";
import { useBackground } from "@/hooks/useBackground";
import { useHeroShape } from "@/hooks/useHeroShape";
import { buttonStyles } from "./buttonStyles";

/**
 * DEVELOPMENT ONLY — a design-comparison control, not a feature.
 *
 * Cycles the ambient background and the hero solid so both can be judged on
 * the real page instead of argued about. The caller gates this on NODE_ENV
 * from inside the dead branch, which is what actually keeps it out of the
 * production bundle — a static import plus a NODE_ENV check in the JSX
 * dead-codes the JSX but keeps the module.
 *
 * It excludes itself from the admin portal rather than being mounted lower in
 * the tree. Moving the gated `dynamic()` into `app/(site)/layout.tsx` reads
 * better and DOES NOT WORK: the picker survives into the production client
 * bundle from there, referenced by the prerendered home page. Only the root
 * layout's copy is actually eliminated — verified by building both ways. The
 * route test costs nothing, because in production this module does not exist.
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
  if (pathname.startsWith("/admin")) return null;
  if (variant === null || shape === null) return null;

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
