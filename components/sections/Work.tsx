import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { projects } from "@/lib/content";

/**
 * DRAFT COPY (tracked with the rest of D2). Written to §8 — no adjective doing
 * a number's job — and deliberately claiming nothing the cards don't already
 * evidence. The counts stay out of the headline so it survives a sixth or a
 * fourth project.
 */
const HEADLINE = "Systems we built, and the numbers that moved.";

const SUBCOPY =
  "Every card opens the same three lines: the problem, what we built, and what it measured afterwards.";

/**
 * The work grid (§6.1 item 5). A server component that composes — it defines
 * no primitives of its own, because `/work` and the detail modal render the
 * same `ProjectCard` (§10).
 *
 * Mobile first (§4.7): one column is the base implementation, `md:` only adds
 * the second track and the lead card's full-width span. Two columns, never
 * three — a third track on a single-column page makes each cover too small to
 * carry the photograph it is there for.
 *
 * One orchestrated moment: the heading block reveals, then the grid staggers.
 * `StaggerGroup` owns the viewport trigger; the cards carry no `whileInView`
 * of their own (§5.2).
 *
 * No accent in this section — the hero CTA is the page's one accent element,
 * and a second glow means neither reads (§4.1).
 */
export function Work() {
  return (
    <section id="work" aria-labelledby="work-heading" className="py-16 md:py-24">
      <Container>
        <Reveal>
          <Eyebrow>Selected work</Eyebrow>
          <h2 id="work-heading" className="mt-6 max-w-[20ch]">
            {HEADLINE}
          </h2>
          <p className="mt-6 max-w-[58ch] text-muted">{SUBCOPY}</p>
        </Reveal>

        <StaggerGroup
          as="ul"
          className="mt-12 grid grid-cols-1 gap-5 md:mt-16 md:grid-cols-2"
        >
          {projects.map((project, index) => (
            <StaggerItem
              key={project.slug}
              as="li"
              className={index === 0 ? "h-full md:col-span-2" : "h-full"}
            >
              <ProjectCard project={project} featured={index === 0} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* The grid shows a selection; this is where the rest of it lives. */}
        <div className="mt-10 flex justify-center">
          <Link href="/work" className={buttonStyles("secondary", "md")}>
            All work
          </Link>
        </div>
      </Container>
    </section>
  );
}
