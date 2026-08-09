import type { MetadataRoute } from "next";

/**
 * Public routes only. The admin portal is disallowed in robots.ts and must
 * never appear here — a sitemap is an invitation, and listing a login page is
 * the opposite of what `noindex` on it is for.
 *
 * Routes are listed explicitly rather than derived. The marketing routes in
 * CLAUDE.md §6.0 do not all exist yet (M5), and a sitemap that advertises 404s
 * is worse than a short one.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    {
      url: base,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
