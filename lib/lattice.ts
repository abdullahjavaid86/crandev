/**
 * A sparse 3D point lattice, generated in code — the same idea as lib/solid.ts,
 * scaled up to fill a background.
 *
 * The point of this over three blurred gradient blobs: blobs are the most
 * generic background on the web right now and say nothing about the company.
 * A projected lattice reads as engineered, shares a visual language with the
 * hero's WireSolid, and costs a few hundred multiplications per frame instead
 * of ~150-400KB of WebGL runtime.
 *
 * Everything here is deterministic. A seeded PRNG rather than Math.random means
 * the same lattice every load, which keeps it debuggable and rules out any
 * server/client divergence if this is ever rendered rather than canvas-drawn.
 */

export interface LatticePoint {
  x: number;
  y: number;
  z: number;
  /** Per-point drift phase, so points do not pulse in unison. */
  phase: number;
}

/** mulberry32 — small, fast, and good enough for scattering points. */
function rng(seed: number) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Lattice {
  points: LatticePoint[];
  /** Index pairs, precomputed once — neighbour search is O(n²) and static. */
  edges: [number, number][];
}

/**
 * Points scattered through a wide, shallow slab: wide in x, shorter in y, thin
 * in z. A cube would look like a cloud; a slab reads as a plane seen at an
 * angle, which is what gives the drift its sense of depth.
 */
export function buildLattice(count = 78, seed = 0x5eed): Lattice {
  const rand = rng(seed);
  const points: LatticePoint[] = [];

  for (let i = 0; i < count; i++) {
    points.push({
      x: (rand() - 0.5) * 2.6,
      y: (rand() - 0.5) * 1.5,
      z: (rand() - 0.5) * 0.9,
      phase: rand() * Math.PI * 2,
    });
  }

  /**
   * Connect near neighbours only. The threshold is the whole look: too high and
   * it becomes a solid mesh, too low and it is loose dust. Capping the degree
   * keeps dense clusters from turning into blobs.
   */
  const MAX_DIST = 0.52;
  const MAX_DEGREE = 3;
  const degree = new Array(count).fill(0);
  const edges: [number, number][] = [];

  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      if (degree[i] >= MAX_DEGREE || degree[j] >= MAX_DEGREE) continue;
      const a = points[i];
      const b = points[j];
      const d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
      if (d2 <= MAX_DIST * MAX_DIST) {
        edges.push([i, j]);
        degree[i]++;
        degree[j]++;
      }
    }
  }

  return { points, edges };
}

/** Rotate about Y then X. Two angles is all scroll and time need to drive. */
export function rotatePoint(
  p: LatticePoint,
  yaw: number,
  pitch: number,
): [number, number, number] {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = p.x * cy + p.z * sy;
  const z1 = -p.x * sy + p.z * cy;

  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const y1 = p.y * cp - z1 * sp;
  const z2 = p.y * sp + z1 * cp;

  return [x1, y1, z2];
}

/** Weak perspective. `depth` sets how strongly near points spread outward. */
export function projectPoint(
  [x, y, z]: [number, number, number],
  w: number,
  h: number,
  scale: number,
  depth = 2.4,
): [number, number, number] {
  const s = depth / (depth - z);
  return [w / 2 + x * scale * s, h / 2 + y * scale * s, s];
}
