"use client";

import { useRef } from "react";
import { Activity, Compass, Hammer, LifeBuoy, type LucideIcon } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

import { Reveal } from "@/components/motion/Reveal";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Service } from "@/lib/content";

/**
 * The services list, and the sticky stack layered on top of it at `lg`.
 *
 * Split out of the Services section so the section stays a server component:
 * `'use client'` is per-module, and the scroll read on the list container is
 * the only thing here that needs a client. Leaving it in the section would
 * have pulled lib/content — and zod, and all eight JSON files — into the
 * browser bundle (§5.1.8).
 *
 * Services arrive as a prop, and the `Service` import is type-only, so this
 * module has no runtime dependency on the content layer.
 */

/**
 * Explicit map, not a barrel lookup. `lucide-react[name]` or a
 * `lucide-react/dist/...` dynamic import would either defeat tree-shaking or
 * ship the whole icon set; four named imports ship four icons.
 */
const ICONS: Record<string, LucideIcon | undefined> = {
  Activity,
  Compass,
  Hammer,
  LifeBuoy,
};

interface ServiceCardProps {
  service: Service;
  index: number;
  total: number;
  /** Scroll progress of the whole list. Constant-mapped when not stacking. */
  progress: MotionValue<number>;
  stacking: boolean;
}

function ServiceCard({ service, index, total, progress, stacking }: ServiceCardProps) {
  const Icon = ICONS[service.icon];

  /**
   * Each card owns the slice of list progress during which the *next* card
   * travels up and covers it. The last card is never covered, so it never
   * dims. Ranges are mapped to a constant `1` when stacking is off, so the
   * children render exactly once in every case rather than branching the JSX.
   */
  const covered = stacking && index < total - 1;
  const range: [number, number] = [index / total, (index + 1) / total];
  const scale = useTransform(progress, range, covered ? [1, 0.94] : [1, 1]);
  const opacity = useTransform(progress, range, covered ? [1, 0.5] : [1, 1]);

  return (
    <li className="lg:sticky lg:top-24">
      <Reveal>
        {/* origin-top pins the card's head where the incoming card lands, so
            the shrink happens on the edge that is being covered. */}
        <motion.div style={{ scale, opacity }} className="origin-top">
          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-sm border border-line bg-inset"
              >
                {Icon ? <Icon className="size-5 text-fg" strokeWidth={1.5} /> : null}
              </span>
              {/* Real metadata, so it takes the mono pill rather than prose. */}
              <Badge className="ml-auto">{service.timeline}</Badge>
            </div>

            <h3 className="mt-6">{service.title}</h3>
            <p className="mt-3 max-w-[52ch] text-muted">{service.summary}</p>

            <div className="mt-6 border-t border-line pt-6">
              <Eyebrow>What you get</Eyebrow>
              <p className="mt-2 max-w-[52ch]">{service.deliverable}</p>
            </div>
          </Card>
        </motion.div>
      </Reveal>
    </li>
  );
}

interface ServiceStackProps {
  services: readonly Service[];
  className?: string;
}

export function ServiceStack({ services, className }: ServiceStackProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const isReduced = useReducedMotion();
  // Tailwind's `lg`. `useIsDesktop` is `md` and is deliberately not reused —
  // a tablet at 768px has no more room for a sticky stack than a phone does.
  const isWideEnough = useMediaQuery("(min-width: 64rem)");
  const stacking = isWideEnough && !isReduced;

  /**
   * Element-relative, which §4.6 allows: this is the list's own progress, not
   * a second page-progress read. `end start` ends the range when the list
   * leaves the top of the viewport, which is what makes the per-card slices
   * independent of how tall the cards happen to be.
   */
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start start", "end start"],
  });

  return (
    <ul ref={listRef} className={className}>
      {services.map((service, index) => (
        <ServiceCard
          key={service.slug}
          service={service}
          index={index}
          total={services.length}
          progress={scrollYProgress}
          stacking={stacking}
        />
      ))}
    </ul>
  );
}
