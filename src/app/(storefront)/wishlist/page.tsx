import { WishlistPageClient } from "@/components/storefront/wishlist-page-client";
import { listProducts } from "@/lib/data/store";

export default async function WishlistPage() {
  const products = await listProducts();
  return <WishlistPageClient products={products} />;
}
