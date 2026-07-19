import { ProductCard } from "@/components/storefront/cards";
import { listProducts } from "@/lib/data/store";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : undefined;
  const products = await listProducts({ search });

  return (
    <section className="container-shell py-16">
      <div className="mb-10 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Shop</p>
        <h1 className="text-display text-5xl text-white">Curated stones</h1>
        <p className="max-w-2xl text-sm leading-7 text-white/62">Search, filter and discover original stones selected for provenance, atmosphere and collector value.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
