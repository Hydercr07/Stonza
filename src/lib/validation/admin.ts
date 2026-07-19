import { z } from "zod";
import { slugify } from "@/lib/utils";

const contentStatusSchema = z.enum(["draft", "published", "archived", "trash"]);

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const productMediaItemSchema = z.object({
  id: z.string(),
  assetId: z.string().optional(),
  url: z.string().min(1),
  altText: z.string().min(1),
  fileName: z.string().min(1),
  size: z.coerce.number().min(0),
  featured: z.boolean(),
  sortOrder: z.coerce.number().int().min(1),
});

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().optional().transform((value) => (value ? slugify(value) : undefined)),
  shortDescription: z.string().min(8),
  description: z.string().min(12),
  featuredImage: z.string().min(1),
  heroImage: z.string().min(1),
  mobileImage: z.string().min(1),
  video: z.string().optional(),
  altText: z.string().min(2),
  parentCategorySlug: z.string().optional(),
  active: z.boolean(),
  featured: z.boolean(),
  status: contentStatusSchema,
  sortOrder: z.coerce.number().int().min(0),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  openGraphImage: z.string().optional(),
});

export const collectionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().optional().transform((value) => (value ? slugify(value) : undefined)),
  description: z.string().min(8),
  featuredImage: z.string().min(1),
  heroMedia: z.string().min(1),
  active: z.boolean(),
  featured: z.boolean(),
  sortOrder: z.coerce.number().int().min(0),
});

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  sku: z.string().min(3),
  shortDescription: z.string().min(12),
  description: z.string().min(20),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0).optional(),
  inventoryQuantity: z.coerce.number().int().min(0),
  categorySlug: z.string().min(1),
  categorySlugs: z.array(z.string().min(1)).min(1),
  collectionSlug: z.string().min(1),
  stoneType: z.string().min(2),
  origin: z.string().min(2),
  featuredImage: z.string().min(1),
  media: z.array(productMediaItemSchema).min(1),
  status: z.enum(["draft", "published", "scheduled", "reserved", "out_of_stock", "sold", "archived", "trash"]),
  featured: z.boolean(),
  newArrival: z.boolean(),
  allowCartPurchase: z.boolean(),
  allowEnquiry: z.boolean(),
});

export const heroSlideSchema = z.object({
  id: z.string(),
  desktopImage: z.string().optional(),
  mobileImage: z.string().optional(),
  eyebrow: z.string().min(2),
  heading: z.string().min(6),
  description: z.string().min(8),
  primaryCtaLabel: z.string().min(2),
  primaryCtaUrl: z.string().min(1),
  secondaryCtaLabel: z.string().min(2),
  secondaryCtaUrl: z.string().min(1),
  textAlignment: z.enum(["left", "center"]),
  textPosition: z.enum(["start", "center", "end"]),
  overlayOpacity: z.coerce.number().min(0).max(1),
  focalPoint: z.string().min(1),
  active: z.boolean(),
  sortOrder: z.coerce.number().int().min(1),
});

const heroThreeSchema = z.object({
  eyebrow: z.string().min(2),
  heading: z.string().min(12),
  subheading: z.string().min(8),
  description: z.string().min(12),
  primaryCtaLabel: z.string().min(2),
  primaryCtaUrl: z.string().min(1),
  secondaryCtaLabel: z.string().min(2),
  secondaryCtaUrl: z.string().min(1),
  textAlignment: z.enum(["left", "center"]),
  textPosition: z.enum(["start", "center", "end"]),
  overlayOpacity: z.coerce.number().min(0).max(1),
  heroHeight: z.enum(["screen", "large", "medium"]),
  showScrollIndicator: z.boolean(),
  model3d: z.string().optional(),
  splineUrl: z.string().optional(),
  backgroundImage: z.string().optional(),
  status: z.enum(["draft", "published", "incomplete"]),
});

