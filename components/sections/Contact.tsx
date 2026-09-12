import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ContactForm } from "./ContactForm";

/**
 * Contact (§6.1 item 10). A server component; the form is a client leaf.
 *
 * No accent in this section — the CTA band below it owns the page's one
 * accent element, and the form's own submit button already carries the
 * primary variant, which is the single glowing thing in this viewport.
 */
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="py-16 md:py-24">
      <Container>
        <div className="md:max-w-[65ch]">
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
          </Reveal>

          <Reveal delay={0.1}>
            <ContactForm className="mt-12 md:mt-14" />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
