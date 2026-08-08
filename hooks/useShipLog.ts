"use client";

import { useEffect, useState } from "react";

/**
 * The Ship Log's state (CLAUDE.md §4.5). Owns two things and nothing else:
 * turning a page's declared section list into "commits", and answering which
 * one is currently being read.
 *
 * Registration is an explicit array passed down, not a context + per-section
 * `useRegisterSection` hook. Two reasons, both structural:
 *
 * 1. A registration hook would force `'use client'` onto every section wrapper
 *    that wanted a rail entry — exactly the branch-level client boundary §10
 *    and §5.1.8 forbid. With an array, the sections stay server components and
 *    only the rail is client.
 * 2. Mount order is not document order (a lazily-mounted or conditionally
 *    rendered section registers late), so a dynamic store would have to sort
 *    entries by `compareDocumentPosition` to keep the log in reading order.
 *    An array is already ordered, by the author, in one readable place.
 *
 * Sections are matched by their DOM `id` — the same id their anchor link uses,
 * so nothing extra has to be threaded through the markup.
 */

export interface ShipLogSection {
  /** The section element's `id`. Also its anchor target. */
  id: string;
  /** Short human name, e.g. "Services". Shown only where the gutter is wide. */
  label: string;
  /**
   * Optional override for the mono short hash. Leave it off and it is derived
   * from `id` — deterministic, so it never differs between server and client.
   */
  hash?: string;
}

export interface ShipLogCommit {
  id: string;
  label: string;
  /** 7 mono hex characters. Content-derived, never presented as git output. */
  hash: string;
  /** 1-based ordinal, zero-padded: "01", "02". An index, not a timestamp. */
  index: string;
}

/**
 * FNV-1a 32-bit, rendered as 7 hex characters.
 *
 * This is a hash of the section id and nothing more. It reads as machine
 * output because it *is* machine output (§4.3) — but it is deliberately not
 * dressed up as a commit sha or paired with a fabricated timestamp, which
 * would imply git data we do not have here. Sections import this so their own
 * mobile eyebrow shows the same hash the rail does.
 */
export function shortHash(input: string, length = 7): string {
  let hash = 0x811c9dc5;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  // `>>> 0` makes it unsigned; the pad keeps the field width from jittering.
  return (hash >>> 0).toString(16).padStart(8, "0").slice(0, length);
}

/**
 * A thin band roughly 40% down the viewport. A section is "active" while it
 * crosses that band, which is where the eye actually is — not when it first
 * touches the bottom edge of the screen.
 */
const ACTIVE_BAND = "-40% 0px -55% 0px";

/**
 * IntersectionObserver, not a scroll listener or a page-progress read.
 *
 * "Which section is in view" is the question IO exists to answer: it reports
 * off the main thread and only when a boundary is crossed, so it costs nothing
 * per frame. Deriving the same answer from page progress would mean
 * reimplementing offset math the browser already does, and §4.6 reserves the
 * single ambient page-level scroll read for the background.
 */
export function useShipLog(sections: readonly ShipLogSection[]) {
  const commits: ShipLogCommit[] = sections.map((section, i) => ({
    id: section.id,
    label: section.label,
    hash: section.hash ?? shortHash(section.id),
    index: String(i + 1).padStart(2, "0"),
  }));

  const [activeId, setActiveId] = useState<string | null>(
    sections[0]?.id ?? null,
  );

  // A primitive key, so an inline array literal from the caller does not tear
  // the observer down and rebuild it on every render.
  const idKey = sections.map((section) => section.id).join(",");

  useEffect(() => {
    const ids = idKey ? idKey.split(",") : [];

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    // Reading order, so overlapping sections resolve to the earlier one
    // instead of flickering between them.
    const order = new Map<Element, number>(
      elements.map((element, i) => [element, i]),
    );
    const inBand = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target);
          else inBand.delete(entry.target);
        }

        // Nothing in the band — a gap between sections. Hold the last active
        // commit rather than blanking the rail on the way past.
        if (inBand.size === 0) return;

        let best: Element | null = null;
        let bestIndex = Number.POSITIVE_INFINITY;

        for (const element of inBand) {
          const index = order.get(element) ?? Number.POSITIVE_INFINITY;
          if (index < bestIndex) {
            bestIndex = index;
            best = element;
          }
        }

        if (best) setActiveId(best.id);
      },
      { rootMargin: ACTIVE_BAND, threshold: 0 },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [idKey]);

  return { commits, activeId };
}
