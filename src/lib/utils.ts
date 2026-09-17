import { getEffectivePrice } from "@/lib/commerce";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number, currency = "PKR") {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(safeAmount);
  const normalizedCurrency = currency?.trim().toUpperCase() === "PKR" ? "PKR" : "PKR";

  return `${normalizedCurrency} ${formatted}`;
}

/**
 * Turns a URL slug into a presentable label ("women-diamond-nose-pin" ->
 * "Women Diamond Nose Pin") for the spots that only have a slug on hand
 * (e.g. a product card showing its category/collection) and would
 * otherwise print the raw, hyphenated slug straight to customers.
 */
export function humanizeSlug(slug: string | undefined | null) {
  if (!slug) return "";
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}

export function isRemoteAsset(path: string) {
  return /^https?:\/\//i.test(path);
}

export function getProductDisplayPrice(product: { price: number; salePrice?: number }) {
  return getEffectivePrice(product);
}
