import { Container } from "@/components/layout/Container";
import { brands, projects, roles, team, testimonials } from "@/lib/content";
import { dur, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * M0.7 — the token proof. Not a design, not the home page: a flat surface that
 * renders every token so a drift shows up here before it reaches a section.
 * Replaced wholesale by the real composition in M2/M3.
 *
 * It also imports lib/content, which is what makes the zod schemas actually
 * run at build time — an unimported loader validates nothing.
 */

const surfaces = [
  { token: "--void", value: "#06070A", role: "page background" },
  { token: "--carbon", value: "#0E1017", role: "raised surfaces, cards" },
  { token: "--graphite", value: "#171A22", role: "hover, inset panels" },
] as const;

const inks = [
  { token: "--ice", value: "#E8EDF5", role: "primary text" },
  { token: "--mist", value: "#8A93A6", role: "secondary text" },
  { token: "--cyan", value: "#35F0DC", role: "the accent — signature only" },
  { token: "--ion", value: "#4C6FFF", role: "secondary glow" },
] as const;

const content = [
  { file: "work.json", count: projects.length },
  { file: "team.json", count: team.length },
  { file: "testimonials.json", count: testimonials.length },
  { file: "brands.json", count: brands.length },
  { file: "roles.json", count: roles.length },
] as const;

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-small uppercase tracking-[0.18em] text-mist">
      {children}
    </p>
  );
}

