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
      <div className="rounded-[2rem] border border-black/8 bg-[rgba(255,253,249,0.88)] p-8 shadow-[0_18px_44px_rgba(26,20,12,0.06)] md:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#a2845d]">{labels.shopEyebrow}</p>
            <h1 className="text-display text-5xl text-[#171717]">{labels.shopHeading}</h1>
            <p className="max-w-2xl text-sm leading-7 text-black/58">{labels.shopBody}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Results", value: products.length.toString().padStart(2, "0") },
              { label: "Categories", value: categories.length.toString().padStart(2, "0") },
              { label: "Filter", value: category ? "Active" : "All" },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-black/8 bg-white/72 p-5">
                <p className="text-[11px] uppercase tracking-[0.26em] text-black/42">{item.label}</p>
                <p className="text-display mt-2 text-4xl text-[#171717]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="my-8 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className={`rounded-full border px-4 py-2 text-sm ${!category ? "border-[#b79a72] bg-[#b79a72]/12 text-[#171717]" : "border-black/10 bg-white/72 text-black/58"}`}
        >
          All categories
        </Link>
        {categories.map((entry) => (
          <Link
            key={entry.id}
            href={`/shop?category=${entry.slug}`}
            className={`rounded-full border px-4 py-2 text-sm ${
              category === entry.slug ? "border-[#b79a72] bg-[#b79a72]/12 text-[#171717]" : "border-black/10 bg-white/72 text-black/58"
            }`}
          >
            {entry.name}
          </Link>
        ))}
      </div>
      <div className="mb-8 flex flex-col gap-3 rounded-[1.5rem] border border-black/8 bg-white/72 p-5 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-black/58">
          {products.length} product{products.length === 1 ? "" : "s"}{" "}
          {category
            ? `in ${categories.find((entry) => entry.slug === category)?.name ?? "selected category"}`
            : "across all visible categories"}
          .
        </p>
        <p className="text-xs uppercase tracking-[0.24em] text-black/42">
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
        <div className="rounded-[1.75rem] border border-black/8 bg-white/72 p-8 text-black/58">
          {labels.shopEmpty}
        </div>
      )}
    </section>
  );
}
