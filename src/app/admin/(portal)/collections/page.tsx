import { saveCollectionAction } from "@/actions/admin";
import { listCollections } from "@/lib/data/store";
import { Button } from "@/components/shared/ui/button";

export default async function AdminCollectionsPage() {
  const collections = await listCollections();

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form action={saveCollectionAction} className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
        <h1 className="text-display text-4xl">New collection</h1>
        <div className="mt-6 grid gap-4">
          <input name="name" placeholder="Name" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <textarea name="description" placeholder="Description" rows={4} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="featuredImage" defaultValue="/placeholders/collection-midnight.svg" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="heroMedia" defaultValue="/placeholders/collection-midnight.svg" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="sortOrder" type="number" defaultValue={collections.length + 1} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="active" defaultChecked /> Active</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="featured" /> Featured</label>
          <Button>Save collection</Button>
        </div>
      </form>
      <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
        <h2 className="text-xl">Existing collections</h2>
        <div className="mt-5 grid gap-3">
          {collections.map((collection) => (
            <div key={collection.id} className="rounded-2xl border border-white/8 p-4">
              <p className="font-medium">{collection.name}</p>
              <p className="text-sm text-white/55">{collection.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
