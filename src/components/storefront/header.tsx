"use client";

import Link from "next/link";
import { ChevronDown, Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { CartLink } from "@/components/storefront/cart-link";
import { WishlistLink } from "@/components/storefront/wishlist-link";
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
        <div className="container-shell grid min-h-18 grid-cols-[auto_1fr_auto] items-center gap-3 py-3 lg:min-h-24 lg:grid-cols-[1fr_auto_1fr] lg:py-0">
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

          <div className="hidden lg:flex lg:items-center lg:justify-start">
            <Logo dark priority src={logo} alt={logoAlt} className="w-[172px] xl:w-[188px]" />
          </div>

          <nav className="hidden items-center justify-center gap-2 lg:flex">
            {visibleNavigation.map((item) => (
              <div key={item.id} className="group relative">
                <Link
                  href={item.href}
                  className="inline-flex rounded-full border border-[#dbc9ac] bg-white/58 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.24em] text-[#10233a] shadow-[0_10px_28px_rgba(21,17,11,0.05)] hover:-translate-y-0.5 hover:bg-[#10233a] hover:text-white"
                >
                  <span>{item.label}</span>
                  {item.children?.length ? <ChevronDown className="ml-2 h-3.5 w-3.5" /> : null}
                </Link>
                {item.children?.length ? (
                  <div className="invisible absolute left-0 top-full z-20 min-w-56 translate-y-2 rounded-[1.5rem] border border-[#eadfcf] bg-[#fffaf2] p-2 opacity-0 shadow-[0_18px_40px_rgba(21,17,11,0.12)] transition group-hover:visible group-hover:translate-y-3 group-hover:opacity-100">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className="block rounded-[1rem] px-4 py-3 text-sm text-[#10233a] hover:bg-[#10233a] hover:text-white"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 justify-self-end sm:gap-2 lg:justify-end lg:gap-3">
            {showSearch ? (
              <Link
                href="/search"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dcc9ab] bg-white/72 text-[#10233a] hover:border-[#10233a] hover:bg-white hover:text-black"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Link>
            ) : null}
            {showWishlist ? (
              <WishlistLink />
            ) : null}
            {showCart ? (
              <CartLink />
            ) : null}
            <Button asChild variant="outline" className="hidden rounded-full border-[#dcc9ab] bg-white/72 px-5 lg:inline-flex">
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
                <div key={item.id} className="border-b border-[#e8dfd1] pb-4">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between text-lg text-black/82"
                  >
                    <span>{item.label}</span>
                    {item.children?.length ? <ChevronDown className="h-4 w-4" /> : null}
                  </Link>
                  {item.children?.length ? (
                    <div className="mt-3 grid gap-2 pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="text-sm uppercase tracking-[0.16em] text-black/54"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </nav>

            <div className="mt-8 flex flex-col gap-3">
              <Button asChild className="rounded-full">
                <Link href={contactHref} onClick={() => setOpen(false)}>
                  {contactLabel}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
