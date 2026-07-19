import { listAdminProducts } from "@/lib/data/store";

export default async function InventoryPage() {
  const products = await listAdminProducts();

  return (
    <div className="space-y-6">
      <h1 className="text-display text-5xl">Inventory</h1>
      <div className="grid gap-3">
        {products.map((product, index) => (
          <div key={`${product.id ?? product.slug}-${index}`} className="rounded-2xl border border-white/10 bg-[#111213] p-4">
            <div className="flex items-center justify-between">
              <p>{product.name}</p>
              <p className="text-sm text-white/55">Qty {product.inventoryQuantity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
