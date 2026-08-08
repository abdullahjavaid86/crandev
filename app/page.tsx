import { ShipLog, type ShipLogSection } from "@/components/layout/ShipLog";
import { Hero } from "@/components/sections/Hero";

/**
 * Side-effect import, deliberately. The zod schemas in lib/content only run
 * when something imports the loader, so dropping the M0.7 token proof — which
 * was the only importer — would have silently stopped validating every JSON
 * content file. This keeps malformed content a build failure until M3.3 wires
 * the work grid and imports `projects` for real.
 */
import "@/lib/content";

/**
 * Home. Composes sections and nothing else — it defines no markup of its own
 * beyond the rail's section list (§3).
 *
 * Replaces the M0.7 token proof, which did its job and is in git history if a
 * palette or type-scale reference is wanted again.
 *
 * The rail's list is explicit rather than collected at runtime, so each section
 * stays a server component (§4.5). Rows are added here as M3 lands.
 */
const SECTIONS: ShipLogSection[] = [{ id: "hero", label: "Intro" }];

export default function Home() {
  return (
    <>
      <ShipLog sections={SECTIONS} />
      <main>
        <Hero />
      </main>
    </>
  );
}
