import { saveProductAction, transitionProductStatusAction } from "@/actions/admin";
import type { Category, Collection, Product } from "@/types/domain";
import { Button } from "@/components/shared/ui/button";

export function ProductForm({
  product,
  categories,
  collections,
}: {
  product?: Product | null;
  categories: Category[];
  collections: Collection[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Product editor</p>
          <h1 className="text-display mt-3 text-5xl">{product ? product.name : "New product"}</h1>
        </div>
        {product ? (
          <form action={transitionProductStatusAction}>
            <input type="hidden" name="id" value={product.id} />
            <input type="hidden" name="status" value={product.status === "archived" ? "published" : "archived"} />
            <Button variant="outline">{product.status === "archived" ? "Restore" : "Archive"}</Button>
          </form>
        ) : null}
      </div>
      <form action={saveProductAction} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <input type="hidden" name="id" defaultValue={product?.id} />
        <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
          <label className="grid gap-2 text-sm">
            Name
            <input name="name" defaultValue={product?.name} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            SKU
            <input name="sku" defaultValue={product?.sku} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            Short description
            <textarea name="shortDescription" defaultValue={product?.shortDescription} rows={4} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            Full description
            <textarea name="description" defaultValue={product?.description} rows={8} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            Featured image URL
            <input name="featuredImage" defaultValue={product?.featuredImage ?? "/placeholders/product-obsidian.svg"} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          </label>
        </div>
        <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
          <label className="grid gap-2 text-sm">
            Price
            <input name="price" type="number" defaultValue={product?.price ?? 0} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            Sale price
            <input name="salePrice" type="number" defaultValue={product?.salePrice ?? ""} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            Inventory
            <input name="inventoryQuantity" type="number" defaultValue={product?.inventoryQuantity ?? 1} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            Stone type
            <input name="stoneType" defaultValue={product?.stoneType ?? ""} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            Origin
            <input name="origin" defaultValue={product?.origin ?? ""} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            Category
            <select name="categorySlug" defaultValue={product?.categorySlug ?? categories[0]?.slug} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>{category.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            Collection
            <select name="collectionSlug" defaultValue={product?.collectionSlug ?? collections[0]?.slug} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              {collections.map((collection) => (
                <option key={collection.id} value={collection.slug}>{collection.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            Status
            <select name="status" defaultValue={product?.status ?? "draft"} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="reserved">Reserved</option>
              <option value="out_of_stock">Out of stock</option>
              <option value="sold">Sold</option>
              <option value="archived">Archived</option>
              <option value="trash">Trash</option>
            </select>
          </label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="featured" defaultChecked={product?.featured} /> Featured</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="newArrival" defaultChecked={product?.newArrival} /> New arrival</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="allowCartPurchase" defaultChecked={product?.allowCartPurchase ?? true} /> Allow cart purchase</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="allowEnquiry" defaultChecked={product?.allowEnquiry ?? true} /> Allow enquiry</label>
          <Button className="w-full">Save product</Button>
        </div>
      </form>
    </div>
  );
}
