"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  /** Receives the wired id and aria-* props. */
  children: (props: FieldControlProps) => React.ReactNode;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  required?: boolean;
}

/**
 * Wires a real <label> to its control and links description and error text
 * through aria-describedby. Every form control on the site goes through this —
 * a placeholder is not a label, and an unlabelled input is a defect (§7 forms).
 *
 * Render-prop rather than cloneElement so the wiring is explicit and works for
 * input, textarea, and select without special-casing any of them.
 */
export function Field({
  label,
  children,
  description,
  error,
  required,
  className,
}: FieldProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-small text-fg">
        {label}
        {required ? (
          <span className="text-muted"> (required)</span>
        ) : (
          <span className="text-muted"> (optional)</span>
        )}
      </label>

      {description ? (
        <p id={descriptionId} className="text-small text-muted">
          {description}
        </p>
      ) : null}

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        required,
      })}

      {/* Announced when it appears, without stealing focus. */}
      <p role="status" aria-live="polite" className="min-h-5 text-small text-fg">
        {error}
      </p>
    </div>
  );
}

/** Shared control styling so input, textarea and select can't drift apart. */
export const controlStyles = cn(
  "min-h-11 w-full rounded-md border border-line bg-raised px-4 py-3",
  "text-fg placeholder:text-muted",
  "transition-colors duration-(--d-micro) hover:border-line-strong",
  "aria-[invalid=true]:border-line-strong",
);
