import { OrdersManager } from "@/components/admin/orders-manager";
import { listOrders } from "@/lib/data/store";

export default async function AdminOrdersPage() {
  const orders = await listOrders();
  return <OrdersManager orders={orders} />;
}
