import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Stack tags and small metadata pills. Sans, sentence case. One of the two
 * things allowed to be fully rounded (§4.4).
 */
export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-inset px-2.5 py-0.5",
        "text-small text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
