import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  /** Ship Log section number, e.g. "02". Rendered before the label. */
  index?: string;
}

/**
 * The mono utility face. Reads as machine output, which is the whole point —
 * it says "this shop reads logs" without the copy having to claim it.
 *
 * Real metadata only: section numbers, repo names, dates, stack labels,
 * latency figures. Never decoration on prose (§4.3).
 */
export function Eyebrow({ children, className, index }: EyebrowProps) {
  return (
    <p
      className={cn(
        "font-mono text-small uppercase tracking-[0.18em] text-mist",
        className,
      )}
    >
      {index ? (
        <>
          <span className="text-ice">{index}</span>
          <span aria-hidden="true"> / </span>
        </>
      ) : null}
      {children}
    </p>
  );
}
