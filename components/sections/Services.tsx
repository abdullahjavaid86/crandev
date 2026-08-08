import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { services } from "@/lib/content";
import { ServiceStack } from "./ServiceStack";

/**
 * Services (§6.1.4) — the card-stacking section.
 *
 * The base case, and the thing to judge it by, is a plain vertical list of
 * cards with one `<Reveal />` each, complete on its own at 360px. Sticky
 * stacking is layered on at `lg` and nowhere else (§5.2): stacking in a 700px
 * viewport is unusable, so it is never the thing written first.
 *
 * A server component. The scroll read lives in <ServiceStack />, its own
 * client module, which keeps lib/content and zod out of the browser bundle.
 *
 * No accent in here — the hero CTA holds it for this stretch of scroll.
 */
export function Services() {
  return (
    <section id="services" aria-labelledby="services-heading" className="py-16 md:py-24">
      <Container>
        <Reveal>
          <Eyebrow index="02">Services</Eyebrow>
          <h2 id="services-heading" className="mt-6 max-w-[24ch]">
            How we work, and what each engagement leaves you with.
          </h2>
        </Reveal>

        {/*
          Base: a plain vertical list, gap-6, nothing sticky.
          lg adds the stack. The 12rem gap is not decorative — with cards
          sticking at top-24 (96px), a gap of ~2x that offset is what makes the
          even `index/total` progress slices land on the real hand-off points,
          whatever the cards' heights turn out to be.
        */}
        <ServiceStack
          services={services}
          className="mt-14 flex flex-col gap-6 md:mt-20 lg:gap-48"
        />
      </Container>
    </section>
  );
}
