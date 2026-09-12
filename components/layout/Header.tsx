"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useId, useState } from "react";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { dur, ease, reduced } from "@/lib/motion";
import { isActive, primaryCta, primaryNav } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

/**
 * Sticky site header — a glass panel from the first pixel, floating clear of
 * the content at `md:` and sitting flush as a full-width bar below it.
 *
 * Base is the phone: wordmark, theme toggle, menu button. `md:` ADDS the nav
 * row, the CTA, the inset and the radius; nothing here is undone at a
 * breakpoint (§4.7).
 *
 * Client only because of the menu state — every visual part it composes
 * (ThemeToggle, buttonStyles, ScrollProgress) already exists (§10).
 */
export function Header() {
  const pathname = usePathname();
  const isReduced = useReducedMotion() ?? false;
  const isDesktop = useIsDesktop();
  const menuId = useId();

  /**
   * The menu remembers the route it was opened on, and `open` is derived from
   * that rather than synced to it. Two of the required behaviours fall out for
   * free and without an effect:
   *
   * - **Close on route change (§4.7):** a new `pathname` no longer matches, so
   *   the overlay is closed on the very render that navigates. Radix then
   *   returns focus to the trigger as it unmounts.
   * - **Close at `md`:** the trigger is `md:hidden`, so an overlay left open
   *   across the breakpoint would anchor its focus trap to a `display: none`
   *   button with nothing to hand focus back to.
   */
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname && !isDesktop;
  const setOpen = useCallback(
    (next: boolean) => setOpenedOn(next ? pathname : null),
    [pathname],
  );

  /**
   * The overlay fades as a whole and orchestrates its children; the links and
   * the CTA consume the shared reveal (§5.2). Reduced motion collapses travel,
   * blur, and stagger to zero — `reduced()` owns the item half of that.
   */
  const shell: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: dur.base,
        ease: ease.out,
        staggerChildren: isReduced ? 0 : 0.07,
        delayChildren: isReduced ? 0 : 0.08,
      },
    },
    exit: { opacity: 0, transition: { duration: dur.micro, ease: ease.inOut } },
  };
  const revealItem: Variants = reduced(isReduced);

  return (
    /**
     * Radix Dialog for behaviour only: focus trap, focus restore to the
     * trigger, body scroll lock, Escape, and the aria-modal wiring — none of
     * which is worth hand-rolling (§2). `Modal` is the same machinery dressed
     * as a bottom sheet with its own titled chrome and a capped height; a
     * full-bleed `100dvh` nav is a different surface, not a variant of that
     * one. If a third full-screen dialog appears, promote the shape into
     * `Modal` rather than writing this twice.
     *
     * Root renders no DOM, so wrapping the header costs nothing.
     */
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <header className="sticky top-0 z-40 pt-[env(safe-area-inset-top)] md:top-3 md:px-6 lg:px-10">
        {/*
          The glass bar. It is one of the two blurred surfaces a phone is
          allowed (§4.2), and it is blurred from the first pixel — no
          transparent-to-glass switch, so `backdrop-filter` is never animated
          or faded and the header never changes shape under the reader.

          Not wrapped in `Container`: the gutter is on the <header> at md and
          the max width is here, so a Container inside would gutter twice.
        */}
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-2 border-b border-line px-6 glass md:h-14 md:gap-4 md:rounded-md md:border md:px-4">
          <Wordmark />

          {/* The desktop row is the enhancement; the base has no nav at all. */}
          <nav aria-label="Main" className="hidden md:flex md:items-center md:gap-1">
            {primaryNav.map((link) => {
              const current = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "relative inline-flex min-h-11 items-center px-3 text-small font-medium",
                    "transition-colors duration-(--d-micro)",
                    current ? "text-fg" : "text-muted hover:text-fg active:text-fg",
                  )}
                >
                  {link.label}
                  {/*
                    The active nav item is the one place a border may take the
                    accent (§4.1) — and it takes `--accent-ink`, never
                    `--accent`, because the fill on a light ground is 1.43:1
                    and would vanish in light mode. 1px, and absolutely
                    positioned so lighting up a link never shifts the row.
                  */}
                  {current ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 bottom-2.5 h-px bg-accent-ink"
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <ThemeToggle />

          {/*
            The header's single accent fill (§6.1). A link that looks like a
            button uses buttonStyles, not a second component (§10).

            Visibility sits on the wrapper deliberately: buttonStyles already
            declares `inline-flex`, and cn() joins rather than merges, so a
            `hidden` on the same element would be decided by stylesheet order
            (where `.inline-flex` happens to come last) rather than by argument
            order — and the CTA would show up on the phone anyway. The wrapper
            keeps the base honest: hidden below md, added at md.
          */}
          <div className="hidden md:block">
            <Link href={primaryCta.href} className={buttonStyles("primary", "sm")}>
              {primaryCta.label}
            </Link>
          </div>

          <Dialog.Trigger asChild>
            {/*
              Name stays "Open menu" in both states — `aria-expanded` carries
              the state, so the label does not have to lie about the action.
              `aria-controls` is declared here rather than left to Radix so the
              wiring is visible in this file; the id is pinned onto the content
              below. 44px tap target comes from buttonStyles.
            */}
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls={menuId}
              className={buttonStyles("ghost", "sm", "size-11 shrink-0 px-0 md:hidden")}
            >
              <Menu aria-hidden="true" className="size-5" />
            </button>
          </Dialog.Trigger>
        </div>
      </header>

      <ScrollProgress />

      <AnimatePresence>
        {open ? (
          <Dialog.Portal key="menu" forceMount>
            {/*
              The Overlay is not decoration: Radix puts the body scroll lock in
              it, not in Content, so omitting it would ship an overlay you can
              scroll the page behind. It carries the ground colour — solid, not
              glass, because a full-screen blur on a phone buys nothing and
              costs the most expensive thing we render (§4.2).
            */}
            <Dialog.Overlay asChild forceMount>
              <motion.div
                variants={shell}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 z-50 bg-surface"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount id={menuId}>
              <motion.div
                variants={shell}
                initial="hidden"
                animate="visible"
                exit="exit"
                // dvh, never vh — iOS Safari's collapsing toolbar makes 100vh
                // overflow (§4.7).
                className="fixed inset-x-0 top-0 z-50 flex h-[100dvh] flex-col pt-[env(safe-area-inset-top)]"
              >
                {/* Radix points aria-labelledby here; the overlay's own top row
                    already reads as a menu, so the name is not repeated
                    visually. */}
                <Dialog.Title className="sr-only">Menu</Dialog.Title>

                {/* Mirrors the header row it covers, so the wordmark and the
                    controls do not move when the overlay opens. */}
                <Container className="flex h-16 shrink-0 items-center gap-2">
                  <Wordmark onNavigate={() => setOpen(false)} />
                  <ThemeToggle />
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Close menu"
                      className={buttonStyles("ghost", "sm", "size-11 shrink-0 px-0")}
                    >
                      <X aria-hidden="true" className="size-5" />
                    </button>
                  </Dialog.Close>
                </Container>

                {/* Scrolls inside itself so a phone in landscape still reaches
                    the CTA, and never chains to the locked page behind. */}
                <Container className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  <ul className="flex flex-col gap-1 pt-6 pb-8">
                    {primaryNav.map((link) => {
                      const current = isActive(pathname, link.href);
                      return (
                        <motion.li key={link.href} variants={revealItem}>
                          <Link
                            href={link.href}
                            // A link to the route we are already on changes no
                            // pathname, so the derived close never fires.
                            // Close on the tap as well.
                            onClick={() => setOpen(false)}
                            aria-current={current ? "page" : undefined}
                            className={cn(
                              "flex min-h-11 items-center rounded-r-md border-l py-3 pl-5 text-h3 font-semibold tracking-[-0.02em]",
                              "transition-colors duration-(--d-micro) active:bg-inset",
                              // Same rule as the desktop row: the accent
                              // border is legal here and only as --accent-ink.
                              current
                                ? "border-accent-ink text-accent-ink"
                                : "border-transparent text-fg",
                            )}
                          >
                            {link.label}
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                </Container>

                {/* Last in the stagger, and clear of the home indicator. */}
                <motion.div
                  variants={revealItem}
                  className="shrink-0 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
                >
                  <Container>
                    <Link
                      href={primaryCta.href}
                      onClick={() => setOpen(false)}
                      className={buttonStyles("primary", "md", "w-full")}
                    >
                      {primaryCta.label}
                    </Link>
                  </Container>
                </motion.div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}

/**
 * Text wordmark. Appears in the header and again in the overlay's top row, so
 * it is one local component rather than two hand-matched copies. Display face
 * is right here — a wordmark is a name, not prose (§4.3).
 */
function Wordmark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="mr-auto inline-flex min-h-11 items-center font-display text-body font-semibold tracking-[-0.02em] text-fg"
    >
      CraneDev
    </Link>
  );
}
