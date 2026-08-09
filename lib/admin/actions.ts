"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { adminsCollection, loginAttemptsCollection } from "./collections";
import { createSession, destroySession } from "./session";
import { verifyPassword } from "./passwords";
import type { LoginState } from "./login-state";

/**
 * Admin authentication actions.
 *
 * This module exports only async actions, per the Server Action rule. Types and
 * helpers live in sibling modules.
 *
 * Every failure returns the SAME message. Distinguishing "no such admin" from
 * "wrong password" from "deactivated" hands an attacker an account enumerator.
 */

const GENERIC_FAILURE = "Those details did not work.";

/** Failed attempts allowed per address before we stop checking. */
const MAX_ATTEMPTS = 8;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

async function callerAddress(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/**
 * Rate limit by caller address, in its own TTL-expiring collection.
 *
 * Counted per ADDRESS, never per email: counting per email means anyone who
 * knows an admin's address can lock them out by failing eight times.
 */
async function tooManyAttempts(address: string): Promise<boolean> {
  if (address === "unknown") return false;
  const attempts = await loginAttemptsCollection();
  const recent = await attempts.countDocuments(
    { address, createdAt: { $gt: new Date(Date.now() - ATTEMPT_WINDOW_MS) } },
    { limit: MAX_ATTEMPTS + 1 },
  );
  return recent >= MAX_ATTEMPTS;
}

async function recordFailedAttempt(address: string): Promise<void> {
  if (address === "unknown") return;
  const attempts = await loginAttemptsCollection();
  await attempts.insertOne({ _id: new ObjectId(), address, createdAt: new Date() });
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { status: "error", message: GENERIC_FAILURE };

  const address = await callerAddress();
  if (await tooManyAttempts(address)) {
    return { status: "error", message: "Too many attempts. Wait a few minutes." };
  }

  const admins = await adminsCollection();
  const admin = await admins.findOne({ email });

  // Same branch, same message, whether the admin is missing, deactivated, or
  // the password is wrong.
  if (!admin || !admin.active || !(await verifyPassword(password, admin.password))) {
    await recordFailedAttempt(address);
    return { status: "error", message: GENERIC_FAILURE };
  }

  if (admin.totpEnabled) {
    // Phase 3 completes this. Until then an admin with 2FA on cannot log in,
    // which is the safe direction to fail: no admin has it on yet, because
    // there is no screen to turn it on.
    return { status: "totp_required" };
  }

  await createSession(admin._id);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
