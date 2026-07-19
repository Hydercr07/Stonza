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
    !["sold", "out_of_stock", "archived", "trash"].includes(product.status)
  );
}

export function validateCartQuantity(quantity: number, inventory: number, oneOfOne: boolean) {
  if (quantity <= 0) return false;
  if (oneOfOne && quantity > 1) return false;
  return quantity <= inventory;
}
