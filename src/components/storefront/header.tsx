"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/domain";

export function Header({
  logo,
  logoAlt,
  contactLabel,
  contactHref,
  navigation,
  showSearch,
  showWishlist,
  showCart,
  sticky,
}: {
  logo: string;
  logoAlt: string;
  contactLabel: string;
  contactHref: string;
  navigation: NavigationItem[];
  showSearch: boolean;
  showWishlist: boolean;
  showCart: boolean;
  sticky: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visibleNavigation = navigation.filter((item) => item.visible);

  return (
    <>
      <header
        className={cn(
          `${sticky ? "sticky top-0" : "relative"} z-40 transition-all duration-300`,
          scrolled ? "border-b border-black/8 bg-[rgba(255,253,249,0.96)] shadow-[0_12px_34px_rgba(26,20,12,0.06)] backdrop-blur-xl" : "border-b border-[#ece2d5] bg-[rgba(255,253,249,0.94)]",
        )}
      >
        <div className="container-shell grid min-h-20 grid-cols-[auto_1fr_auto] items-center gap-4 py-2 lg:grid-cols-[auto_1fr_auto]">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo dark priority src={logo} alt={logoAlt} className="w-[132px] sm:w-[150px]" />
          </div>

          <div className="hidden items-center lg:flex">
            <Logo dark priority src={logo} alt={logoAlt} className="w-[165px] xl:w-[185px]" />
          </div>

          <nav className="hidden items-center justify-center gap-6 text-[12px] uppercase tracking-[0.12em] text-black/72 lg:flex xl:gap-8">
            {visibleNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="relative py-2 hover:text-black">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-1 sm:gap-2 lg:gap-3">
            {showSearch ? (
              <Link
                href="/search"
                className="inline-flex h-9 w-9 items-center justify-center text-black/70 hover:text-black sm:h-10 sm:w-10"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Link>
            ) : null}
            {showWishlist ? (
              <Link
                href="/wishlist"
                className="inline-flex h-9 w-9 items-center justify-center text-black/70 hover:text-black sm:h-10 sm:w-10"
                aria-label="Wishlist"
              >
                <Star className="h-4 w-4" />
              </Link>
            ) : null}
            {showCart ? (
              <Link
                href="/cart"
                className="inline-flex h-9 w-9 items-center justify-center text-black/70 hover:text-black sm:h-10 sm:w-10"
                aria-label="Cart"
              >
                <ShoppingBag className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden">
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm border-r border-black/10 bg-[#f7f2ea] p-6">
            <div className="mb-10 flex items-center justify-between">
              <Logo src={logo} alt={logoAlt} />
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-black/10 px-3 py-2 text-xs uppercase tracking-[0.2em]">
                Close
              </button>
            </div>
            <nav className="flex flex-col gap-5 text-lg text-black/80">
              {visibleNavigation.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-black/8 pb-4">
                  {item.label}
                </Link>
              ))}
              <Link href={contactHref} onClick={() => setOpen(false)} className="mt-4 text-sm uppercase tracking-[0.18em] text-black/60">
                {contactLabel}
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
