import { describe, expect, it } from "vitest";
import { canPurchaseProduct, getEffectivePrice, validateCartQuantity } from "@/lib/commerce";

describe("commerce rules", () => {
  it("uses sale price when lower than base price", () => {
    expect(getEffectivePrice({ price: 3200, salePrice: 2800 })).toBe(2800);
  });

  it("prevents purchasing unavailable products", () => {
    expect(canPurchaseProduct({ allowCartPurchase: true, inventoryQuantity: 0, status: "published" })).toBe(false);
    expect(canPurchaseProduct({ allowCartPurchase: true, inventoryQuantity: 2, status: "published" })).toBe(true);
  });

  it("enforces one-of-one cart rules", () => {
    expect(validateCartQuantity(2, 5, true)).toBe(false);
    expect(validateCartQuantity(1, 1, true)).toBe(true);
  });
});
