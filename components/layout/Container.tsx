import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Render as something other than a div when the semantics call for it. */
  as?: "div" | "section" | "header" | "footer" | "nav" | "main";
}

/**
 * The one horizontal rhythm. Every section's content sits inside this —
 * a section that sets its own max-width or padding is drifting from §4.4.
 *
 * Padding is mobile-first: 24px is the base, 40px is the enhancement.
 */
export function Container({ children, className, as: Tag = "div" }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full max-w-[1240px] px-6 md:px-10", className)}>
      {children}
    </Tag>
  );
}
