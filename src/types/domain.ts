export type ProductStatus =
  | "draft"
  | "published"
  | "scheduled"
  | "reserved"
  | "out_of_stock"
  | "sold"
  | "archived"
  | "trash";

export type ContentStatus = "draft" | "published" | "archived" | "trash";

export type HeroMode = "carousel" | "video" | "interactive-3d" | "hybrid";

export type AdminRole =
  | "owner"
  | "administrator"
  | "product_manager"
  | "content_editor"
  | "order_manager"
  | "inventory_manager";

export type MediaType = "image" | "video" | "document" | "model" | "brand";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  order: number;
  visible: boolean;
  children?: NavigationItem[];
}

export interface FooterSection {
  id: string;
  title: string;
  order: number;
  links: Array<{
    id: string;
    label: string;
    href: string;
  }>;
}

export interface ContentLabel {
  id: string;
  key: string;
  label: string;
  description?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  featuredImage: string;
  heroImage?: string;
  mobileImage?: string;
  video?: string;
  altText: string;
  parentCategorySlug?: string;
  sortOrder: number;
  featured: boolean;
  active: boolean;
  status: ContentStatus;
  seoTitle?: string;
  seoDescription?: string;
  openGraphImage?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  deletedAt?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  featuredImage: string;
  heroMedia: string;
  active: boolean;
  featured: boolean;
  sortOrder: number;
}

