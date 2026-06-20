"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listProducts, roles, policy, MASK } from "../_reference";
import { RoleSelector } from "@/components/RoleSelector";

interface ApiResponse {
  entity: string;
  role: string;
  clearance: { maxTier: string; pii: boolean; mnpi: boolean };
  count: number;
  fields: { name: string; visible: boolean; maskedBy?: string[] }[];
  rows: Record<string, string | null>[];
}

export default function ApiExplorer() {
  const products = listProducts();
  const [entity, setEntity] = useState("trade");
  const [role, setRole] = useState(policy.defaultRole);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    fetch(`/api/v1/${entity}?role=${role}`)
      .then((r) => r.json())
      .then((d) => live && setData(d))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [entity, role]);

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 pb-10 pt-16 md:px-10 md:pt-20">
          <Link href="/developers" className="font-mono text-xs text-muted hover:text-accent">
            ← developers
          </Link>
          <h1 className="font-display mt-5 text-4xl font-medium tracking-tight text-ink md:text-5xl">
            API explorer
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            A live endpoint over the synthetic data. The response is filtered
            per-attribute by your role — the same access policy the warehouse and
            semantic layer enforce.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        {/* Controls */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="eyebrow mb-2">Data product</p>
            <div className="flex flex-wrap gap-1.5">
              {products.map((p) => (
                <button
                  key={p.dataProduct}
                  onClick={() => setEntity(p.dataProduct)}
                  className={`rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
                    p.dataProduct === entity
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-line text-muted hover:text-ink"
                  }`}
                >
                  {p.dataProduct}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow mb-2">Role</p>
            <RoleSelector roles={roles} value={role} onChange={setRole} />
          </div>
        </div>

        {/* Request line */}
        <div className="mt-8 rounded-lg border border-line bg-ink px-4 py-3 font-mono text-sm text-paper">
          <span className="text-accent-bright">GET</span> /api/v1/{entity}?role={role}
        </div>

        {/* Response */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-line">
          <div className="flex items-center justify-between border-b border-line bg-paper-soft px-5 py-3">
            <span className="font-mono text-xs text-muted">
              {loading ? "loading…" : data ? `200 · ${data.count} rows` : ""}
            </span>
            <span className="font-mono text-xs text-muted">
              masked cells render as <span className="text-ink">{MASK}</span>
            </span>
          </div>
          {data && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-paper-soft font-mono text-[0.7rem] uppercase tracking-wider text-muted">
                  <tr>
                    {data.fields.map((f) => (
                      <th key={f.name} className="whitespace-nowrap px-4 py-2.5 font-medium">
                        {f.name}
                        {!f.visible && (
                          <span className="ml-1 text-red-600" title={`masked by ${f.maskedBy?.join(", ")}`}>
                            ✕
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, i) => (
                    <tr key={i} className="border-t border-line">
                      {data.fields.map((f) => {
                        const v = row[f.name];
                        const masked = v === MASK;
                        return (
                          <td
                            key={f.name}
                            className={`whitespace-nowrap px-4 py-2 font-mono text-xs ${
                              masked ? "bg-ink/[0.03] text-muted" : "text-ink"
                            }`}
                          >
                            {v ?? ""}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="mt-4 font-mono text-xs text-muted">
          Try it directly:{" "}
          <a className="text-accent hover:underline" href={`/api/v1/${entity}?role=${role}`} target="_blank">
            /api/v1/{entity}?role={role}
          </a>
        </p>
      </section>
    </>
  );
}
