"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

import { dur, ease, reduced, viewport } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ProcessStep } from "@/lib/content";

/**
 * The Process list, and the timeline that draws itself as the section arrives.
 *
 * Split out of the section so Process stays a server component: `'use client'`
 * is per-module, and leaving this in the section would have pulled lib/content
 * — and zod, and all eight JSON content files — into the browser bundle
 * (§5.1.8). Steps arrive as a prop and the `ProcessStep` import is type-only,
 * so this module has no runtime dependency on the content layer.
 *
 * The whole thing is one orchestrated moment (§5.1.6) on a single trigger: the
 * wrapper owns `whileInView` with the shared `viewport` (`once: true`, so it
 * never re-runs on scroll-up), and every animated part below reads the variant
 * label from it. Nothing here is driven by page scroll position — §4.6 reserves
 * the ambient page-progress read for the scroll background.
 */

/**
 * Seconds between steps. §5.1.4 caps this at 0.06–0.09; StaggerGroup's own
 * `stagger` prop defaults to 0.07, so the spacing between siblings is a
 * component-level knob in this codebase. Every *duration* and *easing* below
 * still comes from lib/motion.ts.
 *
 * The delay is applied per element through `custom` rather than through
 * `staggerChildren`, because a stagger computed by the parent does not cascade
 * past its direct children — and the node has to sit outside the text's 24px
 * of travel, one level deeper, or it slides along the rail as it fades in.
 */
const STEP_STAGGER = 0.08;

interface ProcessTimelineProps {
  steps: readonly ProcessStep[];
  className?: string;
}

export function ProcessTimeline({ steps, className }: ProcessTimelineProps) {
  const isReduced = useReducedMotion() ?? false;

  /**
   * The rail draws downward: `scaleY` on a 1px element with `origin-top`.
   * Never `height` — §5.1.1, and it would relayout every frame.
   *
   * `ease.out` front-loads the travel, so the line has already passed each
   * node by the time that node lights. A stagger inside the legal 0.06–0.09
   * band can never track a 0.8s draw literally; leading it is what reads as
   * the line arriving first.
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

  /** Nodes light in sequence behind the line. Present from the start when reduced. */
  const nodeVariants: Variants = isReduced
    ? { hidden: { opacity: 1, scale: 1 }, visible: { opacity: 1, scale: 1 } }
    : {
        hidden: { opacity: 0, scale: 0.4 },
        visible: (i: number) => ({
          opacity: 1,
          scale: 1,
          transition: { duration: dur.base, ease: ease.out, delay: i * STEP_STAGGER },
        }),
      };

  /** The step's text. Under reduced motion this is the shared plain fade, zero travel. */
  const itemVariants: Variants = isReduced
    ? reduced(isReduced)
    : {
        hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: dur.reveal, ease: ease.out, delay: i * STEP_STAGGER },
        }),
      };

  return (
    <motion.div
      className={cn("relative", className)}
      variants={{ hidden: {}, visible: {} }}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {/* Base is a plain list with no rail, so there is nothing to draw on a
          phone and the steps simply reveal in sequence (§4.7). The rail and its
          nodes are the `md` enhancement, added on top — never undone. */}
      <motion.span
        aria-hidden="true"
        variants={railVariants}
        className="absolute inset-y-0 left-0 hidden w-px origin-top bg-line md:block"
      />

      <ol>
        {steps.map((step, i) => (
          <li key={step.slug} className="relative pb-12 last:pb-0 md:pb-16 md:pl-10">
            <motion.span
              aria-hidden="true"
              custom={i}
              variants={nodeVariants}
              className="absolute -left-1 top-2 hidden size-2 rounded-full bg-line-strong md:block"
            />

            <motion.div custom={i} variants={itemVariants}>
              <p className="flex items-baseline gap-4 font-mono text-small uppercase tracking-[0.18em]">
                <span className="text-fg">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-muted">{step.duration}</span>
              </p>

              <h3 className="mt-4 text-fg">{step.title}</h3>

              <p className="mt-3 max-w-[60ch] text-muted">{step.detail}</p>
            </motion.div>
          </li>
        ))}
      </ol>
    </motion.div>
  );
}
