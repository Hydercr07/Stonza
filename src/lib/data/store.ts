import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getEffectivePrice } from "@/lib/commerce";
import type {
  ActivityLogEntry,
  CartLineInput,
  Category,
  Collection,
  ContentLabel,
  CustomerOrderDetails,
  FooterSection,
  HeroSettings,
  HomepageSection,
  JournalPost,
  ManagedPage,
  MediaAsset,
  NavigationItem,
  OrderItem,
  OrderRecord,
  Product,
  ProductMediaItem,
  ProductSizeChart,
  ProductVariantOption,
  SiteSettings,
  SizeChartRow,
  StoreData,
} from "@/types/domain";
import { slugify } from "@/lib/utils";
import { env } from "@/lib/env";

const storeRuntimeDir = path.join(process.cwd(), ".stonza", "runtime");
const storePath = path.join(storeRuntimeDir, "dev-store.json");
const remoteStoreBucket = "documents";
const remoteStoreObjectPath = "runtime/dev-store.json";

function createEmptyStore(): StoreData {
  return {
    settings: normalizeSettings(undefined),
    hero: normalizeHero({
      activeMode: "carousel",
      mode: "carousel",
      carousel: {
        autoplay: true,
        autoplayInterval: 3000,
        loop: true,
        pauseOnHover: false,
        showArrows: false,
        showDots: true,
        transitionStyle: "fade",
        slides: [],
        status: "published",
      },
    }),
    homepageSections: normalizeSections([]),
    categories: [],
    collections: [],
    products: [],
    pages: [],
    journalPosts: [],
    mediaAssets: [],
    contentLabels: defaultContentLabels,
    activityLogs: [],
    orders: [],
  };
}

function isReadOnlyRuntime() {
  return Boolean(process.env.VERCEL);
}

const defaultNavigation: NavigationItem[] = [
  { id: "nav-shop", label: "Shop", href: "/shop", order: 1, visible: true },
  { id: "nav-collections", label: "Collections", href: "/collections", order: 2, visible: true },
  { id: "nav-journal", label: "Journal", href: "/journal", order: 3, visible: true },
  { id: "nav-authenticity", label: "Authenticity", href: "/authenticity", order: 4, visible: true },
  { id: "nav-about", label: "About", href: "/about", order: 5, visible: true },
  { id: "nav-contact", label: "Contact", href: "/contact", order: 6, visible: true },
];

const defaultFooterSections: FooterSection[] = [
  {
    id: "footer-explore",
    title: "Explore",
    order: 1,
    links: [
      { id: "footer-shop", label: "Shop", href: "/shop" },
      { id: "footer-collections", label: "Collections", href: "/collections" },
      { id: "footer-journal", label: "Journal", href: "/journal" },
      { id: "footer-about", label: "About", href: "/about" },
    ],
  },
  {
    id: "footer-legal",
    title: "Legal",
    order: 2,
    links: [
      { id: "footer-privacy", label: "Privacy Policy", href: "/privacy-policy" },
      { id: "footer-terms", label: "Terms & Conditions", href: "/terms-and-conditions" },
      { id: "footer-shipping", label: "Shipping & Returns", href: "/shipping-and-returns" },
    ],
  },
];

const defaultLabels: Record<string, string> = {
  homepageJournalEyebrow: "Journal",
  homepageJournalHeading: "Field Notes",
  homepageJournalBody: "Editorial notes on provenance, presentation and the mineral worlds behind each stone.",
  homepageCategoryEyebrow: "Featured Categories",
  homepageCategoryHeading: "Stone families with distinct purpose",
  homepageCategoryBody: "Statement pieces, desk objects and architectural stones arranged with clarity.",
  shopEyebrow: "Shop",
  shopHeading: "Curated stones",
  shopBody: "Search, filter and discover original stones selected for provenance, atmosphere and collector value.",
  shopEmpty: "No stones matched the current filters.",
  collectionsEyebrow: "Collections",
  collectionsHeading: "Mineral worlds with distinct tone",
  collectionsBody: "Collections curated by atmosphere, tonal family and geological personality.",
  productRelatedHeading: "Related Stones",
  productShippingHeading: "Shipping",
  productReturnsHeading: "Returns",
  productEnquiryLabel: "Request Details",
  productWhatsappLabel: "WHATSAPP",
  productCertificateHeading: "Certificate & Provenance",
  notFoundTitle: "The stone you were looking for could not be found.",
};

const defaultContentLabels: ContentLabel[] = Object.entries(defaultLabels).map(([key, label]) => ({
  id: `label-${key}`,
  key,
  label,
  updatedAt: "2026-07-19T00:00:00.000Z",
  updatedBy: "system",
}));

const defaultHeroSlides: HeroSettings["carousel"]["slides"] = [];

const placeholderAssetPattern = /(^\/placeholders\/)|(^\/brand\/stonza-logo\.png$)/i;

function isPlaceholderAsset(value: string | undefined) {
  return Boolean(value && placeholderAssetPattern.test(value));
}

function replaceSlugValue(values: string[] | undefined, previousSlug: string, nextSlug: string) {
  if (!values?.length) return values;
  return [...new Set(values.map((value) => (value === previousSlug ? nextSlug : value)))];
}

function replaceNavigationHref(items: NavigationItem[], previousPath: string, nextPath: string) {
  return items.map((item) => ({
    ...item,
    href: item.href === previousPath ? nextPath : item.href,
    children: item.children?.map((child) => ({
      ...child,
      href: child.href === previousPath ? nextPath : child.href,
    })),
  }));
}

function resolveEntitySlug({
  requestedSlug,
  fallbackName,
  existingSlug,
  existingName,
  existingId,
  entries,
}: {
  requestedSlug?: string;
  fallbackName: string;
  existingSlug?: string;
  existingName?: string;
  existingId?: string;
  entries: Array<{ id: string; slug: string }>;
}) {
  const normalizedRequestedSlug = requestedSlug?.trim() ? slugify(requestedSlug) : undefined;
  const existingAutoSlug = existingName ? slugify(existingName) : undefined;
  const shouldAutoGenerate =
    !normalizedRequestedSlug ||
    (existingSlug === normalizedRequestedSlug && existingAutoSlug === existingSlug);

  const preferred = shouldAutoGenerate ? fallbackName : normalizedRequestedSlug ?? fallbackName;
  return ensureUniqueSlug(
    entries.map((entry) => entry.slug),
    preferred,
    existingId,
    entries,
  );
}

function defaultSettings(): SiteSettings {
  return {
    siteTitle: "STONZA",
    siteDescription:
      "Original natural stones, elevated through cinematic curation and authentic provenance.",
    whatsappNumber: "+923058599096",
    email: "atelier@stonza.pk",
    address: "Lahore Design District, Pakistan",
    businessHours: "Mon-Sat, 10:00-19:00",
    currency: "PKR",
    maintenanceMode: false,
    checkoutMode: "standard",
    shippingText:
      "White-glove regional delivery and protected worldwide dispatch for verified orders.",
    returnsText:
      "Returns are reviewed case-by-case for natural one-of-one stones after condition inspection.",
    lowStockDefault: 1,
    announcement: {
      enabled: false,
      text: "",
      linkLabel: "",
      link: "/contact",
      backgroundStyle: "graphite",
    },
    brand: {
      name: "STONZA",
      tagline: "ORIGINAL STONES",
      logo: "/brand/stonza-logo.png",
      lightLogo: "/brand/stonza-logo.png",
      favicon: "/favicon.ico",
      colors: {
        primary: "#0d0e0e",
        secondary: "#f3ede1",
        accent: "#d5c7a9",
        surface: "#161818",
      },
      headingFont: "Cormorant Garamond",
      bodyFont: "Inter",
    },
    header: {
      style: "transparent",
      sticky: true,
      showSearch: true,
      showWishlist: true,
      showCart: true,
      contactButton: {
        label: "WHATSAPP",
        destination: "https://wa.me/923058599096",
        enabled: true,
      },
      navigation: defaultNavigation,
    },
    footer: {
      description: "",
      newsletterHeading: "Stay connected",
      newsletterBody: "",
      copyright: "© 2026 STONZA. All rights reserved.",
      legalLinks: [
        { id: "footer-legal-1", label: "Privacy Policy", href: "/privacy-policy", order: 1, visible: true },
        { id: "footer-legal-2", label: "Terms & Conditions", href: "/terms-and-conditions", order: 2, visible: true },
        { id: "footer-legal-3", label: "Shipping & Returns", href: "/shipping-and-returns", order: 3, visible: true },
      ],
      sections: defaultFooterSections,
    },
    social: {
      instagram: "",
      facebook: "",
      tiktok: "",
      youtube: "",
      pinterest: "",
    },
    seo: {
      defaultTitle: "STONZA | ORIGINAL STONES",
      defaultDescription:
        "Original natural stones, elevated through cinematic curation and authentic provenance.",
      defaultOgImage: "/brand/stonza-logo.png",
    },
    labels: defaultLabels,
    contactButton: {
      label: "WHATSAPP",
      destination: "https://wa.me/923058599096",
      enabled: true,
    },
  };
}

