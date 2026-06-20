// Typed access to the vendored data-mesh-reference catalog snapshot.
// Refresh with `npm run sync:reference` (also runs on prebuild).
import catalog from "./catalog.json";

export type Classification = "public" | "internal" | "confidential" | "restricted";

export interface SchemaField {
  name: string;
  type: string;
  classification: Classification;
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
  metrics: string[];
}

export interface CatalogIndex {
  catalog: string;
  version: string;
  description: string;
  classifications: Classification[];
  products: { id: string; title: string; group: string; owner: string }[];
}

const data = catalog as unknown as {
  index: CatalogIndex;
  products: Record<string, DataProduct>;
};

export const catalogIndex = data.index;
export const products = data.products;

export function listProducts(): DataProduct[] {
  return data.index.products
    .map((p) => data.products[p.id])
    .filter((p): p is DataProduct => Boolean(p));
}

export function getProduct(id: string): DataProduct | undefined {
  return data.products[id];
}
