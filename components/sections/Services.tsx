import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { services } from "@/lib/content";
import { ServiceList } from "./ServiceList";

/**
 * Services (§6.1.4). Four engagements as a plain vertical list of glass rows.
 *
 * There is no sticky card stack. Stacking cards read as template chrome, and
 * the scroll hijack it needs is the loudest thing on a page whose argument is
 * "we ship" — the list says the same four things in the order the reader
 * chooses.
 *
 * Mobile first (§4.7): one column with the heading above the list is the base.
 * `lg:` adds the two-column split and pins the heading; nothing at a
 * breakpoint undoes a base declaration.
 *
 * A server component — the stagger inside <ServiceList /> is the one client
 * leaf, which keeps lib/content and zod out of the browser bundle.
 *
 * No accent in here — the hero CTA holds it for this stretch of scroll.
 */
export function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="py-16 md:py-24"
    >
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* The heading rides alongside the list on a wide screen, so the
              reader keeps the question in view while reading the answers. */}
          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <Reveal>
              <Eyebrow>Services</Eyebrow>
              <h2 id="services-heading" className="mt-6 max-w-[24ch]">
                How we work, and what each engagement leaves you with.
              </h2>
              <p className="mt-6 max-w-[40ch] text-muted">
                Four ways to engage. Each one ends with something you own and can run
                without us.
              </p>
            </Reveal>
          </div>

          <div className="mt-12 lg:col-span-7 lg:mt-0">
            <ServiceList services={services} />
          </div>
        </div>
      </Container>
    </section>
  );
}
