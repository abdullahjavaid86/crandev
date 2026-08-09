import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/seo";

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
  return [
    {
      url: siteOrigin,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
