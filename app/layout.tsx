import "./globals.css";

import { Bricolage_Grotesque, Inter_Tight, JetBrains_Mono } from "next/font/google";

import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeScript } from "@/components/layout/ThemeScript";
import dynamic from "next/dynamic";

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
});

/** Utility face — eyebrows, section numbers, metadata. Reads as machine output. */
const mono = JetBrains_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Design-comparison control, development only.
 *
 * The import lives inside the dead branch on purpose. A static import at the
 * top plus a NODE_ENV check in the JSX does NOT keep it out of the bundle —
 * the JSX gets dead-coded but the module stays, which is exactly what shipped
 * on the first attempt. Putting the dynamic() call in the eliminated branch
 * removes the reference itself.
 */
const DevVariantPicker =
  process.env.NODE_ENV === "production"
    ? null
    : dynamic(() =>
        import("@/components/ui/DevVariantPicker").then((m) => m.DevVariantPicker),
      );

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
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
        {DevVariantPicker ? <DevVariantPicker /> : null}
      </body>
    </html>
  );
}
