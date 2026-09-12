import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { brands, type Brand } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * The logo strip, labelled honestly: "Teams we've shipped for" is a claim we
 * can stand behind; "Partners" would be a different claim and the wrong one is
 * a credibility leak (§6.1 item 7).
 *
 * Every entry currently points at the same placeholder mark, so the company
 * NAME is the primary visual and the mark is a small lockup element beside it.
 * Six identical marks in a row with no names would read as a broken asset.
 *
 * The mark is painted as a `bg-current` mask rather than an <img>: the SVG is
 * authored in `currentColor`, and colour only inherits that way. An <img> —
 * next/image included — renders the file in its own document context, where
 * `currentColor` resolves to black and the mark disappears on the dark theme.
 * Dimensions are still explicit, so nothing shifts on load, and there is no
 * image request per brand.
 *
 * MOTION: a continuous marquee, 60s for a full pass — slow enough to read a
 * name without tracking it. The track holds the list twice and translates
 * -50%, which is exactly one set, so the loop has no seam.
 *
 * It runs continuously — it does not pause on hover. It is `motion-safe:` only. An infinite loop is precisely what
 * prefers-reduced-motion asks us to remove, so under `reduce` the animation is
 * never applied and the strip becomes a static, manually scrollable row.
 * *
 * A server component. No client boundary — the marquee is pure CSS.
 */

function BrandItem({ brand }: { brand: Brand }) {
  return (
    <li className="shrink-0">
      {/* Hover lift is desktop-only: Tailwind v4 gates `hover:` behind
          (hover: hover), so on touch these sit at rest in text-muted. */}
      <span className="flex items-center gap-3 text-muted transition-colors duration-(--d-base) hover:text-fg">
        <span
          aria-hidden="true"
          className="block h-4 w-[3.75rem] bg-current [mask-size:contain] [mask-position:center] [mask-repeat:no-repeat]"
          style={{
            maskImage: `url(${brand.logo})`,
            WebkitMaskImage: `url(${brand.logo})`,
          }}
        />
        <span className="font-medium whitespace-nowrap">{brand.name}</span>
      </span>
    </li>
  );
}

export function Brands() {
  return (
    <section id="brands" aria-labelledby="brands-heading" className="py-16 md:py-24">
      <Container>
        <Reveal>
          <Eyebrow>Clients</Eyebrow>
          <h2 id="brands-heading" className="mt-6 max-w-[20ch]">
            Teams we&rsquo;ve shipped for.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className={cn(
              "mt-12 overflow-hidden rounded-lg border border-line bg-raised md:mt-16",
              // The fade width matches the track's padding, so names are never
              // dimmed at rest — only as they pass under the edge.
              "[mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%_-_1.5rem),transparent)]",
            )}
          >
            <div
              className={cn(
                "flex w-max motion-safe:animate-marquee",
                // Under reduce the track does not move, so it must stay
                // reachable by hand instead.
                "motion-reduce:w-full motion-reduce:overflow-x-auto motion-reduce:overscroll-x-contain",
              )}
            >
              {/* Two identical sets. The first carries the real list; the second
                  is a visual duplicate for the seam and is hidden from
                  assistive tech so no name is announced twice. */}
              <ul
                aria-labelledby="brands-heading"
                className="flex shrink-0 gap-10 px-6 py-6 md:gap-14 md:px-8"
              >
                {brands.map((brand) => (
                  <BrandItem key={brand.name} brand={brand} />
                ))}
              </ul>
              <ul
                aria-hidden="true"
                className="flex shrink-0 gap-10 px-6 py-6 md:gap-14 md:px-8"
              >
                {brands.map((brand) => (
                  <BrandItem key={`${brand.name}-dup`} brand={brand} />
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
