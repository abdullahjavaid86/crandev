"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { collections, getDb } from "@/lib/db/client";
import { requireAdmin } from "./guard";
import { notesCollection } from "./collections";
import { listNotes, type NoteRow } from "./notes";
import { SUBMISSION_STATUSES, type SubmissionStatus } from "./types";

/**
 * Mutations for the contacts screens.
 *
 * Every action calls requireAdmin() FIRST. A Server Action is a public POST
 * endpoint and the proxy is not the authorization boundary — an action without
 * this call is unauthenticated wherever it happens to live.
 *
 * This module exports only async actions. Reads are in ./contacts.ts and
 * ./notes.ts.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Notes for one submission, loaded when the modal opens.
 *
 * An action rather than a prop because server-rendering every row's notes to
 * populate a dialog almost nobody opens would be a query per row on every page
 * view. The row already carries `noteCount`, which is all the table needs.
 */
export async function fetchContactNotes(contactId: string): Promise<NoteRow[]> {
  await requireAdmin();
  return listNotes("contact", contactId);
}

const MAX_NOTE = 4000;

export async function setContactStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
  await requireAdmin();

  if (!ObjectId.isValid(id)) return { ok: false, error: "Unknown submission." };
  // Never trust the value a select posted — the list is closed.
  if (!(SUBMISSION_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: "Unknown status." };
  }

  try {
    const db = await getDb();
    const result = await db
      .collection(collections.contact)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: status as SubmissionStatus, statusUpdatedAt: new Date() } },
      );
    if (result.matchedCount === 0) {
      return { ok: false, error: "That submission no longer exists." };
    }
    revalidatePath("/admin/contacts");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("[admin] setContactStatus failed", error);
    return { ok: false, error: "That did not save. Try again." };
  }
}

export async function addContactNote(
  contactId: string,
  body: string,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  if (!ObjectId.isValid(contactId)) {
    return { ok: false, error: "Unknown submission." };
  }

  const trimmed = body.trim();
  if (trimmed.length === 0) return { ok: false, error: "Write something first." };
  if (trimmed.length > MAX_NOTE) {
    return { ok: false, error: `Notes are capped at ${MAX_NOTE} characters.` };
  }

  try {
    const notes = await notesCollection();
    await notes.insertOne({
      _id: new ObjectId(),
      subjectType: "contact",
      subjectId: new ObjectId(contactId),
      adminId: new ObjectId(admin.id),
      body: trimmed,
      createdAt: new Date(),
    });
    revalidatePath("/admin/contacts");
    return { ok: true };
  } catch (error) {
    console.error("[admin] addContactNote failed", error);
    return { ok: false, error: "That did not save. Try again." };
  }
}
