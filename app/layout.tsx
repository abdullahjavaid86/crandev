import "./globals.css";

import { Bricolage_Grotesque, Inter_Tight, JetBrains_Mono } from "next/font/google";

import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DevVariantPicker } from "@/components/ui/DevVariantPicker";
import { ThemeScript } from "@/components/layout/ThemeScript";

/**
 * Fonts. All three use `display: swap`, so NONE of them blocks first paint —
 * text renders in the fallback and swaps when the file lands.
 *
 * That is why only the display face is preloaded. A preload is a
 * high-priority fetch competing with the stylesheet, and the stylesheet is the
 * thing that actually blocks FCP. Three preloads put 125KB of fonts in front
 * of a 10KB stylesheet: measured on a 1.6Mbps link, the CSS took 377ms to
 * arrive and FCP was 764ms. Preloading only the display face: 576ms.
 * Preloading none: 488ms.
 *
 * The display face keeps its preload because it is the headline — without it
 * the largest text on the page sits in a fallback for ~1.7s on a slow link and
 * then visibly changes. 88ms of FCP is worth not doing that to the brand
 * moment. Body and mono swap early enough not to be noticed, and `next/font`
 * matches the fallback metrics, so the swap costs 0.0001 CLS (measured).
 */

/** Display face — headlines only. Variable weight 600–700 in use. */
const display = Bricolage_Grotesque({
  variable: "--font-display-src",
  subsets: ["latin"],
  display: "swap",
});

/** Body face — paragraphs, buttons, nav. */
const body = Inter_Tight({
  variable: "--font-body-src",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

/** Utility face — eyebrows, section numbers, metadata. Reads as machine output. */
const mono = JetBrains_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "CraneDev — software that ships",
  description:
    "A senior software team that builds and maintains production systems for funded startups and product companies.",
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
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
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
