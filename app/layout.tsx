import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Grain } from "@/components/layout/Grain";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Crandev — software that ships",
  description:
    "A senior software team that builds and maintains production systems for funded startups and product companies.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Grain />
      </body>
    </html>
  );
}