export default function TokenProof() {
  return (
    <main className="py-28 md:py-40">
      <Container>
        <Label>M0.7 / token proof</Label>
        <h1 className="mt-6 max-w-[16ch]">Every token, rendered once.</h1>
        <p className="mt-6 max-w-[65ch] text-mist">
          If a colour, radius, or type step looks wrong here, it is wrong
          everywhere. This page is replaced by the real home composition in M2.
        </p>

        {/* ── Type scale ─────────────────────────────────────────────── */}
        <section aria-labelledby="type" className="mt-20">
          <Label>Type scale</Label>
          <h2 id="type" className="mt-4">
            Display, h2, h3, body
          </h2>
          <h3 className="mt-8">Bricolage Grotesque at h3</h3>
          <p className="mt-4 max-w-[65ch]">
            Inter Tight at body size, held to a 65ch measure. The display floor
            is 2.5rem so a headline holds two or three lines at 360px rather
            than five.
          </p>
          <p className="mt-4 text-small text-mist">Small — captions, metadata.</p>
        </section>

        {/* ── Surfaces ───────────────────────────────────────────────── */}
        <section aria-labelledby="surfaces" className="mt-20">
          <Label>Surfaces</Label>
          <h2 id="surfaces" className="mt-4">
            Three depths, one hairline
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {surfaces.map((s) => (
              <li
                key={s.token}
                className="rounded-md border border-hairline p-6"
                style={{ background: `var(${s.token})` }}
              >
                <p className="font-mono text-small uppercase tracking-[0.18em] text-mist">
                  {s.token}
                </p>
                <p className="mt-2 text-small text-mist">{s.value}</p>
                <p className="mt-1 text-small text-mist">{s.role}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Ink ────────────────────────────────────────────────────── */}
        <section aria-labelledby="ink" className="mt-20">
          <Label>Ink</Label>
          <h2 id="ink" className="mt-4">
            Text and accent
          </h2>
          <ul className="mt-8 space-y-3">
            {inks.map((i) => (
              <li key={i.token} className="flex flex-wrap items-center gap-4">
                <span
                  aria-hidden="true"
                  className="size-6 shrink-0 rounded-sm border border-hairline"
                  style={{ background: `var(${i.token})` }}
                />
                <span className="font-mono text-small uppercase tracking-[0.18em] text-mist">
                  {i.token}
                </span>
                <span className="text-small text-mist">{i.role}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Glass ──────────────────────────────────────────────────── */}
        <section aria-labelledby="glass" className="mt-20">
          <Label>Glass</Label>
          <h2 id="glass" className="mt-4">
            One recipe, over grain
          </h2>
          <div className="relative mt-8 overflow-hidden rounded-lg">
            {/* Something to refract — glass over flat --void is a grey box. */}
            <div
              aria-hidden="true"
              className="absolute -left-10 top-0 size-64 rounded-full opacity-30 blur-[120px]"
              style={{ background: "var(--cyan)" }}
            />
            <div
              aria-hidden="true"
              className="absolute -right-10 bottom-0 size-64 rounded-full opacity-30 blur-[120px]"
              style={{ background: "var(--ion)" }}
            />
            <div
              className="relative rounded-lg border border-hairline p-8 backdrop-blur-[20px] backdrop-saturate-[140%]"
              style={{
                background:
                  "linear-gradient(148deg, rgba(232,237,245,0.055), rgba(232,237,245,0.015))",
                boxShadow:
                  "0 1px 0 0 rgba(232,237,245,0.06) inset, 0 24px 60px -24px rgba(0,0,0,0.7)",
              }}
            >
              <p className="text-mist">
                Glass sits above the grain layer or a soft glow — never over
                flat void. Capped at two blurred surfaces below <code>md</code>.
              </p>
            </div>
          </div>
        </section>

        {/* ── Radius ─────────────────────────────────────────────────── */}
        <section aria-labelledby="radius" className="mt-20">
          <Label>Radius</Label>
          <h2 id="radius" className="mt-4">
            8 / 14 / 24
          </h2>
          <div className="mt-8 flex flex-wrap gap-4">
            {/* Classes are written out in full — Tailwind scans source text,
                so a template-built `rounded-${r}` would never be generated. */}
            {[
              { name: "sm", className: "rounded-sm" },
              { name: "md", className: "rounded-md" },
              { name: "lg", className: "rounded-lg" },
            ].map((r) => (
              <div
                key={r.name}
                className={cn(
                  "flex size-24 items-center justify-center border border-hairline bg-carbon",
                  r.className,
                )}
              >
                <span className="font-mono text-small uppercase tracking-[0.18em] text-mist">
                  {r.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Focus ──────────────────────────────────────────────────── */}
        <section aria-labelledby="focus" className="mt-20">
          <Label>Focus</Label>
          <h2 id="focus" className="mt-4">
            Tab through these
          </h2>
          <p className="mt-4 max-w-[65ch] text-mist">
            The cyan ring is the one cyan border that is legal. Every
            interactive element on the site must show it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-md border border-hairline bg-carbon px-5 py-3 transition-colors duration-[--d-micro] hover:bg-graphite"
            >
              Button
            </button>
            <a
              href="#type"
              className="rounded-md border border-hairline bg-carbon px-5 py-3 transition-colors duration-[--d-micro] hover:bg-graphite"
            >
              Link
            </a>
            <input
              aria-label="Sample input"
              placeholder="Input"
              className="rounded-md border border-hairline bg-carbon px-5 py-3 placeholder:text-mist"
            />
          </div>
        </section>

        {/* ── Content loader ─────────────────────────────────────────── */}
        <section aria-labelledby="content" className="mt-20">
          <Label>Content — zod validated at build</Label>
          <h2 id="content" className="mt-4">
            JSON behind a schema
          </h2>
          <p className="mt-4 max-w-[65ch] text-mist">
            All empty until real content lands (D2). Empty is honest; invented
            projects are not. A malformed entry fails the build.
          </p>
          <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {content.map((c) => (
              <div
                key={c.file}
                className="flex items-baseline justify-between gap-4 rounded-md border border-hairline bg-carbon px-5 py-4"
              >
                <dt className="font-mono text-small uppercase tracking-[0.18em] text-mist">
                  {c.file}
                </dt>
                <dd className="font-mono text-small text-ice">{c.count}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Motion tokens ──────────────────────────────────────────── */}
        <section aria-labelledby="motion" className="mt-20">
          <Label>Motion tokens</Label>
          <h2 id="motion" className="mt-4">
            Values only — primitives land in M1
          </h2>
          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-hairline bg-carbon px-5 py-4">
              <dt className="font-mono text-small uppercase tracking-[0.18em] text-mist">
                ease.out
              </dt>
              <dd className="mt-1 font-mono text-small text-ice">
                {ease.out.join(", ")}
              </dd>
            </div>
            <div className="rounded-md border border-hairline bg-carbon px-5 py-4">
              <dt className="font-mono text-small uppercase tracking-[0.18em] text-mist">
                dur
              </dt>
              <dd className="mt-1 font-mono text-small text-ice">
                {Object.entries(dur)
                  .map(([k, v]) => `${k} ${v}s`)
                  .join(" · ")}
              </dd>
            </div>
          </dl>
        </section>
      </Container>
    </main>
  );
}
