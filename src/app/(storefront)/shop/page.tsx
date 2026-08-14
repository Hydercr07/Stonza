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

  function buildShopHref(next: {
    category?: string;
    subcategory?: string;
    collection?: string;
    sort?: string;
    q?: string;
  }) {
    const query = new URLSearchParams();
    const values = {
      category: next.category ?? category,
      subcategory: next.subcategory ?? subcategory,
      collection: next.collection ?? collection,
      sort: next.sort ?? sort,
      q: next.q ?? search,
    };

    if (values.category) query.set("category", values.category);
    if (values.subcategory) query.set("subcategory", values.subcategory);
    if (values.collection) query.set("collection", values.collection);
    if (values.sort && values.sort !== "featured") query.set("sort", values.sort);
    if (values.q) query.set("q", values.q);

    return query.size ? `/shop?${query.toString()}` : "/shop";
  }

  return (
    <section className="section-noise container-shell py-16">
      <div className="rounded-[2.2rem] border border-[#e4d6c1] bg-[linear-gradient(135deg,rgba(255,251,243,0.96),rgba(247,234,205,0.88))] p-8 shadow-[0_22px_52px_rgba(26,20,12,0.08)] md:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.34em] text-[#a2845d]">{labels.shopEyebrow}</p>
            <h1 className="text-display text-5xl text-[#171717] sm:text-6xl">{labels.shopHeading}</h1>
            <p className="max-w-2xl text-sm leading-7 text-black/58">{labels.shopBody}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Results", value: products.length.toString().padStart(2, "0") },
              { label: "Categories", value: parentCategories.length.toString().padStart(2, "0") },
              { label: "Filter", value: category || subcategory || collection ? "Active" : "All" },
            ].map((item) => (
              <div key={item.label} className="angled-panel rounded-[1.5rem] border border-[#eadfcf] bg-white/78 p-5">
                <p className="text-[11px] uppercase tracking-[0.26em] text-black/42">{item.label}</p>
                <p className="text-display mt-2 text-4xl text-[#10233a]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form className="my-8 grid gap-4 rounded-[1.7rem] border border-[#eadfcf] bg-white/78 p-5 lg:grid-cols-[1.15fr_0.85fr_0.85fr_0.85fr_0.8fr]">
        <input
          name="q"
          defaultValue={search ?? ""}
          placeholder="Search products"
          className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3 text-sm"
        />
        <select
          name="category"
          defaultValue={category ?? ""}
          className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3 text-sm"
        >
          <option value="">All categories</option>
          {parentCategories.map((entry) => (
            <option key={entry.id} value={entry.slug}>
              {entry.name}
            </option>
          ))}
        </select>
        <select
          name="subcategory"
          defaultValue={subcategory ?? ""}
          className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3 text-sm"
        >
          <option value="">All subcategories</option>
          {subcategoryOptions.map((entry) => (
            <option key={entry.id} value={entry.slug}>
              {entry.name}
            </option>
          ))}
        </select>
        <select
          name="collection"
          defaultValue={collection ?? ""}
          className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3 text-sm"
        >
          <option value="">All collections</option>
          {visibleCollections.map((entry) => (
            <option key={entry.id} value={entry.slug}>
              {entry.name}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3 text-sm"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name-asc">Name: A-Z</option>
          <option value="name-desc">Name: Z-A</option>
        </select>
        <div className="flex flex-wrap gap-3 lg:col-span-5">
          <button type="submit" className="rounded-full bg-[#10233a] px-5 py-3 text-sm font-medium text-white">
            Apply filters
          </button>
          <Link href="/shop" className="rounded-full border border-[#d8ccb9] bg-white px-5 py-3 text-sm text-[#171717]">
            Clear filters
          </Link>
        </div>
      </form>

      <div className="my-8 flex flex-wrap gap-3">
        <Link
          href={buildShopHref({ category: "", subcategory: "", collection })}
          className={`rounded-full border px-4 py-2 text-sm ${!category ? "border-[#10233a] bg-[#10233a] text-white" : "border-black/10 bg-white/72 text-black/58"}`}
        >
          All categories
        </Link>
        {parentCategories.map((entry) => (
          <Link
            key={entry.id}
            href={buildShopHref({ category: entry.slug, subcategory: "", collection })}
            className={`rounded-full border px-4 py-2 text-sm ${
              category === entry.slug ? "border-[#10233a] bg-[#10233a] text-white" : "border-black/10 bg-white/72 text-black/58"
            }`}
          >
            {entry.name}
          </Link>
        ))}
      </div>

      {subcategoryOptions.length ? (
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href={buildShopHref({ subcategory: "" })}
            className={`rounded-full border px-4 py-2 text-sm ${!subcategory ? "border-[#10233a] bg-[#10233a] text-white" : "border-black/10 bg-white/72 text-black/58"}`}
          >
            All subcategories
          </Link>
          {subcategoryOptions.map((entry) => (
            <Link
              key={entry.id}
              href={buildShopHref({ subcategory: entry.slug })}
              className={`rounded-full border px-4 py-2 text-sm ${
                subcategory === entry.slug ? "border-[#10233a] bg-[#10233a] text-white" : "border-black/10 bg-white/72 text-black/58"
              }`}
            >
              {entry.name}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mb-8 flex flex-col gap-3 rounded-[1.7rem] border border-[#eadfcf] bg-white/72 p-5 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-black/58">
          {products.length} product{products.length === 1 ? "" : "s"}{" "}
          {subcategory
            ? `in ${categories.find((entry) => entry.slug === subcategory)?.name ?? "selected subcategory"}`
            : category
              ? `in ${categories.find((entry) => entry.slug === category)?.name ?? "selected category"}`
              : "across all visible categories"}
          .
        </p>
        <p className="text-xs uppercase tracking-[0.24em] text-black/42">
          Natural stones / PKR pricing / concierge support
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
