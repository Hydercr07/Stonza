import { getStoreData } from "@/lib/data/store";

export default async function AdminTrashPage() {
  const store = await getStoreData();
  const trashedCategories = store.categories.filter((category) => category.status === "trash");
  const trashedProducts = store.products.filter((product) => product.status === "trash");
  const deletedMedia = store.mediaAssets.filter((asset) => asset.deletedAt);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Recovery</p>
        <h1 className="text-display mt-3 text-5xl">Trash</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
          Review soft-deleted records across the admin portal. Products and categories can already be restored from their dedicated detail screens.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-white/42">Trashed products</p>
          <p className="mt-3 text-display text-4xl text-white">{trashedProducts.length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-white/42">Trashed categories</p>
          <p className="mt-3 text-display text-4xl text-white">{trashedCategories.length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-white/42">Deleted media assets</p>
          <p className="mt-3 text-display text-4xl text-white">{deletedMedia.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-5">
          <h2 className="text-lg text-white">Products</h2>
          <div className="mt-4 grid gap-3">
            {trashedProducts.length ? trashedProducts.map((product) => (
              <div key={product.id} className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-white/72">
                {product.name}
              </div>
            )) : <p className="text-sm text-white/48">No trashed products right now.</p>}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-5">
          <h2 className="text-lg text-white">Categories</h2>
          <div className="mt-4 grid gap-3">
            {trashedCategories.length ? trashedCategories.map((category) => (
              <div key={category.id} className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-white/72">
                {category.name}
              </div>
            )) : <p className="text-sm text-white/48">No trashed categories right now.</p>}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-5">
          <h2 className="text-lg text-white">Media</h2>
          <div className="mt-4 grid gap-3">
            {deletedMedia.length ? deletedMedia.map((asset) => (
              <div key={asset.id} className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-white/72">
                {asset.originalFilename}
              </div>
            )) : <p className="text-sm text-white/48">No deleted media assets right now.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
