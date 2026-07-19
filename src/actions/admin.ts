"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, getOwnerEmail, getOwnerPassword, requireAdminSession, setAdminSession } from "@/lib/auth/session";
import {
  deleteMediaAsset,
  duplicateCategory,
  getCategoryById,
  getContentLabels,
  getHeroSettings,
  getProductById,
  getStoreData,
  getSiteSettings,
  logActivity,
  setProductStatus,
  updateCategoryStatus,
  updateContentLabels,
  updateHomepageSections,
  updateMediaAsset,
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
import type { Category, ContentLabel, HomepageSection, NavigationItem, Product, ProductMediaItem } from "@/types/domain";

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function parseJson<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== "string" || !value) return fallback;
  return JSON.parse(value) as T;
}

function syncMedia(items: ProductMediaItem[]) {
  const ordered = [...items]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item, index) => ({ ...item, featured: item.featured, sortOrder: index + 1 }));
  const featuredItem = ordered.find((item) => item.featured) ?? ordered[0];
  return ordered.map((item) => ({ ...item, featured: item.id === featuredItem?.id }));
}

function parseNavigation(value: FormDataEntryValue | null): NavigationItem[] {
  return parseJson<NavigationItem[]>(value, []).map((item, index) => ({
    ...item,
    order: item.order ?? index + 1,
    visible: item.visible ?? true,
    children: item.children?.map((child, childIndex) => ({
      ...child,
      order: child.order ?? childIndex + 1,
      visible: child.visible ?? true,
    })),
  }));
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
  const session = await requireAdminSession("categories:write");
  const featuredMedia = syncMedia(parseJson<ProductMediaItem[]>(formData.get("featuredMedia"), []));
  const heroMedia = syncMedia(parseJson<ProductMediaItem[]>(formData.get("heroMedia"), []));
  const mobileMedia = syncMedia(parseJson<ProductMediaItem[]>(formData.get("mobileMedia"), []));
  const payload = categorySchema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    featuredImage: featuredMedia[0]?.url,
    heroImage: heroMedia[0]?.url ?? featuredMedia[0]?.url,
    mobileImage: mobileMedia[0]?.url ?? heroMedia[0]?.url ?? featuredMedia[0]?.url,
    video: formData.get("video") || undefined,
    altText: formData.get("altText") || featuredMedia[0]?.altText || heroMedia[0]?.altText,
    parentCategorySlug: formData.get("parentCategorySlug") || undefined,
    active: parseBoolean(formData.get("active")),
    featured: parseBoolean(formData.get("featured")),
    status: formData.get("status"),
    sortOrder: formData.get("sortOrder"),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    openGraphImage: String(formData.get("openGraphImage") ?? ""),
  });

  const existing = payload.id ? await getCategoryById(payload.id) : null;
  const category = await upsertCategory({
    ...existing,
    ...payload,
    slug: payload.slug ?? slugify(payload.name),
    createdBy: existing?.createdBy ?? session.email,
    updatedBy: session.email,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await logActivity({
    action: existing ? "category_updated" : "category_created",
    actor: session.email,
    entity: "category",
    entityId: category.id,
    detail: category.name,
  });

  revalidatePath("/shop");
  revalidatePath("/collections");
  revalidatePath("/admin/categories");
  redirect(`/admin/categories/${category.id}`);
}

export async function duplicateCategoryAction(formData: FormData) {
  const session = await requireAdminSession("categories:write");
  const id = String(formData.get("id"));
  const category = await duplicateCategory(id, session.email);
  await logActivity({
    action: "category_duplicated",
    actor: session.email,
    entity: "category",
    entityId: category.id,
    detail: category.name,
  });
  revalidatePath("/admin/categories");
  redirect(`/admin/categories/${category.id}`);
}

export async function transitionCategoryStatusAction(formData: FormData) {
  const session = await requireAdminSession("categories:write");
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as Category["status"];
  const category = await updateCategoryStatus(id, status, session.email);
  await logActivity({
    action: `category_${status}`,
    actor: session.email,
    entity: "category",
    entityId: category.id,
    detail: category.name,
  });
  revalidatePath("/shop");
  revalidatePath("/admin/categories");
}

export async function saveCollectionAction(formData: FormData) {
  const session = await requireAdminSession("collections:write");
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

  const collection = await upsertCollection(payload);
  await logActivity({
    action: "collection_saved",
    actor: session.email,
    entity: "collection",
    entityId: collection.id,
    detail: collection.name,
  });
  revalidatePath("/collections");
  revalidatePath("/admin/collections");
}

export async function saveHeroAction(formData: FormData) {
  const session = await requireAdminSession("hero:write");
  const existing = await getHeroSettings();
  const payload = heroSchema.parse({
    id: String(formData.get("id") ?? existing.id),
    mode: formData.get("activeMode") ?? formData.get("mode") ?? existing.activeMode,
    activeMode: formData.get("activeMode") ?? formData.get("mode") ?? existing.activeMode,
    carousel: parseJson(formData.get("carousel"), existing.carousel),
    video: parseJson(formData.get("video"), existing.video),
    interactive3d: parseJson(formData.get("interactive3d"), existing.interactive3d),
    hybrid: parseJson(formData.get("hybrid"), existing.hybrid),
    updatedAt: new Date().toISOString(),
    updatedBy: session.email,
  });

  await upsertHero({
    ...existing,
    ...payload,
    mode: payload.activeMode,
    activeMode: payload.activeMode,
    updatedAt: new Date().toISOString(),
    updatedBy: session.email,
  });

  await logActivity({
    action: "hero_updated",
    actor: session.email,
    entity: "hero",
    entityId: existing.id,
    detail: payload.activeMode,
  });

  revalidatePath("/");
  revalidatePath("/admin/hero");
}

export async function saveSettingsAction(formData: FormData) {
  const session = await requireAdminSession("settings:write");
  const existing = await getSiteSettings();

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
      linkLabel: String(formData.get("announcementLinkLabel") ?? ""),
      link: String(formData.get("announcementLink") ?? ""),
      backgroundStyle: String(formData.get("announcementBackgroundStyle") ?? "graphite") as "graphite" | "ivory" | "accent",
    },
    brand: {
      name: String(formData.get("brandName") ?? ""),
      tagline: String(formData.get("brandTagline") ?? ""),
      logo: String(formData.get("brandLogo") ?? ""),
      lightLogo: String(formData.get("brandLightLogo") ?? ""),
      favicon: String(formData.get("brandFavicon") ?? ""),
      colors: {
        primary: String(formData.get("brandPrimary") ?? ""),
        secondary: String(formData.get("brandSecondary") ?? ""),
        accent: String(formData.get("brandAccent") ?? ""),
        surface: String(formData.get("brandSurface") ?? ""),
      },
      headingFont: String(formData.get("headingFont") ?? ""),
      bodyFont: String(formData.get("bodyFont") ?? ""),
    },
    header: {
      style: String(formData.get("headerStyle") ?? existing.header.style) as "transparent" | "solid",
      sticky: parseBoolean(formData.get("headerSticky")),
      showSearch: parseBoolean(formData.get("showSearch")),
      showWishlist: parseBoolean(formData.get("showWishlist")),
      showCart: parseBoolean(formData.get("showCart")),
      contactButton: {
        label: String(formData.get("contactLabel") ?? ""),
        destination: String(formData.get("contactDestination") ?? ""),
        enabled: parseBoolean(formData.get("contactEnabled")),
      },
      navigation: parseNavigation(formData.get("navigation")),
    },
    footer: {
      description: String(formData.get("footerDescription") ?? ""),
      newsletterHeading: String(formData.get("newsletterHeading") ?? ""),
      newsletterBody: String(formData.get("newsletterBody") ?? ""),
      copyright: String(formData.get("copyrightText") ?? ""),
      legalLinks: parseNavigation(formData.get("legalLinks")),
      sections: parseJson(formData.get("footerSections"), existing.footer.sections),
    },
    social: {
      instagram: String(formData.get("instagram") ?? ""),
      facebook: String(formData.get("facebook") ?? ""),
      tiktok: String(formData.get("tiktok") ?? ""),
      youtube: String(formData.get("youtube") ?? ""),
      pinterest: String(formData.get("pinterest") ?? ""),
    },
    seo: {
      defaultTitle: String(formData.get("defaultSeoTitle") ?? ""),
      defaultDescription: String(formData.get("defaultSeoDescription") ?? ""),
      defaultOgImage: String(formData.get("defaultOgImage") ?? ""),
    },
    labels: parseJson<Record<string, string>>(formData.get("labels"), existing.labels),
    contactButton: {
      label: String(formData.get("contactLabel") ?? ""),
      destination: String(formData.get("contactDestination") ?? ""),
      enabled: parseBoolean(formData.get("contactEnabled")),
    },
  });

  await updateSiteSettings(payload);
  await logActivity({
    action: "settings_updated",
    actor: session.email,
    entity: "settings",
    entityId: "site-settings",
  });
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/collections");
  revalidatePath("/admin/settings");
}