function normalizeSettings(settings: Partial<SiteSettings> | undefined): SiteSettings {
  const defaults = defaultSettings();
  return {
    ...defaults,
    ...settings,
    currency: "PKR",
    announcement: {
      ...defaults.announcement,
      ...settings?.announcement,
      linkLabel: settings?.announcement?.linkLabel ?? defaults.announcement.linkLabel,
      backgroundStyle: settings?.announcement?.backgroundStyle ?? defaults.announcement.backgroundStyle,
    },
    brand: {
      ...defaults.brand,
      ...settings?.brand,
      colors: {
        ...defaults.brand.colors,
        ...settings?.brand?.colors,
      },
    },
    header: {
      ...defaults.header,
      ...settings?.header,
      contactButton: {
        ...defaults.header.contactButton,
        ...settings?.header?.contactButton,
      },
      navigation: [...(settings?.header?.navigation?.length ? settings.header.navigation : defaultNavigation)]
        .map((item, index) => ({
          ...item,
          order: item.order ?? index + 1,
          visible: item.visible ?? true,
          children: item.children?.map((child, childIndex) => ({
            ...child,
            order: child.order ?? childIndex + 1,
            visible: child.visible ?? true,
          })),
        }))
        .sort((a, b) => a.order - b.order),
    },
    footer: {
      ...defaults.footer,
      ...settings?.footer,
      legalLinks: [...(settings?.footer?.legalLinks?.length ? settings.footer.legalLinks : defaults.footer.legalLinks)]
        .map((item, index) => ({
          ...item,
          order: item.order ?? index + 1,
          visible: item.visible ?? true,
        }))
        .sort((a, b) => a.order - b.order),
      sections: [...(settings?.footer?.sections?.length ? settings.footer.sections : defaultFooterSections)].sort(
        (a, b) => a.order - b.order,
      ),
    },
    social: {
      ...defaults.social,
      ...settings?.social,
    },
    seo: {
      ...defaults.seo,
      ...settings?.seo,
    },
    labels: {
      ...defaults.labels,
      ...settings?.labels,
    },
    contactButton: {
      ...defaults.contactButton,
      ...settings?.contactButton,
    },
  };
}

