import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/seo";

/**
 * There was no robots route at all, so /robots.txt 404'd. That was survivable
 * while the whole site was public; it is not now that an admin portal exists.
 *
 * The portal is already `noindex` via metadata, but that only helps once a
 * crawler has fetched the page. Disallowing the path stops the fetch.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
    sitemap: `${siteOrigin}/sitemap.xml`,
  };
}
