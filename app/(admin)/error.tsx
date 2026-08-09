"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonStyles } from "@/components/ui/buttonStyles";

/**
 * Error boundary for the admin group.
 *
 * `error.tsx` moved into `(site)` with the rest of the marketing chrome, which
 * left the portal falling through to `global-error.tsx` — a full-page takeover
 * that replaces the root layout. For a tool you are working inside, an error in
 * one screen should not look like the whole application died.
 *
 * Deliberately says nothing about what failed: an admin route error can carry
 * database detail, and this renders behind a login that may itself be the thing
 * that broke.
 */
interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error("[admin] route error", error.digest ?? error);
  }, [error]);

  return (
    <Container className="py-16">
      <p className="font-mono text-small tracking-[0.18em] text-muted uppercase">
        Error
      </p>
      <h1 className="mt-4 text-h2">This screen failed to load.</h1>
      <p className="mt-4 max-w-[60ch] text-muted">
        The rest of the portal is probably fine. Try again — if it keeps happening, the
        server log has the detail.
      </p>
      {error.digest ? (
        <p className="mt-4 font-mono text-small tracking-[0.18em] text-muted uppercase">
          Ref {error.digest}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className={buttonStyles("secondary")}>
          Try again
        </button>
        <Link href="/admin" className={buttonStyles("ghost")}>
          Back to dashboard
        </Link>
      </div>
    </Container>
  );
}
