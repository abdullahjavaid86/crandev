import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { process } from "@/lib/content";

/**
 * The four steps, in order. This is the one place numbering is legitimate —
 * the steps are genuinely sequential, so `01 → 04` describes the work rather
 * than decorating it (§6.1 item 8). The number comes from the array index, so
 * it can never drift from the content.
 *
 * `duration` is real metadata, so it takes the mono utility face. The titles
 * and details do not — mono on prose is decoration (§4.3).
 *
 * Base is a plain vertical list. At md a connecting line in `--line` runs down
 * the left with a node per step, and it draws itself as the section arrives —
 * see ProcessTimeline, which is the only client module here.
 *
 * A server component: the steps are read here and handed down as a prop, so
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

        <ProcessTimeline steps={process} className="mt-14 md:mt-20" />
      </Container>
    </section>
  );
}
