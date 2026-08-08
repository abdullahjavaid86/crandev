import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
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
 * Base is a plain vertical list. At md a connecting line in `border-line` runs
 * down the left with a node per step: the padding lives inside the bordered
 * element, so the line is continuous rather than dashed by gaps.
 *
 * A server component. One `Reveal` per step, each firing as it enters.
 */
export function Process() {
  return (
    <section id="process" aria-labelledby="process-heading" className="py-16 md:py-24">
      <Container>
        <Reveal>
          <Eyebrow index="06">Process</Eyebrow>
          <h2 id="process-heading" className="mt-6 max-w-[20ch]">
            How a project runs.
          </h2>
        </Reveal>

        <ol className="mt-14 md:mt-20">
          {process.map((step, i) => (
            <li
              key={step.slug}
              className="relative pb-12 last:pb-0 md:border-l md:border-line md:pb-16 md:pl-10 md:before:absolute md:before:-left-1 md:before:top-2 md:before:size-2 md:before:rounded-full md:before:bg-line-strong md:before:content-['']"
            >
              <Reveal>
                <p className="flex items-baseline gap-4 font-mono text-small uppercase tracking-[0.18em]">
                  <span className="text-fg">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-muted">{step.duration}</span>
                </p>

                <h3 className="mt-4 text-fg">{step.title}</h3>

                <p className="mt-3 max-w-[60ch] text-muted">{step.detail}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
