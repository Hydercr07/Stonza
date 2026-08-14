import Link from "next/link";
import { listAdminProducts } from "@/lib/data/store";
import { getProductDisplayPrice, formatMoney } from "@/lib/utils";

export default async function InventoryPage() {
  const products = await listAdminProducts();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Inventory</p>
        <h1 className="text-display mt-3 text-5xl">Stock overview</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
          Review quantity, visibility, pricing and low-stock exposure across the current catalogue.
        </p>
      </div>
      <div className="grid gap-3">
        {products.map((product, index) => (
          <div key={`${product.id ?? product.slug}-${index}`} className="rounded-2xl border border-white/10 bg-[#111213] p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Link href={`/admin/products/${product.id}`} className="font-medium text-white hover:text-accent">
                  {product.name}
                </Link>
                <p className="mt-1 text-sm text-white/50">
                  {product.status.replaceAll("_", " ")} / {product.visibility} /{" "}
                  {formatMoney(getProductDisplayPrice(product), product.currency)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/55">Qty {product.inventoryQuantity}</p>
                <p
                  className={`text-xs ${
                    product.inventoryQuantity <= product.lowStockThreshold ? "text-amber-300" : "text-white/40"
                  }`}
                >
                  {product.inventoryQuantity <= product.lowStockThreshold ? "Low stock" : "Healthy stock"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
