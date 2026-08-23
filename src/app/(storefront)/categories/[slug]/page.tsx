import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ProductCard } from "@/components/storefront/cards";
import { getCategoryBySlug, listCategories, listProducts } from "@/lib/data/store";
import { isRemoteAsset } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const title = category.seoTitle || category.name;
  const description = category.seoDescription || category.shortDescription || undefined;
  const image = category.openGraphImage || category.featuredImage || undefined;

  return {
    title,
    description,
    openGraph: { title, description, images: image ? [image] : undefined },
    twitter: { title, description, images: image ? [image] : undefined },
  };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, categories] = await Promise.all([getCategoryBySlug(slug), listCategories()]);

  if (!category) {
    notFound();
  }
  if (category.slug !== slug && category.slugHistory?.includes(slug)) {
    permanentRedirect(`/categories/${category.slug}`);
  }

  const products = await listProducts(
    category.parentCategorySlug
      ? { categorySlug: category.parentCategorySlug, subcategorySlug: category.slug }
      : { categorySlug: slug },
  );
  const children = categories.filter((entry) => entry.parentCategorySlug === category.slug);

  return (
    <section className="container-shell page-section">
      <div className="rounded-[2rem] border border-[#eadfcf] bg-[linear-gradient(180deg,rgba(255,252,246,0.96),rgba(248,237,214,0.82))] p-5 sm:p-8 shadow-[0_18px_44px_rgba(26,20,12,0.06)]">
        {category.heroImage ? (
          <div className="relative mb-8 aspect-[4/3] overflow-hidden rounded-[1.6rem] border border-[#eadfcf] bg-[#f3ebdc] sm:aspect-[16/7]">
            <Image
              src={category.heroImage}
              alt={category.altText}
              fill
              priority
              loading="eager"
              fetchPriority="high"
              className="object-cover"
              sizes="(max-width: 1024px) 92vw, 1200px"
              unoptimized={isRemoteAsset(category.heroImage)}
            />
          </div>
        ) : null}
        <p className="text-xs uppercase tracking-[0.3em] text-[#a2845d]">Category</p>
        <h1 className="page-title mt-4 text-[#171717]">{category.name}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-black/58">{category.description}</p>
        {children.length ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="rounded-full border border-[#d8ccb9] bg-white px-4 py-2 text-sm text-[#171717]"
              >
                {child.name}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-10">
        {products.length ? (
          <div className="shop-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} priorityImage />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-[#eadfcf] bg-white/72 p-8 text-black/58">
            No published products are currently assigned to this category.
          </div>
        )}
      </div>
    </section>
  );
}
