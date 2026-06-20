import type { Metadata } from "next";
import Link from "next/link";
import { listProducts, roles, policy, decide, getRole } from "../_reference";
import { ClassificationBadge } from "@/components/ClassificationBadge";
import { TagBadge } from "@/components/TagBadge";

export const metadata: Metadata = {
  title: "Access control — Semantic Quay reference",
  description:
    "Attribute-level access control governed by data classification — sensitivity tier plus PII and MNPI — instead of a paywall.",
};

export default function AccessPage() {
  const products = listProducts();

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-16 md:px-10 md:pt-20">
          <Link href="/developers" className="font-mono text-xs text-muted hover:text-accent">
            ← developers
          </Link>
          <h1 className="font-display mt-5 text-4xl font-medium tracking-tight text-ink md:text-5xl">
            Attribute-level access control
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            There is no paywall. Visibility is governed by data classification —
            a sensitivity tier plus orthogonal <strong>PII</strong> and{" "}
            <strong>MNPI</strong> handling tags — evaluated against each role's
            clearance, per attribute, everywhere the data is served.
          </p>
        </div>
      </section>

      {/* Legend */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="eyebrow">Sensitivity tiers</p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {policy.tiers.map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <ClassificationBadge level={t} />
                  <span>{tierBlurb[t]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Handling tags</p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li className="flex items-center gap-3">
                <TagBadge tag="pii" />
                <span>Personally identifiable information — names, personal identifiers.</span>
              </li>
              <li className="flex items-center gap-3">
                <TagBadge tag="mnpi" />
                <span>Material non-public information — market-moving figures.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="border-t border-line bg-paper-soft">
        <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
          <p className="eyebrow">Roles &amp; clearance</p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="font-mono text-[0.7rem] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Role</th>
                  <th className="px-4 py-2 font-medium">Max tier</th>
                  <th className="px-4 py-2 font-medium">PII</th>
                  <th className="px-4 py-2 font-medium">MNPI</th>
                  <th className="px-4 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.role} className="border-t border-line">
                    <td className="px-4 py-2.5 font-mono text-ink">{r.label}</td>
                    <td className="px-4 py-2.5">
                      <ClassificationBadge level={r.maxTier} />
                    </td>
                    <td className="px-4 py-2.5">{r.pii ? <Yes /> : <No />}</td>
                    <td className="px-4 py-2.5">{r.mnpi ? <Yes /> : <No />}</td>
                    <td className="px-4 py-2.5 text-muted">{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Matrix */}
      <section className="mx-auto max-w-6xl px-6 py-14 md:px-10">
        <p className="eyebrow">Visibility matrix</p>
        <h2 className="font-display mt-3 text-2xl font-medium tracking-tight text-ink">
          Every attribute, every role.
        </h2>
        <p className="mt-2 text-sm text-muted">
          ✓ visible · ✕ masked (with the governing reason). Generated from the
          contract — the same matrix the API and warehouse enforce.
        </p>

        <div className="mt-8 space-y-10">
          {products.map((p) => (
            <div key={p.dataProduct}>
              <h3 className="font-display text-lg font-medium tracking-tight text-ink">
                {p.title}
              </h3>
              <div className="mt-3 overflow-x-auto rounded-2xl border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="bg-paper-soft font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Attribute</th>
                      <th className="px-3 py-2.5 font-medium">Class</th>
                      {roles.map((r) => (
                        <th key={r.role} className="px-3 py-2.5 text-center font-medium">
                          {r.role}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {p.schema.map((f) => (
                      <tr key={f.name} className="border-t border-line">
                        <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-ink">
                          {f.name}
                          {f.pii && <span className="ml-1.5"><TagBadge tag="pii" /></span>}
                          {f.mnpi && <span className="ml-1.5"><TagBadge tag="mnpi" /></span>}
                        </td>
                        <td className="px-3 py-2">
                          <ClassificationBadge level={f.classification} />
                        </td>
                        {roles.map((r) => {
                          const d = decide(getRole(r.role)!, f);
                          return (
                            <td key={r.role} className="px-3 py-2 text-center">
                              {d.visible ? (
                                <span className="text-accent" title="visible">✓</span>
                              ) : (
                                <span
                                  className="font-mono text-[0.6rem] uppercase text-red-600"
                                  title={`masked by ${d.reasons.join(", ")}`}
                                >
                                  {d.reasons.join("/")}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

const tierBlurb: Record<string, string> = {
  public: "Freely shareable reference facts.",
  internal: "Internal-only identifiers and low-sensitivity attributes.",
  confidential: "Commercially sensitive — prices, notionals, positions.",
  restricted: "Highly sensitive — never served to broad roles.",
};

function Yes() {
  return <span className="text-accent">✓</span>;
}
function No() {
  return <span className="text-red-600">✗</span>;
}
