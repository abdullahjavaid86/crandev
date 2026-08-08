# Deploying to Vercel

Configuration that lives in the repo is already done — `vercel.json` and
`.vercelignore`. What is left needs the Vercel account, so it is listed here
rather than guessed at.

---

## ⚠️ Do not deploy to production yet

The site currently renders **entirely invented content**. `content/README.md`
lists it per file. The two that matter most:

- **`testimonials.json` attributes fabricated quotes to fabricated people at
  fabricated companies.** Publishing that is a different category of problem
  from a placeholder photo.
- **The hero commit ticker shows invented commits** (`PLACEHOLDER_COMMITS` in
  `components/sections/Hero.tsx`), presented as real repository activity.

Preview deployments are fine — they are unlisted and exist to be looked at.
Production is not, until D2 is closed.

---

## 1. Package manager — the one thing that will break the first build

This project uses **Yarn Berry 4** (`packageManager` in `package.json`). Vercel's
build image ships **Yarn 1**, which cannot read a Berry lockfile. Left alone, the
first install fails or silently re-resolves every dependency.

`vercel.json` handles it in the repo:

```json
"installCommand": "corepack enable && yarn install --immutable"
```

`--immutable` fails the build if `yarn.lock` would change, which is what you want
in CI — a lockfile that drifts during deploy is a different dependency tree from
the one that was tested.

**If that command ever fails**, the officially documented alternative is a
project environment variable:

| Name | Value | Environments |
|---|---|---|
| `ENABLE_EXPERIMENTAL_COREPACK` | `1` | Production, Preview, Development |

Then delete `installCommand` from `vercel.json` and let Vercel detect Yarn itself.

Both routes are documented by Vercel. Corepack is flagged experimental by Node,
so this is the one setting most likely to need revisiting.

> Not used: `build.env` in `vercel.json`. It exists in the published schema but
> is marked `deprecated: true` at both the `build` and `build.env` level, so it
> is the wrong place to put a flag the build cannot start without.

---

## 2. Environment variables

Set these in **Project → Settings → Environment Variables**. All are server-only
except the last, which is deliberately public.

| Name | Environments | Notes |
|---|---|---|
| `MONGODB_URI` | Production, Preview | Contains credentials. **Use a separate database for Preview** — preview deployments are publicly reachable, and a shared URI means every PR writes into production data. |
| `MONGODB_DB` | Production, Preview | e.g. `cranedev` / `cranedev_preview` |
| `GITHUB_TOKEN` | Production, Preview | Optional. Without it the Ship Log still works at the lower unauthenticated rate limit. `public_repo` scope only — never a token with write access. |
| `GITHUB_OWNER` | Production, Preview | Which account the Ship Log reads |
| `NEXT_PUBLIC_SITE_URL` | Production, Preview | Absolute origin, no trailing slash. Used for OG tags and canonical URLs. **This one reaches the browser** — that is intended, and it is why it holds nothing but a public origin. |

Never prefix anything else with `NEXT_PUBLIC_`. Doing so ships the value to
every visitor.

`.env.example` in the repo is the source of truth for the list; keep them in step.

---

## 3. Settings that cannot be set from the repo

| Setting | Where | Value |
|---|---|---|
| Node.js version | Settings → General | Match local (**Node 24**) or the nearest supported major. Deliberately *not* pinned via `engines` in `package.json`: an unsupported value there fails the build rather than falling back. |
| Production branch | Settings → Git | **`main`** — not `staging`. `staging` then produces preview deployments, which matches how the branches are used (`CLAUDE.md §17`). |
| Root directory | Settings → General | Repository root. |
| Framework preset | auto-detected | Next.js. Also pinned in `vercel.json`. |

---

## 4. Branch → environment

```
feature/fast-track  →  preview   (per push)
staging             →  preview   (integration)
main                →  production
```

This follows §17: every PR targets `staging`, and `main` is a release that is
the owner's call. Setting the production branch to `main` in Vercel keeps the
platform and the git workflow saying the same thing.

---

## 5. Security headers

`vercel.json` sets HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy` and `X-DNS-Prefetch-Control` on every
route.

**`X-XSS-Protection` is deliberately absent** even though it appears in Vercel's
own documentation example. It is deprecated, ignored by modern browsers, and in
older ones its filter could be used to introduce a vulnerability rather than
prevent one.

**No Content-Security-Policy yet, on purpose.** `ThemeScript` is an inline
script — it has to be, so the theme resolves before first paint — and a CSP
without a nonce would block it and ship an unthemed flash to every visitor.
Adding CSP means plumbing a nonce through the document, which is its own task.
A broken CSP is worse than none.

---

## 6. After the first deploy

- [ ] Build log shows **Yarn 4**, not Yarn 1, in the install step.
- [ ] `yarn.lock` unchanged — `--immutable` would have failed the build otherwise.
- [ ] Response headers present: `curl -sI https://<url> | grep -iE 'strict-transport|x-frame|referrer'`
- [ ] Images load — `images.remotePatterns` in `next.config.ts` allows
      `images.unsplash.com` and `images.pexels.com` only, and every cover is
      currently a remote placeholder. **These entries go when real images become
      static imports.**
- [ ] Lighthouse on the **mobile** profile: Performance ≥ 90, Accessibility 100
      (`CLAUDE.md §9`). Desktop-only is not a pass.
- [ ] The dev variant picker is **not** on the page. It is excluded from the
      production bundle by a `NODE_ENV`-gated dynamic import; verify rather than
      assume, since a static import would have kept it.

---

## 7. Not set up, and why

**No deploy-from-Actions pipeline.** Vercel's native Git integration already
builds every push and comments preview URLs on PRs; re-implementing that in
Actions would duplicate it and double the build minutes.

There IS a `.github/workflows/ci.yml`, but it deploys nothing — it gates the
merge. A Vercel preview deploying successfully is not the same as the branch
being correct: it does not block a merge on a type error, a lint failure, or
malformed content. CI runs typecheck, lint, build and a set of regression
guards on every PR into `staging` or `main`.

Move deployment into Actions only when there is something to gate promotion on
— end-to-end tests against a preview, for example — at which point
`vercel build --prebuilt` plus `vercel promote` is the shape to use.

**No `regions` pinned.** Worth setting once the MongoDB region is known, so the
Server Action writing submissions is not crossing an ocean per request.
