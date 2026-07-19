export type ProductStatus =
  | "draft"
  | "published"
  | "scheduled"
  | "reserved"
  | "out_of_stock"
  | "sold"
  | "archived"
  | "trash";

export type HeroMode = "image" | "video" | "interactive-3d" | "hybrid";

export type AdminRole =
  | "owner"
  | "administrator"
  | "product_manager"
  | "content_editor"
  | "order_manager"
  | "inventory_manager";

export type MediaType = "image" | "video" | "document" | "model" | "brand";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  featuredImage: string;
  active: boolean;
  featured: boolean;
  sortOrder: number;
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

export interface HeroSettings {
  id: string;
  mode: HeroMode;
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
}

export interface HomepageSection {
  id: string;
  key: string;
  enabled: boolean;
  order: number;
  heading: string;
  body: string;
  layout: string;
  background: string;
  ctaLabel?: string;
  ctaUrl?: string;
  productSlugs?: string[];
  collectionSlugs?: string[];
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
    link?: string;
  };
  contactButton: {
    label: string;
    destination: string;
    enabled: boolean;
  };
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
  activityLogs: Array<{
    id: string;
    action: string;
    actor: string;
    entity: string;
    entityId: string;
    timestamp: string;
  }>;
}
