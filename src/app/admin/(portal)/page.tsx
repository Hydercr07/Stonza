import Link from "next/link";
import { getStoreData, listAdminProducts, listOrders } from "@/lib/data/store";
import { formatMoney } from "@/lib/utils";
import { AdminBadge, AdminCard, AdminPageHeader, AdminStatCard } from "@/components/admin/ui";
import { Button } from "@/components/shared/ui/button";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export default async function AdminDashboardPage() {
  const [products, orders, store] = await Promise.all([listAdminProducts(), listOrders(), getStoreData()]);
  const today = startOfToday();
  const todaysOrders = orders.filter((order) => new Date(order.createdAt).getTime() >= today);
  const todaysRevenue = todaysOrders.reduce((total, order) => total + order.total, 0);
  const pendingOrders = orders.filter((order) => ["pending", "confirmed", "processing"].includes(order.status));
  const lowStockProducts = products.filter((product) => product.inventoryQuantity <= product.lowStockThreshold).slice(0, 6);
  const uniqueCustomers = new Set(orders.map((order) => order.customer.email.toLowerCase())).size;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Store overview"
        description="The most useful signals stay at the top: what sold today, what still needs attention, and what needs restocking."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/orders">Review orders</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/products/new">Add product</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Today's orders" value={todaysOrders.length} />
        <AdminStatCard label="Today's revenue" value={formatMoney(todaysRevenue, "PKR")} />
        <AdminStatCard label="Pending orders" value={pendingOrders.length} />
        <AdminStatCard label="Low stock" value={lowStockProducts.length} />
        <AdminStatCard label="Customers" value={uniqueCustomers} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminCard>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7e70]">Recent orders</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#171717]">Orders needing action</h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/orders">View all</Link>
            </Button>
          </div>

          <div className="grid gap-3">
            {(pendingOrders.length ? pendingOrders : orders).slice(0, 6).map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.orderNumber}`}
                className="rounded-[1.25rem] border border-[#eee6da] px-4 py-4 hover:bg-[#fcfaf6]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#171717]">{order.orderNumber}</p>
                    <p className="mt-1 text-sm text-[#6f6558]">
                      {order.customer.fullName} · {order.customer.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <AdminBadge tone={order.status === "delivered" ? "success" : order.status === "cancelled" ? "danger" : "warning"}>
                      {order.status}
                    </AdminBadge>
                    <p className="mt-2 text-sm text-[#171717]">{formatMoney(order.total, order.currency)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </AdminCard>

        <div className="space-y-6">
          <AdminCard>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7e70]">Restock</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#171717]">Low-stock products</h2>
            <div className="mt-5 grid gap-3">
              {lowStockProducts.length ? (
                lowStockProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/admin/products/${product.id}`}
                    className="rounded-[1.25rem] border border-[#eee6da] px-4 py-4 hover:bg-[#fcfaf6]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-[#171717]">{product.name}</p>
                        <p className="mt-1 text-sm text-[#6f6558]">{product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#171717]">{product.inventoryQuantity} left</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#9a6d2f]">Threshold {product.lowStockThreshold}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-[#ddd2c3] bg-[#fcfaf6] px-4 py-8 text-sm text-[#6f6558]">
                  No low-stock products right now.
                </div>
              )}
            </div>
          </AdminCard>

          <AdminCard>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7e70]">Recent activity</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#171717]">Latest admin actions</h2>
            <div className="mt-5 grid gap-3">
              {store.activityLogs.slice(-6).reverse().map((log) => (
                <div key={log.id} className="rounded-[1.25rem] border border-[#eee6da] px-4 py-4">
                  <p className="font-medium capitalize text-[#171717]">{log.action.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-sm text-[#6f6558]">
                    {log.actor} · {new Date(log.timestamp).toLocaleString("en-PK")}
                  </p>
                  {log.detail ? <p className="mt-2 text-sm text-[#5b5247]">{log.detail}</p> : null}
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
