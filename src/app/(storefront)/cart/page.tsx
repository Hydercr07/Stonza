import { CartPageClient } from "@/components/storefront/cart-page-client";
import { listProducts } from "@/lib/data/store";

export default async function CartPage() {
  const products = await listProducts();
  return <CartPageClient products={products} />;
}
