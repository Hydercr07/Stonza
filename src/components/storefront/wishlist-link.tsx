"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useWishlist } from "@/components/storefront/wishlist-store";

export function WishlistLink() {
  const { count } = useWishlist();

  return (
    <Link
      href="/wishlist"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dcc9ab] bg-white/72 text-[#10233a] hover:border-[#10233a] hover:bg-white hover:text-black"
      aria-label={`Wishlist${count ? ` with ${count} item${count === 1 ? "" : "s"}` : ""}`}
    >
      <Star className="h-4 w-4" />
      {count ? (
        <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#171717] px-1 text-[10px] font-medium text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
