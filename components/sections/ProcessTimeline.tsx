"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

import { dur, ease, viewport } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ProcessStep } from "@/lib/content";

/**
 * The Process list, and the timeline that assembles itself as the section
 * arrives.
 *
 * Split out of the section so Process stays a server component: `'use client'`
 * is per-module, and leaving this in the section would have pulled lib/content
 * — and zod, and all eight JSON content files — into the browser bundle
 * (§5.1.8). Steps arrive as a prop and the `ProcessStep` import is type-only,
 * so this module has no runtime dependency on the content layer.
 *
 * One orchestrated moment (§5.1.6) on a single trigger: the wrapper owns
 * `whileInView` with the shared `viewport` (`once: true`, so it never re-runs
 * on scroll-up), and every animated part reads the variant label from it.
 * Nothing is driven by page scroll position — §4.6 reserves that for the
 * background.
 *
 * The content does not arrive as a block. Each step's three parts land in
 * order — the mono line first, then the title, then the detail — so the step
 * reads as being assembled rather than faded in, which is what "compiled from
 * sources" means here. Everything rises into place; nothing drops.
 */

/**
 * Seconds between steps. §5.1.4 caps sibling stagger at 0.06–0.09;
 * StaggerGroup's own `stagger` prop defaults to 0.07, so sibling spacing is a
 * component-level knob in this codebase. Every duration and easing still comes
 * from lib/motion.ts.
 *
 * Delays are applied per element through `custom` rather than
 * `staggerChildren`, because a parent-computed stagger does not cascade past
 * its direct children — and the node sits outside the text's travel, one level
 * deeper, or it would slide along the rail as it fades in.
 */
const STEP_STAGGER = 0.08;

/** Seconds between the three parts inside one step. Tighter than the step
 *  stagger, so a step assembles faster than the list advances. */
const PART_STAGGER = 0.06;

interface ProcessTimelineProps {
  steps: readonly ProcessStep[];
  className?: string;
}

export function ProcessTimeline({ steps, className }: ProcessTimelineProps) {
  const isReduced = useReducedMotion() ?? false;

  /**
   * The rail draws downward — `scaleY` on a 1px element with `origin-top`,
   * never `height` (§5.1.1). Downward matches the reading order the numbers
   * declare: a rail drawing upward would reach step 04 before step 01.
   *
   * `ease.out` front-loads the travel, so the line has already passed each node
   * by the time that node lights.
   */
  const railVariants: Variants = isReduced
    ? { hidden: { scaleY: 1 }, visible: { scaleY: 1 } }
    : {
        hidden: { scaleY: 0 },
        visible: {
          scaleY: 1,
          transition: { duration: dur.reveal, ease: ease.out },
        },
      };

  /** The solid dot. Settles to its resting size; the halo carries the glow. */
  const nodeVariants: Variants = isReduced
    ? { hidden: { opacity: 1, scale: 1 }, visible: { opacity: 1, scale: 1 } }
    : {
        hidden: { opacity: 0, scale: 0.3 },
        visible: (i: number) => ({
          opacity: 1,
          scale: 1,
          transition: { duration: dur.base, ease: ease.out, delay: i * STEP_STAGGER },
        }),
      };

  /**
   * The glow. A separate blurred disc animating opacity and scale only, rather
   * than a box-shadow keyframe: a shadow built from var() does not interpolate
   * reliably, and §5.1.1 wants transform/opacity anyway.
   *
   * It blooms as the node lands and then settles to a quiet steady state. That
   * decay matters — four nodes glowing at full strength permanently would be
   * four accents in one viewport, which §4.1 exists to prevent. A flash that
   * relaxes reads as the step activating, not as four competing lights.
   */
  const haloVariants: Variants = isReduced
    ? { hidden: { opacity: 0.18, scale: 1 }, visible: { opacity: 0.18, scale: 1 } }
    : {
        hidden: { opacity: 0, scale: 0.4 },
        visible: (i: number) => ({
          opacity: [0, 0.75, 0.18],
          scale: [0.4, 1.7, 1],
          transition: {
            duration: dur.reveal,
            ease: ease.out,
            delay: i * STEP_STAGGER,
            times: [0, 0.45, 1],
          },
        }),
      };

  /** One part of a step. Rises into place; `custom` carries its own delay. */
  const partVariants: Variants = isReduced
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: dur.base } },
      }
    : {
        hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
        visible: (delay: number) => ({
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: dur.reveal, ease: ease.out, delay },
        }),
      };

  /** Delay for part `p` of step `i`, so the whole grid stays on one clock. */
  const at = (i: number, p: number) => i * STEP_STAGGER + p * PART_STAGGER;

  return (
    <motion.div
      className={cn("relative", className)}
      variants={{ hidden: {}, visible: {} }}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {/* Base is a plain list with no rail, so there is nothing to draw on a
          phone and the steps simply assemble in sequence (§4.7). The rail and
          its nodes are the `md` enhancement, added on top — never undone. */}
      <motion.span
        aria-hidden="true"
        variants={railVariants}
        className="absolute inset-y-0 left-0 hidden w-px origin-top bg-line md:block"
      />

      <ol>
        {steps.map((step, i) => (
          <li key={step.slug} className="relative pb-12 last:pb-0 md:pb-16 md:pl-10">
            {/* Halo sits under the dot and is purely decorative. */}
            <motion.span
              aria-hidden="true"
              custom={i}
              variants={haloVariants}
              className="absolute top-[0.1875rem] -left-[0.6875rem] hidden size-5 rounded-full bg-accent-ink blur-[6px] md:block"
            />
            <motion.span
              aria-hidden="true"
              custom={i}
              variants={nodeVariants}
              className="absolute top-2 -left-1 hidden size-2 rounded-full bg-accent-ink md:block"
            />

            {/* Three parts, landing in order: the mono line reads as the log
                entry, then the title, then the body it resolved to. */}
            <motion.p
              custom={at(i, 0)}
              variants={partVariants}
              className="flex items-baseline gap-4 font-mono text-small tracking-[0.18em] uppercase"
            >
              <span className="text-fg">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-muted">{step.duration}</span>
            </motion.p>

            <motion.h3
              custom={at(i, 1)}
              variants={partVariants}
              className="mt-4 text-fg"
            >
              {step.title}
            </motion.h3>

            <motion.p
              custom={at(i, 2)}
              variants={partVariants}
              className="mt-3 max-w-[60ch] text-muted"
            >
              {step.detail}
            </motion.p>
          </li>
        ))}
      </ol>
    </motion.div>
  );
}
