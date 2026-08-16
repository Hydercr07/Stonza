import Link from "next/link";
import { ProductCard } from "@/components/storefront/cards";
import { getEffectivePrice } from "@/lib/commerce";
import { getLabelMap, listAdminCollections, listCategories, listProducts } from "@/lib/data/store";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const subcategory = typeof params.subcategory === "string" ? params.subcategory : undefined;
  const collection = typeof params.collection === "string" ? params.collection : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "featured";
  const [labels, categories, collections, rawProducts] = await Promise.all([
    getLabelMap(),
    listCategories(),
    listAdminCollections(),
    listProducts({
      search,
      categorySlug: category,
      subcategorySlug: subcategory,
      collectionSlug: collection,
    }),
  ]);

  const parentCategories = categories.filter((entry) => !entry.parentCategorySlug);
  const subcategoryOptions = categories.filter((entry) => entry.parentCategorySlug === category);
  const visibleCollections = collections.filter((entry) => entry.active);
  const products = [...rawProducts].sort((left, right) => {
    if (sort === "price-asc") return getEffectivePrice(left) - getEffectivePrice(right);
    if (sort === "price-desc") return getEffectivePrice(right) - getEffectivePrice(left);
    if (sort === "name-asc") return left.name.localeCompare(right.name);
    if (sort === "name-desc") return right.name.localeCompare(left.name);
    return Number(right.featured) - Number(left.featured);
  });

  return (
    <section className="section-noise bg-white">
      {/* Header Section */}
      <div className="border-b border-[#e8dfd1] bg-[rgba(255,250,242,0.94)] py-12 md:py-16">
        <div className="container-shell">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.34em] text-[#a2845d]">{labels.shopEyebrow}</p>
            <h1 className="text-5xl font-serif text-[#171717] sm:text-6xl">{labels.shopHeading}</h1>
            <p className="max-w-3xl text-sm leading-7 text-black/60">{labels.shopBody}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container-shell py-8 md:py-12 lg:flex lg:gap-12">
        {/* Sidebar */}
        <aside className="mb-8 lg:mb-0 lg:w-64 lg:flex-shrink-0">
          <form className="space-y-6 rounded-[1.75rem] border border-[#e8dfd1] bg-[#fcfaf6] p-5 lg:sticky lg:top-28">
            {/* Search */}
            <div>
              <label htmlFor="search" className="mb-3 block text-xs font-semibold uppercase tracking-[0.26em] text-[#171717]">
                Search
              </label>
              <input
                id="search"
                name="q"
                defaultValue={search ?? ""}
                placeholder="Find stones..."
                className="w-full rounded-lg border border-[#d8ccb9] bg-white px-4 py-3 text-sm placeholder:text-black/30 focus:border-[#10233a] focus:outline-none"
              />
            </div>

            {/* Categories */}
            <div>
              <label htmlFor="category" className="mb-3 block text-xs font-semibold uppercase tracking-[0.26em] text-[#171717]">
                Category
              </label>
              <select
                id="category"
                name="category"
                defaultValue={category ?? ""}
                className="w-full rounded-lg border border-[#d8ccb9] bg-white px-4 py-3 text-sm focus:border-[#10233a] focus:outline-none"
              >
                <option value="">All Categories</option>
                {parentCategories.map((entry) => (
                  <option key={entry.id} value={entry.slug}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategories */}
            {subcategoryOptions.length > 0 && (
              <div>
                <label htmlFor="subcategory" className="mb-3 block text-xs font-semibold uppercase tracking-[0.26em] text-[#171717]">
                  Type
                </label>
                <select
                  id="subcategory"
                  name="subcategory"
                  defaultValue={subcategory ?? ""}
                  className="w-full rounded-lg border border-[#d8ccb9] bg-white px-4 py-3 text-sm focus:border-[#10233a] focus:outline-none"
                >
                  <option value="">All Types</option>
                  {subcategoryOptions.map((entry) => (
                    <option key={entry.id} value={entry.slug}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Collections */}
            {visibleCollections.length > 0 && (
              <div>
                <label htmlFor="collection" className="mb-3 block text-xs font-semibold uppercase tracking-[0.26em] text-[#171717]">
                  Collection
                </label>
                <select
                  id="collection"
                  name="collection"
                  defaultValue={collection ?? ""}
                  className="w-full rounded-lg border border-[#d8ccb9] bg-white px-4 py-3 text-sm focus:border-[#10233a] focus:outline-none"
                >
                  <option value="">All Collections</option>
                  {visibleCollections.map((entry) => (
                    <option key={entry.id} value={entry.slug}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort */}
            <div>
              <label htmlFor="sort" className="mb-3 block text-xs font-semibold uppercase tracking-[0.26em] text-[#171717]">
                Sort By
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={sort}
                className="w-full rounded-lg border border-[#d8ccb9] bg-white px-4 py-3 text-sm focus:border-[#10233a] focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-1">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-[#10233a] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0d1929]"
              >
                Apply
              </button>
              <Link
                href="/shop"
                className="flex-1 rounded-lg border border-[#d8ccb9] bg-white px-4 py-3 text-center text-sm text-[#171717] transition-colors hover:bg-[#f9f6f1]"
              >
                Reset
              </Link>
            </div>
          </form>
        </aside>

        {/* Products */}
        <div className="flex-1">
          {products.length ? (
            <>
              <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-black/60">
                  {products.length} stone{products.length === 1 ? "" : "s"}
                </p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-black/38">
                  Curated with the same editorial layout across devices
                </p>
              </div>
              <div className="shop-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-[#e8dfd1] bg-[#f9f6f1] p-12 text-center">
              <p className="text-black/60">{labels.shopEmpty}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
