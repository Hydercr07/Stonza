import Image from "next/image";
import Link from "next/link";
import type { Category, Collection, Product } from "@/types/domain";
import { formatMoney } from "@/lib/utils";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/4 transition duration-300 hover:-translate-y-1 hover:border-white/18"
    >
      <div className="relative h-72 overflow-hidden">
        <Image
          src={collection.featuredImage}
          alt={collection.name}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
        />
      </div>
      <div className="space-y-3 p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Collection</p>
          <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/55">
            Editorial drop
          </span>
        </div>
        <h3 className="text-display text-3xl text-white">{collection.name}</h3>
        <p className="text-sm leading-7 text-white/62">{collection.description}</p>
      </div>
    </Link>
  );
}

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/4 transition duration-300 hover:-translate-y-1 hover:border-white/18"
    >
      <div className="relative h-64 overflow-hidden">
        <Image
          src={category.featuredImage}
          alt={category.altText}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
        />
      </div>
      <div className="space-y-2 p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Category</p>
          <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/55">
            Shop edit
          </span>
        </div>
        <h3 className="text-display text-3xl text-white">{category.name}</h3>
        <p className="text-sm leading-7 text-white/62">{category.shortDescription}</p>
      </div>
    </Link>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const isUnavailable = product.status === "out_of_stock" || product.status === "sold";
  const badge = product.status === "sold" ? "Sold" : product.status === "out_of_stock" ? "Out of stock" : product.newArrival ? "New arrival" : product.bestseller ? "Best seller" : product.oneOfOne ? "One of one" : null;

  return (
    <Link
      href={`/stones/${product.slug}`}
      className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/3 transition duration-300 hover:-translate-y-1 hover:border-white/18"
    >
      <div className="relative h-72 overflow-hidden bg-[#161818]">
        <Image
          src={product.featuredImage}
          alt={product.altText}
          fill
          className="object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-90"
        />
        {badge ? (
          <span className="absolute left-4 top-4 rounded-full bg-black/72 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/78">
            {badge}
          </span>
        ) : null}
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white/70 backdrop-blur-md">
          <span>{product.origin}</span>
          <span>{product.carat} ct</span>
        </div>
      </div>
      <div className="space-y-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">{product.stoneType}</p>
            <h3 className="text-display text-2xl text-white">{product.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/74">{formatMoney(product.salePrice ?? product.price, product.currency)}</p>
            {product.salePrice ? <p className="text-xs text-white/35 line-through">{formatMoney(product.price, product.currency)}</p> : null}
          </div>
        </div>
        <p className="text-sm leading-7 text-white/60">{product.shortDescription}</p>
        <div className="flex items-center justify-between border-t border-white/8 pt-4 text-xs uppercase tracking-[0.22em] text-white/48">
          <span>{product.allowCartPurchase && !isUnavailable ? "Ready to purchase" : "Concierge order"}</span>
          <span>{product.shape}</span>
        </div>
      </div>
    </Link>
  );
}
