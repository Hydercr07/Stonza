import { Hero } from "@/components/storefront/hero";
import {
  FeaturedCategoriesSection,
  FeaturedCollectionsSection,
  FeaturedProductsSection,
  StorySection,
} from "@/components/storefront/sections";
import {
  getHeroSettings,
  getHomepageSections,
  listCategories,
  listCollections,
  listProducts,
} from "@/lib/data/store";

export default async function HomePage() {
  const [hero, sections, categories, collections, visibleProducts] = await Promise.all([
    getHeroSettings(),
    getHomepageSections(),
    listCategories({ featuredOnly: true }),
    listCollections(true),
    listProducts(),
  ]);
  const newArrivals = visibleProducts.filter((product) => product.newArrival).slice(0, 8);
  const bestsellingProducts = visibleProducts.filter((product) => product.bestseller).slice(0, 8);

  const sectionMap = Object.fromEntries(sections.map((section) => [section.key, section]));
  const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));
  const collectionsBySlug = new Map(collections.map((collection) => [collection.slug, collection]));
  const productsBySlug = new Map(visibleProducts.map((product) => [product.slug, product]));
  const featuredCategorySelection =
    sectionMap["featured-categories"]?.categorySlugs
      ?.map((slug) => categoriesBySlug.get(slug))
      .filter((category): category is NonNullable<typeof category> => Boolean(category)) ?? [];
  const featuredCollectionSelection =
    sectionMap["featured-collections"]?.collectionSlugs
      ?.map((slug) => collectionsBySlug.get(slug))
      .filter((collection): collection is NonNullable<typeof collection> => Boolean(collection)) ?? [];
  const featuredProductSelection =
    sectionMap["signature-stones"]?.productSlugs
      ?.map((slug) => productsBySlug.get(slug))
      .filter((product): product is NonNullable<typeof product> => Boolean(product)) ?? [];
  const newArrivalSection =
    sectionMap["new-arrivals"] ??
    ({
      id: "new-arrivals-fallback",
      key: "new-arrivals",
      enabled: true,
      order: 2,
      heading: "New Arrivals",
      eyebrow: "Just Landed",
      body: "Freshly published products surfaced in a denser, faster-to-scan rail inspired by fashion storefront merchandising.",
      layout: "product-rail",
      background: "ivory",
      ctaLabel: "View All",
      ctaUrl: "/shop?sort=newest",
    } satisfies typeof sections[number]);
  const bestsellingSection =
    sectionMap["best-sellers"] ??
    ({
      id: "best-sellers-fallback",
      key: "best-sellers",
      enabled: true,
      order: 3,
      heading: "Editor Favorites",
      eyebrow: "Best Sellers",
      body: "High-intent products highlighted with tighter cards, stronger pricing hierarchy and Quick Buy access.",
      layout: "product-rail",
      background: "white",
      ctaLabel: "View All",
      ctaUrl: "/shop",
    } satisfies typeof sections[number]);

  return (
    <>
      <Hero hero={hero} />

      {sectionMap["featured-categories"] && featuredCategorySelection.length ? (
        <FeaturedCategoriesSection section={sectionMap["featured-categories"]} categories={featuredCategorySelection} />
      ) : null}

      {sectionMap["featured-collections"] && featuredCollectionSelection.length ? (
        <FeaturedCollectionsSection
          section={sectionMap["featured-collections"]}
          collections={featuredCollectionSelection}
        />
      ) : null}

      {newArrivals.length ? (
        <FeaturedProductsSection eyebrow="New Arrivals" section={newArrivalSection} products={newArrivals} />
      ) : null}

      {sectionMap["signature-stones"] && featuredProductSelection.length ? (
        <FeaturedProductsSection
          eyebrow="Featured Products"
          section={sectionMap["signature-stones"]}
          products={featuredProductSelection}
        />
      ) : null}

      {bestsellingProducts.length ? (
        <FeaturedProductsSection eyebrow="Best Sellers" section={bestsellingSection} products={bestsellingProducts} />
      ) : null}

      {sectionMap["born-beneath-earth"] ? <StorySection section={sectionMap["born-beneath-earth"]} /> : null}
    </>
  );
}
