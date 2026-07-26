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
      <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-8 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">{labels.shopEyebrow}</p>
            <h1 className="text-display text-5xl text-white">{labels.shopHeading}</h1>
            <p className="max-w-2xl text-sm leading-7 text-white/62">{labels.shopBody}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Results", value: products.length.toString().padStart(2, "0") },
              { label: "Categories", value: categories.length.toString().padStart(2, "0") },
              { label: "Filter", value: category ? "Active" : "All" },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-black/15 p-5">
                <p className="text-[11px] uppercase tracking-[0.26em] text-white/45">{item.label}</p>
                <p className="text-display mt-2 text-4xl text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="my-8 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className={`rounded-full border px-4 py-2 text-sm ${!category ? "border-[#d5c7a9] bg-[#d5c7a9]/12 text-white" : "border-white/10 text-white/60"}`}
        >
          All categories
        </Link>
        {categories.map((entry) => (
          <Link
            key={entry.id}
            href={`/shop?category=${entry.slug}`}
            className={`rounded-full border px-4 py-2 text-sm ${
              category === entry.slug ? "border-[#d5c7a9] bg-[#d5c7a9]/12 text-white" : "border-white/10 text-white/60"
            }`}
          >
            {entry.name}
          </Link>
        ))}
      </div>
      <div className="mb-8 flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/3 p-5 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-white/62">
          {products.length} product{products.length === 1 ? "" : "s"}{" "}
          {category
            ? `in ${categories.find((entry) => entry.slug === category)?.name ?? "selected category"}`
            : "across all visible categories"}
          .
        </p>
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">
          Natural stones / clear pricing / concierge support
        </p>
      </div>
      {products.length ? (
        <div className="shop-grid">
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
