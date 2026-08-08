"use client";

import { useCallback, useRef } from "react";
import { useReducedMotion } from "motion/react";

import { useHasHover } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface CardProps extends React.ComponentProps<"div"> {
  /** Glass costs a backdrop-filter — 2 per viewport below md (§4.2). */
  glass?: boolean;
  /**
   * The cursor-tracked light. On by default — it is what a card *is* here.
   * Pass `false` for a card that must stay completely inert. Desktop
   * pointers only, and frozen (not removed) under reduced motion.
   */
  highlight?: boolean;
}

export function Card({
  glass = false,
  highlight = true,
  className,
  children,
  ...props
}: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number>(0);
  const hasHover = useHasHover();
  const isReduced = useReducedMotion();

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
        /*
          ServiceStack scales the card's wrapper as the next card covers it,
          so `getBoundingClientRect()` returns SCALED pixels while the
          gradients underneath are resolved in the card's own CSS pixels.
          Dividing by the ratio keeps the light welded to the cursor on a
          card mid-stack; without it the light drifts up to 6% away from the
          pointer exactly where two cards overlap and it is most obvious.
          `offsetWidth` is the unscaled border-box width, the same box the
          rect measures, so the ratio is the live scale factor.
        */
        const k = rect.width ? el.offsetWidth / rect.width : 1;
        el.style.setProperty("--mx", `${(clientX - rect.left) * k}px`);
        el.style.setProperty("--my", `${(clientY - rect.top) * k}px`);
      });
    },
    [],
  );

  /*
    The light exists for a real pointer only (§4.7). `useHasHover` is false on
    the server and on the first client render, so touch never renders the
    layer at all and pays nothing for it — the card there is exactly the flat
    card it is at rest, which is the whole reason nothing legible is allowed
    to depend on this.
  */
  const lume = highlight && hasHover;
  /*
    Reduced motion keeps the light but stops it FOLLOWING. A pool of light
    chasing the cursor is continuous, input-driven movement — closer to
    parallax than to a state change — so it is the tracking that gets dropped,
    not the feedback. Without a mousemove handler `--mx/--my` stay at their
    50%/50% defaults, so the card lights from its own centre, instantly (the
    global floor in globals.css collapses the transition). No loop, nothing
    animating on its own.
  */
  const tracking = lume && !isReduced;

  return (
    <div
      ref={ref}
      onMouseMove={tracking ? onMouseMove : undefined}
      className={cn(
        "relative overflow-hidden rounded-md border border-line",

        /*
          ── The light rig ──────────────────────────────────────────────
          `--mx`/`--my` are the cursor in card-local pixels; they default to
          the centre so the first paint (and the reduced-motion case, and any
          frame before the first mousemove) resolves to a valid gradient
          rather than an invalid one that drops the whole declaration.

          `--lit` is the single 0→1 driver for the entire hover state: the
          light layer's opacity, the radius of both its gradient and its mask,
          and the depth shadow below. One transitioned property, one paint
          invalidation per frame, and no two halves of the effect that can
          fall out of sync. It is registered with `@property` in globals.css —
          an unregistered custom property is not interpolable and would jump
          at the halfway point instead of rising.

          `[transition-property:--lit]` is deliberately the bracket form: here
          the value IS the literal token `--lit`, which is what
          `transition-property` wants. The parenthesis form is for utilities
          that need `var()` — hence `duration-(--d-base)` on the next line,
          which is `dur.base` + `ease.out` from lib/motion.ts (§5).
        */
        "[--mx:50%] [--my:50%] [--lit:0] hover:[--lit:1]",
        "[transition-property:--lit] duration-(--d-base) ease-out-soft",

        /*
          Depth, and the only thing on the card itself that changes. The
          geometry is the §4.2 recipe's drop and never moves; only its colour
          rises with `--lit`, from `transparent` to the themed `--glass-drop`
          — a real shadow on light, near-black on dark. The card comes forward
          without moving: no `translate`, no `scale`. A lift would also drag
          the card out from under its own light source, since the pointer
          stays put while the surface slides 4px up beneath it.

          No accent in this shadow, and NO BORDER CHANGE ANYWHERE. The 1px
          `border-line` above is the card's frame in every state — rest,
          hover, focus, tap. The light layer below is clipped to the padding
          box, so it cannot bleed under the border either.
        */
        "[box-shadow:0_24px_60px_-24px_color-mix(in_srgb,var(--glass-drop)_calc(var(--lit)_*_100%),transparent)]",

        glass
          ? "bg-[linear-gradient(148deg,var(--glass-tint),var(--glass-tint-soft))] md:backdrop-blur-[20px] md:backdrop-saturate-[140%]"
          : "bg-raised",
        className,
      )}
      {...props}
    >
      {lume ? (
        <div
          aria-hidden="true"
          className={cn(
            /*
              ── The light ──────────────────────────────────────────────
              `absolute inset-0` is the PADDING box, so this layer stops one
              pixel short of the border on every side and the frame stays
              untouched. `overflow-hidden` on the card clips it to the inner
              rounded rect, so the corners follow the radius for free.

              It sits above the card's content on purpose. Below it — as a
              background layer — half of a ProjectCard is an opaque cover
              photo and the light would simply vanish there. Above it, the
              light falls on everything the card is made of, which is what a
              light does.
            */
            "pointer-events-none absolute inset-0",
            "opacity-(--lit)",

            /*
              THE reason this reads in both themes, and the reason text stays
              legible under it. A plain alpha wash always drags text and
              background toward the same tint, so contrast only ever drops.
              A blend mode moves them one way each:

              - Light: `multiply` can only DARKEN. Over `#FFFFFF` the teal
                pool is plainly visible (the one thing a bloom can never do on
                `#FAFBFC`); over near-black body copy it is imperceptible,
                because darkening ink that is already dark changes nothing.
              - Dark: `screen` can only LIGHTEN. Over `#0E1017` the cyan pool
                is a ~7x luminance step; over `#E8EDF5` text it is
                imperceptible for the mirror-image reason.

              Measured off the built page rather than argued: `--muted` body
              copy under the centre of the pool goes 6.10:1 → 6.56:1 on dark
              and 5.84:1 → 6.74:1 on light. Contrast RISES on both. A 24%
              alpha wash in the same place drags both toward the tint and
              costs contrast instead.

              The same declaration serves both themes, no JS theme read. It
              also means the lattice lines appear only in the gaps between
              glyphs and never *on* them, which is what makes the light read
              as sitting behind the type.

              `multiply`/`screen` are the separable blend modes every engine
              has had for a decade. No `isolate` on the card: blending needs
              the real backdrop, which for an opaque card is the card itself
              and for a glass one is what the glass is showing.
            */
            "mix-blend-multiply dark:mix-blend-screen",

            /*
              The one number that is NOT shared. Measured on the built page,
              not guessed: at a common 24% the light pool was visibly the
              weaker of the two, because `screen` gets to open a near-black
              surface all the way up while `multiply` only has the top of the
              range to work in. At 31%/24% the two land level — the surface
              under the cursor goes `#11121A → #1A2C38` on dark (a 3.7x
              luminance step) and `#FFFFFF → #D5E2E6` on light (0.74x, i.e.
              it DARKENS, the only direction that registers on `#FAFBFC`).
              Light therefore carries the deeper mix — the same lesson the
              scroll-background fields learned the expensive way (§4.0), just
              with the alpha living on the element that needs it rather than
              in a token, since only one component spends it.
            */
            "[--lume-core:31%] [--lume-rim:17%]",
            "dark:[--lume-core:24%] dark:[--lume-rim:14%]",

            /*
              Three layers, top to bottom:

              1. The pool. `--accent-ink` at the core → `--ion` at the rim.
                 Both tokens are already themed for their ground — cyan and
                 electric blue on dark, darkened teal and indigo on light —
                 so the hue ramp survives the theme swap by construction
                 rather than by luck. `--ion` is the documented gradient
                 partner to the accent (§4.1); it is what stops the pool
                 reading as a flat tinted blob.
              2 & 3. The lattice. A 1px engineering grid at 28px, in the
                 SAME `--lattice-line` token the page background uses — ice
                 on dark, black on light, already carrying the right alpha
                 for each ground. It is invisible everywhere except where the
                 light falls, so the effect is not "a glow follows the
                 cursor" but "the light reveals what is etched into the
                 card". Repeating gradients tile themselves, so no
                 `background-size` and no fourth thing to keep in sync.

              The pool's radius grows with `--lit` (120px → 260px): the light
              opens up as it arrives and closes as it leaves. That is a paint
              on one hovered card — the same paint the sanctioned
              cursor-following radial in §5.3 already costs per frame — and
              never a layout property.
            */
            "[background-image:radial-gradient(circle_calc(120px_+_var(--lit)_*_140px)_at_var(--mx)_var(--my),color-mix(in_srgb,var(--accent-ink)_var(--lume-core),transparent),color-mix(in_srgb,var(--ion)_var(--lume-rim),transparent)),repeating-linear-gradient(to_right,var(--lattice-line)_0_1px,transparent_1px_28px),repeating-linear-gradient(to_bottom,var(--lattice-line)_0_1px,transparent_1px_28px)]",

            /*
              The beam itself. The mask is what confines all three layers to
              a pool around the pointer — without it the lattice would cover
              the whole card. It runs wider than the gradient (170px → 360px)
              so the hue ramp is fully inside the lit area and the edge is a
              soft falloff rather than a cut. `black`/`transparent` here are
              an alpha channel, not colours: `mask-mode` reads the source's
              alpha, so no token belongs in a mask.
            */
            "[mask-image:radial-gradient(circle_calc(170px_+_var(--lit)_*_190px)_at_var(--mx)_var(--my),black_0%,black_14%,transparent_76%)]",
          )}
        />
      ) : null}
      {children}
    </div>
  );
}
