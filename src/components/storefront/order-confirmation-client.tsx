"use client";

import { useEffect } from "react";
import { useCart } from "@/components/storefront/cart-store";

export function OrderConfirmationClient() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
