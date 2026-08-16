import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/shared/ui/button";
import { OrderConfirmationClient } from "@/components/storefront/order-confirmation-client";
import { getOrderByNumber } from "@/lib/data/store";
import { formatMoney } from "@/lib/utils";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <section className="container-shell page-section">
      <OrderConfirmationClient />
      <div className="rounded-[2rem] border border-[#eadfcf] bg-white/88 p-5 sm:p-8 shadow-[0_22px_52px_rgba(26,20,12,0.08)]">
        <p className="text-xs uppercase tracking-[0.28em] text-black/42">Order confirmed</p>
        <h1 className="page-title mt-3 text-[#171717]">Thank you for your order</h1>
        <p className="mt-4 text-sm leading-7 text-black/58">
          Order number <span className="font-medium text-[#171717]">{order.orderNumber}</span>
        </p>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-[#eadfcf] bg-[rgba(255,253,249,0.9)] p-5">
                <p className="font-medium text-[#171717]">{item.productName}</p>
                <p className="mt-1 text-sm text-black/58">
                  Qty {item.quantity}
                  {item.selectedSize ? ` - Size ${item.selectedSize}` : ""}
                  {item.selectedVariant ? ` - Variant ${item.selectedVariant}` : ""}
                </p>
                <p className="mt-2 text-sm text-black/58">{formatMoney(item.unitPrice * item.quantity, order.currency)}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-[#eadfcf] bg-[rgba(255,253,249,0.9)] p-5">
            <h2 className="text-display text-3xl text-[#171717]">Summary</h2>
            <div className="mt-5 space-y-3 text-sm text-black/62">
              <div className="flex items-center justify-between gap-4">
                <span>Customer</span>
                <span>{order.customer.fullName}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Email</span>
                <span>{order.customer.email}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Phone</span>
                <span>{order.customer.phone}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span>Address</span>
                <span className="max-w-[14rem] break-words text-right">
                  {order.customer.addressLine1}
                  {order.customer.addressLine2 ? `, ${order.customer.addressLine2}` : ""}
                  {`, ${order.customer.city}, ${order.customer.country}`}
                  {order.customer.postalCode ? ` ${order.customer.postalCode}` : ""}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Status</span>
                <span>{order.status}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Payment</span>
                <span>{order.paymentMethod} / {order.paymentStatus}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Placed</span>
                <span>{new Date(order.createdAt).toLocaleString("en-PK")}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Shipping</span>
                <span>{formatMoney(order.shipping, order.currency)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Discount</span>
                <span>{formatMoney(order.discount, order.currency)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[#eadfcf] pt-3 font-medium text-[#171717]">
                <span>Total</span>
                <span>{formatMoney(order.total, order.currency)}</span>
              </div>
            </div>
            {order.customer.orderNotes ? (
              <div className="mt-5 rounded-[1.1rem] border border-[#eadfcf] bg-white/72 p-4 text-sm leading-7 text-black/58">
                <p className="text-xs uppercase tracking-[0.22em] text-black/42">Order notes</p>
                <p className="mt-2">{order.customer.orderNotes}</p>
              </div>
            ) : null}
            <Button asChild className="mt-6 w-full">
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
