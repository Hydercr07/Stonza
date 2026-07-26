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
  const midpoint = Math.ceil(visibleNavigation.length / 2);
  const leftNavigation = visibleNavigation.slice(0, midpoint);
  const rightNavigation = visibleNavigation.slice(midpoint);

  return (
    <>
      <header
        className={cn(
          `${sticky ? "sticky top-0" : "relative"} z-40 transition-all duration-300`,
          scrolled ? "border-b border-black/8 bg-[rgba(255,253,249,0.96)] shadow-[0_12px_34px_rgba(26,20,12,0.06)] backdrop-blur-xl" : "border-b border-[#ece2d5] bg-[rgba(255,253,249,0.94)]",
        )}
      >
        <div className="container-shell grid min-h-22 grid-cols-[auto_1fr_auto] items-center gap-4 py-2 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center gap-5 md:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <nav className="hidden items-center gap-8 text-[13px] uppercase tracking-[0.12em] text-black/72 md:flex">
            {leftNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="relative py-2 hover:text-black">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex justify-center">
            <Logo priority src={logo} alt={logoAlt} className="w-[160px] md:w-[220px]" />
          </div>

          <div className="flex items-center justify-end gap-3">
            <nav className="hidden items-center gap-8 text-[13px] uppercase tracking-[0.12em] text-black/72 md:flex">
              {rightNavigation.map((item) => (
                <Link key={item.href} href={item.href} className="relative py-2 hover:text-black">
                  {item.label}
                </Link>
              ))}
            </nav>
            {showSearch ? (
              <Link
                href="/search"
                className="inline-flex h-10 w-10 items-center justify-center text-black/70 hover:text-black"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Link>
            ) : null}
            {showWishlist ? (
              <Link
                href="/wishlist"
                className="inline-flex h-10 w-10 items-center justify-center text-black/70 hover:text-black"
                aria-label="Wishlist"
              >
                <Star className="h-4 w-4" />
              </Link>
            ) : null}
            {showCart ? (
              <Link
                href="/cart"
                className="inline-flex h-10 w-10 items-center justify-center text-black/70 hover:text-black"
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
