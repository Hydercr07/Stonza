// One-off cleanup: removes unambiguous test/QA fixtures from the live store
// (auto-generated "QA Collection <timestamp>" collections and "QA Customer"
// test orders with @stonza.test emails). Leaves the 6 QA-SKU'd *products*
// alone per explicit instruction (kept as real inventory).
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

  const removedCollections = store.collections.filter((c) => /^qa collection \d+/i.test(c.name));
  const removedOrders = (store.orders || []).filter((o) => /@stonza\.test$/i.test(o.customer?.email || ""));

  console.log("Removing collections:", removedCollections.map((c) => c.name));
  console.log("Removing orders:", removedOrders.map((o) => `${o.orderNumber} (${o.customer.email})`));

  store.collections = store.collections.filter((c) => !/^qa collection \d+/i.test(c.name));
  store.orders = (store.orders || []).filter((o) => !/@stonza\.test$/i.test(o.customer?.email || ""));

  // Prune the noisy QA/Playwright activity-log spam these fixtures generated
  // (create/update/delete churn on the collections/orders above) so the
  // admin activity feed reflects real store activity.
  const beforeLogCount = store.activityLogs.length;
  store.activityLogs = store.activityLogs.filter((log) => {
    const detail = (log.detail || "").toLowerCase();
    return !(detail.includes("qa collection") || detail.includes("playwright") || /qa-\d+@stonza\.test/i.test(detail));
  });
  console.log(`Pruned activity logs: ${beforeLogCount} -> ${store.activityLogs.length}`);

  const payload = `${JSON.stringify(store, null, 2)}\n`;
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectPath, Buffer.from(payload, "utf8"), {
      contentType: "application/json; charset=utf-8",
      upsert: true,
    });
  if (uploadError) throw new Error(`upload failed: ${uploadError.message}`);

  // Keep the local dev mirror in sync too.
  const localPath = path.join(__dirname, "..", ".stonza", "runtime", "dev-store.json");
  fs.mkdirSync(path.dirname(localPath), { recursive: true });
  fs.writeFileSync(localPath, payload, "utf8");

  console.log("Done. Remaining collections:", store.collections.length, "Remaining orders:", store.orders.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
