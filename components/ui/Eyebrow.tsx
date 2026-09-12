import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

/** A small, quiet label above a heading. Sans, sentence case — never mono. */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p className={cn("text-small font-medium text-muted", className)}>{children}</p>
  );
}
