import { Hero } from "@/components/storefront/hero";
import {
  FeaturedCollectionsSection,
  FeaturedProductsSection,
  StorySection,
} from "@/components/storefront/sections";
import { getHeroSettings, getHomepageSections, listCollections, listJournalPosts, listProducts } from "@/lib/data/store";

export default async function HomePage() {
  const [hero, sections, featuredCollections, featuredProducts, newProducts] = await Promise.all([
    getHeroSettings(),
    getHomepageSections(),
    listCollections(true),
    listProducts({ featuredOnly: true }),
    listProducts({ newOnly: true }),
  ]);

  const collectionSection = sections.find((section) => section.key === "featured-collections");
  const signatureSection = sections.find((section) => section.key === "signature-stones");
  const storySection = sections.find((section) => section.key === "born-beneath-earth");
  const authenticitySection = sections.find((section) => section.key === "authenticity");
  const journalPosts = await listJournalPosts();

  return (
    <>
      <Hero hero={hero} />
      {collectionSection ? <FeaturedCollectionsSection section={collectionSection} collections={featuredCollections} /> : null}
      {signatureSection ? <FeaturedProductsSection eyebrow="Featured Stones" section={signatureSection} products={featuredProducts.slice(0, 3)} /> : null}
      {storySection ? <StorySection section={storySection} /> : null}
      {authenticitySection ? <FeaturedProductsSection eyebrow="New Arrivals" section={authenticitySection} products={newProducts.slice(0, 3)} /> : null}
      <section className="container-shell py-18">
        <div className="stone-panel rounded-[2rem] p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.28em] text-accent">Journal</p>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            {journalPosts.map((post) => (
              <a key={post.id} href={`/journal/${post.slug}`} className="rounded-[1.5rem] border border-white/10 p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-white/42">{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                <h3 className="text-display mt-3 text-3xl text-white">{post.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">{post.excerpt}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
