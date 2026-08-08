---
name: maintaining-skills
description: Use whenever a decision is made that outlives the current task — a new convention, a corrected mistake, a new primitive or route type, a rule that turned out wrong, or user feedback like "don't do that again" / "always do it this way". Also use before finishing any task that introduced a pattern future work should follow. Keeps .claude/skills/ and CLAUDE.md true as the codebase grows. Triggers on "always", "never", "from now on", "remember", "we decided", "new convention", "update the skills", "that's wrong".
---

# Maintaining Skills

The skills in `.claude/skills/` are the working memory of this project. They are only useful while they describe the code that actually exists. A skill that has drifted is worse than no skill — it produces confidently wrong work.

**The rule: a decision that will apply to future work goes into a skill in the same turn it is made.** Not "later", not in a summary message the user will lose. If you notice drift while doing something else, fix it before you finish.

## What triggers an update

Update in the same turn when any of these happen:

| Trigger                                                                  | Where it goes                                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| New token, color, radius, or type role                                   | `design-system`                                                                            |
| New motion primitive, or a timing rule changed                           | `motion-system`                                                                            |
| New section pattern, or a section shape that took two tries to get right | `building-a-section`                                                                       |
| New route, or a page type with its own recipe                            | `adding-a-page` (route map + recipe)                                                       |
| New `content/` file or a type in `types/index.ts`                        | `content-and-copy`                                                                         |
| New route handler, form pattern, or env var                              | `data-and-forms`                                                                           |
| Branching, commit, or release convention changes                         | `git-workflow`                                                                             |
| A defect that shipped and had to be fixed                                | `quality-gate` — as a checklist line                                                       |
| The user corrects you, or says "always"/"never"/"from now on"            | The relevant skill, plus a memory if it's about _how you work_ rather than about this code |
| Stack change, new dependency, new constraint                             | `CLAUDE.md` first, then the affected skills                                                |
| A rule in a skill turned out to be wrong                                 | Fix the rule. Do not append an exception next to the wrong rule.                           |

`CLAUDE.md` holds the fixed direction — stack, constraints, design intent, page structure. Skills hold the operational how-to. When they disagree, `CLAUDE.md` wins and the skill gets corrected.

## How to write the edit

- **Edit the existing skill in place.** Do not add a new skill for something an existing one covers, and do not append a "Update: actually…" note — rewrite the line that was wrong.
- **Delete rules that no longer apply.** Growth by accretion is how these become unreadable and stop being loaded.
- **Keep the description trigger-rich.** The `description` field is the only thing read when deciding whether to load a skill. It must name the concrete words a future prompt will contain, not describe the skill abstractly.
- **Rules, not prose.** State the rule, then the reason if the reason isn't obvious. A rule nobody can act on is a paragraph.
- **Every rule earns its place.** If a rule has never once changed an outcome, cut it.
- **No changelog sections and no `CHANGELOG.md` files** anywhere under `.claude/skills/`. Git history is the changelog. A skill file describes the present state of the project, never its history.
- Keep a skill under ~150 lines. Past that, split it or cut it — long skills get skimmed.
- Cross-link related skills at the bottom with relative paths.

## Adding a new skill

Only when a topic recurs, is not covered by an existing skill, and has rules specific enough to be actionable. Then:

```
.claude/skills/<kebab-name>/SKILL.md
```

with frontmatter:

```yaml
---
name: <kebab-name>
description: Use when <concrete situation>. <What it covers>. Triggers on "<word>", "<word>", …
---
```

Add it to the skill index in `CLAUDE.md §14` in the same turn. For deeper authoring guidance, the superpowers `writing-skills` skill covers structure and testing.

## Periodic audit

At the end of each milestone in `MILESTONES.md`, read every skill against the code that now exists and ask, per skill:

1. Does every rule still match the codebase?
2. Did anything get rebuilt this milestone? Why — and is the reason now written down?
3. Is there a rule here nobody followed? Either enforce it or delete it.
4. Are the `description` triggers still the words we actually use for this work?

Record the audit as a line in `MILESTONES.md`. If nothing changed, say that — a no-op audit is a valid result.

## Related

[quality-gate](../quality-gate/SKILL.md) · `MILESTONES.md` · `CLAUDE.md §14–§16`
