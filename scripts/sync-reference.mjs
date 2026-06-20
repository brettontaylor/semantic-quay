// Sync the data-mesh-reference outputs into this site so the developers section
// renders the REAL reference output (catalog), enforces the REAL access policy,
// and queries a sample of the REAL synthetic data. No drift.
//
// Vendors three committed snapshots into app/developers/_reference/:
//   catalog.json  — generated data-product catalog (schema, lineage, pii/mnpi)
//   access.json   — generated access policy (roles + role×field matrix)
//   dataset.json  — full synthetic rows (all attributes; masking applied at query time)
//
// Run after regenerating the toolkit:  node scripts/sync-reference.mjs
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = process.env.DMREF_DIR || resolve(root, "..", "data-mesh-reference");
// The engine (and its generated/ + examples/) live under packages/engine after the
// monorepo conversion; fall back to repo root for older checkouts.
const ref = existsSync(join(repo, "packages", "engine", "generated"))
  ? join(repo, "packages", "engine")
  : repo;
const catalogDir = join(ref, "generated", "catalog");
const outDir = join(root, "app", "developers", "_reference");

if (!existsSync(catalogDir)) {
  console.error(
    `! reference output not found at ${catalogDir}\n` +
      `  Generate it first (npm run generate in data-mesh-reference), or set DMREF_DIR.\n` +
      `  Keeping the existing committed snapshots.`,
  );
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });

// --- catalog ---
const index = JSON.parse(readFileSync(join(catalogDir, "index.json"), "utf8"));
const products = {};
for (const file of readdirSync(catalogDir)) {
  if (file === "index.json" || !file.endsWith(".json")) continue;
  const d = JSON.parse(readFileSync(join(catalogDir, file), "utf8"));
  products[d.dataProduct] = d;
}
writeFileSync(
  join(outDir, "catalog.json"),
  JSON.stringify({ index, products }, null, 2) + "\n",
);

// --- access policy ---
const policy = JSON.parse(
  readFileSync(join(ref, "generated", "access", "policy.json"), "utf8"),
);
writeFileSync(join(outDir, "access.json"), JSON.stringify(policy, null, 2) + "\n");

// --- model registry ---
const registry = JSON.parse(
  readFileSync(join(ref, "generated", "registry", "registry.json"), "utf8"),
);
writeFileSync(join(outDir, "registry.json"), JSON.stringify(registry, null, 2) + "\n");

// --- sample dataset (parse the toolkit's example CSVs) ---
function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((s) => s.trim());
  return lines.slice(1).map((line) => {
    const cells = splitCsv(line);
    const row = {};
    headers.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}
function splitCsv(line) {
  const out = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}
const dataDir = join(ref, "examples", "data");
const dataset = {};
for (const p of Object.keys(products)) {
  const f = join(dataDir, `${p}.csv`);
  if (existsSync(f)) {
    let rows = parseCsv(readFileSync(f, "utf8"));
    // de-dupe on the product's primary key (mirror silver), keep a small sample
    const pk = products[p].schema.find((s) => s.primaryKey)?.name;
    if (pk) {
      const byPk = new Map();
      for (const r of rows) if (r[pk]) byPk.set(r[pk], r);
      rows = [...byPk.values()];
    }
    dataset[p] = rows.slice(0, 12);
  }
}
writeFileSync(join(outDir, "dataset.json"), JSON.stringify(dataset, null, 2) + "\n");

console.log(
  `✓ synced catalog (${Object.keys(products).length} products), access policy ` +
    `(${policy.roles.length} roles), registry (${registry.models.length} models), ` +
    `dataset (${Object.keys(dataset).length} entities) → ${outDir.replace(root, ".")}`,
);
