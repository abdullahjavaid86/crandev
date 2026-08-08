"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback } from "react";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { dur, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { buttonStyles } from "./Button";

/**
 * Radix Dialog for behaviour only (CLAUDE.md §2): focus trap, focus restore,
 * body scroll lock, Escape, outside-press dismissal, and the aria-modal /
 * labelledby / describedby wiring. None of its styling is adopted — every
 * colour here is a role token, so the modal follows the theme like any other
 * surface.
 *
 * Routing is deliberately absent. `/work/[slug]` opens this as an intercepting
 * route (§6.2) and closes with `router.back()`, but that belongs to the caller:
 * this primitive only reports "the user asked to close" through `onClose`.
 */
interface ModalProps {
  open: boolean;
  /**
   * Fired for every close path — Escape, backdrop press, and the close button.
   * The intercepting route passes `router.back()`; a local overlay passes a
   * `setState`. The primitive never decides which.
   */
  onClose: () => void;
  /** Required: a dialog with no accessible name is a defect. */
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Applies to the panel, not the backdrop. */
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  const isReduced = useReducedMotion();
  const isDesktop = useIsDesktop();

  // Radix reports every dismissal through onOpenChange; opening stays the
  // caller's business, so only the false transition is forwarded.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) onClose();
    },
    [onClose],
  );

  /**
   * Reduced motion appears with opacity alone — zero travel, zero scale (§5.1).
   * Otherwise the phone sheet rises 32px and the desktop dialog settles from
   * 16px with a 0.98 scale. Both stay inside the 20–32px travel budget, and
   * exit is `dur.micro` because a dismissal should feel immediate.
   */
  const panel = isReduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: dur.micro } },
      }
    : isDesktop
      ? {
          initial: { opacity: 0, y: 16, scale: 0.98 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: {
            opacity: 0,
            y: 16,
            scale: 0.98,
            transition: { duration: dur.micro, ease: ease.inOut },
          },
        }
      : {
          initial: { opacity: 0, y: 32 },
          animate: { opacity: 1, y: 0 },
          exit: {
            opacity: 0,
            y: 32,
            transition: { duration: dur.micro, ease: ease.inOut },
          },
        };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      {/*
        AnimatePresence sits outside the portal and owns the unmount: `open`
        flipping to false starts the exit, and the subtree only leaves the DOM
        once it finishes. `forceMount` is what makes that possible — without it
        Radix would rip the portal out on the same tick and there would be
        nothing left to animate. It flows from the Portal down to Overlay and
        Content, and is repeated on both so the intent reads locally.
      */}
      <AnimatePresence>
        {open ? (
          <Dialog.Portal key="modal" forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: dur.base, ease: ease.out }}
                // The page ground pulled over the content, plus a modest blur.
                // This is the modal's ONE blurred layer: the panel above takes
                // the glass tint and light-catch without a second
                // backdrop-filter, so the blur never stacks (§4.2).
                className="fixed inset-0 z-50 bg-surface/80 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount>
              <motion.div
                {...panel}
                transition={{ duration: dur.base, ease: ease.out }}
                className={cn(
                  // Base = phone: a full-width sheet anchored to the bottom
                  // edge, capped so the page behind stays visible.
                  "fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col overflow-hidden",
                  "rounded-t-lg border border-line",
                  // The one glass recipe (§4.2), over an opaque raised base so
                  // body copy keeps its contrast in both themes.
                  "bg-raised bg-[linear-gradient(148deg,var(--glass-tint),var(--glass-tint-soft))]",
                  "shadow-[0_1px_0_0_var(--glass-catch)_inset,0_24px_60px_-24px_var(--glass-drop)]",
                  // md ADDS the desktop dialog: a top edge and auto margins
                  // centre the panel, which is why nothing here uses a
                  // translate — motion owns `transform` for the whole panel.
                  "md:inset-0 md:m-auto md:h-fit md:max-h-[85dvh]",
                  "md:w-[min(36rem,calc(100%-5rem))] md:rounded-b-lg",
                  className,
                )}
              >
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-6 pt-6 pb-4">
                  <div className="min-w-0">
                    {/* Radix renders an h2 and points aria-labelledby at it.
                        h3 on the fluid scale, not h2's: the panel is 36rem
                        wide, not a full page column. */}
                    <Dialog.Title className="text-h3">{title}</Dialog.Title>
                    {description ? (
                      <Dialog.Description className="mt-2 text-small text-muted">
                        {description}
                      </Dialog.Description>
                    ) : null}
                  </div>

                  {/* Escape and backdrop press are Radix's; this is the
                      explicit third path. 44px tap target from buttonStyles. */}
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className={buttonStyles(
                      "ghost",
                      "sm",
                      "size-11 shrink-0 px-0",
                    )}
                  >
                    <X aria-hidden="true" className="size-5" />
                  </button>
                </div>

                {/* Scrolls inside itself rather than chaining to the page, and
                    clears the iOS home indicator on the bottom-anchored sheet
                    — above md that inset resolves to 0, so the padding is
                    plain. min-h-0 is what lets it scroll at all instead of
                    pushing the panel past its max-height. */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                  {children}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
