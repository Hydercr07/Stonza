import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { hasDiscount } from "@/lib/commerce";
import type { Category, Collection, Product } from "@/types/domain";
import { cn, getProductDisplayPrice, formatMoney, isRemoteAsset } from "@/lib/utils";
import { QuickBuyModal } from "@/components/storefront/quick-buy-modal";

function VisualFallback({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(213,199,169,0.4),transparent_48%),linear-gradient(135deg,#fffaf2,#efe3cf)] px-8 text-center">
      <div className="space-y-3">
        <div className="flex justify-center">
          <Logo dark src="/brand/stonza-logo.png" alt="STONZA" className="w-[112px]" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-black/42">{label}</p>
      </div>
    </div>
  );
}

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link href={`/collections/${collection.slug}`} className="sheen-card group block overflow-hidden rounded-[2rem] border border-[#e7dccd] bg-[#fffdfa] shadow-[0_20px_45px_rgba(23,18,12,0.05)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_56px_rgba(23,18,12,0.08)]">
      <div className="relative h-80 overflow-hidden bg-[#f2ece4]">
        {collection.featuredImage ? (
          <Image
            src={collection.featuredImage}
            alt={collection.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            unoptimized={isRemoteAsset(collection.featuredImage)}
          />
        ) : (
          <VisualFallback label="Collection" />
        )}
      </div>
      <div className="space-y-3 px-5 py-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#9a7a4f]">Collection</p>
        <h3 className="text-display text-2xl text-[#171717]">{collection.name}</h3>
        <p className="text-sm leading-7 text-black/58">{collection.description}</p>
      </div>
    </Link>
  );
}

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/categories/${category.slug}`} className="sheen-card group block overflow-hidden rounded-[1.75rem] border border-[#eadfcf] bg-[#fffdf9] shadow-[0_18px_42px_rgba(23,18,12,0.04)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(23,18,12,0.07)]">
      <div className="relative h-72 overflow-hidden bg-[#f2ece4]">
        {category.featuredImage ? (
          <Image
            src={category.featuredImage}
            alt={category.altText}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            unoptimized={isRemoteAsset(category.featuredImage)}
          />
        ) : (
          <VisualFallback label="Category" />
        )}
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full bg-[rgba(255,248,237,0.9)] px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-black/58 backdrop-blur-md">
          <span>{category.name}</span>
          <span>View</span>
        </div>
      </div>
      <div className="space-y-2 px-5 py-5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#9a7a4f]">Category</p>
        <h3 className="text-display text-2xl text-[#171717]">{category.name}</h3>
        <p className="text-sm leading-7 text-black/58">{category.shortDescription}</p>
      </div>
    </Link>
  );
}

export function ProductCard({
  product,
  priorityImage = false,
}: {
  product: Product;
  priorityImage?: boolean;
}) {
  const isUnavailable = product.status === "out_of_stock" || product.status === "sold";
  const effectivePrice = getProductDisplayPrice(product);
  const secondImage = product.galleryImages.find((image) => image && image !== product.featuredImage);
  const discountPercentage = hasDiscount(product)
    ? Math.round(((product.price - effectivePrice) / product.price) * 100)
    : 0;
  const badge =
    product.status === "sold"
      ? "Sold Out"
      : product.status === "out_of_stock"
        ? "Sold Out"
        : product.newArrival
          ? "New"
          : product.bestseller
            ? "Best Seller"
            : product.oneOfOne
              ? "Limited"
              : null;

  return (
    <article className="sheen-card group overflow-hidden rounded-[1.35rem] border border-black/8 bg-white shadow-[0_14px_36px_rgba(20,22,26,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(20,22,26,0.09)]">
      <div className="relative h-[18rem] overflow-hidden bg-[#f2eee8] sm:h-[21rem]">
        <Link href={`/stones/${product.slug}`} className="absolute inset-0 z-10" aria-label={product.name} />
        {product.featuredImage ? (
          <>
            <Image
              src={product.featuredImage}
              alt={product.altText}
              fill
              priority={priorityImage}
              loading={priorityImage ? "eager" : "lazy"}
              fetchPriority={priorityImage ? "high" : undefined}
              className={cn(
                "object-cover transition duration-500 group-hover:scale-[1.03]",
                secondImage ? "group-hover:opacity-0" : "group-hover:opacity-95",
              )}
              sizes="(max-width: 768px) 60vw, (max-width: 1280px) 33vw, 20vw"
              unoptimized={isRemoteAsset(product.featuredImage)}
            />
            {secondImage ? (
              <Image
                src={secondImage}
                alt={product.altText}
                fill
                className="object-cover opacity-0 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                sizes="(max-width: 768px) 60vw, (max-width: 1280px) 33vw, 20vw"
                unoptimized={isRemoteAsset(secondImage)}
              />
            ) : null}
          </>
        ) : (
          <VisualFallback label="Product" />
        )}
        <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-2">
          {badge ? (
            <span className="rounded-full bg-[#141414] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              {badge}
            </span>
          ) : null}
          {discountPercentage > 0 ? (
            <span className="rounded-full bg-[#f4b234] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#161616]">
              Save {discountPercentage}%
            </span>
          ) : null}
        </div>
        <div className="absolute inset-x-3 bottom-3 z-20 flex items-center justify-between gap-3 rounded-full bg-white/94 px-3 py-2 shadow-[0_10px_24px_rgba(12,16,22,0.12)] backdrop-blur-md transition duration-300 group-hover:translate-y-0 lg:translate-y-4 lg:opacity-0 lg:group-hover:opacity-100">
          <div className="min-w-0">
            <p className="truncate text-[10px] uppercase tracking-[0.18em] text-black/42">{product.origin || product.categorySlug || product.sku}</p>
            <p className="truncate text-xs font-medium text-black/72">
              {product.variants?.length ? `${product.variants.length} options` : product.sizes?.length ? `${product.sizes.length} sizes` : "Ready to ship"}
            </p>
          </div>
          {!isUnavailable ? (
            <QuickBuyModal product={product} />
          ) : (
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40">Unavailable</span>
          )}
        </div>
      </div>
      <div className="space-y-3 px-4 py-4 sm:px-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-black/40">
            <span>{product.collectionSlug || product.categorySlug}</span>
            {product.variants?.slice(0, 2).map((variant) => (
              <span key={variant.id} className="rounded-full bg-[#f6f2ea] px-2 py-1">
                {variant.label || variant.value}
              </span>
            ))}
          </div>
          <Link href={`/stones/${product.slug}`} className="line-clamp-2 text-sm font-semibold uppercase tracking-[0.13em] text-black/86 hover:text-black">
            {product.name}
          </Link>
        </div>
        <div className="flex items-center gap-2 text-sm text-black/72">
          {hasDiscount(product) ? (
            <span className="text-black/28 line-through">{formatMoney(product.price, product.currency)}</span>
          ) : null}
          <span className="font-semibold text-black">{formatMoney(effectivePrice, product.currency)}</span>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-black/52">{product.shortDescription}</p>
      </div>
    </article>
  );
}
