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

export const sizeChartRowSchema = z.object({
  id: z.string(),
  sizeLabel: z.string().min(1),
  measurement: z.string(),
  notes: z.string().optional(),
});

export const productSizeChartSchema = z.object({
  title: z.string().min(1),
  notes: z.string().optional(),
  rows: z.array(sizeChartRowSchema).default([]),
});

export const productVariantSchema = z.object({
  id: z.string(),
  value: z.string().min(1),
  label: z.string().optional(),
  active: z.boolean().default(true),
});

export const productSpecificationSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().optional().transform((value) => (value ? slugify(value) : undefined)),
  shortDescription: z.string().min(8),
  description: z.string().min(12),
  featuredImage: z.string().min(1).optional(),
  heroImage: z.string().min(1).optional(),
  mobileImage: z.string().min(1).optional(),
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
  featuredImage: z.string().optional(),
  heroMedia: z.string().optional(),
  active: z.boolean(),
  featured: z.boolean(),
  sortOrder: z.coerce.number().int().min(0),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  openGraphImage: z.string().optional(),
});

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().optional().transform((value) => (value ? slugify(value) : undefined)),
  sku: z.string().min(3),
  shortDescription: z.string().min(12),
  description: z.string().min(20),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0).optional(),
  inventoryQuantity: z.coerce.number().int().min(0),
  categorySlug: z.string().min(1),
  categorySlugs: z.array(z.string().min(1)).min(1),
  subcategorySlug: z.string().optional(),
  collectionSlug: z.string().optional().default(""),
  stoneType: z.string().min(2),
  origin: z.string().min(2),
  featuredImage: z.string().min(1),
  media: z.array(productMediaItemSchema).min(1),
  sizes: z.array(z.string().min(1)).default([]),
  variantLabel: z.string().optional(),
  variants: z.array(productVariantSchema).default([]),
  sizeChart: productSizeChartSchema.optional(),
  specifications: z.array(productSpecificationSchema).default([]),
  status: z.enum(["draft", "published", "scheduled", "reserved", "out_of_stock", "sold", "archived", "trash"]),
  visibility: z.enum(["visible", "hidden"]).default("visible"),
  featured: z.boolean(),
  newArrival: z.boolean(),
  allowCartPurchase: z.boolean(),
  allowEnquiry: z.boolean(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  openGraphImage: z.string().optional(),
}).superRefine((value, ctx) => {
  if (typeof value.salePrice === "number" && value.salePrice > value.price) {
    ctx.addIssue({
      code: "custom",
      path: ["salePrice"],
      message: "Sale price cannot be greater than the base price.",
    });
  }

  if (value.sizes.length && value.sizeChart && !value.sizeChart.rows.length) {
    ctx.addIssue({
      code: "custom",
      path: ["sizeChart", "rows"],
      message: "Add at least one size chart row when sizes are configured.",
    });
  }

  if (!value.sizes.length && value.sizeChart?.rows.length) {
    ctx.addIssue({
      code: "custom",
      path: ["sizes"],
      message: "Add at least one size before saving a size chart.",
    });
  }

  if (value.variantLabel?.trim() && value.variants.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["variants"],
      message: "Add at least one variant option when a variant label is provided.",
    });
  }

  if (!value.variantLabel?.trim() && value.variants.length > 0) {
    ctx.addIssue({
      code: "custom",
      path: ["variantLabel"],
      message: "Add a variant label to describe the configured options.",
    });
  }
});

export const checkoutSchema = z.object({
  fullName: z.string().min(2),
  email: z.email(),
  phone: z.string().min(6),
  country: z.string().min(2),
  city: z.string().min(2),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  postalCode: z.string().optional(),
  orderNotes: z.string().optional(),
  paymentMethod: z.string().min(2),
  submissionToken: z.string().min(8).optional(),
  cartLines: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1),
        selectedSize: z.string().optional(),
        selectedVariant: z.string().optional(),
      }),
    )
    .min(1),
});

export const heroSlideSchema = z.object({
  id: z.string(),
  desktopImage: z.string().optional(),
  mobileImage: z.string().optional(),
  eyebrow: z.string().default(""),
  heading: z.string().default(""),
  description: z.string().default(""),
  primaryCtaLabel: z.string().default(""),
  primaryCtaUrl: z.string().default(""),
  secondaryCtaLabel: z.string().default(""),
  secondaryCtaUrl: z.string().default(""),
  textAlignment: z.enum(["left", "center"]),
  textPosition: z.enum(["start", "center", "end"]),
  overlayOpacity: z.coerce.number().min(0).max(1),
  focalPoint: z.string().min(1),
  active: z.boolean(),
  sortOrder: z.coerce.number().int().min(1),
}).superRefine((value, ctx) => {
  if (!value.desktopImage?.trim() && !value.mobileImage?.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["desktopImage"],
      message: "Each banner slide needs at least one image.",
    });
  }
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

export const managedPageSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  slug: z.string().optional().transform((value) => (value ? slugify(value) : undefined)),
  heroHeading: z.string().min(2),
  heroMedia: z.string().optional(),
  content: z.string().min(8),
  status: z.enum(["draft", "published", "archived", "trash"]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  openGraphImage: z.string().optional(),
});

export const journalPostSchema = managedPageSchema.extend({
  excerpt: z.string().min(12),
  publishedAt: z.string().min(4),
});
