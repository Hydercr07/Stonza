// Compares row counts between the JSON blob and the new Postgres tables
// after running backfill-postgres.cjs, so you can confirm nothing was lost
// before flipping DATA_BACKEND=postgres.
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

const TABLES = {
  categories: "categories",
  collections: "collections",
  products: "products",
  pages: "pages",
  journalPosts: "journal_posts",
  mediaAssets: "media_assets",
  homepageBanners: "homepage_banners",
  homepageSections: "homepage_sections",
  contentLabels: "content_labels",
  activityLogs: "activity_logs",
  orders: "orders",
};

async function main() {
  const env = loadEnv(path.join(__dirname, "..", ".env.local"));
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: blob, error: downloadError } = await supabase.storage
    .from("documents")
    .download("runtime/dev-store.json");
  if (downloadError) throw new Error(`Could not download the JSON blob: ${downloadError.message}`);
  const store = JSON.parse(await blob.text());

  console.log("table".padEnd(20), "json blob".padEnd(12), "postgres");
  console.log("-".repeat(45));
  let mismatch = false;
  for (const [storeKey, table] of Object.entries(TABLES)) {
    const jsonCount = (store[storeKey] ?? []).length;
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) {
      console.log(storeKey.padEnd(20), String(jsonCount).padEnd(12), `ERROR: ${error.message}`);
      mismatch = true;
      continue;
    }
    const flag = count === jsonCount ? "" : "  <-- MISMATCH";
    if (flag) mismatch = true;
    console.log(storeKey.padEnd(20), String(jsonCount).padEnd(12), `${count}${flag}`);
  }

  console.log(mismatch ? "\nSome counts differ -- investigate before cutting over." : "\nAll counts match.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
