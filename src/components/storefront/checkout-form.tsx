"use client";

import { useActionState, useMemo, useState } from "react";
import Image from "next/image";
import { placeOrderAction } from "@/actions/storefront";
import { Button } from "@/components/shared/ui/button";
import { useCart } from "@/components/storefront/cart-store";
import { getProductDisplayPrice, formatMoney, isRemoteAsset } from "@/lib/utils";
import type { Product } from "@/types/domain";

export function CheckoutForm({ products }: { products: Product[] }) {
  const { lines } = useCart();
  const [state, formAction] = useActionState(placeOrderAction, { error: null });
  const [submitted, setSubmitted] = useState(false);
  const [submissionToken] = useState(() => crypto.randomUUID());

  const cartItems = useMemo(
    () =>
      lines
        .map((line) => {
          const product = products.find((entry) => entry.id === line.productId);
          return product ? { line, product } : null;
        })
        .filter(Boolean),
    [lines, products],
  );

  const subtotal = cartItems.reduce(
    (total, entry) => total + getProductDisplayPrice(entry!.product) * entry!.line.quantity,
    0,
  );
  const shipping = 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  if (!cartItems.length) {
    return (
      <section className="container-shell page-section">
        <div className="page-panel text-center">
          <h1 className="section-title text-[#171717]">Your cart is empty</h1>
          <p className="mt-4 text-sm leading-7 text-black/58">Add items to your cart before checking out.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container-shell page-section">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.28em] text-black/42">Checkout</p>
        <h1 className="page-title mt-3 text-[#171717]">Complete your order</h1>
      </div>

      <form
        action={(formData) => {
          setSubmitted(true);
          formData.set("cartLines", JSON.stringify(lines));
          formData.set("submissionToken", submissionToken);
          return formAction(formData);
        }}
        className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]"
      >
        <div className="grid gap-5 rounded-[1.8rem] border border-[#eadfcf] bg-white/86 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              Full name
              <input name="fullName" required className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm">
              Email
              <input name="email" type="email" required className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              Phone number
              <input name="phone" required className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm">
              Country
              <input
                name="country"
                defaultValue="Pakistan"
                required
                className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              City
              <input name="city" required className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm">
              Postal / ZIP code
              <input name="postalCode" className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3" />
            </label>
          </div>
          <label className="grid gap-2 text-sm">
            Address
            <input name="addressLine1" required className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            Address line 2
            <input name="addressLine2" className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            Order notes
            <textarea name="orderNotes" rows={4} className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            Payment method
            <select
              name="paymentMethod"
              defaultValue="Cash on Delivery"
              className="rounded-2xl border border-[#d8ccb9] bg-white px-4 py-3"
            >
              <option>Cash on Delivery</option>
              <option>Bank Transfer</option>
            </select>
          </label>
          {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
        </div>

        <div className="h-fit rounded-[1.8rem] border border-[#eadfcf] bg-[linear-gradient(180deg,rgba(255,253,249,0.96),rgba(248,237,214,0.82))] p-5 sm:p-6 shadow-[0_18px_44px_rgba(26,20,12,0.06)]">
          <h2 className="text-display text-3xl text-[#171717]">Order summary</h2>
          <div className="mt-5 space-y-4">
            {cartItems.map((entry) => (
              <div
                key={`${entry!.product.id}-${entry!.line.selectedSize ?? "default"}-${entry!.line.selectedVariant ?? "default"}`}
                className="flex gap-3 rounded-[1.2rem] border border-[#eadfcf] bg-white/72 p-3"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[#efe8dc]">
                  <Image
                    src={entry!.product.featuredImage}
                    alt={entry!.product.altText}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized={isRemoteAsset(entry!.product.featuredImage)}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[#171717]">{entry!.product.name}</p>
                  <p className="text-xs text-black/52">
                    Qty {entry!.line.quantity}
                    {entry!.line.selectedSize ? ` - Size ${entry!.line.selectedSize}` : ""}
                    {entry!.line.selectedVariant
                      ? ` - ${entry!.product.variantLabel || "Variant"} ${entry!.line.selectedVariant}`
                      : ""}
                  </p>
                </div>
                <p className="text-sm text-[#171717]">
                  {formatMoney(getProductDisplayPrice(entry!.product) * entry!.line.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 text-sm text-black/62">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{formatMoney(shipping)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span>{formatMoney(discount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#e2d6c6] pt-3 font-medium text-[#171717]">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>
          <Button type="submit" className="mt-6 w-full" disabled={submitted && !state.error}>
            Place order
          </Button>
        </div>
      </form>
    </section>
  );
}
