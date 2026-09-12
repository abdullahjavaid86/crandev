import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { Card } from "@/components/ui/Card";
import { primaryCta } from "@/lib/nav";

/**
 * The closing band, one per page, directly above the footer. This is the only
 * section allowed to take the accent (§4.1), and it spends it on a single
 * element: the CTA.
 *
 * Centred on the one surface the rest of the page uses, rather than a raw
 * bordered div — there is one card recipe and this is not the exception.
 *
 * The label and href come from `lib/nav` so the action keeps its name through
 * the whole flow — button, page title, confirmation (§8). Hardcoding "Book a
 * call" here is how those three drift apart.
 *
 * No Eyebrow: this is the page's ending, not one of its sections.
 *
 * A server component; `Reveal` is the only client leaf.
 */
export function CtaBand() {
  return (
    <section id="cta" aria-labelledby="cta-heading" className="py-16 md:py-24">
      <Container>
        <Reveal>
          <Card glass className="p-8 text-center md:p-16">
            <h2 id="cta-heading" className="mx-auto max-w-[18ch]">
              Talk to the people who would do the work.
            </h2>

            <p className="mx-auto mt-5 max-w-[48ch] text-muted">
              Bring the system you already have. We will tell you where we would start,
              what we would leave alone, and how long the first release takes.
            </p>

            {/* The page's single accent element. */}
            <Link
              href={primaryCta.href}
              className={buttonStyles("primary", "md", "mt-10")}
            >
              {primaryCta.label}
            </Link>
          </Card>
        </Reveal>
      </Container>
    </section>
  );
}
