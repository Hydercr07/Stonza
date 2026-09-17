"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/components/storefront/cart-store";
import type { Product } from "@/types/domain";
import { formatMoney, getProductDisplayPrice, isRemoteAsset } from "@/lib/utils";
import { Button } from "@/components/shared/ui/button";

export function CartDrawer({
  open,
  onOpenChange,
  products,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
}) {
  const { lines, removeItem, updateQuantity, count } = useCart();
  const [orderNotes, setOrderNotes] = useState("");
  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const hydratedLines = lines
    .map((line) => ({ line, product: productMap.get(line.productId) }))
    .filter((entry): entry is { line: typeof lines[number]; product: Product } => Boolean(entry.product));
  const subtotal = hydratedLines.reduce(
    (total, entry) => total + getProductDisplayPrice(entry.product) * entry.line.quantity,
    0,
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/44 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(92vw,30rem)] flex-col bg-[#faf8f3] shadow-[-24px_0_80px_rgba(12,16,22,0.22)]">
          <div className="flex items-center justify-between border-b border-black/8 px-5 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-black/40">Cart</p>
              <Dialog.Title className="mt-1 text-lg font-semibold text-black">
                {count ? `${count} item${count === 1 ? "" : "s"} ready` : "Your bag is empty"}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/58"
                aria-label="Close cart"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {hydratedLines.length ? (
            <>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="grid gap-4">
                  {hydratedLines.map(({ line, product }) => (
                    <div key={`${line.productId}-${line.selectedSize ?? ""}-${line.selectedVariant ?? ""}`} className="grid grid-cols-[5.5rem_1fr] gap-3 rounded-[1.25rem] border border-black/8 bg-white p-3">
                      <div className="relative h-[5.5rem] overflow-hidden rounded-[1rem] bg-[#efebe3]">
                        {product.featuredImage ? (
                          <Image
                            src={product.featuredImage}
                            alt={product.altText}
                            fill
                            className="object-cover"
                            sizes="88px"
                            unoptimized={isRemoteAsset(product.featuredImage)}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              href={`/stones/${product.slug}`}
                              className="line-clamp-2 text-sm font-semibold uppercase tracking-[0.12em] text-black/82"
                              onClick={() => onOpenChange(false)}
                            >
                              {product.name}
                            </Link>
                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-black/42">
                              {line.selectedSize || line.selectedVariant
                                ? [line.selectedSize, line.selectedVariant].filter(Boolean).join(" / ")
                                : product.sku}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(line.productId, line.selectedSize, line.selectedVariant)}
                            className="text-xs uppercase tracking-[0.16em] text-black/40 hover:text-black"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center overflow-hidden rounded-full border border-black/8">
                            <button
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center text-black/58"
                              onClick={() =>
                                updateQuantity(
                                  line.productId,
                                  line.quantity - 1,
                                  product.inventoryQuantity,
                                  line.selectedSize,
                                  line.selectedVariant,
                                )
                              }
                              aria-label={`Decrease quantity for ${product.name}`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-9 text-center text-sm font-medium text-black">{line.quantity}</span>
                            <button
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center text-black/58"
                              onClick={() =>
                                updateQuantity(
                                  line.productId,
                                  line.quantity + 1,
                                  product.inventoryQuantity,
                                  line.selectedSize,
                                  line.selectedVariant,
                                )
                              }
                              aria-label={`Increase quantity for ${product.name}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-semibold text-black">
                              {formatMoney(getProductDisplayPrice(product) * line.quantity, product.currency)}
                            </p>
                            {product.salePrice ? (
                              <p className="text-black/28 line-through">{formatMoney(product.price * line.quantity, product.currency)}</p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <label className="mt-5 grid gap-2 text-sm text-black/62">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/48">Order notes</span>
                  <textarea
                    value={orderNotes}
                    onChange={(event) => setOrderNotes(event.target.value)}
                    rows={4}
                    placeholder="Anything the team should know before packing?"
                    className="rounded-[1.25rem] border border-black/8 bg-white px-4 py-3 outline-none placeholder:text-black/28 focus:border-black/18"
                  />
                </label>
              </div>

              <div className="border-t border-black/8 px-5 py-5">
                <div className="mb-4 rounded-[1.2rem] border border-[#f4d48e] bg-[#fff6df] px-4 py-3 text-sm text-[#5f4a13]">
                  Cart updates happen instantly. Review quantities here before heading to checkout.
                </div>
                <div className="flex items-center justify-between text-sm uppercase tracking-[0.18em] text-black/48">
                  <span>Subtotal</span>
                  <span className="text-base font-semibold tracking-normal text-black">{formatMoney(subtotal)}</span>
                </div>
                <div className="mt-4 grid gap-3">
                  <Button asChild className="w-full">
                    <Link href="/checkout" onClick={() => onOpenChange(false)}>
                      Checkout
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/cart" onClick={() => onOpenChange(false)}>
                      View full cart
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/42">Nothing in the cart yet</p>
              <p className="mt-3 max-w-sm text-sm leading-7 text-black/52">
                Add a product from the shop or use Quick Buy from any product card to fill the cart without leaving the page.
              </p>
              <Button asChild className="mt-6">
                <Link href="/shop" onClick={() => onOpenChange(false)}>
                  Start shopping
                </Link>
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
