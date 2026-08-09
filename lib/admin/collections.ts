import "server-only";
import type { Collection } from "mongodb";
import { getDb } from "@/lib/db/client";
import type { AdminDoc, LoginAttemptDoc, NoteDoc, SessionDoc } from "./types";

/**
 * Typed collection accessors. One place that knows collection names, so a
 * rename is a single edit rather than a grep.
 */
export async function adminsCollection(): Promise<Collection<AdminDoc>> {
  return (await getDb()).collection<AdminDoc>("admins");
}

export async function sessionsCollection(): Promise<Collection<SessionDoc>> {
  return (await getDb()).collection<SessionDoc>("sessions");
}

export async function notesCollection(): Promise<Collection<NoteDoc>> {
  return (await getDb()).collection<NoteDoc>("notes");
}

/** Failed login attempts. Rows expire themselves via the TTL index below. */
export async function loginAttemptsCollection(): Promise<Collection<LoginAttemptDoc>> {
  return (await getDb()).collection<LoginAttemptDoc>("login_attempts");
}

/**
 * Indexes the portal depends on. Idempotent, so it is safe to call from the
 * seeder and from anywhere else that wants to guarantee them.
 *
 * The TTL index on sessions.expiresAt is what removes expired rows — there is
 * no cleanup job, and there should not be one.
 */
export async function ensureAdminIndexes(): Promise<void> {
  const admins = await adminsCollection();
  const sessions = await sessionsCollection();
  const notes = await notesCollection();

  await admins.createIndex({ email: 1 }, { unique: true });
  await sessions.createIndex({ tokenHash: 1 }, { unique: true });
  await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await sessions.createIndex({ adminId: 1 });
  await notes.createIndex({ subjectType: 1, subjectId: 1, createdAt: -1 });

  const attempts = await loginAttemptsCollection();
  await attempts.createIndex({ address: 1, createdAt: -1 });
  // Attempts are only interesting inside the rate-limit window; the TTL index
  // clears them so the collection cannot grow without bound under attack.
  await attempts.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });
}
