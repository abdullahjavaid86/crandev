import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { Project } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * The cover's rendered width. Mandatory: without it the browser assumes 100vw
 * at every breakpoint and a 360px phone downloads the desktop asset — the
 * single largest mobile perf mistake available to us (§4.7).
 *
 * Two cases, because the home grid has two. The default is the half-width
 * track shared by the home grid's ordinary cards, the `/work` index and the
 * detail modal; `featured` is the full-width row at the head of the home grid,
 * which tops out at the 1160px container inside a 1240px page.
 */
const COVER_SIZES = "(min-width: 768px) 50vw, 100vw";
const FEATURED_COVER_SIZES = "(min-width: 1280px) 1160px, 100vw";

interface ProjectCardProps {
  project: Project;
  /** The full-width lead card: a wider cover, same content. */
  featured?: boolean;
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
 * inside is interactive: the stack line is text and the arrow is decorative.
 * A "View case study" link next to a linked title would be two links to one
 * destination with two different names, which is what makes card grids
 * miserable to navigate by keyboard or screen reader.
 *
 * No accent anywhere: the hero CTA holds this page's one accent element
 * (§4.1), so the card signals interactivity with surface, border, and the
 * arrow instead of colour.
 */
export function ProjectCard({
  project,
  featured = false,
  className,
}: ProjectCardProps) {
  const { slug, client, cover, category, outcome, stack, year } = project;

  return (
    <Link href={`/work/${slug}`} className={cn("group block h-full", className)}>
      <Card
        glass
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
            also means no layout shift while it loads. The featured card only
            widens its box from md; the base ratio is the same in both, so
            nothing at a breakpoint undoes a base declaration. */}
        <div
          className={cn(
            "relative aspect-[16/10] w-full overflow-hidden border-b border-line bg-inset",
            featured && "md:aspect-[21/9]",
          )}
        >
          <Image
            src={cover}
            /* Honest about what it is. These are placeholder stock photos
               (see MILESTONES "Known gaps"), so the alt names the project the
               cover stands for rather than inventing a description of a
               dashboard nobody photographed. */
            alt={`Placeholder cover photograph for the ${client} project`}
            fill
            sizes={featured ? FEATURED_COVER_SIZES : COVER_SIZES}
            /* No `priority`: this section is below the fold on every route
               that renders it, and priority here would compete with the real
               LCP element for early bandwidth (§7.0). */
            className={cn(
              "object-cover",
              "transition-transform duration-(--d-base) ease-out-soft",
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

          <div className="flex items-start gap-4">
            <h3>{client}</h3>

            {/* The rest-state affordance. A phone gets no hover and no cursor
                change, so the card has to say it goes somewhere while sitting
                still. Not a link — the card already is one. */}
            <span
              aria-hidden="true"
              className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors duration-(--d-micro) group-hover:text-fg group-active:text-fg"
            >
              <ArrowUpRight className="size-4" />
            </span>
          </div>

          {/* The measurable result — the schema refuses an outcome with no
              digit in it, so this line always carries a real number (§8). */}
          <p className="text-muted">{outcome}</p>

          {/* One quiet line rather than a row of pills: the stack is context
              for the outcome above it, not four things to read separately. */}
          <p className="mt-auto pt-3 text-small text-muted">{stack.join(" · ")}</p>
        </div>
      </Card>
    </Link>
  );
}
