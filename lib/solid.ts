/**
 * The geometry, generated in code — there is no model file to download.
 *
 * An icosahedron: 12 vertices, 30 edges. Derived from the golden ratio rather
 * than hand-listed, so the shape is a consequence of the maths instead of a
 * blob someone typed. Computed once at module load; the render loop only
 * rotates and projects it.
 *
 * Deliberately not a WebGL scene. Rotating 12 points is a few dozen
 * multiplications per frame, against ~150–400KB of runtime for three +
 * @react-three/fiber + drei. At this fidelity the maths is the cheap part.
 */

const PHI = (1 + Math.sqrt(5)) / 2;

export type Vec3 = readonly [number, number, number];

/** The 12 icosahedron vertices: three orthogonal golden rectangles. */
export const VERTICES: Vec3[] = (() => {
  const out: Vec3[] = [];
  for (const s1 of [-1, 1]) {
    for (const s2 of [-1, 1]) {
      out.push([0, s1, s2 * PHI]);
      out.push([s1, s2 * PHI, 0]);
      out.push([s1 * PHI, 0, s2]);
    }
  }
  // Normalise to a unit radius so the projection maths is scale-independent.
  const r = Math.hypot(0, 1, PHI);
  return out.map(([x, y, z]) => [x / r, y / r, z / r] as Vec3);
})();

/**
 * Edges found by distance rather than typed out: on an icosahedron every
 * vertex has exactly five neighbours at the shortest distance, so the 30 edges
 * fall out of comparing all 66 pairs against that minimum.
 */
export const EDGES: readonly (readonly [number, number])[] = (() => {
  const d2 = (a: Vec3, b: Vec3) =>
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

  let min = Infinity;
  for (let i = 0; i < VERTICES.length; i++) {
    for (let j = i + 1; j < VERTICES.length; j++) {
      min = Math.min(min, d2(VERTICES[i], VERTICES[j]));
    }
  }

  const pairs: [number, number][] = [];
  for (let i = 0; i < VERTICES.length; i++) {
    for (let j = i + 1; j < VERTICES.length; j++) {
      // Tolerance for float noise; the next distance up is far beyond it.
      if (Math.abs(d2(VERTICES[i], VERTICES[j]) - min) < 1e-6) pairs.push([i, j]);
    }
  }
  return pairs;
})();

/** Rotate a point about Y then X. Two angles is all a cursor gives us. */
export function rotate([x, y, z]: Vec3, yaw: number, pitch: number): Vec3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;

  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const y1 = y * cp - z1 * sp;
  const z2 = y * sp + z1 * cp;

  return [x1, y1, z2];
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
