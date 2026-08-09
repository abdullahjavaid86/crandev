import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The portal's mark. Shared by the rail and the mobile bar so the two cannot
 * drift apart.
 *
 * The lettermark stays at a fixed size and never collapses — it is what the
 * rail looks like at 4.5rem, and it doubles as the "back to the dashboard"
 * target. Only the wordmark beside it goes screen-reader-only.
 */
export function AdminWordmark({
  collapsible = false,
  className,
}: {
  collapsible?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/admin"
      className={cn(
        "flex min-h-11 items-center gap-2.5 rounded-md",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-md bg-accent font-display text-body font-semibold text-accent-on"
      >
        C
      </span>
      <span
        className={cn("flex min-w-0 flex-col", collapsible && "rail-icons:sr-only")}
      >
        <span className="truncate font-display text-body font-semibold tracking-[-0.02em] text-fg">
          CraneDev
        </span>
        <span className="font-mono text-small tracking-[0.18em] text-muted uppercase">
          Admin
        </span>
      </span>
    </Link>
  );
}
