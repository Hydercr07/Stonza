"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, getOwnerEmail, getOwnerPassword, requireAdminSession, setAdminSession } from "@/lib/auth/session";
import {
  getProductById,
  getStoreData,
  setProductStatus,
  updateHomepageSections,
  updateSiteSettings,
  upsertCategory,
  upsertCollection,
  upsertHero,
  upsertProduct,
} from "@/lib/data/store";
import { canTransitionProductStatus } from "@/lib/permissions";
import {
  categorySchema,
  collectionSchema,
  heroSchema,
  loginSchema,
  productSchema,
  settingsSchema,
} from "@/lib/validation/admin";
import { slugify } from "@/lib/utils";
import type { HomepageSection, Product } from "@/types/domain";

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

export async function loginAction(formData: FormData) {
  const payload = loginSchema.parse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (payload.email !== getOwnerEmail() || payload.password !== getOwnerPassword()) {
    throw new Error("Invalid login credentials for local demo mode.");
  }

  await setAdminSession(payload.email);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdminSession("categories:write");
  const payload = categorySchema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description"),
    featuredImage: formData.get("featuredImage"),
    active: parseBoolean(formData.get("active")),
    featured: parseBoolean(formData.get("featured")),
    sortOrder: formData.get("sortOrder"),
  });

  await upsertCategory(payload);
  revalidatePath("/collections");
  revalidatePath("/admin/categories");
}

export async function saveCollectionAction(formData: FormData) {
  await requireAdminSession("collections:write");
  const payload = collectionSchema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description"),
    featuredImage: formData.get("featuredImage"),
    heroMedia: formData.get("heroMedia"),
    active: parseBoolean(formData.get("active")),
    featured: parseBoolean(formData.get("featured")),
    sortOrder: formData.get("sortOrder"),
  });

  await upsertCollection(payload);
  revalidatePath("/collections");
  revalidatePath("/admin/collections");
}

