"use client";

import { useEffect } from "react";
import { useCart } from "@/components/storefront/cart-store";

export function OrderConfirmationClient() {
  const { clear } = useCart();

  // Intentionally runs once on mount, not whenever `clear`'s identity
  // changes -- this page should empty the cart exactly once after a
  // successful order, not every time the cart context re-renders.
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
