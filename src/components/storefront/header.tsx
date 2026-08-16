"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Menu, Search, ShoppingBag, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import type { Category, Collection, Product, SiteSettings } from "@/types/domain";
import { SearchDrawer } from "@/components/storefront/search-drawer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { Button } from "@/components/shared/ui/button";

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
  collections,
  products,
}: {
  settings: SiteSettings;
  categories: Category[];
  collections: Collection[];
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
        .slice(0, 4),
    [categoryHrefs, settings.header.navigation],
  );
  const featuredCollections = useMemo(
    () => collections.filter((collection) => collection.featured).slice(0, 4),
    [collections],
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
          "z-40 border-b border-black/8 bg-[rgba(255,255,255,0.94)] backdrop-blur-xl transition duration-200",
          scrolled ? "shadow-[0_14px_30px_rgba(15,18,24,0.08)]" : "shadow-none",
        )}
      >
        <div className="container-shell">
          <div className="flex min-h-16 items-center justify-between gap-3 lg:min-h-20">
            <div className="flex items-center gap-2 lg:w-[28%]">
              <MobileNavigation navGroups={navGroups} utilityLinks={utilityLinks} featuredCollections={featuredCollections} />
              <p className="hidden text-[10px] uppercase tracking-[0.26em] text-black/42 lg:block">
                New drops every week
              </p>
            </div>

            <div className="flex justify-center lg:w-[44%]">
              <Logo
                dark
                href="/"
                priority
                src={settings.brand.logo || settings.brand.lightLogo}
                alt={`${settings.brand.name} ${settings.brand.tagline}`}
                className="w-[88px] sm:w-[104px] lg:w-[122px]"
              />
            </div>

            <div className="flex items-center justify-end gap-1 sm:gap-2 lg:w-[28%]">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/72 hover:border-black/25 hover:text-black"
                aria-label="Open search"
              >
                <Search className="h-4 w-4" />
              </button>
              <Link
                href="/wishlist"
                className="hidden rounded-full border border-black/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-black/58 transition hover:border-black/25 hover:text-black sm:inline-flex"
              >
                Saved
              </Link>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/72 hover:border-black/25 hover:text-black"
                aria-label="Open cart"
              >
                <ShoppingBag className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="hidden min-h-12 items-center justify-between gap-6 border-t border-black/7 text-[12px] uppercase tracking-[0.24em] lg:flex">
            <nav className="flex items-center gap-7">
              {navGroups.slice(0, 6).map((group) => (
                <DesktopMegaMenu key={group.category.id} group={group} />
              ))}
            </nav>
            <div className="flex items-center gap-6 text-black/44">
              {utilityLinks.map((item) => (
                <Link key={item.id} href={item.href} className="hover:text-black">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      <SearchDrawer open={searchOpen} onOpenChange={setSearchOpen} products={products} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} products={products} />
    </>
  );
}

function DesktopMegaMenu({ group }: { group: NavGroup }) {
  return (
    <div className="group relative">
      <Link href={`/categories/${group.category.slug}`} className="flex h-12 items-center gap-1.5 text-black/62 hover:text-black">
        <span>{group.category.name}</span>
        {group.children.length ? <ChevronDown className="h-3.5 w-3.5" /> : null}
      </Link>

      {group.children.length ? (
        <div className="pointer-events-none absolute left-0 top-full z-30 w-[min(34rem,82vw)] translate-y-2 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <div className="rounded-[1.5rem] border border-black/8 bg-white p-5 shadow-[0_24px_60px_rgba(18,24,32,0.12)]">
            <div className="grid gap-3 sm:grid-cols-2">
              {group.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.slug}`}
                  className="rounded-[1.1rem] border border-black/6 px-4 py-3 transition hover:border-black/18 hover:bg-[#faf7f1]"
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-black/38">{group.category.name}</p>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-black/78">{child.name}</p>
                  <p className="mt-1 text-sm leading-6 text-black/48">{child.shortDescription || child.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MobileNavigation({
  navGroups,
  utilityLinks,
  featuredCollections,
}: {
  navGroups: NavGroup[];
  utilityLinks: SiteSettings["header"]["navigation"];
  featuredCollections: Collection[];
}) {
  const [stack, setStack] = useState<string[]>([]);
  const activeGroup = stack.length ? navGroups.find((group) => group.category.slug === stack[stack.length - 1]) ?? null : null;

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (!open) setStack([]);
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/72 hover:border-black/25 hover:text-black lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/42 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[min(88vw,26rem)] overflow-hidden bg-[#fbf8f2] shadow-[0_20px_80px_rgba(12,16,22,0.28)]">
          <div className="flex min-h-full flex-col">
            <div className="flex items-center justify-between border-b border-black/8 px-5 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.26em] text-black/40">
                  {activeGroup ? activeGroup.category.name : "Browse"}
                </p>
                <p className="mt-1 text-lg font-semibold text-black">
                  {activeGroup ? "Shop by category" : "Navigation"}
                </p>
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

            {activeGroup ? (
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <button
                  type="button"
                  className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/54"
                  onClick={() => setStack([])}
                >
                  <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                  Back
                </button>
                <div className="grid gap-3">
                  <Link
                    href={`/categories/${activeGroup.category.slug}`}
                    className="rounded-[1.1rem] border border-black/8 bg-white px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-black/82"
                  >
                    Shop all {activeGroup.category.name}
                  </Link>
                  {activeGroup.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/categories/${child.slug}`}
                      className="rounded-[1.1rem] border border-black/8 bg-white px-4 py-4"
                    >
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black/82">{child.name}</p>
                      <p className="mt-1 text-sm leading-6 text-black/52">{child.shortDescription || child.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="grid gap-3">
                  {navGroups.slice(0, 8).map((group) => (
                    <button
                      key={group.category.id}
                      type="button"
                      className="flex items-center justify-between rounded-[1.1rem] border border-black/8 bg-white px-4 py-4 text-left"
                      onClick={() => setStack([group.category.slug])}
                    >
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black/82">{group.category.name}</p>
                        <p className="mt-1 text-sm leading-6 text-black/50">
                          {group.children.length ? `${group.children.length} linked subcategories` : group.category.shortDescription || "Browse the edit"}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-black/42" />
                    </button>
                  ))}
                </div>

                {featuredCollections.length ? (
                  <div className="mt-8">
                    <p className="mb-3 text-[10px] uppercase tracking-[0.26em] text-black/40">Featured collections</p>
                    <div className="grid gap-3">
                      {featuredCollections.map((collection) => (
                        <Link
                          key={collection.id}
                          href={`/collections/${collection.slug}`}
                          className="rounded-[1.1rem] border border-black/8 bg-[#121923] px-4 py-4 text-white"
                        >
                          <p className="text-sm font-semibold uppercase tracking-[0.14em]">{collection.name}</p>
                          <p className="mt-1 text-sm leading-6 text-white/62">{collection.description}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {utilityLinks.length ? (
                  <div className="mt-8">
                    <p className="mb-3 text-[10px] uppercase tracking-[0.26em] text-black/40">Store</p>
                    <div className="grid gap-2">
                      {utilityLinks.map((item) => (
                        <Link key={item.id} href={item.href} className="rounded-full border border-black/8 px-4 py-3 text-sm text-black/66">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <div className="border-t border-black/8 px-5 py-4">
              <Button asChild className="w-full">
                <Link href="/shop">Shop everything</Link>
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
