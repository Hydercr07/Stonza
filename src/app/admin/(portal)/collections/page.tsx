import { deleteCollectionAction, saveCollectionAction } from "@/actions/admin";
import { MediaUrlField } from "@/components/admin/media-url-field";
import { Button } from "@/components/shared/ui/button";
import { listAdminCollections, listAdminProducts } from "@/lib/data/store";

export default async function AdminCollectionsPage() {
  const [collections, products] = await Promise.all([listAdminCollections(), listAdminProducts()]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Catalogue</p>
        <h1 className="text-display mt-3 text-5xl">Collections</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
          Manage collection imagery, visibility, descriptions, slugs and metadata from a single place.
        </p>
      </div>

      <form action={saveCollectionAction} className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
        <h2 className="text-2xl text-white">New collection</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <input
            name="name"
            placeholder="Collection name"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
          />
          <input
            name="slug"
            placeholder="Optional custom slug"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
          />
          <textarea
            name="description"
            placeholder="Short collection description"
            rows={4}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 lg:col-span-2"
          />
          <MediaUrlField
            name="featuredImage"
            label="Featured image"
            description="Used for collection cards and previews."
            accept=".jpg,.jpeg,.png,.webp,.avif"
            imageOnly
          />
          <MediaUrlField
            name="heroMedia"
            label="Hero image"
            description="Used on the collection detail page."
            accept=".jpg,.jpeg,.png,.webp,.avif"
            imageOnly
          />
          <input
            name="seoTitle"
            placeholder="SEO title"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
          />
          <textarea
            name="seoDescription"
            placeholder="Meta description"
            rows={4}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
          />
          <input
            name="openGraphImage"
            placeholder="Open Graph image URL"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
          />
          <input
            name="sortOrder"
            type="number"
            defaultValue={collections.length + 1}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
          />
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="active" defaultChecked /> Visible on storefront
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="featured" /> Featured collection
          </label>
        </div>
        <Button className="mt-6">Save collection</Button>
      </form>

      <div className="space-y-4">
        {collections.length ? (
          collections.map((collection) => (
            <form
              key={collection.id}
              action={saveCollectionAction}
              className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6"
            >
              <input type="hidden" name="id" value={collection.id} />
              <div className="grid gap-4 lg:grid-cols-2">
                <input
                  name="name"
                  defaultValue={collection.name}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                />
                <input
                  name="slug"
                  defaultValue={collection.slug}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                />
                <textarea
                  name="description"
                  defaultValue={collection.description}
                  rows={4}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 lg:col-span-2"
                />
                <MediaUrlField
                  name="featuredImage"
                  label="Featured image"
                  description="Used for collection cards and previews."
                  defaultValue={collection.featuredImage}
                  accept=".jpg,.jpeg,.png,.webp,.avif"
                  imageOnly
                />
                <MediaUrlField
                  name="heroMedia"
                  label="Hero image"
                  description="Used on the collection detail page."
                  defaultValue={collection.heroMedia}
                  accept=".jpg,.jpeg,.png,.webp,.avif"
                  imageOnly
                />
                <input
                  name="seoTitle"
                  defaultValue={collection.seoTitle}
                  placeholder="SEO title"
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                />
                <textarea
                  name="seoDescription"
                  defaultValue={collection.seoDescription}
                  placeholder="Meta description"
                  rows={4}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                />
                <input
                  name="openGraphImage"
                  defaultValue={collection.openGraphImage}
                  placeholder="Open Graph image URL"
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                />
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={collection.sortOrder}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                />
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" name="active" defaultChecked={collection.active} /> Visible on storefront
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" name="featured" defaultChecked={collection.featured} /> Featured collection
                </label>
              </div>
              <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-black/15 p-4">
                <p className="mb-3 text-sm text-white/60">Assigned products</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {products
                    .filter((product) => product.status !== "trash")
                    .map((product) => (
                      <label key={product.id} className="flex items-center gap-3 text-sm text-white/78">
                        <input
                          type="checkbox"
                          name={`product:${product.slug}`}
                          defaultChecked={product.collectionSlug === collection.slug}
                        />
                        <span>{product.name}</span>
                      </label>
                    ))}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button>Save changes</Button>
                <button
                  type="submit"
                  formAction={deleteCollectionAction}
                  name="id"
                  value={collection.id}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm text-white"
                >
                  Delete collection
                </button>
              </div>
            </form>
          ))
        ) : (
          <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-8 text-white/68">
            No collections have been created yet.
          </div>
        )}
      </div>
    </div>
  );
}
