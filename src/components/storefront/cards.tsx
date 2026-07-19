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
      <div className="space-y-2 p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Collection</p>
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
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Category</p>
        <h3 className="text-display text-3xl text-white">{category.name}</h3>
        <p className="text-sm leading-7 text-white/62">{category.shortDescription}</p>
      </div>
    </Link>
  );
}

export function ProductCard({ product }: { product: Product }) {
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
        {product.status === "out_of_stock" || product.status === "sold" ? (
          <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/72">
            {product.status === "sold" ? "Sold" : "Out of stock"}
          </span>
        ) : null}
      </div>
      <div className="space-y-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">{product.stoneType}</p>
            <h3 className="text-display text-2xl text-white">{product.name}</h3>
          </div>
          <p className="text-sm text-white/74">
            {formatMoney(product.salePrice ?? product.price, product.currency)}
          </p>
        </div>
        <p className="text-sm leading-7 text-white/60">{product.shortDescription}</p>
      </div>
    </Link>
  );
}
