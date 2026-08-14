import Link from "next/link";
import { CategoryCard, CollectionCard, ProductCard } from "@/components/storefront/cards";
import { Button } from "@/components/shared/ui/button";
import type { Category, Collection, HomepageSection, Product } from "@/types/domain";

export function SectionHeading({
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-[#a2845d]">{eyebrow}</p>
        <h2 className="text-display text-4xl text-[#171717] md:text-5xl">{title}</h2>
        <p className="text-sm leading-7 text-black/58 md:text-base">{body}</p>
      </div>
      {ctaLabel && ctaHref ? (
        <Button asChild variant="outline">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}

export function FeaturedCollectionsSection({
  section,
  collections,
}: {
  section: HomepageSection;
  collections: Collection[];
}) {
  return (
    <section className="container-shell py-18">
      <SectionHeading eyebrow={section.eyebrow ?? "Collections"} title={section.heading} body={section.body} ctaLabel={section.ctaLabel} ctaHref={section.ctaUrl} />
      <div className="grid gap-6 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </section>
  );
}

export function FeaturedCategoriesSection({
  section,
  categories,
}: {
  section: HomepageSection;
  categories: Category[];
}) {
  return (
    <section className="container-shell py-18">
      <SectionHeading eyebrow={section.eyebrow ?? "Categories"} title={section.heading} body={section.body} ctaLabel={section.ctaLabel} ctaHref={section.ctaUrl} />
      <div className="grid gap-6 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}

export function FeaturedProductsSection({
  eyebrow,
  section,
  products,
}: {
  eyebrow: string;
  section: HomepageSection;
  products: Product[];
}) {
  return (
    <section className="container-shell py-18">
      <SectionHeading eyebrow={section.eyebrow ?? eyebrow} title={section.heading} body={section.body} ctaLabel={section.ctaLabel} ctaHref={section.ctaUrl} />
      <div className="shop-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function StorySection({ section }: { section: HomepageSection }) {
  return (
    <section className="container-shell py-18">
      <div className="stone-panel min-h-[22rem] rounded-[2rem] p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.28em] text-[#a2845d]">{section.eyebrow ?? "Editorial"}</p>
        <h2 className="text-display mt-4 text-4xl text-[#171717] md:text-5xl">{section.heading}</h2>
        <p className="mt-6 max-w-2xl text-base leading-8 text-black/62">{section.body}</p>
        {section.ctaLabel && section.ctaUrl ? (
          <Button asChild variant="outline" className="mt-8">
            <Link href={section.ctaUrl}>{section.ctaLabel}</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
