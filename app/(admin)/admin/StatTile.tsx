import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils";

/**
 * One figure on the admin dashboard.
 *
 * A server component. `Card` is the only client boundary underneath, and
 * rendering a client component from the server is fine — what is not fine is
 * *calling* an export of a client module, which is why the linked variant uses
 * `next/link` + the card rather than anything from `Button.tsx`.
 *
 * Deliberately NOT `StatFigure`: that one counts up on scroll into view, which
 * is right for a marketing proof strip and wrong here. This is a tool. The
 * number is correct on the first paint, with no JS, and never performs.
 *
 * The figure is mono because a count is machine output (§4.3). The empty label
 * is not — "Nothing waiting" is a state, not a reading, and setting it in the
 * body face is what keeps it from being mistaken for one.
 */

/** Fixed locale so the thousands separator can never depend on the server's. */
const figureFormat = new Intl.NumberFormat("en-US");

export type StatTileSize = "lead" | "compact" | "wide";

/**
 * Padding, figure size and inner flow live in three maps rather than one
 * blob, because `cn()` joins rather than merges — two maps that both set a
 * padding would resolve by stylesheet order, not argument order (§10).
 */
const paddings: Record<StatTileSize, string> = {
  lead: "p-5 md:p-6",
  compact: "p-4 md:p-5",
  wide: "p-5 md:p-6",
};

const figures: Record<StatTileSize, string> = {
  lead: "text-h2",
  compact: "text-h3",
  wide: "text-h2",
};

/** Only `wide` spends horizontal room; the base case is the phone stack. */
const flows: Record<StatTileSize, string> = {
  lead: "",
  compact: "",
  wide: "md:flex-row md:items-end md:justify-between md:gap-10",
};

interface StatTileProps {
  /** Mono, uppercase. Short — it is a column name, not a sentence. */
  label: string;
  /**
   * The count. `null` means "this figure does not apply right now" — it is a
   * real state and is rendered as `emptyLabel`, never as zero. A genuine zero
   * is a number and renders as `0`.
   */
  value: number | null;
  /** Suffix on the figure, e.g. "days". Already pluralised by the caller. */
  unit?: string;
  /** What to show when `value` is null. */
  emptyLabel?: string;
  /** One line of context under the figure. */
  hint?: string;
  /** Makes the whole tile a link. */
  href?: string;
  /** Rest-state affordance text for the linked variant. */
  action?: string;
  size?: StatTileSize;
  className?: string;
}

export function StatTile({
  label,
  value,
  unit,
  emptyLabel = "None",
  hint,
  href,
  action = "Open",
  size = "lead",
  className,
}: StatTileProps) {
  const card = (
    <Card
      /* The cursor light is an affordance here, so it belongs only on the
         tiles that actually go somewhere. On a static figure it invites a
         click that does nothing. */
      highlight={href !== undefined}
      className={cn("h-full", paddings[size], className)}
    >
      <div className={cn("flex h-full flex-col gap-3", flows[size])}>
        <div>
          <Eyebrow>{label}</Eyebrow>

          {value === null ? (
            <p className="mt-3 text-h3 leading-tight text-fg">{emptyLabel}</p>
          ) : (
            <p
              className={cn(
                "mt-3 font-mono leading-none text-fg tabular-nums",
                figures[size],
              )}
            >
              {figureFormat.format(value)}
              {unit ? <span className="ml-2 text-h3 text-muted">{unit}</span> : null}
            </p>
          )}
        </div>

        {hint ? <p className="max-w-[52ch] text-small text-muted">{hint}</p> : null}

        {href ? (
          /* Touch has no hover and no cursor change, so the tile has to say
             it goes somewhere while sitting still (§4.7). Not a link — the
             tile already is one, and a second anchor to the same place is
             what makes card grids miserable to navigate. */
          <span
            className={cn(
              "mt-auto inline-flex items-center gap-2 pt-1",
              "font-mono text-small tracking-[0.18em] text-muted uppercase",
              "transition-colors duration-(--d-micro)",
              "group-hover:text-fg group-active:text-fg",
            )}
          >
            {action}
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform duration-(--d-micro) ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        ) : null}
      </div>
    </Card>
  );

  if (href === undefined) return card;

  return (
    <Link href={href} className="group block h-full rounded-md">
      {card}
    </Link>
  );
}
