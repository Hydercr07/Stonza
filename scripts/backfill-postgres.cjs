// One-time backfill: copies the current JSON-blob store (Supabase Storage
// bucket "documents", runtime/dev-store.json) into the new relational
// tables created by supabase/migrations/202608230001_relational_store.sql.
//
// Safe to re-run: every table upsert is keyed by id (or submission_token /
// order_number for orders), so running this twice just re-applies the same
// rows. It does NOT delete or modify the JSON blob -- that stays in place
// as a rollback snapshot.
//
// Run this AFTER applying the migration and BEFORE setting
// DATA_BACKEND=postgres.
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

const ROW_TABLES = {
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
};

async function main() {
  const env = loadEnv(path.join(__dirname, "..", ".env.local"));
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: blob, error: downloadError } = await supabase.storage
    .from("documents")
    .download("runtime/dev-store.json");
  if (downloadError) throw new Error(`Could not download the JSON blob: ${downloadError.message}`);
  const store = JSON.parse(await blob.text());

  for (const [storeKey, table] of Object.entries(ROW_TABLES)) {
    const items = store[storeKey] ?? [];
    if (!items.length) {
      console.log(`${table}: nothing to backfill`);
      continue;
    }
    const rows = items.map((item) => ({ id: item.id, data: item }));
    const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });
    if (error) throw new Error(`Backfill failed for ${table}: ${error.message}`);
    console.log(`${table}: backfilled ${rows.length} row(s)`);
  }

  if (store.settings) {
    const { error } = await supabase.from("site_settings").upsert({ id: 1, data: store.settings }, { onConflict: "id" });
    if (error) throw new Error(`Backfill failed for site_settings: ${error.message}`);
    console.log("site_settings: backfilled");
  }

  if (store.hero) {
    const { error } = await supabase.from("hero_settings").upsert({ id: 1, data: store.hero }, { onConflict: "id" });
    if (error) throw new Error(`Backfill failed for hero_settings: ${error.message}`);
    console.log("hero_settings: backfilled");
  }

  const orders = store.orders ?? [];
  if (orders.length) {
    const orderRows = orders.map((order) => ({
      id: order.id,
      order_number: order.orderNumber,
      submission_token: order.submissionToken ?? null,
      status: order.status,
      payment_status: order.paymentStatus,
      payment_method: order.paymentMethod,
      currency: order.currency,
      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total,
      customer: order.customer,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    }));
    const { error: orderError } = await supabase.from("orders").upsert(orderRows, { onConflict: "id" });
    if (orderError) throw new Error(`Backfill failed for orders: ${orderError.message}`);

    const itemRows = orders.flatMap((order) =>
      (order.items ?? []).map((item) => ({
        id: item.id,
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        product_slug: item.productSlug,
        sku: item.sku,
        image: item.image,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        selected_size: item.selectedSize ?? null,
        selected_variant: item.selectedVariant ?? null,
      })),
    );
    if (itemRows.length) {
      const { error: itemError } = await supabase.from("order_items").upsert(itemRows, { onConflict: "id" });
      if (itemError) throw new Error(`Backfill failed for order_items: ${itemError.message}`);
    }
    console.log(`orders: backfilled ${orderRows.length} order(s), ${itemRows.length} item(s)`);

    // Seed the day-scoped order-number counters so numbering continues
    // sequentially instead of restarting at 001 for a day that already has orders.
    const countsByDay = new Map();
    for (const order of orders) {
      const match = /^STZ-(\d{8})-(\d+)$/.exec(order.orderNumber);
      if (!match) continue;
      const [, dayKey, seq] = match;
      countsByDay.set(dayKey, Math.max(countsByDay.get(dayKey) ?? 0, Number(seq)));
    }
    if (countsByDay.size) {
      const counterRows = [...countsByDay.entries()].map(([day_key, count]) => ({ day_key, count }));
      const { error: counterError } = await supabase
        .from("order_number_counters")
        .upsert(counterRows, { onConflict: "day_key" });
      if (counterError) throw new Error(`Backfill failed for order_number_counters: ${counterError.message}`);
      console.log(`order_number_counters: seeded ${counterRows.length} day(s)`);
    }
  } else {
    console.log("orders: nothing to backfill");
  }

  console.log("\nBackfill complete. Verify row counts, then set DATA_BACKEND=postgres to cut over.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
