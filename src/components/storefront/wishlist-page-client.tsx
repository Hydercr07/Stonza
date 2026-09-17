"use client";

import Link from "next/link";
import { ProductCard } from "@/components/storefront/cards";
import { Button } from "@/components/shared/ui/button";
import { useWishlist } from "@/components/storefront/wishlist-store";
import type { Product } from "@/types/domain";

export function WishlistPageClient({ products }: { products: Product[] }) {
  const { productIds } = useWishlist();
  const items = products.filter((product) => productIds.includes(product.id));

  return (
    <section className="container-shell page-section">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.28em] text-black/42">Wishlist</p>
        <h1 className="page-title mt-3 text-[#171717]">Saved pieces</h1>
      </div>

      {items.length ? (
        <div className="shop-grid">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="page-panel text-center">
          <p className="text-sm leading-7 text-black/58">
            You have not saved any products yet. Use the product detail page to add pieces to your wishlist.
          </p>
          <Button asChild className="mt-6">
            <Link href="/shop">Browse products</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
