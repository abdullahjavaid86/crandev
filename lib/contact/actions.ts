"use server";

import { headers } from "next/headers";
import { collections, getDb } from "@/lib/db/client";
import { HONEYPOT_FIELD } from "./honeypot";
import { ContactInput, type ContactState } from "./schema";

/**
 * Contact submission.
 *
 * A Server Action is a public POST endpoint — anyone can call it with any
 * payload. Everything the client validated is a convenience for the user and
 * is re-checked here regardless (§7.3).
 *
 * This module exports only the action, per the Server Action rule. Anything
 * that is not an action lives in ./schema.
 */

/** Submissions allowed from one address before we stop writing. */
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;

/**
 * The caller's address, as far as it can be trusted.
 *
 * `x-forwarded-for` is client-settable except behind a proxy that overwrites
 * it — which Vercel does. It is good enough to slow a naive flood down and is
 * NOT an identity: the rate limit it feeds is a courtesy, not a security
 * control.
 */
async function callerAddress(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  /**
   * Honeypot. A person never sees this field, so anything in it is PROBABLY a
   * bot — and "probably" is why this no longer discards the submission.
   *
   * It used to return success and write nothing. That is indistinguishable
   * from the form working, and it is exactly what a password manager or an
   * over-eager autofill produces when it decides an off-screen text input
   * wants a value: the sender is told "That is with us" and the message is
   * destroyed. On a site whose entire job is getting a technical buyer to make
   * contact, silently dropping their message is the worst bug available.
   *
   * So the submission is stored and FLAGGED instead. The bot still learns
   * nothing — the response is unchanged — and no real message is ever lost.
   */
  const suspectedBot = String(formData.get(HONEYPOT_FIELD) ?? "").trim().length > 0;

  const submitted = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    company: String(formData.get("company") ?? ""),
    message: String(formData.get("message") ?? ""),
    budget: String(formData.get("budget") ?? ""),
  };

  const parsed = ContactInput.safeParse(submitted);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof ContactInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) {
        fieldErrors[key as keyof ContactInput] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors,
      values: submitted,
    };
  }

  try {
    const db = await getDb();
    const contact = db.collection(collections.contact);
    const address = await callerAddress();

    // The rate limit reads the same collection rather than adding a second
    // store: one fewer moving part, and an in-memory counter would not
    // survive across serverless instances anyway.
    if (address !== "unknown") {
      const recent = await contact.countDocuments(
        { address, createdAt: { $gt: new Date(Date.now() - RATE_WINDOW_MS) } },
        { limit: RATE_LIMIT + 1 },
      );
      if (recent >= RATE_LIMIT) {
        return {
          status: "error",
          message:
            "That is several messages in a short time. Write to us directly instead and we will pick it up.",
          values: submitted,
        };
      }
    }

    await contact.insertOne({
      ...parsed.data,
      address,
      source: "home-contact",
      createdAt: new Date(),
      // Set only when the honeypot tripped. Absent on an ordinary submission,
      // so existing documents and queries are unaffected.
      ...(suspectedBot ? { suspectedBot: true } : {}),
    });

    return { status: "success" };
  } catch (error) {
    // A missing MONGODB_URI is an operator error, not a user error, and the
    // two are indistinguishable from the browser — both show the same vague
    // sentence. Label it unmistakably in the log so "nothing arrived" is not
    // mistaken for a silent failure. `yarn db:check` tests it directly.
    const misconfigured =
      error instanceof Error && error.message.includes("MONGODB_URI");
    console.error(
      misconfigured
        ? "[contact] NOT CONFIGURED — MONGODB_URI is unset, so nothing was written. See DEPLOYMENT.md §2 or run `yarn db:check`."
        : "[contact] submission failed",
      error,
    );
    return {
      status: "error",
      message:
        "That did not send. Try again, or write to us directly and we will pick it up.",
      values: submitted,
    };
  }
}
