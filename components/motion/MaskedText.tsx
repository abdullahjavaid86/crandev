import { cn } from "@/lib/utils";

interface MaskedTextProps {
  /**
   * One entry per visual line. Splitting is the author's call, not measured
   * at runtime — a resize observer that re-splits mid-animation thrashes
   * layout, and headlines here are short enough to line-break deliberately.
   */
  lines: string[];
  className?: string;
  as?: "h1" | "h2" | "p";
  /** Forwarded to the heading element, so a section's `aria-labelledby` has
   *  something to point at. */
  id?: string;
}

/**
 * Headline reveal: each line sits in an overflow-hidden box and rises from
 * 110% to 0.
 *
 * Split by LINE, never by character (§5.2). Per-character splitting on a 60px
 * headline is a gimmick, it costs layout thrash, and it hands screen readers a
 * pile of disconnected letters.
 *
 * **CSS-driven, and a server component.** This used to animate through motion,
 * which meant the headline was clipped out of sight until React hydrated —
 * the single largest piece of text on the page, invisible for over a second
 * on a mid-range device, and invisible entirely without JavaScript. A CSS
 * animation starts at first paint instead, and the whole headline now costs
 * nothing in the client bundle.
 *
 * The lines animate `transform` only, never opacity. That is deliberate: an
 * element at `opacity: 0` is ignored for LCP, whereas a translated one is
 * measured from the first frame it paints.
 *
 * Reserved for the hero plus at most one section headline per page. Reduced
 * motion is handled globally in `globals.css`, which collapses both duration
 * and delay, so the lines simply appear in place.
 */
export function MaskedText({ lines, className, as = "h2", id }: MaskedTextProps) {
  const Heading = as;

  return (
    <Heading id={id} className={cn(className)}>
      {/* The full string stays available to assistive tech as one phrase; the
          animated spans are decorative duplicates. */}
      <span className="sr-only">{lines.join(" ")}</span>

      <span aria-hidden="true" className="block">
        {lines.map((line, i) => (
          // Padding gives descenders room; without it the mask clips a "g".
          <span key={line} className="block overflow-hidden pb-[0.12em]">
            <span
              className="block animate-line-in"
              // 0.08s stagger, matching §5.1. Per-instance, so it cannot be a
              // Tailwind class.
              style={i ? { animationDelay: `${i * 0.08}s` } : undefined}
            >
              {line}
            </span>
          </span>
        ))}
      </span>
    </Heading>
  );
}
