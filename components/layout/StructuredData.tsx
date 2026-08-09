import { absoluteUrl, siteOrigin } from "@/lib/seo";

/**
 * JSON-LD for the organisation and the site.
 *
 * A server component emitting a static script tag — no client cost.
 *
 * **Every claim here has to be true.** Structured data is read by machines and
 * shown in search results as fact, so this holds only what is verifiable
 * today: the name, the origin, and the same description the page already
 * makes. No address, no phone, no founding date, no social profiles, no
 * `aggregateRating` — those are the fields that turn an SEO helper into a
 * fabrication, and the contact details in this repo are still placeholders
 * (D8). Add them when they are real, not to fill the schema out.
 *
 * `dangerouslySetInnerHTML` is the documented way to emit JSON-LD; the content
 * is a JSON.stringify of an object literal defined here, so there is no path
 * for user input to reach it.
 */
const DESCRIPTION =
  "A senior software team that builds and maintains production systems for funded startups and product companies.";

export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteOrigin}/#organization`,
        name: "CraneDev",
        url: siteOrigin,
        description: DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": `${siteOrigin}/#website`,
        url: siteOrigin,
        name: "CraneDev",
        description: DESCRIPTION,
        publisher: { "@id": `${siteOrigin}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "WebPage",
        "@id": absoluteUrl("/"),
        url: absoluteUrl("/"),
        name: "CraneDev — software that ships",
        description: DESCRIPTION,
        isPartOf: { "@id": `${siteOrigin}/#website` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
