import Link from "next/link";
import { notFound } from "next/navigation";
import { transitionOrderStatusAction } from "@/actions/admin";
import { Button } from "@/components/shared/ui/button";
import { requireAdminSession } from "@/lib/auth/session";
import { getOrderByNumber } from "@/lib/data/store";
import { formatMoney } from "@/lib/utils";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  await requireAdminSession("orders:write");
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Commerce</p>
          <h1 className="text-display mt-3 text-5xl">{order.orderNumber}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
            Review item selections, customer details, payment state, and fulfilment status in one place.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/orders">Back to orders</Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-4">
            <div>
              <p className="text-sm text-white/52">Placed {new Date(order.createdAt).toLocaleString("en-PK")}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/38">
                Payment: {order.paymentMethod} / {order.paymentStatus}
              </p>
            </div>
            <form action={transitionOrderStatusAction} className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="orderNumber" value={order.orderNumber} />
              <select
                name="status"
                defaultValue={order.status}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button type="submit" variant="outline">
                Update status
              </Button>
            </form>
          </div>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="rounded-[1.2rem] border border-white/8 bg-black/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{item.productName}</p>
                    <p className="mt-1 text-sm text-white/50">SKU {item.sku}</p>
                    <p className="mt-2 text-sm text-white/62">
                      Qty {item.quantity}
                      {item.selectedSize ? ` - Size ${item.selectedSize}` : ""}
                      {item.selectedVariant ? ` - Variant ${item.selectedVariant}` : ""}
                    </p>
                  </div>
                  <p className="text-sm text-white/72">{formatMoney(item.unitPrice * item.quantity, order.currency)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
            <h2 className="text-display text-3xl text-white">Customer</h2>
            <div className="mt-5 space-y-3 text-sm text-white/62">
              <p>
                <span className="text-white/38">Name</span>
                <br />
                {order.customer.fullName}
              </p>
              <p>
                <span className="text-white/38">Email</span>
                <br />
                {order.customer.email}
              </p>
              <p>
                <span className="text-white/38">Phone</span>
                <br />
                {order.customer.phone}
              </p>
              <p>
                <span className="text-white/38">Address</span>
                <br />
                {order.customer.addressLine1}
                {order.customer.addressLine2 ? `, ${order.customer.addressLine2}` : ""}
                {`, ${order.customer.city}, ${order.customer.country}`}
                {order.customer.postalCode ? ` ${order.customer.postalCode}` : ""}
              </p>
            </div>
            {order.customer.orderNotes ? (
              <div className="mt-5 rounded-[1.2rem] border border-white/8 bg-black/10 p-4 text-sm leading-7 text-white/62">
                <p className="text-xs uppercase tracking-[0.18em] text-white/38">Order notes</p>
                <p className="mt-2">{order.customer.orderNotes}</p>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
            <h2 className="text-display text-3xl text-white">Totals</h2>
            <div className="mt-5 space-y-3 text-sm text-white/62">
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
              <div className="flex items-center justify-between gap-4 border-t border-white/8 pt-3 font-medium text-white">
                <span>Total</span>
                <span>{formatMoney(order.total, order.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
