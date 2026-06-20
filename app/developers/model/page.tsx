"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { listProducts, roles, policy, decide, type DataProduct, type Role } from "../_reference";
import { ClassificationBadge } from "@/components/ClassificationBadge";
import { TagBadge } from "@/components/TagBadge";
import { RoleSelector } from "@/components/RoleSelector";

interface Edge {
  id: string;
  child: string;
  childField: string;
  parent: string;
  parentField: string;
}

export default function ModelPage() {
  const products = listProducts();
  const [role, setRole] = useState(policy.defaultRole);
  const activeRole = roles.find((r) => r.role === role)!;

  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    () => Object.fromEntries(products.map((p) => [p.dataProduct, true])),
  );
  const [hovered, setHovered] = useState<string | null>(null);
  const [paths, setPaths] = useState<{ id: string; d: string; active: boolean; x: number; y: number }[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const rowRefs = useRef(new Map<string, HTMLElement>());

  // FK edges derived from the schema (stable — depends only on the static model).
  const edges = useMemo<Edge[]>(() => {
    const es: Edge[] = [];
    for (const p of products) {
      for (const f of p.schema) {
        if (f.references) {
          const [pe, pf] = f.references.split(".");
          es.push({ id: `${p.dataProduct}.${f.name}`, child: p.dataProduct, childField: f.name, parent: pe!, parentField: pf! });
        }
      }
    }
    return es;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recompute = useCallback(() => {
    const cont = containerRef.current;
    if (!cont) return;
    const cb = cont.getBoundingClientRect();
    const anchor = (entity: string, field: string, side: "left" | "right") => {
      const row = expanded[entity] ? rowRefs.current.get(`${entity}.${field}`) : undefined;
      const el = row ?? cardRefs.current.get(entity);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: (side === "left" ? r.left : r.right) - cb.left,
        y: r.top - cb.top + r.height / 2,
      };
    };
    const out: { id: string; d: string; active: boolean; x: number; y: number }[] = [];
    for (const e of edges) {
      const cc = cardRefs.current.get(e.child)?.getBoundingClientRect();
      const pc = cardRefs.current.get(e.parent)?.getBoundingClientRect();
      if (!cc || !pc) continue;
      const childLeft = cc.left + cc.width / 2 >= pc.left + pc.width / 2;
      const cSide = childLeft ? "left" : "right";
      const pSide = childLeft ? "right" : "left";
      const a = anchor(e.child, e.childField, cSide);
      const b = anchor(e.parent, e.parentField, pSide);
      if (!a || !b) continue;
      const dx = Math.max(40, Math.abs(b.x - a.x) / 2);
      const ax = cSide === "left" ? a.x - dx : a.x + dx;
      const bx = pSide === "left" ? b.x - dx : b.x + dx;
      const active = hovered === null || hovered === e.child || hovered === e.parent;
      out.push({
        id: e.id,
        d: `M ${a.x} ${a.y} C ${ax} ${a.y}, ${bx} ${b.y}, ${b.x} ${b.y}`,
        active,
        x: b.x,
        y: b.y,
      });
    }
    setPaths(out);
  }, [edges, expanded, hovered]);

  useLayoutEffect(() => {
    recompute();
    const ro = new ResizeObserver(recompute);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [recompute]);

  const allExpanded = products.every((p) => expanded[p.dataProduct]);
  const setAll = (v: boolean) =>
    setExpanded(Object.fromEntries(products.map((p) => [p.dataProduct, v])));

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 pb-8 pt-16 md:px-10 md:pt-20">
          <Link href="/developers" className="font-mono text-xs text-muted hover:text-accent">
            ← developers
          </Link>
          <h1 className="font-display mt-5 text-4xl font-medium tracking-tight text-ink md:text-5xl">
            Entity-relationship model
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Click an entity to expand its attributes — primary keys, foreign keys,
            classification, and PII/MNPI. Foreign keys draw as connectors between
            entities. Pick a role to apply attribute-level masking live.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <RoleSelector roles={roles} value={role} onChange={setRole} />
            <button
              onClick={() => setAll(!allExpanded)}
              className="rounded-full border border-line px-3.5 py-1.5 font-mono text-xs text-muted transition-colors hover:text-ink"
            >
              {allExpanded ? "collapse all" : "expand all"}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <div ref={containerRef} className="relative">
          {/* connector overlay */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <marker id="pk-dot" markerWidth="8" markerHeight="8" refX="4" refY="4">
                <circle cx="4" cy="4" r="3" fill="var(--color-accent)" />
              </marker>
            </defs>
            {paths.map((p) => (
              <path
                key={p.id}
                d={p.d}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={p.active ? 1.75 : 1}
                strokeOpacity={p.active ? 0.7 : 0.18}
                markerEnd="url(#pk-dot)"
              />
            ))}
          </svg>

          {/* entity cards */}
          <div className="flex flex-wrap gap-x-16 gap-y-10">
            {products.map((p) => (
              <EntityCard
                key={p.dataProduct}
                product={p}
                expanded={!!expanded[p.dataProduct]}
                onToggle={() =>
                  setExpanded((e) => ({ ...e, [p.dataProduct]: !e[p.dataProduct] }))
                }
                role={activeRole}
                onHover={setHovered}
                registerCard={(el) => {
                  if (el) cardRefs.current.set(p.dataProduct, el);
                  else cardRefs.current.delete(p.dataProduct);
                }}
                registerRow={(field, el) => {
                  const k = `${p.dataProduct}.${field}`;
                  if (el) rowRefs.current.set(k, el);
                  else rowRefs.current.delete(k);
                }}
              />
            ))}
          </div>
        </div>
        <p className="mt-6 font-mono text-xs text-muted">
          Lines are foreign keys (● marks the referenced primary key). Hover an
          entity to isolate its relationships.
        </p>
      </section>
    </>
  );
}

function EntityCard({
  product,
  expanded,
  onToggle,
  role,
  onHover,
  registerCard,
  registerRow,
}: {
  product: DataProduct;
  expanded: boolean;
  onToggle: () => void;
  role: Role;
  onHover: (id: string | null) => void;
  registerCard: (el: HTMLElement | null) => void;
  registerRow: (field: string, el: HTMLElement | null) => void;
}) {
  const masked = product.schema.filter((f) => !decide(role, f).visible).length;
  return (
    <div
      ref={registerCard}
      onMouseEnter={() => onHover(product.dataProduct)}
      onMouseLeave={() => onHover(null)}
      className="relative z-10 w-72 self-start overflow-hidden rounded-xl border border-line bg-paper shadow-sm"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 bg-ink px-4 py-2.5 text-left text-paper"
      >
        <span className="font-display text-base font-medium tracking-tight">{product.title}</span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-[0.6rem] uppercase text-paper/50">{product.group}</span>
          <span className="text-paper/60">{expanded ? "−" : "+"}</span>
        </span>
      </button>

      {expanded && (
        <ul className="divide-y divide-line">
          {product.schema.map((f) => {
            const d = decide(role, f);
            return (
              <li
                key={f.name}
                ref={(el) => registerRow(f.name, el)}
                className={`flex items-center justify-between gap-2 px-3 py-1.5 ${
                  d.visible ? "" : "bg-ink/[0.03]"
                }`}
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  {f.primaryKey ? (
                    <span className="font-mono text-[0.6rem] text-brass" title="primary key">PK</span>
                  ) : f.references ? (
                    <span className="font-mono text-[0.6rem] text-accent" title={`FK → ${f.references}`}>FK</span>
                  ) : (
                    <span className="w-[1.1rem]" />
                  )}
                  <span className={`truncate font-mono text-xs ${d.visible ? "text-ink" : "text-muted line-through"}`}>
                    {f.name}
                  </span>
                  <span className="hidden truncate font-mono text-[0.65rem] text-muted sm:inline">
                    {f.type}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  {f.pii && <TagBadge tag="pii" />}
                  {f.mnpi && <TagBadge tag="mnpi" />}
                  <ClassificationBadge level={f.classification} />
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {!expanded && (
        <div className="px-4 py-2 font-mono text-[0.65rem] text-muted">
          {product.schema.length} attributes
          {masked > 0 ? ` · ${masked} masked` : ""}
        </div>
      )}
    </div>
  );
}
