import { Activity, Compass, Hammer, LifeBuoy, type LucideIcon } from "lucide-react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Service } from "@/lib/content";

/**
 * The services list: one glass row per engagement, in a plain vertical stack.
 *
 * A server component. Nothing here reads scroll — the only client boundary
 * underneath is <StaggerGroup />, which owns the single viewport trigger while
 * the rows read its shared `item` variant (§5.2).
 *
 * Services arrive as a prop and the `Service` import is type-only, so this
 * module carries no runtime dependency on the content layer.
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

interface ServiceListProps {
  services: readonly Service[];
}

export function ServiceList({ services }: ServiceListProps) {
  return (
    <StaggerGroup as="ul" className="flex flex-col gap-4">
      {services.map((service) => {
        const Icon = ICONS[service.icon];

        return (
          <StaggerItem key={service.slug} as="li">
            <Card glass className="p-6 md:p-7">
              <div className="flex gap-5">
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-sm border border-line bg-inset"
                >
                  {Icon ? <Icon className="size-5 text-fg" strokeWidth={1.5} /> : null}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-4">
                    <h3>{service.title}</h3>
                    {/* Real metadata, so it takes the pill rather than prose. */}
                    <Badge className="ml-auto shrink-0">{service.timeline}</Badge>
                  </div>

                  <p className="mt-2 text-muted">{service.summary}</p>

                  <p className="mt-4 border-t border-line pt-4 text-small">
                    <span className="text-muted">What you get: </span>
                    <span className="text-fg">{service.deliverable}</span>
                  </p>
                </div>
              </div>
            </Card>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
}