export async function saveHeroAction(formData: FormData) {
  await requireAdminSession("hero:write");
  const payload = heroSchema.parse({
    id: formData.get("id"),
    mode: formData.get("mode"),
    desktopBannerImage: formData.get("desktopBannerImage") || undefined,
    mobileBannerImage: formData.get("mobileBannerImage") || undefined,
    desktopBackgroundVideo: formData.get("desktopBackgroundVideo") || undefined,
    mobileBackgroundVideo: formData.get("mobileBackgroundVideo") || undefined,
    videoPoster: formData.get("videoPoster") || undefined,
    model3d: formData.get("model3d") || undefined,
    splineUrl: formData.get("splineUrl") || undefined,
    eyebrow: formData.get("eyebrow"),
    heading: formData.get("heading"),
    subheading: formData.get("subheading"),
    description: formData.get("description"),
    primaryCtaLabel: formData.get("primaryCtaLabel"),
    primaryCtaUrl: formData.get("primaryCtaUrl"),
    secondaryCtaLabel: formData.get("secondaryCtaLabel"),
    secondaryCtaUrl: formData.get("secondaryCtaUrl"),
    textAlignment: formData.get("textAlignment"),
    textPosition: formData.get("textPosition"),
    overlayOpacity: formData.get("overlayOpacity"),
    focalPoint: formData.get("focalPoint"),
    heroHeight: formData.get("heroHeight"),
    autoplay: parseBoolean(formData.get("autoplay")),
    loop: parseBoolean(formData.get("loop")),
    muted: parseBoolean(formData.get("muted")),
    showControls: parseBoolean(formData.get("showControls")),
    showScrollIndicator: parseBoolean(formData.get("showScrollIndicator")),
    status: formData.get("status"),
  });

  await upsertHero(payload);
  revalidatePath("/");
  revalidatePath("/admin/hero");
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdminSession("settings:write");
  const payload = settingsSchema.parse({
    siteTitle: formData.get("siteTitle"),
    siteDescription: formData.get("siteDescription"),
    whatsappNumber: formData.get("whatsappNumber"),
    email: formData.get("email"),
    address: formData.get("address"),
    businessHours: formData.get("businessHours"),
    currency: formData.get("currency"),
    maintenanceMode: parseBoolean(formData.get("maintenanceMode")),
    checkoutMode: formData.get("checkoutMode"),
    shippingText: formData.get("shippingText"),
    returnsText: formData.get("returnsText"),
    lowStockDefault: formData.get("lowStockDefault"),
    announcement: {
      enabled: parseBoolean(formData.get("announcementEnabled")),
      text: String(formData.get("announcementText") ?? ""),
      link: String(formData.get("announcementLink") ?? ""),
    },
    contactButton: {
      label: String(formData.get("contactLabel") ?? ""),
      destination: String(formData.get("contactDestination") ?? ""),
      enabled: parseBoolean(formData.get("contactEnabled")),
    },
  });

  await updateSiteSettings(payload);
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function saveHomepageSectionsAction(formData: FormData) {
  await requireAdminSession("homepage:write");
  const store = await getStoreData();
  const sections = store.homepageSections.map((section) => {
    const prefix = section.id;
    return {
      ...section,
      enabled: parseBoolean(formData.get(`${prefix}:enabled`)),
      heading: String(formData.get(`${prefix}:heading`) ?? section.heading),
      body: String(formData.get(`${prefix}:body`) ?? section.body),
      ctaLabel: String(formData.get(`${prefix}:ctaLabel`) ?? section.ctaLabel ?? ""),
      ctaUrl: String(formData.get(`${prefix}:ctaUrl`) ?? section.ctaUrl ?? ""),
      order: Number(formData.get(`${prefix}:order`) ?? section.order),
    } satisfies HomepageSection;
  });

  await updateHomepageSections(sections);
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function saveProductAction(formData: FormData) {
  await requireAdminSession("products:write");
  const payload = productSchema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    sku: formData.get("sku"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    price: formData.get("price"),
    salePrice: formData.get("salePrice") || undefined,
    inventoryQuantity: formData.get("inventoryQuantity"),
    categorySlug: formData.get("categorySlug"),
    collectionSlug: formData.get("collectionSlug"),
    stoneType: formData.get("stoneType"),
    origin: formData.get("origin"),
    featuredImage: formData.get("featuredImage"),
    status: formData.get("status"),
    featured: parseBoolean(formData.get("featured")),
    newArrival: parseBoolean(formData.get("newArrival")),
    allowCartPurchase: parseBoolean(formData.get("allowCartPurchase")),
    allowEnquiry: parseBoolean(formData.get("allowEnquiry")),
  });

  const existing = payload.id ? await getProductById(payload.id) : null;
  const now = new Date().toISOString();
  const nextId = existing?.id ?? payload.id ?? `prd-${crypto.randomUUID()}`;

  const nextProduct: Product = {
    ...(existing ?? {
      id: nextId,
      slug: slugify(payload.name),
      currency: "USD",
      costPrice: 0,
      lowStockThreshold: 1,
      oneOfOne: false,
      weight: "0 kg",
      carat: 0,
      dimensions: "TBD",
      shape: "Organic",
      cut: "Polished",
      color: "Undisclosed",
      clarity: "Undisclosed",
      naturalOrTreated: "natural",
      treatmentDetails: "None disclosed.",
      featuredImage: payload.featuredImage,
      galleryImages: [payload.featuredImage],
      altText: payload.name,
      bestseller: false,
      relatedProductSlugs: [],
      tags: [],
      searchKeywords: [],
      createdAt: now,
      updatedAt: now,
    }),
    ...payload,
    id: nextId,
    slug: slugify(payload.name),
    currency: existing?.currency ?? "USD",
    costPrice: existing?.costPrice ?? 0,
    lowStockThreshold: existing?.lowStockThreshold ?? 1,
    oneOfOne: existing?.oneOfOne ?? false,
    weight: existing?.weight ?? "0 kg",
    carat: existing?.carat ?? 0,
    dimensions: existing?.dimensions ?? "TBD",
    shape: existing?.shape ?? "Organic",
    cut: existing?.cut ?? "Polished",
    color: existing?.color ?? "Undisclosed",
    clarity: existing?.clarity ?? "Undisclosed",
    naturalOrTreated: existing?.naturalOrTreated ?? "natural",
    treatmentDetails: existing?.treatmentDetails ?? "None disclosed.",
    galleryImages: existing?.galleryImages?.length ? existing.galleryImages : [payload.featuredImage],
    altText: existing?.altText ?? payload.name,
    bestseller: existing?.bestseller ?? false,
    relatedProductSlugs: existing?.relatedProductSlugs ?? [],
    tags: existing?.tags ?? [],
    searchKeywords: existing?.searchKeywords ?? [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await upsertProduct(nextProduct);
  revalidatePath("/shop");
  revalidatePath(`/stones/${nextProduct.slug}`);
  revalidatePath("/admin/products");
  redirect(`/admin/products/${nextProduct.id}`);
}

export async function transitionProductStatusAction(formData: FormData) {
  await requireAdminSession("products:publish");
  const id = String(formData.get("id"));
  const status = formData.get("status") as Product["status"];
  const existing = await getProductById(id);
  if (!existing) throw new Error("Product not found.");
  if (!canTransitionProductStatus(existing.status, status)) {
    throw new Error("Invalid product status transition.");
  }

  const updated = await setProductStatus(id, status);
  revalidatePath("/shop");
  revalidatePath(`/stones/${updated.slug}`);
  revalidatePath("/admin/products");
}
