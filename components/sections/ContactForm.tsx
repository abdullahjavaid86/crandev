"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, controlStyles } from "@/components/ui/Field";
import { submitContact } from "@/lib/contact/actions";
import { BUDGET_BANDS } from "@/lib/contact/bands";
import type { ContactState } from "@/lib/contact/schema";
import { cn } from "@/lib/utils";

const INITIAL: ContactState = { status: "idle" };

/**
 * The contact form. A client leaf so the section stays a server component.
 *
 * Uses `useActionState`, so the form works before hydration: it is a real
 * `<form action={…}>` posting to a Server Action, and JavaScript only upgrades
 * the experience rather than being required for it.
 *
 * Nothing here is the security boundary. The action re-validates everything
 * (§7.3) — these checks exist so a person is told about a typo before a round
 * trip, not to decide what reaches the database.
 */
export function ContactForm({ className }: { className?: string }) {
  const [state, action, pending] = useActionState(submitContact, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const fieldErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  /**
   * React 19 resets an uncontrolled form once its action resolves, which wipes
   * everything typed on a validation failure — and §7 forbids clearing what
   * the user typed. Restoring through `defaultValue` works WITH that reset
   * rather than against it: a form reset restores inputs to their defaultValue,
   * so the values the action echoed back become the values the reset lands on.
   * It also survives with JavaScript off, which a client-side ref would not.
   */
  const prior = state.status === "error" ? (state.values ?? {}) : {};

  /**
   * Move focus to the first invalid control, or to the error summary when the
   * failure is not field-specific. Without this a keyboard user submits, the
   * page appears unchanged, and the reason is somewhere they are not.
   */
  useEffect(() => {
    if (state.status !== "error") return;
    const form = formRef.current;
    if (!form) return;
    const firstInvalid = form.querySelector<HTMLElement>("[aria-invalid='true']");
    (firstInvalid ?? errorRef.current)?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        className={cn("rounded-md border border-line bg-raised p-6 md:p-8", className)}
      >
        {/* The success state replaces the form rather than sitting beside it,
            and says what happens next and by when — a toast that leaves the
            filled-in form on screen reads as "did that send?" */}
        <div className="flex items-start gap-3">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-fg" />
          <div>
            <h3 className="text-h3">That is with us.</h3>
            <p className="mt-2 max-w-[52ch] text-muted">
              One of the people who would do the work will read it and reply within one
              business day. No sales call in between.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      className={cn("flex flex-col gap-6", className)}
    >
      {/* Honeypot: off-screen rather than display:none, which some bots skip,
          and hidden from assistive tech and the tab order. */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="website">Leave this empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Your name" required error={fieldErrors.name}>
          {(f) => (
            <input
              {...f}
              name="name"
              defaultValue={prior.name ?? ""}
              type="text"
              autoComplete="name"
              maxLength={80}
              className={controlStyles}
            />
          )}
        </Field>

        <Field label="Email" required error={fieldErrors.email}>
          {(f) => (
            <input
              {...f}
              name="email"
              defaultValue={prior.email ?? ""}
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              className={controlStyles}
            />
          )}
        </Field>

        <Field label="Company" error={fieldErrors.company}>
          {(f) => (
            <input
              {...f}
              name="company"
              defaultValue={prior.company ?? ""}
              type="text"
              autoComplete="organization"
              maxLength={80}
              className={controlStyles}
            />
          )}
        </Field>

        <Field label="Budget" required error={fieldErrors.budget}>
          {(f) => (
            <select
              {...f}
              name="budget"
              defaultValue={prior.budget ?? ""}
              className={controlStyles}
            >
              <option value="" disabled>
                Select a band
              </option>
              {BUDGET_BANDS.map((band) => (
                <option key={band} value={band}>
                  {band}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field
        label="What are you building?"
        required
        description="The system, what is wrong with it, and what you want to be true instead."
        error={fieldErrors.message}
      >
        {(f) => (
          <textarea
            {...f}
            name="message"
            defaultValue={prior.message ?? ""}
            rows={5}
            maxLength={2000}
            className={cn(controlStyles, "min-h-32 resize-y")}
          />
        )}
      </Field>

      {/* Announced when it appears, without stealing focus from a reader who
          is mid-sentence. tabIndex allows the effect above to move focus here
          when the failure belongs to no single field. */}
      {/* Persistent live region, no layout cost. See Field for why it is
          split from the visible message. */}
      <span aria-live="polite" className="sr-only">
        {state.status === "error" ? state.message : ""}
      </span>
      {state.status === "error" ? (
        <p ref={errorRef} tabIndex={-1} className="text-small text-fg">
          {state.message}
        </p>
      ) : null}

      <div>
        {/* The verb survives the state change — "Send" becomes "Sending", not
            "Please wait" (§8). */}
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Sending…" : "Send"}
        </Button>
      </div>
    </form>
  );
}
