import "server-only";
import { ObjectId } from "mongodb";
import { collections, getDb } from "@/lib/db/client";
import { SUBMISSION_STATUSES, type SubmissionStatus } from "./types";

/**
 * Reads for the contacts screens. Queries only — the mutations live in
 * ./contact-actions.ts, because a `'use server'` module may export nothing but
 * async actions.
 *
 * Every function here assumes the caller has already passed requireAdmin().
 * They do not check authorization themselves; the guard is the boundary, and
 * duplicating it here would imply these are safe to call from anywhere.
 */

export const PAGE_SIZE = 20;

export interface ContactRow {
  id: string;
  name: string;
  email: string;
  company: string;
  budget: string;
  message: string;
  status: SubmissionStatus;
  createdAt: Date;
  noteCount: number;
  /**
   * The honeypot was filled. Probably a bot — but only probably, which is why
   * the submission is stored rather than discarded, and why this has to be
   * visible: an unmarked flagged row reads as a genuine lead.
   */
  suspectedBot: boolean;
}

export interface ContactPage {
  rows: ContactRow[];
  total: number;
  page: number;
  pageCount: number;
}

/** Documents written before the status field existed have no status. */
const DEFAULT_STATUS: SubmissionStatus = "pending";

export interface ContactQuery {
  page?: number;
  status?: SubmissionStatus | "all";
}

export async function listContacts({
  page = 1,
  status = "all",
}: ContactQuery = {}): Promise<ContactPage> {
  const db = await getDb();
  const filter =
    status === "all"
      ? {}
      : status === DEFAULT_STATUS
        ? // Older documents predate the field, so "pending" must also mean
          // "no status recorded" or they would be invisible in the one view
          // most likely to be checked.
          { $or: [{ status: DEFAULT_STATUS }, { status: { $exists: false } }] }
        : { status };

  const contact = db.collection(collections.contact);
  const total = await contact.countDocuments(filter);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), pageCount);

  const docs = await contact
    .find(filter)
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .toArray();

  // One aggregate for note counts rather than a query per row.
  const ids = docs.map((d) => d._id as ObjectId);
  const counts = new Map<string, number>();
  if (ids.length > 0) {
    const grouped = await db
      .collection("notes")
      .aggregate<{ _id: ObjectId; n: number }>([
        { $match: { subjectType: "contact", subjectId: { $in: ids } } },
        { $group: { _id: "$subjectId", n: { $sum: 1 } } },
      ])
      .toArray();
    for (const g of grouped) counts.set(g._id.toHexString(), g.n);
  }

  return {
    rows: docs.map((d) => {
      const id = (d._id as ObjectId).toHexString();
      return {
        id,
        name: String(d.name ?? ""),
        email: String(d.email ?? ""),
        company: String(d.company ?? ""),
        budget: String(d.budget ?? ""),
        message: String(d.message ?? ""),
        status: (SUBMISSION_STATUSES as readonly string[]).includes(String(d.status))
          ? (d.status as SubmissionStatus)
          : DEFAULT_STATUS,
        createdAt: d.createdAt instanceof Date ? d.createdAt : new Date(0),
        noteCount: counts.get(id) ?? 0,
        suspectedBot: d.suspectedBot === true,
      };
    }),
    total,
    page: safePage,
    pageCount,
  };
}

export interface ContactStats {
  total: number;
  newThisWeek: number;
  byStatus: Record<SubmissionStatus, number>;
  /** Age in days of the oldest submission still pending, or null if none. */
  oldestPendingDays: number | null;
}

/** Real counts only. Nothing here is estimated or rounded. */
export async function contactStats(): Promise<ContactStats> {
  const db = await getDb();
  const contact = db.collection(collections.contact);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, newThisWeek, grouped, oldestPending] = await Promise.all([
    contact.countDocuments({}),
    contact.countDocuments({ createdAt: { $gt: weekAgo } }),
    contact
      .aggregate<{ _id: string | null; n: number }>([
        { $group: { _id: "$status", n: { $sum: 1 } } },
      ])
      .toArray(),
    contact
      .find({ $or: [{ status: DEFAULT_STATUS }, { status: { $exists: false } }] })
      .sort({ createdAt: 1 })
      .limit(1)
      .toArray(),
  ]);

  const byStatus = Object.fromEntries(SUBMISSION_STATUSES.map((s) => [s, 0])) as Record<
    SubmissionStatus,
    number
  >;
  for (const g of grouped) {
    const key = (g._id ?? DEFAULT_STATUS) as SubmissionStatus;
    if (key in byStatus) byStatus[key] += g.n;
  }

  const oldest = oldestPending[0]?.createdAt;
  const oldestPendingDays =
    oldest instanceof Date
      ? Math.floor((Date.now() - oldest.getTime()) / 86_400_000)
      : null;

  return { total, newThisWeek, byStatus, oldestPendingDays };
}
