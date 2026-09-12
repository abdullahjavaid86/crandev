import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { MaskedText } from "@/components/motion/MaskedText";
import { RiseIn } from "@/components/motion/RiseIn";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { primaryCta } from "@/lib/nav";
import { CommitTicker, type Commit } from "./CommitTicker";

/**
 * DRAFT COPY — NEEDS REWRITING BEFORE LAUNCH (tracked as D2).
 *
 * Written to the §8 rules — plain, specific, no hype vocabulary — and
 * deliberately containing no numeric claim, because every number on this site
 * has to be real and none have been supplied yet. Say what the team actually
 * does and this gets replaced in one edit.
 */
const HEADLINE = ["Production software,", "built to be maintained."];

const SUBCOPY =
  "We take systems from architecture to production, then stay on them. No handover to a team that has never seen the code.";

/**
 * PLACEHOLDER DATA — MUST NOT SHIP (tracked in Known gaps; replaced at M4.4).
 *
 * §4.5 sanctions a mocked ticker while the GitHub route is built, but these
 * are invented commits and this section's entire job is being real. The
 * component takes its data as a prop precisely so M4.4 is a one-line swap.
 */
const PLACEHOLDER_COMMITS: Commit[] = [
  {
    sha: "a3f19c2",
    repo: "cranedev/ledger-core",
    message: "Cut p95 write latency by moving the ledger to append-only",
    when: "2h ago",
  },
  {
    sha: "7d0be41",
    repo: "cranedev/atlas-ingest",
    message: "Backfill runs incrementally instead of reprocessing the window",
    when: "yesterday",
  },
  {
    sha: "12c8ea9",
    repo: "cranedev/relay",
    message: "Retry budget per consumer, so one slow sink can't stall the rest",
    when: "3d ago",
  },
];

/**
 * The thesis. One masked headline, one line of subcopy, one CTA — which is the
 * page's single accent element (§4.1) — and the commit ticker carrying the
 * proof.
 *
 * Nothing ambient here: the site-wide Scene (§4.6) owns the background, and a
 * second moving layer in the hero would compete with it for no visible gain.
 *
 * A server component. Every moving part below is a client leaf.
 */
export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden py-16 md:py-24"
    >
      <Container className="relative">
        <div className="md:max-w-[60%]">
          <RiseIn>
            <Eyebrow>CraneDev</Eyebrow>
          </RiseIn>

          <MaskedText as="h1" lines={HEADLINE} className="mt-6 max-w-[18ch]" />

          {/* The LCP element on this page. It must paint without waiting for
              hydration — see RiseIn. */}
          <RiseIn delay={0.15}>
            <p className="mt-6 max-w-[52ch] text-muted">{SUBCOPY}</p>
          </RiseIn>

          <RiseIn delay={0.25}>
            {/* The one accent element on this viewport-height of scroll. */}
            <Link
              href={primaryCta.href}
              className={buttonStyles("primary", "md", "mt-10")}
            >
              {primaryCta.label}
            </Link>
          </RiseIn>

          <RiseIn delay={0.35}>
            <CommitTicker
              commits={PLACEHOLDER_COMMITS}
              className="mt-12 max-w-[34rem]"
            />
          </RiseIn>
        </div>
      </Container>
    </section>
  );
}
