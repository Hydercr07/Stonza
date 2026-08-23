import type { Metadata } from "next";
import type { ManagedPage, Product } from "@/types/domain";
import { siteConfig } from "@/lib/site-config";

/** Turns a site-relative path into an absolute https://stonza.pk/... URL. */
export function absoluteUrl(path: string): string {
  return `${siteConfig.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Shared metadata builder for the CMS-managed static pages (about,
 * authenticity, faq, privacy-policy, return-refund-policy,
 * shipping-and-returns, terms-and-conditions, contact). Each of these pages
 * already stores seoTitle/seoDescription/openGraphImage in Supabase via the
 * admin CMS, but the page components were never wired to actually read them
 * into Next's metadata -- every one of them was silently falling back to the
 * generic homepage title/description in search results and social shares.
 */
export function buildManagedPageMetadata(
  page: ManagedPage | null,
  path: string,
  fallbackTitle: string,
): Metadata {
  const title = page?.seoTitle || page?.title || fallbackTitle;
  const description = page?.seoDescription || undefined;
  const image = page?.openGraphImage || undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, images: image ? [image] : undefined, url: absoluteUrl(path) },
    twitter: { title, description, images: image ? [image] : undefined },
  };
}

/** Keeps user-state / private / transactional pages out of the search index. */
export const noIndexMetadata: Metadata = {
  robots: { index: false, follow: false },
};

interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

const AVAILABILITY_MAP: Record<string, string> = {
  active: "https://schema.org/InStock",
  published: "https://schema.org/InStock",
  sold: "https://schema.org/SoldOut",
  out_of_stock: "https://schema.org/OutOfStock",
  archived: "https://schema.org/Discontinued",
  trash: "https://schema.org/Discontinued",
};

/**
 * Product schema for a stone/jewellery listing. This is the single highest-
 * value piece of structured data for an e-commerce catalog: it's what
 * unlocks price/availability rich results in Google Search and gives AI
 * shopping assistants (ChatGPT, Gemini, Perplexity) structured facts to cite
 * -- name, price, SKU, material, condition -- instead of having to scrape
 * unstructured page text.
 */
export function productJsonLd(product: Product, price: number) {
  const inStock = !["sold", "out_of_stock", "archived", "trash"].includes(product.status) && product.inventoryQuantity > 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(`/stones/${product.slug}#product`),
    name: product.name,
    description: product.seoDescription || product.shortDescription || product.name,
    sku: product.sku,
    image: [product.openGraphImage || product.featuredImage].filter(Boolean),
    category: product.stoneType,
    material: product.stoneType,
    brand: { "@type": "Brand", name: "STONZA" },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/stones/${product.slug}`),
      priceCurrency: product.currency || "PKR",
      price: price.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : AVAILABILITY_MAP[product.status] || "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

/**
 * FAQPage schema -- one of the more reliable rich-result types in Google
 * Search, and exactly the shape AI answer engines pull from directly for
 * GEO. Kept as a plain array here rather than parsed out of the FAQ page's
 * CMS rich-text content, since that's admin-editable free-form HTML with no
 * guaranteed question/answer structure to parse reliably. If the FAQ page's
 * content is edited from the admin portal, update this list to match.
 */
export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function articleJsonLd(post: { title: string; excerpt?: string; heroMedia?: string; slug: string; publishedAt?: string; updatedAt: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.heroMedia ? [post.heroMedia] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: "STONZA" },
    publisher: { "@type": "Organization", name: "STONZA", "@id": `${siteConfig.siteUrl}/#organization` },
    mainEntityOfPage: absoluteUrl(`/journal/${post.slug}`),
  };
}
