import Image from "next/image";
import Link from "next/link";
import {
  BadgePercent,
  CreditCard,
  MapPinned,
  Truck,
} from "lucide-react";
import { ProductCard } from "@/components/storefront/cards";
import { Button } from "@/components/shared/ui/button";
import {
  getHeroSettings,
  listCategories,
  listCollections,
  listProducts,
} from "@/lib/data/store";

const partnerLogos = ["logoipsum", "logoipsum", "logoipsum", "logoipsum"];

export default async function HomePage() {
  const [hero, categories, collections, featuredProducts, newProducts] = await Promise.all([
    getHeroSettings(),
    listCategories({ featuredOnly: true }),
    listCollections(true),
    listProducts({ featuredOnly: true }),
    listProducts({ newOnly: true }),
  ]);

  const heroImage = hero.desktopBannerImage || featuredProducts[0]?.featuredImage || "/placeholders/hero-strata.svg";
  const primaryCollection = collections[0];
  const editorialProduct = featuredProducts[0] ?? newProducts[0];
  const editorialCategory = categories[0];
  const trendingProducts = featuredProducts.slice(0, 4);
  const bestSellingProducts = [...featuredProducts].reverse().slice(0, 4);

  return (
    <>
      <section className="border-b border-[#ece2d5] bg-[#fffdfa]">
        <div className="container-shell grid min-h-[min(82vh,780px)] items-center gap-10 py-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="order-2 max-w-xl space-y-6 lg:order-1">
            <p className="text-xs uppercase tracking-[0.22em] text-black/55">New collection</p>
            <h1 className="text-display text-[clamp(3.2rem,8vw,6.2rem)] leading-[0.92] text-[#171717]">
              {hero.heading}
            </h1>
            <p className="max-w-lg text-base leading-8 text-black/58">
              {hero.description}
            </p>
            <Button asChild variant="outline" size="lg" className="rounded-none px-8">
              <Link href={hero.primaryCtaUrl || "/shop"}>{hero.primaryCtaLabel || "Shop now"}</Link>
            </Button>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden bg-[#efe3cf]">
              <div className="relative min-h-[28rem] md:min-h-[38rem]">
                <Image
                  src={heroImage}
                  alt={hero.heading}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-10 md:py-14">
        <div className="grid gap-5 md:grid-cols-4">
          {partnerLogos.map((logo, index) => (
            <div key={`${logo}-${index}`} className="flex min-h-28 items-center justify-center border border-[#ece2d5] bg-white px-6">
              <p className="text-3xl font-semibold tracking-tight text-black/82">{logo}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shell py-14 md:py-18">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-black/55">Popular Products</p>
          <h2 className="text-display mt-4 text-5xl text-[#171717] md:text-6xl">Trending Now</h2>
          <div className="mx-auto mt-5 h-px w-14 bg-[#b88f5b]" />
        </div>
        <div className="shop-grid">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="container-shell py-14 md:py-18">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-black/55">Shop</p>
          <h2 className="text-display mt-4 text-5xl text-[#171717] md:text-6xl">Best Selling</h2>
          <div className="mx-auto mt-5 h-px w-14 bg-[#b88f5b]" />
        </div>
        <div className="shop-grid">
          {bestSellingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="container-shell py-18 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="max-w-sm space-y-5">
            <p className="text-xs uppercase tracking-[0.22em] text-black/55">
              {editorialCategory?.name ?? "Unique pieces"}
            </p>
            <h2 className="text-display text-[clamp(3rem,7vw,5.3rem)] leading-[0.92] text-[#171717]">
              Be Always On Trend
            </h2>
            <p className="text-base leading-8 text-black/58">
              Discover pieces selected for sculptural form, rich materiality and quiet elegance. Designed to feel timeless, modern and collectible.
            </p>
            <Button asChild variant="outline" size="lg" className="rounded-none px-8">
              <Link href="/shop">Shop now</Link>
            </Button>
          </div>
          <div className="relative min-h-[32rem] lg:min-h-[44rem]">
            <div className="absolute right-0 top-0 h-[78%] w-[72%] overflow-hidden bg-[#c67d32]">
              <Image
                src={primaryCollection?.featuredImage || heroImage}
                alt={primaryCollection?.name || "Collection highlight"}
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-8 left-0 h-[58%] w-[44%] overflow-hidden border-[10px] border-[#fffdfa] bg-white shadow-[0_20px_50px_rgba(24,18,12,0.08)]">
              <Image
                src={editorialProduct?.featuredImage || heroImage}
                alt={editorialProduct?.name || "Featured stone"}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-18 md:py-22">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-black/55">Best in business</p>
          <h2 className="text-display mt-4 text-5xl text-[#171717] md:text-6xl">Why Choose Us</h2>
          <p className="mt-6 text-lg leading-9 text-black/58">
            Carefully curated natural stones, elegant presentation and an online experience designed to feel refined, trustworthy and effortless.
          </p>
          <div className="mx-auto mt-6 h-px w-14 bg-[#b88f5b]" />
        </div>
        <div className="mt-14 grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: BadgePercent,
              title: "Big Discounts",
              body: "Seasonal offers on selected featured stones and curated capsule collections.",
            },
            {
              icon: Truck,
              title: "Free Shipping",
              body: "Protected shipping support and white-glove handling for qualifying orders.",
            },
            {
              icon: CreditCard,
              title: "Secure Payments",
              body: "Clear checkout flow, concierge support and reliable payment assurance.",
            },
            {
              icon: MapPinned,
              title: "Order Tracking",
              body: "Stay informed from confirmation to delivery with guided support throughout.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="space-y-5">
                <Icon className="h-11 w-11 text-black/75" strokeWidth={1.4} />
                <h3 className="text-display text-3xl text-[#171717]">{item.title}</h3>
                <p className="text-sm leading-8 text-black/56">{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
