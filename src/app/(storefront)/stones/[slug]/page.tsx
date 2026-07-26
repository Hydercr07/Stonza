import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/shared/ui/button";
import { RichText } from "@/components/shared/rich-text";
import { getLabelMap, getProductBySlug, getSiteSettings, listProducts } from "@/lib/data/store";
import { formatMoney } from "@/lib/utils";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [labels, settings, relatedProducts] = await Promise.all([
    getLabelMap(),
    getSiteSettings(),
    listProducts(),
  ]);
  const related = relatedProducts.filter((item) => product.relatedProductSlugs.includes(item.slug));
  const unavailable = ["sold", "out_of_stock", "archived", "trash"].includes(product.status) || product.inventoryQuantity <= 0;
  const price = formatMoney(product.salePrice ?? product.price, product.currency);
  const compareAt = product.salePrice ? formatMoney(product.price, product.currency) : null;

  return (
    <section className="container-shell py-14">
      <div className="mb-8 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-white/42">
        <Link href="/shop" className="hover:text-white">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-white">{product.stoneType}</Link>
        <span>/</span>
        <span className="text-white/65">{product.name}</span>
      </div>
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4">
          <div className="relative min-h-[34rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[#141515]">
            <Image src={product.featuredImage} alt={product.altText} fill className="object-cover" />
            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
              {product.oneOfOne ? <span className="rounded-full bg-black/68 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/78">One of one</span> : null}
              {product.newArrival ? <span className="rounded-full bg-black/68 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/78">New arrival</span> : null}
              {product.bestseller ? <span className="rounded-full bg-black/68 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/78">Best seller</span> : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {product.galleryImages.map((image) => (
              <div key={image} className="relative min-h-56 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#141515]">
                <Image src={image} alt={product.altText} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-7">
            <p className="text-xs uppercase tracking-[0.28em] text-accent">{product.stoneType}</p>
            <h1 className="text-display mt-3 text-5xl text-white">{product.name}</h1>
            <div className="mt-5 flex items-end gap-4 text-lg">
              <span className="text-2xl text-white">{price}</span>
              {compareAt ? <span className="text-white/35 line-through">{compareAt}</span> : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/62">
                {unavailable ? "Unavailable" : "Available now"}
              </span>
              <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/62">
                {product.origin}
              </span>
              <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/62">
                {product.carat} ct
              </span>
            </div>
            <p className="mt-5 text-base leading-8 text-white/65">{product.shortDescription}</p>
            <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-white/10 bg-black/14 p-5 text-sm text-white/70 sm:grid-cols-2">
              <div><span className="block text-white/40">Origin</span>{product.origin}</div>
              <div><span className="block text-white/40">Cut</span>{product.cut}</div>
              <div><span className="block text-white/40">Dimensions</span>{product.dimensions}</div>
              <div><span className="block text-white/40">Treatment</span>{product.treatmentDetails}</div>
              <div><span className="block text-white/40">Shape</span>{product.shape}</div>
              <div><span className="block text-white/40">Clarity</span>{product.clarity}</div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button disabled={unavailable || !product.allowCartPurchase} className="flex-1">
                Add to cart
              </Button>
              <Button variant="outline" className="flex-1">
                {labels.productWhatsappLabel}
              </Button>
            </div>
            <div className="mt-6 grid gap-3 text-sm text-white/58">
              <p>Protected shipping and collector-safe packaging.</p>
              <p>Transparent provenance and treatment disclosure.</p>
              <p>Concierge assistance for sourcing, gifting and interiors.</p>
            </div>
          </div>
          <RichText html={product.description} className="prose prose-invert max-w-none text-white/70" />
          <div className="grid gap-4 rounded-[1.5rem] border border-white/10 p-6 text-sm text-white/68">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">{labels.productCertificateHeading}</p>
              <p className="mt-2">{product.certificateNumber || "Certificate details available on request."}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">{labels.productShippingHeading}</p>
              <p className="mt-2">{settings.shippingText}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">{labels.productReturnsHeading}</p>
              <p className="mt-2">{settings.returnsText}</p>
            </div>
          </div>
        </div>
      </div>
      {related.length ? (
        <div className="mt-16">
          <h2 className="text-display mb-6 text-4xl text-white">{labels.productRelatedHeading}</h2>
          <div className="shop-grid">
            {related.map((item) => (
              <Link key={item.id} href={`/stones/${item.slug}`} className="rounded-[1.5rem] border border-white/10 bg-white/3 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-white/42">{item.stoneType}</p>
                <p className="text-display mt-2 text-2xl text-white">{item.name}</p>
                <p className="mt-2 text-sm text-white/60">{item.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