function normalizeProductMedia(product: Partial<Product>): ProductMediaItem[] {
  if (product.media?.length) {
    return [...product.media]
      .map((item, index) => ({
        ...item,
        altText: item.altText || product.altText || product.name || "STONZA stone",
        fileName: item.fileName || path.basename(item.url),
        size: item.size ?? 0,
        featured: item.featured ?? index === 0,
        sortOrder: item.sortOrder ?? index + 1,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const galleryImages = product.galleryImages?.length
    ? product.galleryImages
    : product.featuredImage
      ? [product.featuredImage]
      : [];

  return galleryImages.map((url, index) => ({
    id: `media-${product.id ?? "draft"}-${index + 1}`,
    url,
    altText: product.altText || product.name || "STONZA stone",
    fileName: path.basename(url),
    size: 0,
    featured: (product.featuredImage ? product.featuredImage === url : index === 0),
    sortOrder: index + 1,
  }));
}

function normalizeSlugHistory(history: string[] | undefined, currentSlug: string) {
  return [...new Set((history ?? []).filter((entry) => entry && entry !== currentSlug))];
}

function normalizeSizeChart(sizeChart: Product["sizeChart"] | string | undefined, sizes: string[] = []): ProductSizeChart | undefined {
  if (!sizeChart) {
    return undefined;
  }

  if (typeof sizeChart === "string") {
    const trimmed = sizeChart.trim();
    if (!trimmed) return undefined;

    const rows: SizeChartRow[] = sizes.map((size, index) => ({
      id: `size-row-${index + 1}`,
      sizeLabel: size,
      measurement: "",
    }));

    return {
      title: "Size Chart",
      notes: trimmed,
      rows,
    };
  }

  return {
    title: sizeChart.title?.trim() || "Size Chart",
    notes: sizeChart.notes?.trim() || undefined,
    rows: (sizeChart.rows ?? [])
      .map((row, index) => ({
        id: row.id || `size-row-${index + 1}`,
        sizeLabel: row.sizeLabel?.trim() || `Size ${index + 1}`,
        measurement: row.measurement?.trim() || "",
        notes: row.notes?.trim() || undefined,
      }))
      .filter((row) => row.sizeLabel || row.measurement || row.notes),
  };
}

function normalizeVariants(variants: Product["variants"] | string[] | undefined): ProductVariantOption[] {
  if (!variants?.length) {
    return [];
  }

  return variants
    .map((variant, index) => {
      if (typeof variant === "string") {
        return {
          id: `variant-${index + 1}`,
          value: variant.trim(),
          active: true,
        } satisfies ProductVariantOption;
      }

      return {
        id: variant.id || `variant-${index + 1}`,
        value: variant.value.trim(),
        label: variant.label?.trim() || undefined,
        active: variant.active ?? true,
      } satisfies ProductVariantOption;
    })
    .filter((variant) => variant.value);
}

function normalizeSpecifications(specifications: Product["specifications"] | undefined) {
  return (specifications ?? [])
    .map((specification) => ({
      label: specification.label?.trim() || "",
      value: specification.value?.trim() || "",
    }))
    .filter((specification) => specification.label && specification.value);
}

function normalizeProduct(product: Partial<Product>): Product {
  const media = normalizeProductMedia(product);
  const featuredItem = media.find((item) => item.featured) ?? media[0];
  const categorySlugs = product.categorySlugs?.length
    ? [...new Set(product.categorySlugs)]
    : product.categorySlug
      ? [product.categorySlug]
      : [];
  const nextSlug = product.slug ?? slugify(product.name ?? "untitled-stone");
  const sizeChart = normalizeSizeChart(product.sizeChart, product.sizes ?? []);
  const variants = normalizeVariants(product.variants);

  return {
    id: product.id ?? `prd-${crypto.randomUUID()}`,
    name: product.name ?? "Untitled stone",
    slug: nextSlug,
    slugHistory: normalizeSlugHistory(product.slugHistory, nextSlug),
    sku: product.sku ?? "STONZA-DRAFT",
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    price: product.price ?? 0,
    salePrice: product.salePrice,
    currency: "PKR",
    costPrice: product.costPrice ?? 0,
    inventoryQuantity: product.inventoryQuantity ?? 0,
    lowStockThreshold: product.lowStockThreshold ?? 1,
    oneOfOne: product.oneOfOne ?? false,
    allowEnquiry: product.allowEnquiry ?? true,
    allowCartPurchase: product.allowCartPurchase ?? true,
    visibility: product.visibility ?? "visible",
    stoneType: product.stoneType ?? "",
    categorySlug: categorySlugs[0] ?? product.categorySlug ?? "",
    categorySlugs,
    subcategorySlug: product.subcategorySlug ?? "",
    collectionSlug: product.collectionSlug ?? "",
    weight: product.weight ?? "0 kg",
    carat: product.carat ?? 0,
    dimensions: product.dimensions ?? "TBD",
    shape: product.shape ?? "Organic",
    cut: product.cut ?? "Polished",
    color: product.color ?? "Undisclosed",
    clarity: product.clarity ?? "Undisclosed",
    origin: product.origin ?? "",
    naturalOrTreated: product.naturalOrTreated ?? "natural",
    treatmentDetails: product.treatmentDetails ?? "None disclosed.",
    certificationAuthority: product.certificationAuthority,
    certificateNumber: product.certificateNumber,
    certificateImage: product.certificateImage,
    certificatePdf: product.certificatePdf,
    featuredImage: featuredItem?.url ?? product.featuredImage ?? "",
    galleryImages: media.map((item) => item.url),
    media,
    productVideo: product.productVideo,
    video360: product.video360,
    model3d: product.model3d,
    splineUrl: product.splineUrl,
    altText: product.altText ?? featuredItem?.altText ?? product.name ?? "STONZA stone",
    featured: product.featured ?? false,
    newArrival: product.newArrival ?? false,
    bestseller: product.bestseller ?? false,
    relatedProductSlugs: product.relatedProductSlugs ?? [],
    tags: product.tags ?? [],
    searchKeywords: product.searchKeywords ?? [],
    sizes: product.sizes ?? [],
    variantLabel: product.variantLabel?.trim() || undefined,
    variants,
    sizeChart,
    specifications: normalizeSpecifications(product.specifications),
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    canonicalOverride: product.canonicalOverride,
    openGraphImage: product.openGraphImage,
    privateNotes: product.privateNotes,
    status: product.status ?? "draft",
    createdAt: product.createdAt ?? new Date().toISOString(),
    updatedAt: product.updatedAt ?? new Date().toISOString(),
  };
}

function normalizeCollection(collection: Partial<Collection>): Collection {
  const nextSlug = collection.slug ?? slugify(collection.name ?? "untitled-collection");
  return {
    id: collection.id ?? `col-${crypto.randomUUID()}`,
    name: collection.name ?? "Untitled collection",
    slug: nextSlug,
    slugHistory: normalizeSlugHistory(collection.slugHistory, nextSlug),
    description: collection.description ?? "",
    featuredImage: collection.featuredImage ?? "",
    heroMedia: collection.heroMedia ?? collection.featuredImage ?? "",
    active: collection.active ?? true,
    featured: collection.featured ?? false,
    sortOrder: collection.sortOrder ?? 0,
    seoTitle: collection.seoTitle,
    seoDescription: collection.seoDescription,
    openGraphImage: collection.openGraphImage ?? collection.featuredImage,
  };
}

function normalizeCategory(category: Partial<Category>): Category {
  const now = new Date().toISOString();
  const nextSlug = category.slug ?? slugify(category.name ?? "untitled-category");
  return {
    id: category.id ?? `cat-${crypto.randomUUID()}`,
    name: category.name ?? "Untitled category",
    slug: nextSlug,
    slugHistory: normalizeSlugHistory(category.slugHistory, nextSlug),
    shortDescription: category.shortDescription ?? category.description ?? "",
    description: category.description ?? category.shortDescription ?? "",
    featuredImage: category.featuredImage ?? "",
    heroImage: category.heroImage ?? category.featuredImage ?? "",
    mobileImage: category.mobileImage ?? category.featuredImage ?? "",
    video: category.video,
    altText: category.altText ?? category.name ?? "STONZA category",
    parentCategorySlug: category.parentCategorySlug,
    sortOrder: category.sortOrder ?? 0,
    featured: category.featured ?? false,
    active: category.active ?? true,
    status: category.status ?? (category.active === false ? "draft" : "published"),
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
    openGraphImage: category.openGraphImage ?? category.featuredImage,
    createdAt: category.createdAt ?? now,
    updatedAt: category.updatedAt ?? now,
    createdBy: category.createdBy ?? "system",
    updatedBy: category.updatedBy ?? "system",
    deletedAt: category.deletedAt,
  };
}

function normalizeManagedPage(page: Partial<ManagedPage>): ManagedPage {
  const now = new Date().toISOString();
  const nextSlug = page.slug ?? slugify(page.title ?? "page");

  return {
    id: page.id ?? `page-${crypto.randomUUID()}`,
    title: page.title ?? "Untitled page",
    slug: nextSlug,
    slugHistory: normalizeSlugHistory(page.slugHistory, nextSlug),
    heroHeading: page.heroHeading ?? page.title ?? "Untitled page",
    heroMedia: page.heroMedia,
    content: page.content ?? "",
    status: page.status ?? "draft",
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    openGraphImage: page.openGraphImage,
    updatedAt: page.updatedAt ?? now,
  };
}

function normalizeJournalPost(post: Partial<JournalPost>): JournalPost {
  const base = normalizeManagedPage(post);
  return {
    ...base,
    excerpt: post.excerpt?.trim() || "",
    publishedAt: post.publishedAt ?? new Date().toISOString(),
  };
}

function normalizeHero(hero: Partial<HeroSettings> | undefined): HeroSettings {
  const now = new Date().toISOString();
  const activeMode = hero?.activeMode ?? (hero?.mode ?? "interactive-3d");
  const interactive3d = {
    eyebrow: hero?.eyebrow ?? "Original stones. Editorial rarity.",
    heading: hero?.heading ?? "Mineral luxury shaped by time, pressure and provenance.",
    subheading:
      hero?.subheading ??
      "STONZA curates singular stones with geological authenticity and cinematic presentation.",
    description:
      hero?.description ??
      "Discover obsidian drama, quiet platinum tones and collector-grade pieces chosen for character, origin and enduring presence.",
    primaryCtaLabel: hero?.primaryCtaLabel ?? "Explore the stones",
    primaryCtaUrl: hero?.primaryCtaUrl ?? "/shop",
    secondaryCtaLabel: hero?.secondaryCtaLabel ?? "Read the provenance",
    secondaryCtaUrl: hero?.secondaryCtaUrl ?? "/authenticity",
    textAlignment: hero?.textAlignment ?? "left",
    textPosition: hero?.textPosition ?? "center",
    overlayOpacity: hero?.overlayOpacity ?? 0.46,
    heroHeight: hero?.heroHeight ?? "screen",
    showScrollIndicator: hero?.showScrollIndicator ?? true,
    model3d: hero?.model3d,
    splineUrl: hero?.splineUrl,
    backgroundImage: hero?.desktopBannerImage,
    status: "published" as const,
  };

  return {
    id: hero?.id ?? "hero-1",
    mode: activeMode,
    activeMode,
    desktopBannerImage: hero?.desktopBannerImage,
    mobileBannerImage: hero?.mobileBannerImage,
    desktopBackgroundVideo: hero?.desktopBackgroundVideo,
    mobileBackgroundVideo: hero?.mobileBackgroundVideo,
    videoPoster: hero?.videoPoster,
    model3d: hero?.model3d,
    splineUrl: hero?.splineUrl,
    eyebrow: interactive3d.eyebrow,
    heading: interactive3d.heading,
    subheading: interactive3d.subheading,
    description: interactive3d.description,
    primaryCtaLabel: interactive3d.primaryCtaLabel,
    primaryCtaUrl: interactive3d.primaryCtaUrl,
    secondaryCtaLabel: interactive3d.secondaryCtaLabel,
    secondaryCtaUrl: interactive3d.secondaryCtaUrl,
    textAlignment: interactive3d.textAlignment,
    textPosition: interactive3d.textPosition,
    overlayOpacity: interactive3d.overlayOpacity,
    focalPoint: hero?.focalPoint ?? "center",
    heroHeight: interactive3d.heroHeight,
    autoplay: hero?.autoplay ?? true,
    loop: hero?.loop ?? true,
    muted: hero?.muted ?? true,
    showControls: hero?.showControls ?? false,
    showScrollIndicator: interactive3d.showScrollIndicator,
    status: hero?.status ?? "published",
    carousel: {
      autoplay: true,
      autoplayInterval: 3000,
      loop: true,
      pauseOnHover: false,
      showArrows: false,
      showDots: true,
      transitionStyle: "fade",
      slides: hero?.carousel?.slides?.length ? hero.carousel.slides : defaultHeroSlides,
      status: hero?.carousel?.status ?? "published",
    },
    video: {
      desktopVideo: hero?.video?.desktopVideo ?? hero?.desktopBackgroundVideo,
      mobileVideo: hero?.video?.mobileVideo ?? hero?.mobileBackgroundVideo,
      posterImage: hero?.video?.posterImage ?? hero?.videoPoster,
      mobilePosterImage: hero?.video?.mobilePosterImage ?? hero?.mobileBannerImage,
      heading: hero?.video?.heading ?? interactive3d.heading,
      description: hero?.video?.description ?? interactive3d.description,
      primaryCtaLabel: hero?.video?.primaryCtaLabel ?? interactive3d.primaryCtaLabel,
      primaryCtaUrl: hero?.video?.primaryCtaUrl ?? interactive3d.primaryCtaUrl,
      secondaryCtaLabel: hero?.video?.secondaryCtaLabel ?? interactive3d.secondaryCtaLabel,
      secondaryCtaUrl: hero?.video?.secondaryCtaUrl ?? interactive3d.secondaryCtaUrl,
      textAlignment: hero?.video?.textAlignment ?? interactive3d.textAlignment,
      textPosition: hero?.video?.textPosition ?? interactive3d.textPosition,
      overlayOpacity: hero?.video?.overlayOpacity ?? interactive3d.overlayOpacity,
      autoplay: hero?.video?.autoplay ?? hero?.autoplay ?? true,
      loop: hero?.video?.loop ?? hero?.loop ?? true,
      muted: hero?.video?.muted ?? hero?.muted ?? true,
      showControls: hero?.video?.showControls ?? hero?.showControls ?? false,
      status: hero?.video?.status ?? "draft",
    },
    interactive3d: {
      ...interactive3d,
      status: hero?.interactive3d?.status ?? "published",
    },
    hybrid: {
      ...interactive3d,
      desktopImage: hero?.hybrid?.desktopImage ?? hero?.desktopBannerImage,
      mobileImage: hero?.hybrid?.mobileImage ?? hero?.mobileBannerImage,
      status: hero?.hybrid?.status ?? "draft",
    },
    updatedAt: hero?.updatedAt ?? now,
    updatedBy: hero?.updatedBy ?? "system",
  };
}

function normalizeSections(sections: StoreData["homepageSections"] | undefined): StoreData["homepageSections"] {
  const normalized = (sections ?? []).map((section) => ({
    ...section,
    eyebrow:
      section.eyebrow ??
      (section.key === "featured-collections"
        ? "Collections"
        : section.key === "featured-categories"
          ? "Categories"
          : section.key === "signature-stones"
            ? "Signature Stones"
            : section.key === "authenticity"
              ? "Authenticity"
              : "Story"),
    status: section.status ?? "published",
    updatedAt: section.updatedAt ?? "2026-07-19T00:00:00.000Z",
    updatedBy: section.updatedBy ?? "system",
  }));

  if (!normalized.some((section) => section.key === "featured-categories")) {
    normalized.unshift({
      id: "section-categories",
      key: "featured-categories",
      enabled: true,
      order: 0,
      heading: defaultLabels.homepageCategoryHeading,
      eyebrow: defaultLabels.homepageCategoryEyebrow,
      body: defaultLabels.homepageCategoryBody,
      layout: "grid",
      background: "graphite",
      ctaLabel: "Browse categories",
      ctaUrl: "/shop",
      categorySlugs: [],
      status: "published",
      updatedAt: "2026-07-19T00:00:00.000Z",
      updatedBy: "system",
    });
  }

  return normalized;
}

function normalizeStore(store: Partial<StoreData>): StoreData {
  const settings = normalizeSettings(store.settings);
  return {
    settings,
    hero: normalizeHero(
      store.hero
        ? {
            ...store.hero,
            activeMode: "carousel",
            mode: "carousel",
            carousel: {
              ...store.hero.carousel,
              autoplay: true,
              autoplayInterval: 3000,
              loop: true,
              pauseOnHover: false,
              showArrows: false,
              showDots: true,
              transitionStyle: "fade",
            },
          }
        : undefined,
    ),
    homepageSections: normalizeSections(store.homepageSections).sort((a, b) => a.order - b.order),
    categories: (store.categories ?? []).map(normalizeCategory).sort((a, b) => a.sortOrder - b.sortOrder),
    collections: (store.collections ?? []).map(normalizeCollection).sort((a, b) => a.sortOrder - b.sortOrder),
    products: (store.products ?? []).map(normalizeProduct),
    pages: (store.pages ?? []).map(normalizeManagedPage),
    journalPosts: (store.journalPosts ?? []).map(normalizeJournalPost),
    mediaAssets: (store.mediaAssets ?? []).filter((asset) => !asset.deletedAt),
    contentLabels: store.contentLabels?.length ? store.contentLabels : defaultContentLabels,
    activityLogs: (store.activityLogs ?? []) as ActivityLogEntry[],
    orders: (store.orders ?? [])
      .map((order) => ({
        ...order,
        currency: "PKR",
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

function getRequestedQuantityForProduct(
  lines: CartLineInput[],
  productId: string,
) {
  return lines.reduce((total, line) => (line.productId === productId ? total + line.quantity : total), 0);
}

async function readStore(): Promise<StoreData> {
  noStore();
  const raw = await readStoreSource();
  const parsed = JSON.parse(raw) as Partial<StoreData>;
  return normalizeStore(parsed);
}

async function writeStore(store: StoreData) {
  const payload = `${JSON.stringify(store, null, 2)}\n`;

  if (shouldUseRemoteStore()) {
    await writeRemoteStore(payload);
    return;
  }

  if (isReadOnlyRuntime()) {
    throw new Error(
      "Store mutations require remote storage on Vercel. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then create the documents bucket.",
    );
  }

  await fs.mkdir(storeRuntimeDir, { recursive: true });
  await fs.writeFile(storePath, payload, "utf8");
}

async function persistLocalMirror(payload: string) {
  if (isReadOnlyRuntime()) {
    return;
  }

  await fs.mkdir(storeRuntimeDir, { recursive: true });
  await fs.writeFile(storePath, payload, "utf8");
}

function shouldUseRemoteStore() {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

async function readLocalStore() {
  try {
    return await fs.readFile(storePath, "utf8");
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== "ENOENT") {
      throw error;
    }

    const emptyStore = `${JSON.stringify(createEmptyStore(), null, 2)}\n`;

    if (!isReadOnlyRuntime()) {
      await fs.mkdir(storeRuntimeDir, { recursive: true });
      await fs.writeFile(storePath, emptyStore, "utf8");
    }

    return emptyStore;
  }
}

async function readStoreSource() {
  if (!shouldUseRemoteStore()) {
    return readLocalStore();
  }

  try {
    const remote = await readRemoteStore();
    await persistLocalMirror(remote);
    return remote;
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("not found") || message.includes("404")) {
      const seed = await readLocalStore();
      await writeRemoteStore(seed);
      return seed;
    }

     if (!isReadOnlyRuntime() && (message.includes("fetch failed") || message.includes("timeout"))) {
      return readLocalStore();
    }

    throw error;
  }
}

async function readRemoteStore() {
  const supabase = createSupabaseAdminClient();
  await ensureRemoteStoreBucket();
  const { data, error } = await supabase.storage.from(remoteStoreBucket).download(remoteStoreObjectPath);

  if (error) {
    throw new Error(`Supabase store read failed: ${error.message}`);
  }

  return data.text();
}

async function writeRemoteStore(payload: string) {
  const supabase = createSupabaseAdminClient();
  await ensureRemoteStoreBucket();
  const { error } = await supabase.storage
    .from(remoteStoreBucket)
    .upload(remoteStoreObjectPath, Buffer.from(payload, "utf8"), {
      contentType: "application/json; charset=utf-8",
      upsert: true,
    });

  if (error) {
    if (error.message.toLowerCase().includes("bucket not found")) {
      throw new Error(
        `Supabase bucket "${remoteStoreBucket}" was not found. Create the "${remoteStoreBucket}" bucket in Supabase Storage, then try again.`,
      );
    }

    throw new Error(`Supabase store write failed: ${error.message}`);
  }

  await persistLocalMirror(payload);
}

async function ensureRemoteStoreBucket() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.getBucket(remoteStoreBucket);

  if (!error && data) {
    return;
  }

  const message = error?.message.toLowerCase() ?? "";
  if (message.includes("not found")) {
    const { error: createError } = await supabase.storage.createBucket(remoteStoreBucket, {
      public: false,
    });

    if (createError && !createError.message.toLowerCase().includes("already exists")) {
      throw new Error(`Supabase bucket "${remoteStoreBucket}" could not be created automatically: ${createError.message}`);
    }

    return;
  }

  if (error) {
    throw new Error(`Supabase bucket "${remoteStoreBucket}" could not be inspected: ${error.message}`);
  }
}

function visibleCategory(category: Category) {
  return category.active && category.status === "published" && !category.deletedAt && !isLikelyDemoRecord(category);
}

function visibleProduct(product: Product) {
  return (
    product.visibility !== "hidden" &&
    ["published", "reserved", "out_of_stock", "sold"].includes(product.status) &&
    !isLikelyDemoRecord(product)
  );
}

function visibleCollection(collection: Collection) {
  return collection.active && !isLikelyDemoRecord(collection);
}

function isLikelyDemoRecord(record: { name?: string; title?: string; featuredImage?: string; heroImage?: string; heroMedia?: string }) {
  const title = `${record.name ?? record.title ?? ""}`.toLowerCase();
  return (
    title.includes("playwright") ||
    title.includes("demo") ||
    title.includes("sample") ||
    title.includes("dummy") ||
    title.includes("placeholder") ||
    title.includes("test") ||
    isPlaceholderAsset(record.featuredImage) ||
    isPlaceholderAsset(record.heroImage) ||
    isPlaceholderAsset(record.heroMedia)
  );
}

function ensureUniqueSlug(existingSlugs: string[], preferred: string, currentId?: string, entries?: Array<{ id: string; slug: string }>) {
  const base = slugify(preferred) || "item";
  const taken = new Set(
    entries
      ? entries.filter((entry) => entry.id !== currentId).map((entry) => entry.slug)
      : existingSlugs,
  );
  if (!taken.has(base)) return base;
  let index = 2;
  while (taken.has(`${base}-${index}`)) {
    index += 1;
  }
  return `${base}-${index}`;
}

function buildCategoryNavigation(categories: Category[]) {
  const visibleCategories = categories.filter(visibleCategory).sort((a, b) => a.sortOrder - b.sortOrder);
  return visibleCategories
    .filter((category) => !category.parentCategorySlug)
    .map((category, index) => ({
      id: `nav-category-${category.id}`,
      label: category.name,
      href: `/categories/${category.slug}`,
      order: index + 1,
      visible: true,
      children: visibleCategories
        .filter((child) => child.parentCategorySlug === category.slug)
        .map((child, childIndex) => ({
          id: `nav-category-${child.id}`,
          label: child.name,
          href: `/categories/${child.slug}`,
          order: childIndex + 1,
          visible: true,
        })),
    }));
}

export async function getStoreData() {
  return readStore();
}

export async function listMediaAssets(): Promise<MediaAsset[]> {
  const store = await readStore();
  return store.mediaAssets.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function getMediaAssetById(id: string) {
  const store = await readStore();
  return store.mediaAssets.find((asset) => asset.id === id) ?? null;
}

export async function getSiteSettings() {
  const store = await readStore();
  return {
    ...store.settings,
    header: {
      ...store.settings.header,
      navigation: [
        ...buildCategoryNavigation(store.categories),
        ...store.settings.header.navigation.filter((item) => item.visible && item.href !== "/shop"),
      ],
    },
  };
}

export async function getAdminSiteSettings() {
  const store = await readStore();
  return store.settings;
}

export async function getContentLabels() {
  const store = await readStore();
  return store.contentLabels ?? defaultContentLabels;
}

export async function getLabelMap() {
  const settings = await getSiteSettings();
  return settings.labels;
}

export async function getHeroSettings(): Promise<HeroSettings> {
  const store = await readStore();
  return store.hero;
}

export async function getHomepageSections(includeDisabled = false): Promise<HomepageSection[]> {
  const store = await readStore();
  return store.homepageSections
    .filter((section) => includeDisabled || section.enabled)
    .sort((a, b) => a.order - b.order);
}

export async function listCategories(options?: {
  admin?: boolean;
  featuredOnly?: boolean;
  includeInactive?: boolean;
  search?: string;
}) {
  const store = await readStore();
  let items = store.categories;

  if (!options?.admin) {
    items = items.filter(visibleCategory);
  }

  if (!options?.includeInactive) {
    items = items.filter((category) => category.status !== "trash");
  }

  if (options?.featuredOnly) {
    items = items.filter((category) => category.featured);
  }

  if (options?.search) {
    const query = options.search.toLowerCase();
    items = items.filter((category) =>
      [category.name, category.shortDescription, category.description].join(" ").toLowerCase().includes(query),
    );
  }

  return items.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCategoryBySlug(slug: string) {
  const categories = await listCategories();
  return categories.find((category) => category.slug === slug || category.slugHistory?.includes(slug)) ?? null;
}

export async function getCategoryById(id: string) {
  const store = await readStore();
  return store.categories.find((category) => category.id === id) ?? null;
}

export async function listCollections(featuredOnly = false): Promise<Collection[]> {
  const store = await readStore();
  return store.collections
    .filter((collection) => visibleCollection(collection) && (!featuredOnly || collection.featured))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listAdminCollections(): Promise<Collection[]> {
  const store = await readStore();
  return store.collections.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCollectionBySlug(slug: string) {
  const collections = await listCollections(false);
  return collections.find((collection) => collection.slug === slug || collection.slugHistory?.includes(slug)) ?? null;
}

export async function getCollectionById(id: string) {
  const store = await readStore();
  return store.collections.find((collection) => collection.id === id) ?? null;
}

export async function listProducts(options?: {
  featuredOnly?: boolean;
  newOnly?: boolean;
  collectionSlug?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  search?: string;
}) {
  const store = await readStore();
  let items = store.products.filter(visibleProduct);

  if (options?.featuredOnly) items = items.filter((product) => product.featured);
  if (options?.newOnly) items = items.filter((product) => product.newArrival);
  if (options?.collectionSlug) items = items.filter((product) => product.collectionSlug === options.collectionSlug);
  if (options?.categorySlug) {
    items = items.filter((product) => product.categorySlugs?.includes(options.categorySlug!) || product.categorySlug === options.categorySlug);
  }
  if (options?.subcategorySlug) {
    items = items.filter((product) => product.subcategorySlug === options.subcategorySlug);
  }
  if (options?.search) {
    const query = options.search.toLowerCase();
    items = items.filter((product) =>
      [
        product.name,
        product.shortDescription,
        product.stoneType,
        product.origin,
        product.sku,
        product.variantLabel,
        ...(product.variants ?? []).map((variant) => variant.value),
        ...product.searchKeywords,
        ...(product.categorySlugs ?? []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }

  return items;
}

export async function listOrders() {
  const store = await readStore();
  return [...(store.orders ?? [])].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export async function getOrderByNumber(orderNumber: string) {
  const store = await readStore();
  return store.orders?.find((order) => order.orderNumber === orderNumber) ?? null;
}

export async function listAdminProducts() {
  const store = await readStore();
  return [...store.products].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const store = await readStore();
  return (
    store.products.find(
      (product) => visibleProduct(product) && (product.slug === slug || product.slugHistory?.includes(slug)),
    ) ?? null
  );
}

export async function getProductById(id: string): Promise<Product | null> {
  const store = await readStore();
  return store.products.find((product) => product.id === id) ?? null;
}

export async function listJournalPosts() {
  const store = await readStore();
  return store.journalPosts
    .filter((post) => post.status === "published")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function listAdminJournalPosts() {
  const store = await readStore();
  return store.journalPosts.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getJournalPostById(id: string): Promise<JournalPost | null> {
  const store = await readStore();
  return store.journalPosts.find((post) => post.id === id) ?? null;
}

export async function getJournalPostBySlug(slug: string): Promise<JournalPost | null> {
  const store = await readStore();
  return (
    store.journalPosts.find(
      (post) => (post.slug === slug || post.slugHistory?.includes(slug)) && post.status === "published",
    ) ?? null
  );
}

export async function getManagedPage(slug: string): Promise<ManagedPage | null> {
  const store = await readStore();
  return (
    store.pages.find((page) => (page.slug === slug || page.slugHistory?.includes(slug)) && page.status === "published") ??
    null
  );
}

export async function listManagedPages() {
  const store = await readStore();
  return store.pages.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getManagedPageById(id: string): Promise<ManagedPage | null> {
  const store = await readStore();
  return store.pages.find((page) => page.id === id) ?? null;
}

export async function logActivity(entry: Omit<ActivityLogEntry, "id" | "timestamp">) {
  const store = await readStore();
  const logEntry: ActivityLogEntry = {
    id: `log-${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  store.activityLogs.unshift(logEntry);
  await writeStore(store);
  return logEntry;
}

export async function upsertCategory(payload: Partial<Category> & Pick<Category, "name">) {
  const store = await readStore();
  const existing = payload.id ? store.categories.find((item) => item.id === payload.id) : null;
  const slug = resolveEntitySlug({
    requestedSlug: payload.slug,
    fallbackName: payload.name,
    existingSlug: existing?.slug,
    existingName: existing?.name,
    existingId: payload.id,
    entries: store.categories,
  });
  const nextCategory = normalizeCategory({
    ...(existing ?? {}),
    ...payload,
    slug,
    slugHistory:
      existing && existing.slug !== slug
        ? [...(payload.slugHistory ?? existing.slugHistory ?? []), existing.slug]
        : (payload.slugHistory ?? existing?.slugHistory),
  });
  const index = store.categories.findIndex((item) => item.id === nextCategory.id);

  if (index >= 0) {
    store.categories[index] = nextCategory;
  } else {
    store.categories.push(nextCategory);
  }

  if (existing && existing.slug !== nextCategory.slug) {
    store.categories = store.categories.map((item) =>
      item.parentCategorySlug === existing.slug
        ? normalizeCategory({ ...item, parentCategorySlug: nextCategory.slug, updatedAt: new Date().toISOString() })
        : item,
    );
    store.products = store.products.map((product) => {
      if (product.categorySlug !== existing.slug && !product.categorySlugs?.includes(existing.slug)) {
        return product;
      }

      const nextCategorySlugs = replaceSlugValue(product.categorySlugs ?? [product.categorySlug], existing.slug, nextCategory.slug) ?? [];
      return normalizeProduct({
        ...product,
        categorySlug: nextCategorySlugs[0] ?? nextCategory.slug,
        categorySlugs: nextCategorySlugs,
      });
    });
    store.homepageSections = store.homepageSections.map((section) => ({
      ...section,
      categorySlugs: replaceSlugValue(section.categorySlugs, existing.slug, nextCategory.slug) ?? [],
    }));
  }

  await writeStore(store);
  return nextCategory;
}

export async function updateCategoryStatus(id: string, status: Category["status"], actor: string) {
  const store = await readStore();
  const category = store.categories.find((item) => item.id === id);
  if (!category) throw new Error("Category not found");
  category.status = status;
  category.active = status === "published";
  category.deletedAt = status === "trash" ? new Date().toISOString() : undefined;
  category.updatedAt = new Date().toISOString();
  category.updatedBy = actor;
  await writeStore(store);
  return category;
}

export async function duplicateCategory(id: string, actor: string) {
  const store = await readStore();
  const original = store.categories.find((item) => item.id === id);
  if (!original) throw new Error("Category not found");
  const clone = normalizeCategory({
    ...original,
    id: `cat-${crypto.randomUUID()}`,
    name: `${original.name} Copy`,
    slug: `${original.slug}-copy`,
    status: "draft",
    active: false,
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: actor,
    updatedBy: actor,
  });
  store.categories.push(clone);
  await writeStore(store);
  return clone;
}

export async function upsertCollection(payload: Omit<Collection, "id" | "slug"> & { id?: string; slug?: string }) {
  const store = await readStore();
  const existing = payload.id ? store.collections.find((item) => item.id === payload.id) : null;
  const id = payload.id ?? `col-${crypto.randomUUID()}`;
  const slug = resolveEntitySlug({
    requestedSlug: payload.slug,
    fallbackName: payload.name,
    existingSlug: existing?.slug,
    existingName: existing?.name,
    existingId: payload.id,
    entries: store.collections,
  });
  const nextCollection: Collection = normalizeCollection({
    ...(existing ?? {}),
    ...payload,
    id,
    slug,
    slugHistory:
      existing && existing.slug !== slug
        ? [...(payload.slugHistory ?? existing.slugHistory ?? []), existing.slug]
        : (payload.slugHistory ?? existing?.slugHistory),
  });
  const index = store.collections.findIndex((item) => item.id === id);

  if (index >= 0) {
    store.collections[index] = nextCollection;
  } else {
    store.collections.push(nextCollection);
  }

  if (existing && existing.slug !== nextCollection.slug) {
    store.products = store.products.map((product) =>
      product.collectionSlug === existing.slug
        ? normalizeProduct({ ...product, collectionSlug: nextCollection.slug })
        : product,
    );
    store.homepageSections = store.homepageSections.map((section) => ({
      ...section,
      collectionSlugs: replaceSlugValue(section.collectionSlugs, existing.slug, nextCollection.slug) ?? [],
    }));
  }

  await writeStore(store);
  return nextCollection;
}

export async function upsertHero(payload: HeroSettings) {
  const store = await readStore();
  store.hero = normalizeHero(payload);
  await writeStore(store);
  return store.hero;
}

export async function updateHomepageSections(sections: HomepageSection[]) {
  const store = await readStore();
  store.homepageSections = normalizeSections(sections);
  await writeStore(store);
  return store.homepageSections;
}

export async function updateSiteSettings(settings: SiteSettings) {
  const store = await readStore();
  store.settings = normalizeSettings(settings);
  await writeStore(store);
  return store.settings;
}

export async function updateContentLabels(labels: ContentLabel[]) {
  const store = await readStore();
  store.contentLabels = labels;
  store.settings.labels = labels.reduce<Record<string, string>>((acc, label) => {
    acc[label.key] = label.label;
    return acc;
  }, {});
  await writeStore(store);
  return store.contentLabels;
}

export async function upsertProduct(payload: Product) {
  const store = await readStore();
  const existing = payload.id ? store.products.find((item) => item.id === payload.id) : null;
  const slug = resolveEntitySlug({
    requestedSlug: payload.slug,
    fallbackName: payload.name,
    existingSlug: existing?.slug,
    existingName: existing?.name,
    existingId: payload.id,
    entries: store.products,
  });
  const nextProduct = normalizeProduct({
    ...(existing ?? {}),
    ...payload,
    slug,
    slugHistory:
      existing && existing.slug !== slug
        ? [...(payload.slugHistory ?? existing.slugHistory ?? []), existing.slug]
        : (payload.slugHistory ?? existing?.slugHistory),
  });
  const index = store.products.findIndex((product) => product.id === nextProduct.id);

  if (index >= 0) {
    store.products[index] = nextProduct;
  } else {
    store.products.push(nextProduct);
  }

  if (existing && existing.slug !== nextProduct.slug) {
    store.products = store.products.map((product) =>
      product.id === nextProduct.id
        ? product
        : normalizeProduct({
            ...product,
            relatedProductSlugs: replaceSlugValue(product.relatedProductSlugs, existing.slug, nextProduct.slug) ?? [],
          }),
    );
    store.homepageSections = store.homepageSections.map((section) => ({
      ...section,
      productSlugs: replaceSlugValue(section.productSlugs, existing.slug, nextProduct.slug) ?? [],
    }));
  }

  await writeStore(store);
  return nextProduct;
}

export async function duplicateProduct(id: string) {
  const store = await readStore();
  const original = store.products.find((entry) => entry.id === id);
  if (!original) throw new Error("Product not found");

  const clone = normalizeProduct({
    ...original,
    id: `prd-${crypto.randomUUID()}`,
    name: `${original.name} Copy`,
    slug: `${original.slug}-copy`,
    sku: `${original.sku}-COPY`,
    status: "draft",
    visibility: "hidden",
    featured: false,
    newArrival: false,
    bestseller: false,
    inventoryQuantity: original.inventoryQuantity,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  store.products.unshift(clone);
  await writeStore(store);
  return clone;
}

export async function adjustProductInventory(id: string, delta: number) {
  const store = await readStore();
  const product = store.products.find((entry) => entry.id === id);
  if (!product) {
    throw new Error("Product not found");
  }

  const nextQuantity = Math.max(0, product.inventoryQuantity + delta);
  product.inventoryQuantity = nextQuantity;

  if (nextQuantity <= 0) {
    product.status = "out_of_stock";
  } else if (product.status === "out_of_stock") {
    product.status = "published";
  }

  product.updatedAt = new Date().toISOString();
  await writeStore(store);
  return product;
}

export async function upsertManagedPage(payload: Partial<ManagedPage> & Pick<ManagedPage, "title" | "slug" | "content" | "heroHeading" | "status">) {
  const store = await readStore();
  const existing = payload.id ? store.pages.find((item) => item.id === payload.id) : null;
  const slug = resolveEntitySlug({
    requestedSlug: payload.slug,
    fallbackName: payload.title,
    existingSlug: existing?.slug,
    existingName: existing?.title,
    existingId: payload.id,
    entries: store.pages,
  });
  const nextPage = normalizeManagedPage({
    ...(existing ?? {}),
    ...payload,
    slug,
    slugHistory:
      existing && existing.slug !== slug
        ? [...(payload.slugHistory ?? existing.slugHistory ?? []), existing.slug]
        : (payload.slugHistory ?? existing?.slugHistory),
  });
  const index = store.pages.findIndex((page) => page.id === nextPage.id);

  if (index >= 0) {
    store.pages[index] = nextPage;
  } else {
    store.pages.push(nextPage);
  }

  if (existing && existing.slug !== nextPage.slug) {
    const previousPath = `/${existing.slug}`;
    const nextPath = `/${nextPage.slug}`;
    store.settings = normalizeSettings({
      ...store.settings,
      header: {
        ...store.settings.header,
        navigation: replaceNavigationHref(store.settings.header.navigation, previousPath, nextPath),
      },
      footer: {
        ...store.settings.footer,
        legalLinks: replaceNavigationHref(store.settings.footer.legalLinks, previousPath, nextPath),
        sections: store.settings.footer.sections.map((section) => ({
          ...section,
          links: section.links.map((link) => ({
            ...link,
            href: link.href === previousPath ? nextPath : link.href,
          })),
        })),
      },
      announcement: {
        ...store.settings.announcement,
        link: store.settings.announcement.link === previousPath ? nextPath : store.settings.announcement.link,
      },
      contactButton: {
        ...store.settings.contactButton,
        destination:
          store.settings.contactButton.destination === previousPath
            ? nextPath
            : store.settings.contactButton.destination,
      },
    });
  }

  await writeStore(store);
  return nextPage;
}

export async function upsertJournalPost(
  payload: Partial<JournalPost> &
    Pick<JournalPost, "title" | "slug" | "content" | "heroHeading" | "status" | "excerpt" | "publishedAt">,
) {
  const store = await readStore();
  const existing = payload.id ? store.journalPosts.find((item) => item.id === payload.id) : null;
  const slug = resolveEntitySlug({
    requestedSlug: payload.slug,
    fallbackName: payload.title,
    existingSlug: existing?.slug,
    existingName: existing?.title,
    existingId: payload.id,
    entries: store.journalPosts,
  });
  const nextPost = normalizeJournalPost({
    ...(existing ?? {}),
    ...payload,
    slug,
    slugHistory:
      existing && existing.slug !== slug
        ? [...(payload.slugHistory ?? existing.slugHistory ?? []), existing.slug]
        : (payload.slugHistory ?? existing?.slugHistory),
  });
  const index = store.journalPosts.findIndex((post) => post.id === nextPost.id);

  if (index >= 0) {
    store.journalPosts[index] = nextPost;
  } else {
    store.journalPosts.push(nextPost);
  }

  await writeStore(store);
  return nextPost;
}

export async function deleteCollection(id: string) {
  const store = await readStore();
  const collection = store.collections.find((item) => item.id === id);
  if (!collection) throw new Error("Collection not found");

  store.collections = store.collections.filter((item) => item.id !== id);
  store.products = store.products.map((product) =>
    product.collectionSlug === collection.slug ? normalizeProduct({ ...product, collectionSlug: "" }) : product,
  );

  await writeStore(store);
  return collection;
}

export async function deleteManagedPage(id: string) {
  const store = await readStore();
  const page = store.pages.find((entry) => entry.id === id);
  if (!page) throw new Error("Page not found");

  store.pages = store.pages.filter((entry) => entry.id !== id);
  await writeStore(store);
  return page;
}

export async function deleteJournalPost(id: string) {
  const store = await readStore();
  const post = store.journalPosts.find((entry) => entry.id === id);
  if (!post) throw new Error("Journal post not found");

  store.journalPosts = store.journalPosts.filter((entry) => entry.id !== id);
  await writeStore(store);
  return post;
}

export async function assignProductsToCollection(collectionSlug: string, productSlugs: string[]) {
  const store = await readStore();
  const selected = new Set(productSlugs);
  store.products = store.products.map((product) => {
    if (product.collectionSlug === collectionSlug && !selected.has(product.slug)) {
      return normalizeProduct({ ...product, collectionSlug: "" });
    }

    if (selected.has(product.slug)) {
      return normalizeProduct({ ...product, collectionSlug });
    }

    return product;
  });

  await writeStore(store);
}

export async function assignProductsToCategory(categorySlug: string, productSlugs: string[]) {
  const store = await readStore();
  const category = store.categories.find((item) => item.slug === categorySlug);

  if (!category) {
    throw new Error("Category not found");
  }

  const selected = new Set(productSlugs);
  store.products = store.products.map((product) => {
    const currentCategorySlugs = [...new Set(product.categorySlugs?.length ? product.categorySlugs : [product.categorySlug])];
    const belongsToCategory = currentCategorySlugs.includes(categorySlug);

    if (selected.has(product.slug) && !belongsToCategory) {
      const nextCategorySlugs = [...currentCategorySlugs, categorySlug];
      return normalizeProduct({
        ...product,
        categorySlug: nextCategorySlugs[0] ?? categorySlug,
        categorySlugs: nextCategorySlugs,
      });
    }

    if (!selected.has(product.slug) && belongsToCategory) {
      const nextCategorySlugs = currentCategorySlugs.filter((slug) => slug !== categorySlug);
      return normalizeProduct({
        ...product,
        categorySlug: nextCategorySlugs[0] ?? "",
        categorySlugs: nextCategorySlugs,
      });
    }

    return product;
  });

  await writeStore(store);
}

export async function deleteProduct(id: string) {
  const store = await readStore();
  const product = store.products.find((entry) => entry.id === id);
  if (!product) throw new Error("Product not found");

  store.products = store.products.filter((entry) => entry.id !== id);
  await writeStore(store);
  return product;
}

export async function addMediaAsset(asset: MediaAsset) {
  const store = await readStore();
  store.mediaAssets.unshift(asset);
  await writeStore(store);
  return asset;
}

export async function updateMediaAsset(id: string, updates: Partial<MediaAsset>) {
  const store = await readStore();
  const asset = store.mediaAssets.find((entry) => entry.id === id);
  if (!asset) throw new Error("Media asset not found");
  Object.assign(asset, updates);
  await writeStore(store);
  return asset;
}

export async function deleteMediaAsset(id: string) {
  const store = await readStore();
  const asset = store.mediaAssets.find((entry) => entry.id === id);
  if (!asset) throw new Error("Media asset not found");
  asset.deletedAt = new Date().toISOString();
  await writeStore(store);
  return asset;
}

export async function setProductStatus(id: string, status: Product["status"]) {
  const store = await readStore();
  const product = store.products.find((entry) => entry.id === id);

  if (!product) {
    throw new Error("Product not found");
  }

  product.status = status;
  product.updatedAt = new Date().toISOString();
  await writeStore(store);
  return product;
}

export async function createOrder(payload: {
  customer: CustomerOrderDetails;
  cartLines: CartLineInput[];
  paymentMethod: string;
  submissionToken?: string;
}) {
  const store = await readStore();
  const existingOrder = payload.submissionToken
    ? (store.orders ?? []).find((order) => order.submissionToken === payload.submissionToken)
    : null;

  if (existingOrder) {
    return existingOrder;
  }

  const requestedQuantities = new Map<string, number>();
  for (const line of payload.cartLines) {
    requestedQuantities.set(line.productId, getRequestedQuantityForProduct(payload.cartLines, line.productId));
  }

  const lines = payload.cartLines.map((line) => {
    const product = store.products.find((entry) => entry.id === line.productId);
    if (!product) {
      throw new Error("A product in your cart is no longer available.");
    }

    if (!visibleProduct(product) || !product.allowCartPurchase) {
      throw new Error(`${product.name} is not currently available for checkout.`);
    }

    const requestedQuantity = requestedQuantities.get(product.id) ?? line.quantity;

    if (product.oneOfOne && requestedQuantity > 1) {
      throw new Error(`${product.name} is a one-of-one piece and can only be ordered once.`);
    }

    if (product.inventoryQuantity < requestedQuantity) {
      throw new Error(`Only ${product.inventoryQuantity} unit(s) of ${product.name} remain in stock.`);
    }

    if (product.sizes?.length && !line.selectedSize) {
      throw new Error(`Please select a size for ${product.name}.`);
    }

    if (line.selectedSize && product.sizes?.length && !product.sizes.includes(line.selectedSize)) {
      throw new Error(`The selected size for ${product.name} is unavailable.`);
    }

    if (product.variants?.length && !line.selectedVariant) {
      throw new Error(`Please select a ${product.variantLabel?.toLowerCase() || "variant"} for ${product.name}.`);
    }

    if (
      line.selectedVariant &&
      product.variants?.length &&
      !product.variants.some((variant) => variant.active && variant.value === line.selectedVariant)
    ) {
      throw new Error(`The selected ${product.variantLabel?.toLowerCase() || "variant"} for ${product.name} is unavailable.`);
    }

    return { product, line };
  });

  const subtotal = lines.reduce((total, entry) => total + getEffectivePrice(entry.product) * entry.line.quantity, 0);
  const shipping = subtotal > 0 ? 0 : 0;
  const discount = 0;
  const total = subtotal + shipping - discount;
  const now = new Date().toISOString();
  const orderNumber = generateOrderNumber(store.orders ?? []);
  const items: OrderItem[] = lines.map(({ product, line }) => ({
    id: `item-${crypto.randomUUID()}`,
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    sku: product.sku,
    image: product.featuredImage,
    quantity: line.quantity,
    unitPrice: getEffectivePrice(product),
    selectedSize: line.selectedSize,
    selectedVariant: line.selectedVariant,
  }));

  for (const { product, line } of lines) {
    product.inventoryQuantity -= line.quantity;
    if (product.inventoryQuantity <= 0) {
      product.inventoryQuantity = 0;
      product.status = "out_of_stock";
    }
    product.updatedAt = now;
  }

  const order: OrderRecord = {
    id: `ord-${crypto.randomUUID()}`,
    orderNumber,
    submissionToken: payload.submissionToken,
    status: "pending",
    paymentStatus: payload.paymentMethod.toLowerCase().includes("cash") ? "cod" : "pending",
    paymentMethod: payload.paymentMethod,
    currency: "PKR",
    subtotal,
    shipping,
    discount,
    total,
    items,
    customer: payload.customer,
    createdAt: now,
    updatedAt: now,
  };

  store.activityLogs.unshift({
    id: `log-${crypto.randomUUID()}`,
    action: "order_created",
    actor: payload.customer.email,
    entity: "order",
    entityId: order.id,
    detail: order.orderNumber,
    timestamp: now,
  });
  store.orders = [order, ...(store.orders ?? [])];
  await writeStore(store);
  return order;
}

export async function updateOrderStatus(orderNumber: string, status: OrderRecord["status"]) {
  const store = await readStore();
  const order = store.orders?.find((entry) => entry.orderNumber === orderNumber);
  if (!order) {
    throw new Error("Order not found");
  }
  if (status === "cancelled" && order.status !== "cancelled") {
    for (const item of order.items) {
      const product = store.products.find((entry) => entry.id === item.productId);
      if (!product) continue;
      product.inventoryQuantity += item.quantity;
      if (["out_of_stock", "sold"].includes(product.status) && product.inventoryQuantity > 0) {
        product.status = "published";
      }
      product.updatedAt = new Date().toISOString();
    }
  }
  order.status = status;
  order.updatedAt = new Date().toISOString();
  await writeStore(store);
  return order;
}

function generateOrderNumber(existingOrders: OrderRecord[]) {
  const today = new Date();
  const y = today.getUTCFullYear();
  const m = String(today.getUTCMonth() + 1).padStart(2, "0");
  const d = String(today.getUTCDate()).padStart(2, "0");
  const prefix = `STZ-${y}${m}${d}`;
  const count = existingOrders.filter((order) => order.orderNumber.startsWith(prefix)).length + 1;
  return `${prefix}-${String(count).padStart(3, "0")}`;
}