export async function saveHomepageSectionsAction(formData: FormData) {
  const session = await requireAdminSession("homepage:write");
  const store = await getStoreData();
  const sections = store.homepageSections.map((section) => {
    const prefix = section.id;
    return {
      ...section,
      enabled: parseBoolean(formData.get(`${prefix}:enabled`)),
      eyebrow: String(formData.get(`${prefix}:eyebrow`) ?? section.eyebrow ?? ""),
      heading: String(formData.get(`${prefix}:heading`) ?? section.heading),
      body: String(formData.get(`${prefix}:body`) ?? section.body),
      ctaLabel: String(formData.get(`${prefix}:ctaLabel`) ?? section.ctaLabel ?? ""),
      ctaUrl: String(formData.get(`${prefix}:ctaUrl`) ?? section.ctaUrl ?? ""),
      order: Number(formData.get(`${prefix}:order`) ?? section.order),
      categorySlugs: parseJson<string[]>(formData.get(`${prefix}:categorySlugs`), section.categorySlugs ?? []),
      collectionSlugs: parseJson<string[]>(formData.get(`${prefix}:collectionSlugs`), section.collectionSlugs ?? []),
      productSlugs: parseJson<string[]>(formData.get(`${prefix}:productSlugs`), section.productSlugs ?? []),
      updatedAt: new Date().toISOString(),
      updatedBy: session.email,
    } satisfies HomepageSection;
  });

  await updateHomepageSections(sections);
  await logActivity({
    action: "homepage_updated",
    actor: session.email,
    entity: "homepage",
    entityId: "homepage-sections",
  });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function saveLabelsAction(formData: FormData) {
  const session = await requireAdminSession("settings:write");
  const labels = await getContentLabels();
  const nextLabels: ContentLabel[] = labels.map((entry) => ({
    ...entry,
    label: String(formData.get(entry.key) ?? entry.label),
    updatedAt: new Date().toISOString(),
    updatedBy: session.email,
  }));

  await updateContentLabels(nextLabels);
  await logActivity({
    action: "labels_updated",
    actor: session.email,
    entity: "labels",
    entityId: "content-labels",
  });
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/navigation");
}

export async function saveProductAction(formData: FormData) {
  const session = await requireAdminSession("products:write");
  const media = syncMedia(parseJson<ProductMediaItem[]>(formData.get("media"), []));
  const categorySlugs = Array.from(formData.keys())
    .filter((key) => key.startsWith("category:"))
    .map((key) => key.replace("category:", ""));

  const payload = productSchema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    sku: formData.get("sku"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    price: formData.get("price"),
    salePrice: formData.get("salePrice") || undefined,
    inventoryQuantity: formData.get("inventoryQuantity"),
    categorySlug: categorySlugs[0] ?? formData.get("categorySlug"),
    categorySlugs,
    collectionSlug: formData.get("collectionSlug"),
    stoneType: formData.get("stoneType"),
    origin: formData.get("origin"),
    featuredImage: media.find((item) => item.featured)?.url ?? "",
    media,
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
      galleryImages: media.map((item) => item.url),
      media,
      altText: media[0]?.altText ?? payload.name,
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
    categorySlug: payload.categorySlugs[0],
    categorySlugs: payload.categorySlugs,
    media,
    featuredImage: media.find((item) => item.featured)?.url ?? payload.featuredImage,
    galleryImages: media.map((item) => item.url),
    altText: media.find((item) => item.featured)?.altText ?? media[0]?.altText ?? existing?.altText ?? payload.name,
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
    bestseller: existing?.bestseller ?? false,
    relatedProductSlugs: existing?.relatedProductSlugs ?? [],
    tags: existing?.tags ?? [],
    searchKeywords: existing?.searchKeywords ?? [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await upsertProduct(nextProduct);
  await logActivity({
    action: existing ? "product_updated" : "product_created",
    actor: session.email,
    entity: "product",
    entityId: nextProduct.id,
    detail: nextProduct.name,
  });
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/stones/${nextProduct.slug}`);
  revalidatePath("/admin/products");
  redirect(`/admin/products/${nextProduct.id}`);
}

export async function transitionProductStatusAction(formData: FormData) {
  const session = await requireAdminSession("products:publish");
  const id = String(formData.get("id"));
  const status = formData.get("status") as Product["status"];
  const existing = await getProductById(id);
  if (!existing) throw new Error("Product not found.");
  if (!canTransitionProductStatus(existing.status, status)) {
    throw new Error("Invalid product status transition.");
  }

  const updated = await setProductStatus(id, status);
  await logActivity({
    action: `product_${status}`,
    actor: session.email,
    entity: "product",
    entityId: updated.id,
    detail: updated.name,
  });
  revalidatePath("/shop");
  revalidatePath(`/stones/${updated.slug}`);
  revalidatePath("/admin/products");
}

export async function updateMediaAssetAction(formData: FormData) {
  const session = await requireAdminSession("media:write");
  const id = String(formData.get("id"));
  await updateMediaAsset(id, {
    altText: String(formData.get("altText") ?? ""),
    caption: String(formData.get("caption") ?? ""),
  });
  await logActivity({
    action: "media_updated",
    actor: session.email,
    entity: "media",
    entityId: id,
  });
  revalidatePath("/admin/media");
}

export async function deleteMediaAssetAction(formData: FormData) {
  const session = await requireAdminSession("media:write");
  const id = String(formData.get("id"));
  await deleteMediaAsset(id);
  await logActivity({
    action: "media_deleted",
    actor: session.email,
    entity: "media",
    entityId: id,
  });
  revalidatePath("/admin/media");
}
