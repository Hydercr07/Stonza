"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { adjustInventoryAction } from "@/actions/admin";
import type { ActivityLogEntry, Product } from "@/types/domain";
import { AdminBadge, AdminCard, AdminPageHeader } from "@/components/admin/ui";
import { Button } from "@/components/shared/ui/button";

export function InventoryManager({
  products,
  activityLogs,
}: {
  products: Product[];
  activityLogs: ActivityLogEntry[];
}) {
  const [query, setQuery] = useState("");
  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) =>
      !normalized
        ? true
        : [product.name, product.sku, product.categorySlug, product.collectionSlug]
            .join(" ")
            .toLowerCase()
            .includes(normalized),
    );
  }, [products, query]);

  const recentInventoryLogs = activityLogs
    .filter((entry) => entry.action === "inventory_adjusted")
    .slice(-12)
    .reverse();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Store"
        title="Inventory"
        description="Adjust stock quickly, keep a reason for each change, and review recent inventory history without opening every product."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminCard className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3">
            <Search className="h-4 w-4 text-[#8b7e70]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by product, SKU, category, or collection"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#8b7e70]"
            />
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-[#ece4d8]">
            <div className="hidden grid-cols-[1.7fr_0.7fr_0.7fr_0.7fr_1fr] gap-3 border-b border-[#ece4d8] bg-[#fcfaf6] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b7e70] lg:grid">
              <span>Product</span>
              <span>SKU</span>
              <span>Available</span>
              <span>Low stock</span>
              <span>Adjust</span>
            </div>
            <div className="divide-y divide-[#f0e9df]">
              {filteredProducts.map((product) => (
                <form
                  key={product.id}
                  action={adjustInventoryAction}
                  className="grid gap-4 px-4 py-4 lg:grid-cols-[1.7fr_0.7fr_0.7fr_0.7fr_1fr] lg:items-center"
                >
                  <input type="hidden" name="id" value={product.id} />
                  <div>
                    <Link href={`/admin/products/${product.id}`} className="font-medium text-[#171717] hover:text-[#9a6d2f]">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm text-[#6f6558]">
                      {product.status.replaceAll("_", " ")} · {product.collectionSlug || "No collection"}
                    </p>
                  </div>
                  <p className="text-sm text-[#5f564b]">{product.sku}</p>
                  <div>
                    <p className="text-sm font-medium text-[#171717]">{product.inventoryQuantity}</p>
                    {product.inventoryQuantity <= product.lowStockThreshold ? (
                      <AdminBadge tone="warning">Low stock</AdminBadge>
                    ) : (
                      <AdminBadge tone="success">Healthy</AdminBadge>
                    )}
                  </div>
                  <p className="text-sm text-[#5f564b]">{product.lowStockThreshold}</p>
                  <div className="grid gap-2">
                    <input
                      name="delta"
                      type="number"
                      placeholder="-5 or 10"
                      className="rounded-2xl border border-[#e7dfd1] bg-white px-3 py-2 text-sm text-[#171717]"
                    />
                    <input
                      name="reason"
                      placeholder="Reason: damaged stock, recount, received shipment"
                      className="rounded-2xl border border-[#e7dfd1] bg-white px-3 py-2 text-sm text-[#171717]"
                    />
                    <Button size="sm" variant="outline">
                      Update stock
                    </Button>
                  </div>
                </form>
              ))}
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7e70]">History</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#171717]">Recent stock adjustments</h2>
          <div className="mt-5 grid gap-3">
            {recentInventoryLogs.length ? (
              recentInventoryLogs.map((entry) => (
                <div key={entry.id} className="rounded-[1.25rem] border border-[#eee6da] px-4 py-4">
                  <p className="font-medium text-[#171717]">{entry.detail ?? "Inventory updated"}</p>
                  <p className="mt-1 text-sm text-[#6f6558]">
                    {entry.actor} · {new Date(entry.timestamp).toLocaleString("en-PK")}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-[#ddd2c3] bg-[#fcfaf6] px-4 py-10 text-sm text-[#6f6558]">
                No inventory adjustments yet.
              </div>
            )}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
