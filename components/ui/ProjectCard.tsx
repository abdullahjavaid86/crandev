import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { Project } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * The cover's rendered width in the 1 / 2 / 3-column project track shared by
 * the home grid (M3.3) and `/work` (M5.1). Mandatory: without it the browser
 * assumes 100vw at every breakpoint and a 360px phone downloads the desktop
 * asset — the single largest mobile perf mistake available to us (§4.7).
 */
const COVER_SIZES = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

/**
 * One case study, as a card. Lives in `ui/` rather than inside the Work
 * section because `/work` (M5.1) and the intercepted detail modal (M5.2) both
 * render the same card — §10, one component, no near-copy that drifts on the
 * next hover tweak.
 *
 * A server component. `Card` is the only client boundary underneath, and
 * rendering a client component from the server is fine — what is not fine is
 * *calling* an export of a client module, which is why nothing here imports
 * from `Button.tsx`.
 *
 * **One link per card.** The whole card is the anchor, so its accessible name
 * is the content itself and there is no second control to tab past. Nothing
 * inside is interactive: the stack tags are spans and the arrow is decorative.
 * A "View case study" link next to a linked title would be two links to one
 * destination with two different names, which is what makes card grids
 * miserable to navigate by keyboard or screen reader.
 *
 * No accent anywhere: the hero CTA holds this page's one accent element
 * (§4.1), so the card signals interactivity with surface, border, and the mono
 * affordance line instead of colour.
 */
export function ProjectCard({ project, className }: ProjectCardProps) {
  const { slug, client, cover, category, outcome, stack, year } = project;

  return (
    <Link href={`/work/${slug}`} className={cn("group block h-full", className)}>
      <Card
        className={cn(
          "flex h-full flex-col",
          // Touch has no hover (§4.7). Tailwind v4 wraps `hover:` in
          // @media (hover: hover), so `group-active:` is what a tap gets —
          // and the card is already legible as a link at rest without either.
          "group-active:border-line-strong",
        )}
      >
        {/* Positioned wrapper is what `fill` needs, and the overflow clip is
            what the scale-on-hover is allowed to grow into. `cover` is a
            remote URL, so this cannot be a static import and there is no
            intrinsic size to infer — hence fill + a fixed aspect box, which
            also means no layout shift while it loads. */}
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line bg-inset">
          <Image
            src={cover}
            /* Honest about what it is. These are placeholder stock photos
               (see MILESTONES "Known gaps"), so the alt names the project the
               cover stands for rather than inventing a description of a
               dashboard nobody photographed. */
            alt={`Placeholder cover photograph for the ${client} project`}
            fill
            sizes={COVER_SIZES}
            /* No `priority`: this section is below the fold on every route
               that renders it, and priority here would compete with the real
               LCP element for early bandwidth (§7.0). */
            className={cn(
              "object-cover",
              "transition-transform duration-[--d-base] ease-out-soft",
              "group-hover:scale-[1.04] group-active:scale-[1.04]",
            )}
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
          <Eyebrow>
            {category}
            <span aria-hidden="true"> · </span>
            {year}
          </Eyebrow>

          <h3>{client}</h3>

          {/* The measurable result — the schema refuses an outcome with no
              digit in it, so this line always carries a real number (§8). */}
          <p className="text-muted">{outcome}</p>

          <div className="mt-auto flex flex-wrap gap-2 pt-3">
            {stack.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>

          {/* The rest-state affordance. A phone gets no hover and no cursor
              change, so the card has to say it goes somewhere while sitting
              still. Not a link — the card already is one. */}
          <span
            className={cn(
              "inline-flex items-center gap-2 pt-1",
              "font-mono text-small uppercase tracking-[0.18em] text-muted",
              "transition-colors duration-[--d-micro]",
              "group-hover:text-fg group-active:text-fg",
            )}
          >
            Read the case study
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform duration-[--d-micro] ease-out-soft group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </Card>
    </Link>
  );
}
