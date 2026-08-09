"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Field, controlStyles } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { addContactNote, fetchContactNotes } from "@/lib/admin/contact-actions";
import type { NoteRow } from "@/lib/admin/notes";
import { cn } from "@/lib/utils";

/**
 * Notes for one contact submission (spec: "Contacts (phase 2)" → Notes).
 *
 * Behaviour — focus trap, focus restore, scroll lock, Escape, the mobile
 * bottom sheet that becomes a centred dialog at `md`, and the reduced-motion
 * aware enter/exit — all belongs to `components/ui/Modal`. Nothing here
 * re-implements any of it.
 *
 * `fetchContactNotes` and `addContactNote` come from a `"use server"` module,
 * so what crosses this boundary is an action *reference*, not an
 * implementation: the mongo driver stays on the server and both actions call
 * `requireAdmin()` themselves. `NoteRow` is imported as a TYPE ONLY —
 * `lib/admin/notes` is `server-only`, and a value import from it would drag
 * the driver toward the client bundle, which is how zod once shipped to every
 * visitor.
 *
 * Notes are append-only in v1: no edit, no delete.
 */
export interface NotesDialogProps {
  open: boolean;
  onClose: () => void;
  contactId: string;
  /** Shown in the dialog title so the admin knows whose notes these are. */
  contactName: string;
  /** The full submitted message, shown above the notes as context. */
  message?: string;
}

/** Mirrors MAX_NOTE in lib/admin/contact-actions.ts — the server is the gate. */
const MAX_NOTE = 4000;

/** Only reveal the counter near the ceiling; a permanent one is just noise. */
const COUNTER_FROM = MAX_NOTE - 400;

/**
 * The states as a union, not a bag of booleans — `loading && error` cannot
 * typecheck, and the switch that renders them has no `default`, so adding a
 * member breaks the build rather than silently rendering nothing.
 */
type NotesState =
  { status: "loading" } | { status: "ready"; notes: NoteRow[] } | { status: "error" };

/**
 * FIXED locale, declared once at module scope.
 *
 * A locale-dependent format renders one way on the server and another in the
 * browser, and that is a hydration mismatch. `en-GB` with explicit fields and
 * `hour12: false` is the same string everywhere. The mono face is the design
 * system's signal for machine output, and a timestamp is exactly that (§4.3).
 */
const timestampFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * The read, mapped to a state rather than applied to one.
 *
 * Keeping `setState` out of here is what lets the mount effect below call it:
 * an effect that reaches a state setter through a helper cascades a render,
 * and `react-hooks/set-state-in-effect` traces the helper to find it. Handing
 * back the next state instead means the effect's only write happens in the
 * promise callback, which is the shape the rule is asking for.
 *
 * A failed read is not exceptional — the network drops, the session expires
 * — so it is logged server-side-style and turned into a state, never thrown.
 */
async function readNotes(contactId: string): Promise<NotesState> {
  try {
    return { status: "ready", notes: await fetchContactNotes(contactId) };
  } catch (error) {
    console.error("[admin] fetchContactNotes failed", error);
    return { status: "error" };
  }
}

