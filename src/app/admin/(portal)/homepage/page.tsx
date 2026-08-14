import { HomepageManagerForm } from "@/components/admin/homepage-manager-form";
import { getHomepageSections, listAdminCollections, listAdminProducts, listCategories } from "@/lib/data/store";

export default async function HomepagePage() {
  const [sections, categories, collections, products] = await Promise.all([
    getHomepageSections(true),
    listCategories({ admin: true, includeInactive: true }),
    listAdminCollections(),
    listAdminProducts(),
  ]);

  return <HomepageManagerForm sections={sections} categories={categories} collections={collections} products={products} />;
}
