"use server";

import { headers } from "next/headers";
import { collections, getDb } from "@/lib/db/client";
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
  // Honeypot. A real person never sees this field, so anything in it is a bot.
  // Answered with success rather than an error: telling a bot it was detected
  // only tells it what to change.
  if (String(formData.get("website") ?? "").length > 0) {
    return { status: "success" };
  }

  const parsed = ContactInput.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    message: formData.get("message"),
    budget: formData.get("budget"),
  });

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
        };
      }
    }

    await contact.insertOne({
      ...parsed.data,
      address,
      source: "home-contact",
      createdAt: new Date(),
    });

    return { status: "success" };
  } catch (error) {
    // The real error stays server-side. What reaches the client says what to
    // do next and nothing about the database (§7.3).
    console.error("contact submission failed", error);
    return {
      status: "error",
      message:
        "That did not send. Try again, or write to us directly and we will pick it up.",
    };
  }
}
