import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import type { CartLineInput, CustomerOrderDetails, OrderRecord, StoreData } from "@/types/domain";

/**
 * Low-level I/O for the relational Postgres store (see
 * supabase/migrations/202608230001_relational_store.sql). Everything above
 * this module -- all the normalize-, validation-, and cascade logic in
 * store.ts -- is unchanged; this file only replaces how StoreData gets read
 * from and written to persistent storage.
 */

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
} as const;

type RowTableKey = keyof typeof ROW_TABLES;

/**
 * Deliberately a separate, explicit opt-in from "Supabase is configured" --
 * cutting the storefront/admin over to the relational tables is only safe
 * once supabase/migrations/202608230001_relational_store.sql has actually
 * been applied and the JSON-blob data has been backfilled into them (see
 * scripts/backfill-postgres.cjs). Until DATA_BACKEND=postgres is set, the
 * app keeps reading/writing the existing JSON blob exactly as before, so a
 * live deployment never breaks because this code shipped ahead of the
 * migration being run against production.
 */
export function isPostgresStoreConfigured() {
  return (
    process.env.DATA_BACKEND === "postgres" &&
    Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

async function fetchRows(table: string): Promise<unknown[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from(table).select("data");
  // activity_logs was always newest-first (the old store used unshift());
  // preserve that here since there's no generated sort column for it (see
  // the migration's note on why text::timestamptz can't be a generated column).
  if (table === "activity_logs") {
    query = query.order("created_at", { ascending: false });
  }
  const { data, error } = await query;
  if (error) throw new Error(`Postgres read failed for ${table}: ${error.message}`);
  return (data ?? []).map((row: { data: unknown }) => row.data);
}

async function fetchSingleton(table: string): Promise<unknown> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from(table).select("data").eq("id", 1).maybeSingle();
  if (error) throw new Error(`Postgres read failed for ${table}: ${error.message}`);
  return data?.data;
}

async function fetchOrders(): Promise<OrderRecord[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders_with_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Postgres read failed for orders: ${error.message}`);

  return (data ?? []).map(
    (row: Record<string, unknown>) =>
      ({
        id: row.id,
        orderNumber: row.order_number,
        submissionToken: (row.submission_token as string | null) ?? undefined,
        status: row.status,
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        currency: row.currency,
        subtotal: Number(row.subtotal),
        shipping: Number(row.shipping),
        discount: Number(row.discount),
        total: Number(row.total),
        items: row.items,
        customer: row.customer,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }) as OrderRecord,
  );
}

/**
 * Targeted single-table / single-row reads for the storefront's hot paths
 * (a product page, a category page, ...), so a request that only needs one
 * product doesn't pull all ten tables -- what readStoreFromPostgres() below
 * does, and still the right tool for admin listings and cascading writes
 * that legitimately need the whole picture.
 */
export async function fetchTable(table: RowTableKey): Promise<unknown[]> {
  return fetchRows(ROW_TABLES[table]);
}

export async function fetchSingletonTable(table: "settings" | "hero"): Promise<unknown> {
  return fetchSingleton(table === "settings" ? "site_settings" : "hero_settings");
}

/** `column` must be a real (generated or physical) column, not a jsonb path -- callers pass slug/sku. */
async function fetchOneBy(table: string, column: string, value: string): Promise<unknown> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from(table).select("data").eq(column, value).maybeSingle();
  if (error) throw new Error(`Postgres read failed for ${table}: ${error.message}`);
  return data?.data;
}

export async function fetchProductBySlug(slug: string): Promise<unknown> {
  return fetchOneBy("products", "slug", slug);
}

export async function fetchProductById(id: string): Promise<unknown> {
  return fetchOneBy("products", "id", id);
}

export async function fetchCategoryBySlug(slug: string): Promise<unknown> {
  return fetchOneBy("categories", "slug", slug);
}

export async function fetchCategoryById(id: string): Promise<unknown> {
  return fetchOneBy("categories", "id", id);
}

export async function fetchCollectionBySlug(slug: string): Promise<unknown> {
  return fetchOneBy("collections", "slug", slug);
}

export async function fetchCollectionById(id: string): Promise<unknown> {
  return fetchOneBy("collections", "id", id);
}

export async function fetchPageBySlug(slug: string): Promise<unknown> {
  return fetchOneBy("pages", "slug", slug);
}

export async function fetchPageById(id: string): Promise<unknown> {
  return fetchOneBy("pages", "id", id);
}

export async function fetchJournalPostBySlug(slug: string): Promise<unknown> {
  return fetchOneBy("journal_posts", "slug", slug);
}

export async function fetchJournalPostById(id: string): Promise<unknown> {
  return fetchOneBy("journal_posts", "id", id);
}

export async function fetchMediaAssetById(id: string): Promise<unknown> {
  return fetchOneBy("media_assets", "id", id);
}

export async function readStoreFromPostgres(): Promise<Partial<StoreData>> {
  const rowEntries = await Promise.all(
    (Object.entries(ROW_TABLES) as [RowTableKey, string][]).map(
      async ([key, table]) => [key, await fetchRows(table)] as const,
    ),
  );
  const rows = Object.fromEntries(rowEntries) as Record<RowTableKey, unknown[]>;

  const [settings, hero, orders] = await Promise.all([
    fetchSingleton("site_settings"),
    fetchSingleton("hero_settings"),
    fetchOrders(),
  ]);

  return {
    ...rows,
    settings: settings as StoreData["settings"] | undefined,
    hero: hero as StoreData["hero"] | undefined,
    orders,
  } as Partial<StoreData>;
}

// `previousIds` is this request's own "before" snapshot for the table (the
// ids that were present when readStore() ran at the start of this
// request/mutation), or `null` when there is no baseline to safely diff
// against. Deletion is computed ONLY as "was in this request's own before
// snapshot, is missing from its after state" -- never as "is absent from
// the current snapshot," which used to delete any row a *concurrent*
// request had inserted after this request's snapshot was taken (that row
// is legitimately absent from this snapshot without ever having been
// removed by anyone). With no baseline, no deletes happen at all: failing
// to sync a rare legitimate delete is recoverable, silently deleting an
// unrelated concurrent insert is not.
async function syncRowTable(table: string, items: Array<{ id: string }>, previousIds: Set<string> | null) {
  const supabase = createSupabaseAdminClient();
  const nowIso = new Date().toISOString();
  const currentIds = new Set(items.map((item) => item.id));

  if (items.length) {
    const rows = items.map((item) => ({ id: item.id, data: item, updated_at: nowIso }));
    const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });
    if (error) throw new Error(`Postgres write failed for ${table}: ${error.message}`);
  }

  if (!previousIds) return;

  const idsToDelete = [...previousIds].filter((id) => !currentIds.has(id));

  if (idsToDelete.length) {
    const { error: deleteError } = await supabase.from(table).delete().in("id", idsToDelete);
    if (deleteError) throw new Error(`Postgres delete failed for ${table}: ${deleteError.message}`);
  }
}

// Activity log entries are append-only in normal app usage (unshift only,
// never edited or removed) so writing every existing row back on every
// mutation would be pure waste -- only insert the ones that are new.
async function syncActivityLogs(items: Array<{ id: string }>, original: Array<{ id: string }> | undefined) {
  const knownIds = new Set((original ?? []).map((item) => item.id));
  const additions = items.filter((item) => !knownIds.has(item.id));
  if (!additions.length) return;

  const supabase = createSupabaseAdminClient();
  const nowIso = new Date().toISOString();
  const rows = additions.map((item) => ({ id: item.id, data: item, created_at: nowIso }));
  const { error } = await supabase.from("activity_logs").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`Postgres write failed for activity_logs: ${error.message}`);
}

async function syncSingleton(table: string, data: unknown) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from(table)
    .upsert({ id: 1, data, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw new Error(`Postgres write failed for ${table}: ${error.message}`);
}

/**
 * Persists only the top-level StoreData collections that actually changed
 * since `original` was read -- confining every write's blast radius to the
 * one or two tables it touches, instead of the old JSON blob's "rewrite the
 * entire site on every save". `orders` is intentionally excluded: order
 * mutations always go through create_order/update_order_status.
 */
export async function writeStoreToPostgres(current: StoreData, original: StoreData | undefined) {
  const changed = (key: keyof StoreData) =>
    !original || JSON.stringify(current[key]) !== JSON.stringify(original[key]);

  const tasks: Promise<void>[] = [];

  for (const [key, table] of Object.entries(ROW_TABLES) as [RowTableKey, string][]) {
    if (key === "contentLabels" ? changed("contentLabels") : changed(key)) {
      const previousIds = original
        ? new Set(((original[key] as Array<{ id: string }> | undefined) ?? []).map((item) => item.id))
        : null;
      tasks.push(syncRowTable(table, (current[key] as Array<{ id: string }>) ?? [], previousIds));
    }
  }

  if (changed("activityLogs")) {
    tasks.push(syncActivityLogs(current.activityLogs ?? [], original?.activityLogs));
  }
  if (changed("settings")) {
    tasks.push(syncSingleton("site_settings", current.settings));
  }
  if (changed("hero")) {
    tasks.push(syncSingleton("hero_settings", current.hero));
  }

  await Promise.all(tasks);
}

export async function createOrderInPostgres(payload: {
  customer: CustomerOrderDetails;
  cartLines: CartLineInput[];
  paymentMethod: string;
  submissionToken?: string;
}): Promise<OrderRecord> {
  const supabase = createSupabaseAdminClient();
  const orderId = `ord-${crypto.randomUUID()}`;
  const { data, error } = await supabase.rpc("create_order", {
    p_order_id: orderId,
    p_submission_token: payload.submissionToken ?? null,
    p_payment_method: payload.paymentMethod,
    p_customer: payload.customer,
    p_cart_lines: payload.cartLines,
  });
  if (error) throw new Error(error.message);
  return data as OrderRecord;
}

export async function updateOrderStatusInPostgres(
  orderNumber: string,
  status: OrderRecord["status"],
): Promise<OrderRecord> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("update_order_status", {
    p_order_number: orderNumber,
    p_status: status,
  });
  if (error) throw new Error(error.message);
  return data as OrderRecord;
}
