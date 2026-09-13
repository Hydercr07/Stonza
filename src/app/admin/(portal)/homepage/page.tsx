import { HomepageBannerManagerForm } from "@/components/admin/homepage-banner-manager-form";
import { HomepageManagerForm } from "@/components/admin/homepage-manager-form";
import { getHomepageBanners, getHomepageSections, listAdminCollections, listAdminProducts, listCategories } from "@/lib/data/store";

export default async function HomepagePage() {
  const [sections, banners, categories, collections, products] = await Promise.all([
    getHomepageSections(true),
    getHomepageBanners(true),
    listCategories({ admin: true, includeInactive: true }),
    listAdminCollections(),
    listAdminProducts(),
  ]);

  return (
    <div className="space-y-10">
      <HomepageManagerForm sections={sections} categories={categories} collections={collections} products={products} />
      <HomepageBannerManagerForm banners={banners} sections={sections} />
    </div>
  );
}
