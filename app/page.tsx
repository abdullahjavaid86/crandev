import { ShipLog, type ShipLogSection } from "@/components/layout/ShipLog";
import { Brands } from "@/components/sections/Brands";
import { CtaBand } from "@/components/sections/CtaBand";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Proof } from "@/components/sections/Proof";
import { Services } from "@/components/sections/Services";
import { Testimonials } from "@/components/sections/Testimonials";
import { Work } from "@/components/sections/Work";

/**
 * Home. Composes sections and nothing else — it declares no markup of its own
 * beyond the rail's section list (§3).
 *
 * The rail's list is explicit rather than collected at runtime, which is what
 * lets every section stay a server component (§4.5). Its ids and order must
 * match the sections below, and the Eyebrow index inside each section.
 *
 * The CTA band is not a rail entry: it is a repeated page ending, not a
 * numbered part of the argument.
 *
 * lib/content no longer needs a side-effect import here — Proof, Services,
 * Work, Testimonials, Brands and Process all import it directly, so the zod
 * schemas run at build regardless.
 */
const SECTIONS: ShipLogSection[] = [
  { id: "hero", label: "Intro" },
  { id: "proof", label: "Proof" },
  { id: "services", label: "Services" },
  { id: "work", label: "Work" },
  { id: "testimonials", label: "Clients" },
  { id: "brands", label: "Teams" },
  { id: "process", label: "Process" },
];

export default function Home() {
  return (
    <main className="relative">
      {/*
        The rail lives inside <main> so its sticky container spans exactly the
        content area and nothing else. Absolutely positioned and zero-width, so
        it occupies the gutter without taking part in the layout, and hidden
        below lg where there is no gutter to occupy.
      */}
      <div
        className="pointer-events-none absolute inset-y-0 left-4 z-30 hidden w-0 lg:block"
      >
        <div className="pointer-events-auto h-full">
          <ShipLog sections={SECTIONS} />
        </div>
      </div>

      <Hero />
      <Proof />
      <Services />
      <Work />
      <Testimonials />
      <Brands />
      <Process />
      <CtaBand />
    </main>
  );
}
