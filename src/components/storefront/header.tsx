"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/journal", label: "Journal" },
  { href: "/authenticity", label: "Authenticity" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header({
  contactLabel,
  contactHref,
}: {
  contactLabel: string;
  contactHref: string;
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
          "sticky top-0 z-40 border-b transition-all duration-300",
          scrolled ? "border-white/12 bg-black/80 backdrop-blur-xl" : "border-transparent bg-transparent",
        )}
      >
        <div className="container-shell flex min-h-20 items-center gap-6">
          <div className="flex flex-1 items-center gap-5">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo light priority />
          </div>
          <nav className="hidden items-center gap-7 text-sm text-white/72 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
            <Link href="/search" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 hover:text-white" aria-label="Search">
              <Search className="h-4 w-4" />
            </Link>
            <Link href="/wishlist" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 hover:text-white" aria-label="Wishlist">
              <Star className="h-4 w-4" />
            </Link>
            <Link href="/cart" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 hover:text-white" aria-label="Cart">
              <ShoppingBag className="h-4 w-4" />
            </Link>
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
              <Logo light />
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.2em]">
                Close
              </button>
            </div>
            <nav className="flex flex-col gap-5 text-lg text-white/80">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <Link href={contactHref} onClick={() => setOpen(false)}>
                {contactLabel}
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
