import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not found — Crandev",
  description: "That page doesn't exist.",
};

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto w-full max-w-[1240px]">
        <p className="font-mono text-small uppercase tracking-[0.18em] text-mist">
          404
        </p>

        <h1 className="mt-6 max-w-[18ch]">This page doesn&rsquo;t exist.</h1>

        <p className="mt-6 max-w-[65ch] text-mist">
          The link may be out of date, or the page may have moved. Nothing is
          broken on our end.
        </p>

        <nav aria-label="Suggested pages" className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-md border border-hairline bg-carbon px-5 py-3 text-ice transition-colors duration-[--d-micro] hover:bg-graphite"
          >
            Home
          </Link>
          <Link
            href="/work"
            className="rounded-md border border-hairline bg-carbon px-5 py-3 text-ice transition-colors duration-[--d-micro] hover:bg-graphite"
          >
            Selected work
          </Link>
          <Link
            href="/contact"
            className="rounded-md border border-hairline bg-carbon px-5 py-3 text-ice transition-colors duration-[--d-micro] hover:bg-graphite"
          >
            Contact
          </Link>
        </nav>
      </div>
    </main>
  );
}
