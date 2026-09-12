import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { process } from "@/lib/content";

/**
 * The four steps, in order. This is the one place numbering is legitimate —
 * the steps are genuinely sequential, so the numerals describe the work rather
 * than decorating it (§6.1 item 8). The number comes from the array index, so
 * it can never drift from the content.
 *
 * There is no drawn rail. A self-assembling timeline is template chrome: it
 * animates the page's furniture rather than its argument, and the `<ol>` below
 * already carries the sequence natively — which is why the visible numeral is
 * `aria-hidden` and never announced twice.
 *
 * Solid cards, not glass: this stretch of the page already spends its blur
 * budget on the work grid and the testimonials above it (§4.2).
 *
 * A server component; the stagger inside is the one client leaf, so
 * lib/content never reaches the browser bundle.
 */
export function Process() {
  return (
    <section id="process" aria-labelledby="process-heading" className="py-16 md:py-24">
      <Container>
        <Reveal>
          <Eyebrow>Process</Eyebrow>
          <h2 id="process-heading" className="mt-6 max-w-[20ch]">
            How a project runs.
          </h2>
        </Reveal>

        <StaggerGroup as="ol" className="mt-12 grid gap-5 md:mt-16 md:grid-cols-2">
          {process.map((step, i) => (
            <StaggerItem key={step.slug} as="li">
              <Card className="h-full p-6 md:p-8">
                <p
                  aria-hidden="true"
                  className="font-display text-h2 leading-none font-light text-muted"
                >
                  {i + 1}
                </p>
                <h3 className="mt-6">{step.title}</h3>
                <p className="mt-1 text-small text-muted">{step.duration}</p>
                <p className="mt-3 text-muted">{step.detail}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
