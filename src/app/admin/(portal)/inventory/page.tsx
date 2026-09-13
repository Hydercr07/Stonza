import { InventoryManager } from "@/components/admin/inventory-manager";
import { getStoreData, listAdminProducts } from "@/lib/data/store";

export default async function InventoryPage() {
  const [products, store] = await Promise.all([listAdminProducts(), getStoreData()]);
  return <InventoryManager products={products} activityLogs={store.activityLogs} />;
}
