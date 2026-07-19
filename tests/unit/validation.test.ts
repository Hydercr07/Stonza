import { describe, expect, it } from "vitest";
import { productSchema } from "@/lib/validation/admin";

describe("product validation", () => {
  it("accepts a valid product payload", () => {
    const result = productSchema.safeParse({
      name: "Stone One",
      sku: "SKU-1",
      shortDescription: "A luxurious natural stone with strong provenance.",
      description: "<p>Longer editorial description for the natural stone.</p>",
      price: 1000,
      inventoryQuantity: 1,
      categorySlug: "statement-stones",
      collectionSlug: "midnight-vein",
      stoneType: "Obsidian",
      origin: "Pakistan",
      featuredImage: "/placeholders/product-obsidian.svg",
      status: "draft",
      featured: true,
      newArrival: false,
      allowCartPurchase: true,
      allowEnquiry: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid payloads", () => {
    const result = productSchema.safeParse({
      name: "",
      sku: "1",
      shortDescription: "short",
      description: "tiny",
      price: -1,
      inventoryQuantity: -2,
      categorySlug: "",
      collectionSlug: "",
      stoneType: "",
      origin: "",
      featuredImage: "",
      status: "draft",
      featured: false,
      newArrival: false,
      allowCartPurchase: true,
      allowEnquiry: true,
    });

    expect(result.success).toBe(false);
  });
});
