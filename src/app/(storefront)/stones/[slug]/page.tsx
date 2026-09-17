import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ProductCard } from "@/components/storefront/cards";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductPurchase } from "@/components/storefront/product-purchase";
import { RichText } from "@/components/shared/rich-text";
import { hasDiscount } from "@/lib/commerce";
import { getLabelMap, getProductBySlug, getSiteSettings, listCategories, listCollections, listProducts } from "@/lib/data/store";
import { getProductDisplayPrice, formatMoney } from "@/lib/utils";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // The root layout already applies a "%s | STONZA" title template, so the
  // title set here should be just the page-specific part -- appending
  // "| STONZA" again produced "Product Name | STONZA | STONZA" in the
  // browser tab and in search/social previews.
  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.shortDescription || undefined;
  const image = product.openGraphImage || product.featuredImage || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/stones/${product.slug}` },
    openGraph: { title, description, images: image ? [image] : undefined },
    twitter: { title, description, images: image ? [image] : undefined },
  };
}

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
    listCollections(),
    listProducts(),
  ]);
  const productGallery = Array.isArray(product.galleryImages) && product.galleryImages.length
    ? product.galleryImages.filter((image): image is string => typeof image === "string" && image.trim().length > 0)
    : product.featuredImage
      ? [product.featuredImage]
      : [];
  const relatedProductSlugs = Array.isArray(product.relatedProductSlugs) ? product.relatedProductSlugs : [];
  const productVariants = Array.isArray(product.variants) ? product.variants : [];
  const productSpecifications = Array.isArray(product.specifications) ? product.specifications : [];
  const collectionLabel =
    collections.find((item) => item.slug === product.collectionSlug)?.name ?? null;
  const related =
    relatedProducts
      .filter((item) => item.id !== product.id)
      .filter((item) =>
        relatedProductSlugs.length
          ? relatedProductSlugs.includes(item.slug)
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
  const subcategoryParentSlug =
    product.subcategorySlug
      ? categories.find((item) => item.slug === product.subcategorySlug)?.parentCategorySlug ?? product.categorySlug
      : undefined;
  const whatsappHref = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, "")}`
    : "https://wa.me/923058599096";
  const breadcrumbItems = [
    { name: "Shop", path: "/shop" },
    { name: categoryLabel, path: `/shop?category=${product.categorySlug}` },
    ...(subcategoryLabel
      ? [{ name: subcategoryLabel, path: `/shop?category=${subcategoryParentSlug ?? product.categorySlug}&subcategory=${product.subcategorySlug}` }]
      : []),
    { name: product.name, path: `/stones/${product.slug}` },
  ];

  return (
    <section className="section-noise container-shell page-section">
      {/* Product schema unlocks price/availability rich results in Google
          Search and gives AI shopping assistants structured facts to cite. */}
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, getProductDisplayPrice(product))) }}
      />
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems)) }}
      />
      <div className="mb-8 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-black/42">
        <Link href="/shop" className="hover:text-black">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-black">{categoryLabel}</Link>
        {subcategoryLabel ? (
          <>
            <span>/</span>
            <Link href={`/shop?category=${subcategoryParentSlug ?? product.categorySlug}&subcategory=${product.subcategorySlug}`} className="hover:text-black">
              {subcategoryLabel}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span className="text-black/68">{product.name}</span>
      </div>
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <ProductGallery images={productGallery} altText={product.altText || product.name} />
        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[2.1rem] border border-[#eadfcf] bg-[linear-gradient(180deg,rgba(255,253,249,0.96),rgba(248,237,214,0.78))] p-7 shadow-[0_18px_44px_rgba(26,20,12,0.06)]">
            <p className="text-xs uppercase tracking-[0.32em] text-[#a2845d]">{product.stoneType}</p>
            <h1 className="page-title mt-3 text-[#171717]">{product.name}</h1>
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
              {productVariants.length ? (
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs uppercase tracking-[0.22em] text-black/58">
                  {productVariants.length} {product.variantLabel || "variants"}
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
            <ProductPurchase
              product={product}
              whatsappLabel={labels.productWhatsappLabel}
              whatsappHref={whatsappHref}
            />
            <div className="mt-6 grid gap-3 text-sm text-black/56">
              <p>Protected shipping and collector-safe packaging.</p>
              <p>Transparent provenance and treatment disclosure.</p>
              <p>Concierge assistance for sourcing, gifting and interiors.</p>
            </div>
          </div>
          <RichText html={product.description} className="max-w-none text-black/64" />
          {productSpecifications.length ? (
            <div className="grid gap-4 rounded-[1.7rem] border border-[#eadfcf] bg-[rgba(255,253,249,0.8)] p-6 text-sm text-black/64">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-black/42">Specifications</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {productSpecifications.map((specification) => (
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
