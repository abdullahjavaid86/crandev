import type { ObjectId } from "mongodb";

/**
 * Admin portal shapes. No zod here — these documents are written by our own
 * code, not by a form, so the boundary that needs validating is the login and
 * account forms, not the collection itself.
 */

export const SUBMISSION_STATUSES = [
  "pending",
  "contacted",
  "responded",
  "closed",
  "lost",
] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

/** What a note can be attached to. Generic so meetings and applications
 *  inherit annotation with no schema change. */
export const SUBJECT_TYPES = ["contact", "meetings", "applications"] as const;
export type SubjectType = (typeof SUBJECT_TYPES)[number];

export interface AdminDoc {
  _id: ObjectId;
  email: string;
  name: string;
  /** bcrypt hash. Named `password` by the owner's instruction, knowingly. */
  password: string;
  /** Checked on EVERY request, not just at login. */
  active: boolean;
  totpSecret?: string;
  totpEnabled: boolean;
  /** bcrypt hashes of single-use recovery codes. */
  backupCodes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionDoc {
  _id: ObjectId;
  adminId: ObjectId;
  /** SHA-256 of the cookie token. The raw token is never stored. */
  tokenHash: string;
  userAgent: string;
  ip: string;
  createdAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
}

export interface LoginAttemptDoc {
  _id: ObjectId;
  /** Caller address. Attempts are counted per address, never per email —
   *  counting per email lets anyone lock out a known account. */
  address: string;
  createdAt: Date;
}

export interface NoteDoc {
  _id: ObjectId;
  subjectType: SubjectType;
  subjectId: ObjectId;
  adminId: ObjectId;
  body: string;
  createdAt: Date;
}

/** What a page or action receives once authorization has passed. Deliberately
 *  not the full AdminDoc — nothing downstream needs the hash or the secret. */
export interface CurrentAdmin {
  id: string;
  email: string;
  name: string;
  totpEnabled: boolean;
}
