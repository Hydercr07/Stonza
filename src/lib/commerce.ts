import type { Product } from "@/types/domain";

export function getEffectivePrice(product: Pick<Product, "price" | "salePrice">) {
  if (typeof product.salePrice === "number" && product.salePrice > 0 && product.salePrice < product.price) {
    return product.salePrice;
  }

  return product.price;
}

export function canPurchaseProduct(product: Pick<Product, "allowCartPurchase" | "inventoryQuantity" | "status">) {
  return (
    product.allowCartPurchase &&
    product.inventoryQuantity > 0 &&
    // "reserved" is a deliberate hold state between published and sold (an
    // admin marking a one-of-a-kind stone aside for a customer mid-order) --
    // it must never be purchasable, or a second customer can buy the same
    // physical item out from under the one it was held for.
    !["reserved", "sold", "out_of_stock", "archived", "trash"].includes(product.status)
  );
}

export function validateCartQuantity(quantity: number, inventory: number, oneOfOne: boolean) {
  if (quantity <= 0) return false;
  if (oneOfOne && quantity > 1) return false;
  return quantity <= inventory;
}

export function hasDiscount(product: Pick<Product, "price" | "salePrice">) {
  return getEffectivePrice(product) < product.price;
}
