import { NotesButton } from "./NotesButton";
import type { ContactRow } from "@/lib/admin/contacts";
import { cn } from "@/lib/utils";

import { StatusSelect } from "./StatusSelect";

/**
 * One dataset, two layouts.
 *
 * Cards at the base size, a real <table> from `md` up. A five-column table at
 * 360px is unreadable and a sideways-scrolling one is worse, so the phone gets
 * the layout it can actually use rather than a shrunken desktop one
 * (design-system §mobile-first, admin-portal).
 *
 * The one `md:` that removes rather than adds is `md:hidden` on the card list.
 * Two representations of the same rows cannot both be present, and only the
 * card list can be the base case — the table is the enhancement. Whichever one
 * is `display: none` is out of the accessibility tree too, so nothing is
 * announced twice.
 *
 * A server component: the only client leaf is StatusSelect.
 */

/**
 * FIXED locale and FIXED time zone. `toLocaleDateString()` with no locale reads
 * the runtime's, which differs between the server and the visitor's browser and
 * renders two different strings for the same instant — a hydration mismatch
 * that only shows up on someone else's machine.
 */
const submittedFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * The mono utility face, on tags Eyebrow cannot render — it is a <p>, and these
 * are <dt>/<th>. Same three classes, deliberately, rather than a second styling
 * idea for metadata.
 */
const META_LABEL = "font-mono text-small tracking-[0.18em] text-muted uppercase";

/**
 * Cell padding is set from the NARROWEST width the table is ever shown at.
 * `md` is 768px, which leaves 688px inside the container, and six columns of
 * `px-3` spend 144px of that on gutters alone — enough to push the table past
 * the viewport and scroll the page sideways. 8px at md, 12px once `lg` has the
 * room to spare.
 */
const TH = cn(META_LABEL, "px-2 pb-3 font-normal lg:px-3");
const TD = "px-2 py-4 align-top lg:px-3";

function Missing() {
  return <span className="text-muted">Not given</span>;
}

function Submitted({ at }: { at: Date }) {
  return (
    <time dateTime={at.toISOString()} className="font-mono text-small text-muted">
      {submittedFormat.format(at)}
    </time>
  );
}

interface ContactsTableProps {
  rows: readonly ContactRow[];
}

/**
 * Marks a submission whose honeypot was filled.
 *
 * These are stored rather than discarded, because the honeypot is evidence and
 * not proof — a password manager filling an off-screen input produces exactly
 * the same signal as a bot. The tag is the whole point of storing them: an
 * unmarked flagged row would read as a genuine enquiry, and a discarded one
 * would have been a real message thrown away in silence.
 *
 * Deliberately not the accent colour. It is a caveat, not the thing to click.
 */
function SuspectedBotTag() {
  return (
    <span
      title="The honeypot field was filled. Usually a bot — but a password manager can do it too, so read it before deleting."
      className="inline-flex shrink-0 items-center rounded-full border border-line px-2 py-0.5 font-mono text-small tracking-[0.18em] text-muted uppercase"
    >
      Suspected bot
    </span>
  );
}

export function ContactsTable({ rows }: ContactsTableProps) {
  return (
    <>
      {/* ── Base: cards ─────────────────────────────────────────────── */}
      <ul className="flex flex-col gap-4 md:hidden">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-col gap-4 rounded-md border border-line bg-raised p-4"
          >
            <div className="flex flex-col gap-1">
              <p className="flex flex-wrap items-center gap-2 font-medium text-fg">
                {row.name}
                {row.suspectedBot ? <SuspectedBotTag /> : null}
              </p>
              {/*
                A sibling link, not a wrapper. The row is never one big link:
                emailing, re-statusing and reading notes are three concerns and
                they get three controls that do not nest.
              */}
              <a
                href={`mailto:${row.email}`}
                className="font-mono text-small text-muted underline-offset-4 hover:text-fg hover:underline"
              >
                {row.email}
              </a>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="flex flex-col gap-1">
                <dt className={META_LABEL}>Company</dt>
                <dd className="text-small">{row.company || <Missing />}</dd>
              </div>

              <div className="flex flex-col gap-1">
                <dt className={META_LABEL}>Budget</dt>
                <dd className="text-small">{row.budget || <Missing />}</dd>
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <dt className={META_LABEL}>Submitted</dt>
                <dd>
                  <Submitted at={row.createdAt} />
                </dd>
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <dt className={META_LABEL}>Message</dt>
                {/*
                  Truncated on purpose. The full text is what the notes modal
                  opens onto; a row that grows to forty lines stops being a row.
                */}
                <dd className="line-clamp-3 text-small text-muted">
                  {row.message || <Missing />}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col gap-3 border-t border-line pt-4">
              <StatusSelect id={row.id} name={row.name} status={row.status} />
              <NotesButton
                contactId={row.id}
                contactName={row.name}
                message={row.message}
                count={row.noteCount}
                className="w-full"
              />
            </div>
          </li>
        ))}
      </ul>

      {/* ── md and up: the table ────────────────────────────────────── */}
      <div className="hidden md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Contact submissions, newest first. Each row&rsquo;s status can be changed in
            place.
          </caption>

          <thead>
            <tr className="border-b border-line">
              <th scope="col" className={TH}>
                Submission
              </th>
              <th scope="col" className={TH}>
                Company
              </th>
              <th scope="col" className={TH}>
                Budget
              </th>
              <th scope="col" className={TH}>
                Status
              </th>
              <th scope="col" className={TH}>
                Submitted
              </th>
              <th scope="col" className={cn(TH, "text-right")}>
                Notes
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-b-0">
                {/*
                  A <td>, not a <th scope="row">. A row header is announced
                  before every other cell in its row, and this one contains the
                  message — so every status and every date would be prefixed by
                  a paragraph of prose. The <caption> carries the orientation
                  instead.
                */}
                <td className={TD}>
                  <span className="flex flex-wrap items-center gap-2 font-medium text-fg">
                    {row.name}
                    {row.suspectedBot ? <SuspectedBotTag /> : null}
                  </span>
                  <a
                    href={`mailto:${row.email}`}
                    className="font-mono text-small text-muted underline-offset-4 hover:text-fg hover:underline"
                  >
                    {row.email}
                  </a>
                  <span className="mt-2 line-clamp-2 max-w-[38ch] text-small text-muted">
                    {row.message || "No message"}
                  </span>
                </td>

                <td className={cn(TD, "text-small")}>{row.company || <Missing />}</td>
                <td className={cn(TD, "text-small")}>{row.budget || <Missing />}</td>

                <td className={cn(TD, "min-w-[9rem]")}>
                  <StatusSelect id={row.id} name={row.name} status={row.status} />
                </td>

                <td className={TD}>
                  <Submitted at={row.createdAt} />
                </td>

                <td className={cn(TD, "text-right")}>
                  <NotesButton
                    contactId={row.id}
                    contactName={row.name}
                    message={row.message}
                    count={row.noteCount}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
