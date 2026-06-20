"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  listProducts,
  roles,
  policy,
  decide,
  getProduct,
  type DataProduct,
} from "../_reference";
import { ClassificationBadge } from "@/components/ClassificationBadge";
import { TagBadge } from "@/components/TagBadge";
import { RoleSelector } from "@/components/RoleSelector";

// Fixed ERD layout (viewBox 800 x 480).
const POS: Record<string, { x: number; y: number }> = {
  currency: { x: 400, y: 70 },
  instrument: { x: 180, y: 220 },
  counterparty: { x: 620, y: 220 },
  trade: { x: 300, y: 390 },
  position: { x: 560, y: 390 },
};

export default function ModelPage() {
  const allProducts = listProducts();
  const [role, setRole] = useState(policy.defaultRole);
  const [selected, setSelected] = useState("trade");
  const activeRole = roles.find((r) => r.role === role)!;
  const product = getProduct(selected)!;

  // FK edges: child entity -> referenced entity.
  const edges = useMemo(() => {
    const es: { from: string; to: string }[] = [];
    for (const p of allProducts) {
      for (const f of p.schema) {
        if (f.references) {
          const to = f.references.split(".")[0];
          if (POS[p.dataProduct] && POS[to]) es.push({ from: p.dataProduct, to });
        }
      }
    }
    return es;
  }, [allProducts]);

  const maskedCount = (p: DataProduct) =>
    p.schema.filter((f) => !decide(activeRole, f).visible).length;

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 pb-10 pt-16 md:px-10 md:pt-20">
          <Link href="/developers" className="font-mono text-xs text-muted hover:text-accent">
            ← developers
          </Link>
          <h1 className="font-display mt-5 text-4xl font-medium tracking-tight text-ink md:text-5xl">
            Data model
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Navigate the entity-relationship model. Pick a role to see
            attribute-level access applied live — masked fields are governed by
            sensitivity tier, PII, and MNPI, not by a paywall.
          </p>
          <div className="mt-7">
            <RoleSelector roles={roles} value={role} onChange={setRole} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-12 md:px-10">
        {/* ERD map */}
        <div className="md:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-line bg-paper-soft">
            <svg viewBox="0 0 800 480" className="w-full">
              {edges.map((e, i) => {
                const a = POS[e.from];
                const b = POS[e.to];
                return (
                  <line
                    key={i}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="var(--color-accent)"
                    strokeOpacity="0.3"
                    strokeWidth="1.5"
                  />
                );
              })}
              {allProducts.map((p) => {
                const pos = POS[p.dataProduct];
                if (!pos) return null;
                const on = p.dataProduct === selected;
                const masked = maskedCount(p);
                return (
                  <g
                    key={p.dataProduct}
                    transform={`translate(${pos.x - 80}, ${pos.y - 26})`}
                    onClick={() => setSelected(p.dataProduct)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      width="160"
                      height="52"
                      rx="10"
                      fill={on ? "var(--color-ink)" : "var(--color-paper)"}
                      stroke={on ? "var(--color-ink)" : "var(--color-line)"}
                      strokeWidth="1.5"
                    />
                    <text
                      x="14"
                      y="22"
                      fontFamily="var(--font-display)"
                      fontSize="15"
                      fill={on ? "var(--color-paper)" : "var(--color-ink)"}
                    >
                      {p.title}
                    </text>
                    <text
                      x="14"
                      y="39"
                      fontFamily="var(--font-mono)"
                      fontSize="9"
                      fill={on ? "rgba(246,244,239,0.6)" : "var(--color-muted)"}
                    >
                      {p.group} · {masked > 0 ? `${masked} masked` : "full access"}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="mt-3 font-mono text-xs text-muted">
            Lines are foreign keys. Click an entity to inspect its attributes.
          </p>
        </div>

        {/* Detail panel */}
        <div className="md:col-span-5">
          <div className="rounded-2xl border border-line p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium tracking-tight text-ink">
                {product.title}
              </h2>
              <Link
                href={`/developers/${product.dataProduct}`}
                className="font-mono text-xs text-accent hover:underline"
              >
                full descriptor →
              </Link>
            </div>
            <p className="mt-1 text-sm text-muted">{product.grain}</p>
            <ul className="mt-5 space-y-2">
              {product.schema.map((f) => {
                const d = decide(activeRole, f);
                return (
                  <li
                    key={f.name}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                      d.visible ? "border-line bg-paper" : "border-line bg-ink/[0.03]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`font-mono text-sm ${d.visible ? "text-ink" : "text-muted line-through"}`}
                      >
                        {f.name}
                      </span>
                      {f.primaryKey && (
                        <span className="rounded bg-ink/[0.06] px-1 font-mono text-[0.55rem] uppercase text-muted">
                          pk
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {f.pii && <TagBadge tag="pii" />}
                      {f.mnpi && <TagBadge tag="mnpi" />}
                      <ClassificationBadge level={f.classification} />
                      {!d.visible && (
                        <span
                          className="font-mono text-[0.6rem] uppercase text-red-600"
                          title={`masked by ${d.reasons.join(", ")}`}
                        >
                          ✕ {d.reasons.join("/")}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
