import { CollectionCard } from "@/components/storefront/cards";
import { getLabelMap, listCollections } from "@/lib/data/store";

export default async function CollectionsPage() {
  const [collections, labels] = await Promise.all([listCollections(), getLabelMap()]);

  return (
    <section className="container-shell py-16">
      <div className="mb-10 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">{labels.collectionsEyebrow}</p>
        <h1 className="text-display text-5xl text-white">{labels.collectionsHeading}</h1>
        <p className="max-w-2xl text-sm leading-7 text-white/62">{labels.collectionsBody}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </section>
  );
}
