import { CategoryForm } from "@/components/admin/category-form";
import { listCategories } from "@/lib/data/store";

export default async function NewCategoryPage() {
  const categories = await listCategories({ admin: true, includeInactive: true });
  return <CategoryForm categories={categories} />;
}
