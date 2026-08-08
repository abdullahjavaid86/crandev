---
name: content-and-copy
description: Use when writing ANY user-facing text in this repo, or when adding/changing a file under content/ or a type in types/index.ts. Covers the typed content layer and the voice rules. Read BEFORE writing headlines, subcopy, button labels, error messages, empty states, alt text, meta descriptions, testimonials, or job descriptions. Triggers on "copy", "wording", "headline", "tagline", "microcopy", "CTA text", "content file", "add a project", "add a role", "add a testimonial".
---

# Content and Copy

The audience is CTOs and technical founders at funded startups. They can read code and they are allergic to hype. Every line either earns trust with a specific fact or costs trust with an adjective.

## The content layer

There is no CMS and no database. Content lives in typed TypeScript under `content/`, imported directly by server components.

```
content/
  services.ts  work.ts  process.ts  team.ts
  testimonials.ts  brands.ts  roles.ts  availability.ts  faq.ts
```

Rules:

- Every content file exports a **typed const array** whose interface lives in `types/index.ts`. Use `satisfies` so the literal keeps its narrow type.
- Slugs are the join key between content and dynamic routes. Slug is `kebab-case`, stable, and never changes after publish.
- Content files hold data and prose. **No JSX, no Tailwind classes, no components** in `content/`.
- Content is also the typed fallback when a live source fails — see [data-and-forms](../data-and-forms/SKILL.md).
- Adding a field means updating the interface first, then every entry. No optional field added just to avoid backfilling.

## Voice

- **Plain, specific, confident.** Numbers over adjectives.
- **Name what the client gets, not how we build it.** "A working release in six weeks," not "agile delivery methodology."
- **Sentence case everywhere**, except the mono utility face, which is uppercase.
- **Buttons say what happens.** "Book a call," not "Get started." The label keeps its name through the whole flow — the button, the page title, and the confirmation all say the same word.
- **Case study lines follow:** problem → what we built → measurable outcome. One sentence each.
- Prose max measure `65ch`. If a paragraph runs past four lines, it is two paragraphs or it is padding.

## Banned

Hype vocabulary: *cutting-edge, synergy, leverage (as a verb), seamless, robust, world-class, passionate, we're excited to, revolutionize, empower, best-in-class, game-changing, solutions provider, digital transformation.*

Also banned: exclamation marks in body copy, em-dash-heavy breathless sentences, rhetorical questions as headlines ("Ready to scale?"), and any claim with no number behind it.

**The CTO test.** Read each line as the buyer. If a sentence makes a claim you cannot substantiate with a number, a name, or a repo, cut it or replace it with the fact underneath it.

## Copy that is easy to get wrong

**Empty states** — say what would appear here and offer an action. Never "No data." → *"No open roles right now. Tell us what you'd want to work on and we'll reach out when there is."*

**Error states** — what happened and what to do, in the interface's voice. No apology, no stack trace, no "Oops!" → *"That didn't send. Check the email field, or write to hello@… directly."*

**Loading** — a skeleton, not a sentence. If you must label it, name the thing being fetched.

**Alt text** — describes the image's information, not its existence. A project cover: *"Dashboard showing p95 latency dropping from 1.4s to 180ms after the migration."* Decorative images get `alt=""`.

**Meta descriptions** — one specific sentence per page. Never repeat the site tagline across routes.

**Testimonials** — quote what someone actually said, attributed to a real name, role, and company. Never write a quote on a client's behalf and never paraphrase into our own voice. If the attribution can't be published, cut the quote.

**Job descriptions** — say what you'd own, what the first 90 days are, and the comp band. No "rockstar", "ninja", "wear many hats", or "fast-paced environment".

## Placeholders

Placeholder copy is a defect, not a TODO. A section is not done with lorem ipsum, `[Client name]`, invented metrics, or a `#` href in it. If the real fact does not exist yet, **cut the element** and note the gap in `MILESTONES.md` rather than filling it with fiction.

## Related

[building-a-section](../building-a-section/SKILL.md) · [adding-a-page](../adding-a-page/SKILL.md) · [data-and-forms](../data-and-forms/SKILL.md)
