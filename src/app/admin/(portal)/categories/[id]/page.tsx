import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
import { getCategoryById, listCategories } from "@/lib/data/store";

export default async function AdminCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, categories] = await Promise.all([
    getCategoryById(id),
    listCategories({ admin: true, includeInactive: true }),
  ]);

  if (!category) notFound();

  return <CategoryForm category={category} categories={categories} />;
}
