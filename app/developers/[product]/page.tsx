import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, listProducts } from "../_reference";
import { ClassificationBadge } from "@/components/ClassificationBadge";

export function generateStaticParams() {
  return listProducts().map((p) => ({ product: p.dataProduct }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ product: string }>;
}): Promise<Metadata> {
  const { product } = await params;
  const p = getProduct(product);
  if (!p) return { title: "Not found — Semantic Quay" };
  return {
    title: `${p.title} — data product — Semantic Quay`,
    description: `${p.grain}. Generated data-product descriptor: schema, classification, and lineage.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  const p = getProduct(product);
  if (!p) notFound();

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto max-w-5xl px-6 pb-14 pt-16 md:px-10 md:pt-20">
          <Link
            href="/developers"
            className="font-mono text-xs text-muted transition-colors hover:text-accent"
          >
            ← developers / catalog
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-accent">
              {p.group}
            </span>
            <span className="font-mono text-xs text-muted">
              owner: {p.owner} · v{p.version}
            </span>
          </div>
          <h1 className="font-display mt-3 text-4xl font-medium tracking-tight text-ink md:text-5xl">
            {p.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{p.grain}</p>
        </div>
      </section>

      {/* Schema */}
      <section className="mx-auto max-w-5xl px-6 py-14 md:px-10">
        <h2 className="font-display text-2xl font-medium tracking-tight text-ink">
          Schema
        </h2>
        <p className="mt-2 text-sm text-muted">
          Every field carries a classification. The tier propagates to pipeline
          properties, semantic-model meta, and warehouse masking.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-soft font-mono text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Field</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Classification</th>
                <th className="px-5 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {p.schema.map((f) => (
                <tr key={f.name} className="border-t border-line">
                  <td className="px-5 py-3 font-mono text-ink">
                    {f.name}
                    {f.primaryKey && (
                      <span className="ml-2 rounded bg-ink/[0.06] px-1.5 py-0.5 font-mono text-[0.6rem] uppercase text-muted">
                        pk
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-mono text-muted">{f.type}</td>
                  <td className="px-5 py-3">
                    <ClassificationBadge level={f.classification} />
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {f.references ? (
                      <span className="font-mono text-xs">→ {f.references}</span>
                    ) : (
                      ""
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lineage + metrics */}
      <section className="mx-auto max-w-5xl px-6 pb-20 md:px-10">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-medium tracking-tight text-ink">
              Lineage
            </h2>
            <ol className="mt-5 space-y-2 font-mono text-sm">
              {[
                ["bronze", p.lineage.bronze],
                ["silver", p.lineage.silver],
                ["gold", p.lineage.gold],
                ["semantic", p.lineage.semantic],
              ].map(([layer, name]) => (
                <li key={layer} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs uppercase tracking-wider text-accent">
                    {layer}
                  </span>
                  <span className="rounded-lg border border-line bg-paper-soft px-3 py-1.5 text-ink">
                    {name}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="font-display text-2xl font-medium tracking-tight text-ink">
              Metrics
            </h2>
            {p.metrics.length ? (
              <ul className="mt-5 space-y-2">
                {p.metrics.map((m) => (
                  <li
                    key={m}
                    className="rounded-lg border border-line px-4 py-2.5 font-mono text-sm text-ink"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm text-muted">No semantic metrics defined.</p>
            )}
            <p className="mt-6 font-mono text-xs text-muted">
              source: {p.source.id}
              {p.source.cadenceDays ? ` · every ${p.source.cadenceDays}d` : ""}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
