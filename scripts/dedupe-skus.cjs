// Fixes a real data-integrity bug found in the live catalogue: several
// unrelated products share the same SKU (e.g. seven different products all
// used "STO-NOH-001"). SKUs are supposed to uniquely identify one product;
// duplicates break inventory tracking and order/line-item lookups by SKU.
// This keeps the earliest-created product's SKU untouched and appends a
// distinguishing suffix ("-2", "-3", ...) to each later duplicate, in
// creation order, so nothing is silently lost or renamed unpredictably.
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadEnv(file) {
  const env = {};
  fs.readFileSync(file, "utf8").split("\n").forEach((line) => {
    const m = line.match(/^([A-Z_0-9]+)=(.*)$/);
    if (m) {
      let v = m[2].trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      env[m[1]] = v;
    }
  });
  return env;
}

async function main() {
  const env = loadEnv(path.join(__dirname, "..", ".env.local"));
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const bucket = "documents";
  const objectPath = "runtime/dev-store.json";

  const { data, error } = await supabase.storage.from(bucket).download(objectPath);
  if (error) throw new Error(`download failed: ${error.message}`);
  const store = JSON.parse(await data.text());

  const bySku = new Map();
  const sorted = [...store.products].sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
  const renames = [];

  for (const product of sorted) {
    const sku = product.sku;
    if (!sku) continue;
    const count = (bySku.get(sku) || 0) + 1;
    bySku.set(sku, count);
    if (count > 1) {
      const newSku = `${sku}-${count}`;
      renames.push({ id: product.id, name: product.name, from: sku, to: newSku });
      const real = store.products.find((p) => p.id === product.id);
      real.sku = newSku;
    }
  }

  console.log(`Renaming ${renames.length} duplicate SKU(s):`);
  renames.forEach((r) => console.log(`  ${r.name}: ${r.from} -> ${r.to}`));

  if (renames.length === 0) {
    console.log("No duplicates found, nothing to do.");
    return;
  }

  const payload = `${JSON.stringify(store, null, 2)}\n`;
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectPath, Buffer.from(payload, "utf8"), { contentType: "application/json; charset=utf-8", upsert: true });
  if (uploadError) throw new Error(`upload failed: ${uploadError.message}`);

  const localPath = path.join(__dirname, "..", ".stonza", "runtime", "dev-store.json");
  fs.mkdirSync(path.dirname(localPath), { recursive: true });
  fs.writeFileSync(localPath, payload, "utf8");

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
