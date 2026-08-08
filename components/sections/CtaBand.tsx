import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { primaryCta } from "@/lib/nav";

/**
 * The closing band, one per page, directly above the footer. This is the only
 * section allowed to take the accent (§4.1), and it spends it on a single
 * element: the CTA.
 *
 * The label and href come from `lib/nav` so the action keeps its name through
 * the whole flow — button, page title, confirmation (§8). Hardcoding "Book a
 * call" here is how those three drift apart.
 *
 * No Eyebrow: this is not a numbered section on the Ship Log rail.
 *
 * A server component; `Reveal` is the only client leaf.
 */
export function CtaBand() {
  return (
    <section id="cta" aria-labelledby="cta-heading" className="py-16 md:py-24">
      <Container>
        <Reveal>
          <div className="rounded-lg border border-line bg-raised p-8 md:p-16">
            <h2 id="cta-heading" className="max-w-[18ch]">
              Talk to the people who would do the work.
            </h2>

            <p className="mt-5 max-w-[52ch] text-muted">
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
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
