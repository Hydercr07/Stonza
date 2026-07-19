import { z } from "zod";
import { slugify } from "@/lib/utils";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().optional().transform((value) => (value ? slugify(value) : undefined)),
  description: z.string().min(8),
  featuredImage: z.string().min(1),
  active: z.boolean(),
  featured: z.boolean(),
  sortOrder: z.coerce.number().int().min(0),
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
  collectionSlug: z.string().min(1),
  stoneType: z.string().min(2),
  origin: z.string().min(2),
  featuredImage: z.string().min(1),
  status: z.enum(["draft", "published", "scheduled", "reserved", "out_of_stock", "sold", "archived", "trash"]),
  featured: z.boolean(),
  newArrival: z.boolean(),
  allowCartPurchase: z.boolean(),
  allowEnquiry: z.boolean(),
});

export const heroSchema = z.object({
  id: z.string(),
  mode: z.enum(["image", "video", "interactive-3d", "hybrid"]),
  desktopBannerImage: z.string().optional(),
  mobileBannerImage: z.string().optional(),
  desktopBackgroundVideo: z.string().optional(),
  mobileBackgroundVideo: z.string().optional(),
  videoPoster: z.string().optional(),
  model3d: z.string().optional(),
  splineUrl: z.string().optional(),
  eyebrow: z.string().min(4),
  heading: z.string().min(12),
  subheading: z.string().min(12),
  description: z.string().min(12),
  primaryCtaLabel: z.string().min(2),
  primaryCtaUrl: z.string().min(1),
  secondaryCtaLabel: z.string().min(2),
  secondaryCtaUrl: z.string().min(1),
  textAlignment: z.enum(["left", "center"]),
  textPosition: z.enum(["start", "center", "end"]),
  overlayOpacity: z.coerce.number().min(0).max(1),
  focalPoint: z.string().min(1),
  heroHeight: z.enum(["screen", "large", "medium"]),
  autoplay: z.boolean(),
  loop: z.boolean(),
  muted: z.boolean(),
  showControls: z.boolean(),
  showScrollIndicator: z.boolean(),
  status: z.enum(["draft", "published"]),
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
    link: z.string().optional(),
  }),
  contactButton: z.object({
    label: z.string().min(2),
    destination: z.string().min(1),
    enabled: z.boolean(),
  }),
});
