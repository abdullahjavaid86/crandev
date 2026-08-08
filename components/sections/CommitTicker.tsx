"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { dur, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface Commit {
  repo: string;
  message: string;
  /** Pre-formatted relative time. Formatting is the caller's job. */
  when: string;
  sha: string;
}

interface CommitTickerProps {
  commits: Commit[];
  className?: string;
}

/**
 * The hero's live proof: recent commits, in mono, one at a time.
 *
 * It says "we ship" without the copy having to claim it, which is the whole
 * reason §4.5 puts it here. M4.4 swaps the data for the real GitHub feed; the
 * component itself does not change, because it only ever renders what it is
 * given.
 *
 * Under reduced motion the rotation stops entirely — an element that cycles
 * on a timer is exactly the kind of unrequested movement the preference asks
 * us to remove — and the most recent commit is shown as a static line.
 */
export function CommitTicker({ commits, className }: CommitTickerProps) {
  const isReduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (isReduced || commits.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % commits.length), 4200);
    return () => clearInterval(id);
  }, [isReduced, commits.length]);

  if (commits.length === 0) return null;
  const commit = commits[isReduced ? 0 : index];

  return (
    <div
      className={cn("rounded-md border border-line bg-raised/60 px-4 py-3", className)}
    >
      {/* One live region for the whole ticker, polite: a passing reader is
          told what changed without the announcement interrupting them. */}
      <div className="flex items-center gap-2 font-mono text-small tracking-[0.18em] text-muted uppercase">
        <span className="size-1.5 shrink-0 rounded-full bg-muted" aria-hidden="true" />
        <span>Latest commits</span>
      </div>

      <div className="relative mt-2 h-10 overflow-hidden" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={commit.sha}
            initial={isReduced ? { opacity: 0 } : { y: "100%", opacity: 0 }}
            animate={isReduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={isReduced ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
            transition={{ duration: dur.base, ease: ease.out }}
            className="absolute inset-0"
          >
            <p className="truncate text-small text-fg">{commit.message}</p>
            <p className="truncate font-mono text-small text-muted">
              {commit.sha} · {commit.repo} · {commit.when}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
