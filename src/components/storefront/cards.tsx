import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { hasDiscount } from "@/lib/commerce";
import type { Category, Collection, Product } from "@/types/domain";
import { getProductDisplayPrice, formatMoney, isRemoteAsset } from "@/lib/utils";

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
  const badge =
    product.status === "sold"
      ? "Sold"
      : product.status === "out_of_stock"
        ? "Out of stock"
        : product.newArrival
          ? "New arrival"
          : product.bestseller
            ? "Best seller"
            : product.oneOfOne
              ? "One of one"
              : null;

  return (
    <Link href={`/stones/${product.slug}`} className="sheen-card group block overflow-hidden rounded-[1.8rem] border border-[#eadfcf] bg-[#fffdf9] shadow-[0_18px_42px_rgba(23,18,12,0.04)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_56px_rgba(23,18,12,0.07)]">
      <div className="relative h-80 overflow-hidden bg-[#f2ece4] sm:h-96">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage}
            alt={product.altText}
            fill
            priority={priorityImage}
            loading={priorityImage ? "eager" : "lazy"}
            fetchPriority={priorityImage ? "high" : undefined}
            className="object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-90"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            unoptimized={isRemoteAsset(product.featuredImage)}
          />
        ) : (
          <VisualFallback label="Product" />
        )}
        {badge ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-black/72 shadow-sm">
            {badge}
          </span>
        ) : null}
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full bg-[rgba(255,248,237,0.9)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-black/58 shadow-sm backdrop-blur-md">
          <span>{product.origin}</span>
          <span>{product.carat} ct</span>
        </div>
      </div>
      <div className="space-y-3 px-5 py-5">
        <h3 className="text-display text-[1.9rem] leading-none text-[#171717]">{product.name}</h3>
        <div className="flex items-center gap-2 text-[1.02rem] text-black/72">
          {hasDiscount(product) ? (
            <span className="text-black/28 line-through">{formatMoney(product.price, product.currency)}</span>
          ) : null}
          <span className={hasDiscount(product) ? "font-semibold text-[#171717]" : "font-semibold text-[#10233a]"}>
            {formatMoney(effectivePrice, product.currency)}
          </span>
        </div>
        <p className="text-sm leading-7 text-black/52">{product.shortDescription}</p>
        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-black/38">
          <span>{product.sizes?.length ? `${product.sizes.length} sizes` : "No size selection"}</span>
          {product.variants?.length ? <span>{product.variants.length} variants</span> : null}
        </div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-black/38">
          {product.allowCartPurchase && !isUnavailable ? "Ready to purchase" : "Concierge order"}
        </p>
      </div>
    </Link>
  );
}
