import { BackgroundLayer } from "@/components/layout/BackgroundLayer";
import { Footer } from "@/components/layout/Footer";
import { Grain } from "@/components/layout/Grain";
import { Header } from "@/components/layout/Header";

/**
 * The marketing chrome.
 *
 * This used to live in `app/layout.tsx`, which meant every route in the app —
 * including the admin portal — inherited Header, Footer, BackgroundLayer and
 * Grain with no way to opt out. A nested layout can add to its parent but can
 * never remove what the parent already rendered, so the chrome had to move
 * DOWN a level rather than be conditionally suppressed at the root.
 *
 * The root layout keeps `<html>`/`<body>`, the fonts and the theme script, so
 * there is still exactly one root layout and the portal is a plain nested
 * layout under it (`app/(admin)/layout.tsx`).
 *
 * Returns a fragment on purpose: `body` is the flex column, and a wrapper div
 * here would make Header/Footer grandchildren of it and break the sticky
 * footer.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <BackgroundLayer />
      <Header />
      {/* flex-1 so a short page still pins the footer to the bottom. */}
      <div className="flex-1">{children}</div>
      <Footer />
      <Grain />
    </>
  );
}
