import { CheckoutForm } from "@/components/storefront/checkout-form";
import { listProducts } from "@/lib/data/store";

export default async function CheckoutPage() {
  const products = await listProducts();
  return <CheckoutForm products={products} />;
}
