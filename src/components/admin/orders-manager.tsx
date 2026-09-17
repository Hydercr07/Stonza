"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { transitionOrderStatusAction } from "@/actions/admin";
import type { OrderRecord } from "@/types/domain";
import { AdminBadge, AdminCard, AdminPageHeader } from "@/components/admin/ui";
import { Button } from "@/components/shared/ui/button";
import { formatMoney } from "@/lib/utils";

function badgeTone(status: OrderRecord["status"]) {
  if (status === "delivered") return "success";
  if (status === "cancelled") return "danger";
  if (status === "processing" || status === "shipped") return "warning";
  return "neutral";
}

export function OrdersManager({ orders }: { orders: OrderRecord[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesQuery =
        !normalized ||
        [
          order.orderNumber,
          order.customer.fullName,
          order.customer.email,
          order.customer.phone,
          ...order.items.map((item) => `${item.productName} ${item.sku}`),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesPayment =
        paymentFilter === "all" ||
        order.paymentStatus === paymentFilter ||
        order.paymentMethod.toLowerCase().includes(paymentFilter.toLowerCase());
      return matchesQuery && matchesStatus && matchesPayment;
    });
  }, [orders, paymentFilter, query, statusFilter]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Orders"
        title="Order management"
        description="Search by customer or order number, keep status updates close to the record, and avoid noisy tables."
      />

      <AdminCard className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_0.75fr_0.75fr]">
          <div className="flex items-center gap-3 rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3">
            <Search className="h-4 w-4 text-[#8b7e70]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search order number, customer, email, phone, SKU, or product"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#8b7e70]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-[#e7dfd1] bg-white px-4 py-3 text-sm text-[#171717]"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
            className="rounded-2xl border border-[#e7dfd1] bg-white px-4 py-3 text-sm text-[#171717]"
          >
            <option value="all">All payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cod">Cash on delivery</option>
          </select>
        </div>

        <div className="grid gap-4">
          {filteredOrders.length ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="rounded-[1.5rem] border border-[#ece4d8] bg-[#fcfaf6] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Link href={`/admin/orders/${order.orderNumber}`} className="text-lg font-medium text-[#171717] hover:text-[#9a6d2f]">
                      {order.orderNumber}
                    </Link>
                    <p className="text-sm text-[#5f564b]">
                      {order.customer.fullName} · {order.customer.email} · {order.customer.phone}
                    </p>
                    <p className="text-sm text-[#6f6558]">
                      Placed {new Date(order.createdAt).toLocaleString("en-PK")}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <AdminBadge tone={badgeTone(order.status)}>{order.status}</AdminBadge>
                    <p className="text-sm font-medium text-[#171717]">{formatMoney(order.total, order.currency)}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="grid gap-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="rounded-[1.2rem] border border-white bg-white px-4 py-3 text-sm text-[#5f564b]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="font-medium text-[#171717]">{item.productName}</span>
                          <span>{formatMoney(item.unitPrice * item.quantity, order.currency)}</span>
                        </div>
                        <p className="mt-1">
                          SKU {item.sku} · Qty {item.quantity}
                          {item.selectedSize ? ` · Size ${item.selectedSize}` : ""}
                          {item.selectedVariant ? ` · Variant ${item.selectedVariant}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>

                  <form action={transitionOrderStatusAction} className="grid gap-3 rounded-[1.2rem] border border-white bg-white p-4">
                    <input type="hidden" name="orderNumber" value={order.orderNumber} />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b7e70]">Quick actions</p>
                    <select
                      name="status"
                      defaultValue={order.status}
                      className="rounded-2xl border border-[#e7dfd1] bg-white px-4 py-3 text-sm text-[#171717]"
                    >
                      <option value="pending">Confirm later</option>
                      <option value="confirmed">Confirm</option>
                      <option value="processing">Process</option>
                      <option value="shipped">Ship</option>
                      <option value="delivered">Deliver</option>
                      <option value="cancelled">Cancel</option>
                    </select>
                    <Button variant="outline">Update order</Button>
                    <Link href={`/admin/orders/${order.orderNumber}`} className="text-sm text-[#7f6d59] hover:text-[#171717]">
                      Open full order details
                    </Link>
                    <p className="text-xs text-[#8b7e70]">
                      Payment: {order.paymentMethod} · {order.paymentStatus}
                    </p>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#ddd2c3] bg-[#fcfaf6] p-10 text-center text-sm text-[#6f6558]">
              No orders match the current filters.
            </div>
          )}
        </div>
      </AdminCard>
    </div>
  );
}
