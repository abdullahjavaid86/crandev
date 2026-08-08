---
name: git-workflow
description: Use before starting ANY task in this repo, and before every commit. Covers the one-branch rule (all work on feature/fast-track), one-commit-per-milestone-task granularity, commit message format, what never gets committed, and milestone PRs to main. Triggers on "commit", "branch", "git", "push", "PR", "merge", "checkout", "stage", "start a task", "next task", "amend", "revert", "undo", "history".
---

# Git Workflow

Two rules carry everything else: **there is one working branch**, and **one task equals one commit**. The commit is the review unit, so its diff has to stand on its own.

## The one-branch rule

`feature/fast-track` is the only branch work happens on. Do not create task branches, topic branches, or spike branches. `staging` and `main` are integration branches — **never commit to either directly.**

```
main                       ← release. PR base ONLY when explicitly asked for
 └── staging               ← default PR base; integration
      └── feature/fast-track    ← the ONLY working branch
```

**Before starting any task**, confirm you are on it and current:

```bash
git branch --show-current    # must print: feature/fast-track
git status --short           # must be clean before you start
```

If you are on `staging` or `main`, switch — never commit to either directly. If the tree is dirty from a previous task, finish or stash that work before starting a new one; a commit that mixes two tasks is not reviewable and is the main thing this workflow exists to prevent.

## One task, one commit

A task is a numbered row in `MILESTONES.md`. Each becomes exactly **one** commit on `feature/fast-track`.

- Work the task to completion, run [quality-gate](../quality-gate/SKILL.md), then commit once.
- Commit **after** the gate passes, not before. A commit that does not build is not a review unit.
- Do not commit mid-task "checkpoints". If you need a save point, that is what `git stash` is for.
- If a task turns out to be two things, split it in `MILESTONES.md` first, then commit two commits — one per row. Renumbering the tracker is cheaper than an unreviewable diff.
- Closely related rows that genuinely cannot be separated (`M1.1–1.2`) may share one commit. Reference both in the subject.

**Amending is preferred over stacking fixups.** If review finds a problem in the task you just committed and you have not pushed, fix it and `git commit --amend`. Once pushed, add a normal commit instead — never rewrite pushed history.

## Commit messages

Conventional Commits, with the milestone task in the subject.

```
<type>(<scope>): <imperative summary>   [M0.3]

<why this change, if it isn't obvious from the diff>
<any decision a reviewer would otherwise have to ask about>
```

Types: `feat` · `fix` · `refactor` · `style` · `perf` · `a11y` · `docs` · `chore` · `build`.
Scopes follow the tree: `tokens`, `motion`, `sections`, `ui`, `content`, `api`, `layout`, `deps`.

```
feat(tokens): obsidian palette, fluid type scale, radius scale   [M0.3]

Display floor is 2.5rem, not 3.5rem — at 360px a 56px headline
breaks to five lines. See CLAUDE.md §4.3.
```

Rules: imperative mood ("add", not "added"), subject ≤ 72 chars, no trailing period, body wrapped at 72. The body explains **why**; the diff already shows what.

Every commit message ends with:

```
Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019755Ccf7r19k6VWRaTyr7x
```

## Never commit

- `node_modules/`, `.next/`, `.env.local`, `*.tsbuildinfo` — already in `.gitignore`; if one appears in `git status`, fix the ignore file rather than the staging.
- `.claude/settings.local.json` — personal permission grants, not project config. `.claude/skills/` and `.claude/settings.json` **are** project config and do get committed.
- Secrets of any kind. `.env.example` is committed with empty values; `.env.local` never is.
- Commented-out code, `console.log`, or a `TODO` with no tracker row behind it.
- Unrelated formatting churn. If a file only changed because your editor reformatted it, revert it.

**Stage deliberately.** `git add <paths>`, not `git add -A`. Read `git status` before every commit and confirm every listed file belongs to this task.

## PRs — the base is always `staging`

**Every PR targets `staging`. `main` is never a PR base unless the user explicitly asks for it in that request.** Not "it's a milestone", not "the work looks finished" — explicitly asked, that time.

Open the PR when a milestone in `MILESTONES.md` is complete: every row `done`, every gate passed.

```bash
gh pr create --base staging --head feature/fast-track \
  --title "M0 — Foundations" \
  --body "…what shipped, what was decided, what is still open…"
```

The body lists the tasks with their commits, the decisions a reviewer should check, and anything left in **Known gaps**. After merge, keep working on `feature/fast-track` — it is long-lived and is not deleted.

**`staging` → `main` is a release, and it is the user's call.** Do it only when asked, in that request:

```bash
gh pr create --base main --head staging --title "Release: …"
```

If you catch yourself typing `--base main`, stop and confirm you were asked for it.

## Pushing is an outward action

Committing is local and cheap. **Pushing publishes.** Push when the user asks, or at milestone close as part of opening the PR — not automatically after every task.

Never `push --force` to a shared branch, never rebase anything already pushed, and never rewrite `staging` or `main`.

## Before you commit — the short list

- [ ] On `feature/fast-track` — not `staging`, not `main`.
- [ ] The task passed [quality-gate](../quality-gate/SKILL.md); `yarn build` and `yarn lint` are clean.
- [ ] `git status` shows only files belonging to this task.
- [ ] No secrets, no `settings.local.json`, no build output.
- [ ] Subject references the `MILESTONES.md` row; body explains why.
- [ ] `MILESTONES.md` updated in the same commit — the tracker and the code move together.

## Related

[quality-gate](../quality-gate/SKILL.md) · [maintaining-skills](../maintaining-skills/SKILL.md) · `MILESTONES.md` · `CLAUDE.md §17`
