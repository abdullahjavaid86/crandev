import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { contactStats } from "@/lib/admin/contacts";
import { requireAdmin } from "@/lib/admin/guard";
import { SUBMISSION_STATUSES } from "@/lib/admin/types";

import { StatTile } from "./StatTile";

export const metadata: Metadata = {
  title: "Dashboard — CraneDev Admin",
  robots: { index: false, follow: false },
};

/**
 * The portal's landing page: how much has come in, how fresh it is, where it
 * has got to, and how long the oldest untouched enquiry has been sitting.
 *
 * **Every figure is a live count from `contactStats()`.** Nothing on this page
 * is estimated, rounded, cached or filled in. A placeholder figure in an admin
 * tool is worse than an empty panel, because nobody can tell it apart from a
 * real one that happens to read zero — so where there is no data, the page
 * says so in words instead of showing a number.
 *
 * No count-up. The marketing site animates its proof strip; a tool does not
 * perform its numbers, it just has them right on the first paint.
 */
export default async function AdminDashboardPage() {
  // FIRST statement, always. This is the authorization boundary — the proxy
  // only checks that a cookie exists (see lib/admin/guard.ts). Nothing below
  // may read submission data until this has returned.
  const admin = await requireAdmin();

  const { total, newThisWeek, byStatus, oldestPendingDays } = await contactStats();

  return (
    <Container as="div" className="py-10 md:py-16">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>Dashboard</Eyebrow>

          {/* text-h2 with the h2 line height: the h1 default is display size,
              which is a marketing headline, not a tool's page title. */}
          <h1 className="mt-3 max-w-[20ch] text-h2 leading-[1.1]">
            Welcome back, {admin.name}.
          </h1>

          <p className="mt-3 font-mono text-small text-muted">{admin.email}</p>
        </div>

        {/* The page's one accent element (§4.1). Everything else — including
            all six linked tiles — signals with surface and border instead. */}
        <Link href="/admin/contacts" className={buttonStyles("primary", "md", "w-fit")}>
          Open contacts
        </Link>
      </div>

      <section aria-labelledby="contacts-heading" className="mt-10 md:mt-14">
        <h2 id="contacts-heading" className="text-h3">
          Contact submissions
        </h2>
        <p className="mt-2 max-w-[65ch] text-small text-muted">
          Counted in the database on every request, so these move the moment a form is
          submitted or a status is changed.
        </p>

        {/* Two columns at 360px. `md:` and `lg:` only ever add columns to the
            grids below; none of them undoes the phone layout (§4.7). */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4">
          <StatTile
            label="Total"
            value={total}
            hint="Every enquiry ever submitted."
            href="/admin/contacts"
            action="Open"
          />
          <StatTile
            label="New this week"
            value={newThisWeek}
            hint="Arrived in the last 7 days."
          />
        </div>

        {/*
          `oldestPendingDays` is null when nothing is pending, and that is a
          different fact from "0 days" — one says the queue is clear, the other
          says something landed today and is still untouched. Rendering null as
          zero would turn the single most useful number on this page into a
          lie, so the tile shows a state instead of a figure.
        */}
        <StatTile
          size="wide"
          className="mt-3 md:mt-4"
          label="Oldest pending"
          value={oldestPendingDays}
          unit={oldestPendingDays === 1 ? "day" : "days"}
          emptyLabel="Nothing waiting"
          hint={
            oldestPendingDays === null
              ? "No submission is sitting at pending. Nothing is waiting on a first reply."
              : "How long the oldest submission still marked pending has been waiting since it arrived."
          }
        />

        <h3 className="mt-8 text-h3 md:mt-10">By status</h3>

        {total === 0 ? (
          /*
            The intentional empty state. Five tiles all reading 0 would add
            nothing the "Total 0" above has not already said, and a grid of
            zeroes reads as a portal that failed to load rather than one with
            nothing in it yet. One sentence, and it names the source.
          */
          <div className="mt-4 rounded-md border border-dashed border-line-strong bg-raised p-6 md:p-8">
            <p className="max-w-[65ch] text-muted">
              Nothing has come in yet. Enquiries sent through the contact form on the
              site are written straight to the database, and the first one to arrive
              fills in these counts and opens a tile for each status &mdash; pending,
              contacted, responded, closed and lost.
            </p>
          </div>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
            {SUBMISSION_STATUSES.map((status) => (
              <li key={status} className="h-full">
                <StatTile
                  size="compact"
                  label={status}
                  value={byStatus[status]}
                  href={`/admin/contacts?status=${status}`}
                  action="View"
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
