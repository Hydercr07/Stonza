import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import type {
  Category,
  Collection,
  HeroSettings,
  HomepageSection,
  JournalPost,
  ManagedPage,
  MediaAsset,
  Product,
  StoreData,
} from "@/types/domain";
import { slugify } from "@/lib/utils";

const storePath = path.join(process.cwd(), "src", "data", "dev-store.json");

async function readStore(): Promise<StoreData> {
  noStore();
  const raw = await fs.readFile(storePath, "utf8");
  return JSON.parse(raw) as StoreData;
}

async function writeStore(store: StoreData) {
  await fs.writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function getStoreData() {
  return readStore();
}

export async function listMediaAssets(): Promise<MediaAsset[]> {
  const store = await readStore();
  return store.mediaAssets.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function getSiteSettings() {
  const store = await readStore();
  return store.settings;
}

export async function getHeroSettings(): Promise<HeroSettings> {
  const store = await readStore();
  return store.hero;
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const store = await readStore();
  return store.homepageSections.filter((section) => section.enabled).sort((a, b) => a.order - b.order);
}

export async function listCategories(): Promise<Category[]> {
  const store = await readStore();
  return store.categories.sort((a, b) => a.sortOrder - b.sortOrder);
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
  let items = store.products.filter((product) => ["published", "reserved", "out_of_stock", "sold"].includes(product.status));

  if (options?.featuredOnly) items = items.filter((product) => product.featured);
  if (options?.newOnly) items = items.filter((product) => product.newArrival);
  if (options?.collectionSlug) items = items.filter((product) => product.collectionSlug === options.collectionSlug);
  if (options?.categorySlug) items = items.filter((product) => product.categorySlug === options.categorySlug);
  if (options?.search) {
    const query = options.search.toLowerCase();
    items = items.filter((product) =>
      [product.name, product.shortDescription, product.stoneType, product.origin, ...product.searchKeywords]
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

export async function upsertCategory(payload: Omit<Category, "id" | "slug"> & { id?: string; slug?: string }) {
  const store = await readStore();
  const id = payload.id ?? `cat-${crypto.randomUUID()}`;
  const slug = payload.slug || slugify(payload.name);
  const nextCategory: Category = { ...payload, id, slug };
  const index = store.categories.findIndex((item) => item.id === id);

  if (index >= 0) {
    store.categories[index] = nextCategory;
  } else {
    store.categories.push(nextCategory);
  }

  await writeStore(store);
  return nextCategory;
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
  store.hero = payload;
  await writeStore(store);
  return store.hero;
}

export async function updateHomepageSections(sections: HomepageSection[]) {
  const store = await readStore();
  store.homepageSections = sections;
  await writeStore(store);
  return store.homepageSections;
}

export async function updateSiteSettings(settings: StoreData["settings"]) {
  const store = await readStore();
  store.settings = settings;
  await writeStore(store);
  return store.settings;
}

export async function upsertProduct(payload: Product) {
  const store = await readStore();
  const index = store.products.findIndex((product) => product.id === payload.id);

  if (index >= 0) {
    store.products[index] = payload;
  } else {
    store.products.push(payload);
  }

  await writeStore(store);
  return payload;
}

export async function addMediaAsset(asset: MediaAsset) {
  const store = await readStore();
  store.mediaAssets.unshift(asset);
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
