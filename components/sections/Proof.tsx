import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatFigure } from "@/components/ui/StatFigure";
import { stats } from "@/lib/content";

/**
 * The proof strip (§6.1.3). Four numbers on one banded surface, each counting
 * up once as the strip is reached.
 *
 * A server component: the count-up lives in <StatFigure />, its own client
 * module. Keeping it here would have made the whole section client and pulled
 * lib/content — and zod, and all eight JSON files — into the browser bundle.
 *
 * No accent anywhere in here: the hero CTA owns the page's single glowing
 * element for this stretch of scroll (§4.1), so the figures carry weight
 * through size and the banded surface instead of colour.
 */
export function Proof() {
  return (
    <section id="proof" aria-labelledby="proof-heading" className="py-16 md:py-24">
      <Container>
        <Reveal>
          <Eyebrow>Proof</Eyebrow>
          <h2 id="proof-heading" className="mt-6 max-w-[20ch]">
            Numbers from production, not from a deck.
          </h2>
        </Reveal>

        {/* One band, two columns at 360px: four figures across a phone would
            put an h2-sized number in a 70px column. Four only once there is
            room, and the dividers arrive with the fourth column — the base
            has none, so nothing at md undoes a base declaration. */}
        <StaggerGroup
          as="ul"
          className="mt-12 grid grid-cols-2 rounded-md border border-line bg-raised md:mt-16 md:grid-cols-4 md:divide-x md:divide-line md:glass"
        >
          {stats.map((stat) => (
            <StatFigure key={stat.label} stat={stat} />
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
