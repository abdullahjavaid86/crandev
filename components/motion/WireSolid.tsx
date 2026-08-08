"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useHasHover } from "@/hooks/useMediaQuery";
import { EDGES, VERTICES, project, rotate, type Vec3 } from "@/lib/solid";
import { cn } from "@/lib/utils";

interface WireSolidProps {
  className?: string;
  /** Viewbox radius. The SVG scales with its container; this sets proportion. */
  radius?: number;
}

const VIEW = 220;

/**
 * A wireframe solid that tracks the cursor anywhere on screen.
 *
 * Code-generated geometry (lib/solid.ts), rendered as two SVG paths and
 * rotated on motion's shared frameloop. No WebGL, no model file, no new
 * dependency — three + @react-three/fiber + drei would be ~150–400KB of
 * runtime for a shape that is 12 points and 30 edges.
 *
 * Two paths, not thirty lines: edges are split into behind/in-front by their
 * midpoint depth each frame, so the whole thing is two `setAttribute` calls
 * per frame and still reads as a solid rather than a flat net.
 *
 * It is ambient. It never takes the accent — the hero CTA owns that (§4.1) —
 * so it draws in line and muted tones only.
 */
export function WireSolid({ className, radius = 78 }: WireSolidProps) {
  const isReduced = useReducedMotion();
  const hasHover = useHasHover();

  const hostRef = useRef<SVGSVGElement>(null);
  const backRef = useRef<SVGPathElement>(null);
  const frontRef = useRef<SVGPathElement>(null);

  // Raw pointer, in -0.5..0.5 of the viewport. Springs smooth it so the solid
  // eases toward the cursor instead of snapping to every mousemove.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const yaw = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 });
  const pitch = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 });

  // Paused when off-screen: a hero solid has no business spending frames once
  // the reader has scrolled to the work grid.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    // Touch has no cursor, so there is nothing to listen for — the idle drift
    // in the frame loop carries the motion instead.
    if (!hasHover || isReduced) return;
    const onMove = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [hasHover, isReduced, px, py]);

  /** Rotate, project, split by depth, write two path strings. */
  const draw = useCallback((yawR: number, pitchR: number) => {
    const points = VERTICES.map((v: Vec3) =>
      project(rotate(v, yawR, pitchR), radius),
    );
    let back = "";
    let front = "";
    for (const [i, j] of EDGES) {
      const a = points[i];
      const b = points[j];
      const seg = `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
      // Midpoint depth decides which layer the edge belongs to.
      if ((a[2] + b[2]) / 2 < 0) back += seg;
      else front += seg;
    }
    backRef.current?.setAttribute("d", back);
    frontRef.current?.setAttribute("d", front);
  }, [radius]);

  useAnimationFrame((t) => {
    if (isReduced || !visible) return;
    // A slow constant drift so the solid is alive on touch, where there is no
    // cursor at all, and never sits perfectly still on desktop either.
    const drift = t / 9000;
    draw(yaw.get() * 2.2 + drift, pitch.get() * 1.6);
  });

  // First paint, and the whole story under reduced motion: one static pose,
  // drawn during render rather than left blank until a frame runs.
  useEffect(() => {
    draw(0.6, 0.35);
  }, [draw]);

  return (
    <svg
      ref={hostRef}
      aria-hidden="true"
      viewBox={`${-VIEW / 2} ${-VIEW / 2} ${VIEW} ${VIEW}`}
      className={cn("pointer-events-none h-full w-full", className)}
    >
      {/* Behind the centre: dimmer and thinner, which is the whole depth cue. */}
      <path
        ref={backRef}
        fill="none"
        stroke="var(--line-strong)"
        strokeWidth={0.7}
        strokeLinecap="round"
        opacity={0.55}
      />
      <path
        ref={frontRef}
        fill="none"
        stroke="var(--muted)"
        strokeWidth={1.1}
        strokeLinecap="round"
      />
    </svg>
  );
}
