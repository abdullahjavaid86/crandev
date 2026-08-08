"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAnimationFrame, useReducedMotion, useScroll } from "motion/react";
import { useIsDesktop } from "@/hooks/useMediaQuery";

/**
 * A third ambient option: a perspective grid receding to a horizon, drifting
 * with scroll.
 *
 * The most literally "engineering" of the three — it reads as a plan view or a
 * blueprint rather than as decoration, which suits a site whose signature
 * element is a commit log. Drawn on canvas: ~40 strokes a frame, no DOM.
 *
 * Same discipline as the others (§4.6): one page-level scroll read, static
 * below md and under reduced motion, colours from themed vars read at paint
 * rather than per frame, strictly decorative.
 */
const ROWS = 18;
const COLS = 26;

export function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isReduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const { scrollYProgress } = useScroll();
  const stroke = useRef("rgba(128,128,128,0.12)");

  const readPalette = useCallback(() => {
    stroke.current =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--lattice-line")
        .trim() || "rgba(128,128,128,0.12)";
  }, []);

  const resize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.floor(window.innerWidth * dpr);
    c.height = Math.floor(window.innerHeight * dpr);
    c.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    readPalette();
  }, [readPalette]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize, { passive: true });
    const mo = new MutationObserver(readPalette);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      window.removeEventListener("resize", resize);
      mo.disconnect();
    };
  }, [resize, readPalette]);

  const draw = useCallback((offset: number) => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.width / dpr;
    const h = c.height / dpr;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = stroke.current;
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Horizon sits above centre so the plane reads as a floor.
    const hy = h * 0.42;

    // Depth lines: spacing compresses toward the horizon, and `offset` slides
    // the whole set forward so the plane appears to travel.
    for (let r = 1; r <= ROWS; r++) {
      const t = (r + offset) / ROWS;
      const y = hy + (h - hy) * t * t;
      if (y < hy || y > h) continue;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }

    // Radial lines converge on the vanishing point.
    for (let i = 0; i <= COLS; i++) {
      const x = (i / COLS) * w * 3 - w;
      ctx.moveTo(w / 2, hy);
      ctx.lineTo(x, h);
    }

    ctx.stroke();
  }, []);

  const animate = isDesktop && !isReduced;

  useAnimationFrame((t) => {
    if (!animate) return;
    draw((scrollYProgress.get() * 4 + t / 9000) % 1);
  });

  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => draw(0.35));
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
