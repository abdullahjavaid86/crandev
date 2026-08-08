"use client";

import { useEffect } from "react";
import "./globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Replaces the root layout entirely, so it must render its own <html> and
 * <body>. The font CSS variables are set on <html> by the real layout, which
 * never ran here — every token below falls back cleanly without them.
 * Only reached when the root layout itself throws.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Root layout error", error.digest ?? error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh">
        <main className="flex min-h-dvh flex-col justify-center px-6 py-28 md:px-10">
          <div className="mx-auto w-full max-w-[1240px]">
            <p className="font-mono text-small tracking-[0.18em] text-muted uppercase">
              Error
            </p>

            <h1 className="mt-6 max-w-[20ch]">The site failed to load.</h1>

            <p className="mt-6 max-w-[65ch] text-muted">
              This one is on us, not on your connection. Reload to try again.
            </p>

            {error.digest ? (
              <p className="mt-4 font-mono text-small tracking-[0.18em] text-muted uppercase">
                Ref {error.digest}
              </p>
            ) : null}

            <button
              type="button"
              onClick={reset}
              className="mt-10 rounded-md border border-line bg-raised px-5 py-3 text-fg transition-colors duration-(--d-micro) hover:bg-inset"
            >
              Reload
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
