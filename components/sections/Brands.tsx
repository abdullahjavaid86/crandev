import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { brands } from "@/lib/content";

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
 * Dimensions are still explicit (16px x 60px, the file's own 120x32 ratio), so
 * nothing shifts on load, and there is no image request per brand.
 *
 * Mobile: the row scrolls inside its own container with `overscroll-behavior-x:
 * contain`, so a horizontal swipe never chains to the page (§4.7). The edge
 * mask fades exactly the width of the strip's own padding, which means items
 * are never dimmed at rest — only as they scroll under the edge.
 *
 * A server component. No motion beyond the single reveal.
 */
export function Brands() {
  return (
    <section id="brands" aria-labelledby="brands-heading" className="py-28 md:py-40">
      <Container>
        <Reveal>
          <Eyebrow index="05">Clients</Eyebrow>
          <h2 id="brands-heading" className="mt-6 max-w-[20ch]">
            Teams we&rsquo;ve shipped for.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 rounded-lg border border-line bg-raised md:mt-16">
            {/* tabIndex makes the scroller reachable by keyboard — a scrollable
                region with no focusable child is otherwise unreadable without
                a pointer. */}
            <ul
              tabIndex={0}
              aria-labelledby="brands-heading"
              className="flex gap-8 overflow-x-auto overscroll-x-contain px-6 py-6 md:justify-between md:gap-10 md:px-8 [mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%_-_1.5rem),transparent)]"
            >
              {brands.map((brand) => (
                <li key={brand.name} className="shrink-0">
                  {/* Hover lift is desktop-only: Tailwind v4 gates `hover:`
                      behind (hover: hover), so on touch these sit at rest in
                      text-muted rather than sticking in a hover state. */}
                  <span className="flex items-center gap-3 text-muted transition-colors duration-[--d-base] hover:text-fg">
                    <span
                      aria-hidden="true"
                      className="block h-4 w-[3.75rem] bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
                      style={{
                        maskImage: `url(${brand.logo})`,
                        WebkitMaskImage: `url(${brand.logo})`,
                      }}
                    />
                    <span className="whitespace-nowrap font-medium">{brand.name}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
