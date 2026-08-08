"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // The digest is the only safe handle on the server-side error; the
    // message is intentionally withheld from the client by Next in prod.
    console.error("Route error", error.digest ?? error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto w-full max-w-[1240px]">
        <p className="font-mono text-small uppercase tracking-[0.18em] text-muted">
          Error
        </p>

        <h1 className="mt-6 max-w-[20ch]">Something on this page failed.</h1>

        <p className="mt-6 max-w-[65ch] text-muted">
          The rest of the site is fine. Try again — if it keeps happening, tell
          us and we&rsquo;ll fix it.
        </p>

        {error.digest ? (
          <p className="mt-4 font-mono text-small uppercase tracking-[0.18em] text-muted">
            Ref {error.digest}
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-line bg-raised px-5 py-3 text-fg transition-colors duration-(--d-micro) hover:bg-inset"
          >
            Try again
          </button>
          <Link
            href="/contact"
            className="rounded-md border border-line bg-raised px-5 py-3 text-fg transition-colors duration-(--d-micro) hover:bg-inset"
          >
            Tell us
          </Link>
        </div>
      </div>
    </main>
  );
}
