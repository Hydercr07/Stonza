import Link from "next/link";
import { Hero } from "@/components/storefront/hero";
import {
  FeaturedCategoriesSection,
  FeaturedCollectionsSection,
  FeaturedProductsSection,
  StorySection,
} from "@/components/storefront/sections";
import { Button } from "@/components/shared/ui/button";
import {
  getHeroSettings,
  getHomepageSections,
  getLabelMap,
  listCategories,
  listCollections,
  listJournalPosts,
  listProducts,
} from "@/lib/data/store";

export default async function HomePage() {
  const [hero, sections, labels, featuredCategories, featuredCollections, featuredProducts, newProducts] = await Promise.all([
    getHeroSettings(),
    getHomepageSections(),
    getLabelMap(),
    listCategories({ featuredOnly: true }),
    listCollections(true),
    listProducts({ featuredOnly: true }),
    listProducts({ newOnly: true }),
  ]);

  const categorySection = sections.find((section) => section.key === "featured-categories");
  const collectionSection = sections.find((section) => section.key === "featured-collections");
  const signatureSection = sections.find((section) => section.key === "signature-stones");
  const storySection = sections.find((section) => section.key === "born-beneath-earth");
  const authenticitySection = sections.find((section) => section.key === "authenticity");
  const journalPosts = await listJournalPosts();

  return (
    <>
      <Hero hero={hero} />
      <section className="container-shell py-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: "New this week", body: "Fresh collector-grade additions with ready-to-view product pages.", href: "/shop" },
            { title: "By collection", body: "Shop themed edits like gallery walls, desk pieces and statement forms.", href: "/collections" },
            { title: "Authenticity", body: "Understand origin, treatment and certification before purchase.", href: "/authenticity" },
            { title: "Private sourcing", body: "Need something specific for a client or interior project? Start a brief.", href: "/contact" },
          ].map((item) => (
            <Link key={item.title} href={item.href} className="stone-panel rounded-[1.75rem] p-6 hover:border-white/20">
              <p className="text-xs uppercase tracking-[0.26em] text-accent">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-white/64">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>
      {categorySection ? <FeaturedCategoriesSection section={categorySection} categories={featuredCategories.slice(0, 3)} /> : null}
      {collectionSection ? <FeaturedCollectionsSection section={collectionSection} collections={featuredCollections} /> : null}
      {signatureSection ? <FeaturedProductsSection eyebrow="Featured Stones" section={signatureSection} products={featuredProducts.slice(0, 3)} /> : null}
      <section className="container-shell py-10">
        <div className="grid gap-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-8 md:grid-cols-[0.95fr_1.05fr] md:p-10">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Shop by confidence</p>
            <h2 className="text-display text-4xl text-white md:text-5xl">The rhythm of a modern luxury store, tailored for natural stone.</h2>
            <p className="max-w-xl text-sm leading-7 text-white/62">
              Every product page is structured to feel closer to a strong Shopify storefront: clear pricing, availability, provenance, imagery and next-step buying paths.
            </p>
            <Button asChild variant="outline">
              <Link href="/shop">Browse all stones</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { value: featuredProducts.length, label: "featured listings" },
              { value: featuredCollections.length, label: "curated collections" },
              { value: newProducts.length, label: "new arrivals live" },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-black/18 p-5 text-center">
                <p className="text-display text-5xl text-white">{item.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/48">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {storySection ? <StorySection section={storySection} /> : null}
      {authenticitySection ? <FeaturedProductsSection eyebrow="New Arrivals" section={authenticitySection} products={newProducts.slice(0, 3)} /> : null}
      <section className="container-shell py-18">
        <div className="stone-panel rounded-[2rem] p-8 md:p-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-accent">{labels.homepageJournalEyebrow}</p>
              <h2 className="text-display mt-3 text-4xl text-white md:text-5xl">Editorial guidance around every release.</h2>
            </div>
            <Link href="/journal" className="text-sm text-white/62 hover:text-white">
              Explore the journal
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {journalPosts.map((post) => (
              <Link key={post.id} href={`/journal/${post.slug}`} className="rounded-[1.5rem] border border-white/10 bg-white/3 p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-white/42">{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                <h3 className="text-display mt-3 text-3xl text-white">{post.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
