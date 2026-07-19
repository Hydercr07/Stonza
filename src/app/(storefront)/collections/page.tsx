import { CollectionCard } from "@/components/storefront/cards";
import { listCollections } from "@/lib/data/store";

export default async function CollectionsPage() {
  const collections = await listCollections();

  return (
    <section className="container-shell py-16">
      <div className="mb-10 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Collections</p>
        <h1 className="text-display text-5xl text-white">Mineral worlds with distinct tone</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </section>
  );
}
