import Image from "next/image";
import Link from "next/link";
import type { Category, Collection, Product } from "@/types/domain";
import { formatMoney } from "@/lib/utils";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link href={`/collections/${collection.slug}`} className="group block overflow-hidden rounded-[2rem] border border-[#e7dccd] bg-[#fffdfa] shadow-[0_20px_45px_rgba(23,18,12,0.05)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_56px_rgba(23,18,12,0.08)]">
      <div className="relative h-80 overflow-hidden bg-[#f2ece4]">
        <Image
          src={collection.featuredImage}
          alt={collection.name}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
        />
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
    <Link href={`/shop?category=${category.slug}`} className="group block overflow-hidden rounded-[1.75rem] border border-[#eadfcf] bg-[#fffdf9] shadow-[0_18px_42px_rgba(23,18,12,0.04)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(23,18,12,0.07)]">
      <div className="relative h-72 overflow-hidden bg-[#f2ece4]">
        <Image
          src={category.featuredImage}
          alt={category.altText}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
        />
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

export function ProductCard({ product }: { product: Product }) {
  const isUnavailable = product.status === "out_of_stock" || product.status === "sold";
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
    <Link href={`/stones/${product.slug}`} className="group block overflow-hidden rounded-[1.8rem] border border-[#eadfcf] bg-[#fffdf9] shadow-[0_18px_42px_rgba(23,18,12,0.04)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_56px_rgba(23,18,12,0.07)]">
      <div className="relative h-80 overflow-hidden bg-[#f2ece4] sm:h-96">
        <Image
          src={product.featuredImage}
          alt={product.altText}
          fill
          className="object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-90"
        />
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
          {product.salePrice ? (
            <span className="text-black/28 line-through">{formatMoney(product.price, product.currency)}</span>
          ) : null}
          <span className={product.salePrice ? "font-semibold text-[#171717]" : ""}>
            {formatMoney(product.salePrice ?? product.price, product.currency)}
          </span>
        </div>
        <p className="text-sm leading-7 text-black/52">{product.shortDescription}</p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-black/38">
          {product.allowCartPurchase && !isUnavailable ? "Ready to purchase" : "Concierge order"}
        </p>
      </div>
    </Link>
  );
}
