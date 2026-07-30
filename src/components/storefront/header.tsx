"use client";

import Link from "next/link";
import { ChevronDown, Menu, Search, ShoppingBag, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/domain";

const utilityLinks = [
  { href: "/about", label: "Stone Story" },
  { href: "/collections", label: "Curated Sets" },
  { href: "/contact", label: "Concierge" },
];

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
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visibleNavigation = navigation.filter((item) => item.visible);

  return (
    <>
      <header
        className={cn(
          `${sticky ? "sticky top-0" : "relative"} z-40`,
          scrolled
            ? "border-b border-[#d9cfbf] bg-[rgba(255,250,242,0.96)] shadow-[0_16px_36px_rgba(24,18,12,0.08)] backdrop-blur-xl"
            : "border-b border-[#e8dfd1] bg-[rgba(255,250,242,0.94)]",
        )}
      >
        <div className="hidden border-b border-[#eadfcf] bg-[#10233a] text-[#f3ebde] lg:block">
          <div className="container-shell flex min-h-11 items-center justify-between gap-6 text-[11px] uppercase tracking-[0.24em]">
            <p className="text-[#f3ebde]/76">Private stone appointments and collector sourcing</p>
            <div className="flex items-center gap-6 text-[#f3ebde]/84">
              <button type="button" className="inline-flex items-center gap-1.5 hover:text-white">
                Language: English
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="inline-flex items-center gap-1.5 hover:text-white">
                Currency: USD
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <Link href={contactHref} className="hover:text-white">
                My Account
              </Link>
            </div>
          </div>
        </div>

        <div className="container-shell flex min-h-18 items-center justify-between gap-3 py-3 lg:min-h-24 lg:py-0">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d8ccb9] bg-white text-[#171717]"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo dark priority src={logo} alt={logoAlt} className="w-[126px] sm:w-[144px]" />
          </div>

          <div className="hidden lg:flex lg:flex-1 lg:items-center lg:gap-8">
            <Logo dark priority src={logo} alt={logoAlt} className="w-[172px] xl:w-[188px]" />
            <nav className="flex items-center gap-6 text-[12px] uppercase tracking-[0.18em] text-black/72 xl:gap-8">
              {visibleNavigation.map((item) => (
                <Link key={item.href} href={item.href} className="py-8 hover:text-black">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 lg:flex-1 lg:justify-end lg:gap-3">
            <div className="hidden items-center gap-5 text-[11px] uppercase tracking-[0.18em] text-black/54 xl:flex">
              {utilityLinks.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-black">
                  {item.label}
                </Link>
              ))}
            </div>
            {showSearch ? (
              <Link
                href="/search"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-black/70 hover:border-[#d9cfbf] hover:bg-white hover:text-black"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Link>
            ) : null}
            {showWishlist ? (
              <Link
                href="/wishlist"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-black/70 hover:border-[#d9cfbf] hover:bg-white hover:text-black"
                aria-label="Wishlist"
              >
                <Star className="h-4 w-4" />
              </Link>
            ) : null}
            {showCart ? (
              <Link
                href="/cart"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-black/70 hover:border-[#d9cfbf] hover:bg-white hover:text-black"
                aria-label="Cart"
              >
                <ShoppingBag className="h-4 w-4" />
              </Link>
            ) : null}
            <Button asChild variant="outline" className="hidden rounded-full border-[#cdbda7] bg-white/72 px-5 lg:inline-flex">
              <Link href={contactHref}>{contactLabel}</Link>
            </Button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/36 backdrop-blur-sm lg:hidden">
          <div className="absolute inset-y-0 left-0 w-[88%] max-w-sm overflow-y-auto bg-[#fffaf2] p-6 shadow-[0_20px_60px_rgba(20,16,10,0.18)]">
            <div className="mb-8 flex items-center justify-between">
              <Logo dark src={logo} alt={logoAlt} className="w-[148px]" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[#d8ccb9] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-black/70"
              >
                Close
              </button>
            </div>

            <div className="rounded-[1.75rem] bg-[#10233a] px-5 py-4 text-[#f3ebde]">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#f3ebde]/68">STONZA service</p>
              <p className="mt-2 text-lg leading-7">Concierge sourcing, private previews and protected global delivery.</p>
            </div>

            <nav className="mt-8 flex flex-col gap-4">
              {visibleNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-[#e8dfd1] pb-4 text-lg text-black/82"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-8 flex flex-col gap-3">
              <Button asChild className="rounded-full">
                <Link href={contactHref} onClick={() => setOpen(false)}>
                  {contactLabel}
                </Link>
              </Button>
              {utilityLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-sm uppercase tracking-[0.16em] text-black/56"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
