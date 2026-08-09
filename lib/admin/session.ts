import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { ObjectId } from "mongodb";
import { adminsCollection, sessionsCollection } from "./collections";
import type { CurrentAdmin } from "./types";

/**
 * Session handling for the admin portal.
 *
 * Sessions are rows, not JWTs. Revocation and the per-request `active` check
 * both need a database lookup anyway, so statelessness would buy nothing and
 * cost the ability to revoke.
 */

export const SESSION_COOKIE = "cranedev_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** The cookie carries this; the database stores only its hash. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Constant-time compare for anything derived from user input. Not strictly
 * required for a hash lookup, but cheap, and it keeps the habit.
 */
export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function createSession(adminId: ObjectId): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const h = await headers();
  const sessions = await sessionsCollection();
  const now = new Date();

  await sessions.insertOne({
    _id: new ObjectId(),
    adminId,
    tokenHash: hashToken(token),
    userAgent: h.get("user-agent")?.slice(0, 200) ?? "unknown",
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    createdAt: now,
    lastSeenAt: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // Scoped to /admin, so the marketing site never carries this cookie.
    path: "/admin",
    expires: new Date(now.getTime() + SESSION_TTL_MS),
  });
}

/** Destroys the current session row and clears the cookie. */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const sessions = await sessionsCollection();
    await sessions.deleteOne({ tokenHash: hashToken(token) });
  }
  jar.delete({ name: SESSION_COOKIE, path: "/admin" });
}

/** Revokes every session for an admin except, optionally, the current one. */
export async function revokeOtherSessions(
  adminId: ObjectId,
  keepToken?: string,
): Promise<number> {
  const sessions = await sessionsCollection();
  const filter: Record<string, unknown> = { adminId };
  if (keepToken) filter.tokenHash = { $ne: hashToken(keepToken) };
  const result = await sessions.deleteMany(filter);
  return result.deletedCount;
}

export async function currentSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/**
 * Resolves the caller, or null.
 *
 * This is where `active` is enforced. An admin deactivated mid-session fails
 * here on their very next request rather than at their next login, and their
 * session row is deleted on the way out so it cannot be retried.
 */
export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const token = await currentSessionToken();
  if (!token) return null;

  const sessions = await sessionsCollection();
  const session = await sessions.findOne({ tokenHash: hashToken(token) });
  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await sessions.deleteOne({ _id: session._id });
    return null;
  }

  const admins = await adminsCollection();
  const admin = await admins.findOne({ _id: session.adminId });

  if (!admin || !admin.active) {
    // Deactivated or deleted: kill the session rather than merely refusing.
    await sessions.deleteOne({ _id: session._id });
    return null;
  }

  // Sliding expiry. Only written when it has meaningfully moved, so a burst of
  // requests does not become a burst of writes.
  const since = Date.now() - session.lastSeenAt.getTime();
  if (since > 60_000) {
    await sessions.updateOne(
      { _id: session._id },
      {
        $set: {
          lastSeenAt: new Date(),
          expiresAt: new Date(Date.now() + SESSION_TTL_MS),
        },
      },
    );
  }

  return {
    id: admin._id.toHexString(),
    email: admin.email,
    name: admin.name,
    totpEnabled: admin.totpEnabled,
  };
}
