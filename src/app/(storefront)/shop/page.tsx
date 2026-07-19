import Link from "next/link";
import { ProductCard } from "@/components/storefront/cards";
import { getLabelMap, listCategories, listProducts } from "@/lib/data/store";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const [labels, categories, products] = await Promise.all([
    getLabelMap(),
    listCategories(),
    listProducts({ search, categorySlug: category }),
  ]);

  return (
    <section className="container-shell py-16">
      <div className="mb-10 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">{labels.shopEyebrow}</p>
        <h1 className="text-display text-5xl text-white">{labels.shopHeading}</h1>
        <p className="max-w-2xl text-sm leading-7 text-white/62">{labels.shopBody}</p>
      </div>
      <div className="mb-8 flex flex-wrap gap-3">
        <Link href="/shop" className={`rounded-full border px-4 py-2 text-sm ${!category ? "border-[#d5c7a9] text-white" : "border-white/10 text-white/60"}`}>
          All categories
        </Link>
        {categories.map((entry) => (
          <Link
            key={entry.id}
            href={`/shop?category=${entry.slug}`}
            className={`rounded-full border px-4 py-2 text-sm ${
              category === entry.slug ? "border-[#d5c7a9] text-white" : "border-white/10 text-white/60"
            }`}
          >
            {entry.name}
          </Link>
        ))}
      </div>
      {products.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-8 text-white/58">
          {labels.shopEmpty}
        </div>
      )}
    </section>
  );
}
