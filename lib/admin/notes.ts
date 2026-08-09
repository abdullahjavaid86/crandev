import "server-only";
import { ObjectId } from "mongodb";
import { notesCollection } from "./collections";
import { adminsCollection } from "./collections";
import type { SubjectType } from "./types";

/**
 * Note reads. Generic over subject, so meetings and applications get
 * annotation with no schema change (see the admin-portal skill).
 *
 * Mutations live in ./contact-actions.ts. Callers must already have passed
 * requireAdmin().
 */

export interface NoteRow {
  id: string;
  body: string;
  authorName: string;
  createdAt: Date;
}

export async function listNotes(
  subjectType: SubjectType,
  subjectId: string,
): Promise<NoteRow[]> {
  if (!ObjectId.isValid(subjectId)) return [];

  const notes = await notesCollection();
  const docs = await notes
    .find({ subjectType, subjectId: new ObjectId(subjectId) })
    .sort({ createdAt: -1 })
    .toArray();

  if (docs.length === 0) return [];

  // Resolve author names in one query rather than per note.
  const admins = await adminsCollection();
  const authorIds = [...new Set(docs.map((d) => d.adminId.toHexString()))];
  const authors = await admins
    .find({ _id: { $in: authorIds.map((id) => new ObjectId(id)) } })
    .project<{ _id: ObjectId; name: string }>({ name: 1 })
    .toArray();
  const names = new Map(authors.map((a) => [a._id.toHexString(), a.name]));

  return docs.map((d) => ({
    id: d._id.toHexString(),
    body: d.body,
    // A note outlives the admin who wrote it. Losing the attribution is worse
    // than showing that the author is gone.
    authorName: names.get(d.adminId.toHexString()) ?? "Removed admin",
    createdAt: d.createdAt,
  }));
}
