import { WishlistPageClient } from "@/components/storefront/wishlist-page-client";
import { listProducts } from "@/lib/data/store";
import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata;

export default async function WishlistPage() {
  const products = await listProducts();
  return <WishlistPageClient products={products} />;
}