export function NotesDialog({
  open,
  onClose,
  contactId,
  contactName,
  message,
}: NotesDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Notes — ${contactName}`}
      description="Notes are permanent. There is no edit and no delete."
    >
      {/*
        Modal mounts its children only while it is open, so the panel below
        gets fresh state on every open for free: no reset effect, no stale
        error from last time, and — the point of the exercise — no fetch until
        the dialog is actually opened. The contacts table renders one of these
        per row; loading on mount would be a query per row on every page view
        for a dialog almost nobody opens, which is why the read is an action
        rather than a prop in the first place.

        Keyed on the contact so that reusing one dialog instance across rows
        can never show the previous row's notes for a frame.
      */}
      <NotesPanel key={contactId} contactId={contactId} message={message} />
    </Modal>
  );
}

function NotesPanel({ contactId, message }: { contactId: string; message?: string }) {
  const [state, setState] = useState<NotesState>({ status: "loading" });

  /*
    The composer is CONTROLLED, and submits through onSubmit rather than
    `<form action={…}>`.

    React 19 resets an uncontrolled form once its action resolves, so a
    rejected note would be silently wiped — the bug that has already bitten
    this codebase twice. The login form solves it by restoring the value from
    a ref, because a controlled input there would be "" in the server HTML and
    anything typed before hydration would be lost on hydrate. That trade-off
    does not exist here: this panel only ever mounts in response to a click,
    so there is no pre-hydration typing to protect and no no-JS path to keep
    working. Controlled is therefore the stronger option — the value lives in
    React state, so there is no reset to fight at all, and the character
    counter reads the same single source.

    It is cleared in exactly one place: after the server confirms the insert.
  */
  const [body, setBody] = useState("");
  const [composerError, setComposerError] = useState<string | null>(null);
  const [added, setAdded] = useState(0);
  const [pending, startTransition] = useTransition();

  const notesRef = useRef<HTMLDivElement>(null);
  /** Guards against a slow first response landing after a retry's. */
  const requestId = useRef(0);

  /*
    Re-read, without touching the skeleton. Called from event handlers only:
    after a note is stored, and from Try again (which sets the skeleton
    itself). Keeping the current list on screen during a refresh matters —
    flashing skeletons straight after adding a note reads as the note having
    been lost.
  */
  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    const next = await readNotes(contactId);
    if (id === requestId.current) setState(next);
  }, [contactId]);

  // Mount === open, per the key/mount comment above. The initial state is
  // already the skeleton, so this effect only ever writes the outcome.
  useEffect(() => {
    const id = ++requestId.current;
    void readNotes(contactId).then((next) => {
      if (id === requestId.current) setState(next);
    });
  }, [contactId]);

  /*
    Radix focuses the first tabbable element on open, which is Modal's close
    button — valid, and useless. Focus goes to the notes region instead: the
    admin lands at the top of the context they opened the dialog for, and Tab
    reaches the composer from there. On the phone that also matters the other
    way round — focusing the textarea would raise the keyboard over a sheet
    the admin has not read yet.

    rAF is what makes it stick: Radix's FocusScope is an ancestor, so its
    effect runs after this one and would otherwise win.

    The region carries tabIndex={-1} for a second reason: it is a scroll
    container, and a scroll container that cannot take focus cannot be
    scrolled from the keyboard at all.
  */
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      // preventScroll because the region is taller than the scrollport:
      // scrolling it "into view" aligns its top with the scrollport edge and
      // eats the modal body's 20px top padding. Measured — it scrolled by
      // exactly that.
      notesRef.current?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = body.trim();
    if (trimmed.length === 0) {
      setComposerError("Write something first.");
      return;
    }

    setComposerError(null);
    startTransition(async () => {
      const result = await addContactNote(contactId, trimmed);
      if (!result.ok) {
        // Deliberately nothing else: `body` is untouched, so what was typed is
        // still in the textarea and still submittable.
        setComposerError(result.error);
        return;
      }

      /*
        Not optimistic, on purpose. `addContactNote` returns `{ ok: true }`,
        not the stored row, and this component has no idea who the signed-in
        admin is — an optimistic note would have to invent its own attribution
        and timestamp, then correct both a moment later. Re-reading costs one
        round trip and every field on screen is the real one.
      */
      setBody("");
      setAdded((n) => n + 1);
      await refresh();
    });
  }

  // The one place the skeleton is switched back on. An event handler, so the
  // state write is a plain response to a click rather than a cascading render.
  function handleRetry() {
    setState({ status: "loading" });
    void refresh();
  }

  const remaining = MAX_NOTE - body.length;
  const noteCount = state.status === "ready" ? state.notes.length : null;

  /*
    ONE permanent sr-only live region, empty until there is something to say.
    A region inserted at the same moment as its text is announced unreliably,
    but `sr-only` means it reserves no height and, as a flex child, no gap
    either. An always-present slot with `min-h-*` would hold open a dead row
    plus a gap — inside a pinned composer, the worst place in this dialog to
    spend 40px.

    It deliberately does NOT carry the composer error: `Field` already owns a
    permanent sr-only region for that, and announcing one sentence twice is
    worse than announcing it once.
  */
  const announcement =
    state.status === "error"
      ? "Those notes did not load."
      : added > 0
        ? "Note added."
        : "";

  return (
    /*
      The composer is pinned with `sticky`, and this negative bottom margin is
      half of what makes that exact. Both halves were measured, not assumed.

      The obvious layout — fill the modal body, scroll the list inside it —
      does not work here, and it fails silently. Modal's panel is capped with
      `max-h-[90dvh]`, so its main size is content-based-then-clamped, which
      per flexbox §9.8 leaves the body's post-flexing height INDEFINITE. A
      `h-full` child therefore resolves to auto, the inner region grows to its
      full content height, and the modal body scrolls instead — measured at
      360px: a 2986px column with the composer 2.3k pixels below the fold.

      So the modal body stays the one scroller and the composer sticks to it.
      The body carries `pb-[calc(1.5rem+env(safe-area-inset-bottom))]`, and
      that padding shows up twice:

      1. A sticky inset is resolved against the scrollport's CONTENT box, not
         its padding box, so a plain `bottom-0` parks the bar 24px short of
         the panel's edge and notes scroll visibly through the strip beneath
         it. The composer's negative `bottom` pushes the pin back down over
         that strip and re-applies the value as its own padding, so the button
         keeps its clearance from the edge and from the iOS home indicator.
      2. That padding sits inside the scrollport but outside this element —
         the sticky box's containing block — so at full scroll the bar would
         hit the clamp and lift by exactly that much. The negative margin here
         lines this element's bottom up with the scrollport's, and the bar
         stays put all the way to the end of the list.
    */
    <div className="-mb-[calc(1.5rem+env(safe-area-inset-bottom))] flex flex-col">
      {/*
        Placed first so the region is in the DOM well before it has anything
        to announce — see the comment on `announcement` above.
      */}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>

      <div
        ref={notesRef}
        tabIndex={-1}
        // `role="group"` is load-bearing, not decoration: a bare div is
        // role="generic", which PROHIBITS an accessible name, so the
        // aria-label would be dropped and focusing this on open would
        // announce nothing at all.
        role="group"
        aria-label="Enquiry and notes"
        // Takes focus on open, so it gets the same visible ring as every other
        // focus target on the site. Being focusable is also what lets the
        // arrow keys scroll the list: they act on the focused element's
        // nearest scrollable ancestor, which is the modal body.
        className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-(--accent-ink)"
      >
        {message ? (
          <section className="mb-6 flex flex-col gap-2" aria-label="Submitted message">
            <Eyebrow>Message</Eyebrow>
            <p className="rounded-md border border-line bg-inset px-4 py-3 text-small break-words whitespace-pre-wrap text-fg">
              {message}
            </p>
          </section>
        ) : null}

        <section className="flex flex-col gap-3 pb-6" aria-label="Previous notes">
          <Eyebrow>Previous notes{noteCount === null ? "" : ` (${noteCount})`}</Eyebrow>
          <NotesList state={state} onRetry={handleRetry} />
        </section>
      </div>

      {/*
        Pinned to the bottom of the modal body however long the list gets —
        including at 360px, where the panel is a bottom sheet capped at 90dvh.

        Opaque `bg-raised` rather than the panel's glass, because notes have
        to scroll UNDER this and a translucent bar would show them through it.
        Below `md` the design system already calls for solid `bg-raised` over
        glass anyway (§4.2), and the 1px top rule is what says "pinned bar".
      */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          "sticky bottom-[calc(-1.5rem-env(safe-area-inset-bottom))]",
          "border-t border-line bg-raised pt-4",
          "pb-[calc(1.5rem+env(safe-area-inset-bottom))]",
        )}
      >
        <Field label="New note" error={composerError ?? undefined} required>
          {(props) => (
            <textarea
              {...props}
              name="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              // The server rejects anything past this and would hand back an
              // error with 6000 characters still to rescue. Stopping at the
              // cap is kinder than validating after the fact.
              maxLength={MAX_NOTE}
              rows={3}
              placeholder="What happened, what was agreed, what is next."
              className={cn(controlStyles, "resize-y")}
            />
          )}
        </Field>

        <div className="mt-3 flex items-center justify-end gap-3">
          {/*
            Appears only near the ceiling, on a row that exists anyway, so it
            costs no height until it is useful.
          */}
          {body.length >= COUNTER_FROM ? (
            <p
              className={cn(
                "font-mono text-small tracking-[0.18em] uppercase tabular-nums",
                remaining === 0 ? "text-fg" : "text-muted",
              )}
            >
              {remaining} left
            </p>
          ) : null}

          <Button type="submit" variant="primary" size="sm" disabled={pending}>
            {/* The verb survives the wait. */}
            {pending ? "Adding…" : "Add note"}
          </Button>
        </div>
      </form>
    </div>
  );
}

/**
 * The three designed states, shipped with the happy path rather than after
 * it. No `default` branch — a new member of NotesState breaks the build here.
 */
function NotesList({ state, onRetry }: { state: NotesState; onRetry: () => void }) {
  switch (state.status) {
    case "loading":
      return (
        <ul className="flex flex-col gap-3" aria-hidden="true">
          {[0, 1].map((row) => (
            // A skeleton at the shape of a note, not a spinner — same padding,
            // same border, so little shifts when the real rows arrive.
            <li
              key={row}
              className="flex flex-col gap-3 rounded-md border border-line bg-raised px-4 py-3"
            >
              <span className="block h-4 w-full rounded-sm bg-inset motion-safe:animate-pulse" />
              <span className="block h-4 w-3/5 rounded-sm bg-inset motion-safe:animate-pulse" />
              <span className="block h-3 w-2/5 rounded-sm bg-inset motion-safe:animate-pulse" />
            </li>
          ))}
        </ul>
      );

    case "error":
      return (
        <div className="flex flex-col items-start gap-3 rounded-md border border-line-strong bg-inset px-4 py-3">
          <p className="text-small text-fg">
            Those notes did not load. The connection may have dropped.
          </p>
          <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      );

    case "ready":
      if (state.notes.length === 0) {
        return (
          <p className="rounded-md border border-dashed border-line px-4 py-6 text-small text-muted">
            Nothing has been recorded against this enquiry yet — the first note you add
            appears here.
          </p>
        );
      }

      return (
        // Newest first, as the server sorted them.
        <ul className="flex flex-col gap-3">
          {state.notes.map((note) => {
            const at = new Date(note.createdAt);
            return (
              <li
                key={note.id}
                className="flex flex-col gap-2 rounded-md border border-line bg-raised px-4 py-3"
              >
                <p className="text-small break-words whitespace-pre-wrap text-fg">
                  {note.body}
                </p>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-small tracking-[0.18em] text-muted uppercase">
                  <span>{note.authorName}</span>
                  <span aria-hidden="true">/</span>
                  <time dateTime={at.toISOString()}>{timestampFormat.format(at)}</time>
                </p>
              </li>
            );
          })}
        </ul>
      );
  }
}
