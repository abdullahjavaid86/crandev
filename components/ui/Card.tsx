"use client";

import { useCallback, useRef } from "react";
import { useHasHover } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface CardProps extends React.ComponentProps<"div"> {
  /** Glass costs a backdrop-filter — 2 per viewport below md (§4.2). */
  glass?: boolean;
  /** Cursor-following highlight. Desktop pointers only. */
  highlight?: boolean;
}

export function Card({
  glass = false,
  highlight = false,
  className,
  children,
  ...props
}: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number>(0);
  const hasHover = useHasHover();

  /**
   * Writes pointer position to CSS vars, throttled to one write per frame
   * (§5.3). Reading layout on every mousemove is what makes this pattern
   * janky; rAF collapses a burst of events into a single paint.
   */
  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const { clientX, clientY } = e;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${clientX - rect.left}px`);
        el.style.setProperty("--my", `${clientY - rect.top}px`);
      });
    },
    [],
  );

  const wantsHighlight = highlight && hasHover;

  return (
    <div
      ref={ref}
      onMouseMove={wantsHighlight ? onMouseMove : undefined}
      className={cn(
        "relative overflow-hidden rounded-md border border-line",

        /*
          Hover glow (§5.3). The box-shadow geometry is written ONCE and never
          changes; hover only swaps the two colours the layers are drawn in.
          That keeps the states structurally identical, so the transition
          interpolates a well-formed two-layer shadow rather than re-deriving
          lengths — and it makes "no accent at rest" literal rather than a
          judgement call, both resting colours being `transparent`.

          (Why the tint is a variable *inside* the mix rather than the mix
          being the variable: Tailwind emits a no-`color-mix` fallback that
          keeps the mix's first colour undiluted. Written the other way round
          that fallback is a full-alpha neon ring on every card, at rest, on
          any pre-2023 engine. Mixing from a var that is `transparent` until
          hover makes the fallback degrade to exactly the right thing —
          nothing at rest, and at worst an over-eager glow while a pointer is
          actually on the card.)

          Two layers, because a glow does not survive a theme swap by symmetry
          (§4.0) — this is the mistake the scroll-background already shipped:

          - The bloom mixes `--accent-ink`, the accent role themed for
            legibility rather than fill. On dark that token IS the signature
            cyan, so the bloom LIGHTENS. On light it is the darkened teal
            `#0A6B5E`, so the identical declaration reads as a soft tinted
            shadow that DARKENS — which is the only thing that registers on
            `#FAFBFC`. One declaration, opposite behaviours, no JS theme read.
          - The depth layer is `--glass-drop`, already themed for this: real
            shadow on light, near-nothing on dark where the bloom carries it.

          On accent discipline (§4.1): the tint exists only while a real
          pointer is over the card and returns to `transparent` on mouse-out,
          so no card ever holds an accent at rest and the CTA keeps the one
          accent element in its stretch of scroll. It also stays a diffuse
          outer bloom rather than an edge the eye reads as a ring — the
          border still lightens to the neutral `--line-strong`, because borders
          take the accent on `:focus-visible` and the active nav item, nowhere
          else.
        */
        "[--glow-tint:transparent] [--glow-depth:transparent]",
        "[box-shadow:0_0_40px_-8px_color-mix(in_srgb,var(--glow-tint)_30%,transparent),0_18px_44px_-20px_var(--glow-depth)]",
        /*
          `duration-(--d-base)` — PARENTHESES, not brackets. Tailwind v4's
          bracket form takes the contents as a literal value, so
          `duration-[--d-base]` emits `transition-duration: --d-base`, which is
          invalid, drops to the initial value, and gives you 0s. Measured, not
          assumed: computed `transitionDuration` was `0s` with the bracket form
          and `500ms` with this one. The parenthesis form is the var shorthand.
          Timing is still `--d-base` / `--e-out`, i.e. `dur.base` + `ease.out`
          from lib/motion.ts (§5).
        */
        "transition-[border-color,box-shadow] duration-(--d-base) ease-out-soft",

        /*
          Tailwind v4 wraps `hover:` in `@media (hover: hover)`, so the glow is
          pointer-only for free and a phone never pays for it. It is decoration
          on top of a card that is already legible and — where the card is a
          link — already carries its own rest-state affordance and
          `group-active:` feedback (§4.7). Nothing here is load-bearing.

          Reduced motion is handled by the global floor in globals.css, which
          forces `transition-duration` to 0.01ms: the glow still appears, it
          just stops animating. That is the right answer for a state change —
          suppressing it entirely would remove hover feedback, not motion.
        */
        "hover:border-line-strong",
        "hover:[--glow-tint:var(--accent-ink)] hover:[--glow-depth:var(--glass-drop)]",

        glass
          ? "bg-[linear-gradient(148deg,var(--glass-tint),var(--glass-tint-soft))] md:backdrop-blur-[20px] md:backdrop-saturate-[140%]"
          : "bg-raised",
        className,
      )}
      {...props}
    >
      {wantsHighlight ? (
        <div
          aria-hidden="true"
          /* Same bracket-vs-parenthesis fix as the card's own transition. */
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-(--d-base) [background:radial-gradient(240px_circle_at_var(--mx)_var(--my),color-mix(in_srgb,var(--accent)_12%,transparent),transparent_70%)] group-hover:opacity-100 hover:opacity-100"
        />
      ) : null}
      {children}
    </div>
  );
}
