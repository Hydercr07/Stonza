import { NextResponse } from "next/server";
import { getStoreData, listAdminProducts, listOrders } from "@/lib/data/store";

// TEMPORARY diagnostic route -- not linked anywhere, will be removed
// immediately after use. Reproduces the admin (portal) layout's data
// construction server-side to surface the real stack trace behind the
// "Application error: a client-side exception has occurred" crash on
// /admin, without needing to authenticate.
export async function GET() {
  try {
    const store = await getStoreData();
    const summary: Record<string, unknown> = {
      ok: true,
      products: store.products?.length,
      orders: store.orders?.length,
      collections: store.collections?.length,
      categories: store.categories?.length,
      pages: store.pages?.length,
      journalPosts: store.journalPosts?.length,
    };

    try {
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
      summary.searchItemsBuilt = searchItems.length;
    } catch (e) {
      summary.searchItemsError = { message: (e as Error).message, stack: (e as Error).stack };
    }

    try {
      const [products, orders] = await Promise.all([listAdminProducts(), listOrders()]);
      const startOfToday = (() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      })();
      const todaysOrders = orders.filter((order) => new Date(order.createdAt).getTime() >= startOfToday);
      const todaysRevenue = todaysOrders.reduce((total, order) => total + order.total, 0);
      const pendingOrders = orders.filter((order) => ["pending", "confirmed", "processing"].includes(order.status));
      const lowStockProducts = products.filter((product) => product.inventoryQuantity <= product.lowStockThreshold).slice(0, 6);
      const uniqueCustomers = new Set(orders.map((order) => order.customer.email.toLowerCase())).size;
      summary.dashboardPageComputed = {
        products: products.length,
        orders: orders.length,
        todaysOrders: todaysOrders.length,
        todaysRevenue,
        pendingOrders: pendingOrders.length,
        lowStockProducts: lowStockProducts.length,
        uniqueCustomers,
        activityLogs: store.activityLogs?.length,
      };
    } catch (e) {
      summary.dashboardPageError = { message: (e as Error).message, stack: (e as Error).stack };
    }

    return NextResponse.json(summary);
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: (e as Error).message, stack: (e as Error).stack },
      { status: 500 },
    );
  }
}
