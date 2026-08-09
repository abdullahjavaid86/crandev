import type { Metadata } from "next";
import { ShieldCheck, ShieldOff } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { requireAdmin } from "@/lib/admin/guard";

export const metadata: Metadata = {
  title: "Settings — CraneDev Admin",
  robots: { index: false, follow: false },
};

/**
 * The account screen.
 *
 * Everything on it is read from the signed-in admin's own record — there is no
 * "manage other admins" here, and no figure that is not live. The controls
 * that change these values (password, two-factor, session revocation) are the
 * next piece of work; this page states what is true now rather than showing
 * disabled buttons that imply otherwise.
 */
export default async function AdminSettingsPage() {
  // FIRST statement, always. The authorization boundary — the proxy only
  // checks that a cookie exists.
  const admin = await requireAdmin();

  const twoFactorOn = admin.totpEnabled;

  return (
    <Container as="div" className="py-10 md:py-16">
      <div>
        <Eyebrow>Settings</Eyebrow>
        <h1 className="mt-3 max-w-[20ch] text-h2 leading-[1.1]">Your account</h1>
        <p className="mt-3 max-w-[60ch] text-muted">
          Who you are signed in as, and how this account is protected.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-2">
        <section className="rounded-md border border-line bg-raised p-5 md:p-6">
          <h2 className="text-h3">Identity</h2>
          <dl className="mt-4 flex flex-col gap-4">
            <div>
              <dt className="text-small text-muted">Name</dt>
              <dd className="mt-1 text-fg">{admin.name}</dd>
            </div>
            <div>
              <dt className="text-small text-muted">Email</dt>
              <dd className="mt-1 font-mono text-small break-all text-fg">
                {admin.email}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-md border border-line bg-raised p-5 md:p-6">
          <h2 className="text-h3">Security</h2>

          <div className="mt-4 flex items-start gap-3">
            {twoFactorOn ? (
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-accent-ink"
              />
            ) : (
              <ShieldOff
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-muted"
              />
            )}
            <div>
              <p className="text-fg">
                Two-factor authentication is {twoFactorOn ? "on" : "off"}.
              </p>
              <p className="mt-1 max-w-[46ch] text-small text-muted">
                {twoFactorOn
                  ? "A code from your authenticator app is required at every sign-in."
                  : "Sign-in needs only your password."}
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-[46ch] border-t border-line pt-4 text-small text-muted">
            Changing your password, turning two-factor on or off, and signing other
            devices out are not built yet. Until they are, an operator with database
            access is the only way to alter them.
          </p>
        </section>
      </div>
    </Container>
  );
}
