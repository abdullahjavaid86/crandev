import type { MetadataRoute } from "next";

/**
 * There was no robots route at all, so /robots.txt 404'd. That was survivable
 * while the whole site was public; it is not now that an admin portal exists.
 *
 * The portal is already `noindex` via metadata, but that only helps once a
 * crawler has fetched the page. Disallowing the path stops the fetch.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
