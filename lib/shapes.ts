/**
 * Hero geometry, generated in code — no model files, no WebGL runtime.
 *
 * A registry rather than one shape, so the hero form can be chosen by looking
 * at it. Every entry returns the same {points, edges} pair, so the renderer
 * never needs to know which one it is drawing.
 *
 * All of these are trigonometry over a few hundred points. Against ~150-400KB
 * for three + @react-three/fiber + drei, the whole registry is free.
 */

export type Vec3 = readonly [number, number, number];
export type Edge = readonly [number, number];
export interface Shape {
  points: Vec3[];
  edges: Edge[];
}

/** Scale so the farthest point sits at radius 1, keeping projection uniform. */
function normalise(points: Vec3[]): Vec3[] {
  const max = points.reduce((m, [x, y, z]) => Math.max(m, Math.hypot(x, y, z)), 0) || 1;
  return points.map(([x, y, z]) => [x / max, y / max, z / max] as Vec3);
}

/** Sequential segments along an open or closed path. */
function path(count: number, closed = true): Edge[] {
  const out: Edge[] = [];
  for (let i = 0; i < (closed ? count : count - 1); i++) {
    out.push([i, (i + 1) % count]);
  }
  return out;
}

/* ── icosahedron ────────────────────────────────────────────────────────── */

/** Twelve vertices from three golden rectangles; edges found by distance. */
function icosahedron(): Shape {
  const PHI = (1 + Math.sqrt(5)) / 2;
  const raw: Vec3[] = [];
  for (const a of [-1, 1]) {
    for (const b of [-1, 1]) {
      raw.push([0, a, b * PHI], [a, b * PHI, 0], [a * PHI, 0, b]);
    }
  }
  const points = normalise(raw);
  const d2 = (p: Vec3, q: Vec3) =>
    (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
  let min = Infinity;
  for (let i = 0; i < points.length; i++)
    for (let j = i + 1; j < points.length; j++)
      min = Math.min(min, d2(points[i], points[j]));
  const edges: Edge[] = [];
  for (let i = 0; i < points.length; i++)
    for (let j = i + 1; j < points.length; j++)
      if (Math.abs(d2(points[i], points[j]) - min) < 1e-6) edges.push([i, j]);
  return { points, edges };
}

/* ── torus knot ─────────────────────────────────────────────────────────── */

/** One continuous curve winding p times around and q times through. */
function knot(p = 2, q = 5, samples = 190): Shape {
  const raw: Vec3[] = [];
  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * Math.PI * 2;
    const r = 2 + Math.cos(q * t);
    raw.push([r * Math.cos(p * t), r * Math.sin(p * t), -Math.sin(q * t)]);
  }
  return { points: normalise(raw), edges: path(samples) };
}

/* ── globe ──────────────────────────────────────────────────────────────── */

/** A UV sphere drawn as latitude rings and meridians — a wireframe planet. */
function globe(lat = 7, lon = 14): Shape {
  const raw: Vec3[] = [];
  const edges: Edge[] = [];
  for (let i = 0; i < lat; i++) {
    // Skip the poles: a ring of radius 0 is a pile of duplicate points.
    const phi = ((i + 1) / (lat + 1)) * Math.PI;
    for (let j = 0; j < lon; j++) {
      const theta = (j / lon) * Math.PI * 2;
      raw.push([
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta),
      ]);
      const here = i * lon + j;
      edges.push([here, i * lon + ((j + 1) % lon)]); // around the ring
      if (i < lat - 1) edges.push([here, here + lon]); // down the meridian
    }
  }
  return { points: normalise(raw), edges };
}

/* ── helix ──────────────────────────────────────────────────────────────── */

/** Two strands and their rungs. Reads as structure rather than decoration. */
function helix(turns = 3, samples = 70): Shape {
  const raw: Vec3[] = [];
  const edges: Edge[] = [];
  for (let i = 0; i < samples; i++) {
    const t = (i / (samples - 1)) * Math.PI * 2 * turns;
    const y = (i / (samples - 1)) * 2 - 1;
    raw.push([Math.cos(t), y * 1.35, Math.sin(t)]);
    raw.push([Math.cos(t + Math.PI), y * 1.35, Math.sin(t + Math.PI)]);
    const a = i * 2;
    if (i < samples - 1) {
      edges.push([a, a + 2], [a + 1, a + 3]);
    }
    // A rung every few samples, so the two strands read as one object.
    if (i % 6 === 0) edges.push([a, a + 1]);
  }
  return { points: normalise(raw), edges };
}

/* ── vortex ─────────────────────────────────────────────────────────────── */

/** A conical spiral. The only one with a clear direction of travel. */
function vortex(turns = 5, samples = 200): Shape {
  const raw: Vec3[] = [];
  for (let i = 0; i < samples; i++) {
    const u = i / (samples - 1);
    const t = u * Math.PI * 2 * turns;
    const r = 0.15 + u * 1.05;
    raw.push([r * Math.cos(t), (u - 0.5) * 1.9, r * Math.sin(t)]);
  }
  return { points: normalise(raw), edges: path(samples, false) };
}

/* ── registry ───────────────────────────────────────────────────────────── */

export const SHAPES = {
  knot: knot(),
  globe: globe(),
  icosahedron: icosahedron(),
  helix: helix(),
  vortex: vortex(),
} satisfies Record<string, Shape>;

export type ShapeName = keyof typeof SHAPES;

/** Cycle order for the dev picker. */
export const SHAPE_NAMES = Object.keys(SHAPES) as ShapeName[];

export function isShapeName(v: string | undefined): v is ShapeName {
  return v !== undefined && v in SHAPES;
}

/** Rotate about Y then X. Two angles is all a cursor gives us. */
export function rotate([x, y, z]: Vec3, yaw: number, pitch: number): Vec3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
}

/** Weak perspective — enough to read as depth, no camera model required. */
export function project(
  [x, y, z]: Vec3,
  radius: number,
  depth = 2.6,
): readonly [number, number, number] {
  const s = depth / (depth - z);
  return [x * radius * s, y * radius * s, z];
}
