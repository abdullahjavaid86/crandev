"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import { useIsDesktop } from "@/hooks/useMediaQuery";
import type { SceneColors, SceneHandle } from "@/lib/scene/createScene";

/**
 * Reads the four themed scene tokens off `<html>`. Custom properties come back
 * as authored, so `--scene-pane` arrives as its `rgba(...)` string with the
 * alpha intact.
 */
function readSceneColors(): SceneColors {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string) => styles.getPropertyValue(name).trim();
  return {
    a: read("--scene-a"),
    b: read("--scene-b"),
    c: read("--scene-c"),
    pane: read("--scene-pane"),
  };
}

/**
 * The page's one ambient layer, and its single scroll driver (§4.6). Nothing
 * else in the site listens to page scroll for decoration.
 *
 * **Lazy on purpose.** `three` is loaded inside an effect scheduled with
 * `requestIdleCallback`, so it lands in its own chunk, after the page is
 * interactive, and never competes with the largest text for bandwidth. The
 * div's CSS gradient is painted first and stays underneath: it is what the
 * visitor sees before the idle callback runs, and all they see if the machine
 * has no WebGL.
 *
 * **One draw call.** The scene is a fullscreen quad and a fragment shader
 * (`lib/scene/`), so the cost per frame is one shader pass at a pixel ratio
 * capped at 1.5, not a scene graph.
 *
 * Below `md` and under reduced motion it renders exactly one frame at
 * mid-scroll and stops — no loop, no listeners.
 */
export function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isReduced = useReducedMotion() ?? false;
  const isDesktop = useIsDesktop();
  const animate = isDesktop && !isReduced;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let handle: SceneHandle | null = null;
    let cancelled = false;
    let idleId: number | undefined;
    let startTimer: ReturnType<typeof setTimeout> | undefined;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    // Every listener and observer registers its own teardown as it is added,
    // because they are attached inside an async callback that may never run.
    const teardown: Array<() => void> = [];

    const init = async () => {
      const { createScene } = await import("@/lib/scene/createScene");
      if (cancelled) return;

      try {
        handle = createScene(canvas);
      } catch {
        // No WebGL context. The wrapper's gradient is already the whole
        // picture, so there is nothing to report and nothing to fall back to.
        return;
      }

      const scene = handle;
      const applySize = () =>
        scene.setSize(
          window.innerWidth,
          window.innerHeight,
          Math.min(window.devicePixelRatio, 1.5),
        );

      scene.setTheme(readSceneColors());
      applySize();

      if (animate) {
        const onScroll = () => {
          const max = Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight,
          );
          scene.setScroll(window.scrollY / max);
        };
        // A refresh partway down the page starts at that position rather than
        // sliding up to it.
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        teardown.push(() => window.removeEventListener("scroll", onScroll));

        const onVisibility = () => {
          if (document.hidden) scene.stop();
          else scene.start();
        };
        document.addEventListener("visibilitychange", onVisibility);
        teardown.push(() =>
          document.removeEventListener("visibilitychange", onVisibility),
        );

        // Renders before the loop's first rAF. The context is opaque
        // (`alpha: false`), so without this the canvas composites one black
        // frame over the fallback gradient.
        scene.renderOnce();
        scene.start();
      } else {
        scene.setScroll(0.5);
        scene.renderOnce();
      }

      const onResize = () => {
        clearTimeout(resizeTimer);
        // Resizing reallocates the drawing buffer, so it waits for the drag to
        // settle instead of doing that on every intermediate width.
        resizeTimer = setTimeout(() => {
          applySize();
          if (!animate) scene.renderOnce();
        }, 150);
      };
      window.addEventListener("resize", onResize);
      teardown.push(() => window.removeEventListener("resize", onResize));

      // The theme toggle writes `dark` onto <html>; the tokens change with it
      // and the uniforms have to follow.
      const observer = new MutationObserver(() => {
        scene.setTheme(readSceneColors());
        if (!animate) scene.renderOnce();
      });
      observer.observe(document.documentElement, { attributeFilter: ["class"] });
      teardown.push(() => observer.disconnect());
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => void init(), { timeout: 1500 });
    } else {
      startTimer = setTimeout(() => void init(), 200);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      clearTimeout(startTimer);
      clearTimeout(resizeTimer);
      for (const off of teardown) off();
      handle?.dispose();
    };
  }, [animate]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(120%_80%_at_20%_10%,var(--scene-a),var(--scene-b)_60%,var(--scene-c))]"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
