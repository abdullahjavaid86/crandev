import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  Vector4,
  WebGLRenderer,
} from "three";

import { fragmentShader, vertexShader } from "./shaders";

/** The four `--scene-*` tokens, as the CSS strings `getComputedStyle` returns. */
export interface SceneColors {
  a: string;
  b: string;
  c: string;
  pane: string;
}

export interface SceneHandle {
  /** 0..1 page progress. Stored as a target and lerped, never applied raw. */
  setScroll(progress: number): void;
  setTheme(colors: SceneColors): void;
  setSize(width: number, height: number, pixelRatio: number): void;
  /** One frame at the current state, without advancing time. */
  renderOnce(): void;
  start(): void;
  stop(): void;
  dispose(): void;
}

/**
 * `rgba(232, 237, 245, 0.05)` → a vec4 in the renderer's working colour space.
 *
 * `Color` cannot carry alpha, and the pane tint needs it, so the channels go
 * through `setRGB(..., SRGBColorSpace)` to get the same sRGB→linear conversion
 * `Color.set(css)` applies to the three gradient colours. Skipping that step
 * would leave the pane tint mixed in the wrong space and visibly too bright.
 */
function parseRgba(css: string): Vector4 {
  const match = /rgba?\(([^)]+)\)/.exec(css);
  // No match means the token is missing — render the panes untinted rather
  // than with a colour nobody chose.
  if (!match) return new Vector4(1, 1, 1, 0);

  const parts = match[1]
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map(Number);
  const [r = 255, g = 255, b = 255, a = 1] = parts;
  const linear = new Color().setRGB(r / 255, g / 255, b / 255, SRGBColorSpace);
  return new Vector4(linear.r, linear.g, linear.b, a);
}

/**
 * The scene, with no React in it.
 *
 * One orthographic camera, one fullscreen quad, one `ShaderMaterial`: a single
 * draw call per frame. Everything that changes — scroll, time, theme, size —
 * is a uniform, so nothing is ever rebuilt while the page is open.
 *
 * Throws if `WebGLRenderer` cannot get a context. The caller catches that and
 * keeps its CSS gradient fallback.
 */
export function createScene(canvas: HTMLCanvasElement): SceneHandle {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    // Ambient decoration has no claim on the discrete GPU.
    powerPreference: "low-power",
  });

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0.5 },
    uResolution: { value: new Vector2(1, 1) },
    uColorA: { value: new Color() },
    uColorB: { value: new Color() },
    uColorC: { value: new Color() },
    uPane: { value: new Vector4(1, 1, 1, 0) },
  };

  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    // Nothing else is in the scene, so depth testing is pure overhead.
    depthTest: false,
    depthWrite: false,
  });
  scene.add(new Mesh(geometry, material));

  /** rAF handle; 0 means stopped. */
  let frame = 0;
  /** Timestamp of the previous frame; 0 means the next frame is the first. */
  let last = 0;
  let scroll = 0.5;
  let target = 0.5;

  const loop = (now: number) => {
    frame = requestAnimationFrame(loop);

    // Clamped so a backgrounded tab returning after ten seconds advances the
    // drift by one frame's worth rather than jumping the composition.
    const delta = last === 0 ? 0 : Math.min((now - last) / 1000, 0.05);
    last = now;

    scroll += (target - scroll) * 0.08;
    uniforms.uScroll.value = scroll;
    uniforms.uTime.value += delta;
    renderer.render(scene, camera);
  };

  const stop = () => {
    if (frame === 0) return;
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  };

  return {
    setScroll(progress) {
      target = Math.min(1, Math.max(0, progress));
      // With no loop running there is nothing to lerp, so the target is the
      // value — this is the static path below `md` and under reduced motion.
      if (frame === 0) scroll = target;
    },

    setTheme(colors) {
      uniforms.uColorA.value.set(colors.a);
      uniforms.uColorB.value.set(colors.b);
      uniforms.uColorC.value.set(colors.c);
      uniforms.uPane.value = parseRgba(colors.pane);
    },

    setSize(width, height, pixelRatio) {
      renderer.setPixelRatio(pixelRatio);
      // updateStyle false: the canvas is sized by CSS (`h-full w-full`), and
      // letting the renderer write inline dimensions fights it.
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width, height);
    },

    renderOnce() {
      uniforms.uScroll.value = scroll;
      renderer.render(scene, camera);
    },

    start() {
      if (frame !== 0) return;
      frame = requestAnimationFrame(loop);
    },

    stop,

    dispose() {
      stop();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      // A WebGL context is not garbage collected on its own, and a page that
      // mounts and unmounts this a few times would exhaust the browser's
      // context limit and silently lose the oldest one.
      renderer.forceContextLoss();
    },
  };
}
