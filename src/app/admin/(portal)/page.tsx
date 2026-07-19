import Link from "next/link";
import { listAdminProducts, getStoreData } from "@/lib/data/store";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-white/45">{label}</p>
      <p className="mt-3 text-display text-4xl text-white">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [products, store] = await Promise.all([listAdminProducts(), getStoreData()]);
  const published = products.filter((product) => product.status === "published").length;
  const draft = products.filter((product) => product.status === "draft").length;
  const sold = products.filter((product) => product.status === "sold").length;
  const outOfStock = products.filter((product) => product.status === "out_of_stock").length;
  const lowStock = products.filter((product) => product.inventoryQuantity <= product.lowStockThreshold).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Overview</p>
        <h1 className="text-display mt-3 text-5xl">STONZA Control Room</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total products" value={products.length} />
        <StatCard label="Published" value={published} />
        <StatCard label="Drafts" value={draft} />
        <StatCard label="Sold" value={sold} />
        <StatCard label="Out of stock" value={outOfStock} />
        <StatCard label="Low stock" value={lowStock} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl">Recently edited products</h2>
            <Link href="/admin/products" className="text-sm text-white/60 hover:text-white">View all</Link>
          </div>
          <div className="grid gap-3">
            {products.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5).map((product, index) => (
              <Link key={`${product.id ?? product.slug}-${index}`} href={`/admin/products/${product.id}`} className="rounded-2xl border border-white/8 p-4 hover:bg-white/4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-white/52">{product.status.replaceAll("_", " ")}</p>
                  </div>
                  <p className="text-sm text-white/40">{new Date(product.updatedAt).toLocaleDateString("en-US")}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
          <h2 className="text-xl">Recent activity</h2>
          <div className="mt-6 grid gap-3">
            {store.activityLogs.slice(-5).reverse().map((log, index) => (
              <div key={`${log.id}-${index}`} className="rounded-2xl border border-white/8 p-4">
                <p className="font-medium capitalize">{log.action.replaceAll("_", " ")}</p>
                <p className="text-sm text-white/52">{log.actor} on {new Date(log.timestamp).toLocaleDateString("en-US")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
