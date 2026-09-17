import { CartPageClient } from "@/components/storefront/cart-page-client";
import { listProducts } from "@/lib/data/store";
import { noIndexMetadata } from "@/lib/seo";

// Per-visitor state, not content -- indexing it would show search results
// full of empty/other-people's carts and dilute the real content pages.
export const metadata = noIndexMetadata;

export default async function CartPage() {
  const products = await listProducts();
  return <CartPageClient products={products} />;
}
