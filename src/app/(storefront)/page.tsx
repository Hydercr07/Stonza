import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CreditCard, Headphones, ShieldCheck, Truck } from "lucide-react";
import { ProductCard } from "@/components/storefront/cards";
import { Button } from "@/components/shared/ui/button";
import { getHeroSettings, listCategories, listCollections, listProducts } from "@/lib/data/store";

const featureItems = [
  {
    icon: Truck,
    title: "Protected Delivery",
    body: "White-glove regional dispatch with secure global shipping support.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Provenance",
    body: "Every stone is presented with clear material and origin detail.",
  },
  {
    icon: CreditCard,
    title: "Secure Checkout",
    body: "Straightforward payments paired with concierge assistance.",
  },
  {
    icon: Headphones,
    title: "Private Guidance",
    body: "Support for sourcing, styling and custom collection requests.",
  },
];

export default async function HomePage() {
  const [hero, categories, collections, featuredProducts, newProducts] = await Promise.all([
    getHeroSettings(),
    listCategories({ featuredOnly: true }),
    listCollections(true),
    listProducts({ featuredOnly: true }),
    listProducts({ newOnly: true }),
  ]);

  const heroImage = hero.desktopBannerImage || featuredProducts[0]?.featuredImage || "/placeholders/hero-strata.svg";
  const editorialProduct = featuredProducts[0] ?? newProducts[0];
  const supportingProduct = featuredProducts[1] ?? newProducts[1] ?? editorialProduct;
  const primaryCollection = collections[0];
  const categoryHighlights = categories.slice(0, 3);
  const featuredGrid = featuredProducts.slice(0, 4);
  const latestGrid = (newProducts.length ? newProducts : featuredProducts).slice(0, 4);

  return (
    <>
      <section className="border-b border-[#eadfcf] bg-[linear-gradient(180deg,#fffaf2_0%,#fff3de_100%)]">
        <div className="container-shell py-5 lg:py-0">
          <div className="overflow-hidden rounded-[2rem] border border-[#eadfcf] bg-[#fff8ec] shadow-[0_26px_70px_rgba(24,18,12,0.08)] lg:rounded-none lg:border-x-0 lg:border-y-0 lg:bg-transparent lg:shadow-none">
            <div className="grid lg:min-h-[640px] lg:grid-cols-[1.08fr_0.92fr]">
              <div className="relative min-h-[320px] bg-[#c68a20] sm:min-h-[420px] lg:min-h-full">
                <Image src={heroImage} alt={hero.heading} fill priority className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,14,10,0.04),rgba(17,14,10,0.24))]" />
                <div className="absolute left-4 top-1/2 hidden -translate-y-1/2 lg:flex">
                  <button
                    type="button"
                    aria-label="Previous highlight"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/84 text-[#171717] shadow-[0_10px_26px_rgba(20,16,10,0.16)]"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                  </button>
                </div>
              </div>

              <div className="relative flex flex-col justify-center bg-[#fff3d9] px-5 py-10 sm:px-8 sm:py-12 lg:px-14 lg:py-16">
                <div className="max-w-xl">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#8f733f]">Summer capsule</p>
                  <h1 className="mt-5 text-[clamp(2.8rem,7vw,5rem)] font-semibold leading-[0.92] text-[#13273b]">
                    {hero.heading}
                  </h1>
                  <p className="mt-4 text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-none text-[#d29716]">
                    Up to 80% Off
                  </p>
                  <p className="mt-6 max-w-lg text-sm leading-7 text-black/60 sm:text-base sm:leading-8">
                    {hero.description}
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg" className="rounded-full bg-[#d29716] px-8 text-[#171717] hover:bg-[#be8716]">
                      <Link href={hero.primaryCtaUrl || "/shop"}>
                        {hero.primaryCtaLabel || "Shop now"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full border-[#ceb995] bg-white/50 px-8">
                      <Link href={hero.secondaryCtaUrl || "/collections"}>{hero.secondaryCtaLabel || "Explore collections"}</Link>
                    </Button>
                  </div>
                </div>

                <div className="mt-10 grid gap-4 border-t border-[#e1d4bb] pt-6 sm:grid-cols-2 xl:grid-cols-4">
                  {featureItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="rounded-[1.5rem] bg-white/58 px-4 py-4 backdrop-blur-sm">
                        <Icon className="h-5 w-5 text-[#171717]" strokeWidth={1.75} />
                        <h2 className="mt-3 text-sm font-semibold text-[#171717]">{item.title}</h2>
                        <p className="mt-1 text-xs leading-6 text-black/56">{item.body}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="absolute bottom-8 right-6 hidden lg:flex">
                  <button
                    type="button"
                    aria-label="Next highlight"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f2b51d] text-[#171717] shadow-[0_10px_26px_rgba(20,16,10,0.16)]"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-12 md:py-16">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-black/52">Featured Category</p>
          <h2 className="text-display mt-4 text-4xl text-[#171717] sm:text-5xl">Stone Families</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-black/56 sm:text-base">
            Distinct material moods arranged for statement interiors, desk objects and collectible presentation.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categoryHighlights.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group relative block min-h-[280px] overflow-hidden rounded-[1.8rem] border border-[#eadfcf] bg-[#f0d58d] shadow-[0_20px_44px_rgba(23,18,12,0.05)] sm:min-h-[340px]"
            >
              <Image
                src={category.featuredImage}
                alt={category.altText}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,14,10,0.02),rgba(18,14,10,0.42))]" />
              <div className="absolute bottom-4 left-4 rounded-full bg-[#f2b51d] px-5 py-2 text-[11px] uppercase tracking-[0.22em] text-[#171717] shadow-sm">
                {category.name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-shell py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div className="max-w-md">
            <p className="text-xs uppercase tracking-[0.28em] text-black/52">
              {primaryCollection?.name ?? "Latest drop"}
            </p>
            <h2 className="text-display mt-4 text-[clamp(2.8rem,7vw,5rem)] leading-[0.94] text-[#171717]">
              Be Always On Trend
            </h2>
            <p className="mt-5 text-sm leading-7 text-black/58 sm:text-base sm:leading-8">
              Discover sculptural stones chosen for atmosphere, texture and refined presence across modern living spaces.
            </p>
            <Button asChild variant="outline" size="lg" className="mt-7 rounded-full border-[#cdbda7] px-8">
              <Link href="/shop">Shop now</Link>
            </Button>
          </div>

          <div className="relative min-h-[340px] sm:min-h-[420px] lg:min-h-[520px]">
            <div className="absolute right-0 top-0 h-[78%] w-[74%] overflow-hidden rounded-[2.2rem] bg-[#c57f26]">
              <Image
                src={primaryCollection?.featuredImage || heroImage}
                alt={primaryCollection?.name || "Collection highlight"}
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 h-[56%] w-[46%] overflow-hidden rounded-[1.8rem] border-[8px] border-[#fffaf2] bg-white shadow-[0_24px_60px_rgba(24,18,12,0.12)] sm:border-[10px]">
              <Image
                src={editorialProduct?.featuredImage || heroImage}
                alt={editorialProduct?.name || "Editorial stone"}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-14 md:py-18">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-black/52">Latest Product</p>
            <h2 className="text-display mt-4 text-4xl text-[#171717] sm:text-5xl">Popular Stones</h2>
          </div>
          <Button asChild variant="outline" className="w-fit rounded-full border-[#cdbda7] px-6">
            <Link href="/shop">View all</Link>
          </Button>
        </div>
        <div className="shop-grid">
          {featuredGrid.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="container-shell py-8 md:py-12">
        <div className="overflow-hidden rounded-[2.25rem] border border-[#eadfcf] bg-[linear-gradient(135deg,#10233a_0%,#183754_52%,#0f1d30_100%)] text-white shadow-[0_26px_70px_rgba(16,21,31,0.2)]">
          <div className="grid gap-8 px-6 py-8 sm:px-8 md:px-10 md:py-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-14 lg:py-14">
            <div className="max-w-md">
              <p className="text-xs uppercase tracking-[0.28em] text-white/58">Editorial pick</p>
              <h2 className="text-display mt-4 text-4xl leading-[0.95] text-white sm:text-5xl">
                Quiet luxury in mineral form
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/72 sm:text-base sm:leading-8">
                Balanced silhouettes, warm metallic undertones and deep natural textures curated for premium interiors.
              </p>
              <Button asChild size="lg" className="mt-7 rounded-full bg-[#f2b51d] px-8 text-[#171717] hover:bg-[#ddb11d]">
                <Link href={editorialProduct ? `/stones/${editorialProduct.slug}` : "/shop"}>
                  Explore feature
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[editorialProduct, supportingProduct].filter(Boolean).map((product, index) => (
                <div
                  key={`${product!.id}-${index}`}
                  className="relative min-h-[220px] overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/8"
                >
                  <Image src={product!.featuredImage} alt={product!.altText} fill className="object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,14,20,0.02),rgba(10,14,20,0.58))]" />
                  <div className="absolute inset-x-4 bottom-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/68">
                      {index === 0 ? "Editor choice" : "Collector note"}
                    </p>
                    <h3 className="mt-2 text-display text-2xl text-white">{product!.name}</h3>
                    <p className="mt-1 text-sm text-white/72">{product!.origin}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-14 md:py-18">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-black/52">New arrivals</p>
            <h2 className="text-display mt-4 text-4xl text-[#171717] sm:text-5xl">Latest Product</h2>
          </div>
          <Button asChild variant="outline" className="w-fit rounded-full border-[#cdbda7] px-6">
            <Link href="/collections">Browse collections</Link>
          </Button>
        </div>
        <div className="shop-grid">
          {latestGrid.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
