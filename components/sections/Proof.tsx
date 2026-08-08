import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatFigure } from "@/components/ui/StatFigure";
import { stats } from "@/lib/content";

/**
 * The proof strip (§6.1.3). Four numbers in the mono utility face, each
 * counting up once as the strip is reached.
 *
 * A server component: the count-up lives in <StatFigure />, its own client
 * module. Keeping it here would have made the whole section client and pulled
 * lib/content — and zod, and all eight JSON files — into the browser bundle.
 *
 * No accent anywhere in here: the hero CTA owns the page's single glowing
 * element for this stretch of scroll (§4.1), so the figures carry weight
 * through size and the mono face instead of colour.
 */
export function Proof() {
  return (
    <section id="proof" aria-labelledby="proof-heading" className="py-28 md:py-40">
      <Container>
        <Reveal>
          <Eyebrow index="01">Proof</Eyebrow>
          <h2 id="proof-heading" className="mt-6 max-w-[20ch]">
            Numbers from production, not from a deck.
          </h2>
        </Reveal>

        {/* Two columns at 360px: four figures across a phone would put a
            3.5rem mono number in a 70px column. Four only once there is room. */}
        <StaggerGroup
          as="ul"
          className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:mt-20 md:grid-cols-4"
        >
          {stats.map((stat) => (
            <StatFigure key={stat.label} stat={stat} />
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
