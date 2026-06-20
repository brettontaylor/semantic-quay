import type { Metadata } from "next";
import Link from "next/link";
import { registry, listModels, type RegistryModel } from "../_reference";

export const metadata: Metadata = {
  title: "Model registry — Semantic Quay reference",
  description:
    "Every BDM, PDM, and semantic model — registered, semantically versioned, and governed. Ingestion-side models bring product and reference data from upstream; semantic models govern consumption.",
};

export default function RegistryPage() {
  const bdms = listModels().filter((m) => m.kind === "bdm");
  const pdms = listModels().filter((m) => m.kind === "pdm");
  const sems = listModels().filter((m) => m.kind === "semantic");

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-16 md:px-10 md:pt-20">
          <Link href="/developers" className="font-mono text-xs text-muted hover:text-accent">
            ← developers
          </Link>
          <h1 className="font-display mt-5 text-4xl font-medium tracking-tight text-ink md:text-5xl">
            Model registry
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Every model is registered and semantically versioned.{" "}
            <strong>BDMs</strong> and <strong>PDMs</strong> bring product and
            reference data in from upstream systems; <strong>semantic models</strong>{" "}
            govern consumption. A content change that isn&apos;t matched by an
            adequate version bump fails the build.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 font-mono text-xs">
            {Object.entries(registry.counts).map(([k, n]) => (
              <span key={k} className="rounded-full border border-line px-3 py-1.5 text-muted">
                {n} {k.toUpperCase()}
              </span>
            ))}
            <a
              href="https://github.com/brettontaylor/data-mesh-reference"
              className="rounded-full border border-line px-3 py-1.5 text-accent hover:underline"
            >
              dmref CLI →
            </a>
          </div>
        </div>
      </section>

      {/* BDM */}
      <Section
        title="Business data models"
        sub="Conceptual business entities, sourced from upstream systems. Versioned independently of their physical bindings."
        models={bdms}
        columns={["upstream", "owner", "fields"]}
        cell={(m, c) =>
          c === "upstream"
            ? (m.upstream ?? "—")
            : c === "owner"
              ? (m.owner ?? "—")
              : String(m.detail.fields ?? "")
        }
      />

      {/* PDM */}
      <Section
        title="Physical data models"
        sub="Physical landing/serving bindings — table, load strategy, partitioning, key. A repartition or key change is breaking (major)."
        models={pdms}
        columns={["bdm", "table", "load", "partition", "key"]}
        cell={(m, c) =>
          c === "bdm"
            ? String(m.detail.bdm ?? "")
            : c === "table"
              ? String(m.detail.table ?? "")
              : c === "load"
                ? String(m.detail.loadStrategy ?? "")
                : c === "partition"
                  ? String(m.detail.partitionBy ?? "—")
                  : String(m.detail.uniqueKey ?? "")
        }
        tone="alt"
      />

      {/* Semantic */}
      <Section
        title="Semantic models"
        sub="Governed consumption models — selected dimensions and measures over the curated layer. Removing a dimension or measure is breaking."
        models={sems}
        columns={["sources", "dimensions", "measures"]}
        cell={(m, c) => {
          const arr = m.detail[c] as string[] | undefined;
          return arr ? String(arr.length) : "0";
        }}
      />

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
          <p className="font-mono text-xs text-muted">
            Access via API: <span className="text-ink">/api/v1/models</span> ·{" "}
            <span className="text-ink">/api/v1/models/&lt;id&gt;</span> · CLI:{" "}
            <span className="text-ink">dmref models</span>,{" "}
            <span className="text-ink">dmref model &lt;id&gt;</span>,{" "}
            <span className="text-ink">dmref register</span>
          </p>
        </div>
      </section>
    </>
  );
}

function Section({
  title,
  sub,
  models,
  columns,
  cell,
  tone,
}: {
  title: string;
  sub: string;
  models: RegistryModel[];
  columns: string[];
  cell: (m: RegistryModel, c: string) => string;
  tone?: "alt";
}) {
  return (
    <section className={tone === "alt" ? "border-t border-line bg-paper-soft" : "border-t border-line"}>
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <h2 className="font-display text-2xl font-medium tracking-tight text-ink md:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">{sub}</p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-paper">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-soft font-mono text-[0.7rem] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Model</th>
                <th className="px-4 py-2.5 font-medium">Version</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                {columns.map((c) => (
                  <th key={c} className="px-4 py-2.5 font-medium">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.id} className="border-t border-line">
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-ink">{m.id}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded border border-accent/25 bg-accent/10 px-1.5 py-0.5 font-mono text-xs text-accent">
                      v{m.version}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">{m.status}</td>
                  {columns.map((c) => (
                    <td key={c} className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted">
                      {cell(m, c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
