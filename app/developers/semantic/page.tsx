"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  listProducts,
  roles,
  policy,
  dataset,
  decide,
  getProduct,
} from "../_reference";
import { RoleSelector } from "@/components/RoleSelector";

export default function SemanticDemo() {
  const products = listProducts().filter((p) => p.metrics.length > 0);
  const [entity, setEntity] = useState("trade");
  const [role, setRole] = useState("trader");
  const product = getProduct(entity)!;
  const activeRole = roles.find((r) => r.role === role)!;

  const [measureName, setMeasureName] = useState(product.metrics[0]?.name ?? "");
  const measure = product.metrics.find((m) => m.name === measureName) ?? product.metrics[0];

  // Dimensions = schema fields flagged as dimensions in the cube. We use the
  // product's non-pk, low-card-ish fields; the model marks dimensions, but here
  // we offer the declared dimension-like fields.
  const dimFields = product.schema.filter(
    (f) => !f.primaryKey && (f.classification === "public" || f.classification === "internal"),
  );
  const [dim, setDim] = useState(dimFields[0]?.name ?? "");

  const result = useMemo(() => {
    if (!measure) return { blocked: "no measure", rows: [] as [string, number][] };
    const measureField = product.schema.find((f) => f.name === measure.field);
    const dimField = product.schema.find((f) => f.name === dim);
    // Access enforcement: a measure/dimension whose source attribute is masked
    // for this role cannot be computed.
    if (measureField && !decide(activeRole, measureField).visible) {
      return {
        blocked: `measure source "${measure.field}" (${measureField.classification}${measureField.mnpi ? "/MNPI" : ""}${measureField.pii ? "/PII" : ""}) is not visible to ${activeRole.label}`,
        rows: [],
      };
    }
    if (dimField && !decide(activeRole, dimField).visible) {
      return {
        blocked: `group-by "${dim}" is not visible to ${activeRole.label}`,
        rows: [],
      };
    }
    const groups = new Map<string, number>();
    for (const row of dataset[entity] ?? []) {
      const key = dimField ? (row[dim] ?? "—") : "all";
      const prev = groups.get(key) ?? 0;
      if (measure.agg === "count") groups.set(key, prev + 1);
      else groups.set(key, prev + (parseFloat(row[measure.field] ?? "0") || 0));
    }
    return { blocked: "", rows: [...groups.entries()].sort((a, b) => b[1] - a[1]) };
  }, [entity, role, measureName, dim, measure, product, activeRole]);

  const max = Math.max(1, ...result.rows.map((r) => r[1]));

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 pb-10 pt-16 md:px-10 md:pt-20">
          <Link href="/developers" className="font-mono text-xs text-muted hover:text-accent">
            ← developers
          </Link>
          <h1 className="font-display mt-5 text-4xl font-medium tracking-tight text-ink md:text-5xl">
            Semantic layer
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Query governed metrics and dimensions. Access control reaches the
            semantic layer too: a measure whose source attribute is MNPI or PII
            simply cannot be computed by a role that lacks clearance.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="space-y-6 md:col-span-4">
            <Picker label="Cube" options={products.map((p) => p.dataProduct)} value={entity} onChange={(v) => { setEntity(v); const np = getProduct(v)!; setMeasureName(np.metrics[0]?.name ?? ""); }} />
            <Picker label="Measure" options={product.metrics.map((m) => m.name)} value={measureName} onChange={setMeasureName} />
            <Picker label="Group by" options={dimFields.map((f) => f.name)} value={dim} onChange={setDim} />
            <div>
              <p className="eyebrow mb-2">Role</p>
              <RoleSelector roles={roles} value={role} onChange={setRole} />
            </div>
          </div>

          <div className="md:col-span-8">
            <div className="rounded-lg border border-line bg-ink px-4 py-3 font-mono text-sm text-paper">
              <span className="text-accent-bright">SELECT</span> {dim},{" "}
              {measure?.agg}({measure?.field}){" "}
              <span className="text-accent-bright">FROM</span> {entity}{" "}
              <span className="text-accent-bright">GROUP BY</span> {dim}
            </div>

            <div className="mt-6 rounded-2xl border border-line p-6">
              {result.blocked ? (
                <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                  <span className="text-lg text-red-600">⊘</span>
                  <div>
                    <p className="font-medium text-ink">Blocked by access policy</p>
                    <p className="mt-1 text-sm text-muted">{result.blocked}</p>
                  </div>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {result.rows.map(([k, v]) => (
                    <li key={k} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 truncate font-mono text-xs text-ink">{k}</span>
                      <span className="h-6 flex-1 overflow-hidden rounded bg-paper-soft">
                        <span
                          className="block h-full rounded bg-accent/70"
                          style={{ width: `${(v / max) * 100}%` }}
                        />
                      </span>
                      <span className="w-28 shrink-0 text-right font-mono text-xs text-muted">
                        {measure?.agg === "count" ? v : v.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="mt-3 font-mono text-xs text-muted">
              Computed over the synthetic sample · enforcement identical to the API and warehouse.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function Picker({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-full border px-3 py-1.5 font-mono text-xs transition-colors ${
              o === value
                ? "border-accent bg-accent/10 text-accent"
                : "border-line text-muted hover:text-ink"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
