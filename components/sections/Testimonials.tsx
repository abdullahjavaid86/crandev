import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { testimonials } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Three attributed quotes. Attribution is the whole point — an unattributed
 * quote reads as fabricated to exactly this audience (§6.1 item 6), so the
 * name, role, and company are always visible, never a hover reveal.
 *
 * `<figure>` wrapping `<blockquote>` + `<figcaption><cite>` is the pattern the
 * HTML spec recommends: `<cite>` inside the blockquote would mean "the title of
 * the work being quoted", not "the person who said it".
 *
 * No star ratings and no auto-advancing carousel. One column at base, two at
 * md with the first quote spanning both and set larger — the lead quote is the
 * one worth reading slowly, and three equal columns gave none of them weight.
 *
 * A server component; the stagger is the one client leaf.
 */
export function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="py-16 md:py-24"
    >
      <Container>
        <Reveal>
          <Eyebrow>Testimonials</Eyebrow>
          <h2 id="testimonials-heading" className="mt-6 max-w-[20ch]">
            What clients say after we hand over.
          </h2>
        </Reveal>

        <StaggerGroup as="ul" className="mt-12 grid gap-5 md:mt-16 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <StaggerItem
              as="li"
              key={`${testimonial.company}-${testimonial.name}`}
              className={index === 0 ? "md:col-span-2" : undefined}
            >
              <Card glass className="h-full p-6 md:p-8">
                <figure className="flex h-full flex-col">
                  {/* grow, not md:mt-auto on the caption: the attribution sits
                      at the card's foot when a grid row stretches it, without a
                      breakpoint overriding a base margin. */}
                  <blockquote className="grow text-fg">
                    <p
                      className={cn(
                        index === 0
                          ? "max-w-[40ch] text-h3 leading-snug font-medium"
                          : "max-w-[46ch]",
                      )}
                    >
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                  </blockquote>

                  <figcaption className="mt-6 border-t border-line pt-5">
                    <cite className="not-italic">
                      <span className="block font-medium text-fg">
                        {testimonial.name}
                      </span>
                      <span className="mt-1 block text-small text-muted">
                        {testimonial.role}, {testimonial.company}
                      </span>
                    </cite>
                  </figcaption>
                </figure>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
