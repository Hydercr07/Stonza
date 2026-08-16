"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Ruler, X } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { useCart } from "@/components/storefront/cart-store";
import { useWishlist } from "@/components/storefront/wishlist-store";
import type { Product } from "@/types/domain";

export function ProductPurchase({ product, whatsappLabel }: { product: Product; whatsappLabel: string }) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  const unavailable = useMemo(
    () => ["sold", "out_of_stock", "archived", "trash"].includes(product.status) || product.inventoryQuantity <= 0,
    [product.inventoryQuantity, product.status],
  );

  return (
    <div className="mt-6 space-y-4">
      {product.sizes?.length ? (
        <label className="grid gap-2 text-sm text-black/72">
          <span className="font-medium text-[#171717]">Size</span>
          <select
            value={selectedSize}
            onChange={(event) => setSelectedSize(event.target.value)}
            className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3"
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
          <span className="font-medium text-[#171717]">{product.variantLabel || "Variant"}</span>
          <select
            value={selectedVariant}
            onChange={(event) => setSelectedVariant(event.target.value)}
            className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3"
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
      {product.sizeChart ? (
        <Dialog.Root open={sizeChartOpen} onOpenChange={setSizeChartOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d8ccb9] bg-white px-4 py-2 text-sm text-[#171717]"
            >
              <Ruler className="h-4 w-4" />
              Size Chart
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-[1.8rem] border border-[#eadfcf] bg-[#fffaf2] p-6 shadow-[0_24px_80px_rgba(26,20,12,0.18)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Dialog.Title className="text-display text-3xl text-[#171717]">
                    {product.sizeChart.title}
                  </Dialog.Title>
                  {product.sizeChart.notes ? (
                    <Dialog.Description className="mt-3 text-sm leading-7 text-black/62">
                      {product.sizeChart.notes}
                    </Dialog.Description>
                  ) : null}
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8ccb9] bg-white text-[#171717]"
                    aria-label="Close size chart"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>
              </div>
              <div className="mt-6 overflow-x-auto">
                <div className="min-w-[320px] rounded-[1.4rem] border border-[#eadfcf] bg-white">
                  <div className="grid grid-cols-[minmax(96px,140px)_1fr] border-b border-[#eadfcf] px-4 py-3 text-xs uppercase tracking-[0.22em] text-black/42">
                    <span>Size</span>
                    <span>Measurement</span>
                  </div>
                  {product.sizeChart.rows.map((row) => (
                    <div key={row.id} className="grid grid-cols-[minmax(96px,140px)_1fr] gap-4 px-4 py-3 text-sm text-black/68 not-last:border-b not-last:border-[#f0e5d5]">
                      <span className="font-medium text-[#171717]">{row.sizeLabel}</span>
                      <span>
                        {row.measurement || "Measurement available on request"}
                        {row.notes ? ` - ${row.notes}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      ) : null}

      <label className="grid gap-2 text-sm text-black/72">
        <span className="font-medium text-[#171717]">Quantity</span>
        <div className="flex items-center overflow-hidden rounded-2xl border border-[#d8ccb9] bg-white">
          <button type="button" className="px-4 py-3 text-lg" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>
            -
          </button>
          <input
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            className="w-full border-x border-[#d8ccb9] px-4 py-3 text-center outline-none"
            inputMode="numeric"
          />
          <button
            type="button"
            className="px-4 py-3 text-lg"
            onClick={() => setQuantity((current) => Math.min(product.inventoryQuantity || 1, current + 1))}
          >
            +
          </button>
        </div>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          disabled={unavailable || !product.allowCartPurchase}
          className="flex-1"
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
          Add to cart
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/contact">{whatsappLabel}</Link>
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => {
          toggle(product.id);
          setMessage(has(product.id) ? "Removed from wishlist." : "Saved to wishlist.");
        }}
      >
        {has(product.id) ? "Remove from wishlist" : "Save to wishlist"}
      </Button>

      {message ? <p className="text-sm text-[#10233a]">{message}</p> : null}
    </div>
  );
}
