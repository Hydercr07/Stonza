import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ProductCard } from "@/components/storefront/cards";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductPurchase } from "@/components/storefront/product-purchase";
import { RichText } from "@/components/shared/rich-text";
import { hasDiscount } from "@/lib/commerce";
import { getLabelMap, getProductBySlug, getSiteSettings, listCategories, listAdminCollections, listProducts } from "@/lib/data/store";
import { getProductDisplayPrice, formatMoney } from "@/lib/utils";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  if (product.slug !== slug && product.slugHistory?.includes(slug)) {
    permanentRedirect(`/stones/${product.slug}`);
  }

  const [labels, settings, categories, collections, relatedProducts] = await Promise.all([
    getLabelMap(),
    getSiteSettings(),
    listCategories(),
    listAdminCollections(),
    listProducts(),
  ]);
  const collectionLabel =
    collections.find((item) => item.slug === product.collectionSlug)?.name ?? null;
  const related =
    relatedProducts
      .filter((item) => item.id !== product.id)
      .filter((item) =>
        product.relatedProductSlugs.length
          ? product.relatedProductSlugs.includes(item.slug)
          : item.collectionSlug === product.collectionSlug ||
            item.subcategorySlug === product.subcategorySlug ||
            item.categorySlug === product.categorySlug,
      )
      .slice(0, 4);
  const unavailable = ["sold", "out_of_stock", "archived", "trash"].includes(product.status) || product.inventoryQuantity <= 0;
  const price = formatMoney(getProductDisplayPrice(product), product.currency);
  const compareAt = hasDiscount(product) ? formatMoney(product.price, product.currency) : null;
  const categoryLabel = categories.find((item) => item.slug === product.categorySlug)?.name ?? product.categorySlug;
  const subcategoryLabel =
    product.subcategorySlug
      ? categories.find((item) => item.slug === product.subcategorySlug)?.name ?? product.subcategorySlug
      : null;

  return (
    <section className="section-noise container-shell py-14">
      <div className="mb-8 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-black/42">
        <Link href="/shop" className="hover:text-black">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-black">{categoryLabel}</Link>
        {subcategoryLabel ? (
          <>
            <span>/</span>
            <Link href={`/shop?subcategory=${product.subcategorySlug}`} className="hover:text-black">
              {subcategoryLabel}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span className="text-black/68">{product.name}</span>
      </div>
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <ProductGallery images={product.galleryImages} altText={product.altText} />
        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[2.1rem] border border-[#eadfcf] bg-[linear-gradient(180deg,rgba(255,253,249,0.96),rgba(248,237,214,0.78))] p-7 shadow-[0_18px_44px_rgba(26,20,12,0.06)]">
            <p className="text-xs uppercase tracking-[0.32em] text-[#a2845d]">{product.stoneType}</p>
            <h1 className="text-display mt-3 text-5xl leading-[0.92] text-[#171717]">{product.name}</h1>
            <div className="mt-5 flex items-end gap-4 text-lg">
              <span className="spotlight-text text-2xl font-semibold">{price}</span>
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
              {collectionLabel ? (
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs uppercase tracking-[0.22em] text-black/58">
                  {collectionLabel}
                </span>
              ) : null}
              {product.variants?.length ? (
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs uppercase tracking-[0.22em] text-black/58">
                  {product.variants.length} {product.variantLabel || "variants"}
                </span>
              ) : null}
            </div>
            <p className="mt-5 text-base leading-8 text-black/58">{product.shortDescription}</p>
            <div className="mt-6 grid gap-4 rounded-[1.7rem] border border-[#eadfcf] bg-white/78 p-5 text-sm text-black/68 sm:grid-cols-2">
              <div><span className="block text-black/38">SKU</span>{product.sku}</div>
              <div><span className="block text-black/38">Stock</span>{product.inventoryQuantity} available</div>
              <div><span className="block text-black/38">Category</span>{categoryLabel}</div>
              <div><span className="block text-black/38">Subcategory</span>{subcategoryLabel ?? "Not assigned"}</div>
              <div><span className="block text-black/38">Origin</span>{product.origin}</div>
              <div><span className="block text-black/38">Cut</span>{product.cut}</div>
              <div><span className="block text-black/38">Dimensions</span>{product.dimensions}</div>
              <div><span className="block text-black/38">Treatment</span>{product.treatmentDetails}</div>
              <div><span className="block text-black/38">Shape</span>{product.shape}</div>
              <div><span className="block text-black/38">Clarity</span>{product.clarity}</div>
            </div>
            <ProductPurchase product={product} whatsappLabel={labels.productWhatsappLabel} />
            <div className="mt-6 grid gap-3 text-sm text-black/56">
              <p>Protected shipping and collector-safe packaging.</p>
              <p>Transparent provenance and treatment disclosure.</p>
              <p>Concierge assistance for sourcing, gifting and interiors.</p>
            </div>
          </div>
          <RichText html={product.description} className="max-w-none text-black/64" />
          {product.specifications?.length ? (
            <div className="grid gap-4 rounded-[1.7rem] border border-[#eadfcf] bg-[rgba(255,253,249,0.8)] p-6 text-sm text-black/64">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-black/42">Specifications</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {product.specifications.map((specification) => (
                  <div key={`${specification.label}-${specification.value}`} className="rounded-[1.1rem] border border-[#eadfcf] bg-white/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-black/42">{specification.label}</p>
                    <p className="mt-2 text-sm text-[#171717]">{specification.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="grid gap-4 rounded-[1.7rem] border border-[#eadfcf] bg-[rgba(255,253,249,0.8)] p-6 text-sm text-black/64">
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
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
