import { Container } from "@/components/layout/Container";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/guard";

export const metadata: Metadata = {
  title: "Dashboard — CraneDev Admin",
  robots: { index: false, follow: false },
};

/**
 * The portal's landing page — phase 1 is the shell only.
 *
 * Stats and the contacts table are phase 2 and are deliberately absent rather
 * than mocked. A placeholder figure in an admin tool is worse than an empty
 * panel: nobody can tell it apart from a real one that happens to read zero.
 */
export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  return (
    <Container as="div" className="py-10 md:py-16">
      <p className="font-mono text-small tracking-[0.18em] text-muted uppercase">
        Dashboard
      </p>

      {/* text-h2 with the h2 line height: the h1 default is display size, which
          is a marketing headline, not a tool's page title. */}
      <h1 className="mt-4 max-w-[20ch] text-h2 leading-[1.1]">
        Welcome back, {admin.name}.
      </h1>

      <p className="mt-4 max-w-[65ch] text-muted">
        You&rsquo;re signed in as{" "}
        <span className="font-mono text-small text-fg">{admin.email}</span>. Your
        session is checked against the database on every request, so deactivating an
        account ends it immediately.
      </p>

      <section
        aria-labelledby="whats-next"
        className="mt-10 rounded-lg border border-dashed border-line-strong bg-raised p-6 md:mt-14 md:p-10"
      >
        <h2 id="whats-next" className="text-h3">
          Nothing to triage here yet
        </h2>
        <p className="mt-4 max-w-[65ch] text-muted">
          This panel is empty on purpose. The next release fills it with the contact
          submission counts — total, new this week, and the oldest one still pending —
          followed by the submissions table itself, with status and notes. Every figure
          will be a real count read from the database; none of them are shown before
          they exist.
        </p>
      </section>
    </Container>
  );
}
