import { cn } from "@/lib/utils";

/**
 * The above-the-fold entrance. Same movement as <Reveal> — opacity, 24px of
 * travel, a blur that resolves — driven by CSS instead of motion.
 *
 * **This is a performance component, not a style one.** `Reveal` renders at
 * `opacity: 0` and animates once React has hydrated. LCP ignores an element at
 * zero opacity, so anything above the fold wrapped in `Reveal` cannot become
 * the LCP candidate until the JavaScript has downloaded, parsed and run. On
 * the deployed site that put the hero subcopy — the LCP element — at 2.36s
 * against a 0.93s FCP. None of that gap was network; the text was in the
 * server HTML the whole time, just invisible.
 *
 * A CSS animation starts at first paint, so the element is eligible for LCP
 * roughly a frame after it is painted, hydration or no hydration. It also
 * renders with JavaScript disabled, which `Reveal` does not.
 *
 * A SERVER component on purpose: no `'use client'`, so the hero's text costs
 * nothing in the client bundle.
 *
 * Use it above the fold. Below the fold use `Reveal` — it is scroll-triggered,
 * so it is never on the critical path, and motion's viewport handling earns
 * its place there.
 *
 * Reduced motion is handled globally: `globals.css` collapses animation
 * duration AND delay, so this lands at its final state immediately.
 */
interface RiseInProps extends React.ComponentProps<"div"> {
  /** Stagger, in seconds. Matches Reveal's `delay` prop. */
  delay?: number;
}

export function RiseIn({
  delay = 0,
  className,
  style,
  children,
  ...rest
}: RiseInProps) {
  return (
    <div
      className={cn("animate-rise-in", className)}
      // Inline because the value is per-instance. A Tailwind class cannot be
      // generated from a runtime number.
      style={delay ? { animationDelay: `${delay}s`, ...style } : style}
      {...rest}
    >
      {children}
    </div>
  );
}
