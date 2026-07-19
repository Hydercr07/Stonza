import Link from "next/link";
import { CollectionCard, ProductCard } from "@/components/storefront/cards";
import { Button } from "@/components/shared/ui/button";
import type { Collection, HomepageSection, Product } from "@/types/domain";

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
        <p className="text-xs uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
        <h2 className="text-display text-4xl text-white md:text-5xl">{title}</h2>
        <p className="text-sm leading-7 text-white/62 md:text-base">{body}</p>
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
      <SectionHeading eyebrow="Collections" title={section.heading} body={section.body} ctaLabel={section.ctaLabel} ctaHref={section.ctaUrl} />
      <div className="grid gap-6 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
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
      <SectionHeading eyebrow={eyebrow} title={section.heading} body={section.body} ctaLabel={section.ctaLabel} ctaHref={section.ctaUrl} />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function StorySection({ section }: { section: HomepageSection }) {
  return (
    <section className="container-shell grid gap-8 py-18 lg:grid-cols-[0.9fr_1.1fr]">
      <div
        className="min-h-[22rem] rounded-[2rem] border border-white/10 bg-cover bg-center"
        style={{ backgroundImage: "url('/placeholders/story-mineral.svg')" }}
      />
      <div className="stone-panel rounded-[2rem] p-8 md:p-12">
        <p className="mb-4 text-xs uppercase tracking-[0.28em] text-accent">Brand Story</p>
        <h2 className="text-display text-4xl text-white md:text-5xl">{section.heading}</h2>
        <p className="mt-6 max-w-2xl text-base leading-8 text-white/66">{section.body}</p>
        {section.ctaLabel && section.ctaUrl ? (
          <Button asChild variant="outline" className="mt-8">
            <Link href={section.ctaUrl}>{section.ctaLabel}</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
