"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/components/storefront/cart-store";
import type { Product } from "@/types/domain";
import { formatMoney, getProductDisplayPrice, isRemoteAsset } from "@/lib/utils";
import { Button } from "@/components/shared/ui/button";

export function QuickBuyModal({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const unavailable = useMemo(
    () => ["sold", "out_of_stock", "archived", "trash"].includes(product.status) || product.inventoryQuantity <= 0,
    [product.inventoryQuantity, product.status],
  );

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-black shadow-[0_8px_24px_rgba(12,16,22,0.16)] transition hover:bg-[#f4b234] hover:text-[#111]"
        >
          Quick Buy
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/52 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-black/8 bg-[#faf8f3] shadow-[0_24px_80px_rgba(12,16,22,0.22)]">
          <div className="flex items-center justify-between border-b border-black/8 px-5 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-black/40">Quick buy</p>
              <Dialog.Title className="mt-1 text-lg font-semibold text-black">{product.name}</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/58"
                aria-label="Close quick buy"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="grid gap-5 px-5 py-5 md:grid-cols-[14rem_1fr]">
            <div className="relative h-[18rem] overflow-hidden rounded-[1.4rem] bg-[#efe9df]">
              {product.featuredImage ? (
                <Image
                  src={product.featuredImage}
                  alt={product.altText}
                  fill
                  className="object-cover"
                  sizes="224px"
                  unoptimized={isRemoteAsset(product.featuredImage)}
                />
              ) : null}
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-black/72">
                  {product.salePrice ? (
                    <span className="text-black/28 line-through">{formatMoney(product.price, product.currency)}</span>
                  ) : null}
                  <span className="text-lg font-semibold text-black">
                    {formatMoney(getProductDisplayPrice(product), product.currency)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-black/54">{product.shortDescription}</p>
              </div>

              {product.sizes?.length ? (
                <label className="grid gap-2 text-sm text-black/72">
                  <span className="font-medium text-black">Size</span>
                  <select
                    value={selectedSize}
                    onChange={(event) => setSelectedSize(event.target.value)}
                    className="rounded-[1rem] border border-black/10 bg-white px-4 py-3"
                  >
                    <option value="">Select a size</option>
                    {product.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {product.variants?.length ? (
                <label className="grid gap-2 text-sm text-black/72">
                  <span className="font-medium text-black">{product.variantLabel || "Variant"}</span>
                  <select
                    value={selectedVariant}
                    onChange={(event) => setSelectedVariant(event.target.value)}
                    className="rounded-[1rem] border border-black/10 bg-white px-4 py-3"
                  >
                    <option value="">Select an option</option>
                    {product.variants
                      .filter((variant) => variant.active)
                      .map((variant) => (
                        <option key={variant.id} value={variant.value}>
                          {variant.label || variant.value}
                        </option>
                      ))}
                  </select>
                </label>
              ) : null}

              <div className="grid gap-2 text-sm text-black/72">
                <span className="font-medium text-black">Quantity</span>
                <div className="flex items-center overflow-hidden rounded-full border border-black/10 bg-white">
                  <button type="button" className="inline-flex h-11 w-11 items-center justify-center" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="flex-1 text-center text-sm font-semibold text-black">{quantity}</span>
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center"
                    onClick={() => setQuantity((current) => Math.min(Math.max(product.inventoryQuantity, 1), current + 1))}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <Button
                className="w-full"
                disabled={unavailable}
                onClick={() => {
                  setMessage(null);
                  const result = addItem(
                    {
                      productId: product.id,
                      quantity,
                      selectedSize: selectedSize || undefined,
                      selectedVariant: selectedVariant || undefined,
                    },
                    product,
                  );
                  if (!result.ok) {
                    setMessage(result.message ?? "This product could not be added to the cart.");
                    return;
                  }
                  setMessage("Added to cart.");
                  window.dispatchEvent(new CustomEvent("stonza:cart-open"));
                }}
              >
                {unavailable ? "Unavailable" : "Add to cart"}
              </Button>

              {message ? <p className="text-sm text-black/58">{message}</p> : null}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
