import { CategoryForm } from "@/components/admin/category-form";
import { listAdminProducts, listCategories } from "@/lib/data/store";

export default async function NewCategoryPage() {
  const [categories, products] = await Promise.all([
    listCategories({ admin: true, includeInactive: true }),
    listAdminProducts(),
  ]);

  return <CategoryForm categories={categories} products={products} />;
}
