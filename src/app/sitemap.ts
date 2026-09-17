import type { MetadataRoute } from "next";
import { listCategories, listCollections, listJournalPosts, listProducts } from "@/lib/data/store";
import { siteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, collections, posts] = await Promise.all([
    listProducts(),
    listCategories(),
    listCollections(),
    listJournalPosts(),
  ]);
  const staticRoutes = ["", "/shop", "/collections", "/about", "/authenticity", "/journal", "/contact"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteConfig.siteUrl}${route}`,
      lastModified: new Date(),
    })),
    ...products.map((product) => ({
      url: `${siteConfig.siteUrl}/stones/${product.slug}`,
      lastModified: new Date(product.updatedAt),
    })),
    // Category pages were missing from the sitemap entirely -- Stones, Men,
    // Women, and the rings/jewellery-sets subcategories are exactly the
    // pages the keyword SEO work targets, so leaving them undiscoverable
    // via the sitemap undercut that work.
    ...categories.map((category) => ({
      url: `${siteConfig.siteUrl}/categories/${category.slug}`,
      lastModified: new Date(category.updatedAt),
    })),
    ...collections.map((collection) => ({
      url: `${siteConfig.siteUrl}/collections/${collection.slug}`,
      lastModified: new Date(),
    })),
    ...posts.map((post) => ({
      url: `${siteConfig.siteUrl}/journal/${post.slug}`,
      lastModified: new Date(post.updatedAt),
    })),
  ];
}
