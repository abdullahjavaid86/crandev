import "./globals.css";

import { Geist, Geist_Mono } from "next/font/google";

import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DevVariantPicker } from "@/components/ui/DevVariantPicker";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { siteUrl } from "@/lib/seo";

/**
 * Fonts. Both use `display: swap`, so neither blocks first paint — text
 * renders in the fallback and swaps when the file lands.
 *
 * Only the sans is preloaded. A preload is a high-priority fetch competing
 * with the stylesheet, and the stylesheet is the thing that actually blocks
 * FCP — it is the largest text on the page (headlines and body share one
 * family now), so it earns the one preload. Mono is used for a handful of
 * short strings (commit shas, stat figures) and swaps in unnoticed, so it
 * stays unpreloaded.
 */

/** The one sans. Headlines and body are the same family at different weights. */
const sans = Geist({
  variable: "--font-sans-src",
  subsets: ["latin"],
  display: "swap",
});

/** Only for real machine data: commit shas, stat figures. */
const mono = Geist_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const TITLE = "CraneDev — software that ships";
const DESCRIPTION =
  "A senior software team that builds and maintains production systems for funded startups and product companies.";

/**
 * §9 asks for metadata and OG tags here, and only the title and description
 * were ever emitted — no canonical, no Open Graph, no Twitter card. A link to
 * the site pasted into Slack or LinkedIn rendered as a bare URL.
 *
 * `metadataBase` is what makes the rest of this work: every relative URL below
 * is composed against it, so the canonical and the OG URL are absolute without
 * anything hardcoding a domain. See lib/seo.ts for why that resolution is not
 * simply an env var.
 *
 * `title.template` gives every child route "<page> — CraneDev" without each
 * one repeating the suffix; `title.default` covers routes that set none.
 */
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: TITLE, template: "%s — CraneDev" },
  description: DESCRIPTION,
  applicationName: "CraneDev",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "CraneDev",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  // The portal opts out individually; everything public is indexable, and
  // saying so explicitly stops a stray default from deciding otherwise.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

/**
 * The one root layout: document, fonts, theme, and the analytics beacons.
 *
 * It deliberately renders NO chrome. Header, Footer, BackgroundLayer and Grain
 * belong to the marketing site and live in `app/(site)/layout.tsx`; the admin
 * portal (`app/(admin)/layout.tsx`) is a sibling nested layout under this same
 * root and renders none of them. A nested layout cannot un-render what its
 * parent already emitted, so anything not wanted by every route in the app has
 * to sit one level down from here.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      /**
       * ThemeScript runs before hydration and writes four things to this
       * element that the server HTML cannot contain: the `dark` class,
       * `style.colorScheme`, `data-bg` and `data-shape`. React sees the
       * difference and warns on every load.
       *
       * That mismatch is the mechanism working, not a bug: the whole point of
       * resolving the theme pre-paint is that the client knows something the
       * server cannot. suppressHydrationWarning applies to THIS element's own
       * attributes only — one level, not the tree — so nothing below it stops
       * being checked.
       *
       * The alternative is rendering the theme from a cookie so the server can
       * emit it, which trades a silent warning for a dynamic root and costs
       * every static route its prerender.
       */
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
        {/*
          Ships in production on purpose, while D9 is open: the choice of
          background and hero shape is being made on the deployed site, not
          on localhost. It excludes itself from /admin. Remove it — and the
          losing variants — the moment D9 is decided.
        */}
        <DevVariantPicker />
      </body>
    </html>
  );
}
