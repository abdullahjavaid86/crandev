/**
 * Full-page film grain. This is what makes the dark read as film rather than
 * as #000, and it is what gives every glass surface something to refract —
 * glass over flat --void is just a grey rectangle (§4.2).
 *
 * Static by design: no animation, no state, no client boundary. Rendered once
 * in the root layout, never per section.
 */
export function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.028]"
    >
      <svg className="h-full w-full">
        <filter id="grain-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-noise)" />
      </svg>
    </div>
  );
}
