"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Logo } from "@/components/shared/logo";
import { sidebarCategoryHierarchy } from "@/lib/category-hierarchy";
import { cn } from "@/lib/utils";
import type { Category, NavigationItem, Product, SiteSettings } from "@/types/domain";
import { SearchDrawer } from "@/components/storefront/search-drawer";
import { CartDrawer } from "@/components/storefront/cart-drawer";

type NavGroup = {
  category: Category;
  children: Category[];
};

type DrawerLinkItem = {
  id: string;
  label: string;
  href: string;
  children?: Array<{
    id: string;
    label: string;
    href: string;
  }>;
};

function buildNavGroups(categories: Category[]) {
  const visible = categories
    .filter((category) => category.active && category.status === "published")
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const parentBySlug = new Map(visible.map((category) => [category.slug, category]));
  return sidebarCategoryHierarchy
    .map((group) => {
      const category = parentBySlug.get(group.parentSlug);
      if (!category) return null;

      return {
        category,
        children: group.childSlugs
          .map((slug) => parentBySlug.get(slug))
          .filter((child): child is Category => Boolean(child && child.parentCategorySlug === category.slug)),
      } satisfies NavGroup;
    })
    .filter((group): group is NavGroup => Boolean(group));
}

function buildDrawerItems(navGroups: NavGroup[], navigationItems: NavigationItem[]) {
  const utilityItems: DrawerLinkItem[] = navigationItems
    .filter((item) => item.visible)
    .sort((left, right) => left.order - right.order)
    .map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      children: item.children
        ?.filter((child) => child.visible)
        .sort((left, right) => left.order - right.order)
        .map((child) => ({
          id: child.id,
          label: child.label,
          href: child.href,
        })),
    }));

  const utilityLabels = new Set(utilityItems.map((item) => item.label.toLowerCase()));
  const categoryItems: DrawerLinkItem[] = navGroups
    .filter((group) => !utilityLabels.has(group.category.name.toLowerCase()))
    .map((group) => ({
      id: group.category.id,
      label: group.category.name,
      href: `/categories/${group.category.slug}`,
      children: group.children.length
        ? group.children
            .sort((left, right) => left.sortOrder - right.sortOrder)
            .map((child) => ({
              id: child.id,
              label: child.name,
              href: `/categories/${child.slug}`,
            }))
        : undefined,
    }));

  return {
    categoryItems,
    utilityItems,
  };
}

function HeaderIconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center border border-black/12 bg-white text-black hover:border-black/22"
      aria-label={label}
    >
      {children}
    </button>
  );
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
  const drawerItems = useMemo(
    () => buildDrawerItems(navGroups, settings.header.navigation),
    [navGroups, settings.header.navigation],
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
          "z-40 border-b border-black/10 bg-white/95 backdrop-blur-xl transition duration-200",
          scrolled ? "shadow-[0_8px_22px_rgba(15,18,24,0.04)]" : "shadow-none",
        )}
      >
        <div className="container-shell">
          <div className="relative flex min-h-16 items-center justify-between sm:min-h-[4.6rem]">
            <div className="flex min-w-[3.25rem] items-center justify-start">
              <NavigationDrawer
                brandName={settings.brand.name}
                brandTagline={settings.brand.tagline}
                logoSrc={settings.brand.logo || settings.brand.lightLogo}
                categoryItems={drawerItems.categoryItems}
                utilityItems={drawerItems.utilityItems}
              />
            </div>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Logo
                dark
                href="/"
                priority
                src={settings.brand.logo || settings.brand.lightLogo}
                alt={`${settings.brand.name} ${settings.brand.tagline}`}
                className="pointer-events-auto w-[88px] sm:w-[102px] lg:w-[108px]"
              />
            </div>

            <div className="ml-auto flex min-w-[4.75rem] items-center justify-end gap-1 sm:min-w-[5.25rem]">
              {settings.header.showSearch ? (
                <HeaderIconButton onClick={() => setSearchOpen(true)} label="Open search">
                  <Search className="h-4 w-4 stroke-[1.85]" />
                </HeaderIconButton>
              ) : null}
              {settings.header.showCart ? (
                <HeaderIconButton onClick={() => setCartOpen(true)} label="Open cart">
                  <ShoppingBag className="h-4 w-4 stroke-[1.85]" />
                </HeaderIconButton>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {settings.header.showSearch ? (
        <SearchDrawer open={searchOpen} onOpenChange={setSearchOpen} products={products} />
      ) : null}
      {settings.header.showCart ? (
        <CartDrawer open={cartOpen} onOpenChange={setCartOpen} products={products} />
      ) : null}
    </>
  );
}

function NavigationDrawer({
  brandName,
  brandTagline,
  logoSrc,
  categoryItems,
  utilityItems,
}: {
  brandName: string;
  brandTagline: string;
  logoSrc: string;
  categoryItems: DrawerLinkItem[];
  utilityItems: DrawerLinkItem[];
}) {
  const [open, setOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  function toggleGroup(slug: string) {
    setExpandedGroups((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) setExpandedGroups([]);
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center border border-black/12 bg-white text-black hover:border-black/22"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4 stroke-[1.85]" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/24 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(92vw,30rem)] max-w-[30rem] flex-col overflow-hidden border-r border-black/8 bg-white">
          <div className="flex min-h-full flex-col">
            <div className="flex items-start justify-between border-b border-black/8 px-5 py-4 sm:px-6 sm:py-5">
              <div className="pr-4">
                <Dialog.Title className="sr-only">{brandName} navigation</Dialog.Title>
                <Logo dark href="/" src={logoSrc} alt={`${brandName} ${brandTagline}`} className="w-[102px]" />
                <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-black/42">{brandTagline}</p>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center border border-black/12 bg-white text-black hover:border-black/22"
                  aria-label="Close navigation menu"
                >
                  <X className="h-4 w-4 stroke-[1.85]" />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
              <nav className="space-y-0" aria-label="Store categories">
                {categoryItems.map((item) => (
                  <DrawerNavItem
                    key={item.id}
                    item={item}
                    expanded={expandedGroups.includes(item.id)}
                    onToggle={() => toggleGroup(item.id)}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </nav>

              {utilityItems.length ? (
                <nav className="mt-6 border-t border-black/8 pt-4" aria-label="Store links">
                  {utilityItems.map((item) => (
                    <DrawerNavItem
                      key={item.id}
                      item={item}
                      expanded={expandedGroups.includes(item.id)}
                      onToggle={() => toggleGroup(item.id)}
                      onNavigate={() => setOpen(false)}
                    />
                  ))}
                </nav>
              ) : null}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DrawerNavItem({
  item,
  expanded,
  onToggle,
  onNavigate,
}: {
  item: DrawerLinkItem;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const hasChildren = Boolean(item.children?.length);

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="block border-b border-black/6 py-3 text-[15px] font-medium tracking-[0.01em] text-[#171717]"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="border-b border-black/6">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 py-3 text-left text-[15px] font-medium tracking-[0.01em] text-[#171717]"
        aria-expanded={expanded}
        aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`}
      >
        <span>{item.label}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-black/52 transition-transform duration-150", expanded ? "rotate-180" : "")} />
      </button>

      <div
        className={cn(
          "grid overflow-hidden pl-4 transition-[grid-template-rows,opacity] duration-150 ease-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden pb-3">
          <Link
            href={item.href}
            onClick={onNavigate}
            className="block py-2 text-sm text-black/74"
          >
            View all {item.label}
          </Link>
          {item.children?.map((child) => (
            <Link
              key={child.id}
              href={child.href}
              onClick={onNavigate}
              className="block py-2 text-sm text-black/74"
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