export const heroSchema = z.object({
  id: z.string(),
  mode: z.enum(["carousel", "video", "interactive-3d", "hybrid"]),
  activeMode: z.enum(["carousel", "video", "interactive-3d", "hybrid"]),
  carousel: z.object({
    autoplay: z.boolean(),
    autoplayInterval: z.coerce.number().int().min(1500).max(20000),
    loop: z.boolean(),
    pauseOnHover: z.boolean(),
    showArrows: z.boolean(),
    showDots: z.boolean(),
    transitionStyle: z.enum(["fade", "slide"]),
    slides: z.array(heroSlideSchema),
    status: z.enum(["draft", "published", "incomplete"]),
  }),
  video: z.object({
    desktopVideo: z.string().optional(),
    mobileVideo: z.string().optional(),
    posterImage: z.string().optional(),
    mobilePosterImage: z.string().optional(),
    heading: z.string().min(12),
    description: z.string().min(12),
    primaryCtaLabel: z.string().min(2),
    primaryCtaUrl: z.string().min(1),
    secondaryCtaLabel: z.string().min(2),
    secondaryCtaUrl: z.string().min(1),
    textAlignment: z.enum(["left", "center"]),
    textPosition: z.enum(["start", "center", "end"]),
    overlayOpacity: z.coerce.number().min(0).max(1),
    autoplay: z.boolean(),
    loop: z.boolean(),
    muted: z.boolean(),
    showControls: z.boolean(),
    status: z.enum(["draft", "published", "incomplete"]),
  }),
  interactive3d: heroThreeSchema,
  hybrid: heroThreeSchema.extend({
    desktopImage: z.string().optional(),
    mobileImage: z.string().optional(),
  }),
  updatedAt: z.string(),
  updatedBy: z.string(),
});

export const navigationItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  href: z.string().min(1),
  order: z.coerce.number().int().min(1),
  visible: z.boolean(),
  children: z.array(z.any()).optional(),
});

export const footerSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  order: z.coerce.number().int().min(1),
  links: z.array(
    z.object({
      id: z.string(),
      label: z.string().min(1),
      href: z.string().min(1),
    }),
  ),
});

export const settingsSchema = z.object({
  siteTitle: z.string().min(2),
  siteDescription: z.string().min(12),
  whatsappNumber: z.string().min(5),
  email: z.email(),
  address: z.string().min(5),
  businessHours: z.string().min(5),
  currency: z.string().min(3),
  maintenanceMode: z.boolean(),
  checkoutMode: z.enum(["standard", "enquiry_only", "disabled"]),
  shippingText: z.string().min(8),
  returnsText: z.string().min(8),
  lowStockDefault: z.coerce.number().int().min(0),
  announcement: z.object({
    enabled: z.boolean(),
    text: z.string(),
    linkLabel: z.string().optional(),
    link: z.string().optional(),
    backgroundStyle: z.enum(["graphite", "ivory", "accent"]).optional(),
  }),
  brand: z.object({
    name: z.string().min(2),
    tagline: z.string().min(2),
    logo: z.string().min(1),
    lightLogo: z.string().min(1),
    favicon: z.string().min(1),
    colors: z.object({
      primary: z.string().min(1),
      secondary: z.string().min(1),
      accent: z.string().min(1),
      surface: z.string().min(1),
    }),
    headingFont: z.string().min(2),
    bodyFont: z.string().min(2),
  }),
  header: z.object({
    style: z.enum(["transparent", "solid"]),
    sticky: z.boolean(),
    showSearch: z.boolean(),
    showWishlist: z.boolean(),
    showCart: z.boolean(),
    contactButton: z.object({
      label: z.string().min(2),
      destination: z.string().min(1),
      enabled: z.boolean(),
    }),
    navigation: z.array(navigationItemSchema),
  }),
  footer: z.object({
    description: z.string().min(12),
    newsletterHeading: z.string().min(2),
    newsletterBody: z.string().min(8),
    copyright: z.string().min(2),
    legalLinks: z.array(navigationItemSchema),
    sections: z.array(footerSectionSchema),
  }),
  social: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
    pinterest: z.string().optional(),
  }),
  seo: z.object({
    defaultTitle: z.string().min(2),
    defaultDescription: z.string().min(8),
    defaultOgImage: z.string().min(1),
  }),
  labels: z.record(z.string(), z.string()),
  contactButton: z.object({
    label: z.string().min(2),
    destination: z.string().min(1),
    enabled: z.boolean(),
  }),
});
