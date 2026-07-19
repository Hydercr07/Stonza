import Link from "next/link";
import { listCategories, listProducts } from "@/lib/data/store";
import { Button } from "@/components/shared/ui/button";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : undefined;
  const status = typeof params.status === "string" ? params.status : "all";
  const featuredOnly = typeof params.featured === "string" ? params.featured === "true" : false;

  const [categories, products] = await Promise.all([
    listCategories({ admin: true, search }),
    listProducts(),
  ]);

  const filtered = categories.filter((category) => {
    if (status !== "all" && category.status !== status) return false;
    if (featuredOnly && !category.featured) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Admin</p>
          <h1 className="text-display mt-3 text-5xl">Categories</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
            Manage the stone families that appear across product forms, homepage selections and public storefront filtering.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">New category</Link>
        </Button>
      </div>

      <form className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-[#111213] p-5 md:grid-cols-[1fr_180px_180px]">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search categories"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
        />
        <select name="status" defaultValue={status} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
          <option value="trash">Trash</option>
        </select>
        <select name="featured" defaultValue={featuredOnly ? "true" : "false"} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <option value="false">All visibility</option>
          <option value="true">Featured only</option>
        </select>
      </form>

      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111213]">
        <div className="grid grid-cols-[1.6fr_0.9fr_0.6fr_0.6fr] gap-4 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.24em] text-white/40">
          <span>Category</span>
          <span>Status</span>
          <span>Products</span>
          <span className="text-right">Action</span>
        </div>
        {filtered.length ? (
          filtered.map((category) => {
            const productCount = products.filter(
              (product) =>
                product.categorySlug === category.slug ||
                product.categorySlugs?.includes(category.slug),
            ).length;

            return (
              <div
                key={category.id}
                className="grid grid-cols-[1.6fr_0.9fr_0.6fr_0.6fr] gap-4 border-t border-white/8 px-6 py-5 text-sm"
              >
                <div>
                  <p className="font-medium text-white">{category.name}</p>
                  <p className="mt-1 line-clamp-2 text-white/55">{category.shortDescription}</p>
                </div>
                <div className="text-white/66">{category.status}</div>
                <div className="text-white/66">{productCount}</div>
                <div className="text-right">
                  <Link href={`/admin/categories/${category.id}`} className="text-accent hover:text-white">
                    Open
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-6 py-12 text-sm text-white/50">No categories matched the current filters.</div>
        )}
      </div>
    </div>
  );
}
