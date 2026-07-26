"use client";

import Link from "next/link";
import { ChevronRight, Menu, Search, ShoppingBag, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/shared/ui/button";
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
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          `${sticky ? "sticky top-0" : "relative"} z-40 transition-all duration-300`,
          scrolled ? "border-b border-white/10 bg-[#0d0e0f]/92 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl" : "bg-transparent",
        )}
      >
        <div className="border-b border-white/8 bg-black/25">
          <div className="container-shell flex min-h-11 items-center justify-between gap-4 text-[11px] uppercase tracking-[0.28em] text-white/55">
            <p className="hidden md:block">Worldwide shipping for collector-grade natural stones</p>
            <p className="md:hidden">Collector-grade natural stones</p>
            <Link href={contactHref} className="inline-flex items-center gap-2 text-white/72 hover:text-white">
              Concierge support
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        <div className="container-shell flex min-h-20 items-center gap-6">
          <div className="flex flex-1 items-center gap-5">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo light priority src={logo} alt={logoAlt} />
          </div>
          <nav className="hidden items-center gap-7 text-sm text-white/72 md:flex">
            {navigation.filter((item) => item.visible).map((item) => (
              <Link key={item.href} href={item.href} className="relative py-2 hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
            {showSearch ? (
              <Link
                href="/search"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/70 hover:text-white"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Link>
            ) : null}
            {showWishlist ? (
              <Link
                href="/wishlist"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/70 hover:text-white"
                aria-label="Wishlist"
              >
                <Star className="h-4 w-4" />
              </Link>
            ) : null}
            {showCart ? (
              <Link
                href="/cart"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/70 hover:text-white"
                aria-label="Cart"
              >
                <ShoppingBag className="h-4 w-4" />
              </Link>
            ) : null}
            <Button asChild variant="gold" className="hidden md:inline-flex">
              <Link href={contactHref}>{contactLabel}</Link>
            </Button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden">
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm border-r border-white/12 bg-[#121314] p-6">
            <div className="mb-10 flex items-center justify-between">
              <Logo light src={logo} alt={logoAlt} />
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.2em]">
                Close
              </button>
            </div>
            <nav className="flex flex-col gap-5 text-lg text-white/80">
              {navigation.filter((item) => item.visible).map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-white/8 pb-4">
                  {item.label}
                  <ChevronRight className="h-4 w-4 text-white/40" />
                </Link>
              ))}
              <Link href={contactHref} onClick={() => setOpen(false)} className="mt-4">
                {contactLabel}
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
