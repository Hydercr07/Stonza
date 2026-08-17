"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { clearAdminSession, getOwnerEmail, getOwnerPassword, requireAdminSession, setAdminSession } from "@/lib/auth/session";
import {
  adjustProductInventory,
  assignProductsToCategory,
  assignProductsToCollection,
  deleteCollection,
  deleteJournalPost,
  deleteManagedPage,
  deleteProduct,
  deleteMediaAsset,
  duplicateProduct,
  duplicateCategory,
  getAdminSiteSettings,
  getCategoryById,
  getContentLabels,
  getHeroSettings,
  getHomepageBanners,
  getJournalPostById,
  getProductById,
  getStoreData,
  logActivity,
  listOrders,
  setProductStatus,
  updateOrderStatus,
  updateCategoryStatus,
  updateContentLabels,
  updateHomepageBanners,
  updateHomepageSections,
  upsertManagedPage,
  updateMediaAsset,
  updateSiteSettings,
  upsertCategory,
  upsertCollection,
  upsertHero,
  upsertJournalPost,
  upsertProduct,
} from "@/lib/data/store";
import { canTransitionProductStatus } from "@/lib/permissions";
import {
  categorySchema,
  collectionSchema,
  heroSchema,
  homepageBannerListSchema,
  journalPostSchema,
  loginSchema,
  managedPageSchema,
  productSchema,
  settingsSchema,
} from "@/lib/validation/admin";
import { slugify } from "@/lib/utils";
import type {
  Category,
  ContentLabel,
  HomepageBanner,
  HomepageSection,
  MediaAsset,
  NavigationItem,
  Product,
  ProductMediaItem,
  ProductSizeChart,
} from "@/types/domain";

export interface AdminActionState {
  error: string | null;
}

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

function asProductMediaItem(asset: MediaAsset): ProductMediaItem {
  return {
    id: `product-media-${asset.id}`,
    assetId: asset.id,
    url: asset.publicUrl,
    altText: asset.altText || asset.originalFilename.replace(/\.[^.]+$/, ""),
    fileName: asset.originalFilename,
    size: asset.size,
    featured: true,
    sortOrder: 1,
  };
}

async function getRecentUploadFallback(actor: string) {
  const store = await getStoreData();
  const recentWindowStart = Date.now() - 10 * 60 * 1000;

  return store.mediaAssets.find(
    (asset) =>
      asset.uploadedBy === actor &&
      !asset.deletedAt &&
      new Date(asset.uploadedAt).getTime() >= recentWindowStart,
  );
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

function parseSizeChart(formData: FormData): ProductSizeChart | undefined {
  const raw = String(formData.get("sizeChartData") ?? "").trim();
  if (!raw) return undefined;
  return parseJson<ProductSizeChart>(raw, undefined as never);
}

function parseProductVariants(formData: FormData) {
  const raw = String(formData.get("variantsData") ?? "").trim();
  if (!raw) return [];
  return parseJson<Product["variants"]>(raw, []);
}

function parseProductSpecifications(formData: FormData) {
  const raw = String(formData.get("specificationsData") ?? "").trim();
  if (!raw) return [];
  return parseJson<Product["specifications"]>(raw, []);
}

function toSentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function prettifyFieldPath(path: Array<string | number>) {
  if (!path.length) return "Form";
  return toSentenceCase(
    path
      .map((part) => String(part).replace(/([A-Z])/g, " $1"))
      .join(" ")
      .replace(/[_-]/g, " ")
      .trim(),
  );
}

function formatAdminError(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues
      .map((issue) => `${prettifyFieldPath(issue.path.filter((part): part is string | number => typeof part === "string" || typeof part === "number"))}: ${issue.message}`)
      .join(" ");
  }

  return error instanceof Error ? error.message : "Product could not be saved right now.";
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
  const fallbackAsset = await getRecentUploadFallback(session.email);
  const featuredMedia = syncMedia(
    parseJson<ProductMediaItem[]>(formData.get("featuredMedia"), []).length
      ? parseJson<ProductMediaItem[]>(formData.get("featuredMedia"), [])
      : fallbackAsset
        ? [asProductMediaItem(fallbackAsset)]
        : [],
  );
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
  const assignedProductSlugs = Array.from(formData.keys())
    .filter((key) => key.startsWith("product:"))
    .map((key) => key.replace("product:", ""));
  await assignProductsToCategory(category.slug, assignedProductSlugs);

  await logActivity({
    action: existing ? "category_updated" : "category_created",
    actor: session.email,
    entity: "category",
    entityId: category.id,
    detail: category.name,
  });

  revalidatePath("/shop");
  revalidatePath(`/categories/${category.slug}`);
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
  if (status === "trash") {
    redirect("/admin/categories?status=trash");
  }
  redirect(`/admin/categories/${category.id}`);
}

