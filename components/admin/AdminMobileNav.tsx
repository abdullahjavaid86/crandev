"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { LogOut, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useState } from "react";
import { logout } from "@/lib/admin/actions";
import { dur, ease } from "@/lib/motion";
import type { CurrentAdmin } from "@/lib/admin/types";
import { AdminNav } from "./AdminNav";
import { AdminWordmark } from "./AdminWordmark";
import { railIconStyles, railItemStyles, railLabelStyles } from "./railItemStyles";

/**
 * Navigation below `lg`: a bar with a menu button, and the rail's contents in
 * a drawer.
 *
 * Radix Dialog for behaviour only (§2) — focus trap, focus restore, body
 * scroll lock, Escape, outside-press. None of its styling is adopted.
 *
 * Same `AdminNav` as the rail, with `collapsible` off: the drawer is full
 * width, so it must show labels even while the desktop rail is collapsed.
 */
export function AdminMobileNav({ admin }: { admin: CurrentAdmin }) {
  const [open, setOpen] = useState(false);
  const isReduced = useReducedMotion();

  /**
   * Closing on navigation is done here, on the click, rather than in an effect
   * watching the pathname: tapping the screen you are already on does not
   * change the pathname, and an effect would leave the drawer stuck open.
   */
  const close = useCallback(() => setOpen(false), []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <header className="sticky top-0 z-40 flex min-h-14 items-center gap-2 border-b border-line bg-surface px-3 pt-[env(safe-area-inset-top)] lg:hidden">
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors duration-(--d-micro) hover:bg-inset hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink"
          >
            <span className="sr-only">Open navigation</span>
            <Menu aria-hidden="true" className="size-5" />
          </button>
        </Dialog.Trigger>

        <AdminWordmark className="min-w-0" />
      </header>

      {/*
        AnimatePresence outside the portal owns the unmount, and `forceMount`
        is what makes that possible — without it Radix rips the portal out on
        the same tick and there is nothing left to animate.
      */}
      <AnimatePresence>
        {open ? (
          <Dialog.Portal key="admin-drawer" forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: dur.micro, ease: ease.out }}
                className="fixed inset-0 z-50 bg-surface/80 backdrop-blur-sm lg:hidden"
              />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              forceMount
              // Radix warns when a dialog has no description. This one is a
              // list of links; a sentence describing it would be read aloud
              // before every item for no gain.
              aria-describedby={undefined}
            >
              <motion.div
                // Reduced motion appears with opacity alone — no travel (§5.1).
                initial={isReduced ? { opacity: 0 } : { x: "-100%" }}
                animate={isReduced ? { opacity: 1 } : { x: 0 }}
                exit={
                  isReduced
                    ? { opacity: 0, transition: { duration: dur.micro } }
                    : {
                        x: "-100%",
                        transition: { duration: dur.micro, ease: ease.inOut },
                      }
                }
                transition={{ duration: dur.base, ease: ease.out }}
                className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-line bg-raised lg:hidden"
              >
                <div className="flex items-center gap-2 border-b border-line p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
                  <Dialog.Title className="sr-only">Admin navigation</Dialog.Title>
                  <AdminWordmark className="min-w-0 flex-1 px-1" />
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors duration-(--d-micro) hover:bg-inset hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink"
                    >
                      <span className="sr-only">Close navigation</span>
                      <X aria-hidden="true" className="size-5" />
                    </button>
                  </Dialog.Close>
                </div>

                <nav
                  aria-label="Admin sections"
                  className="flex-1 overflow-y-auto px-3 py-3"
                >
                  <AdminNav idPrefix="drawer" onNavigate={close} />
                </nav>

                <div className="mt-auto flex flex-col gap-1 border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                  <AdminNav
                    idPrefix="drawer-footer"
                    group="footer"
                    onNavigate={close}
                  />

                  <form action={logout}>
                    <button type="submit" className={railItemStyles()}>
                      <LogOut aria-hidden="true" className={railIconStyles()} />
                      <span className={railLabelStyles()}>Sign out</span>
                    </button>
                  </form>

                  <div className="px-3 pt-2">
                    <p className="truncate text-small text-muted">{admin.name}</p>
                    <p className="truncate font-mono text-small text-muted/80">
                      {admin.email}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
