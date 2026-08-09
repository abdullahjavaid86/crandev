import { z } from "zod";
import { BUDGET_BANDS } from "./bands";

export { BUDGET_BANDS };

/**
 * The contact form's shape. Shared by the client (for convenience checks) and
 * the Server Action (for the check that actually counts).
 *
 * No `'use server'` here on purpose — this module is imported by both sides,
 * and a Server Action module may only export async actions.
 *
 * Every string is CAPPED. A Server Action is a public POST endpoint, so an
 * uncapped textarea is an unbounded write to the database by anyone who can
 * type a URL.
 */

export const ContactInput = z.object({
  name: z.string().trim().min(1, "Tell us who you are.").max(80),
  email: z.email("That does not look like an email address.").max(254),
  company: z.string().trim().max(80).optional().or(z.literal("")),
  /**
   * The one field worth reading. Long enough to describe a system, capped so
   * it cannot be used as free storage.
   */
  message: z
    .string()
    .trim()
    .min(20, "A sentence or two about the system, so we can reply usefully.")
    .max(2000),
  budget: z.enum(BUDGET_BANDS),
});

export type ContactInput = z.infer<typeof ContactInput>;

/**
 * What the action gives back. A discriminated union rather than a bag of
 * booleans, so the form cannot render a state the compiler has not seen —
 * and so a driver error can never be the thing that reaches the client.
 */
export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      /** Shown to the user. Never an exception message. */
      message: string;
      /** Keyed by field name, for inline errors and focus. */
      fieldErrors?: Partial<Record<keyof ContactInput, string>>;
      /**
       * What was submitted, echoed back so the form can restore it.
       *
       * React 19 resets an uncontrolled form once its action resolves — which
       * silently wipes everything typed on a validation failure. Restoring via
       * `defaultValue` works WITH that reset (a form reset restores inputs to
       * their defaultValue) and keeps working with JavaScript off.
       */
      values?: Partial<Record<keyof ContactInput, string>>;
    };
