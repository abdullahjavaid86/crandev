import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { siteLinks } from "@/lib/nav";
import { ContactForm } from "./ContactForm";

/**
 * Contact (§6.1 item 10). A server component; the form is a client leaf.
 *
 * Mobile first (§4.7): the pitch stacks above the form, and `lg:` only adds
 * the two-column split. The mail address sits with the pitch because some
 * readers will never use the form — it comes from `lib/nav` so it cannot
 * drift from the copy in the footer.
 *
 * No accent in this section — the CTA band below it owns the page's one
 * accent element, and the form's own submit button already carries the
 * primary variant, which is the single glowing thing in this viewport.
 */
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="py-16 md:py-24">
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow>Contact</Eyebrow>
              <h2 id="contact-heading" className="mt-6 max-w-[22ch]">
                Tell us what you are building.
              </h2>
              <p className="mt-6 max-w-[60ch] text-muted">
                You will get a reply from someone who would work on it, within one
                business day. If it is not a fit we will say so and point you somewhere
                better.
              </p>
              <a
                href={`mailto:${siteLinks.email}`}
                className="mt-6 inline-flex min-h-11 items-center text-small font-medium text-fg"
              >
                {siteLinks.email}
              </a>
            </Reveal>
          </div>

          <div className="mt-12 lg:col-span-7 lg:mt-0">
            <Reveal delay={0.1}>
              <Card glass className="p-6 md:p-8">
                <ContactForm />
              </Card>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
