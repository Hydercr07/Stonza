"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ChevronDown,
  ChevronRight,
  Gem,
  ImageIcon,
  Layers3,
  LayoutDashboard,
  Package2,
  ReceiptText,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { logoutAction } from "@/actions/admin";
import { canRole, type Permission } from "@/lib/permissions";
import type { AdminRole } from "@/types/domain";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";

type SearchItem = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  type: "product" | "order" | "customer" | "collection" | "page" | "category";
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: Permission;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard, permission: "dashboard:view" }],
  },
  {
    id: "store",
    label: "Store",
    items: [
      { href: "/admin/products", label: "Products", icon: Gem, permission: "products:write" },
      { href: "/admin/categories", label: "Categories", icon: Layers3, permission: "categories:write" },
      { href: "/admin/collections", label: "Collections", icon: ShoppingBag, permission: "collections:write" },
      { href: "/admin/inventory", label: "Inventory", icon: Package2, permission: "products:write" },
    ],
  },
  {
    id: "orders",
    label: "Orders",
    items: [{ href: "/admin/orders", label: "Orders", icon: ReceiptText, permission: "orders:write" }],
  },
  {
    id: "content",
    label: "Content",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: Sparkles, permission: "homepage:write" },
      { href: "/admin/navigation", label: "Navigation", icon: Layers3, permission: "settings:write" },
      { href: "/admin/pages", label: "Pages", icon: ShoppingBag, permission: "settings:write" },
      { href: "/admin/media", label: "Media", icon: ImageIcon, permission: "media:write" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings:write" },
      { href: "/admin/users", label: "Users & Permissions", icon: Users, permission: "dashboard:view" },
    ],
  },
];

const roleLabels: Record<AdminRole, string> = {
  owner: "Super Admin",
  administrator: "Super Admin",
  product_manager: "Catalog Manager",
  content_editor: "Content Manager",
  order_manager: "Order Manager",
  inventory_manager: "Catalog Manager",
};

const typeLabels: Record<SearchItem["type"], string> = {
  product: "Product",
  order: "Order",
  customer: "Customer",
  collection: "Collection",
  page: "Page",
  category: "Category",
};

function isItemActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminGlobalSearch({ items }: { items: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items.slice(0, 10);

    return items
      .filter((item) => [item.title, item.subtitle, typeLabels[item.type]].join(" ").toLowerCase().includes(normalized))
      .slice(0, 12);
  }, [items, query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-[#e7e0d6] bg-white px-4 py-3 text-left text-sm text-[#5c5348] shadow-sm hover:border-[#cdbda8]"
      >
        <Search className="h-4 w-4 text-[#8b7e70]" />
        <span className="flex-1">Search products, orders, collections, pages...</span>
        <span className="rounded-md border border-[#ebe2d5] px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-[#8b7e70]">
          /
        </span>
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[#17120b]/45 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-[10vh] z-50 w-[min(92vw,42rem)] -translate-x-1/2 overflow-hidden rounded-[1.75rem] border border-[#ddd2c3] bg-[#fcfaf6] shadow-[0_24px_90px_rgba(21,16,10,0.2)]">
            <div className="flex items-center gap-3 border-b border-[#ece4d8] px-5 py-4">
              <Search className="h-4 w-4 text-[#8b7e70]" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by product, SKU, order, customer, collection, or page"
                className="w-full bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#8b7e70]"
              />
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ebe2d5] text-[#5c5348]"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-3">
              {results.length ? (
                <div className="grid gap-2">
                  {results.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="rounded-2xl border border-transparent bg-white px-4 py-3 hover:border-[#ddd2c3] hover:bg-[#fffdfa]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-[#171717]">{item.title}</p>
                          {item.subtitle ? <p className="mt-1 text-sm text-[#6f6558]">{item.subtitle}</p> : null}
                        </div>
                        <span className="rounded-full bg-[#f3ede4] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#7c6b57]">
                          {typeLabels[item.type]}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#ddd2c3] bg-white px-5 py-10 text-center text-sm text-[#7c6b57]">
                  No results found.
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

export function AdminSidebar({
  role,
  searchItems,
}: {
  role: AdminRole;
  searchItems: SearchItem[];
}) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    store: true,
    orders: true,
    content: true,
    settings: true,
  });

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canRole(role, item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="border-r border-[#ece4d8] bg-[#f8f4ed] p-4 lg:p-5">
      <div className="sticky top-5 space-y-5">
        <div className="rounded-[1.75rem] border border-[#e7dfd1] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <Logo href="/admin" dark />
            <span className="rounded-full bg-[#f3eee7] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#7f6d59]">
              {roleLabels[role]}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#6b6257]">
            A calmer control room for catalog, content, and orders.
          </p>
          <div className="mt-4">
            <AdminGlobalSearch items={searchItems} />
          </div>
        </div>

        <nav className="space-y-3">
          {visibleGroups.map((group) => {
            const hasActiveItem = group.items.some((item) => isItemActive(pathname, item.href));
            return (
              <div key={group.id} className="rounded-[1.5rem] border border-[#ece4d8] bg-white p-2 shadow-sm">
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroups((current) => ({
                      ...current,
                      [group.id]: !current[group.id],
                    }))
                  }
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b7e70]">
                    {group.label}
                  </span>
                  {openGroups[group.id] || hasActiveItem ? (
                    <ChevronDown className="h-4 w-4 text-[#8b7e70]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#8b7e70]" />
                  )}
                </button>

                {openGroups[group.id] || hasActiveItem ? (
                  <div className="mt-1 grid gap-1">
                    {group.items.map((item) => {
                      const active = isItemActive(pathname, item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm",
                            active
                              ? "bg-[#161616] text-white shadow-[0_12px_32px_rgba(15,15,15,0.18)]"
                              : "text-[#5f564b] hover:bg-[#f6f1e8] hover:text-[#171717]",
                          )}
                        >
                          <Icon className={cn("h-4 w-4", active ? "text-[#f0c26b]" : "text-[#8b7e70]")} />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <form action={logoutAction}>
          <Button variant="outline" className="w-full border-[#d8cab7] bg-white">
            Logout
          </Button>
        </form>
      </div>
    </aside>
  );
}
