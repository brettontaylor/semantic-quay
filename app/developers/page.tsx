import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Developers — Semantic Quay reference architecture",
  description:
    "A generic, illustrative reference implementation of a metadata-driven data mesh: a governed metadata spec driving medallion pipelines, a published semantic layer, and warehouse serving.",
};

export default function Developers() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-20 md:px-10 md:pb-20 md:pt-24">
          <p className="eyebrow">Developers · Reference architecture</p>
          <h1 className="font-display mt-6 max-w-3xl text-4xl font-medium leading-[1.08] tracking-tight text-ink md:text-5xl">
            A metadata-driven data mesh, in the open.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            A generic, illustrative reference implementation: one governed
            metadata spec drives the medallion pipelines, the published semantic
            layer, and warehouse serving — with classification and lineage
            enforced end to end. Synthetic data only. Free to read, run, and
            adapt.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-brass" />
            Public repository — publishing soon
          </p>
        </div>
      </section>

      {/* Components */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
          <div className="max-w-2xl">
            <p className="eyebrow">The components</p>
            <h2 className="font-display mt-4 text-3xl font-medium tracking-tight text-ink md:text-4xl">
              Six packages, one source of truth.
            </h2>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {components.map((c) => (
              <div key={c.title} className="bg-paper p-7">
                <span className="font-mono text-xs text-accent">{c.tag}</span>
                <h3 className="font-display mt-3 text-lg font-medium tracking-tight text-ink">
                  {c.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The propagation chain */}
      <section className="border-t border-line bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
          <div className="max-w-2xl">
            <p className="eyebrow" style={{ color: "var(--color-accent-bright)" }}>
              Governed propagation
            </p>
            <h2 className="font-display mt-4 text-3xl font-medium tracking-tight md:text-4xl">
              A change flows in one direction — and CI proves it arrived.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-paper/70 md:text-lg">
              Edit the contract and the downstream surfaces regenerate.
              Classification coverage, registry consistency, and propagation
              completeness are enforced as gates — a change that stops at the
              spec is incomplete.
            </p>
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-3 font-mono text-sm">
            {chain.map((step, i) => (
              <span key={step} className="flex items-center gap-3">
                <span className="rounded-lg border border-line-bright bg-ink-soft px-3.5 py-2 text-paper">
                  {step}
                </span>
                {i < chain.length - 1 && (
                  <span className="text-accent-bright">→</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Back */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent"
          >
            <span className="rotate-180">
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                <path d="M3 8h9M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Back to Semantic Quay
          </Link>
        </div>
      </section>
    </>
  );
}

const components = [
  {
    tag: "contracts",
    title: "Governed metadata spec",
    body: "The single, versioned source of truth — entities, attributes, relationships, each carrying a classification. Sits on top of the controlled BDM/PDM.",
  },
  {
    tag: "pipelines",
    title: "Medallion framework",
    body: "A declarative registry generates bronze → silver → gold jobs, schedules, lineage, and an ops view. One entry defines a full medallion path.",
  },
  {
    tag: "semantic",
    title: "Semantic publisher",
    body: "Cube-style semantic models — cubes, measures, dimensions, governed access — generated from the contracts and published as machine-readable contracts.",
  },
  {
    tag: "warehouse",
    title: "Warehouse serving",
    body: "Snowflake-style DDL and serving views generated from the physical model, with classification carried through to masking and access roles.",
  },
  {
    tag: "governance",
    title: "Governance CI",
    body: "Gates that enforce classification coverage, registry consistency, and propagation completeness — preventing drift between spec, pipeline, semantic, and warehouse.",
  },
  {
    tag: "catalog",
    title: "Data-product catalog",
    body: "Machine-readable descriptors for each data product — schema, classification, owner, freshness, lineage — the discoverable face of the mesh.",
  },
];

const chain = ["BDM / PDM", "Contract", "Databricks", "Cube", "Snowflake"];
