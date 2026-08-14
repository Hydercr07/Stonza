import { notFound, permanentRedirect } from "next/navigation";
import { ProductCard } from "@/components/storefront/cards";
import { getCollectionBySlug, getLabelMap, listProducts } from "@/lib/data/store";

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [collection, products, labels] = await Promise.all([
    getCollectionBySlug(slug),
    listProducts({ collectionSlug: slug }),
    getLabelMap(),
  ]);

  if (!collection) notFound();
  if (collection.slug !== slug && collection.slugHistory?.includes(slug)) {
    permanentRedirect(`/collections/${collection.slug}`);
  }

  return (
    <section className="container-shell py-16">
      <div className="mb-10 rounded-[2rem] border border-[#eadfcf] bg-[linear-gradient(180deg,rgba(255,252,246,0.96),rgba(248,237,214,0.82))] p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[#a2845d]">{labels.collectionsEyebrow}</p>
        <h1 className="text-display mt-4 text-5xl text-[#171717]">{collection.name}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-black/58">{collection.description}</p>
      </div>
      {products.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-[#eadfcf] bg-white/72 p-8 text-black/58">
          No published products are currently assigned to this collection.
        </div>
      )}
    </section>
  );
}
