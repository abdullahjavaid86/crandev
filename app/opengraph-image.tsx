import { ImageResponse } from "next/og";

/**
 * The social card. Generated at build time, so it costs nothing at request.
 *
 * It exists because the metadata already declares `summary_large_image` — a
 * card type that promises an image. Without one, every share of this site
 * renders as a bare link, which for an agency whose enquiries arrive through
 * Slack and LinkedIn is a real loss.
 *
 * Deliberately typographic. `ImageResponse` renders a Satori subset of CSS —
 * no `backdrop-filter`, no `filter`, and every element in a flex container —
 * so reproducing the site's glass and grain here is not possible and would be
 * a poor use of the space anyway. What carries is the ground, the accent, and
 * the sentence.
 *
 * Colours are literals rather than tokens on purpose: this renders outside the
 * document, so there is no `globals.css` and no CSS variables to read. They
 * are the dark theme's `--surface`, `--fg`, `--muted` and `--accent`, and they
 * have to be updated by hand if those change.
 */

export const alt = "CraneDev — software that ships";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#06070A",
        padding: 72,
        fontFamily: "sans-serif",
      }}
    >
      {/* Wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "#35F0DC",
            color: "#06070A",
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          C
        </div>
        <div
          style={{ display: "flex", color: "#E8EDF5", fontSize: 34, fontWeight: 600 }}
        >
          CraneDev
        </div>
      </div>

      {/* The claim */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#E8EDF5",
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.05,
            maxWidth: 900,
          }}
        >
          Production software, built to be maintained.
        </div>
        <div
          style={{
            display: "flex",
            color: "#8A93A6",
            fontSize: 30,
            lineHeight: 1.4,
            maxWidth: 820,
          }}
        >
          We take systems from architecture to production, then stay on them.
        </div>
      </div>

      {/* Accent rule — the one cyan element, same rule as the site. */}
      <div style={{ display: "flex", width: 160, height: 5, background: "#35F0DC" }} />
    </div>,
    size,
  );
}