export async function saveCollectionAction(formData: FormData) {
  const session = await requireAdminSession("collections:write");
  const assignedProductSlugs = Array.from(formData.keys())
    .filter((key) => key.startsWith("product:"))
    .map((key) => key.replace("product:", ""));
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
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    openGraphImage: String(formData.get("openGraphImage") ?? ""),
  });

  const collection = await upsertCollection({
    ...payload,
    featuredImage: payload.featuredImage ?? "",
    heroMedia: payload.heroMedia ?? payload.featuredImage ?? "",
  });
  await assignProductsToCollection(collection.slug, assignedProductSlugs);
  await logActivity({
    action: "collection_saved",
    actor: session.email,
    entity: "collection",
    entityId: collection.id,
    detail: collection.name,
  });
  revalidatePath("/collections");
  revalidatePath(`/collections/${collection.slug}`);
  revalidatePath("/admin/collections");
  redirect("/admin/collections");
}

export async function deleteCollectionAction(formData: FormData) {
  const session = await requireAdminSession("collections:write");
  const id = String(formData.get("id"));
  const collection = await deleteCollection(id);
  await logActivity({
    action: "collection_deleted",
    actor: session.email,
    entity: "collection",
    entityId: collection.id,
    detail: collection.name,
  });
  revalidatePath("/collections");
  revalidatePath("/admin/collections");
  redirect("/admin/collections");
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
  const existing = await getAdminSiteSettings();

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

export async function saveHomepageBannersAction(formData: FormData) {
  const session = await requireAdminSession("homepage:write");
  const existing = await getHomepageBanners(true);
  const nextBanners = homepageBannerListSchema.parse(
    parseJson<HomepageBanner[]>(formData.get("banners"), existing).map((banner, index) => ({
      ...banner,
      order: index + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: session.email,
    })),
  );

  await updateHomepageBanners(nextBanners);
  await logActivity({
    action: "homepage_banners_updated",
    actor: session.email,
    entity: "homepage",
    entityId: "homepage-banners",
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
  const parsedMedia = parseJson<ProductMediaItem[]>(formData.get("media"), []);
  const fallbackAsset = parsedMedia.length ? null : await getRecentUploadFallback(session.email);
  const media = syncMedia(parsedMedia.length ? parsedMedia : fallbackAsset ? [asProductMediaItem(fallbackAsset)] : []);
  const mainCategorySlug = String(formData.get("mainCategorySlug") ?? "").trim();
  const selectedCategorySlugs = Array.from(formData.keys())
    .filter((key) => key.startsWith("category:"))
    .map((key) => key.replace("category:", ""));
  const requestedSubcategorySlug = String(formData.get("subcategorySlug") ?? "").trim() || undefined;
  const store = await getStoreData();
  const subcategory = requestedSubcategorySlug
    ? store.categories.find((category) => category.slug === requestedSubcategorySlug)
    : null;
  const subcategorySlug =
    subcategory && (!mainCategorySlug || subcategory.parentCategorySlug === mainCategorySlug)
      ? requestedSubcategorySlug
      : undefined;
  const parentCategorySlugs = selectedCategorySlugs.length
    ? selectedCategorySlugs
    : mainCategorySlug
      ? [mainCategorySlug]
      : [];
  const categorySlugs = [...new Set([
    ...parentCategorySlugs,
    ...(subcategorySlug ? [subcategorySlug] : []),
    ...(subcategory?.parentCategorySlug ? [subcategory.parentCategorySlug] : []),
  ])];

  if (categorySlugs.length === 0) {
    throw new Error("Select at least one category before saving this product.");
  }

  if (media.length === 0) {
    throw new Error("Upload at least one product image before saving this product.");
  }

  const payload = productSchema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    sku: formData.get("sku"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    price: formData.get("price"),
    salePrice: formData.get("salePrice") || undefined,
    inventoryQuantity: formData.get("inventoryQuantity"),
    categorySlug: categorySlugs[0] ?? formData.get("categorySlug"),
    categorySlugs,
    subcategorySlug,
    collectionSlug: formData.get("collectionSlug"),
    stoneType: formData.get("stoneType"),
    origin: formData.get("origin"),
    featuredImage: media.find((item) => item.featured)?.url ?? "",
    media,
    sizes: String(formData.get("sizes") ?? "")
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean),
    variantLabel: String(formData.get("variantLabel") ?? "").trim() || undefined,
    variants: parseProductVariants(formData) ?? [],
    sizeChart: parseSizeChart(formData),
    specifications: parseProductSpecifications(formData) ?? [],
    status: formData.get("status"),
    visibility: formData.get("visibility") ?? "visible",
    featured: parseBoolean(formData.get("featured")),
    newArrival: parseBoolean(formData.get("newArrival")),
    allowCartPurchase: parseBoolean(formData.get("allowCartPurchase")),
    allowEnquiry: parseBoolean(formData.get("allowEnquiry")),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    openGraphImage: String(formData.get("openGraphImage") ?? ""),
  });

  const existing = payload.id ? await getProductById(payload.id) : null;
  const now = new Date().toISOString();
  const nextId = existing?.id ?? payload.id ?? `prd-${crypto.randomUUID()}`;

  const nextProduct: Product = {
    ...(existing ?? {
      id: nextId,
      slug: payload.slug ?? slugify(payload.name),
      currency: "PKR",
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
    slug: payload.slug ?? existing?.slug ?? slugify(payload.name),
    categorySlug: payload.categorySlugs[0],
    categorySlugs: payload.categorySlugs,
    subcategorySlug: payload.subcategorySlug,
    media,
    featuredImage: media.find((item) => item.featured)?.url ?? payload.featuredImage,
    galleryImages: media.map((item) => item.url),
    altText: media.find((item) => item.featured)?.altText ?? media[0]?.altText ?? existing?.altText ?? payload.name,
    currency: existing?.currency ?? "PKR",
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
    sizes: payload.sizes,
    variantLabel: payload.variantLabel,
    variants: payload.variants,
    sizeChart: payload.sizeChart ?? existing?.sizeChart,
    specifications: payload.specifications,
    visibility: payload.visibility,
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

export async function deleteProductAction(formData: FormData) {
  const session = await requireAdminSession("products:write");
  const id = String(formData.get("id"));
  const product = await deleteProduct(id);
  await logActivity({
    action: "product_deleted",
    actor: session.email,
    entity: "product",
    entityId: product.id,
    detail: product.name,
  });
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function duplicateProductAction(formData: FormData) {
  const session = await requireAdminSession("products:write");
  const id = String(formData.get("id"));
  const product = await duplicateProduct(id);
  await logActivity({
    action: "product_duplicated",
    actor: session.email,
    entity: "product",
    entityId: product.id,
    detail: product.name,
  });
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function quickUpdateProductAction(formData: FormData) {
  const session = await requireAdminSession("products:write");
  const id = String(formData.get("id"));
  const existing = await getProductById(id);
  if (!existing) {
    throw new Error("Product not found.");
  }

  const price = formData.get("price");
  const salePrice = formData.get("salePrice");
  const inventoryQuantity = formData.get("inventoryQuantity");
  const status = formData.get("status");
  const featured = formData.get("featured");
  const categorySlug = formData.get("categorySlug");

  const nextProduct: Product = {
    ...existing,
    price: price !== null && String(price).length ? Number(price) : existing.price,
    salePrice:
      salePrice !== null
        ? String(salePrice).trim()
          ? Number(salePrice)
          : undefined
        : existing.salePrice,
    inventoryQuantity:
      inventoryQuantity !== null && String(inventoryQuantity).length
        ? Number(inventoryQuantity)
        : existing.inventoryQuantity,
    status: status ? (String(status) as Product["status"]) : existing.status,
    featured: featured ? featured === "true" : existing.featured,
    categorySlug: categorySlug ? String(categorySlug) : existing.categorySlug,
    categorySlugs: categorySlug ? [String(categorySlug)] : existing.categorySlugs,
    updatedAt: new Date().toISOString(),
  };

  await upsertProduct(nextProduct);
  await logActivity({
    action: "product_quick_updated",
    actor: session.email,
    entity: "product",
    entityId: nextProduct.id,
    detail: nextProduct.name,
  });
  revalidatePath("/shop");
  revalidatePath(`/stones/${nextProduct.slug}`);
  revalidatePath("/admin/products");
}

export async function bulkUpdateProductsAction(formData: FormData) {
  const session = await requireAdminSession("products:write");
  const ids = Array.from(formData.keys())
    .filter((key) => key.startsWith("product:"))
    .map((key) => key.replace("product:", ""));
  const action = String(formData.get("bulkAction") ?? "");
  const value = String(formData.get("bulkValue") ?? "");

  if (!ids.length) {
    throw new Error("Select at least one product.");
  }

  for (const id of ids) {
    const existing = await getProductById(id);
    if (!existing) continue;

    if (action === "delete") {
      await deleteProduct(id);
      continue;
    }

    const nextProduct: Product = {
      ...existing,
      updatedAt: new Date().toISOString(),
    };

    if (action === "publish") nextProduct.status = "published";
    if (action === "draft") nextProduct.status = "draft";
    if (action === "archive") nextProduct.status = "archived";
    if (action === "feature") nextProduct.featured = true;
    if (action === "unfeature") nextProduct.featured = false;
    if (action === "set-category" && value) {
      nextProduct.categorySlug = value;
      nextProduct.categorySlugs = [value];
    }
    if (action === "set-collection") {
      nextProduct.collectionSlug = value;
    }

    await upsertProduct(nextProduct);
  }

  await logActivity({
    action: "products_bulk_updated",
    actor: session.email,
    entity: "product",
    entityId: ids.join(","),
    detail: action,
  });
  revalidatePath("/shop");
  revalidatePath("/admin/products");
}

export async function adjustInventoryAction(formData: FormData) {
  const session = await requireAdminSession("products:write");
  const id = String(formData.get("id"));
  const delta = Number(formData.get("delta") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim();

  if (!delta) {
    throw new Error("Enter a stock adjustment amount.");
  }

  const product = await adjustProductInventory(id, delta);
  await logActivity({
    action: "inventory_adjusted",
    actor: session.email,
    entity: "product",
    entityId: product.id,
    detail: `${product.name}: ${delta > 0 ? "+" : ""}${delta}${reason ? ` (${reason})` : ""}`,
  });
  revalidatePath("/shop");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
}

export async function saveProductFormAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await saveProductAction(formData);
    return { error: null };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest: string }).digest.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }

    return {
      error: formatAdminError(error),
    };
  }
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
  redirect(`/admin/products/${updated.id}`);
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

export async function transitionOrderStatusAction(formData: FormData) {
  const session = await requireAdminSession("orders:write");
  const orderNumber = String(formData.get("orderNumber"));
  const status = String(formData.get("status")) as Awaited<ReturnType<typeof listOrders>>[number]["status"];
  const order = await updateOrderStatus(orderNumber, status);
  await logActivity({
    action: "order_status_updated",
    actor: session.email,
    entity: "order",
    entityId: order.id,
    detail: `${order.orderNumber} -> ${status}`,
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/order-confirmation/${order.orderNumber}`);
}

export async function saveManagedPageAction(formData: FormData) {
  const session = await requireAdminSession("settings:write");
  const payload = managedPageSchema.parse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    heroHeading: formData.get("heroHeading"),
    heroMedia: String(formData.get("heroMedia") ?? "") || undefined,
    content: formData.get("content"),
    status: formData.get("status"),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    openGraphImage: String(formData.get("openGraphImage") ?? ""),
  });

  const page = await upsertManagedPage({
    ...payload,
    slug: payload.slug ?? slugify(payload.title),
    updatedAt: new Date().toISOString(),
  });

  await logActivity({
    action: "page_saved",
    actor: session.email,
    entity: "page",
    entityId: page.id,
    detail: page.slug,
  });

  revalidatePath(`/${page.slug}`);
  revalidatePath("/admin/pages");
}

export async function deleteManagedPageAction(formData: FormData) {
  const session = await requireAdminSession("settings:write");
  const id = String(formData.get("id"));
  const page = await deleteManagedPage(id);

  await logActivity({
    action: "page_deleted",
    actor: session.email,
    entity: "page",
    entityId: page.id,
    detail: page.slug,
  });

  revalidatePath(`/${page.slug}`);
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function saveJournalPostAction(formData: FormData) {
  const session = await requireAdminSession("settings:write");
  const payload = journalPostSchema.parse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    heroHeading: formData.get("heroHeading"),
    heroMedia: String(formData.get("heroMedia") ?? "") || undefined,
    content: formData.get("content"),
    status: formData.get("status"),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    openGraphImage: String(formData.get("openGraphImage") ?? ""),
    excerpt: formData.get("excerpt"),
    publishedAt: String(formData.get("publishedAt") ?? "") || new Date().toISOString(),
  });

  const existing = payload.id ? await getJournalPostById(payload.id) : null;
  const post = await upsertJournalPost({
    ...existing,
    ...payload,
    slug: payload.slug ?? slugify(payload.title),
    updatedAt: new Date().toISOString(),
    publishedAt: payload.publishedAt || existing?.publishedAt || new Date().toISOString(),
  });

  await logActivity({
    action: existing ? "journal_updated" : "journal_created",
    actor: session.email,
    entity: "journal",
    entityId: post.id,
    detail: post.slug,
  });

  revalidatePath("/journal");
  revalidatePath(`/journal/${post.slug}`);
  revalidatePath("/admin/journal");
  redirect("/admin/journal");
}

export async function deleteJournalPostAction(formData: FormData) {
  const session = await requireAdminSession("settings:write");
  const id = String(formData.get("id"));
  const post = await deleteJournalPost(id);

  await logActivity({
    action: "journal_deleted",
    actor: session.email,
    entity: "journal",
    entityId: post.id,
    detail: post.slug,
  });

  revalidatePath("/journal");
  revalidatePath(`/journal/${post.slug}`);
  revalidatePath("/admin/journal");
  redirect("/admin/journal");
}

export async function installRequestedTaxonomyAction() {
  const session = await requireAdminSession("categories:write");
  const store = await getStoreData();
  const now = new Date().toISOString();
  const requested: Array<{
    name: string;
    slug: string;
    legacySlugs: string[];
    parentCategorySlug?: string;
    shortDescription: string;
    description: string;
  }> = [
    {
      name: "Men",
      slug: "men",
      legacySlugs: [],
      parentCategorySlug: undefined,
      shortDescription: "Men's jewellery and stones curated for bold, grounded styling.",
      description: "Men's jewellery and stones curated through the STONZA admin portal.",
    },
    {
      name: "Women",
      slug: "women",
      legacySlugs: [],
      parentCategorySlug: undefined,
      shortDescription: "Women's jewellery and stones arranged in a clean editorial hierarchy.",
      description: "Women's jewellery and stones curated through the STONZA admin portal.",
    },
    {
      name: "Rings",
      slug: "men-rings",
      legacySlugs: ["men-rings"],
      parentCategorySlug: "men",
      shortDescription: "Men's rings shaped for statement and daily wear.",
      description: "Men's rings managed within the STONZA Men category hierarchy.",
    },
    {
      name: "Bracelets & Chains",
      slug: "men-bracelets-chains",
      legacySlugs: [],
      parentCategorySlug: "men",
      shortDescription: "Men's bracelets and chains presented in one unified rail.",
      description: "Men's bracelets and chains managed within the STONZA Men category hierarchy.",
    },
    {
      name: "Stones",
      slug: "men-stones",
      legacySlugs: ["men-rings-stones", "orig-gem-stones"],
      parentCategorySlug: "men",
      shortDescription: "Loose stones and collector pieces aligned to the men's catalogue.",
      description: "Men's stones managed within the STONZA Men category hierarchy.",
    },
    {
      name: "Rings",
      slug: "women-rings",
      legacySlugs: ["women-rings"],
      parentCategorySlug: "women",
      shortDescription: "Women's rings arranged under the Women parent category.",
      description: "Women's rings managed within the STONZA Women category hierarchy.",
    },
    {
      name: "Bracelets",
      slug: "women-bracelets",
      legacySlugs: ["bracelets"],
      parentCategorySlug: "women",
      shortDescription: "Women's bracelets arranged under the Women parent category.",
      description: "Women's bracelets managed within the STONZA Women category hierarchy.",
    },
    {
      name: "Jewellery Sets",
      slug: "women-jewellery-sets",
      legacySlugs: ["jewellery-sets"],
      parentCategorySlug: "women",
      shortDescription: "Women's jewellery sets arranged under the Women parent category.",
      description: "Women's jewellery sets managed within the STONZA Women category hierarchy.",
    },
    {
      name: "Diamond",
      slug: "women-diamond",
      legacySlugs: ["diamond"],
      parentCategorySlug: "women",
      shortDescription: "Women's diamond-focused pieces arranged under the Women parent category.",
      description: "Women's diamond pieces managed within the STONZA Women category hierarchy.",
    },
    {
      name: "Diamond Nose Pin",
      slug: "women-diamond-nose-pin",
      legacySlugs: ["diamond-sets"],
      parentCategorySlug: "women",
      shortDescription: "Women's diamond nose pin assortment under the Women parent category.",
      description: "Women's diamond nose pin pieces managed within the STONZA Women category hierarchy.",
    },
  ];

  for (const [index, category] of requested.entries()) {
    const existing =
      store.categories.find((entry) => entry.slug === category.slug) ??
      store.categories.find((entry) => category.legacySlugs.includes(entry.slug));

    await upsertCategory({
      ...existing,
      name: category.name,
      slug: category.slug,
      shortDescription: category.shortDescription,
      description: category.description,
      altText: category.name,
      parentCategorySlug: category.parentCategorySlug,
      sortOrder: index + 1,
      featured: existing?.featured ?? false,
      active: true,
      status: "published",
      seoTitle: existing?.seoTitle ?? category.name,
      seoDescription: existing?.seoDescription ?? category.shortDescription,
      openGraphImage: existing?.openGraphImage ?? existing?.featuredImage ?? "",
      createdBy: existing?.createdBy ?? session.email,
      updatedBy: session.email,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      slugHistory:
        existing && existing.slug !== category.slug
          ? [...new Set([...(existing.slugHistory ?? []), existing.slug])]
          : existing?.slugHistory,
    });
  }

  const productRemaps: Array<{
    legacySlugs: string[];
    parentSlug: string;
    subcategorySlug: string;
  }> = [
    { legacySlugs: ["men-rings"], parentSlug: "men", subcategorySlug: "men-rings" },
    { legacySlugs: ["men-rings-stones", "orig-gem-stones"], parentSlug: "men", subcategorySlug: "men-stones" },
    { legacySlugs: ["women-rings"], parentSlug: "women", subcategorySlug: "women-rings" },
    { legacySlugs: ["bracelets"], parentSlug: "women", subcategorySlug: "women-bracelets" },
    { legacySlugs: ["jewellery-sets"], parentSlug: "women", subcategorySlug: "women-jewellery-sets" },
    { legacySlugs: ["diamond"], parentSlug: "women", subcategorySlug: "women-diamond" },
    { legacySlugs: ["diamond-sets"], parentSlug: "women", subcategorySlug: "women-diamond-nose-pin" },
  ];

  for (const product of store.products) {
    const currentSlugs = [...new Set([product.categorySlug, ...(product.categorySlugs ?? []), product.subcategorySlug ?? ""])].filter(Boolean);
    const mapping = productRemaps.find((entry) => currentSlugs.some((slug) => entry.legacySlugs.includes(slug)));
    if (!mapping) continue;

    await upsertProduct({
      ...product,
      categorySlug: mapping.parentSlug,
      categorySlugs: [mapping.parentSlug, mapping.subcategorySlug],
      subcategorySlug: mapping.subcategorySlug,
      updatedAt: now,
    });
  }

  await logActivity({
    action: "category_taxonomy_installed",
    actor: session.email,
    entity: "category",
    entityId: "requested-taxonomy",
    detail: "Installed Men/Women category hierarchy",
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/shop");
}
