"use client";

import { useDomFlag } from "./useDomFlag";

export const BACKGROUNDS = ["fields", "lattice", "grid", "none"] as const;
export type BackgroundVariant = (typeof BACKGROUNDS)[number];

/** Which ambient background is showing. Temporary — see useDomFlag. */
export function useBackground() {
  const { value, set, cycle } = useDomFlag<BackgroundVariant>(
    "data-bg",
    BACKGROUNDS,
    "bg",
  );
  return { variant: value, setVariant: set, cycle };
}
