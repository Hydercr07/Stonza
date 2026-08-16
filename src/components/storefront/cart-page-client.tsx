"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/shared/ui/button";
import { useCart } from "@/components/storefront/cart-store";
import { getProductDisplayPrice, formatMoney, isRemoteAsset } from "@/lib/utils";
import type { Product } from "@/types/domain";

type CartProductMap = Record<string, Product>;

export function CartPageClient({ products }: { products: Product[] }) {
  const { lines, removeItem, updateQuantity } = useCart();
  const productMap = products.reduce<CartProductMap>((acc, product) => {
    acc[product.id] = product;
    return acc;
  }, {});

  const cartItems = lines
    .map((line) => {
      const product = productMap[line.productId];
      if (!product) return null;
      return { line, product };
    })
    .filter(Boolean);

  const subtotal = cartItems.reduce(
    (total, entry) => total + getProductDisplayPrice(entry!.product) * entry!.line.quantity,
    0,
  );

  if (!cartItems.length) {
    return (
      <section className="container-shell page-section">
        <div className="page-panel text-center">
          <h1 className="section-title text-[#171717]">Your cart is empty</h1>
          <p className="mt-4 text-sm leading-7 text-black/58">
            Add a product from the storefront to begin checkout.
          </p>
          <Button asChild className="mt-6">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="container-shell page-section">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-black/42">Shopping cart</p>
          <h1 className="page-title mt-3 text-[#171717]">Review your pieces</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          {cartItems.map((entry) => (
            <div
              key={`${entry!.product.id}-${entry!.line.selectedSize ?? "default"}-${entry!.line.selectedVariant ?? "default"}`}
              className="grid gap-4 rounded-[1.8rem] border border-[#eadfcf] bg-white/86 p-5 sm:grid-cols-[140px_minmax(0,1fr)]"
            >
              <div className="relative min-h-36 overflow-hidden rounded-[1.4rem] bg-[#efe8dc]">
                <Image
                  src={entry!.product.featuredImage}
                  alt={entry!.product.altText}
                  fill
                  className="object-cover"
                  sizes="180px"
                  unoptimized={isRemoteAsset(entry!.product.featuredImage)}
                />
              </div>
              <div className="flex flex-col justify-between gap-4">
                <div>
                  <Link href={`/stones/${entry!.product.slug}`} className="text-display text-xl text-[#171717] sm:text-2xl">
                    {entry!.product.name}
                  </Link>
                  <p className="mt-2 text-sm text-black/58">{formatMoney(getProductDisplayPrice(entry!.product))}</p>
                  {entry!.line.selectedSize ? (
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-black/42">Size: {entry!.line.selectedSize}</p>
                  ) : null}
                  {entry!.line.selectedVariant ? (
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-black/42">
                      {entry!.product.variantLabel || "Variant"}: {entry!.line.selectedVariant}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={entry!.product.inventoryQuantity}
                    value={entry!.line.quantity}
                    onChange={(event) =>
                      updateQuantity(
                        entry!.product.id,
                        Number(event.target.value) || 1,
                        entry!.product.inventoryQuantity,
                        entry!.line.selectedSize,
                        entry!.line.selectedVariant,
                      )
                    }
                    className="w-24 rounded-full border border-[#d8ccb9] bg-white px-4 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(entry!.product.id, entry!.line.selectedSize, entry!.line.selectedVariant)}
                    className="text-sm text-black/52 hover:text-black"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/40">
                  {entry!.product.inventoryQuantity} available
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-[1.8rem] border border-[#eadfcf] bg-[linear-gradient(180deg,rgba(255,253,249,0.96),rgba(248,237,214,0.82))] p-5 sm:p-6 shadow-[0_18px_44px_rgba(26,20,12,0.06)]">
          <h2 className="text-display text-3xl text-[#171717]">Order summary</h2>
          <div className="mt-6 space-y-3 text-sm text-black/62">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{formatMoney(0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span>{formatMoney(0)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#e2d6c6] pt-3 font-medium text-[#171717]">
              <span>Total</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
          </div>
          <Button asChild className="mt-6 w-full">
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
