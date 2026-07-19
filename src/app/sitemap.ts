import type { MetadataRoute } from "next";
import { listCollections, listJournalPosts, listProducts } from "@/lib/data/store";
import { siteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, posts] = await Promise.all([listProducts(), listCollections(), listJournalPosts()]);
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
