// Typed access to the vendored data-mesh-reference snapshots + the shared access
// engine. Refresh with `npm run sync:reference` (also runs on prebuild).
import catalog from "./catalog.json";
import accessPolicy from "./access.json";
import datasetJson from "./dataset.json";

export type Classification = "public" | "internal" | "confidential" | "restricted";

export interface SchemaField {
  name: string;
  type: string;
  classification: Classification;
  pii?: boolean;
  mnpi?: boolean;
  primaryKey?: boolean;
  references?: string;
}

export interface DataProduct {
  dataProduct: string;
  title: string;
  version: string;
  group: string;
  grain: string;
  owner: string;
  source: { id: string; kind?: string; cadenceDays: number | null };
  classificationSummary: Record<string, number>;
  schema: SchemaField[];
  lineage: { bronze: string; silver: string; gold: string; semantic: string };
  metrics: Metric[];
}

export interface Metric {
  name: string;
  agg: "sum" | "count" | "avg" | "min" | "max";
  field: string;
  description?: string;
}

export interface CatalogIndex {
  catalog: string;
  version: string;
  description: string;
  classifications: Classification[];
  products: { id: string; title: string; group: string; owner: string }[];
}

export interface Role {
  role: string;
  label: string;
  description?: string;
  maxTier: Classification;
  pii: boolean;
  mnpi: boolean;
}

export interface AccessPolicy {
  version: string;
  model: string;
  defaultRole: string;
  roles: Role[];
  tiers: Classification[];
  matrix: Record<string, Record<string, { visible: boolean; reasons: string[] }>>;
}

const cat = catalog as unknown as {
  index: CatalogIndex;
  products: Record<string, DataProduct>;
};
export const policy = accessPolicy as unknown as AccessPolicy;
export const dataset = datasetJson as unknown as Record<string, Record<string, string>[]>;

export const catalogIndex = cat.index;
export const products = cat.products;
export const roles = policy.roles;

export function listProducts(): DataProduct[] {
  return cat.index.products
    .map((p) => cat.products[p.id])
    .filter((p): p is DataProduct => Boolean(p));
}
export function getProduct(id: string): DataProduct | undefined {
  return cat.products[id];
}
export function getRole(id: string): Role | undefined {
  return policy.roles.find((r) => r.role === id);
}

// --- access engine (mirror of the toolkit's framework/access.ts) ---
const TIER: Classification[] = ["public", "internal", "confidential", "restricted"];
export type AccessReason = "tier" | "pii" | "mnpi";

export interface Decision {
  visible: boolean;
  reasons: AccessReason[];
}

export function decide(
  role: Pick<Role, "maxTier" | "pii" | "mnpi">,
  field: Pick<SchemaField, "classification" | "pii" | "mnpi">,
): Decision {
  const reasons: AccessReason[] = [];
  if (TIER.indexOf(field.classification) > TIER.indexOf(role.maxTier)) reasons.push("tier");
  if (field.pii && !role.pii) reasons.push("pii");
  if (field.mnpi && !role.mnpi) reasons.push("mnpi");
  return { visible: reasons.length === 0, reasons };
}

export const MASK = "•••";

/** Apply attribute-level masking to a row for a given role. */
export function maskRow(
  product: DataProduct,
  row: Record<string, string>,
  role: Role,
): Record<string, { value: string | null; visible: boolean; reasons: AccessReason[] }> {
  const out: Record<string, { value: string | null; visible: boolean; reasons: AccessReason[] }> = {};
  for (const f of product.schema) {
    const d = decide(role, f);
    out[f.name] = {
      value: d.visible ? (row[f.name] ?? null) : null,
      visible: d.visible,
      reasons: d.reasons,
    };
  }
  return out;
}
