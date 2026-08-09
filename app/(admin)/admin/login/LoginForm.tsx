"use client";

import { useActionState, useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/Button";
import { Field, controlStyles } from "@/components/ui/Field";
import { login } from "@/lib/admin/actions";
import { LOGIN_INITIAL, type LoginState } from "@/lib/admin/login-state";
import { cn } from "@/lib/utils";

/**
 * The login form.
 *
 * `login` is imported from a `"use server"` module, so what crosses this
 * boundary is an action reference, not the implementation — bcrypt and the
 * mongo driver stay on the server. The result TYPE comes from
 * `lib/admin/login-state`, which imports nothing, for the same reason.
 *
 * On success the action redirects to /admin itself. There is deliberately no
 * navigation here: two places deciding where a successful login lands is two
 * places to get it wrong.
 */

/**
 * What the form shows after an attempt. Derived from the action's state rather
 * than stored alongside it, so there is exactly one source of truth.
 */
interface Notice {
  /** `error` is a rejected attempt; `blocked` is a correct password we cannot yet honour. */
  tone: "error" | "blocked";
  text: string;
  /** Rendered in the mono face — it means machine output, so it is a command, never prose. */
  command?: string;
}

/**
 * 2FA is phase 3 and the second-factor step does not exist. Faking a TOTP input
 * that posts nowhere would be worse than saying so: the admin's password was
 * accepted, and the only way forward today is the reset script.
 */
const TOTP_NOTICE: Notice = {
  tone: "blocked",
  text:
    "Those details were right, but the two-factor step is not built yet, so sign-in " +
    "cannot finish. Turn two-factor off for this account from the repo, then sign in again.",
  command: "yarn admin:reset-2fa <email>",
};

/**
 * Switch with no `default`, so adding a state to `LoginState` fails the build
 * here rather than silently rendering nothing (data-and-forms: model async
 * state as a discriminated union and let the compiler find the missing UI).
 */
function noticeFor(state: LoginState): Notice | null {
  switch (state.status) {
    case "idle":
      return null;
    case "totp_required":
      return TOTP_NOTICE;
    case "error":
      return { tone: "error", text: state.message };
  }
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, LOGIN_INITIAL);
  const noticeId = useId();
  const noticeRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  /** Last submitted address, so a rejected attempt can put it back. */
  const submittedEmail = useRef("");

  const notice = noticeFor(state);
  const announcement = notice
    ? [notice.text, notice.command].filter(Boolean).join(" ")
    : "";

  useEffect(() => {
    if (state.status === "idle") return;

    /*
      React 19 resets an uncontrolled form once its action resolves. That is
      right for the password and wrong for the address: a rejected attempt must
      never make someone retype what was probably correct. Verified in the
      browser — without this line the email field comes back empty.

      Restored by writing to the DOM rather than by making the input controlled.
      A controlled value would be "" in the server HTML, so anything typed
      before hydration would be wiped on hydrate — trading a failed-submit bug
      for a worse one on the very path the <form action> is there to support.
    */
    const email = emailRef.current;
    if (email && !email.value) email.value = submittedEmail.current;

    /*
      Move focus to the outcome. Without this a keyboard user submits, nothing
      navigates, and the only feedback is above a button whose label has
      already gone back to "Sign in".

      Keyed on `state`, a fresh object per attempt, so the same wrong password
      twice re-announces rather than going quiet the second time.
    */
    noticeRef.current?.focus();
  }, [state]);

  return (
    <form
      action={formAction}
      // Runs before the action and does not preventDefault, so the plain POST
      // path is untouched. It exists only to remember the address.
      onSubmit={() => {
        submittedEmail.current = emailRef.current?.value ?? "";
      }}
      className="flex flex-col gap-6"
    >
      <Field label="Email" required>
        {(props) => (
          <input
            {...props}
            ref={emailRef}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="off"
            spellCheck={false}
            aria-describedby={
              cn(props["aria-describedby"], notice ? noticeId : undefined) || undefined
            }
            aria-invalid={state.status === "error" ? true : undefined}
            className={controlStyles}
          />
        )}
      </Field>

      <Field label="Password" required>
        {(props) => (
          /*
            Uncontrolled and never given a value from state: the submitted
            password is not carried back into the markup, so it cannot end up
            in the RSC payload or in a DOM snapshot.
          */
          <input
            {...props}
            name="password"
            type="password"
            autoComplete="current-password"
            aria-describedby={
              cn(props["aria-describedby"], notice ? noticeId : undefined) || undefined
            }
            aria-invalid={state.status === "error" ? true : undefined}
            className={controlStyles}
          />
        )}
      </Field>

      {/*
        Two elements, and only one of them is ever in the layout.

        The live region is permanent — a region inserted at the same moment as
        its text is announced unreliably — but it is `sr-only`, so it reserves
        no height and, as a flex child of a `gap-6` column, no gap either.

        The visible notice renders ONLY when there is one. An always-present
        slot with `min-h-*` would hold open a dead row plus 48px of gap under
        the password field on every visit, which is the bug this avoids.
      */}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>

      {notice ? (
        <div
          id={noticeId}
          ref={noticeRef}
          tabIndex={-1}
          className={cn(
            "flex flex-col gap-2 rounded-md border bg-inset px-4 py-3 text-small",
            notice.tone === "error"
              ? "border-line-strong text-fg"
              : "border-line text-fg",
          )}
        >
          <p>{notice.text}</p>
          {notice.command ? (
            <code className="font-mono text-small break-words text-muted">
              {notice.command}
            </code>
          ) : null}
        </div>
      ) : null}

      <Button type="submit" variant="primary" disabled={pending} className="w-full">
        {/* The verb survives the wait. "Please wait" tells you nothing. */}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
