import { CollectionCard } from "@/components/storefront/cards";
import { getLabelMap, listCollections } from "@/lib/data/store";

export default async function CollectionsPage() {
  const [collections, labels] = await Promise.all([listCollections(), getLabelMap()]);

  return (
    <section className="container-shell page-section">
      <div className="mb-10 rounded-[2rem] border border-[#eadfcf] bg-[linear-gradient(180deg,rgba(255,252,246,0.96),rgba(248,237,214,0.82))] p-5 sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[#a2845d]">{labels.collectionsEyebrow}</p>
        <h1 className="page-title mt-4 text-[#171717]">{labels.collectionsHeading}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-black/58">{labels.collectionsBody}</p>
      </div>
      {collections.length ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-[#eadfcf] bg-white/72 p-8 text-black/58">
          No published collections are available yet.
        </div>
      )}
    </section>
  );
}
