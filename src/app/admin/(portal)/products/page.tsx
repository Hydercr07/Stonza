import { ProductTableManager } from "@/components/admin/product-table-manager";
import { listAdminCollections, listAdminProducts, listCategories } from "@/lib/data/store";

export default async function AdminProductsPage() {
  const [products, categories, collections] = await Promise.all([
    listAdminProducts(),
    listCategories({ admin: true, includeInactive: true }),
    listAdminCollections(),
  ]);

  return <ProductTableManager products={products} categories={categories} collections={collections} />;
}
