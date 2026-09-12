import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface Commit {
  sha: string;
  repo: string;
  message: string;
  /** Pre-formatted relative time. Formatting is the caller's job. */
  when: string;
}

interface ShippedPanelProps {
  commits: readonly Commit[];
  className?: string;
}

/**
 * The hero's proof, as a static list rather than a rotating ticker: recent
 * commits, in one glass card. M4.4 swaps `PLACEHOLDER_COMMITS` for the real
 * GitHub feed through the same prop, so this component does not change.
 *
 * A server component with no motion of its own — it rises in as one unit via
 * the `RiseIn` wrapper the hero already applies, and nothing inside it moves
 * on a timer. A sha is the one place the mono utility face belongs here: it
 * is machine output, not a stylistic flourish, and the rest of the panel is
 * content, not chrome.
 */
export function ShippedPanel({ commits, className }: ShippedPanelProps) {
  if (commits.length === 0) return null;

  return (
    <Card glass className={cn("p-5 md:p-6", className)}>
      <div className="flex items-center">
        <p className="text-small font-medium text-fg">Recently shipped</p>
        <span className="ml-auto text-small text-muted">GitHub</span>
      </div>

      <ul className="mt-4 divide-y divide-line">
        {commits.map((commit) => (
          <li key={commit.sha} className="py-3 first:pt-0 last:pb-0">
            <p className="line-clamp-2 text-small text-fg">{commit.message}</p>
            <p className="mt-1 flex flex-wrap gap-x-2 text-small text-muted">
              <span>{commit.repo}</span>
              <span aria-hidden="true">·</span>
              <span>{commit.when}</span>
              <span className="font-mono text-xs">{commit.sha}</span>
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
