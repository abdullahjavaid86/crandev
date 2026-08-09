import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { PAGE_SIZE, listContacts } from "@/lib/admin/contacts";
import { requireAdmin } from "@/lib/admin/guard";
import { SUBMISSION_STATUSES, type SubmissionStatus } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

import { ContactsTable } from "./ContactsTable";

/**
 * The contacts list — phase 2 of the admin portal.
 *
 * Server component. `requireAdmin()` is the first statement: the proxy only
 * checks that a cookie exists, which is UX, not authorization (admin-portal).
 *
 * Filter and page live in the URL rather than in component state, so a view is
 * a link: shareable, bookmarkable, back-button correct, and working with
 * JavaScript off. Every navigation on this page is an <a>.
 */

export const metadata: Metadata = {
  title: "Contacts — CraneDev Admin",
  robots: { index: false, follow: false },
};

type Filter = SubmissionStatus | "all";

const FILTERS: readonly Filter[] = ["all", ...SUBMISSION_STATUSES];

const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  pending: "Pending",
  contacted: "Contacted",
  responded: "Responded",
  closed: "Closed",
  lost: "Lost",
};

/** A query key can legally arrive repeated (`?page=2&page=9`). Take the first. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Both readers below fall back rather than throw. A query string is user input
 * — `?status=<script>` or `?page=banana` is a hand-typed URL or a stale
 * bookmark, and neither is a 500. `listContacts` clamps the page to the range
 * that actually exists, so only the shape has to be right here.
 */
function readStatus(raw: string | string[] | undefined): Filter {
  const value = first(raw);
  return (SUBMISSION_STATUSES as readonly string[]).includes(value ?? "")
    ? (value as SubmissionStatus)
    : "all";
}

function readPage(raw: string | string[] | undefined): number {
  const value = Number(first(raw));
  return Number.isInteger(value) && value >= 1 ? value : 1;
}

/** Canonical URL for a view. The default of each param is left out entirely. */
function viewHref(status: Filter, page: number): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/contacts?${query}` : "/admin/contacts";
}

const chipStyles = cn(
  "inline-flex min-h-11 items-center rounded-full border px-4",
  "font-mono text-small tracking-[0.18em] uppercase",
  "transition-colors duration-(--d-micro)",
);

export default async function AdminContactsPage(props: PageProps<"/admin/contacts">) {
  await requireAdmin();

  /*
    `searchParams` is a PROMISE in Next 15+/16 — the page starts rendering
    before the request's query string is needed, so reading it is what opts
    this render into being dynamic. Destructuring it as a plain object silently
    yields `undefined` for every key.
  */
  const searchParams = await props.searchParams;
  const status = readStatus(searchParams.status);
  const requestedPage = readPage(searchParams.page);

  const { rows, total, page, pageCount } = await listContacts({
    page: requestedPage,
    status,
  });

  const firstOnPage = (page - 1) * PAGE_SIZE + 1;
  const lastOnPage = Math.min(page * PAGE_SIZE, total);

  return (
    <Container as="div" className="py-10 md:py-16">
      <Eyebrow>Contacts</Eyebrow>

      {/* text-h2 with the h2 line height: the h1 default is display size, which
          is a marketing headline, not a tool's page title. */}
      <h1 className="mt-4 text-h2 leading-[1.1]">Submissions</h1>

      <p className="mt-4 max-w-[65ch] text-muted">
        Everything sent through the contact form, newest first. Changing a status saves
        immediately.
      </p>

      {/*
        Filter chips are links, not buttons — same reason as the pagination.
        Switching filter always returns to page one: page 4 of "all" is rarely
        page 4 of "lost", and landing on a clamped page nobody asked for reads
        as the filter having lost your place.
      */}
      <nav aria-label="Filter by status" className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((value) => {
          const active = value === status;
          return (
            <Link
              key={value}
              href={viewHref(value, 1)}
              aria-current={active ? "page" : undefined}
              className={cn(
                chipStyles,
                active
                  ? // The ONE accent border on this page (§4.1). Nothing else
                    // here glows, which is what makes this one readable.
                    "border-accent-ink text-accent-ink"
                  : "border-line text-muted hover:border-line-strong hover:text-fg",
              )}
            >
              {FILTER_LABELS[value]}
            </Link>
          );
        })}
      </nav>

      {total > 0 ? (
        <>
          <p className="mt-6 font-mono text-small tracking-[0.18em] text-muted uppercase">
            {firstOnPage}&ndash;{lastOnPage} of {total}
          </p>

          <div className="mt-4">
            <ContactsTable rows={rows} />
          </div>

          {/*
            Rendered only when there is somewhere to go. Prev/next are <a>s so
            they are shareable and survive JavaScript being off; the unavailable
            direction is a span, because a link that goes nowhere is a trap for
            anyone tabbing through.
          */}
          {pageCount > 1 ? (
            <nav
              aria-label="Pagination"
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              {page > 1 ? (
                <Link
                  href={viewHref(status, page - 1)}
                  rel="prev"
                  className={buttonStyles("secondary", "sm")}
                >
                  Previous
                </Link>
              ) : (
                <span className={buttonStyles("secondary", "sm", "opacity-50")}>
                  Previous
                </span>
              )}

              <p className="font-mono text-small tracking-[0.18em] text-muted uppercase">
                Page {page} of {pageCount}
              </p>

              {page < pageCount ? (
                <Link
                  href={viewHref(status, page + 1)}
                  rel="next"
                  className={buttonStyles("secondary", "sm")}
                >
                  Next
                </Link>
              ) : (
                <span className={buttonStyles("secondary", "sm", "opacity-50")}>
                  Next
                </span>
              )}
            </nav>
          ) : null}
        </>
      ) : (
        /*
          Two empty states, and they are not the same thing. An inbox with
          nothing in it is a fact about the site; a filter that matches nothing
          is a fact about the filter, and the way out of it is a link rather
          than patience.
        */
        <section
          aria-labelledby="contacts-empty"
          className="mt-8 rounded-lg border border-dashed border-line-strong bg-raised p-6 md:p-10"
        >
          {status === "all" ? (
            <>
              <h2 id="contacts-empty" className="text-h3">
                Nothing has come in yet
              </h2>
              <p className="mt-4 max-w-[65ch] text-muted">
                Submissions land here the moment someone sends the contact form. Nothing
                is filtered out — there is genuinely nothing stored.
              </p>
            </>
          ) : (
            <>
              <h2 id="contacts-empty" className="text-h3">
                No submissions are marked {FILTER_LABELS[status].toLowerCase()}
              </h2>
              <p className="mt-4 max-w-[65ch] text-muted">
                That is this filter, not the inbox. Clear it to see everything that has
                been submitted.
              </p>
              <Link
                href={viewHref("all", 1)}
                className={buttonStyles("secondary", "md", "mt-6")}
              >
                Show all submissions
              </Link>
            </>
          )}
        </section>
      )}
    </Container>
  );
}
