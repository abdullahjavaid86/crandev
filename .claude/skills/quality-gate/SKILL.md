---
name: quality-gate
description: Use BEFORE reporting any section, page, or feature in this repo as done, and when asked to verify, review, or check work. The non-negotiable floor — build, accessibility, responsive, reduced motion, tokens, copy. Triggers on "done", "finished", "ready", "ship it", "review", "verify", "check", "does it work", "is it complete", "before I commit".
---

# Quality Gate

Nothing is "done" until this passes. Run it yourself before reporting — do not hand the user a section and let them find these. If an item fails and you cannot fix it, say so explicitly in your report rather than omitting it.

## Build

- [ ] `npm run build` passes with **zero TypeScript errors**. Strict mode, no `any`, no `@ts-expect-error` added to get past the gate.
- [ ] `npm run lint` clean.
- [ ] Zero console warnings in the browser, and **no `console.log` left in shipped code**.
- [ ] No new dependency added without stating the reason first.

## Accessibility

- [ ] Full keyboard path through the section or page. Tab order matches visual order. Nothing reachable only by mouse.
- [ ] Visible `:focus-visible` ring — `--accent-ink`, 2px, 2px offset — on **every** interactive element. It must be visible in **both** themes.
- [ ] Semantic landmarks. One `h1` per page, heading levels ordered, no skips.
- [ ] Body text ≥ 4.5:1 against its **actual** backdrop. Check `text-muted` on glass in **both** themes — that is the pair that fails first.
- [ ] Decorative motion wrappers carry `aria-hidden` where they add no meaning.
- [ ] Every image uses `next/image` with explicit dimensions and real `alt` (`alt=""` if decorative).
- [ ] Local images are **static imports** (blur placeholder + no layout shift), and `priority` is on at most the one real LCP image per route.
- [ ] No component duplicates an existing primitive — `components/` was searched before anything new was created.
- [ ] Interactive controls have accessible names; icon-only buttons have `aria-label`.

## Responsive — mobile first

This is the section that fails most often. Check it at 360 **first**, not last.

- [ ] Tested at **360, 390, 768, 1024, 1280, 1440, 1920**, plus one phone in landscape. 360 and 390 find the bugs.
- [ ] **No horizontal page scroll at any width.** Verify, don't assume: `document.documentElement.scrollWidth <= window.innerWidth`.
- [ ] Long unbroken strings (URLs, repo names, emails in mono) wrap or truncate rather than pushing the page wide.
- [ ] **Base classes are the mobile layout.** No `md:`/`lg:` prefix exists only to undo something the base declared.
- [ ] Sticky card-stacking is added at `lg`, not stripped below it. The mobile list stands on its own.
- [ ] Ship Log rail is absent below `lg` and replaced by the 2px progress bar; no orphaned rail markup.
- [ ] Tap targets ≥ 44px, with ≥ 8px between adjacent ones.
- [ ] Every interactive element is visibly interactive **without hover**, and has an `:active` state.
- [ ] `dvh` everywhere, no `100vh`. Nav overlay does not overflow with the iOS toolbar showing.
- [ ] `env(safe-area-inset-*)` respected on the header, nav overlay, and any fixed element. Check a notched viewport.
- [ ] Every `next/image` has a real `sizes`. Confirm in DevTools that a 390px viewport is not fetching the 1920px asset.
- [ ] At most 2 `backdrop-filter` surfaces below `md`.
- [ ] Horizontal scrollers use `overscroll-behavior-x: contain` and don't trap or hijack page scroll.
- [ ] Text remains readable at 200% zoom without horizontal scroll.
- [ ] No layout shift between skeleton and loaded content, at mobile width too.

## Motion

- [ ] `prefers-reduced-motion: reduce` — no travel, no parallax, no infinite loops, count-ups render their final value, and the page is still fully legible and complete.
- [ ] Every scroll trigger is `once: true`.
- [ ] Only `transform`, `opacity`, `filter`, `clip-path` are animated.
- [ ] Every motion component calls `useReducedMotion()`.

## System integrity

- [ ] **Every color, radius, easing, and duration traces back to a token.** No raw hex, no magic duration, no off-grid spacing.
- [ ] At most one accent element per viewport-height.
- [ ] Glass uses the one recipe with themed vars, sits over grain or a field, and is not stacked more than two deep.
- [ ] **Any translucent layer was checked in both themes** — alpha tuned on dark reads as nothing on light.
- [ ] No `<img>`, no `<a>` for internal routes.
- [ ] Nothing competes with the Ship Log rail.

## Content

- [ ] No lorem ipsum, no `[placeholder]`, no `#` hrefs.
- [ ] Page exports `metadata` with title, description, and OG tags.
- [ ] Async surfaces have all three states built: loading, empty, error.
- [ ] **The CTO read.** Go line by line as the buyer. Any claim without a number, a name, or a repo behind it gets cut or replaced with the fact underneath it.

## The last two

- [ ] **Chanel test.** Remove one effect. If the section is just as good, it stays removed.
- [ ] **`MILESTONES.md` updated** — status moved, date stamped, follow-ups and known gaps recorded.

## Reporting

State plainly what passed and what did not. If you skipped a check because you could not run it (no browser, no Lighthouse), say which one and why — do not report it as passing.

Lighthouse targets on `/`: Performance ≥ 90, Accessibility 100 — **run mobile first**, since the mobile profile is throttled and is where the blur budget and image `sizes` actually get judged. A desktop-only Lighthouse pass is not a pass.

## Related

[design-system](../design-system/SKILL.md) · [motion-system](../motion-system/SKILL.md) · [content-and-copy](../content-and-copy/SKILL.md) · [maintaining-skills](../maintaining-skills/SKILL.md)
