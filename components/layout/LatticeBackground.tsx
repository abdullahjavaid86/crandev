"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAnimationFrame, useReducedMotion, useScroll } from "motion/react";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { buildLattice, projectPoint, rotatePoint } from "@/lib/lattice";

/**
 * The alternative background: a projected 3D lattice instead of blurred fields.
 *
 * Canvas rather than SVG — ~78 nodes and ~90 edges means roughly 170 draw calls
 * a frame, which canvas handles without creating 170 DOM nodes to lay out.
 *
 * Colours are read from the themed CSS custom properties at paint time, so it
 * follows light/dark like everything else without a JS theme read. It never
 * takes the accent at full strength: this sits behind every section, and the
 * CTA owns the page's one accent element (§4.1).
 *
 * Same discipline as ScrollBackground (§4.6): one page-level scroll read,
 * static below `md`, static under reduced motion, and strictly decorative.
 */

const LATTICE = buildLattice();

export function LatticeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isReduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const { scrollYProgress } = useScroll();

  // Read once per resize rather than per frame — getComputedStyle is a forced
  // style resolution and has no business inside a frame loop.
  const palette = useRef({
    line: "rgba(128,128,128,0.4)",
    node: "rgba(128,128,128,0.6)",
  });

  const readPalette = useCallback(() => {
    const cs = getComputedStyle(document.documentElement);
    palette.current = {
      line: cs.getPropertyValue("--lattice-line").trim() || "rgba(128,128,128,0.35)",
      node: cs.getPropertyValue("--lattice-node").trim() || "rgba(128,128,128,0.55)",
    };
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Cap DPR at 2: a 3x retina backing store triples the fill cost for a
    // difference nobody can see on a 1px line at 30% opacity.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    readPalette();
  }, [readPalette]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize, { passive: true });
    // The theme swaps a class on <html>; re-read the palette when it does.
    const observer = new MutationObserver(readPalette);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, [resize, readPalette]);

  const draw = useCallback(
    (yaw: number, pitch: number, t: number, animate: boolean) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const w = canvas.width / Math.min(window.devicePixelRatio || 1, 2);
      const h = canvas.height / Math.min(window.devicePixelRatio || 1, 2);
      const scale = Math.max(w, h) * 0.42;

      ctx.clearRect(0, 0, w, h);

      const projected = LATTICE.points.map((p) => {
        // A small per-point bob, phase-offset so the field breathes rather
        // than pulsing as one object. Frozen when not animating.
        const bob = animate ? Math.sin(t / 2600 + p.phase) * 0.03 : 0;
        return projectPoint(
          rotatePoint({ ...p, y: p.y + bob }, yaw, pitch),
          w,
          h,
          scale,
        );
      });

      ctx.strokeStyle = palette.current.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const [i, j] of LATTICE.edges) {
        const a = projected[i];
        const b = projected[j];
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
      }
      ctx.stroke();

      ctx.fillStyle = palette.current.node;
      for (const [x, y, s] of projected) {
        // Nearer points read slightly larger — the only depth cue that
        // survives at this opacity.
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.6, s * 1.1), 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [],
  );

  const animate = isDesktop && !isReduced;

  useAnimationFrame((t) => {
    if (!animate) return;
    const p = scrollYProgress.get();
    // Scroll drives the yaw so the lattice turns as the page moves; time adds a
    // slow independent drift so it is never completely still.
    draw(p * 1.1 + t / 42000, 0.32 + p * 0.22, t, true);
  });

  // First paint, and the entire story on mobile and under reduced motion: one
  // frozen pose at the lattice's mid-scroll attitude.
  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => draw(0.55, 0.4, 0, false));
    return () => cancelAnimationFrame(id);
  }, [animate, draw]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
