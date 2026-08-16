"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import type { Category, Product, SiteSettings } from "@/types/domain";
import { SearchDrawer } from "@/components/storefront/search-drawer";
import { CartDrawer } from "@/components/storefront/cart-drawer";

type NavGroup = {
  category: Category;
  children: Category[];
};

function buildNavGroups(categories: Category[]) {
  const visible = categories
    .filter((category) => category.active && category.status === "published")
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const parentBySlug = new Map(visible.map((category) => [category.slug, category]));
  const groups = new Map<string, NavGroup>();

  for (const category of visible) {
    const parentSlug = category.parentCategorySlug;
    if (!parentSlug || !parentBySlug.has(parentSlug)) {
      groups.set(category.slug, { category, children: [] });
      continue;
    }

    const group = groups.get(parentSlug) ?? {
      category: parentBySlug.get(parentSlug)!,
      children: [],
    };
    group.children.push(category);
    groups.set(parentSlug, group);
  }

  return [...groups.values()].sort((left, right) => left.category.sortOrder - right.category.sortOrder);
}

export function Header({
  settings,
  categories,
  products,
}: {
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const navGroups = useMemo(() => buildNavGroups(categories), [categories]);
  const categoryHrefs = useMemo(
    () => new Set(navGroups.map((group) => `/categories/${group.category.slug}`)),
    [navGroups],
  );
  const utilityLinks = useMemo(
    () =>
      settings.header.navigation
        .filter((item) => item.visible && !categoryHrefs.has(item.href))
        .sort((left, right) => left.order - right.order)
        .slice(0, 6),
    [categoryHrefs, settings.header.navigation],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    const onCartOpen = () => setCartOpen(true);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("stonza:cart-open", onCartOpen);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("stonza:cart-open", onCartOpen);
    };
  }, []);

  return (
    <>
      <header
        className={cn(
          settings.header.sticky ? "sticky top-0" : "relative",
          "z-40 border-b border-black/8 bg-white/95 backdrop-blur-xl transition duration-200",
          scrolled ? "shadow-[0_10px_24px_rgba(15,18,24,0.06)]" : "shadow-none",
        )}
      >
        <div className="container-shell">
          <div className="grid min-h-16 grid-cols-[5.5rem_1fr_5.5rem] items-center gap-2 sm:min-h-[4.6rem]">
            <div className="flex items-center justify-start">
              <NavigationDrawer
                brandName={settings.brand.name}
                brandTagline={settings.brand.tagline}
                logoSrc={settings.brand.logo || settings.brand.lightLogo}
                navGroups={navGroups}
                utilityLinks={utilityLinks}
              />
            </div>

            <div className="flex justify-center">
              <Logo
                dark
                href="/"
                priority
                src={settings.brand.logo || settings.brand.lightLogo}
                alt={`${settings.brand.name} ${settings.brand.tagline}`}
                className="w-[88px] sm:w-[102px] lg:w-[112px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/72 hover:border-black/18 hover:text-black"
                aria-label="Open search"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/72 hover:border-black/18 hover:text-black"
                aria-label="Open cart"
              >
                <ShoppingBag className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <SearchDrawer open={searchOpen} onOpenChange={setSearchOpen} products={products} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} products={products} />
    </>
  );
}

function NavigationDrawer({
  brandName,
  brandTagline,
  logoSrc,
  navGroups,
  utilityLinks,
}: {
  brandName: string;
  brandTagline: string;
  logoSrc: string;
  navGroups: NavGroup[];
  utilityLinks: SiteSettings["header"]["navigation"];
}) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  function toggleGroup(slug: string) {
    setExpandedGroups((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (!open) setExpandedGroups([]);
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/72 hover:border-black/18 hover:text-black"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/32" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[min(92vw,26rem)] max-w-[26rem] overflow-hidden bg-white shadow-[0_16px_48px_rgba(18,20,24,0.12)] lg:w-[24rem]">
          <div className="flex min-h-full flex-col">
            <div className="flex items-start justify-between border-b border-black/8 px-6 py-5">
              <div>
                <Logo dark href="/" src={logoSrc} alt={`${brandName} ${brandTagline}`} className="w-[104px]" />
                <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-black/42">{brandTagline}</p>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/72"
                  aria-label="Close navigation menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <nav className="space-y-1">
                {navGroups.map((group) => {
                  const isExpanded = expandedGroups.includes(group.category.slug);
                  const hasChildren = group.children.length > 0;

                  return (
                    <div key={group.category.id} className="border-b border-black/6 py-1">
                      <div className="flex items-center justify-between gap-3">
                        <Link
                          href={`/categories/${group.category.slug}`}
                          className="flex-1 py-3 text-[15px] font-medium tracking-[0.01em] text-[#171717]"
                        >
                          {group.category.name}
                        </Link>
                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={() => toggleGroup(group.category.slug)}
                            className="inline-flex h-8 w-8 items-center justify-center text-black/46"
                            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${group.category.name}`}
                            aria-expanded={isExpanded}
                          >
                            <ChevronDown
                              className={cn("h-4 w-4 transition-transform duration-200", isExpanded ? "rotate-180" : "")}
                            />
                          </button>
                        ) : null}
                      </div>

                      {hasChildren && isExpanded ? (
                        <div className="pb-3 pl-4">
                          {group.children.map((child) => (
                            <Link
                              key={child.id}
                              href={`/categories/${child.slug}`}
                              className="block py-2 text-sm text-black/68"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </nav>

              {utilityLinks.length ? (
                <div className="mt-8 border-t border-black/8 pt-5">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-black/42">More</p>
                  <div className="space-y-1">
                    {utilityLinks.map((item) => (
                      <Link key={item.id} href={item.href} className="block py-2 text-sm text-black/68">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
