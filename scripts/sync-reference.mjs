// Sync the data-mesh-reference generated catalog into this site so the
// developers section renders the REAL reference output (no drift).
//
// Source: the sibling `data-mesh-reference` repo's generated/catalog.
// Output: app/developers/_reference/catalog.json (committed snapshot — Railway
// builds from the snapshot, not the sibling repo).
//
// Run after regenerating the toolkit:  node scripts/sync-reference.mjs
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Default sibling location; override with DMREF_DIR.
const ref = process.env.DMREF_DIR || resolve(root, "..", "data-mesh-reference");
const catalogDir = join(ref, "generated", "catalog");

if (!existsSync(catalogDir)) {
  console.error(
    `! reference catalog not found at ${catalogDir}\n` +
      `  Generate it first (npm run generate in data-mesh-reference), or set DMREF_DIR.\n` +
      `  Keeping the existing committed snapshot.`,
  );
  process.exit(0);
}

const index = JSON.parse(readFileSync(join(catalogDir, "index.json"), "utf8"));
const products = {};
for (const file of readdirSync(catalogDir)) {
  if (file === "index.json" || !file.endsWith(".json")) continue;
  const d = JSON.parse(readFileSync(join(catalogDir, file), "utf8"));
  products[d.dataProduct] = d;
}

const out = join(root, "app", "developers", "_reference", "catalog.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ index, products }, null, 2) + "\n", "utf8");
console.log(
  `✓ synced ${Object.keys(products).length} data products → ${out.replace(root, ".")}`,
);
