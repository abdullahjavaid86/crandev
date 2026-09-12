import { Footer } from "@/components/layout/Footer";
import { Grain } from "@/components/layout/Grain";
import { Header } from "@/components/layout/Header";
import { Scene } from "@/components/layout/Scene";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not found — CraneDev",
  description: "That page doesn't exist.",
};

/**
 * The site 404, and the one page that has to carry its own chrome.
 *
 * An unmatched URL belongs to no route group, so it renders inside the root
 * layout — which deliberately has no Header or Footer, because the admin
 * portal shares that root. This file therefore renders the four marketing
 * chrome pieces itself. It has to stay at `app/not-found.tsx`: moved into
 * `app/(site)/`, Next stops using it for unmatched URLs and serves its own
 * unstyled built-in 404 instead. That was verified, not assumed.
 */
export default function NotFound() {
  return (
    <>
      <Scene />
      <Header />
      <main className="flex flex-1 flex-col justify-center px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto w-full max-w-[1240px]">
          <p className="font-mono text-small tracking-[0.18em] text-muted uppercase">
            404
          </p>

          <h1 className="mt-6 max-w-[18ch]">This page doesn&rsquo;t exist.</h1>

          <p className="mt-6 max-w-[65ch] text-muted">
            The link may be out of date, or the page may have moved. Nothing is broken
            on our end.
          </p>

          <nav aria-label="Suggested pages" className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-md border border-line bg-raised px-5 py-3 text-fg transition-colors duration-(--d-micro) hover:bg-inset"
            >
              Home
            </Link>
            <Link
              href="/work"
              className="rounded-md border border-line bg-raised px-5 py-3 text-fg transition-colors duration-(--d-micro) hover:bg-inset"
            >
              Selected work
            </Link>
            <Link
              href="/contact"
              className="rounded-md border border-line bg-raised px-5 py-3 text-fg transition-colors duration-(--d-micro) hover:bg-inset"
            >
              Contact
            </Link>
          </nav>
        </div>
      </main>
      <Footer />
      <Grain />
    </>
  );
}
