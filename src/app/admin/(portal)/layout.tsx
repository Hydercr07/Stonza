import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdminSession } from "@/lib/auth/session";
import { getStoreData } from "@/lib/data/store";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

export default async function AdminPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminSession("dashboard:view");
  const store = await getStoreData();
  const searchItems = [
    ...store.products
      .filter((product) => product.status !== "trash")
      .map((product) => ({
        id: `product-${product.id}`,
        title: product.name,
        subtitle: `${product.sku} · ${product.status.replaceAll("_", " ")}`,
        href: `/admin/products/${product.id}`,
        type: "product" as const,
      })),
    ...(store.orders ?? []).map((order) => ({
      id: `order-${order.id}`,
      title: order.orderNumber,
      subtitle: `${order.customer.fullName} · ${order.paymentMethod} · ${order.status}`,
      href: `/admin/orders/${order.orderNumber}`,
      type: "order" as const,
    })),
    ...(store.orders ?? []).map((order) => ({
      id: `customer-${order.id}`,
      title: order.customer.fullName,
      subtitle: `${order.customer.email} · ${order.orderNumber}`,
      href: `/admin/orders/${order.orderNumber}`,
      type: "customer" as const,
    })),
    ...store.collections.map((collection) => ({
      id: `collection-${collection.id}`,
      title: collection.name,
      subtitle: collection.slug,
      href: "/admin/collections",
      type: "collection" as const,
    })),
    ...store.categories
      .filter((category) => category.status !== "trash")
      .map((category) => ({
        id: `category-${category.id}`,
        title: category.name,
        subtitle: category.slug,
        href: `/admin/categories/${category.id}`,
        type: "category" as const,
      })),
    ...store.pages
      .filter((page) => page.status !== "trash")
      .map((page) => ({
        id: `page-${page.id}`,
        title: page.title,
        subtitle: `/${page.slug}`,
        href: "/admin/pages",
        type: "page" as const,
      })),
  ];

  return (
    <div className="grid min-h-screen bg-[#f3efe8] text-[#171717] lg:grid-cols-[320px_1fr]">
      <AdminSidebar role={session.role} searchItems={searchItems} />
      <main className="p-4 md:p-6 xl:p-8">{children}</main>
    </div>
  );
}
