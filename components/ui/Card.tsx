import { cn } from "@/lib/utils";

interface CardProps extends React.ComponentProps<"div"> {
  /** Glass costs a backdrop-filter, so it only applies from md up (§4.2). */
  glass?: boolean;
}

/**
 * The one surface. Solid `bg-raised` by default; `glass` adds the recipe at
 * md and up. The 1px `border-line` frame lightens to `border-line-strong`
 * on hover (pointer only — Tailwind v4 wraps hover: in (hover: hover)) and
 * on :active for touch. No scale, no translate, no accent.
 */
export function Card({ glass = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-line",
        "transition-colors duration-(--d-base) ease-out-soft",
        "hover:border-line-strong active:border-line-strong",
        glass ? "bg-raised md:glass" : "bg-raised",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
