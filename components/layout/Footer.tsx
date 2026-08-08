import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { footerNav } from "@/lib/nav";

/**
 * Contact and social endpoints.
 *
 * NEEDS CONFIRMING BEFORE LAUNCH — both values are placeholders. The mailbox
 * has not been verified, and the GitHub handle is a guess: `GITHUB_OWNER` in
 * .env.example is still blank, so nothing in the repo knows the real account.
 * Fix both here, in one place, once they are known.
 */
const CONTACT = {
  email: "hello@cranedev.com",
  github: "https://github.com/cranedev",
} as const;

/** Shared link recipe. min-h-11 keeps a 44px tap target on touch (§4.7), and
 *  Tailwind v4 wraps `hover:` in `@media (hover: hover)` so touch gets the
 *  `active:` state instead of a stuck hover. */
const linkStyles = cn(
  "inline-flex min-h-11 items-center rounded-sm text-small text-muted",
  "transition-colors duration-(--d-micro)",
  "hover:text-fg active:text-fg",
);

/**
 * Site footer. Hairline top border, nav columns from the one nav source, a mono
 * legal line, socials.
 *
 * A server component on purpose — nothing here is interactive, so it must not
 * import from `components/ui/Button` (that module is `'use client'`, and every
 * export of a client module is a client reference the server cannot call).
 *
 * Mobile first (§4.7): the base is the 360px layout — one column, stacked. `md:`
 * only turns the stacks into rows. Nothing at a breakpoint undoes the base.
 */
export function Footer() {
  // Evaluated when the route renders; for a static route that is build time,
  // which is the correct behaviour for a copyright year.
  const year = new Date().getFullYear();

  return (
    // The safe-area inset sits on the element, not folded into a calc(), so the
    // vertical rhythm below stays on the shared scale (§4.4).
    <footer className="border-t border-line pb-[env(safe-area-inset-bottom)]">
      <Container className="py-20 md:py-28">
        {/* Stacks until lg, not md. At 768 a side-by-side brand block plus three
            nav tracks leaves each column ~82px, which is narrower than the
            headings — the squeeze is at md, not at 360. Stacked, the nav grid
            gets the full container and each column ~229px. */}
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-16">
          <div className="md:max-w-xs">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center font-display text-h3 text-fg"
            >
              CraneDev
            </Link>
            <p className="mt-2 max-w-[34ch] text-small text-muted">
              A senior software team building and maintaining production
              systems.
            </p>
            <a
              href={`mailto:${CONTACT.email}`}
              className={cn(linkStyles, "mt-2")}
            >
              {CONTACT.email}
            </a>
          </div>

          {/* grid-flow-col tracks the length of footerNav, so adding a fourth
              column group needs no change here. */}
          <div className="grid gap-10 md:auto-cols-fr md:grid-flow-col md:gap-16">
            {footerNav.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                {/* One heading level for every column, deliberately in the
                    display face. text-h3 (20→24px) is the ceiling this layout
                    allows, and the size is the same at every breakpoint —
                    there is nothing for `md:` to add, because the *narrowest*
                    column is at md, not at 360. Measured: three auto-cols-fr
                    columns give ~102px each at 768px, ~168px at 1024px and
                    ~235px at the 1240px container cap, while "Company" set at
                    text-h2 needs 166 / 192 / 249px — it spills its column at
                    both ends of the range. At text-h3 it needs ~107px at most
                    and sits on one line everywhere, which is the point: base
                    styles supply the face and tracking, and the
                    `overflow-wrap: normal` there stops the mid-word break. */}
                <h2 className="font-display text-h3 text-fg">
                  {group.heading}
                </h2>
                <ul className="mt-1">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={linkStyles}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-8 md:mt-20 md:flex-row md:items-center md:justify-between">
          {/* Real metadata, so the mono face is earned (§4.3): a year and a
              location. Reuses Eyebrow rather than restating the mono recipe. */}
          <Eyebrow>{`© ${year} CraneDev · Remote`}</Eyebrow>

          <nav aria-label="Elsewhere">
            <ul className="flex items-center gap-4">
              <li>
                {/* lucide-react v1 ships no brand glyphs — there is no Github
                    icon to import — so the link carries a visible label and
                    ArrowUpRight marks it as leaving the site. */}
                <a
                  href={CONTACT.github}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(linkStyles, "gap-1")}
                >
                  GitHub
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
