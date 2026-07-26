import { ProductForm } from "@/components/admin/product-form";
import { listCategories, listCollections } from "@/lib/data/store";

export default async function NewProductPage() {
  const [categories, collections] = await Promise.all([
    listCategories({ admin: true, includeInactive: true }),
    listCollections(),
  ]);
  return <ProductForm categories={categories} collections={collections} />;
}
