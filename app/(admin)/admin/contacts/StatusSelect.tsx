"use client";

import { useOptimistic, useState, useTransition } from "react";

import { controlStyles } from "@/components/ui/Field";
import { setContactStatus } from "@/lib/admin/contact-actions";
import { SUBMISSION_STATUSES, type SubmissionStatus } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

/**
 * The triage control. One per row, and the only interactive thing in its cell.
 *
 * `setContactStatus` is imported from a `"use server"` module, so what crosses
 * this boundary is an action reference — the mongo driver and requireAdmin()
 * stay on the server (admin-portal: no admin data reaches the client without
 * passing a server-side authorization check first).
 */

const LABELS: Record<SubmissionStatus, string> = {
  pending: "Pending",
  contacted: "Contacted",
  responded: "Responded",
  closed: "Closed",
  lost: "Lost",
};

/**
 * Visual weight per status, expressed as a marker dot rather than a second
 * accent (§4.1 — the accent on this page belongs to the active filter chip and
 * nothing else). Three weights, not five: work that is waiting reads solid in
 * the foreground colour, work in flight reads muted, work that is finished
 * reads as an outline. Colour never carries the meaning on its own — the
 * select's own label is the accessible source of truth, and the dot is
 * aria-hidden.
 *
 * The dot rather than a class on the <select> itself because `cn()` joins
 * without merging: `controlStyles` already declares `border-line` and
 * `text-fg`, so a per-status border or text colour would resolve by stylesheet
 * order instead of argument order. `font-medium` is safe — controlStyles sets
 * no font weight.
 */
const TONES: Record<SubmissionStatus, { dot: string; emphasis?: string }> = {
  pending: { dot: "bg-fg", emphasis: "font-medium" },
  contacted: { dot: "bg-muted" },
  responded: { dot: "bg-muted" },
  closed: { dot: "border border-line-strong" },
  lost: { dot: "border border-line-strong opacity-60" },
};

interface StatusSelectProps {
  /** Contact document id. Also namespaces this row's error element. */
  id: string;
  /** Whose submission this is — the select's accessible name depends on it. */
  name: string;
  status: SubmissionStatus;
  className?: string;
}

export function StatusSelect({ id, name, status, className }: StatusSelectProps) {
  /**
   * `useOptimistic`, not a `useState` mirror.
   *
   * The revert is the reason. On success the action calls `revalidatePath`, the
   * server component re-renders and `status` arrives already updated. On
   * failure it returns `{ ok: false }` and revalidates nothing, so the prop
   * never changes — and React discards the optimistic value when the transition
   * settles, which puts the select back on the stored status by itself. A
   * `useState` copy would need an explicit rollback, and a rollback that races
   * a concurrent refresh is exactly the bug this hook exists to remove.
   *
   * `useTransition` still supplies the pending flag; the two are complementary
   * rather than alternatives — `useOptimistic` only updates inside a transition.
   */
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const errorId = `status-error-${id}`;
  const tone = TONES[optimisticStatus];

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as SubmissionStatus;
    if (next === optimisticStatus) return;

    startTransition(async () => {
      setOptimisticStatus(next);
      setError(null);
      const result = await setContactStatus(id, next);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={cn("size-2 shrink-0 rounded-full", tone.dot)}
        />
        {/*
          Never disabled while in flight. Disabling the control the keyboard is
          currently on throws focus back to <body>, so tabbing through a page of
          submissions would break every time one saved.
        */}
        <select
          value={optimisticStatus}
          onChange={handleChange}
          aria-label={`Status for ${name}'s submission`}
          aria-describedby={error ? errorId : undefined}
          aria-busy={pending || undefined}
          // controlStyles carries min-h-11 — the 44px tap target floor.
          className={cn(controlStyles, "text-small", tone.emphasis)}
        >
          {SUBMISSION_STATUSES.map((value) => (
            <option key={value} value={value}>
              {LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      {/*
        Two elements, and only one of them is ever in the layout.

        The live region is permanent — a region inserted at the same moment as
        its text is announced unreliably — but it is `sr-only`, so it reserves
        no height and, as a flex child of a `gap-2` column, no gap either.

        The visible message renders ONLY when there is one. An always-present
        slot with `min-h-*` would hold a dead row plus a gap under every select
        in the table, on every page view, for an error almost nobody sees.
      */}
      <span aria-live="polite" className="sr-only">
        {error ?? ""}
      </span>

      {error ? (
        <p id={errorId} className="text-small text-fg">
          {error}
        </p>
      ) : null}
    </div>
  );
}
