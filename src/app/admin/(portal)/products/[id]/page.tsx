import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getProductById, listCategories, listCollections } from "@/lib/data/store";

export default async function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, collections] = await Promise.all([getProductById(id), listCategories(), listCollections()]);

  if (!product) notFound();

  return <ProductForm product={product} categories={categories} collections={collections} />;
}