export interface ProductMediaItem {
  id: string;
  assetId?: string;
  url: string;
  altText: string;
  fileName: string;
  size: number;
  featured: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  price: number;
  salePrice?: number;
  currency: string;
  costPrice?: number;
  inventoryQuantity: number;
  lowStockThreshold: number;
  oneOfOne: boolean;
  allowEnquiry: boolean;
  allowCartPurchase: boolean;
  stoneType: string;
  categorySlug: string;
  categorySlugs?: string[];
  collectionSlug: string;
  weight: string;
  carat: number;
  dimensions: string;
  shape: string;
  cut: string;
  color: string;
  clarity: string;
  origin: string;
  naturalOrTreated: "natural" | "treated";
  treatmentDetails: string;
  certificationAuthority?: string;
  certificateNumber?: string;
  certificateImage?: string;
  certificatePdf?: string;
  featuredImage: string;
  galleryImages: string[];
  media?: ProductMediaItem[];
  productVideo?: string;
  video360?: string;
  model3d?: string;
  splineUrl?: string;
  altText: string;
  featured: boolean;
  newArrival: boolean;
  bestseller: boolean;
  relatedProductSlugs: string[];
  tags: string[];
  searchKeywords: string[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalOverride?: string;
  openGraphImage?: string;
  privateNotes?: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlide {
  id: string;
  desktopImage?: string;
  mobileImage?: string;
  eyebrow: string;
  heading: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  textAlignment: "left" | "center";
  textPosition: "start" | "center" | "end";
  overlayOpacity: number;
  focalPoint: string;
  active: boolean;
  sortOrder: number;
}

export interface HeroVideoConfig {
  desktopVideo?: string;
  mobileVideo?: string;
  posterImage?: string;
  mobilePosterImage?: string;
  heading: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  textAlignment: "left" | "center";
  textPosition: "start" | "center" | "end";
  overlayOpacity: number;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  showControls: boolean;
  status: "draft" | "published" | "incomplete";
}

export interface HeroThreeConfig {
  eyebrow: string;
  heading: string;
  subheading: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  textAlignment: "left" | "center";
  textPosition: "start" | "center" | "end";
  overlayOpacity: number;
  heroHeight: "screen" | "large" | "medium";
  showScrollIndicator: boolean;
  model3d?: string;
  splineUrl?: string;
  backgroundImage?: string;
  status: "draft" | "published" | "incomplete";
}

export interface HeroSettings {
  id: string;
  mode: HeroMode;
  activeMode: HeroMode;
  desktopBannerImage?: string;
  mobileBannerImage?: string;
  desktopBackgroundVideo?: string;
  mobileBackgroundVideo?: string;
  videoPoster?: string;
  model3d?: string;
  splineUrl?: string;
  eyebrow: string;
  heading: string;
  subheading: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  textAlignment: "left" | "center";
  textPosition: "start" | "center" | "end";
  overlayOpacity: number;
  focalPoint: string;
  heroHeight: "screen" | "large" | "medium";
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  showControls: boolean;
  showScrollIndicator: boolean;
  status: "draft" | "published";
  carousel: {
    autoplay: boolean;
    autoplayInterval: number;
    loop: boolean;
    pauseOnHover: boolean;
    showArrows: boolean;
    showDots: boolean;
    transitionStyle: "fade" | "slide";
    slides: HeroSlide[];
    status: "draft" | "published" | "incomplete";
  };
  video: HeroVideoConfig;
  interactive3d: HeroThreeConfig;
  hybrid: HeroThreeConfig & {
    desktopImage?: string;
    mobileImage?: string;
  };
  updatedAt: string;
  updatedBy: string;
}

export interface HomepageSection {
  id: string;
  key: string;
  enabled: boolean;
  order: number;
  heading: string;
  eyebrow?: string;
  body: string;
  layout: string;
  background: string;
  ctaLabel?: string;
  ctaUrl?: string;
  productSlugs?: string[];
  collectionSlugs?: string[];
  categorySlugs?: string[];
  testimonial?: string;
  media?: string;
  status?: "draft" | "published";
  updatedAt?: string;
  updatedBy?: string;
}

export interface ManagedPage {
  id: string;
  title: string;
  slug: string;
  heroHeading: string;
  heroMedia?: string;
  content: string;
  status: "draft" | "published";
  seoTitle?: string;
  seoDescription?: string;
  openGraphImage?: string;
  updatedAt: string;
}

export interface JournalPost extends ManagedPage {
  excerpt: string;
  publishedAt: string;
}

export interface MediaAsset {
  id: string;
  type: MediaType;
  path: string;
  publicUrl: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: string;
  usage: string[];
  deletedAt?: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  whatsappNumber: string;
  email: string;
  address: string;
  businessHours: string;
  currency: string;
  maintenanceMode: boolean;
  checkoutMode: "standard" | "enquiry_only" | "disabled";
  shippingText: string;
  returnsText: string;
  lowStockDefault: number;
  announcement: {
    enabled: boolean;
    text: string;
    linkLabel?: string;
    link?: string;
    backgroundStyle?: "graphite" | "ivory" | "accent";
  };
  brand: {
    name: string;
    tagline: string;
    logo: string;
    lightLogo: string;
    favicon: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      surface: string;
    };
    headingFont: string;
    bodyFont: string;
  };
  header: {
    style: "transparent" | "solid";
    sticky: boolean;
    showSearch: boolean;
    showWishlist: boolean;
    showCart: boolean;
    contactButton: {
      label: string;
      destination: string;
      enabled: boolean;
    };
    navigation: NavigationItem[];
  };
  footer: {
    description: string;
    newsletterHeading: string;
    newsletterBody: string;
    copyright: string;
    legalLinks: NavigationItem[];
    sections: FooterSection[];
  };
  social: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    pinterest?: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    defaultOgImage: string;
  };
  labels: Record<string, string>;
  contactButton: {
    label: string;
    destination: string;
    enabled: boolean;
  };
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  actor: string;
  entity: string;
  entityId: string;
  timestamp: string;
  detail?: string;
}

export interface StoreData {
  settings: SiteSettings;
  hero: HeroSettings;
  homepageSections: HomepageSection[];
  categories: Category[];
  collections: Collection[];
  products: Product[];
  pages: ManagedPage[];
  journalPosts: JournalPost[];
  mediaAssets: MediaAsset[];
  contentLabels?: ContentLabel[];
  activityLogs: ActivityLogEntry[];
}
