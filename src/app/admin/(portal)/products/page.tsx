import Link from "next/link";
import { listAdminProducts } from "@/lib/data/store";
import { formatMoney } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Catalogue</p>
          <h1 className="text-display mt-3 text-5xl">Products</h1>
        </div>
        <Link href="/admin/products/new" className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black">New product</Link>
      </div>
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111213]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-white/45">
            <tr>
              <th className="px-5 py-4 font-medium">Product</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Inventory</th>
              <th className="px-5 py-4 font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={`${product.id ?? product.slug}-${index}`} className="border-b border-white/6">
                <td className="px-5 py-4">
                  <Link href={`/admin/products/${product.id}`} className="font-medium hover:text-accent">
                    {product.name}
                  </Link>
                </td>
                <td className="px-5 py-4 capitalize text-white/60">{product.status.replaceAll("_", " ")}</td>
                <td className="px-5 py-4 text-white/60">{product.inventoryQuantity}</td>
                <td className="px-5 py-4 text-white/60">{formatMoney(product.price, product.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
