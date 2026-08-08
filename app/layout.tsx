import "./globals.css";

import {
  Bricolage_Grotesque,
  Inter_Tight,
  JetBrains_Mono,
} from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import dynamic from "next/dynamic";

import { Grain } from "@/components/layout/Grain";
import { Header } from "@/components/layout/Header";
import type { Metadata } from "next";
import { BackgroundLayer } from "@/components/layout/BackgroundLayer";
import { ThemeScript } from "@/components/layout/ThemeScript";

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
        <BackgroundLayer />
        <Header />
        {/* flex-1 so a short page still pins the footer to the bottom. */}
        <div className="flex-1">{children}</div>
        <Footer />
        <Grain />
        {DevVariantPicker ? <DevVariantPicker /> : null}
      </body>
    </html>
  );
}
