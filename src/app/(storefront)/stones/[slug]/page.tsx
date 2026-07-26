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
      <div className="mb-8 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-black/42">
        <Link href="/shop" className="hover:text-black">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-black">{product.stoneType}</Link>
        <span>/</span>
        <span className="text-black/68">{product.name}</span>
      </div>
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4">
          <div className="relative min-h-[34rem] overflow-hidden rounded-[2rem] border border-black/8 bg-[#dfd5c8] shadow-[0_18px_44px_rgba(26,20,12,0.06)]">
            <Image src={product.featuredImage} alt={product.altText} fill className="object-cover" />
            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
              {product.oneOfOne ? <span className="rounded-full bg-[rgba(255,252,247,0.96)] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-black/72">One of one</span> : null}
              {product.newArrival ? <span className="rounded-full bg-[rgba(255,252,247,0.96)] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-black/72">New arrival</span> : null}
              {product.bestseller ? <span className="rounded-full bg-[rgba(255,252,247,0.96)] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-black/72">Best seller</span> : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {product.galleryImages.map((image) => (
              <div key={image} className="relative min-h-56 overflow-hidden rounded-[1.5rem] border border-black/8 bg-[#dfd5c8]">
                <Image src={image} alt={product.altText} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[2rem] border border-black/8 bg-[rgba(255,253,249,0.94)] p-7 shadow-[0_18px_44px_rgba(26,20,12,0.06)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[#a2845d]">{product.stoneType}</p>
            <h1 className="text-display mt-3 text-5xl text-[#171717]">{product.name}</h1>
            <div className="mt-5 flex items-end gap-4 text-lg">
              <span className="text-2xl text-[#171717]">{price}</span>
              {compareAt ? <span className="text-black/32 line-through">{compareAt}</span> : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs uppercase tracking-[0.22em] text-black/58">
                {unavailable ? "Unavailable" : "Available now"}
              </span>
              <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs uppercase tracking-[0.22em] text-black/58">
                {product.origin}
              </span>
              <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs uppercase tracking-[0.22em] text-black/58">
                {product.carat} ct
              </span>
            </div>
            <p className="mt-5 text-base leading-8 text-black/58">{product.shortDescription}</p>
            <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-black/8 bg-white/72 p-5 text-sm text-black/68 sm:grid-cols-2">
              <div><span className="block text-black/38">Origin</span>{product.origin}</div>
              <div><span className="block text-black/38">Cut</span>{product.cut}</div>
              <div><span className="block text-black/38">Dimensions</span>{product.dimensions}</div>
              <div><span className="block text-black/38">Treatment</span>{product.treatmentDetails}</div>
              <div><span className="block text-black/38">Shape</span>{product.shape}</div>
              <div><span className="block text-black/38">Clarity</span>{product.clarity}</div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button disabled={unavailable || !product.allowCartPurchase} className="flex-1">
                Add to cart
              </Button>
              <Button variant="outline" className="flex-1">
                {labels.productWhatsappLabel}
              </Button>
            </div>
            <div className="mt-6 grid gap-3 text-sm text-black/56">
              <p>Protected shipping and collector-safe packaging.</p>
              <p>Transparent provenance and treatment disclosure.</p>
              <p>Concierge assistance for sourcing, gifting and interiors.</p>
            </div>
          </div>
          <RichText html={product.description} className="max-w-none text-black/64" />
          <div className="grid gap-4 rounded-[1.5rem] border border-black/8 bg-[rgba(255,253,249,0.76)] p-6 text-sm text-black/64">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-black/42">{labels.productCertificateHeading}</p>
              <p className="mt-2">{product.certificateNumber || "Certificate details available on request."}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-black/42">{labels.productShippingHeading}</p>
              <p className="mt-2">{settings.shippingText}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-black/42">{labels.productReturnsHeading}</p>
              <p className="mt-2">{settings.returnsText}</p>
            </div>
          </div>
        </div>
      </div>
      {related.length ? (
        <div className="mt-16">
          <h2 className="text-display mb-6 text-4xl text-[#171717]">{labels.productRelatedHeading}</h2>
          <div className="shop-grid">
            {related.map((item) => (
              <Link key={item.id} href={`/stones/${item.slug}`} className="rounded-[1.5rem] border border-black/8 bg-[rgba(255,253,249,0.82)] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-black/42">{item.stoneType}</p>
                <p className="text-display mt-2 text-2xl text-[#171717]">{item.name}</p>
                <p className="mt-2 text-sm text-black/58">{item.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
