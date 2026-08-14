"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/storefront/cart-store";

export function CartLink() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dcc9ab] bg-white/72 text-[#10233a] hover:border-[#10233a] hover:bg-white hover:text-black"
      aria-label={`Cart${count ? ` with ${count} item${count === 1 ? "" : "s"}` : ""}`}
    >
      <ShoppingBag className="h-4 w-4" />
      {count ? (
        <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#171717] px-1 text-[10px] font-medium text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
