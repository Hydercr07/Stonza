import { saveCollectionAction } from "@/actions/admin";
import { Button } from "@/components/shared/ui/button";
import { listAdminCollections } from "@/lib/data/store";

export default async function AdminCollectionsPage() {
  const collections = await listAdminCollections();

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form action={saveCollectionAction} className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Catalogue</p>
        <h1 className="text-display mt-3 text-4xl">Collection manager</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-white/58">
          Create and maintain the collection groups used by products, homepage sections and storefront merchandising.
        </p>
        <div className="mt-6 grid gap-4">
          <input
            name="name"
            placeholder="Collection name"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
          />
          <textarea
            name="description"
            placeholder="Short collection description"
            rows={4}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
          />
          <input
            name="featuredImage"
            defaultValue="/placeholders/collection-midnight.svg"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
          />
          <input
            name="heroMedia"
            defaultValue="/placeholders/collection-midnight.svg"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
          />
          <input
            name="sortOrder"
            type="number"
            defaultValue={collections.length + 1}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
          />
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="active" defaultChecked /> Active
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="featured" /> Featured
          </label>
          <Button>Save collection</Button>
        </div>
      </form>

      <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl text-white">Existing collections</h2>
            <p className="mt-2 text-sm leading-7 text-white/58">
              Every row below is editable and saves back into the shared repository layer.
            </p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.22em] text-white/45">
            {collections.length} total
          </span>
        </div>

        <div className="grid gap-4">
          {collections.map((collection) => (
            <form
              key={collection.id}
              action={saveCollectionAction}
              className="grid gap-4 rounded-[1.5rem] border border-white/8 bg-black/10 p-5"
            >
              <input type="hidden" name="id" value={collection.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  Name
                  <input
                    name="name"
                    defaultValue={collection.name}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Sort order
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={collection.sortOrder}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm">
                Description
                <textarea
                  name="description"
                  defaultValue={collection.description}
                  rows={3}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  Featured image
                  <input
                    name="featuredImage"
                    defaultValue={collection.featuredImage}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Hero media
                  <input
                    name="heroMedia"
                    defaultValue={collection.heroMedia}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="active" defaultChecked={collection.active} />
                    Active
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="featured" defaultChecked={collection.featured} />
                    Featured
                  </label>
                </div>
                <Button>Save changes</Button>
              </div>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
