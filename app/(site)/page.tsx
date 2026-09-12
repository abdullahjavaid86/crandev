import { StructuredData } from "@/components/layout/StructuredData";
import { Brands } from "@/components/sections/Brands";
import { Contact } from "@/components/sections/Contact";
import { CtaBand } from "@/components/sections/CtaBand";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Proof } from "@/components/sections/Proof";
import { Services } from "@/components/sections/Services";
import { Testimonials } from "@/components/sections/Testimonials";
import { Work } from "@/components/sections/Work";

/**
 * Home. Composes sections and nothing else — it declares no markup of its own
 * (§3).
 *
 * The CTA band is the repeated page ending rather than a section of the
 * argument, which is why it sits outside the run of numbered sections.
 *
 * lib/content needs no side-effect import here — Proof, Services, Work,
 * Testimonials, Brands and Process all import it directly, so the zod schemas
 * run at build regardless.
 */
export default function Home() {
  return (
    <main className="relative">
      {/* Machine-readable identity for search results. Server-rendered, no
          client cost, and holds only claims that are true today. */}
      <StructuredData />

      <Hero />
      <Proof />
      <Services />
      <Work />
      <Testimonials />
      <Brands />
      <Process />
      <Contact />
      <CtaBand />
    </main>
  );
}
