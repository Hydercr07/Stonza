import { ProductForm } from "@/components/admin/product-form";
import { listAdminCollections, listCategories } from "@/lib/data/store";

export default async function NewProductPage() {
  const [categories, collections] = await Promise.all([
    listCategories({ admin: true, includeInactive: true }),
    listAdminCollections(),
  ]);
  return <ProductForm categories={categories} collections={collections} />;
}
