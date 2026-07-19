import { notFound } from "next/navigation";
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

  return (
    <section className="container-shell py-16">
      <div className="mb-10 max-w-2xl space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">{labels.collectionsEyebrow}</p>
        <h1 className="text-display text-5xl text-white">{collection.name}</h1>
        <p className="text-sm leading-7 text-white/62">{collection.description}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
