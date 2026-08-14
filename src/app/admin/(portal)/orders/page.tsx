import Link from "next/link";
import { transitionOrderStatusAction } from "@/actions/admin";
import { listOrders } from "@/lib/data/store";
import { formatMoney } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Commerce</p>
        <h1 className="text-display mt-3 text-5xl">Orders</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
          Review customer details, purchased items, totals, payment status and fulfilment progress.
        </p>
      </div>

      <div className="space-y-4">
        {orders.length ? (
          orders.map((order) => (
            <div key={order.id} className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <Link href={`/admin/orders/${order.orderNumber}`} className="text-lg font-medium text-white hover:text-accent">
                    {order.orderNumber}
                  </Link>
                  <p className="text-sm text-white/58">
                    {order.customer.fullName} - {order.customer.email} - {order.customer.phone}
                  </p>
                  <p className="text-sm text-white/48">
                    {order.customer.addressLine1}
                    {order.customer.addressLine2 ? `, ${order.customer.addressLine2}` : ""}
                    {`, ${order.customer.city}, ${order.customer.country}`}
                    {order.customer.postalCode ? ` ${order.customer.postalCode}` : ""}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/38">
                    Placed {new Date(order.createdAt).toLocaleString("en-PK")}
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
                  <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">
                    Update status
                  </button>
                </form>
              </div>

              <div className="mt-5 grid gap-3">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-[1.2rem] border border-white/8 bg-black/10 px-4 py-3 text-sm text-white/72">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span>{item.productName}</span>
                      <span>{formatMoney(item.unitPrice * item.quantity, order.currency)}</span>
                    </div>
                    <p className="mt-1 text-white/46">
                      SKU {item.sku} - Qty {item.quantity}
                      {item.selectedSize ? ` - Size ${item.selectedSize}` : ""}
                      {item.selectedVariant ? ` - Variant ${item.selectedVariant}` : ""}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-2 text-sm text-white/56 md:grid-cols-2">
                <p>Payment: {order.paymentMethod} / {order.paymentStatus}</p>
                <p className="md:text-right">Status: {order.status}</p>
                <p>Subtotal: {formatMoney(order.subtotal, order.currency)}</p>
                <p className="md:text-right">Shipping: {formatMoney(order.shipping, order.currency)}</p>
                <p>Discount: {formatMoney(order.discount, order.currency)}</p>
                <p className="font-medium text-white md:text-right">Total: {formatMoney(order.total, order.currency)}</p>
              </div>

              {order.customer.orderNotes ? (
                <div className="mt-5 rounded-[1.2rem] border border-white/8 bg-black/10 px-4 py-3 text-sm leading-7 text-white/62">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/38">Order notes</p>
                  <p className="mt-2">{order.customer.orderNotes}</p>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-8 text-white/68">
            No orders have been placed yet.
          </div>
        )}
      </div>
    </div>
  );
}
