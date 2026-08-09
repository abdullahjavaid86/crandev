/**
 * The site's absolute origin, resolved once.
 *
 * **This existed as an inline `?? "http://localhost:3000"` in two files and
 * shipped to production.** `NEXT_PUBLIC_SITE_URL` was never set in Vercel, so
 * the live `sitemap.xml` advertised `http://localhost:3000` and `robots.txt`
 * pointed its Sitemap directive at the same place. A sitemap Google cannot
 * fetch is not a small bug on a site whose priority is search.
 *
 * The lesson is not "remember to set the variable" — it is that a default
 * which silently produces a wrong-but-valid URL is the wrong default. So the
 * fallback chain now ends somewhere correct on Vercel without anyone
 * configuring anything:
 *
 * 1. `NEXT_PUBLIC_SITE_URL` — an explicit custom domain always wins.
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — the project's production domain, set
 *    by Vercel on every build and deployment. Deliberately NOT `VERCEL_URL`,
 *    which is the per-deployment hostname: a canonical tag pointing at a
 *    preview URL is worse than one pointing nowhere, because Google may index
 *    the preview.
 * 3. localhost — development only, and now the only way to get it.
 *
 * Set `NEXT_PUBLIC_SITE_URL` as soon as a real domain exists; until then this
 * is right by default instead of wrong by default.
 */
function resolveOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "")}`;

  return "http://localhost:3000";
}

/** String form, for robots.txt and sitemap entries. */
export const siteOrigin = resolveOrigin();

/**
 * URL form, for `metadataBase`. Next requires a URL instance and composes
 * every relative metadata path against it — canonical, Open Graph, Twitter.
 */
export const siteUrl = new URL(siteOrigin);

/** Absolute URL for a path. Keeps the leading-slash handling in one place. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, siteUrl).toString();
}
