"use client";

import { SHAPE_NAMES, type ShapeName } from "@/lib/shapes";
import { useDomFlag } from "./useDomFlag";

/** Which hero solid is showing. Temporary — see useDomFlag. */
export function useHeroShape() {
  const { value, set, cycle } = useDomFlag<ShapeName>(
    "data-shape",
    SHAPE_NAMES,
    "shape",
  );
  return { shape: value, setShape: set, cycle };
}
