"use client";

import { useState } from "react";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { NotesDialog } from "./NotesDialog";

/**
 * The notes trigger and the dialog it owns.
 *
 * This exists so `ContactsTable` can stay a server component. The dialog needs
 * open/closed state, and `'use client'` is per-module — putting the state in
 * the table would have made the whole table a client component and pulled the
 * page's row data across the boundary with it.
 *
 * Mounting the dialog only while open is deliberate and is what makes the
 * dialog's own "load notes on open" behaviour work: for a page of twenty rows,
 * an always-mounted dialog per row would be twenty components waiting to fetch.
 */
interface NotesButtonProps {
  contactId: string;
  contactName: string;
  message?: string;
  count: number;
  className?: string;
}

export function NotesButton({
  contactId,
  contactName,
  message,
  count,
  className,
}: NotesButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        // A page of twenty identical "Notes (0)" buttons is unusable with a
        // screen reader; the name has to say whose notes these are.
        aria-label={`Notes for ${contactName}'s submission (${count})`}
        className={buttonStyles("secondary", "sm", className)}
      >
        Notes ({count})
      </button>

      <NotesDialog
        open={open}
        onClose={() => setOpen(false)}
        contactId={contactId}
        contactName={contactName}
        message={message}
      />
    </>
  );
}
