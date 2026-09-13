import { OrdersManager } from "@/components/admin/orders-manager";
import { requireAdminSession } from "@/lib/auth/session";
import { listOrders } from "@/lib/data/store";

export default async function AdminOrdersPage() {
  // The shared portal layout only requires "dashboard:view", which every
  // admin role has -- so without a page-level check here, any authenticated
  // admin (regardless of role) could navigate straight to this URL and read
  // every customer's full name, email, phone, address, and order notes,
  // even a role explicitly never granted "orders:write".
  await requireAdminSession("orders:write");
  const orders = await listOrders();
  return <OrdersManager orders={orders} />;
}
