import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  ActivityLogEntry,
  Category,
  Collection,
  ContentLabel,
  FooterSection,
  HeroSettings,
  HomepageSection,
  JournalPost,
  ManagedPage,
  MediaAsset,
  NavigationItem,
  Product,
  ProductMediaItem,
  SiteSettings,
  StoreData,
} from "@/types/domain";
import { slugify } from "@/lib/utils";
import { env } from "@/lib/env";

const storePath = path.join(process.cwd(), "src", "data", "dev-store.json");
const remoteStoreBucket = "documents";
const remoteStoreObjectPath = "runtime/dev-store.json";

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
  productWhatsappLabel: "WhatsApp Concierge",
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

const defaultHeroSlides = [
  {
    id: "slide-1",
    desktopImage: "/placeholders/hero-strata.svg",
    mobileImage: "/placeholders/hero-strata-mobile.svg",
    eyebrow: "Original stones. Editorial rarity.",
    heading: "Mineral luxury shaped by time, pressure and provenance.",
    description:
      "Discover obsidian drama, quiet platinum tones and collector-grade pieces chosen for character, origin and enduring presence.",
    primaryCtaLabel: "Explore the stones",
    primaryCtaUrl: "/shop",
    secondaryCtaLabel: "Read the provenance",
    secondaryCtaUrl: "/authenticity",
    textAlignment: "left" as const,
    textPosition: "center" as const,
    overlayOpacity: 0.46,
    focalPoint: "center",
    active: true,
    sortOrder: 1,
  },
];

function defaultSettings(): SiteSettings {
  return {
    siteTitle: "STONZA",
    siteDescription:
      "Original natural stones, elevated through cinematic curation and authentic provenance.",
    whatsappNumber: "+923001112233",
    email: "atelier@stonza.pk",
    address: "Lahore Design District, Pakistan",
    businessHours: "Mon-Sat, 10:00-19:00",
    currency: "USD",
    maintenanceMode: false,
    checkoutMode: "standard",
    shippingText:
      "White-glove regional delivery and protected worldwide dispatch for verified orders.",
    returnsText:
      "Returns are reviewed case-by-case for natural one-of-one stones after condition inspection.",
    lowStockDefault: 1,
    announcement: {
      enabled: true,
      text: "Private sourcing appointments now open for the July 2026 collection release.",
      linkLabel: "Book now",
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
        label: "WhatsApp Concierge",
        destination: "/contact",
        enabled: true,
      },
      navigation: defaultNavigation,
    },
    footer: {
      description:
        "Natural stones selected for provenance, atmosphere and enduring presence. STONZA pairs editorial curation with transparent authenticity.",
      newsletterHeading: "Private release notes",
      newsletterBody: "Receive quiet release alerts, sourcing notes and collector updates.",
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
      label: "WhatsApp Concierge",
      destination: "/contact",
      enabled: true,
    },
  };
}

