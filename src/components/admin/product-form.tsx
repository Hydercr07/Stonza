import Link from "next/link";
import { saveProductAction, transitionProductStatusAction } from "@/actions/admin";
import type { Category, Collection, Product } from "@/types/domain";
import { Button } from "@/components/shared/ui/button";
import { AdminMediaUploader } from "@/components/admin/media-uploader";

export function ProductForm({
  product,
  categories,
  collections,
}: {
  product?: Product | null;
  categories: Category[];
  collections: Collection[];
}) {
  const activeCategories = categories.filter((category) => !category.deletedAt && category.status !== "trash");
  const selectedCategorySlugs = product?.categorySlugs?.length
    ? product.categorySlugs
    : product?.categorySlug
      ? [product.categorySlug]
      : activeCategories[0]
        ? [activeCategories[0].slug]
        : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Product editor</p>
          <h1 className="text-display mt-3 text-5xl">{product ? product.name : "New product"}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
            Upload product images, choose the featured visual, reorder the gallery and connect the stone to live categories and collections.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/products">Cancel</Link>
          </Button>
          {product ? (
            <form action={transitionProductStatusAction}>
              <input type="hidden" name="id" value={product.id} />
              <input
                type="hidden"
                name="status"
                value={product.status === "archived" ? "published" : "archived"}
              />
              <Button variant="outline">{product.status === "archived" ? "Restore" : "Archive"}</Button>
            </form>
          ) : null}
        </div>
      </div>
      <form action={saveProductAction} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <input type="hidden" name="id" defaultValue={product?.id} />
        <div className="space-y-6">
          <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
            <label className="grid gap-2 text-sm">
              Name
              <input
                name="name"
                defaultValue={product?.name}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm">
              SKU
              <input
                name="sku"
                defaultValue={product?.sku}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Short description
              <textarea
                name="shortDescription"
                defaultValue={product?.shortDescription}
                rows={4}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Full description
              <textarea
                name="description"
                defaultValue={product?.description}
                rows={8}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
            </label>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
            <AdminMediaUploader
              name="media"
              label="Product gallery"
              description="Drag, drop or browse to upload multiple product images. Reorder them and choose the featured image that will appear on cards and product pages."
              initialItems={product?.media}
            />
          </div>
        </div>
        <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
          <label className="grid gap-2 text-sm">
            Price
            <input
              name="price"
              type="number"
              defaultValue={product?.price ?? 0}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Sale price
            <input
              name="salePrice"
              type="number"
              defaultValue={product?.salePrice ?? ""}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Inventory
            <input
              name="inventoryQuantity"
              type="number"
              defaultValue={product?.inventoryQuantity ?? 1}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Stone type
            <input
              name="stoneType"
              defaultValue={product?.stoneType ?? ""}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Origin
            <input
              name="origin"
              defaultValue={product?.origin ?? ""}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
          <div className="grid gap-3">
            <p className="text-sm font-medium text-white">Categories</p>
            <input type="hidden" name="categorySlugs" value={JSON.stringify(selectedCategorySlugs)} />
            <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
              {activeCategories.map((category) => (
                <label key={category.id} className="flex items-center gap-3 text-sm text-white/80">
                  <input
                    type="checkbox"
                    name={`category:${category.slug}`}
                    defaultChecked={selectedCategorySlugs.includes(category.slug)}
                    className="h-4 w-4 rounded border-white/20 bg-black/30"
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs leading-6 text-white/45">Use the connected category manager to control publication, hero images and SEO.</p>
          </div>
          <label className="grid gap-2 text-sm">
            Collection
            <select
              name="collectionSlug"
              defaultValue={product?.collectionSlug ?? collections[0]?.slug}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            >
              {collections.map((collection) => (
                <option key={collection.id} value={collection.slug}>
                  {collection.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            Status
            <select
              name="status"
              defaultValue={product?.status ?? "draft"}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            >
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
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="featured" defaultChecked={product?.featured} /> Featured
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="newArrival" defaultChecked={product?.newArrival} /> New arrival
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="allowCartPurchase"
              defaultChecked={product?.allowCartPurchase ?? true}
            />{" "}
            Allow cart purchase
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="allowEnquiry" defaultChecked={product?.allowEnquiry ?? true} /> Allow
            enquiry
          </label>
          <Button className="w-full">Save product</Button>
        </div>
      </form>
    </div>
  );
}
