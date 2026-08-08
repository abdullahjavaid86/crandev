import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Stack tags and small metadata pills. Mono, because a stack label is machine
 * output. One of the two things allowed to be fully rounded (§4.4).
 */
export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line px-3 py-1",
        "font-mono text-small tracking-[0.18em] text-muted uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