function normalizeSettings(settings: Partial<SiteSettings> | undefined): SiteSettings {
  const defaults = defaultSettings();
  return {
    ...defaults,
    ...settings,
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

function normalizeProduct(product: Partial<Product>): Product {
  const media = normalizeProductMedia(product);
  const featuredItem = media.find((item) => item.featured) ?? media[0];
  const categorySlugs = product.categorySlugs?.length
    ? [...new Set(product.categorySlugs)]
    : product.categorySlug
      ? [product.categorySlug]
      : [];

  return {
    id: product.id ?? `prd-${crypto.randomUUID()}`,
    name: product.name ?? "Untitled stone",
    slug: product.slug ?? slugify(product.name ?? "untitled-stone"),
    sku: product.sku ?? "STONZA-DRAFT",
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    price: product.price ?? 0,
    salePrice: product.salePrice,
    currency: product.currency ?? "USD",
    costPrice: product.costPrice ?? 0,
    inventoryQuantity: product.inventoryQuantity ?? 0,
    lowStockThreshold: product.lowStockThreshold ?? 1,
    oneOfOne: product.oneOfOne ?? false,
    allowEnquiry: product.allowEnquiry ?? true,
    allowCartPurchase: product.allowCartPurchase ?? true,
    stoneType: product.stoneType ?? "",
    categorySlug: categorySlugs[0] ?? product.categorySlug ?? "",
    categorySlugs,
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
    featuredImage: featuredItem?.url ?? product.featuredImage ?? "/placeholders/product-obsidian.svg",
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

function normalizeCategory(category: Partial<Category>): Category {
  const now = new Date().toISOString();
  return {
    id: category.id ?? `cat-${crypto.randomUUID()}`,
    name: category.name ?? "Untitled category",
    slug: category.slug ?? slugify(category.name ?? "untitled-category"),
    shortDescription: category.shortDescription ?? category.description ?? "",
    description: category.description ?? category.shortDescription ?? "",
    featuredImage: category.featuredImage ?? "/placeholders/category-statement.svg",
    heroImage: category.heroImage ?? category.featuredImage ?? "/placeholders/category-statement.svg",
    mobileImage: category.mobileImage ?? category.featuredImage ?? "/placeholders/category-statement.svg",
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
    backgroundImage: hero?.desktopBannerImage ?? "/placeholders/hero-strata.svg",
    status: "published" as const,
  };

  return {
    id: hero?.id ?? "hero-1",
    mode: activeMode,
    activeMode,
    desktopBannerImage: hero?.desktopBannerImage ?? "/placeholders/hero-strata.svg",
    mobileBannerImage: hero?.mobileBannerImage ?? "/placeholders/hero-strata-mobile.svg",
    desktopBackgroundVideo: hero?.desktopBackgroundVideo,
    mobileBackgroundVideo: hero?.mobileBackgroundVideo,
    videoPoster: hero?.videoPoster ?? "/placeholders/hero-poster.svg",
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
      autoplayInterval: 6500,
      loop: true,
      pauseOnHover: true,
      showArrows: true,
      showDots: true,
      transitionStyle: "fade",
      slides: hero?.carousel?.slides?.length ? hero.carousel.slides : defaultHeroSlides,
      status: hero?.carousel?.status ?? "published",
    },
    video: {
      desktopVideo: hero?.video?.desktopVideo ?? hero?.desktopBackgroundVideo,
      mobileVideo: hero?.video?.mobileVideo ?? hero?.mobileBackgroundVideo,
      posterImage: hero?.video?.posterImage ?? hero?.videoPoster ?? "/placeholders/hero-poster.svg",
      mobilePosterImage: hero?.video?.mobilePosterImage ?? hero?.mobileBannerImage ?? "/placeholders/hero-poster.svg",
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
      desktopImage: hero?.hybrid?.desktopImage ?? hero?.desktopBannerImage ?? "/placeholders/hero-strata.svg",
      mobileImage: hero?.hybrid?.mobileImage ?? hero?.mobileBannerImage ?? "/placeholders/hero-strata-mobile.svg",
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
    hero: normalizeHero(store.hero),
    homepageSections: normalizeSections(store.homepageSections).sort((a, b) => a.order - b.order),
    categories: (store.categories ?? []).map(normalizeCategory).sort((a, b) => a.sortOrder - b.sortOrder),
    collections: (store.collections ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
    products: (store.products ?? []).map(normalizeProduct),
    pages: store.pages ?? [],
    journalPosts: store.journalPosts ?? [],
    mediaAssets: (store.mediaAssets ?? []).filter((asset) => !asset.deletedAt),
    contentLabels: store.contentLabels?.length ? store.contentLabels : defaultContentLabels,
    activityLogs: (store.activityLogs ?? []) as ActivityLogEntry[],
  };
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

  const tempPath = `${storePath}.tmp`;
  await fs.writeFile(tempPath, payload, "utf8");
  await fs.rename(tempPath, storePath);
}

function shouldUseRemoteStore() {
  return Boolean(process.env.VERCEL && env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

async function readLocalStore() {
  return fs.readFile(storePath, "utf8");
}

async function readStoreSource() {
  if (!shouldUseRemoteStore()) {
    return readLocalStore();
  }

  try {
    return await readRemoteStore();
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("not found") || message.includes("404")) {
      const seed = await readLocalStore();
      await writeRemoteStore(seed);
      return seed;
    }

    throw error;
  }
}

async function readRemoteStore() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(remoteStoreBucket).download(remoteStoreObjectPath);

  if (error) {
    throw new Error(`Supabase store read failed: ${error.message}`);
  }

  return data.text();
}

async function writeRemoteStore(payload: string) {
  const supabase = createSupabaseAdminClient();
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
}

function visibleCategory(category: Category) {
  return category.active && category.status === "published" && !category.deletedAt;
}

function visibleProduct(product: Product) {
  return ["published", "reserved", "out_of_stock", "sold"].includes(product.status);
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
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getCategoryById(id: string) {
  const store = await readStore();
  return store.categories.find((category) => category.id === id) ?? null;
}

export async function listCollections(featuredOnly = false): Promise<Collection[]> {
  const store = await readStore();
  return store.collections
    .filter((collection) => collection.active && (!featuredOnly || collection.featured))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCollectionBySlug(slug: string) {
  const collections = await listCollections(false);
  return collections.find((collection) => collection.slug === slug) ?? null;
}

export async function listProducts(options?: {
  featuredOnly?: boolean;
  newOnly?: boolean;
  collectionSlug?: string;
  categorySlug?: string;
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
  if (options?.search) {
    const query = options.search.toLowerCase();
    items = items.filter((product) =>
      [
        product.name,
        product.shortDescription,
        product.stoneType,
        product.origin,
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

export async function listAdminProducts() {
  const store = await readStore();
  return store.products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const store = await readStore();
  return store.products.find((product) => product.slug === slug) ?? null;
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

export async function getJournalPostBySlug(slug: string): Promise<JournalPost | null> {
  const store = await readStore();
  return store.journalPosts.find((post) => post.slug === slug && post.status === "published") ?? null;
}

export async function getManagedPage(slug: string): Promise<ManagedPage | null> {
  const store = await readStore();
  return store.pages.find((page) => page.slug === slug && page.status === "published") ?? null;
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
  const nextCategory = normalizeCategory(payload);
  const index = store.categories.findIndex((item) => item.id === nextCategory.id);

  if (index >= 0) {
    store.categories[index] = nextCategory;
  } else {
    store.categories.push(nextCategory);
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
  const id = payload.id ?? `col-${crypto.randomUUID()}`;
  const slug = payload.slug || slugify(payload.name);
  const nextCollection: Collection = { ...payload, id, slug };
  const index = store.collections.findIndex((item) => item.id === id);

  if (index >= 0) {
    store.collections[index] = nextCollection;
  } else {
    store.collections.push(nextCollection);
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
  const nextProduct = normalizeProduct(payload);
  const index = store.products.findIndex((product) => product.id === nextProduct.id);

  if (index >= 0) {
    store.products[index] = nextProduct;
  } else {
    store.products.push(nextProduct);
  }

  await writeStore(store);
  return nextProduct;
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
